#include <gtest/gtest.h>
#include <json/json.h>
#include <algorithm>
#include <cctype>
#include <fstream>
#include <iterator>
#include "services/algorithms/SearchingAlgorithms.h"
#include "services/algorithms/SortingAlgorithms.h"
#include "services/algorithms/StructureAlgorithms.h"
#include "utils/JsonUtils.h"

namespace {
Json::Value fixtures() {
  std::ifstream stream(TRACE_FIXTURE_PATH);
  Json::Value root;
  Json::CharReaderBuilder builder;
  std::string errors;
  EXPECT_TRUE(Json::parseFromStream(builder, stream, &root, &errors)) << errors;
  return root;
}
std::vector<int> ints(const Json::Value& value) {
  std::vector<int> result;
  for (const auto& item : value) result.push_back(item.asInt());
  return result;
}
}

TEST(SharedFixtures, SortingProducesExpectedOutput) {
  studio::SortingAlgorithms algorithms;
  const auto data = fixtures();
  for (const auto& test : data["sortCases"]) {
    const auto response = algorithms.run(test["algorithm"].asString(), ints(test["input"]));
    ASSERT_FALSE(response.steps.empty());
    EXPECT_EQ(response.steps.back().snapshot, ints(test["expected"])) << test["algorithm"];
  }
}

TEST(SharedFixtures, SearchesReturnExpectedIndexOrMinusOne) {
  studio::SearchingAlgorithms algorithms;
  const auto data = fixtures();
  for (const auto& test : data["searchCases"]) {
    const auto response = algorithms.run(test["algorithm"].asString(), ints(test["input"]), test["target"].asInt());
    int found = -1;
    for (const auto& step : response.steps) if (step.action == "found") { found = step.index; break; }
    EXPECT_EQ(found, test["expectedIndex"].asInt()) << test["algorithm"];
  }
}

TEST(SharedFixtures, StructuresProduceExpectedFinalState) {
  studio::StructureAlgorithms algorithms;
  const auto data = fixtures();
  for (const auto& test : data["structureCases"]) {
    std::string category = test["category"].asString();
    std::transform(category.begin(), category.end(), category.begin(), [](unsigned char c) { return static_cast<char>(std::tolower(c)); });
    if (category == "linked list") category = "linked-list";
    auto operation = test["operation"].asString();
    std::replace(operation.begin(), operation.end(), '_', '-');
    const auto response = algorithms.run(category, operation, ints(test["input"]), test["target"].asInt());
    ASSERT_FALSE(response.steps.empty());
    EXPECT_EQ(response.steps.back().snapshot, ints(test["expected"])) << category;
  }
}

TEST(SharedFixtures, LinkedListDefaultAndOperationsKeepDescriptiveSnapshots) {
  studio::StructureAlgorithms algorithms;
  const auto data = fixtures();
  for (const auto& test : data["linkedListCases"]) {
    const auto response = algorithms.run("linked-list", test["operation"].asString(), ints(test["input"]), test["target"].asInt());
    ASSERT_FALSE(response.steps.empty());
    EXPECT_EQ(response.steps.front().note, test["firstNote"].asString());
    ASSERT_EQ(response.steps.size(), test["expectedActions"].size());
    const auto mapped = studio::toJson(response);
    for (std::size_t index = 0; index < response.steps.size(); ++index) {
      const auto& step = response.steps[index];
      EXPECT_FALSE(step.note.empty());
      EXPECT_TRUE(step.snapshot.size() <= 5 || test["operation"].asString().find("insert") == 0);
      EXPECT_TRUE(mapped["steps"][static_cast<Json::ArrayIndex>(index)]["snapshot"].isArray());
      if (step.action == "pointer") EXPECT_TRUE(mapped["steps"][static_cast<Json::ArrayIndex>(index)]["pointerChange"].isObject());
    }
    for (std::size_t index = 0; index < response.steps.size(); ++index) EXPECT_EQ(response.steps[index].action, test["expectedActions"][static_cast<Json::ArrayIndex>(index)].asString());
    EXPECT_EQ(response.steps.back().snapshot, ints(test["expected"]));
  }
}
