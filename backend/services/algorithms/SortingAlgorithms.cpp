#include "services/algorithms/SortingAlgorithms.h"

#include <algorithm>
#include <functional>
#include <limits>
#include <map>

namespace studio {

StepResponse SortingAlgorithms::run(const std::string& algorithm, std::vector<int> values) const {
  StepResponse response;
  auto emit = [&](std::string action, int i, int j, int line, std::string note) {
    AnimationStep step;
    step.action = std::move(action);
    step.index = i;
    step.i = i;
    step.j = j;
    step.value = i >= 0 ? values[i] : 0;
    step.line = line;
    step.note = std::move(note);
    step.snapshot = values;
    response.steps.push_back(std::move(step));
  };
  auto compare = [&](int i, int j) {
    response.stats.comparisons++;
    emit("compare", i, j, 3, "Compare two values");
  };
  auto swapValues = [&](int i, int j) {
    std::swap(values[i], values[j]);
    response.stats.swaps++;
    emit("swap", i, j, 4, "Swap two values");
  };

  if (algorithm == "selection-sort") {
    for (int i = 0; i < static_cast<int>(values.size()); ++i) {
      int minIndex = i;
      for (int j = i + 1; j < static_cast<int>(values.size()); ++j) {
        compare(minIndex, j);
        if (values[j] < values[minIndex]) minIndex = j;
      }
      if (minIndex != i) swapValues(i, minIndex);
      emit("mark-sorted", i, -1, 7, "Position is sorted");
    }
  } else if (algorithm == "insertion-sort") {
    for (int i = 1; i < static_cast<int>(values.size()); ++i) {
      int j = i;
      while (j > 0) {
        compare(j - 1, j);
        if (values[j - 1] <= values[j]) break;
        swapValues(j - 1, j);
        --j;
      }
    }
  } else if (algorithm == "merge-sort") {
    std::function<void(int, int, int)> sort = [&](int left, int right, int depth) {
      response.stats.recursionDepth = std::max(response.stats.recursionDepth, depth);
      if (left >= right) return;
      int mid = left + (right - left) / 2;
      sort(left, mid, depth + 1);
      sort(mid + 1, right, depth + 1);
      std::vector<int> merged;
      int i = left;
      int j = mid + 1;
      while (i <= mid && j <= right) {
        compare(i, j);
        merged.push_back(values[i] <= values[j] ? values[i++] : values[j++]);
      }
      while (i <= mid) merged.push_back(values[i++]);
      while (j <= right) merged.push_back(values[j++]);
      for (int offset = 0; offset < static_cast<int>(merged.size()); ++offset) {
        values[left + offset] = merged[offset];
        emit("overwrite", left + offset, -1, 4, "Write merged value");
      }
    };
    sort(0, static_cast<int>(values.size()) - 1, 1);
  } else if (algorithm == "quick-sort") {
    std::function<void(int, int, int)> sort = [&](int low, int high, int depth) {
      response.stats.recursionDepth = std::max(response.stats.recursionDepth, depth);
      if (low >= high) return;
      emit("pivot", high, -1, 1, "Choose pivot");
      int pivot = values[high];
      int i = low;
      for (int j = low; j < high; ++j) {
        compare(j, high);
        if (values[j] < pivot) swapValues(i++, j);
      }
      swapValues(i, high);
      sort(low, i - 1, depth + 1);
      sort(i + 1, high, depth + 1);
    };
    sort(0, static_cast<int>(values.size()) - 1, 1);
  } else if (algorithm == "heap-sort") {
    std::function<void(int, int)> heapify = [&](int size, int root) {
      int largest = root;
      int left = root * 2 + 1;
      int right = root * 2 + 2;
      if (left < size) {
        compare(largest, left);
        if (values[left] > values[largest]) largest = left;
      }
      if (right < size) {
        compare(largest, right);
        if (values[right] > values[largest]) largest = right;
      }
      if (largest != root) {
        swapValues(root, largest);
        heapify(size, largest);
      }
    };
    for (int i = static_cast<int>(values.size()) / 2 - 1; i >= 0; --i) heapify(static_cast<int>(values.size()), i);
    for (int end = static_cast<int>(values.size()) - 1; end > 0; --end) {
      swapValues(0, end);
      emit("mark-sorted", end, -1, 7, "Extract max");
      heapify(end, 0);
    }
  } else if (algorithm == "shell-sort") {
    for (int gap = static_cast<int>(values.size()) / 2; gap > 0; gap /= 2) {
      for (int i = gap; i < static_cast<int>(values.size()); ++i) {
        const int value = values[i];
        int j = i;
        while (j >= gap) {
          compare(j - gap, j);
          if (values[j - gap] <= value) break;
          values[j] = values[j - gap];
          emit("overwrite", j, -1, 4, "Shift value by the current gap");
          j -= gap;
        }
        values[j] = value;
        emit("overwrite", j, -1, 4, "Insert value in its gapped position");
      }
    }
  } else if (algorithm == "cocktail-sort") {
    int start = 0;
    int end = static_cast<int>(values.size()) - 1;
    bool changed = true;
    while (start < end && changed) {
      changed = false;
      for (int i = start; i < end; ++i) {
        compare(i, i + 1);
        if (values[i] > values[i + 1]) { swapValues(i, i + 1); changed = true; }
      }
      --end;
      for (int i = end; i > start; --i) {
        compare(i - 1, i);
        if (values[i - 1] > values[i]) { swapValues(i - 1, i); changed = true; }
      }
      ++start;
    }
  } else if (algorithm == "counting-sort") {
    if (!values.empty()) {
      const auto bounds = std::minmax_element(values.begin(), values.end());
      const int minimum = *bounds.first;
      const int maximum = *bounds.second;
      const long long range = static_cast<long long>(maximum) - minimum + 1;
      // Bound auxiliary memory for untrusted inputs; sparse counting handles large ranges.
      if (range <= 1'000'000) {
        std::vector<int> counts(static_cast<std::size_t>(range), 0);
        for (int i = 0; i < static_cast<int>(values.size()); ++i) {
          ++counts[static_cast<std::size_t>(static_cast<long long>(values[i]) - minimum)];
          ++response.stats.comparisons;
          emit("visit", i, -1, 2, "Count value frequency");
        }
        int out = 0;
        for (std::size_t offset = 0; offset < counts.size(); ++offset) {
          while (counts[offset] > 0) {
            --counts[offset];
            values[out] = static_cast<int>(static_cast<long long>(minimum) + offset);
            emit("overwrite", out, -1, 5, "Write values in sorted order");
            ++out;
          }
        }
      } else {
        std::map<int, int> counts;
        for (int i = 0; i < static_cast<int>(values.size()); ++i) { ++counts[values[i]]; emit("visit", i, -1, 2, "Count value frequency"); }
        int out = 0;
        for (const auto& [value, count] : counts) for (int n = 0; n < count; ++n) {
          values[out] = value;
          emit("overwrite", out++, -1, 5, "Write values in sorted order");
        }
      }
    }
  } else {
    for (int i = 0; i < static_cast<int>(values.size()); ++i) {
      for (int j = 0; j + 1 < static_cast<int>(values.size()) - i; ++j) {
        compare(j, j + 1);
        if (values[j] > values[j + 1]) swapValues(j, j + 1);
      }
      emit("mark-sorted", static_cast<int>(values.size()) - i - 1, -1, 7, "Tail value is sorted");
    }
  }

  emit("complete", -1, -1, 7, "Sorting complete");
  response.stats.executionTimeMs = static_cast<int>(response.steps.size());
  response.stats.memoryBytes = static_cast<int>(values.size() * sizeof(int) + response.steps.size() * 64);
  return response;
}

}  // namespace studio
