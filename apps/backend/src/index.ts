import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./lib/db.js";

dotenv.config();

const PORT = process.env.PORT || 6000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
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
