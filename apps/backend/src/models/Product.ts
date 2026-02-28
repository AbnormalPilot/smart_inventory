import { Schema, model, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  sku: string;
  category: string;
  description: string;
  price: number;
  costPrice: number;
  quantity: number;
  unit: string;
  lowStockThreshold: number;
  imageUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
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

productSchema.index({ category: 1 });
productSchema.index({ name: "text", sku: "text" });

export const Product = model<IProduct>("Product", productSchema);
