#include "controllers/AlgorithmController.h"
#include "utils/JsonUtils.h"

#include <mutex>
#include <chrono>
#include <iomanip>
#include <sstream>
#include <map>
#include <set>

namespace studio {

namespace {

// C++ in-memory execution history storage
static std::vector<Json::Value> runHistory;
static std::mutex historyMutex;

std::string getTimestampString() {
  auto now = std::chrono::system_clock::now();
  auto in_time_t = std::chrono::system_clock::to_time_t(now);
  std::stringstream ss;
  // Use UTC or local system time formatting
  ss << std::put_time(std::localtime(&in_time_t), "%Y-%m-%d %H:%M:%S");
  return ss.str();
}

void logRun(const std::string& type, const std::string& algorithm, const Json::Value& requestBody, const StepResponse& response) {
  std::lock_guard<std::mutex> lock(historyMutex);
  Json::Value record;
  record["timestamp"] = getTimestampString();
  record["type"] = type;
  record["algorithm"] = algorithm;
  record["datasetType"] = requestBody.isMember("datasetType") ? requestBody["datasetType"].asString() : "random";
  
  if (requestBody.isMember("array") && requestBody["array"].isArray()) {
    record["arraySize"] = static_cast<int>(requestBody["array"].size());
  } else {
    record["arraySize"] = 0;
  }
  
  record["comparisons"] = response.stats.comparisons;
  record["swaps"] = response.stats.swaps;
  record["executionTimeMs"] = response.stats.executionTimeMs;
  record["memoryBytes"] = response.stats.memoryBytes;
  
  runHistory.push_back(record);
  // Cap the size of execution logs to avoid memory bloat
  if (runHistory.size() > 50) {
    runHistory.erase(runHistory.begin());
  }
}

drogon::HttpResponsePtr withCors(const Json::Value& body) {
  auto response = drogon::HttpResponse::newHttpJsonResponse(body);
  response->addHeader("Access-Control-Allow-Origin", "*");
  response->addHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response->addHeader("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

drogon::HttpResponsePtr optionsResponse() {
  auto response = drogon::HttpResponse::newHttpResponse();
  response->addHeader("Access-Control-Allow-Origin", "*");
  response->addHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response->addHeader("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

drogon::HttpResponsePtr unsupportedAlgorithm(const std::string& algorithm) {
  Json::Value body;
  body["error"] = "Unsupported algorithm";
  body["algorithm"] = algorithm;
  auto response = withCors(body);
  response->setStatusCode(drogon::k400BadRequest);
  return response;
}

Json::Value bodyOrEmpty(const drogon::HttpRequestPtr& request) {
  const auto json = request->getJsonObject();
  return json ? *json : Json::Value(Json::objectValue);
}

}  // namespace

void AlgorithmController::health(const drogon::HttpRequestPtr& request, std::function<void(const drogon::HttpResponsePtr&)>&& callback) const {
  if (request->method() == drogon::Options) {
    callback(optionsResponse());
    return;
  }
  Json::Value body;
  body["status"] = "ok";
  body["service"] = "algorithm-studio";
  callback(withCors(body));
}

void AlgorithmController::sorting(const drogon::HttpRequestPtr& request, std::function<void(const drogon::HttpResponsePtr&)>&& callback, std::string algorithm) const {
  if (request->method() == drogon::Options) {
    callback(optionsResponse());
    return;
  }
  static const std::set<std::string> supported = {"bubble-sort", "selection-sort", "insertion-sort", "merge-sort", "quick-sort", "heap-sort", "shell-sort", "cocktail-sort", "counting-sort"};
  if (!supported.contains(algorithm)) { callback(unsupportedAlgorithm(algorithm)); return; }
  const auto body = bodyOrEmpty(request);
  auto values = readIntArray(body, "array");
  if (values.empty()) values = {42, 17, 83, 9, 31, 64, 25, 58};
  
  auto res = service_.sorting(algorithm, values);
  logRun("sorting", algorithm, body, res);
  
  callback(withCors(toJson(res)));
}

void AlgorithmController::searching(const drogon::HttpRequestPtr& request, std::function<void(const drogon::HttpResponsePtr&)>&& callback, std::string algorithm) const {
  if (request->method() == drogon::Options) {
    callback(optionsResponse());
    return;
  }
  static const std::set<std::string> supported = {"linear-search", "binary-search", "jump-search", "interpolation-search", "exponential-search", "ternary-search"};
  if (!supported.contains(algorithm)) { callback(unsupportedAlgorithm(algorithm)); return; }
  const auto body = bodyOrEmpty(request);
  auto values = readIntArray(body, "array");
  if (values.empty()) values = {12, 19, 24, 31, 42, 55, 71, 88};
  
  auto res = service_.searching(algorithm, values, readInt(body, "target", 42));
  logRun("searching", algorithm, body, res);
  
  callback(withCors(toJson(res)));
}

void AlgorithmController::structures(const drogon::HttpRequestPtr& request, std::function<void(const drogon::HttpResponsePtr&)>&& callback, std::string algorithm) const {
  if (request->method() == drogon::Options) {
    callback(optionsResponse());
    return;
  }
  const auto body = bodyOrEmpty(request);
  const std::string path = request->path();
  const std::string prefix = "/api/algorithms/";
  const auto begin = path.find(prefix);
  const auto categoryStart = begin == std::string::npos ? std::string::npos : begin + prefix.size();
  const auto categoryEnd = categoryStart == std::string::npos ? std::string::npos : path.find('/', categoryStart);
  const std::string category = categoryEnd == std::string::npos ? "" : path.substr(categoryStart, categoryEnd - categoryStart);
  static const std::set<std::string> supported = {"linked-list", "stack", "queue", "trees", "dynamic-programming"};
  if (!supported.contains(category)) { callback(unsupportedAlgorithm(category)); return; }
  auto values = readIntArray(body, "array");
  const std::string operation = body.isMember("operation") && body["operation"].isString() ? body["operation"].asString() : algorithm;
  auto res = service_.structures(category, operation, values, readInt(body, "target", 42));
  logRun(category, operation, body, res);
  
  callback(withCors(toJson(res)));
}

void AlgorithmController::graphs(const drogon::HttpRequestPtr& request, std::function<void(const drogon::HttpResponsePtr&)>&& callback, std::string algorithm) const {
  if (request->method() == drogon::Options) {
    callback(optionsResponse());
    return;
  }
  static const std::set<std::string> supported = {"bfs", "dfs", "dijkstra", "prim", "kruskal", "topological-sort"};
  if (!supported.contains(algorithm)) { callback(unsupportedAlgorithm(algorithm)); return; }
  auto res = service_.graphs(algorithm);
  logRun("graphs", algorithm, Json::Value(Json::objectValue), res);
  
  callback(withCors(toJson(res)));
}

void AlgorithmController::analytics(const drogon::HttpRequestPtr& request, std::function<void(const drogon::HttpResponsePtr&)>&& callback) const {
  if (request->method() == drogon::Options) {
    callback(optionsResponse());
    return;
  }
  
  std::lock_guard<std::mutex> lock(historyMutex);
  Json::Value root;
  
  // Convert list to JSON Array in reverse chronological order
  Json::Value history(Json::arrayValue);
  for (auto it = runHistory.rbegin(); it != runHistory.rend(); ++it) {
    history.append(*it);
  }
  root["history"] = history;
  
  // Calculate summary metrics
  std::map<std::string, int> usageCount;
  std::map<std::string, double> totalRuntime;
  std::map<std::string, int> minRuntime;
  
  for (const auto& record : runHistory) {
    std::string algo = record["algorithm"].asString();
    usageCount[algo]++;
    int time = record["executionTimeMs"].asInt();
    totalRuntime[algo] += time;
    if (minRuntime.find(algo) == minRuntime.end() || time < minRuntime[algo]) {
      minRuntime[algo] = time;
    }
  }
  
  Json::Value summary(Json::objectValue);
  for (const auto& pair : usageCount) {
    std::string algo = pair.first;
    Json::Value algoStats;
    algoStats["count"] = pair.second;
    algoStats["avgRuntimeMs"] = totalRuntime[algo] / pair.second;
    algoStats["fastestMs"] = minRuntime[algo];
    summary[algo] = algoStats;
  }
  root["summary"] = summary;
  
  callback(withCors(root));
}

}  // namespace studio
