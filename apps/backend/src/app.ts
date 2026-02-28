import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec, swaggerUiOptions } from "./lib/swaggerConfig.js";
import { statsTrackerMiddleware } from "./middleware/statsTracker.js";
import { getStatsArray } from "./lib/statsStore.js";
import { discoverRoutes } from "./lib/routeDiscovery.js";
import { generateDashboardHtml } from "./lib/statusDashboard.js";
import routes from "./routes/index.js";

const app = express();

// Core middleware
app.use(cors());
app.use(express.json());

// Stats tracking (before routes so all requests are captured)
app.use(statsTrackerMiddleware);

// API routes (all under /api prefix)
app.use("/api", routes);

// Raw OpenAPI JSON spec (must be before swagger UI middleware)
app.get("/api/docs/json", (_req, res) => {
  res.json(swaggerSpec);
});

// Swagger UI at /api/docs
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, swaggerUiOptions)
);

// Status dashboard (HTML)
app.get("/api/status", (_req, res) => {
  const stats = getStatsArray();
  const discoveredRoutes = discoverRoutes(app);
  const baseUrl = `${_req.protocol}://${_req.get("host")}`;
  const html = generateDashboardHtml(stats, discoveredRoutes, baseUrl);
  res.type("html").send(html);
});

// Status JSON (for dashboard auto-refresh)
app.get("/api/status/json", (_req, res) => {
  const stats = getStatsArray();
  const discoveredRoutes = discoverRoutes(app);
  res.json({
    stats,
    routes: discoveredRoutes,
    updatedAt: new Date().toISOString(),
  });
});

export default app;
