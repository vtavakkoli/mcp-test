export const CONFIG = {
  PORT: 6100,
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || "http://host.docker.internal:11434",
  OLLAMA_MODEL: process.env.OLLAMA_MODEL || "qwen3-vl:2b",
  MCP_MATRIX_URL: process.env.MCP_MATRIX_URL || "http://localhost:6101",
  MCP_HANOI_URL: process.env.MCP_HANOI_URL || "http://localhost:6102",
  SEARXNG_URL: process.env.SEARXNG_URL || "http://searxng:8080"
};
