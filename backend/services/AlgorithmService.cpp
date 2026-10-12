#include "services/AlgorithmService.h"

namespace studio {

StepResponse AlgorithmService::sorting(const std::string& algorithm, const std::vector<int>& values) const {
  return sortingAlgorithms_.run(algorithm, values);
}

StepResponse AlgorithmService::searching(const std::string& algorithm, const std::vector<int>& values, int target) const {
  return searchingAlgorithms_.run(algorithm, values, target);
}

StepResponse AlgorithmService::structures(const std::string& category, const std::string& operation, const std::vector<int>& values, int target) const {
  return structureAlgorithms_.run(category, operation, values, target);
}

StepResponse AlgorithmService::graphs(const std::string& algorithm, const std::vector<GraphNodeInput>& nodes, const std::vector<GraphEdgeInput>& edges, bool directed) const {
  return graphAlgorithms_.run(algorithm, nodes, edges, directed);
}

}  // namespace studio
