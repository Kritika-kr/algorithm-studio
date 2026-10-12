#include "services/algorithms/SearchingAlgorithms.h"

#include <algorithm>
#include <cmath>
#include <limits>

namespace studio {

StepResponse SearchingAlgorithms::run(const std::string& algorithm, std::vector<int> values, int target) const {
  StepResponse response;
  if (values.empty()) values = {12, 19, 24, 31, 42, 55, 71, 88};
  if (algorithm != "linear-search") std::sort(values.begin(), values.end());
  std::vector<int> visited;
  bool found = false;

  auto emit = [&](std::string action, int index, int line, std::string note) {
    AnimationStep step;
    step.found = action == "found";
    step.action = std::move(action);
    step.index = index;
    step.i = index;
    step.value = index >= 0 ? values[index] : 0;
    step.visited = visited;
    step.line = line;
    step.note = std::move(note);
    step.snapshot = values;
    response.steps.push_back(std::move(step));
  };

  auto probe = [&](int index, std::string note) {
    response.stats.comparisons++;
    visited.push_back(index);
    emit("compare", index, 3, std::move(note));
    emit(values[index] == target ? "found" : "highlight", index, values[index] == target ? 4 : 5, values[index] == target ? "Target found" : "Mark index as visited");
    if (values[index] == target) found = true;
  };

  if (algorithm == "binary-search") {
    int left = 0;
    int right = static_cast<int>(values.size()) - 1;
    while (left <= right) {
      int mid = left + (right - left) / 2;
      probe(mid, "Probe midpoint");
      if (found) break;
      if (values[mid] < target) left = mid + 1;
      else right = mid - 1;
    }
  } else if (algorithm == "jump-search") {
    int jump = std::max(1, static_cast<int>(std::sqrt(values.size())));
    int prev = 0;
    int next = jump;
    while (prev < static_cast<int>(values.size()) && values[std::min(next, static_cast<int>(values.size())) - 1] < target) {
      probe(std::min(next, static_cast<int>(values.size())) - 1, "Jump to next block");
      prev = next;
      next += jump;
    }
    for (int i = prev; i < std::min(next, static_cast<int>(values.size())); ++i) {
      probe(i, "Linear scan inside block");
      if (found) break;
    }
  } else if (algorithm == "interpolation-search") {
    int low = 0;
    int high = static_cast<int>(values.size()) - 1;
    while (low <= high && target >= values[low] && target <= values[high]) {
      const long long numerator = static_cast<long long>(target - static_cast<long long>(values[low])) * (high - low);
      int pos = values[high] == values[low]
                    ? low
                    : low + static_cast<int>(numerator / (static_cast<long long>(values[high]) - values[low]));
      probe(pos, "Interpolated probe");
      if (found) break;
      if (values[pos] < target) low = pos + 1;
      else high = pos - 1;
    }
  } else if (algorithm == "exponential-search") {
    if (values.front() == target) {
      probe(0, "Check first element");
    } else {
      int bound = 1;
      while (bound < static_cast<int>(values.size()) && values[bound] < target) {
        probe(bound, "Expand search range");
        if (found) break;
        if (bound > std::numeric_limits<int>::max() / 2) break;
        bound *= 2;
      }
      if (!found) {
        int left = bound / 2;
        int right = std::min(bound, static_cast<int>(values.size()) - 1);
        while (left <= right && !found) {
          int mid = left + (right - left) / 2;
          probe(mid, "Binary search inside the expanded range");
          if (found) break;
          if (values[mid] < target) left = mid + 1;
          else right = mid - 1;
        }
      }
    }
  } else if (algorithm == "ternary-search") {
    int left = 0;
    int right = static_cast<int>(values.size()) - 1;
    while (left <= right && !found) {
      const int third = (right - left) / 3;
      const int first = left + third;
      const int second = right - third;
      probe(first, "Probe first third");
      if (found) break;
      if (second != first) {
        probe(second, "Probe second third");
        if (found) break;
      }
      if (target < values[first]) right = first - 1;
      else if (target > values[second]) left = second + 1;
      else { left = first + 1; right = second - 1; }
    }
  } else {
    for (int i = 0; i < static_cast<int>(values.size()); ++i) {
      probe(i, "Linear comparison");
      if (found) break;
    }
  }

  if (!found) emit("failed", visited.empty() ? -1 : visited.back(), 7, "Target was not found");
  emit("complete", -1, 7, "Search complete");
  response.stats.executionTimeMs = static_cast<int>(response.steps.size());
  response.stats.memoryBytes = static_cast<int>(values.size() * sizeof(int) + response.steps.size() * 48);
  response.stats.visitedNodes = static_cast<int>(visited.size());
  return response;
}

}  // namespace studio
