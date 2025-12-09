const chatEl = document.getElementById("chat-history");
const inputEl = document.getElementById("message");
const sendBtn = document.getElementById("send");
const BACKEND_URL = "http://localhost:6100/api/chat";

let isProcessing = false;

// 1. EVENT DELEGATION for Sidebar Buttons
document.querySelectorAll(".example-btn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    if (isProcessing) return;
    
    const text = btn.getAttribute("data-prompt");
    if (text) {
      inputEl.value = text;
      inputEl.focus();
      send();
    }
  });
});

// --- MATH HANDLING ---
let mathExpressions = [];

function escapeMath(text) {
  mathExpressions = [];
  
  // 1. Capture Block Math: $$...$$ or \[...\]
  text = text.replace(/(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\])/g, (match) => {
    const placeholder = `@@MATH_BLOCK_${mathExpressions.length}@@`;
    mathExpressions.push({ type: 'block', content: match });
    return placeholder;
  });

  // 2. Capture Explicit Inline Math: \(...\)
  text = text.replace(/(\\\([\s\S]*?\\\))/g, (match) => {
    const placeholder = `@@MATH_INLINE_${mathExpressions.length}@@`;
    mathExpressions.push({ type: 'inline', content: match });
    return placeholder;
  });

  // 3. Capture Dollar Math: $...$ (Intelligent Handling)
  // Regex Explanation:
  // (?<!\\)\$       -> Match '$' if not preceded by '\'
  // (?!\d)          -> LOOKAHEAD: Ensure it is NOT followed by a digit (Protects "$450")
  // (               -> Start capturing content
  //   (?:\\.|[^$])+ -> Match escaped chars OR non-$ chars (one or more)
  // )
  // (?<!\\)\$       -> Match closing '$' if not preceded by '\'
  text = text.replace(/(?<!\\)\$(?!\d)((?:\\.|[^$])+)(?<!\\)\$/g, (match, content) => {
    const placeholder = `@@MATH_INLINE_${mathExpressions.length}@@`;
    // CONVERT to \( ... \) format for safe rendering
    mathExpressions.push({ type: 'inline', content: `\\(${content}\\)` });
    return placeholder;
  });

  return text;
}

function restoreMath(html) {
  return html.replace(/@@MATH_(BLOCK|INLINE)_(\d+)@@/g, (_, type, index) => {
    return mathExpressions[parseInt(index)].content;
  });
}
// ---------------------

function appendMessage(role, text) {
  const rowDiv = document.createElement("div");
  rowDiv.className = `msg-row ${role}`;
  const bubbleDiv = document.createElement("div");
  bubbleDiv.className = "msg-bubble";
  
  if (role === "user") {
    bubbleDiv.textContent = text;
  } else {
    // 1. Mask Math
    const maskedText = escapeMath(text);
    
    // 2. Render Markdown
    let html = marked.parse(maskedText);
    
    // 3. Restore Math
    html = restoreMath(html);
    
    bubbleDiv.innerHTML = html;
    
    // 4. Render Math (KaTeX)
    // IMPORTANT: Removed '$' delimiter to prevent currency errors
    if (window.renderMathInElement) {
      renderMathInElement(bubbleDiv, {
        delimiters: [
          {left: '$$', right: '$$', display: true},
          {left: '\\[', right: '\\]', display: true},
          {left: '\\(', right: '\\)', display: false} 
        ],
        throwOnError: false,
        trust: true
      });
    }
  }
  rowDiv.appendChild(bubbleDiv);
  chatEl.appendChild(rowDiv);
  chatEl.scrollTop = chatEl.scrollHeight;
}

async function send() {
  if (isProcessing) return;
  
  const text = inputEl.value.trim();
  if (!text) return;
  
  isProcessing = true;
  appendMessage("user", text);
  inputEl.value = "";
  inputEl.disabled = true;
  sendBtn.disabled = true;
  document.body.style.cursor = "wait";

  const loadingRow = document.createElement("div");
  loadingRow.className = "msg-row assistant";
  loadingRow.id = "loading-indicator";
  loadingRow.innerHTML = `<div class="msg-bubble" style="color:#64748b; font-style:italic;">thinking & processing tools...</div>`;
  chatEl.appendChild(loadingRow);
  chatEl.scrollTop = chatEl.scrollHeight;

  try {
    const resp = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });
    
    if (resp.status === 429) {
      console.warn("Duplicate request blocked by backend");
      const loader = document.getElementById("loading-indicator");
      if (loader) loader.remove();
      return; 
    }

    const data = await resp.json();
    const loader = document.getElementById("loading-indicator");
    if (loader) loader.remove();
    
    if (data.reply) {
      appendMessage("assistant", data.reply);
    } else {
      appendMessage("assistant", "Error: No reply received.");
    }

  } catch (err) {
    const loader = document.getElementById("loading-indicator");
    if (loader) loader.remove();
    appendMessage("assistant", "**Connection Error:** " + err);
  } finally {
    isProcessing = false;
    inputEl.disabled = false;
    sendBtn.disabled = false;
    document.body.style.cursor = "default";
    inputEl.focus();
  }
}

sendBtn.addEventListener("click", send);
inputEl.addEventListener("keydown", (e) => { 
  if (e.key === "Enter") {
    e.preventDefault();
    send(); 
  }
});