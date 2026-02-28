import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 6000;

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`  API Docs:      http://localhost:${PORT}/api/docs`);
  console.log(`  API Status:    http://localhost:${PORT}/api/status`);
  console.log(`  Health Check:  http://localhost:${PORT}/api/health`);
});
