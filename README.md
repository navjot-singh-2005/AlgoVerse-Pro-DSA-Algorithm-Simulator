# AlgoVerse Pro 🌌
### C++-powered DSA simulator with a web frontend

AlgoVerse Pro is a lightweight algorithm simulator that uses C++ for the core logic and a browser-based frontend for visualization. It currently supports bubble sort and binary search, with a simple API layer that connects the two.

## What is included
- A C++ engine in [cpp/algorithm_engine.cpp](cpp/algorithm_engine.cpp) that simulates algorithm steps.
- A Node.js web server in [server.js](server.js) that exposes the simulator through HTTP.
- A modern static frontend in [index.html](index.html), [styles.css](styles.css), and [app.js](app.js).

## Run locally
1. Open the project folder in a terminal.
2. Compile the C++ engine:
   `g++ -std=c++11 cpp/algorithm_engine.cpp -O2 -o cpp/algorithm_engine.exe`
3. Start the web server:
   `node server.js`
4. Open http://127.0.0.1:3000 or the port shown by the terminal.

## Current algorithms and structures
- Bubble Sort
- Binary Search
- Stack operations
- Queue operations
- Linked-list operations
- Binary Tree operations
- Graph operations
