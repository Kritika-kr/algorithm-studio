#pragma once

#include <string>
#include <vector>
#include "models/AnimationModels.h"

namespace studio {

class StructureAlgorithms {
 public:
  StepResponse run(const std::string& category, const std::string& operation, std::vector<int> values, int target) const;
};

}  // namespace studio
