#include "services/algorithms/StructureAlgorithms.h"

#include <algorithm>
#include <functional>
#include <memory>
#include <queue>
#include <cctype>

namespace studio {

StepResponse StructureAlgorithms::run(const std::string& category, const std::string& operation, std::vector<int> values, int target) const {
  StepResponse response;
  if (values.empty()) {
    if (category == "stack") values = {18, 31, 44};
    else if (category == "queue") values = {7, 14, 21};
    else if (category != "linked-list") values = {12, 24, 36, 48};
  }
  std::string command = operation;
  const auto suffix = command.find_last_of('-');
  if (suffix != std::string::npos && suffix + 1 < command.size() &&
      std::all_of(command.begin() + static_cast<std::ptrdiff_t>(suffix + 1), command.end(), [](unsigned char c) { return std::isdigit(c); })) {
    command.erase(suffix);
  }
  if (command.empty() || command == category) command = category == "dynamic-programming" ? "fibonacci" : "traverse";
  auto emit = [&](const std::string& action, int index, const std::string& note) {
    AnimationStep step;
    step.action = action; step.index = index; step.i = index;
    if (index >= 0 && index < static_cast<int>(values.size())) step.value = values[index];
    step.line = static_cast<int>(response.steps.size()) + 1;
    step.note = note; step.snapshot = values;
    if (index >= 0 && index < static_cast<int>(values.size())) response.stats.traversalOrder.push_back(std::to_string(values[index]));
    response.steps.push_back(std::move(step));
  };
  auto emitPointer = [&](const std::string& note, int index, const std::string& field, std::optional<int> from, std::optional<int> to) {
    AnimationStep step; step.action = "pointer"; step.index = index; step.i = index; step.note = note; step.line = static_cast<int>(response.steps.size()) + 1; step.snapshot = values;
    if (index >= 0 && index < static_cast<int>(values.size())) step.value = values[index];
    step.pointerChange = AnimationStep::PointerChange{field, from, to}; response.steps.push_back(std::move(step));
  };

  if (category == "linked-list") {
    if (command == "insert-head" || command == "insert-tail") {
      const bool head = command == "insert-head";
      const int oldSize = static_cast<int>(values.size());
      if (head) values.insert(values.begin(), target); else values.push_back(target);
      if (head) {
        emitPointer("Insert " + std::to_string(target) + " at head: new node points to " + (oldSize ? "old head " + std::to_string(values[1]) : "null"), 0, "next", 0, oldSize ? std::optional<int>(1) : std::nullopt);
        emitPointer("Insert " + std::to_string(target) + " at head: head now points to the new node", 0, "head", oldSize ? std::optional<int>(1) : std::nullopt, 0);
      } else {
        emitPointer("Insert " + std::to_string(target) + " at tail: old tail points to the new node", oldSize - 1, "next", oldSize ? std::optional<int>(oldSize - 1) : std::nullopt, oldSize);
        emitPointer("Insert " + std::to_string(target) + " at tail: tail now points to the new node", oldSize, "tail", oldSize ? std::optional<int>(oldSize - 1) : std::nullopt, oldSize);
      }
      emit("insert", head ? 0 : static_cast<int>(values.size()) - 1, "Insert " + std::to_string(target) + " at " + (head ? "head" : "tail") + ": list now contains " + std::to_string(values.size()) + " nodes");
    } else if (command == "search") {
      bool found = false;
      for (int index = 0; index < static_cast<int>(values.size()) && !found; ++index) {
        emit("visit", index, "Search: visiting node " + std::to_string(values[index]));
        if (values[index] == target) { found = true; emit("found", index, "Search: found " + std::to_string(target) + " at node " + std::to_string(index + 1)); }
      }
      if (!found) emit("failed", -1, "Search: " + std::to_string(target) + (values.empty() ? " is not in the empty list" : " is not in the list"));
    } else if (command == "delete-head") {
      if (values.empty()) emit("failed", -1, "Delete head: list is empty; there is no node to remove.");
      else {
        const int removed = values.front(); emit("visit", 0, "Delete head: active node is " + std::to_string(removed));
        AnimationStep step; step.action = "pointer"; step.index = 0; step.i = 0; step.note = "Delete head: head moves from " + std::to_string(removed) + " to " + (values.size() > 1 ? std::to_string(values[1]) : "null"); step.line = static_cast<int>(response.steps.size()) + 1; step.snapshot = values; step.pointerChange = AnimationStep::PointerChange{"head", 0, values.size() > 1 ? std::optional<int>(1) : std::nullopt}; response.steps.push_back(std::move(step));
        values.erase(values.begin());
        if (values.empty()) emitPointer("Delete head: tail now points to null", -1, "tail", 0, std::nullopt);
        emit("delete", values.empty() ? -1 : 0, "Delete head: removed " + std::to_string(removed));
      }
    } else if (command == "delete-tail") {
      if (values.empty()) emit("failed", -1, "Delete tail: list is empty; there is no node to remove.");
      else {
        for (int index = 0; index < static_cast<int>(values.size()) - 1; ++index) emit("visit", index, "Delete tail: traversing node " + std::to_string(values[index]));
        const int removed = values.back();
        if (values.size() > 1) emitPointer("Delete tail: next pointer of " + std::to_string(values[values.size() - 2]) + " changes from " + std::to_string(removed) + " to null", static_cast<int>(values.size()) - 2, "next", static_cast<int>(values.size()) - 2, std::nullopt);
        values.pop_back();
        emitPointer("Delete tail: tail moves from " + std::to_string(removed) + " to " + (values.empty() ? "null" : std::to_string(values.back())), static_cast<int>(values.size()) - 1, "tail", static_cast<int>(values.size()), values.empty() ? std::nullopt : std::optional<int>(static_cast<int>(values.size()) - 1));
        emit("delete", values.empty() ? -1 : static_cast<int>(values.size()) - 1, "Delete tail: removed " + std::to_string(removed));
      }
    } else if (command == "reverse") {
      if (values.empty()) emit("failed", -1, "Reverse: list is empty; there are no next pointers to flip.");
      else {
        for (int index = 0; index < static_cast<int>(values.size()); ++index) {
          emitPointer("Reverse: flipping next pointer of node " + std::to_string(values[index]) + (index ? " to node " + std::to_string(values[index - 1]) : " to null"), index, "next", index, index ? std::optional<int>(index - 1) : std::nullopt);
        }
        const int oldTail = static_cast<int>(values.size()) - 1;
        emitPointer("Reverse: head moves from " + std::to_string(values.front()) + " to " + std::to_string(values.back()), oldTail, "head", 0, oldTail);
        std::reverse(values.begin(), values.end()); emit("reverse", 0, "Reverse: list links now point in reverse order");
      }
    } else {
      for (int index = 0; index < static_cast<int>(values.size()); ++index) emit("visit", index, "Traverse: visiting node " + std::to_string(values[index]));
      if (values.empty()) emit("failed", -1, "Traverse: list is empty. Insert a node to begin.");
    }
    AnimationStep complete; complete.action = "complete"; complete.line = 6; complete.note = "Linked list operation complete"; complete.snapshot = values; response.steps.push_back(std::move(complete));
    response.stats.visitedNodes = static_cast<int>(std::count_if(response.steps.begin(), response.steps.end(), [](const AnimationStep& step) { return step.action == "visit" || step.action == "found"; }));
    response.stats.executionTimeMs = static_cast<int>(response.steps.size()); response.stats.memoryBytes = static_cast<int>(values.size() * sizeof(int) + response.steps.size() * 48);
    return response;
  }

  if (category == "stack" || category == "queue" || category == "linked-list") {
    if (command == "push" || command == "enqueue" || command == "insert-head" || command == "insert-tail" || command == "insert") {
      const bool front = command == "insert-head";
      if (front) values.insert(values.begin(), target); else values.push_back(target);
      emit(category == "stack" ? "push" : category == "queue" ? "enqueue" : "insert", front ? 0 : static_cast<int>(values.size()) - 1, "Insert value " + std::to_string(target));
    } else if (command == "pop" || command == "dequeue" || command == "delete-head" || command == "delete-tail" || command == "delete") {
      if (values.empty()) emit("failed", -1, "Cannot remove from an empty structure");
      else {
        const bool tail = category == "stack" || command == "delete-tail";
        const int index = tail ? static_cast<int>(values.size()) - 1 : 0;
        const int removed = values[index]; values.erase(values.begin() + index);
        emit(category == "stack" ? "pop" : category == "queue" ? "dequeue" : "delete", index, "Remove value " + std::to_string(removed));
      }
    } else if (command == "peek") {
      if (values.empty()) emit("failed", -1, "Cannot peek at an empty structure");
      else { const int index = category == "stack" ? static_cast<int>(values.size()) - 1 : 0; emit("peek", index, "Peek value " + std::to_string(values[index])); }
    } else if (command == "search" || command == "visit") {
      const auto it = std::find(values.begin(), values.end(), target);
      if (it == values.end()) emit("failed", -1, "Value " + std::to_string(target) + " was not found");
      else emit("found", static_cast<int>(it - values.begin()), "Found value " + std::to_string(target));
    } else if (command == "reverse") {
      std::reverse(values.begin(), values.end()); emit("reverse", 0, "Reverse linked list");
    } else if (command == "clear") {
      values.clear(); emit("clear", -1, "Clear structure");
    } else if (command == "is-empty") {
      emit("is-empty", -1, values.empty() ? "Structure is empty" : "Structure is not empty");
    } else if (command == "traverse") {
      for (int i = 0; i < static_cast<int>(values.size()); ++i) emit("visit", i, "Visit value " + std::to_string(values[i]));
    } else {
      emit("failed", -1, "Unsupported " + category + " operation: " + command);
    }
  } else if (category == "trees") {
    std::sort(values.begin(), values.end());
    if (command == "insert" || command == "bst-insert") {
      auto at = std::lower_bound(values.begin(), values.end(), target);
      if (at != values.end() && *at == target) emit("failed", static_cast<int>(at - values.begin()), "Duplicate keys are ignored");
      else { const int index = static_cast<int>(at - values.begin()); values.insert(at, target); emit("insert", index, "Insert BST key " + std::to_string(target)); }
    } else if (command == "delete" || command == "bst-delete") {
      auto at = std::lower_bound(values.begin(), values.end(), target);
      if (at == values.end() || *at != target) emit("failed", -1, "BST key was not found");
      else { const int index = static_cast<int>(at - values.begin()); values.erase(at); emit("delete", index, "Delete BST key " + std::to_string(target)); }
    } else if (command == "search" || command == "bst-search") {
      auto at = std::lower_bound(values.begin(), values.end(), target);
      if (at == values.end() || *at != target) emit("failed", -1, "BST key was not found");
      else emit("found", static_cast<int>(at - values.begin()), "BST key found");
    } else if (command == "inorder" || command == "preorder" || command == "postorder" || command == "levelorder" || command == "traverse") {
      struct Node { int index; std::unique_ptr<Node> left; std::unique_ptr<Node> right; };
      std::function<std::unique_ptr<Node>(int, int)> build = [&](int left, int right) -> std::unique_ptr<Node> {
        if (left >= right) return nullptr;
        const int middle = left + (right - left) / 2;
        auto node = std::make_unique<Node>(); node->index = middle;
        node->left = build(left, middle); node->right = build(middle + 1, right);
        return node;
      };
      const auto root = build(0, static_cast<int>(values.size()));
      std::vector<int> order;
      std::function<void(const Node*)> walk = [&](const Node* node) {
        if (!node) return;
        if (command == "preorder") order.push_back(node->index);
        walk(node->left.get());
        if (command == "inorder" || command == "traverse") order.push_back(node->index);
        walk(node->right.get());
        if (command == "postorder") order.push_back(node->index);
      };
      if (command == "levelorder") {
        std::queue<const Node*> pending;
        if (root) pending.push(root.get());
        while (!pending.empty()) { const Node* node = pending.front(); pending.pop(); order.push_back(node->index); if (node->left) pending.push(node->left.get()); if (node->right) pending.push(node->right.get()); }
      } else walk(root.get());
      for (const auto index : order) emit("visit", index, command + " visit " + std::to_string(values[index]));
    } else {
      emit("failed", -1, "Unsupported tree operation: " + command);
    }
  } else if (category == "dynamic-programming") {
    if (command == "fibonacci" || command == "dynamic-programming") {
      const int count = std::clamp(target, 1, 46);
      std::vector<int> dp;
      dp.reserve(count);
      for (int i = 0; i < count; ++i) {
        dp.push_back(i < 2 ? i : dp[i - 1] + dp[i - 2]);
        AnimationStep step; step.action = "overwrite"; step.index = i; step.i = i; step.value = dp.back();
        step.line = i + 1; step.note = "Compute Fibonacci state F(" + std::to_string(i) + ")"; step.snapshot = dp;
        response.steps.push_back(std::move(step));
      }
      values = std::move(dp);
    } else emit("failed", -1, "Unsupported dynamic programming problem: " + command);
  } else {
    emit("failed", -1, "Unsupported structure category: " + category);
  }

  AnimationStep complete; complete.action = "complete"; complete.line = 6; complete.note = "Operation complete"; complete.snapshot = values;
  response.steps.push_back(std::move(complete));
  response.stats.visitedNodes = static_cast<int>(response.stats.traversalOrder.size());
  response.stats.height = category == "trees" ? static_cast<int>(values.size()) : 0;
  response.stats.executionTimeMs = static_cast<int>(response.steps.size());
  response.stats.memoryBytes = static_cast<int>(values.size() * sizeof(int) + response.steps.size() * 48);
  return response;
}

}  // namespace studio
