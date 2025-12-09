import { CONFIG } from "../config/env.js";
import { log } from "../utils/logger.js";
import { TOOLS } from "../tools/toolDefinitions.js";
import { executeTool } from "../tools/toolExecutor.js";

// Refined System Prompt with CURRENCY vs MATH instructions
const SYSTEM_PROMPT = `
You are a helpful assistant with access to tools.

FORMATTING RULES:
1. **Mathematical Matrices ONLY**:
   - MUST use LaTeX 'bmatrix': $$ \\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix} $$
   - MUST use DOUBLE BACKSLASHES ('\\\\') for rows.

2. **General Information**:
   - Use standard Markdown (bold, list, etc.).
   - Do NOT use LaTeX matrices for text.

3. **Currency vs Math**:
   - **Currency**: Write prices normally (e.g., "$450.00"). Do NOT wrap currency in LaTeX symbols.
   - **Math**: Format equations in $$ ... $$ (block) or $ ... $ (inline).
   - The frontend will intelligently distinguish between $450 (money) and $x$ (math).
`.trim();

export async function processChat(message) {
  log("INFO", "📨 Processing Chat", { message });

  let messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: message }
  ];

  // Round 1
  const initRes = await fetch(`${CONFIG.OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: CONFIG.OLLAMA_MODEL, stream: false, messages, tools: TOOLS })
  });

  if (!initRes.ok) throw new Error(`Ollama Init Error: ${await initRes.text()}`);
  const initData = await initRes.json();
  const initMsg = initData.message;

  // Tool check
  if (initMsg.tool_calls && initMsg.tool_calls.length > 0) {
    log("INFO", `🧠 Model requested ${initMsg.tool_calls.length} tool(s)`);
    messages.push(initMsg);

    for (const tool of initMsg.tool_calls) {
      const toolResult = await executeTool(tool.function.name, tool.function.arguments);
      messages.push({ role: "tool", content: JSON.stringify(toolResult) });
    }

    // Round 2
    log("DEBUG", "🤖 Calling Ollama (Round 2)...");
    const finalRes = await fetch(`${CONFIG.OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: CONFIG.OLLAMA_MODEL, stream: false, messages })
    });

    if (!finalRes.ok) throw new Error(`Ollama Final Error: ${await finalRes.text()}`);
    const finalData = await finalRes.json();
    return finalData.message?.content || "";
  } 
  
  return initMsg.content;
}