import { processChat } from "../services/ollamaService.js";
import { log } from "../utils/logger.js";
import crypto from "crypto";

// Simple in-memory cache for deduplication
const requestCache = new Map();

export async function handleChat(req, res) {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message required" });

    // --- DEDUPLICATION LOGIC START ---
    // Create a hash of the message + IP (rough proxy for user) to identify duplicates
    const ip = req.ip || req.connection.remoteAddress;
    const hash = crypto.createHash("md5").update(message + ip).digest("hex");
    const now = Date.now();

    if (requestCache.has(hash)) {
      const lastTime = requestCache.get(hash);
      // If the same request comes within 2000ms, ignore it
      if (now - lastTime < 2000) {
        log("WARN", "🚫 Duplicate request detected and blocked", { message });
        return res.status(429).json({ error: "Duplicate request blocked. Please wait." });
      }
    }
    
    // Store request timestamp
    requestCache.set(hash, now);
    
    // Clean up cache periodically (every 100 entries to prevent memory leaks)
    if (requestCache.size > 100) requestCache.clear();
    // --- DEDUPLICATION LOGIC END ---

    const reply = await processChat(message);
    log("INFO", "🏁 Reply sent", { length: reply.length });
    res.json({ reply });
  } catch (err) {
    log("FATAL", "Controller Error", err.message);
    res.status(500).json({ error: err.message });
  }
}
