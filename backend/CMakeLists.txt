cmake_minimum_required(VERSION 3.20)
project(AlgorithmStudioBackend LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

find_package(Drogon CONFIG REQUIRED)

add_executable(algorithm_studio
  main.cpp
  controllers/AlgorithmController.cpp
  services/AlgorithmService.cpp
  services/algorithms/SortingAlgorithms.cpp
  services/algorithms/SearchingAlgorithms.cpp
  services/algorithms/StructureAlgorithms.cpp
  services/algorithms/GraphAlgorithms.cpp
  middleware/CorsFilter.cpp
  utils/JsonUtils.cpp
)

target_include_directories(algorithm_studio PRIVATE ${CMAKE_CURRENT_SOURCE_DIR})
target_link_libraries(algorithm_studio PRIVATE Drogon::Drogon)

include(CTest)
if(BUILD_TESTING)
  include(FetchContent)
  FetchContent_Declare(googletest
    URL https://github.com/google/googletest/archive/refs/tags/v1.15.2.zip
    DOWNLOAD_EXTRACT_TIMESTAMP TRUE
  )
  set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
  FetchContent_MakeAvailable(googletest)
  add_executable(algorithm_trace_tests tests/AlgorithmTraceTests.cpp
    services/algorithms/SortingAlgorithms.cpp
    services/algorithms/SearchingAlgorithms.cpp
    services/algorithms/StructureAlgorithms.cpp
    utils/JsonUtils.cpp
  )
  target_include_directories(algorithm_trace_tests PRIVATE ${CMAKE_CURRENT_SOURCE_DIR})
  target_link_libraries(algorithm_trace_tests PRIVATE GTest::gtest_main Drogon::Drogon)
  target_compile_definitions(algorithm_trace_tests PRIVATE TRACE_FIXTURE_PATH="${CMAKE_CURRENT_SOURCE_DIR}/../tests/fixtures/trace-cases.json")
  include(GoogleTest)
  gtest_discover_tests(algorithm_trace_tests)
endif()
