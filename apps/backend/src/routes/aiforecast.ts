import { Router, Request, Response } from "express";

const router = Router();

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || "http://localhost:8000";

async function proxyToAI(
  req: Request,
  res: Response,
  path: string,
  method: "GET" | "POST" = "GET"
) {
  try {
    const url = `${AI_ENGINE_URL}${path}`;
    const options: RequestInit = {
      method,
      headers: { "Content-Type": "application/json" },
    };

    if (method === "POST" && req.body) {
      options.body = JSON.stringify(req.body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch {
    res.status(503).json({
      fallback: true,
      message: "AI forecasting service unavailable",
      hint: "Start the AI engine: cd apps/ai-engine && npm run dev",
    });
  }
}

// ──────────────────────────────────────────────
// GET /api/ai-forecast/health
// ──────────────────────────────────────────────

/**
 * @openapi
 * /api/ai-forecast/health:
 *   get:
 *     summary: Check AI forecasting engine health
 *     tags: [AI Forecast]
 *     responses:
 *       200:
 *         description: AI engine health status
 *       503:
 *         description: AI engine unavailable
 */
router.get("/ai-forecast/health", (req: Request, res: Response) => {
  proxyToAI(req, res, "/health");
});

// ──────────────────────────────────────────────
// POST /api/ai-forecast/product
// ──────────────────────────────────────────────

/**
 * @openapi
 * /api/ai-forecast/product:
 *   post:
 *     summary: Forecast demand for a specific product using Chronos-2
 *     tags: [AI Forecast]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [product]
 *             properties:
 *               product:
 *                 type: string
 *               horizon:
 *                 type: integer
 *                 default: 14
 *               lookback_days:
 *                 type: integer
 *                 default: 90
 *     responses:
 *       200:
 *         description: Product forecast with confidence intervals
 *       503:
 *         description: AI engine unavailable (fallback response)
 */
router.post("/ai-forecast/product", (req: Request, res: Response) => {
  proxyToAI(req, res, "/forecast/product", "POST");
});

// ──────────────────────────────────────────────
// POST /api/ai-forecast/category
// ──────────────────────────────────────────────

/**
 * @openapi
 * /api/ai-forecast/category:
 *   post:
 *     summary: Forecast demand for a product category
 *     tags: [AI Forecast]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [category]
 *             properties:
 *               category:
 *                 type: string
 *               horizon:
 *                 type: integer
 *                 default: 14
 *               lookback_days:
 *                 type: integer
 *                 default: 90
 *     responses:
 *       200:
 *         description: Category forecast with confidence intervals
 */
router.post("/ai-forecast/category", (req: Request, res: Response) => {
  proxyToAI(req, res, "/forecast/category", "POST");
});

// ──────────────────────────────────────────────
// POST /api/ai-forecast/overall
// ──────────────────────────────────────────────

/**
 * @openapi
 * /api/ai-forecast/overall:
 *   post:
 *     summary: Forecast overall demand across all products
 *     tags: [AI Forecast]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               horizon:
 *                 type: integer
 *                 default: 14
 *               lookback_days:
 *                 type: integer
 *                 default: 90
 *     responses:
 *       200:
 *         description: Overall demand forecast
 */
router.post("/ai-forecast/overall", (req: Request, res: Response) => {
  proxyToAI(req, res, "/forecast/overall", "POST");
});

// ──────────────────────────────────────────────
// POST /api/ai-forecast/batch
// ──────────────────────────────────────────────

/**
 * @openapi
 * /api/ai-forecast/batch:
 *   post:
 *     summary: Batch forecast for multiple products
 *     tags: [AI Forecast]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [products]
 *             properties:
 *               products:
 *                 type: array
 *                 items:
 *                   type: string
 *               horizon:
 *                 type: integer
 *                 default: 14
 *     responses:
 *       200:
 *         description: Batch forecast results
 */
router.post("/ai-forecast/batch", (req: Request, res: Response) => {
  proxyToAI(req, res, "/forecast/batch", "POST");
});

// ──────────────────────────────────────────────
// GET /api/ai-forecast/products
// ──────────────────────────────────────────────

/**
 * @openapi
 * /api/ai-forecast/products:
 *   get:
 *     summary: List products with enough data for AI forecasting
 *     tags: [AI Forecast]
 *     responses:
 *       200:
 *         description: List of forecastable products
 */
router.get("/ai-forecast/products", (req: Request, res: Response) => {
  proxyToAI(req, res, "/forecast/products");
});

// ──────────────────────────────────────────────
// GET /api/ai-forecast/categories
// ──────────────────────────────────────────────

/**
 * @openapi
 * /api/ai-forecast/categories:
 *   get:
 *     summary: List categories with enough data for AI forecasting
 *     tags: [AI Forecast]
 *     responses:
 *       200:
 *         description: List of forecastable categories
 */
router.get("/ai-forecast/categories", (req: Request, res: Response) => {
  proxyToAI(req, res, "/forecast/categories");
});

export default router;
