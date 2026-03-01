import { z } from "zod";
import { Product, Sale, DemandEvent } from "../lib/db.js";

export const restockTools = {
  create_restock_suggestion: {
    description:
      "Generate intelligent restock suggestions based on current stock levels, sales velocity, and demand patterns. Optionally filter by category.",
    inputSchema: z.object({
      category: z
        .string()
        .optional()
        .describe("Filter suggestions by product category"),
    }),
    handler: async (args: { category?: string }) => {
      const filter: Record<string, unknown> = { isActive: true };
      if (args.category) {
        filter.category = { $regex: args.category, $options: "i" };
      }

      const products = await Product.find(filter)
        .select("name sku category quantity unit lowStockThreshold price costPrice")
        .lean();

      // Get sales velocity (last 30 days)
      const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const salesVelocity = await Sale.aggregate([
        { $match: { createdAt: { $gte: since30d } } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.sku",
            totalSold: { $sum: "$items.quantity" },
          },
        },
      ]);

      // Get demand data (last 7 days)
      const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const demandData = await DemandEvent.aggregate([
        { $match: { date: { $gte: since7d } } },
        {
          $group: {
            _id: "$product",
            weeklyDemand: { $sum: "$quantity" },
          },
        },
      ]);

      const velocityMap = new Map(
        salesVelocity.map((v) => [v._id, v.totalSold])
      );
      const demandMap = new Map(
        demandData.map((d) => [d._id, d.weeklyDemand])
      );

      const suggestions = products
        .map((p) => {
          const monthlySales = velocityMap.get(p.sku) ?? 0;
          const dailyRate = monthlySales / 30;
          const weeklyDemand = demandMap.get(p.name) ?? 0;
          const daysOfStock = dailyRate > 0 ? Math.round(p.quantity / dailyRate) : 999;
          const isLowStock = p.quantity <= p.lowStockThreshold;
          const isOutOfStock = p.quantity === 0;

          // Suggest restock quantity: enough for 30 days minus current stock
          const targetStock = Math.ceil(dailyRate * 30);
          const suggestedQty = Math.max(targetStock - p.quantity, 0);
          const estimatedCost = suggestedQty * p.costPrice;

          let urgency: "critical" | "high" | "medium" | "low" = "low";
          if (isOutOfStock) urgency = "critical";
          else if (isLowStock && dailyRate > 0) urgency = "high";
          else if (daysOfStock < 14) urgency = "medium";

          return {
            product: p.name,
            sku: p.sku,
            category: p.category,
            currentStock: p.quantity,
            unit: p.unit,
            threshold: p.lowStockThreshold,
            monthlySalesVelocity: monthlySales,
            weeklyDemand,
            daysOfStockRemaining: daysOfStock,
            suggestedRestockQty: suggestedQty,
            estimatedCost: Math.round(estimatedCost),
            urgency,
          };
        })
        .filter((s) => s.urgency !== "low" || s.suggestedRestockQty > 0)
        .sort((a, b) => {
          const order = { critical: 0, high: 1, medium: 2, low: 3 };
          return order[a.urgency] - order[b.urgency];
        });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                totalSuggestions: suggestions.length,
                totalEstimatedCost: suggestions.reduce(
                  (s, x) => s + x.estimatedCost,
                  0
                ),
                suggestions,
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },
};
