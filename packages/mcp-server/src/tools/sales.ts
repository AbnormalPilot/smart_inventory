import { z } from "zod";
import { Sale } from "../lib/db.js";

export const salesTools = {
  get_sales_summary: {
    description:
      "Get sales summary for a given time period including total revenue, number of orders, average order value, and payment method breakdown.",
    inputSchema: z.object({
      days: z
        .number()
        .optional()
        .default(30)
        .describe("Number of days to look back (default: 30)"),
    }),
    handler: async (args: { days?: number }) => {
      const days = args.days ?? 30;
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const [summary, paymentBreakdown] = await Promise.all([
        Sale.aggregate([
          { $match: { createdAt: { $gte: since } } },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$grandTotal" },
              totalOrders: { $sum: 1 },
              avgOrderValue: { $avg: "$grandTotal" },
              totalItems: { $sum: { $size: "$items" } },
            },
          },
        ]),
        Sale.aggregate([
          { $match: { createdAt: { $gte: since } } },
          {
            $group: {
              _id: "$paymentMethod",
              count: { $sum: 1 },
              total: { $sum: "$grandTotal" },
            },
          },
          { $sort: { total: -1 } },
        ]),
      ]);

      const s = summary[0] || {
        totalRevenue: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        totalItems: 0,
      };

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                period: `Last ${days} days`,
                totalRevenue: Math.round(s.totalRevenue),
                totalOrders: s.totalOrders,
                averageOrderValue: Math.round(s.avgOrderValue),
                totalItemsSold: s.totalItems,
                paymentBreakdown: paymentBreakdown.map((p) => ({
                  method: p._id,
                  orders: p.count,
                  total: Math.round(p.total),
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

  get_top_products: {
    description:
      "Get top selling products by quantity sold in the given time period.",
    inputSchema: z.object({
      limit: z
        .number()
        .optional()
        .default(10)
        .describe("Number of top products to return (default: 10)"),
      days: z
        .number()
        .optional()
        .default(30)
        .describe("Number of days to look back (default: 30)"),
    }),
    handler: async (args: { limit?: number; days?: number }) => {
      const limit = args.limit ?? 10;
      const days = args.days ?? 30;
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const topProducts = await Sale.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productName",
            sku: { $first: "$items.sku" },
            totalQty: { $sum: "$items.quantity" },
            totalRevenue: { $sum: "$items.total" },
            orderCount: { $sum: 1 },
          },
        },
        { $sort: { totalQty: -1 } },
        { $limit: limit },
      ]);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                period: `Last ${days} days`,
                products: topProducts.map((p) => ({
                  product: p._id,
                  sku: p.sku,
                  quantitySold: p.totalQty,
                  revenue: Math.round(p.totalRevenue),
                  orders: p.orderCount,
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
