# Algorithm Studio

[![CI](https://github.com/Kritika-kr/sorting-visualizer/actions/workflows/ci.yml/badge.svg)](https://github.com/Kritika-kr/sorting-visualizer/actions/workflows/ci.yml)

[![Algorithm Studio screenshot](docs/screenshot.png)](docs/README.md)

[**Live demo**](https://kritika-kr.github.io/sorting-visualizer/)

Algorithm Studio is an interactive learning app for exploring sorting, searching, data structures, graphs, and dynamic programming. It replays algorithms as animation steps with code highlights and run statistics.

## Features

- Sorting: bubble, selection, insertion, merge, quick, heap, shell, cocktail, and counting sort
- Searching: linear, binary, jump, interpolation, exponential, and ternary search
- Linked list, stack, queue, tree, graph, and Fibonacci visualizations
- Step, pause, resume, reset, speed, timeline, and side-by-side comparison controls
- Code examples in C++, Java, Python, and JavaScript

## Prerequisites

- Node.js 20.19+ or 22.12+ and npm
- CMake 3.20+
- A C++20 compiler
- Drogon installed and discoverable by CMake (vcpkg is one supported option)

## Run the frontend

From the repository root, install the root package dependencies and start the Vite development server:

```sh
npm install
npm run start
```

Open `http://localhost:5173`. The root `package.json` provides convenience scripts that delegate to `/frontend`; its dependencies support those commands. The frontend has its own `package.json` and can also be installed and run directly with `npm --prefix frontend install` and `npm --prefix frontend run dev`.

In development, Vite proxies `/api` to `http://localhost:8080`. The frontend reads `VITE_API_URL` as the API origin. Leave it empty to use the relative `/api` path (and the Vite proxy during development). For a separately hosted API, copy `.env.example` to `frontend/.env.local` and set `VITE_API_URL` to that server's origin before starting or building the frontend.

## Build and run the backend (Drogon + CMake)

If Drogon is installed through vcpkg, set `VCPKG_ROOT` to the vcpkg checkout and configure the backend with its CMake toolchain. For example, in PowerShell:

```powershell
$env:VCPKG_ROOT = "C:\path\to\vcpkg"
cmake -S backend -B backend/build -DCMAKE_TOOLCHAIN_FILE="$env:VCPKG_ROOT/scripts/buildsystems/vcpkg.cmake"
cmake --build backend/build --config Release
```

Run the executable produced by your generator. With the Visual Studio generator, it is `backend/build/Release/algorithm_studio.exe`; with a single-configuration generator, it is usually `backend/build/algorithm_studio`. The server listens on port `8080` by default; set `PORT` to change it.

The health endpoint is `GET /api/health`. Algorithm endpoints return a `steps` array and aggregate `stats`, for example `POST /api/algorithms/sorting/quick-sort` with `{"array":[42,17,83,9,31]}`. Linked-list steps also include a `pointerChange` object (`field`, `from`, `to`) for head, tail, and next-pointer updates; pointer indices refer to node positions in that step's snapshot, and `null` represents a null pointer. Other routes cover searching, linked lists, stacks, queues, trees, graphs, dynamic programming, and `GET /api/analytics`.

## Run both together

Start the backend in one terminal, then start the frontend in a second terminal from the repository root:

```powershell
# Terminal 1, repository root
cmake --build backend/build --config Release
./backend/build/Release/algorithm_studio.exe
```

```sh
# Terminal 2, repository root
npm run start
```

The Vite proxy forwards frontend `/api` requests to the backend on port `8080`. If the backend is unavailable, the frontend falls back to local TypeScript traces.

The GitHub Pages demo is a static frontend and does not run the C++ backend. With no `VITE_API_URL` configured, requests to its `/api` paths fail and the frontend uses its local fallback traces.

## Project structure

```text
frontend/
  src/components/       Layout, panels, visualizers, and comparison UI
  src/data/             Algorithm descriptions and sample graph data
  src/services/         API client, local traces, and dataset generation
  src/hooks/             Animation playback
backend/
  controllers/           Drogon HTTP routes
  services/algorithms/   C++ trace generators
  models/                Trace and statistics models
  utils/                 JSON input and response helpers
```
