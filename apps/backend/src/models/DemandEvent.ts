import mongoose, { Schema, Document } from "mongoose";

export interface IDemandEvent extends Document {
  product: string;
  category: string;
  date: Date;
  time: string; // HH:mm format
  location: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  quantity: number;
  price: number;
  source: string; // "csv_upload" | "seed" | "manual"
  createdAt: Date;
  updatedAt: Date;
}

const demandEventSchema = new Schema<IDemandEvent>(
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

demandEventSchema.index({ location: "2dsphere" });
demandEventSchema.index({ date: -1, product: 1 });

export const DemandEvent = mongoose.model<IDemandEvent>(
  "DemandEvent",
  demandEventSchema
);
