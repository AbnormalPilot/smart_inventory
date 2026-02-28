import { Router, Request, Response } from "express";
import { DemandEvent } from "../models/DemandEvent.js";
import { upload } from "../middleware/upload.js";

const router = Router();

// ──────────────────────────────────────────────
// POST /api/demand/upload-csv
// ──────────────────────────────────────────────

/**
 * @openapi
 * /api/demand/upload-csv:
 *   post:
 *     summary: Upload sales CSV — AI structures it into demand events
 *     tags: [Demand]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Structured demand events saved
 */
router.post(
  "/demand/upload-csv",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "CSV file is required" });
      }

      const csvContent = req.file.buffer.toString("utf-8");
      const lines = csvContent.split("\n").filter((l) => l.trim());

      if (lines.length < 2) {
        return res
          .status(400)
          .json({ message: "CSV must have a header and at least one data row" });
      }

      // Try AI structuring via OpenRouter
      const apiKey = process.env.OPENROUTER_API_KEY;
      let structuredRows: Array<{
        product: string;
        category: string;
        date: string;
        time: string;
        lat: number;
        lng: number;
        quantity: number;
      }> = [];

      if (apiKey) {
        structuredRows = await structureWithAI(csvContent, apiKey);
      }

      // Fallback: parse CSV directly if AI fails or no key
      if (structuredRows.length === 0) {
        structuredRows = parseCSVDirectly(lines);
      }

      if (structuredRows.length === 0) {
        return res.status(400).json({
          message:
            "Could not extract demand events. Ensure CSV has columns like product, date, time, lat/latitude, lng/longitude, quantity.",
        });
      }

      // Build documents
      const docs = structuredRows
        .filter(
          (r) =>
            r.product &&
            r.lat &&
            r.lng &&
            !isNaN(r.lat) &&
            !isNaN(r.lng) &&
            r.quantity > 0
        )
        .map((r) => ({
          product: r.product,
          category: r.category || "Uncategorized",
          date: new Date(r.date || Date.now()),
          time: r.time || "12:00",
          location: {
            type: "Point" as const,
            coordinates: [Number(r.lng), Number(r.lat)] as [number, number],
          },
          quantity: Number(r.quantity),
          source: "csv_upload",
        }));

      const inserted = await DemandEvent.insertMany(docs);

      res.json({
        message: `Imported ${inserted.length} demand events`,
        count: inserted.length,
        sample: inserted.slice(0, 5),
      });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Failed to process CSV", error: String(err) });
    }
  }
);

async function structureWithAI(
  csvContent: string,
  apiKey: string
): Promise<
  Array<{
    product: string;
    category: string;
    date: string;
    time: string;
    lat: number;
    lng: number;
    quantity: number;
  }>
> {
  try {
    const prompt = `You are a data extraction assistant. Given this raw CSV sales data, extract structured rows.

Return ONLY a valid JSON array where each element has:
{ "product": string, "category": string, "date": "YYYY-MM-DD", "time": "HH:mm", "lat": number, "lng": number, "quantity": number }

If a column is missing, infer reasonable defaults:
- category: guess from product name (e.g. "Milk" → "Dairy")
- date: use today if missing
- time: use "12:00" if missing
- lat/lng: if location name given, estimate coordinates; if missing entirely use 18.5204/73.8567 (Pune)
- quantity: default 1 if missing

CSV data:
${csvContent.slice(0, 3000)}

Return ONLY the JSON array, no explanation.`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-maverick:free",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.1,
        }),
      }
    );

    if (!response.ok) return [];

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content || "";

    // Extract JSON array from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    return JSON.parse(jsonMatch[0]);
  } catch {
    return [];
  }
}

function parseCSVDirectly(
  lines: string[]
): Array<{
  product: string;
  category: string;
  date: string;
  time: string;
  lat: number;
  lng: number;
  quantity: number;
}> {
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const rows = lines.slice(1);

  const col = (names: string[]): number =>
    names.reduce((found, n) => (found >= 0 ? found : headers.indexOf(n)), -1);

  const productCol = col(["product", "item", "name", "product_name"]);
  const categoryCol = col(["category", "type", "cat"]);
  const dateCol = col(["date", "order_date", "sale_date"]);
  const timeCol = col(["time", "order_time", "sale_time"]);
  const latCol = col(["lat", "latitude"]);
  const lngCol = col(["lng", "longitude", "lon"]);
  const qtyCol = col(["quantity", "qty", "count", "units"]);

  if (productCol < 0) return [];

  return rows
    .map((line) => {
      const cells = line.split(",").map((c) => c.trim());
      return {
        product: cells[productCol] || "",
        category: categoryCol >= 0 ? cells[categoryCol] || "Uncategorized" : "Uncategorized",
        date: dateCol >= 0 ? cells[dateCol] || new Date().toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        time: timeCol >= 0 ? cells[timeCol] || "12:00" : "12:00",
        lat: latCol >= 0 ? parseFloat(cells[latCol]) : 18.5204,
        lng: lngCol >= 0 ? parseFloat(cells[lngCol]) : 73.8567,
        quantity: qtyCol >= 0 ? parseInt(cells[qtyCol]) || 1 : 1,
      };
    })
    .filter((r) => r.product.length > 0);
}

// ──────────────────────────────────────────────
// GET /api/demand/heatmap
// ──────────────────────────────────────────────

/**
 * @openapi
 * /api/demand/heatmap:
 *   get:
 *     summary: Get demand events as heatmap points [lat, lng, intensity]
 *     tags: [Demand]
 *     parameters:
 *       - name: days
 *         in: query
 *         schema: { type: integer, default: 30 }
 *         description: Number of days to look back
 *     responses:
 *       200:
 *         description: Array of [lat, lng, intensity] points
 */
router.get("/demand/heatmap", async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const events = await DemandEvent.find(
      { date: { $gte: since } },
      { "location.coordinates": 1, quantity: 1, _id: 0 }
    ).lean();

    const points = events.map((e) => [
      e.location.coordinates[1], // lat
      e.location.coordinates[0], // lng
      Math.min(e.quantity / 10, 1), // normalized intensity 0-1
    ]);

    res.json({ points, count: points.length });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch heatmap data", error: String(err) });
  }
});

// ──────────────────────────────────────────────
// GET /api/demand/forecast
// ──────────────────────────────────────────────

/**
 * @openapi
 * /api/demand/forecast:
 *   get:
 *     summary: Demand forecasting — top products, peak hours, hotspots
 *     tags: [Demand]
 *     parameters:
 *       - name: days
 *         in: query
 *         schema: { type: integer, default: 30 }
 *     responses:
 *       200:
 *         description: Forecasting insights
 */
router.get("/demand/forecast", async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Top products by total quantity
    const topProducts = await DemandEvent.aggregate([
      { $match: { date: { $gte: since } } },
      {
        $group: {
          _id: "$product",
          totalQty: { $sum: "$quantity" },
          category: { $first: "$category" },
          eventCount: { $sum: 1 },
        },
      },
      { $sort: { totalQty: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          product: "$_id",
          totalQty: 1,
          category: 1,
          eventCount: 1,
        },
      },
    ]);

    // Peak hours distribution
    const peakHours = await DemandEvent.aggregate([
      { $match: { date: { $gte: since } } },
      {
        $addFields: {
          hour: { $toInt: { $substr: ["$time", 0, 2] } },
        },
      },
      {
        $group: {
          _id: "$hour",
          totalQty: { $sum: "$quantity" },
          eventCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          hour: "$_id",
          totalQty: 1,
          eventCount: 1,
        },
      },
    ]);

    // Day-of-week patterns
    const dayOfWeek = await DemandEvent.aggregate([
      { $match: { date: { $gte: since } } },
      {
        $group: {
          _id: { $dayOfWeek: "$date" }, // 1=Sun, 7=Sat
          totalQty: { $sum: "$quantity" },
          eventCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          day: "$_id",
          totalQty: 1,
          eventCount: 1,
        },
      },
    ]);

    // Trend: compare last half vs first half of the period
    const midpoint = new Date(since);
    midpoint.setDate(midpoint.getDate() + Math.floor(days / 2));

    const [firstHalf, secondHalf] = await Promise.all([
      DemandEvent.aggregate([
        { $match: { date: { $gte: since, $lt: midpoint } } },
        { $group: { _id: null, total: { $sum: "$quantity" } } },
      ]),
      DemandEvent.aggregate([
        { $match: { date: { $gte: midpoint } } },
        { $group: { _id: null, total: { $sum: "$quantity" } } },
      ]),
    ]);

    const firstTotal = firstHalf[0]?.total || 0;
    const secondTotal = secondHalf[0]?.total || 0;
    const trendPct =
      firstTotal > 0
        ? ((secondTotal - firstTotal) / firstTotal) * 100
        : 0;

    // Category breakdown
    const categoryBreakdown = await DemandEvent.aggregate([
      { $match: { date: { $gte: since } } },
      {
        $group: {
          _id: "$category",
          totalQty: { $sum: "$quantity" },
          eventCount: { $sum: 1 },
        },
      },
      { $sort: { totalQty: -1 } },
      {
        $project: {
          _id: 0,
          category: "$_id",
          totalQty: 1,
          eventCount: 1,
        },
      },
    ]);

    res.json({
      topProducts,
      peakHours,
      dayOfWeek,
      trend: {
        direction: trendPct >= 0 ? "up" : "down",
        percentage: Math.abs(Math.round(trendPct)),
        firstHalfTotal: firstTotal,
        secondHalfTotal: secondTotal,
      },
      categoryBreakdown,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to generate forecast", error: String(err) });
  }
});

// ──────────────────────────────────────────────
// GET /api/demand/stats
// ──────────────────────────────────────────────

/**
 * @openapi
 * /api/demand/stats:
 *   get:
 *     summary: Summary stats — total events, date range, top products
 *     tags: [Demand]
 *     responses:
 *       200:
 *         description: Demand statistics
 */
router.get("/demand/stats", async (_req: Request, res: Response) => {
  try {
    const totalEvents = await DemandEvent.countDocuments();

    if (totalEvents === 0) {
      return res.json({
        totalEvents: 0,
        dateRange: null,
        topProducts: [],
        totalQuantity: 0,
        sources: [],
      });
    }

    const [dateRange] = await DemandEvent.aggregate([
      {
        $group: {
          _id: null,
          earliest: { $min: "$date" },
          latest: { $max: "$date" },
          totalQuantity: { $sum: "$quantity" },
        },
      },
    ]);

    const topProducts = await DemandEvent.aggregate([
      {
        $group: {
          _id: "$product",
          totalQty: { $sum: "$quantity" },
        },
      },
      { $sort: { totalQty: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, product: "$_id", totalQty: 1 } },
    ]);

    const sources = await DemandEvent.aggregate([
      { $group: { _id: "$source", count: { $sum: 1 } } },
      { $project: { _id: 0, source: "$_id", count: 1 } },
    ]);

    res.json({
      totalEvents,
      dateRange: {
        earliest: dateRange.earliest,
        latest: dateRange.latest,
      },
      totalQuantity: dateRange.totalQuantity,
      topProducts,
      sources,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch stats", error: String(err) });
  }
});

// ──────────────────────────────────────────────
// GET /api/demand/area-stats
// ──────────────────────────────────────────────

/**
 * @openapi
 * /api/demand/area-stats:
 *   get:
 *     summary: Stats for a specific area — most ordered item, categories, avg spending
 *     tags: [Demand]
 *     parameters:
 *       - name: lat
 *         in: query
 *         required: true
 *         schema: { type: number }
 *       - name: lng
 *         in: query
 *         required: true
 *         schema: { type: number }
 *       - name: radius
 *         in: query
 *         schema: { type: integer, default: 500 }
 *         description: Radius in meters
 *     responses:
 *       200:
 *         description: Area demand statistics
 */
router.get("/demand/area-stats", async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radius = parseInt(req.query.radius as string) || 500;

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ message: "lat and lng are required" });
    }

    const geoFilter = {
      location: {
        $nearSphere: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: radius,
        },
      },
    };

    const events = await DemandEvent.find(geoFilter).lean();

    if (events.length === 0) {
      return res.json({ found: false, eventCount: 0 });
    }

    // Top products
    const productMap: Record<string, { qty: number; revenue: number; count: number }> = {};
    const categoryMap: Record<string, { qty: number; revenue: number; count: number }> = {};
    let totalRevenue = 0;
    let totalQty = 0;

    for (const e of events) {
      const p = productMap[e.product] || { qty: 0, revenue: 0, count: 0 };
      p.qty += e.quantity;
      p.revenue += e.price || 0;
      p.count += 1;
      productMap[e.product] = p;

      const c = categoryMap[e.category] || { qty: 0, revenue: 0, count: 0 };
      c.qty += e.quantity;
      c.revenue += e.price || 0;
      c.count += 1;
      categoryMap[e.category] = c;

      totalRevenue += e.price || 0;
      totalQty += e.quantity;
    }

    const topProducts = Object.entries(productMap)
      .sort((a, b) => b[1].qty - a[1].qty)
      .slice(0, 5)
      .map(([name, d]) => ({ product: name, qty: d.qty, revenue: d.revenue, orders: d.count }));

    const topCategories = Object.entries(categoryMap)
      .sort((a, b) => b[1].qty - a[1].qty)
      .slice(0, 5)
      .map(([name, d]) => ({ category: name, qty: d.qty, revenue: d.revenue, orders: d.count }));

    const avgSpending = totalRevenue / events.length;

    // Peak hour for this area
    const hourMap: Record<number, number> = {};
    for (const e of events) {
      const h = parseInt(e.time.split(":")[0]) || 0;
      hourMap[h] = (hourMap[h] || 0) + e.quantity;
    }
    const peakHour = Object.entries(hourMap).sort((a, b) => Number(b[1]) - Number(a[1]))[0];

    res.json({
      found: true,
      eventCount: events.length,
      totalQty,
      totalRevenue: Math.round(totalRevenue),
      avgSpending: Math.round(avgSpending),
      avgOrderQty: Math.round((totalQty / events.length) * 10) / 10,
      topProducts,
      topCategories,
      peakHour: peakHour ? { hour: parseInt(peakHour[0]), qty: peakHour[1] } : null,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch area stats", error: String(err) });
  }
});

export default router;
