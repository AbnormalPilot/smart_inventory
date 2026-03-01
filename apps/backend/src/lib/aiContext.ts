import { Product } from "../models/Product.js";
import { Sale } from "../models/Sale.js";
import { DemandEvent } from "../models/DemandEvent.js";

/**
 * Gather current inventory context from MongoDB for AI system prompt injection.
 */
export async function gatherContext(): Promise<string> {
  const [
    lowStock,
    topSelling,
    inventoryStats,
    demandCount,
    totalProducts,
  ] = await Promise.all([
    // Top 10 low-stock products (quantity <= lowStockThreshold)
    Product.find({
      isActive: true,
      $expr: { $lte: ["$quantity", "$lowStockThreshold"] },
    })
      .sort({ quantity: 1 })
      .limit(10)
      .lean(),

    // Top 5 best-selling products (last 30 days)
    Sale.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productName",
          totalQty: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.total" },
        },
      },
      { $sort: { totalQty: -1 } },
      { $limit: 5 },
    ]),

    // Total inventory value
    Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ["$price", "$quantity"] } },
          totalCost: { $sum: { $multiply: ["$costPrice", "$quantity"] } },
          totalQty: { $sum: "$quantity" },
        },
      },
    ]),

    // Recent demand events (last 24h)
    DemandEvent.countDocuments({
      date: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    }),

    // Total active products
    Product.countDocuments({ isActive: true }),
  ]);

  const stats = inventoryStats[0] || {
    totalValue: 0,
    totalCost: 0,
    totalQty: 0,
  };

  const lines: string[] = [
    `## Current Inventory Snapshot`,
    `- Total active products: ${totalProducts}`,
    `- Total stock quantity: ${stats.totalQty}`,
    `- Total inventory value (retail): ₹${Math.round(stats.totalValue).toLocaleString("en-IN")}`,
    `- Total inventory cost: ₹${Math.round(stats.totalCost).toLocaleString("en-IN")}`,
    `- Demand events in last 24h: ${demandCount}`,
    "",
  ];

  if (lowStock.length > 0) {
    lines.push(`## Low Stock Alerts (${lowStock.length} items)`);
    for (const p of lowStock) {
      lines.push(
        `- ${p.name} (${p.sku}): ${p.quantity} ${p.unit} remaining (threshold: ${p.lowStockThreshold})`
      );
    }
    lines.push("");
  }

  if (topSelling.length > 0) {
    lines.push(`## Top Selling Products (Last 30 Days)`);
    for (const s of topSelling) {
      lines.push(
        `- ${s._id}: ${s.totalQty} units sold, ₹${Math.round(s.totalRevenue).toLocaleString("en-IN")} revenue`
      );
    }
    lines.push("");
  }

  return lines.join("\n");
}
