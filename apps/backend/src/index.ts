import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { connectDB } from "./lib/db.js";
import { seedDemandEvents } from "./lib/seedDemand.js";
import { startLiveSimulator } from "./lib/liveSimulator.js";
import { streamChat, type ChatMessage } from "./lib/openrouter.js";
import { gatherContext } from "./lib/aiContext.js";

dotenv.config();

const PORT = process.env.PORT || 7020;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

const SYSTEM_PROMPT =
  "You are Smart Inventory AI, an intelligent assistant for an inventory management system. " +
  "You help users with inventory management, demand analysis, stock optimization, and business insights. " +
  "Be concise, actionable, and reference specific products/numbers from the context when relevant. " +
  "Use ₹ for currency. Keep responses focused and practical.";

io.on("connection", (socket) => {
  console.log(`  Socket connected: ${socket.id}`);

  // Per-socket conversation history
  const history: ChatMessage[] = [];

  socket.on("ai:message", async (data: { message: string }) => {
    try {
      const context = await gatherContext();
      history.push({ role: "user", content: data.message });

      const messages: ChatMessage[] = [
        {
          role: "system",
          content: `${SYSTEM_PROMPT}\n\nHere is the current inventory context:\n${context}`,
        },
        ...history.slice(-10), // keep last 10 messages for context window
      ];

      await streamChat(
        messages,
        (token) => socket.emit("ai:token", { token }),
        (fullText) => {
          history.push({ role: "assistant", content: fullText });
          socket.emit("ai:done", { text: fullText });
        }
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "AI error";
      socket.emit("ai:done", { text: `Error: ${msg}` });
    }
  });

  socket.on("disconnect", () => {
    console.log(`  Socket disconnected: ${socket.id}`);
  });
});

connectDB()
  .then(async () => {
    await seedDemandEvents();
    startLiveSimulator(io);
    httpServer.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
      console.log(`  API Docs:      http://localhost:${PORT}/api/docs`);
      console.log(`  API Status:    http://localhost:${PORT}/api/status`);
      console.log(`  Health Check:  http://localhost:${PORT}/api/health`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
