#include <gtest/gtest.h>
#include <json/json.h>
#include <algorithm>
#include <cctype>
#include <fstream>
#include <iterator>
#include "services/algorithms/SearchingAlgorithms.h"
#include "services/algorithms/SortingAlgorithms.h"
#include "services/algorithms/StructureAlgorithms.h"

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
  for (const auto& test : fixtures()["sortCases"]) {
    const auto response = algorithms.run(test["algorithm"].asString(), ints(test["input"]));
    ASSERT_FALSE(response.steps.empty());
    EXPECT_EQ(response.steps.back().snapshot, ints(test["expected"])) << test["algorithm"];
  }
}

TEST(SharedFixtures, SearchesReturnExpectedIndexOrMinusOne) {
  studio::SearchingAlgorithms algorithms;
  for (const auto& test : fixtures()["searchCases"]) {
    const auto response = algorithms.run(test["algorithm"].asString(), ints(test["input"]), test["target"].asInt());
    int found = -1;
    for (const auto& step : response.steps) if (step.action == "found") { found = step.index; break; }
    EXPECT_EQ(found, test["expectedIndex"].asInt()) << test["algorithm"];
  }
}

TEST(SharedFixtures, StructuresProduceExpectedFinalState) {
  studio::StructureAlgorithms algorithms;
  for (const auto& test : fixtures()["structureCases"]) {
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
