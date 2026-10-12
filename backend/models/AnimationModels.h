#pragma once

#include <string>
#include <optional>
#include <utility>
#include <vector>

namespace studio {

struct AnimationStep {
  std::string action;
  int index = -1;
  int i = -1;
  int j = -1;
  int value = 0;
  std::vector<int> visited;
  bool found = false;
  std::string node;
  std::pair<std::string, std::string> edge;
  int cost = 0;
  int line = 1;
  std::string note;
  std::vector<int> snapshot;
  struct PointerChange {
    std::string field;
    std::optional<int> from;
    std::optional<int> to;
  };
  std::optional<PointerChange> pointerChange;
};

struct AlgorithmStats {
  int comparisons = 0;
  int swaps = 0;
  int recursionDepth = 0;
  int visitedNodes = 0;
  int edgesTraversed = 0;
  int totalCost = 0;
  int height = 0;
  std::vector<std::string> traversalOrder;
  int executionTimeMs = 0;
  int memoryBytes = 0;
};

struct StepResponse {
  std::vector<AnimationStep> steps;
  AlgorithmStats stats;
};

}  // namespace studio
