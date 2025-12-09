# 🧩 MCP Stack – Multi-Component AI + Tools Demo

This repository provides a complete, containerized **MCP (Model Context Protocol) stack** consisting of:

- **Two MCP tool servers**
  - `mcp-matrix`: Matrix inversion (NumPy)
  - `mcp-hanoi`: Tower of Hanoi solver
- **Backend API** (Node.js)
- **Frontend UI** (Nginx static app)
- **SearxNG** meta-search engine
- **One-command startup using Docker Compose**

---

## 📦 Repository Structure

```text
mcp-stack/
├── docker-compose.yml
├── mcp-hanoi/
├── mcp-matrix/
├── backend/
├── frontend/
└── searxng/
```

---

## 🛠️ Service Overview

### 🔷 MCP Matrix Inversion Server (`mcp-matrix`)
Python + NumPy MCP service providing:
- `invert_matrix(matrix)` → returns the inverse or an error if the matrix is singular.

Exposed port:

- **Host:** `6101` → **Container:** `6101`

---

### 🔶 MCP Hanoi Server (`mcp-hanoi`)
Recursive Tower-of-Hanoi solver:
- `solve_hanoi(disks, from, to, aux)` → returns an ordered move list.

Exposed port:

- **Host:** `6102` → **Container:** `6102`

---

### 🟩 Backend API (`backend`)
Node.js service that:

- Connects to MCP servers
- Talks to a local Ollama instance
- Provides REST endpoints for the frontend

Environment (from `docker-compose.yml`):

- `OLLAMA_BASE_URL=http://host.docker.internal:11434`
- `OLLAMA_MODEL=qwen3:1.7b`
- `MCP_MATRIX_URL=http://mcp-matrix:6101`
- `MCP_HANOI_URL=http://mcp-hanoi:6102`
- `SEARXNG_URL=http://searxng:8080`

Exposed port:

- **Host:** `6100` → **Container:** `6100`

---

### 🟦 Frontend UI (`frontend`)
Nginx-served static HTML/JS interface that talks to the backend.

Exposed port:

- **Host:** `6180` → **Container:** `80`

You can open the UI in your browser at:

- http://localhost:6180

---

### 🟪 SearxNG (`searxng`)
Local, privacy-preserving meta-search engine.

- Internal URL for other services: `http://searxng:8080`
- Environment: `SEARXNG_BASE_URL=http://localhost:6103/`

Exposed port:

- **Host:** `6103` → **Container:** `8080`

You can open SearxNG directly at:

- http://localhost:6103

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/vtavakkoli/mcp-test.git
cd mcp-test
```

### 2. Start the entire stack

```bash
docker-compose up --build
```

### 3. Access the services

| Service        | URL                    | Host Port |
|---------------|------------------------|-----------|
| Frontend UI   | http://localhost:6180  | `6180`    |
| Backend API   | http://localhost:6100  | `6100`    |
| MCP Matrix    | (internal: mcp-matrix) | `6101`    |
| MCP Hanoi     | (internal: mcp-hanoi)  | `6102`    |
| SearxNG       | http://localhost:6103  | `6103`    |

> ⚠️ MCP servers are primarily meant to be used from inside the Docker network (backend / LLM tool calls), but they are also mapped to host ports for debugging.

---

## 🔧 Development Notes

Matrix service uses:

```python
np.linalg.inv(matrix)
```

Hanoi service returns all moves in order.

Backend is located in:

```text
/backend/src
```

Frontend files in:

```text
/frontend/html
```

---

## 🤝 Contributing

PRs are welcome.  
Please open issues for bugs and feature ideas.
