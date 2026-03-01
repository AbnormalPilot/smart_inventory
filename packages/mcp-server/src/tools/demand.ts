import { z } from "zod";
import { DemandEvent, Product } from "../lib/db.js";

export const demandTools = {
  get_demand_forecast: {
    description:
      "Get recent demand event summary grouped by product. Shows which products have the highest demand in the given time period.",
    inputSchema: z.object({
      product: z
        .string()
        .optional()
        .describe("Filter by product name (partial match)"),
      days: z
        .number()
        .optional()
        .default(7)
        .describe("Number of days to look back (default: 7)"),
    }),
    handler: async (args: { product?: string; days?: number }) => {
      const days = args.days ?? 7;
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const match: Record<string, unknown> = { date: { $gte: since } };
      if (args.product) {
        match.product = { $regex: args.product, $options: "i" };
      }

      const demand = await DemandEvent.aggregate([
        { $match: match },
        {
          $group: {
            _id: { product: "$product", category: "$category" },
            totalQty: { $sum: "$quantity" },
            eventCount: { $sum: 1 },
            avgQtyPerEvent: { $avg: "$quantity" },
          },
        },
        { $sort: { totalQty: -1 } },
        { $limit: 20 },
      ]);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                period: `Last ${days} days`,
                totalEvents: demand.reduce((s, d) => s + d.eventCount, 0),
                products: demand.map((d) => ({
                  product: d._id.product,
                  category: d._id.category,
                  totalDemand: d.totalQty,
                  events: d.eventCount,
                  avgPerEvent: Math.round(d.avgQtyPerEvent * 10) / 10,
                })),
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  get_low_stock_alerts: {
    description:
      "Get all products that are at or below their low stock threshold. These products need restocking.",
    inputSchema: z.object({}),
    handler: async () => {
      const products = await Product.find({
        isActive: true,
        $expr: { $lte: ["$quantity", "$lowStockThreshold"] },
      })
        .select("name sku category quantity unit lowStockThreshold price")
        .sort({ quantity: 1 })
        .lean();

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                alertCount: products.length,
                products: products.map((p) => ({
                  name: p.name,
                  sku: p.sku,
                  category: p.category,
                  currentStock: p.quantity,
                  unit: p.unit,
                  threshold: p.lowStockThreshold,
                  deficit: p.lowStockThreshold - p.quantity,
                  unitPrice: p.price,
                })),
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
