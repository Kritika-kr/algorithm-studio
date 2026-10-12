#include "services/algorithms/GraphAlgorithms.h"

#include <algorithm>
#include <functional>
#include <limits>
#include <queue>
#include <stack>
#include <unordered_map>
#include <unordered_set>

namespace studio {

StepResponse GraphAlgorithms::run(const std::string& algorithm) const {
  StepResponse response;
  const std::vector<std::string> nodes = {"A", "B", "C", "D", "E", "F"};
  struct Edge { std::string from; std::string to; int weight; };
  const std::vector<Edge> edges = {
      {"A", "B", 4}, {"A", "D", 2}, {"B", "C", 5}, {"B", "E", 1},
      {"D", "E", 3}, {"E", "F", 7}, {"C", "F", 2}};
  using Neighbor = std::pair<std::string, int>;
  std::unordered_map<std::string, std::vector<Neighbor>> graph;
  for (const auto& node : nodes) graph[node] = {};
  for (const auto& edge : edges) {
    graph[edge.from].push_back({edge.to, edge.weight});
    graph[edge.to].push_back({edge.from, edge.weight});
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
    std::unordered_set<std::string> seen{"A"};
    pending.push("A");
    while (!pending.empty()) {
      auto node = pending.front(); pending.pop();
      visit(node, "BFS visits " + node);
      for (const auto& [next, weight] : graph[node]) {
        edgeStep(node, next, weight, "Inspect " + node + "–" + next);
        if (seen.insert(next).second) pending.push(next);
      }
    }
  } else if (algorithm == "dfs") {
    std::unordered_set<std::string> seen;
    std::function<void(const std::string&)> walk = [&](const std::string& node) {
      seen.insert(node); visit(node, "DFS visits " + node);
      for (const auto& [next, weight] : graph[node]) {
        edgeStep(node, next, weight, "Inspect " + node + "–" + next);
        if (!seen.contains(next)) walk(next);
      }
    };
    walk("A");
  } else if (algorithm == "dijkstra") {
    std::unordered_map<std::string, int> distance;
    for (const auto& node : nodes) distance[node] = std::numeric_limits<int>::max();
    distance["A"] = 0;
    using Entry = std::pair<int, std::string>;
    std::priority_queue<Entry, std::vector<Entry>, std::greater<Entry>> pending;
    pending.push({0, "A"});
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
    std::unordered_set<std::string> inTree{"A"};
    visit("A", "Start the minimum spanning tree at A");
    while (inTree.size() < nodes.size()) {
      const Edge* best = nullptr;
      for (const auto& edge : edges) {
        if (inTree.contains(edge.from) == inTree.contains(edge.to)) continue;
        if (!best || edge.weight < best->weight) best = &edge;
      }
      if (!best) break;
      edgeStep(best->from, best->to, best->weight, "Add the lightest crossing edge", "relax");
      response.stats.totalCost += best->weight;
      const auto& next = inTree.contains(best->from) ? best->to : best->from;
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
      const auto a = find(edge.from); const auto b = find(edge.to);
      const bool accepted = a != b;
      edgeStep(edge.from, edge.to, edge.weight, accepted ? "Accept edge without creating a cycle" : "Reject edge because it creates a cycle");
      if (accepted) { parent[a] = b; response.stats.totalCost += edge.weight; }
    }
    for (const auto& node : nodes) visit(node, "Kruskal processed node " + node);
  } else if (algorithm == "topological-sort") {
    const std::vector<Edge> directed = {
        {"A", "B", 1}, {"A", "D", 1}, {"B", "C", 1}, {"B", "E", 1},
        {"D", "E", 1}, {"E", "F", 1}, {"C", "F", 1}};
    std::unordered_map<std::string, int> indegree;
    std::unordered_map<std::string, std::vector<std::string>> outgoing;
    for (const auto& node : nodes) indegree[node] = 0;
    for (const auto& edge : directed) { outgoing[edge.from].push_back(edge.to); indegree[edge.to]++; }
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
