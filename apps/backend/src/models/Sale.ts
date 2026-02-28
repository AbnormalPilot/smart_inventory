import { Schema, model, Document, Types } from "mongoose";

export interface ISaleItem {
  product: Types.ObjectId;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ISale extends Document {
  billNumber: string;
  items: ISaleItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  discount: number;
  grandTotal: number;
  paymentMethod: "cash" | "card" | "upi" | "other";
  paymentStatus: "paid" | "pending" | "partial";
  customerName: string;
  customerPhone: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const saleItemSchema = new Schema<ISaleItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    sku: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const saleSchema = new Schema<ISale>(
  {
    billNumber: { type: String, required: true, unique: true },
    items: {
      type: [saleItemSchema],
      required: true,
      validate: [
        (v: ISaleItem[]) => v.length > 0,
        "At least one item required",
      ],
    },
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true, default: 0 },
    taxRate: { type: Number, required: true, default: 0 },
    discount: { type: Number, required: true, default: 0 },
    grandTotal: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "upi", "other"],
      default: "cash",
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "pending", "partial"],
      default: "paid",
    },
    customerName: { type: String, default: "" },
    customerPhone: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

saleSchema.index({ createdAt: -1 });

export const Sale = model<ISale>("Sale", saleSchema);
