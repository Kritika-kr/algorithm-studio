#pragma once

#include <string>
#include <vector>
#include "models/AnimationModels.h"

namespace studio {

struct GraphNodeInput { std::string id; };
struct GraphEdgeInput { std::string source; std::string target; int weight; };

class GraphAlgorithms {
 public:
  StepResponse run(const std::string& algorithm, const std::vector<GraphNodeInput>& nodes = {}, const std::vector<GraphEdgeInput>& edges = {}, bool directed = false) const;
};

}  // namespace studio
