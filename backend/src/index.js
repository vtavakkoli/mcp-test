import express from "express";
import cors from "cors";
import { CONFIG } from "./config/env.js";
import { log } from "./utils/logger.js";
import { handleChat } from "./controllers/chatController.js";

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.post("/api/chat", handleChat);

app.listen(CONFIG.PORT, () => {
  log("INFO", `🚀 Backend listening on http://0.0.0.0:${CONFIG.PORT}`);
});
