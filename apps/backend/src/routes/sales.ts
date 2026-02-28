import { Router, Request, Response } from "express";
import { Sale } from "../models/Sale.js";
import { Product } from "../models/Product.js";
import { generateBillNumber } from "../lib/billNumber.js";

const router = Router();

/**
 * @openapi
 * /api/sales:
 *   post:
 *     summary: Create a new sale / generate bill
 *     tags: [Sales]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items]
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId: { type: string }
 *                     quantity: { type: integer }
 *               taxRate: { type: number }
 *               discount: { type: number }
 *               paymentMethod: { type: string }
 *               customerName: { type: string }
 *               customerPhone: { type: string }
 *               notes: { type: string }
 *     responses:
 *       201:
 *         description: Sale created
 *       400:
 *         description: Validation error
 */
router.post("/sales", async (req: Request, res: Response) => {
  try {
    const { items, taxRate = 0, discount = 0, paymentMethod = "cash", customerName = "", customerPhone = "", notes = "" } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "At least one item is required" });
    }

    // Validate products and check stock
    const saleItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ message: `Product not found: ${item.productId}` });
      }
      if (!product.isActive) {
        return res.status(400).json({ message: `Product is inactive: ${product.name}` });
      }
      if (product.quantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}`,
        });
      }

      const lineTotal = product.price * item.quantity;
      subtotal += lineTotal;
      saleItems.push({
        product: product._id,
        productName: product.name,
        sku: product.sku,
        quantity: item.quantity,
        unitPrice: product.price,
        total: lineTotal,
      });
    }

    const tax = subtotal * (taxRate / 100);
    const grandTotal = subtotal + tax - discount;
    const billNumber = await generateBillNumber();

    // Decrement stock for all items
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { quantity: -item.quantity },
      });
    }

    const sale = new Sale({
      billNumber,
      items: saleItems,
      subtotal,
      tax,
      taxRate,
      discount,
      grandTotal,
      paymentMethod,
      paymentStatus: "paid",
      customerName,
      customerPhone,
      notes,
    });

    await sale.save();
    res.status(201).json(sale);
  } catch (err) {
    res.status(500).json({ message: "Failed to create sale", error: String(err) });
  }
});

/**
 * @openapi
 * /api/sales:
 *   get:
 *     summary: List sales with pagination
 *     tags: [Sales]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Paginated sales list
 */
router.get("/sales", async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const from = req.query.from as string;
    const to = req.query.to as string;

    const filter: Record<string, unknown> = {};
    if (from || to) {
      filter.createdAt = {};
      if (from) (filter.createdAt as Record<string, unknown>).$gte = new Date(from);
      if (to) (filter.createdAt as Record<string, unknown>).$lte = new Date(to + "T23:59:59.999Z");
    }

    const [sales, total] = await Promise.all([
      Sale.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Sale.countDocuments(filter),
    ]);

    res.json({
      sales,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch sales", error: String(err) });
  }
});

/**
 * @openapi
 * /api/sales/summary:
 *   get:
 *     summary: Get sales summary
 *     tags: [Sales]
 *     responses:
 *       200:
 *         description: Sales summary with today, week, month totals
 */
router.get("/sales/summary", async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todaySales, weekSales, monthSales, totalSales] = await Promise.all([
      Sale.aggregate([
        { $match: { createdAt: { $gte: todayStart } } },
        { $group: { _id: null, total: { $sum: "$grandTotal" }, count: { $sum: 1 } } },
      ]),
      Sale.aggregate([
        { $match: { createdAt: { $gte: weekStart } } },
        { $group: { _id: null, total: { $sum: "$grandTotal" }, count: { $sum: 1 } } },
      ]),
      Sale.aggregate([
        { $match: { createdAt: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: "$grandTotal" }, count: { $sum: 1 } } },
      ]),
      Sale.aggregate([
        { $group: { _id: null, total: { $sum: "$grandTotal" }, count: { $sum: 1 } } },
      ]),
    ]);

    res.json({
      today: todaySales[0] || { total: 0, count: 0 },
      week: weekSales[0] || { total: 0, count: 0 },
      month: monthSales[0] || { total: 0, count: 0 },
      allTime: totalSales[0] || { total: 0, count: 0 },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch summary", error: String(err) });
  }
});

/**
 * @openapi
 * /api/sales/{id}:
 *   get:
 *     summary: Get a single sale
 *     tags: [Sales]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Sale details
 *       404:
 *         description: Sale not found
 */
router.get("/sales/:id", async (req: Request, res: Response) => {
  try {
    const sale = await Sale.findById(req.params.id).lean();
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }
    res.json(sale);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch sale", error: String(err) });
  }
});

export default router;
