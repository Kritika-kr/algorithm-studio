#include "services/algorithms/GraphAlgorithms.h"

#include <algorithm>
#include <functional>
#include <limits>
#include <queue>
#include <stack>
#include <unordered_map>
#include <unordered_set>

namespace studio {

using Edge = GraphEdgeInput;

StepResponse GraphAlgorithms::run(const std::string& algorithm, const std::vector<GraphNodeInput>& nodeInput, const std::vector<GraphEdgeInput>& edgeInput, bool directed) const {
  StepResponse response;
  std::vector<std::string> nodes;
  std::vector<GraphEdgeInput> edges;
  if (nodeInput.empty()) nodes = {"A", "B", "C", "D", "E", "F"};
  else for (const auto& node : nodeInput) nodes.push_back(node.id);
  if (edgeInput.empty() && nodeInput.empty()) edges = {{"A", "B", 4}, {"A", "D", 2}, {"B", "C", 5}, {"B", "E", 1}, {"D", "E", 3}, {"E", "F", 7}, {"C", "F", 2}};
  else edges = edgeInput;
  auto fail = [&](const std::string& message) { AnimationStep step; step.action = "failed"; step.line = 1; step.note = message; response.steps.push_back(std::move(step)); };
  std::unordered_set<std::string> uniqueNodes;
  for (const auto& node : nodes) if (node.empty() || !uniqueNodes.insert(node).second) { fail("Graph node IDs must be non-empty and unique."); break; }
  for (const auto& edge : edges) if (!uniqueNodes.contains(edge.source) || !uniqueNodes.contains(edge.target)) { fail("Every edge must connect existing nodes."); break; }
  if (algorithm == "dijkstra" && std::any_of(edges.begin(), edges.end(), [](const auto& edge) { return edge.weight < 0; })) fail("Dijkstra requires non-negative edge weights.");
  if ((algorithm == "prim" || algorithm == "kruskal") && directed) fail("Prim and Kruskal require an undirected graph.");
  if (algorithm == "topological-sort" && !directed) fail("Topological sort requires a directed graph.");
  if (!response.steps.empty()) { AnimationStep complete; complete.action = "complete"; complete.line = 6; complete.note = "Graph validation failed"; response.steps.push_back(std::move(complete)); return response; }
  using Neighbor = std::pair<std::string, int>;
  std::unordered_map<std::string, std::vector<Neighbor>> graph;
  for (const auto& node : nodes) graph[node] = {};
  for (const auto& edge : edges) {
    graph[edge.source].push_back({edge.target, edge.weight});
    if (!directed) graph[edge.target].push_back({edge.source, edge.weight});
  }

  auto visit = [&](const std::string& node, const std::string& note) {
    AnimationStep step;
    step.action = "visit"; step.node = node; step.line = 4; step.note = note;
    response.steps.push_back(std::move(step));
    response.stats.visitedNodes++;
    response.stats.traversalOrder.push_back(node);
  };
  auto edgeStep = [&](const std::string& from, const std::string& to, int cost, const std::string& note, const std::string& action = "edge") {
    AnimationStep step;
    step.action = action; step.edge = {from, to}; step.cost = cost; step.line = 5; step.note = note;
    response.steps.push_back(std::move(step));
    response.stats.edgesTraversed++;
  };

  if (algorithm == "bfs") {
    std::queue<std::string> pending;
    std::unordered_set<std::string> seen;
    for (const auto& root : nodes) { if (!seen.insert(root).second) continue; pending.push(root);
    while (!pending.empty()) {
      auto node = pending.front(); pending.pop();
      visit(node, "BFS visits " + node);
      for (const auto& [next, weight] : graph[node]) {
        edgeStep(node, next, weight, "Inspect " + node + "–" + next);
        if (seen.insert(next).second) pending.push(next);
      }
    }}
  } else if (algorithm == "dfs") {
    std::unordered_set<std::string> seen;
    std::function<void(const std::string&)> walk = [&](const std::string& node) {
      seen.insert(node); visit(node, "DFS visits " + node);
      for (const auto& [next, weight] : graph[node]) {
        edgeStep(node, next, weight, "Inspect " + node + "–" + next);
        if (!seen.contains(next)) walk(next);
      }
    };
    for (const auto& node : nodes) if (!seen.contains(node)) walk(node);
  } else if (algorithm == "dijkstra") {
    std::unordered_map<std::string, int> distance;
    for (const auto& node : nodes) distance[node] = std::numeric_limits<int>::max();
    if (!nodes.empty()) distance[nodes.front()] = 0;
    using Entry = std::pair<int, std::string>;
    std::priority_queue<Entry, std::vector<Entry>, std::greater<Entry>> pending;
    if (!nodes.empty()) pending.push({0, nodes.front()});
    while (!pending.empty()) {
      const auto [cost, node] = pending.top(); pending.pop();
      if (cost != distance[node]) continue;
      visit(node, "Settle " + node + " at distance " + std::to_string(cost));
      for (const auto& [next, weight] : graph[node]) {
        if (distance[node] > std::numeric_limits<int>::max() - weight) continue;
        const int candidate = distance[node] + weight;
        edgeStep(node, next, candidate, "Try distance " + std::to_string(candidate) + " to " + next, "relax");
        if (candidate < distance[next]) { distance[next] = candidate; pending.push({candidate, next}); }
      }
    }
  } else if (algorithm == "prim") {
    std::unordered_set<std::string> inTree;
    if (!nodes.empty()) { inTree.insert(nodes.front()); visit(nodes.front(), "Start the minimum spanning tree"); }
    while (inTree.size() < nodes.size()) {
      const Edge* best = nullptr;
      for (const auto& edge : edges) {
        if (inTree.contains(edge.source) == inTree.contains(edge.target)) continue;
        if (!best || edge.weight < best->weight) best = &edge;
      }
      if (!best) break;
      edgeStep(best->source, best->target, best->weight, "Add the lightest crossing edge", "relax");
      response.stats.totalCost += best->weight;
      const auto& next = inTree.contains(best->source) ? best->target : best->source;
      inTree.insert(next); visit(next, "Add " + next + " to the spanning tree");
    }
  } else if (algorithm == "kruskal") {
    std::unordered_map<std::string, std::string> parent;
    for (const auto& node : nodes) parent[node] = node;
    std::function<std::string(const std::string&)> find = [&](const std::string& node) {
      if (parent[node] != node) parent[node] = find(parent[node]);
      return parent[node];
    };
    auto sorted = edges;
    std::stable_sort(sorted.begin(), sorted.end(), [](const Edge& a, const Edge& b) { return a.weight < b.weight; });
    for (const auto& edge : sorted) {
      const auto a = find(edge.source); const auto b = find(edge.target);
      const bool accepted = a != b;
      edgeStep(edge.source, edge.target, edge.weight, accepted ? "Accept edge without creating a cycle" : "Reject edge because it creates a cycle");
      if (accepted) { parent[a] = b; response.stats.totalCost += edge.weight; }
    }
    for (const auto& node : nodes) visit(node, "Kruskal processed node " + node);
  } else if (algorithm == "topological-sort") {
    std::unordered_map<std::string, int> indegree;
    std::unordered_map<std::string, std::vector<std::string>> outgoing;
    for (const auto& node : nodes) indegree[node] = 0;
    for (const auto& edge : edges) { outgoing[edge.source].push_back(edge.target); indegree[edge.target]++; }
    std::queue<std::string> ready;
    for (const auto& node : nodes) if (indegree[node] == 0) ready.push(node);
    while (!ready.empty()) {
      const auto node = ready.front(); ready.pop(); visit(node, "Emit " + node + " in topological order");
      for (const auto& next : outgoing[node]) {
        edgeStep(node, next, 1, "Remove dependency " + node + " → " + next);
        if (--indegree[next] == 0) ready.push(next);
      }
    }
    if (response.stats.visitedNodes != static_cast<int>(nodes.size())) {
      AnimationStep failed; failed.action = "failed"; failed.line = 6; failed.note = "Directed graph contains a cycle";
      response.steps.push_back(std::move(failed));
    }
  } else {
    AnimationStep failed; failed.action = "failed"; failed.line = 1; failed.note = "Unsupported graph algorithm: " + algorithm;
    response.steps.push_back(std::move(failed));
  }

  AnimationStep complete; complete.action = "complete"; complete.line = 6; complete.note = "Graph algorithm complete";
  response.steps.push_back(std::move(complete));
  response.stats.executionTimeMs = static_cast<int>(response.steps.size());
  response.stats.memoryBytes = static_cast<int>((nodes.size() + edges.size()) * 64);
  return response;
}

}  // namespace studio
