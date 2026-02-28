import { Router } from "express";

const router = Router();

/**
 * @openapi
 * /api/health:
 *   get:
 *     summary: Health check
 *     description: Returns server health status with links to API documentation and status dashboard.
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2026-02-28T12:00:00.000Z"
 *                 docs:
 *                   type: string
 *                   description: URL to Swagger API documentation
 *                   example: /api/docs
 *                 dashboard:
 *                   type: string
 *                   description: URL to API usage dashboard
 *                   example: /api/status
 */
router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    docs: "/api/docs",
    dashboard: "/api/status",
  });
});

export default router;
