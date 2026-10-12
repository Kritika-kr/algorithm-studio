#include "utils/JsonUtils.h"

namespace studio {

std::vector<int> readIntArray(const Json::Value& body, const std::string& key) {
  std::vector<int> values;
  if (!body.isMember(key) || !body[key].isArray()) return values;
  for (const auto& value : body[key]) {
    if (value.isInt()) values.push_back(value.asInt());
  }
  return values;
}

int readInt(const Json::Value& body, const std::string& key, int fallback) {
  return body.isMember(key) && body[key].isInt() ? body[key].asInt() : fallback;
}

Json::Value toJson(const StepResponse& response) {
  Json::Value root;
  Json::Value steps(Json::arrayValue);
  for (const auto& step : response.steps) {
    Json::Value item;
    item["action"] = step.action;
    if (step.index >= 0) item["index"] = step.index;
    if (step.i >= 0) item["i"] = step.i;
    if (step.j >= 0) item["j"] = step.j;
    item["value"] = step.value;
    Json::Value visited(Json::arrayValue);
    for (const auto value : step.visited) visited.append(value);
    item["visited"] = visited;
    item["found"] = step.found;
    if (!step.node.empty()) item["node"] = step.node;
    if (!step.edge.first.empty()) {
      Json::Value edge(Json::arrayValue);
      edge.append(step.edge.first);
      edge.append(step.edge.second);
      item["edge"] = edge;
    }
    item["cost"] = step.cost;
    item["line"] = step.line;
    item["note"] = step.note;
    if (step.pointerChange) {
      Json::Value pointer;
      pointer["field"] = step.pointerChange->field;
      if (step.pointerChange->from) pointer["from"] = *step.pointerChange->from; else pointer["from"] = Json::nullValue;
      if (step.pointerChange->to) pointer["to"] = *step.pointerChange->to; else pointer["to"] = Json::nullValue;
      item["pointerChange"] = pointer;
    }
    Json::Value snapshot(Json::arrayValue);
    for (const auto value : step.snapshot) snapshot.append(value);
    item["snapshot"] = snapshot;
    steps.append(item);
  }
  root["steps"] = steps;
  root["stats"]["comparisons"] = response.stats.comparisons;
  root["stats"]["swaps"] = response.stats.swaps;
  root["stats"]["recursionDepth"] = response.stats.recursionDepth;
  root["stats"]["visitedNodes"] = response.stats.visitedNodes;
  root["stats"]["edgesTraversed"] = response.stats.edgesTraversed;
  root["stats"]["totalCost"] = response.stats.totalCost;
  root["stats"]["height"] = response.stats.height;
  Json::Value traversalOrder(Json::arrayValue);
  for (const auto& node : response.stats.traversalOrder) traversalOrder.append(node);
  root["stats"]["traversalOrder"] = traversalOrder;
  root["stats"]["executionTimeMs"] = response.stats.executionTimeMs;
  root["stats"]["memoryBytes"] = response.stats.memoryBytes;
  return root;
}

}  // namespace studio
