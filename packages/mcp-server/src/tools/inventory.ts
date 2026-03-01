import { z } from "zod";
import { Product } from "../lib/db.js";

export const inventoryTools = {
  get_inventory_status: {
    description:
      "Get overall inventory status including total products, total stock quantity, inventory value, and count of low-stock items.",
    inputSchema: z.object({}),
    handler: async () => {
      const [stats, lowStockCount, totalProducts] = await Promise.all([
        Product.aggregate([
          { $match: { isActive: true } },
          {
            $group: {
              _id: null,
              totalQty: { $sum: "$quantity" },
              totalRetailValue: { $sum: { $multiply: ["$price", "$quantity"] } },
              totalCostValue: { $sum: { $multiply: ["$costPrice", "$quantity"] } },
            },
          },
        ]),
        Product.countDocuments({
          isActive: true,
          $expr: { $lte: ["$quantity", "$lowStockThreshold"] },
        }),
        Product.countDocuments({ isActive: true }),
      ]);

      const s = stats[0] || { totalQty: 0, totalRetailValue: 0, totalCostValue: 0 };

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                totalProducts,
                totalStockQuantity: s.totalQty,
                totalRetailValue: Math.round(s.totalRetailValue),
                totalCostValue: Math.round(s.totalCostValue),
                potentialProfit: Math.round(s.totalRetailValue - s.totalCostValue),
                lowStockItems: lowStockCount,
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  get_product_details: {
    description:
      "Get detailed information about a specific product by SKU or name.",
    inputSchema: z.object({
      sku: z.string().optional().describe("Product SKU to look up"),
      name: z.string().optional().describe("Product name to search for"),
    }),
    handler: async (args: { sku?: string; name?: string }) => {
      let product;
      if (args.sku) {
        product = await Product.findOne({ sku: args.sku }).lean();
      } else if (args.name) {
        product = await Product.findOne({
          name: { $regex: args.name, $options: "i" },
        }).lean();
      } else {
        return {
          content: [{ type: "text" as const, text: "Please provide either sku or name." }],
        };
      }

      if (!product) {
        return {
          content: [{ type: "text" as const, text: "Product not found." }],
        };
      }

      return {
        content: [
          { type: "text" as const, text: JSON.stringify(product, null, 2) },
        ],
      };
    },
  },

  search_products: {
    description:
      "Search products by name or category. Returns matching products with stock info.",
    inputSchema: z.object({
      query: z.string().describe("Search text for product name"),
      category: z.string().optional().describe("Filter by category"),
    }),
    handler: async (args: { query: string; category?: string }) => {
      const filter: Record<string, unknown> = {
        isActive: true,
        name: { $regex: args.query, $options: "i" },
      };
      if (args.category) {
        filter.category = { $regex: args.category, $options: "i" };
      }

      const products = await Product.find(filter)
        .select("name sku category price quantity unit lowStockThreshold")
        .limit(20)
        .lean();

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              { count: products.length, products },
              null,
              2
            ),
          },
        ],
      };
    },
  },
};
