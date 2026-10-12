# Algorithm Studio

Algorithm Studio is an interactive learning app for exploring sorting, searching, data structure, graph, and dynamic programming algorithms. It replays an algorithm as animation steps and shows the active step, code, and run statistics. The comparison workspace can play two algorithms side by side.

## Features

- Sorting and searching visualizations with dataset controls and custom arrays
- Bubble, selection, insertion, merge, quick, heap, shell, cocktail, and counting sort; linear, binary, jump, interpolation, exponential, and ternary search
- Linked list insert-at-head/tail, search, delete-at-head/tail, reverse, and traversal traces
- Stack push/pop/peek/clear/empty checks and queue enqueue/dequeue/peek/clear/empty checks
- Tree traversal and graph algorithm visualizations (BFS, DFS, Dijkstra, Prim, Kruskal, topological sort), plus a Fibonacci dynamic-programming table
- Step, pause, resume, reset, speed, and timeline controls
- Side by side comparison for algorithms in the same category
- Complexity explanations and example code in C++, Java, Python, and JavaScript
- Dark and light themes, favorites, recent algorithms, fullscreen view, and screenshots

## Technology

- Frontend: React 18, TypeScript, Vite, Tailwind CSS, and Framer Motion
- Backend: C++20, Drogon, and CMake
- Backend API: JSON endpoints under `/api`

## Backend algorithm coverage

- Sorting: bubble, selection, insertion, merge, quick, heap, shell, cocktail, and counting sort
- Searching: linear, binary, jump, interpolation, exponential, and ternary search
- Graphs: BFS, DFS, Dijkstra, Prim, Kruskal, and topological sort over the built-in sample graph
- Structures: linked-list, stack, queue, BST traversal/mutation, and Fibonacci operations

Send `array`, `target`, and `operation` fields in the JSON request body for structure operations. The frontend requests backend traces for each category and falls back to a local trace if the API is unavailable.
