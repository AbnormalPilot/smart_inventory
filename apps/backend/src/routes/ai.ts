import { Router, Request, Response } from "express";
import { Product } from "../models/Product.js";
import { Sale } from "../models/Sale.js";
import { upload } from "../middleware/upload.js";

const router = Router();

/**
 * @openapi
 * /api/ai/recommendations:
 *   get:
 *     summary: Get AI inventory recommendations
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: AI-generated recommendations
 */
router.get("/ai/recommendations", async (_req: Request, res: Response) => {
  try {
    const recommendations: Array<{
      type: string;
      title: string;
      description: string;
      priority: string;
    }> = [];

    // Low stock recommendations
    const lowStockProducts = await Product.aggregate([
      { $match: { isActive: true, $expr: { $lte: ["$quantity", "$lowStockThreshold"] } } },
      { $sort: { quantity: 1 } },
      { $limit: 5 },
    ]);

    for (const p of lowStockProducts) {
      recommendations.push({
        type: "restock",
        title: `Restock: ${p.name}`,
        description: `Only ${p.quantity} ${p.unit} left (threshold: ${p.lowStockThreshold}). Consider ordering more soon.`,
        priority: p.quantity === 0 ? "high" : "medium",
      });
    }

    // Top selling products (trending)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const topSelling = await Sale.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          name: { $first: "$items.productName" },
          totalQty: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.total" },
        },
      },
      { $sort: { totalQty: -1 } },
      { $limit: 3 },
    ]);

    for (const p of topSelling) {
      recommendations.push({
        type: "trending",
        title: `Trending: ${p.name}`,
        description: `Sold ${p.totalQty} units (₹${p.totalRevenue.toFixed(2)} revenue) in the last 7 days. Keep stock levels high.`,
        priority: "medium",
      });
    }

    // Seasonal insights (mock)
    const month = new Date().getMonth();
    const seasons: Record<number, string> = {
      0: "New Year clearance season — consider discounting slow-moving items",
      1: "Valentine's Day — gift items may see increased demand",
      2: "Spring season approaching — refresh seasonal inventory",
      3: "Spring cleaning — home essentials tend to sell well",
      4: "Summer prep — stock cooling and outdoor products",
      5: "Mid-year review — analyze first half performance",
      6: "Summer peak — ensure popular items are well-stocked",
      7: "Back-to-school — office and school supplies in demand",
      8: "Fall season — transition seasonal inventory",
      9: "Pre-holiday — start preparing holiday inventory",
      10: "Holiday season — maximize popular product availability",
      11: "Year-end — holiday rush and clearance planning",
    };

    recommendations.push({
      type: "seasonal",
      title: "Seasonal Insight",
      description: seasons[month] || "Monitor seasonal trends for opportunities.",
      priority: "low",
    });

    // General insight if there are products
    const totalProducts = await Product.countDocuments({ isActive: true });
    if (totalProducts > 0) {
      const outOfStock = await Product.countDocuments({
        isActive: true,
        quantity: 0,
      });
      if (outOfStock > 0) {
        recommendations.push({
          type: "insight",
          title: `${outOfStock} Products Out of Stock`,
          description: "These products are losing potential sales. Prioritize restocking high-demand items.",
          priority: "high",
        });
      }
    }

    res.json({ recommendations });
  } catch (err) {
    res.status(500).json({ message: "Failed to generate recommendations", error: String(err) });
  }
});

/**
 * @openapi
 * /api/ai/chat:
 *   post:
 *     summary: Chat with AI assistant
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message: { type: string }
 *     responses:
 *       200:
 *         description: AI response
 */
router.post("/ai/chat", async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const lowerMsg = message.toLowerCase();
    let response = "";
    const suggestions: string[] = [];

    if (lowerMsg.includes("stock") || lowerMsg.includes("inventory")) {
      const totalProducts = await Product.countDocuments({ isActive: true });
      const lowStockResult = await Product.aggregate([
        { $match: { isActive: true, $expr: { $lte: ["$quantity", "$lowStockThreshold"] } } },
        { $count: "n" },
      ]);
      const lowStock = lowStockResult[0]?.n ?? 0;
      const outOfStock = await Product.countDocuments({ isActive: true, quantity: 0 });

      response = `📦 **Inventory Summary**\n\n- Total products: **${totalProducts}**\n- Low stock items: **${lowStock}**\n- Out of stock: **${outOfStock}**\n\n`;
      if (lowStock > 0) {
        const items = await Product.aggregate([
          { $match: { isActive: true, $expr: { $lte: ["$quantity", "$lowStockThreshold"] } } },
          { $limit: 5 },
        ]);
        response += "**Low stock items:**\n";
        for (const item of items) {
          response += `- ${item.name}: ${item.quantity} ${item.unit} left\n`;
        }
      }
      suggestions.push("Show sales summary", "Which products should I restock?", "Show top products");
    } else if (lowerMsg.includes("sales") || lowerMsg.includes("revenue")) {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const [todayData, monthData] = await Promise.all([
        Sale.aggregate([
          { $match: { createdAt: { $gte: todayStart } } },
          { $group: { _id: null, total: { $sum: "$grandTotal" }, count: { $sum: 1 } } },
        ]),
        Sale.aggregate([
          { $match: { createdAt: { $gte: monthStart } } },
          { $group: { _id: null, total: { $sum: "$grandTotal" }, count: { $sum: 1 } } },
        ]),
      ]);

      const today = todayData[0] || { total: 0, count: 0 };
      const month = monthData[0] || { total: 0, count: 0 };

      response = `💰 **Sales Summary**\n\n**Today:**\n- Revenue: ₹${today.total.toFixed(2)}\n- Orders: ${today.count}\n\n**This Month:**\n- Revenue: ₹${month.total.toFixed(2)}\n- Orders: ${month.count}\n- Avg order: ₹${month.count > 0 ? (month.total / month.count).toFixed(2) : "0.00"}`;
      suggestions.push("Show inventory status", "Show top products", "What should I restock?");
    } else if (lowerMsg.includes("recommend") || lowerMsg.includes("restock") || lowerMsg.includes("suggest")) {
      const lowStock = await Product.aggregate([
        { $match: { isActive: true, $expr: { $lte: ["$quantity", "$lowStockThreshold"] } } },
        { $sort: { quantity: 1 } },
        { $limit: 5 },
      ]);

      if (lowStock.length === 0) {
        response = "✅ All products are well-stocked! No immediate restocking needed.";
      } else {
        response = "🔔 **Restock Recommendations:**\n\n";
        for (const item of lowStock) {
          const suggestedQty = item.lowStockThreshold * 3;
          response += `- **${item.name}** (${item.sku}): ${item.quantity}/${item.lowStockThreshold} ${item.unit} — suggest ordering **${suggestedQty} ${item.unit}**\n`;
        }
      }
      suggestions.push("Show sales summary", "Show inventory status", "Upload CSV for analysis");
    } else if (lowerMsg.includes("help") || lowerMsg.includes("what can you do")) {
      response = `🤖 **I can help you with:**\n\n- 📦 Inventory status and stock levels\n- 💰 Sales summaries and revenue reports\n- 🔔 Restock recommendations\n- 📊 Product performance analysis\n- 📄 CSV data analysis\n\nJust ask me about any of these topics!`;
      suggestions.push("Show inventory status", "Show sales summary", "What should I restock?");
    } else {
      response = `I can help you with inventory management, sales analysis, and restocking recommendations. Try asking me about:\n\n- "Show inventory status"\n- "Sales summary"\n- "What should I restock?"\n- "Help"`;
      suggestions.push("Show inventory status", "Show sales summary", "Help");
    }

    res.json({ response, suggestions });
  } catch (err) {
    res.status(500).json({ message: "Failed to process chat", error: String(err) });
  }
});

/**
 * @openapi
 * /api/ai/analyze-csv:
 *   post:
 *     summary: Upload and analyze CSV data
 *     tags: [AI]
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
 *         description: CSV analysis results
 */
router.post("/ai/analyze-csv", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "CSV file is required" });
    }

    const content = req.file.buffer.toString("utf-8");
    const lines = content.split("\n").filter((line) => line.trim());

    if (lines.length < 2) {
      return res.status(400).json({ message: "CSV file must have a header row and at least one data row" });
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const dataRows = lines.slice(1);

    // Build basic analysis
    const summary = {
      fileName: req.file.originalname,
      totalRows: dataRows.length,
      columns: headers,
      fileSize: `${(req.file.size / 1024).toFixed(1)} KB`,
    };

    const insights: string[] = [];
    const recommendations: string[] = [];
    const warnings: string[] = [];

    // Analyze columns
    if (headers.includes("quantity") || headers.includes("stock") || headers.includes("qty")) {
      const qtyCol = headers.indexOf("quantity") !== -1 ? headers.indexOf("quantity") : headers.indexOf("stock") !== -1 ? headers.indexOf("stock") : headers.indexOf("qty");
      const quantities = dataRows.map((row) => parseFloat(row.split(",")[qtyCol]) || 0);
      const total = quantities.reduce((a, b) => a + b, 0);
      const avg = total / quantities.length;
      const lowItems = quantities.filter((q) => q < avg * 0.3).length;

      insights.push(`Average stock level: ${avg.toFixed(1)} units`);
      insights.push(`Total inventory: ${total.toFixed(0)} units across ${dataRows.length} items`);
      if (lowItems > 0) {
        warnings.push(`${lowItems} items have critically low stock (below 30% of average)`);
        recommendations.push(`Consider restocking the ${lowItems} low-stock items immediately`);
      }
    }

    if (headers.includes("price") || headers.includes("cost")) {
      const priceCol = headers.indexOf("price") !== -1 ? headers.indexOf("price") : headers.indexOf("cost");
      const prices = dataRows.map((row) => parseFloat(row.split(",")[priceCol]) || 0);
      const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
      insights.push(`Average price: ₹${avg.toFixed(2)}`);
    }

    if (headers.includes("category") || headers.includes("type")) {
      const catCol = headers.indexOf("category") !== -1 ? headers.indexOf("category") : headers.indexOf("type");
      const categories = new Set(dataRows.map((row) => row.split(",")[catCol]?.trim()));
      insights.push(`${categories.size} unique categories found`);
      recommendations.push("Consider analyzing category-level performance for better stocking decisions");
    }

    insights.push(`Dataset contains ${dataRows.length} records with ${headers.length} columns`);
    recommendations.push("Import this data into your inventory system for real-time tracking");
    recommendations.push("Set up low-stock alerts for critical items identified in this analysis");

    res.json({ summary, insights, warnings, recommendations });
  } catch (err) {
    res.status(500).json({ message: "Failed to analyze CSV", error: String(err) });
  }
});

/**
 * @openapi
 * /api/ai/seasonal-analysis:
 *   get:
 *     summary: Get seasonal sales analysis
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: Seasonal analysis data
 */
router.get("/ai/seasonal-analysis", async (_req: Request, res: Response) => {
  try {
    const data = await Sale.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$grandTotal" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          month: "$_id",
          revenue: 1,
          orders: 1,
        },
      },
    ]);

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const chartData = monthNames.map((name, i) => {
      const found = data.find((d) => d.month === i + 1);
      return {
        month: name,
        revenue: found?.revenue || 0,
        orders: found?.orders || 0,
      };
    });

    res.json({ data: chartData });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch seasonal analysis", error: String(err) });
  }
});

export default router;
