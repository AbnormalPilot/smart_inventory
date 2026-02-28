import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { connectDB } from "./lib/db.js";
import { seedDemandEvents } from "./lib/seedDemand.js";
import { startLiveSimulator } from "./lib/liveSimulator.js";

dotenv.config();

const PORT = process.env.PORT || 6000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log(`  Socket connected: ${socket.id}`);
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
