#pragma once

#include <string>
#include <vector>
#include "services/algorithms/GraphAlgorithms.h"
#include "services/algorithms/SearchingAlgorithms.h"
#include "services/algorithms/SortingAlgorithms.h"
#include "services/algorithms/StructureAlgorithms.h"
#include "models/AnimationModels.h"

namespace studio {

class AlgorithmService {
 public:
  StepResponse sorting(const std::string& algorithm, const std::vector<int>& values) const;
  StepResponse searching(const std::string& algorithm, const std::vector<int>& values, int target) const;
  StepResponse structures(const std::string& category, const std::string& operation, const std::vector<int>& values, int target) const;
  StepResponse graphs(const std::string& algorithm) const;

 private:
  SortingAlgorithms sortingAlgorithms_;
  SearchingAlgorithms searchingAlgorithms_;
  StructureAlgorithms structureAlgorithms_;
  GraphAlgorithms graphAlgorithms_;
};

}  // namespace studio
