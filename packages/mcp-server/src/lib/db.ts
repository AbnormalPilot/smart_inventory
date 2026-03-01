import mongoose from "mongoose";

let connected = false;

export async function connectDB(): Promise<void> {
  if (connected) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is required");
  }

  await mongoose.connect(uri);
  connected = true;
}

// ─── Product Model ──────────────────────────────────────────
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, default: 0, min: 0 },
    unit: { type: String, required: true, default: "pcs" },
    lowStockThreshold: { type: Number, required: true, default: 10 },
    imageUrl: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

// ─── Sale Model ─────────────────────────────────────────────
const saleItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    sku: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const saleSchema = new mongoose.Schema(
  {
    billNumber: { type: String, required: true, unique: true },
    items: { type: [saleItemSchema], required: true },
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true, default: 0 },
    taxRate: { type: Number, required: true, default: 0 },
    discount: { type: Number, required: true, default: 0 },
    grandTotal: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["cash", "card", "upi", "other"], default: "cash" },
    paymentStatus: { type: String, enum: ["paid", "pending", "partial"], default: "paid" },
    customerName: { type: String, default: "" },
    customerPhone: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Sale =
  mongoose.models.Sale || mongoose.model("Sale", saleSchema);

// ─── DemandEvent Model ──────────────────────────────────────
const demandEventSchema = new mongoose.Schema(
  {
    product: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    date: { type: Date, required: true, index: true },
    time: { type: String, required: true },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, default: 0 },
    source: { type: String, required: true, default: "manual" },
  },
  { timestamps: true }
);

export const DemandEvent =
  mongoose.models.DemandEvent || mongoose.model("DemandEvent", demandEventSchema);
