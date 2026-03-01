import { Router, Request, Response } from "express";
import { Product } from "../models/Product.js";

const router = Router();

/**
 * @openapi
 * /api/products:
 *   get:
 *     summary: List all products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: lowStock
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Paginated product list
 */
router.get("/products", async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const search = (req.query.search as string) || "";
    const category = (req.query.category as string) || "";
    const lowStock = req.query.lowStock === "true";

    const filter: Record<string, unknown> = { isActive: true };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ];
    }
    if (category) {
      filter.category = category;
    }

    if (lowStock) {
      // Use aggregate to avoid Mongoose $expr cast bug
      const matchStage: Record<string, unknown> = {
        ...filter,
        $expr: { $lte: ["$quantity", "$lowStockThreshold"] },
      };
      const [productsResult, countResult] = await Promise.all([
        Product.aggregate([
          { $match: matchStage },
          { $sort: { updatedAt: -1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit },
        ]),
        Product.aggregate([
          { $match: matchStage },
          { $count: "n" },
        ]),
      ]);
      const products = productsResult;
      const total = countResult[0]?.n ?? 0;

      return res.json({
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products", error: String(err) });
  }
});

/**
 * @openapi
 * /api/products/categories:
 *   get:
 *     summary: Get distinct product categories
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get("/products/categories", async (_req: Request, res: Response) => {
  try {
    const categories = await Product.distinct("category", { isActive: true });
    res.json({ categories: categories.sort() });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch categories", error: String(err) });
  }
});

/**
 * @openapi
 * /api/products/low-stock:
 *   get:
 *     summary: Get products with low stock
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Products below threshold
 */
router.get("/products/low-stock", async (_req: Request, res: Response) => {
  try {
    const products = await Product.aggregate([
      { $match: { isActive: true, $expr: { $lte: ["$quantity", "$lowStockThreshold"] } } },
      { $sort: { quantity: 1 } },
    ]);
    res.json({ products, count: products.length });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch low stock products", error: String(err) });
  }
});

/**
 * @openapi
 * /api/products/{id}:
 *   get:
 *     summary: Get a single product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 */
router.get("/products/:id", async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch product", error: String(err) });
  }
});

/**
 * @openapi
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, sku, category, price, costPrice]
 *             properties:
 *               name: { type: string }
 *               sku: { type: string }
 *               category: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               costPrice: { type: number }
 *               quantity: { type: integer }
 *               unit: { type: string }
 *               lowStockThreshold: { type: integer }
 *     responses:
 *       201:
 *         description: Product created
 *       400:
 *         description: Validation error
 */
router.post("/products", async (req: Request, res: Response) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "A product with this SKU already exists" });
    }
    res.status(400).json({ message: "Failed to create product", error: String(err) });
  }
});

/**
 * @openapi
 * /api/products/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Product updated
 *       404:
 *         description: Product not found
 */
router.put("/products/:id", async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "A product with this SKU already exists" });
    }
    res.status(400).json({ message: "Failed to update product", error: String(err) });
  }
});

/**
 * @openapi
 * /api/products/{id}:
 *   delete:
 *     summary: Soft delete a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product deactivated
 *       404:
 *         description: Product not found
 */
router.delete("/products/:id", async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deactivated", product });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete product", error: String(err) });
  }
});

/**
 * @openapi
 * /api/products/{id}/stock:
 *   patch:
 *     summary: Adjust product stock
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [adjustment]
 *             properties:
 *               adjustment: { type: integer }
 *               reason: { type: string }
 *     responses:
 *       200:
 *         description: Stock updated
 */
router.patch("/products/:id/stock", async (req: Request, res: Response) => {
  try {
    const { adjustment } = req.body;
    if (typeof adjustment !== "number") {
      return res.status(400).json({ message: "adjustment must be a number" });
    }
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const newQty = product.quantity + adjustment;
    if (newQty < 0) {
      return res.status(400).json({ message: "Insufficient stock" });
    }
    product.quantity = newQty;
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Failed to adjust stock", error: String(err) });
  }
});

export default router;
