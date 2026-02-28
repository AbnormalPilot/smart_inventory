import { Router, Request, Response } from "express";
import { Sale } from "../models/Sale.js";
import { Product } from "../models/Product.js";

const router = Router();

/**
 * @openapi
 * /api/analytics/overview:
 *   get:
 *     summary: Dashboard overview metrics
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Overview with revenue, sales count, avg order value
 */
router.get("/analytics/overview", async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [revenueData, todayData, productCount, lowStockCount, inventoryValue] =
      await Promise.all([
        Sale.aggregate([
          { $match: { createdAt: { $gte: thirtyDaysAgo } } },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$grandTotal" },
              salesCount: { $sum: 1 },
              avgOrder: { $avg: "$grandTotal" },
            },
          },
        ]),
        Sale.aggregate([
          { $match: { createdAt: { $gte: todayStart } } },
          { $group: { _id: null, total: { $sum: "$grandTotal" }, count: { $sum: 1 } } },
        ]),
        Product.countDocuments({ isActive: true }),
        Product.countDocuments({
          isActive: true,
          $expr: { $lte: ["$quantity", "$lowStockThreshold"] },
        }),
        Product.aggregate([
          { $match: { isActive: true } },
          { $group: { _id: null, value: { $sum: { $multiply: ["$costPrice", "$quantity"] } } } },
        ]),
      ]);

    res.json({
      totalRevenue: revenueData[0]?.totalRevenue || 0,
      salesCount: revenueData[0]?.salesCount || 0,
      avgOrderValue: revenueData[0]?.avgOrder || 0,
      todayRevenue: todayData[0]?.total || 0,
      todaySalesCount: todayData[0]?.count || 0,
      totalProducts: productCount,
      lowStockCount,
      inventoryValue: inventoryValue[0]?.value || 0,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch overview", error: String(err) });
  }
});

/**
 * @openapi
 * /api/analytics/sales-trend:
 *   get:
 *     summary: Daily sales data for chart
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: days
 *         schema: { type: integer, default: 30 }
 *     responses:
 *       200:
 *         description: Array of daily sales data
 */
router.get("/analytics/sales-trend", async (req: Request, res: Response) => {
  try {
    const days = Math.min(365, Math.max(1, parseInt(req.query.days as string) || 30));
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const data = await Sale.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          revenue: { $sum: "$grandTotal" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", revenue: 1, count: 1 } },
    ]);

    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch sales trend", error: String(err) });
  }
});

/**
 * @openapi
 * /api/analytics/category-breakdown:
 *   get:
 *     summary: Revenue by product category
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Category breakdown for pie chart
 */
router.get("/analytics/category-breakdown", async (_req: Request, res: Response) => {
  try {
    const data = await Sale.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: { path: "$productInfo", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$productInfo.category",
          revenue: { $sum: "$items.total" },
          quantity: { $sum: "$items.quantity" },
        },
      },
      { $sort: { revenue: -1 } },
      { $project: { _id: 0, category: { $ifNull: ["$_id", "Unknown"] }, revenue: 1, quantity: 1 } },
    ]);

    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch category breakdown", error: String(err) });
  }
});

/**
 * @openapi
 * /api/analytics/top-products:
 *   get:
 *     summary: Top selling products
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Top products by revenue
 */
router.get("/analytics/top-products", async (req: Request, res: Response) => {
  try {
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));

    const data = await Sale.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          name: { $first: "$items.productName" },
          sku: { $first: "$items.sku" },
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.total" },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          productId: "$_id",
          name: 1,
          sku: 1,
          totalQuantity: 1,
          totalRevenue: 1,
        },
      },
    ]);

    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch top products", error: String(err) });
  }
});

/**
 * @openapi
 * /api/analytics/inventory-value:
 *   get:
 *     summary: Total inventory value
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Inventory value breakdown
 */
router.get("/analytics/inventory-value", async (_req: Request, res: Response) => {
  try {
    const data = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$category",
          totalCostValue: { $sum: { $multiply: ["$costPrice", "$quantity"] } },
          totalRetailValue: { $sum: { $multiply: ["$price", "$quantity"] } },
          productCount: { $sum: 1 },
          totalUnits: { $sum: "$quantity" },
        },
      },
      { $sort: { totalRetailValue: -1 } },
      {
        $project: {
          _id: 0,
          category: "$_id",
          totalCostValue: 1,
          totalRetailValue: 1,
          productCount: 1,
          totalUnits: 1,
        },
      },
    ]);

    const totals = data.reduce(
      (acc, d) => ({
        costValue: acc.costValue + d.totalCostValue,
        retailValue: acc.retailValue + d.totalRetailValue,
        products: acc.products + d.productCount,
        units: acc.units + d.totalUnits,
      }),
      { costValue: 0, retailValue: 0, products: 0, units: 0 }
    );

    res.json({ categories: data, totals });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch inventory value", error: String(err) });
  }
});

export default router;
