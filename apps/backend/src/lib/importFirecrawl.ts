/**
 * Import Firecrawl/Blinkit product data as demand events
 * mapped near Ajeenkya DY Patil University, Pune, Lohegaon.
 *
 * Run: npx tsx apps/backend/src/lib/importFirecrawl.ts
 */
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

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
demandEventSchema.index({ location: "2dsphere" });

const DemandEvent =
  mongoose.models.DemandEvent ||
  mongoose.model("DemandEvent", demandEventSchema);

// ─── DY Patil University: 18.6298, 73.9131 ───
// Store locations clustered around the university & nearby Lohegaon area
const STORE_LOCATIONS = [
  // Right near DY Patil campus
  { lat: 18.6298, lng: 73.9131, name: "DY Patil University Gate", weight: 3 },
  { lat: 18.6320, lng: 73.9100, name: "DY Patil Hostel Area", weight: 2 },
  { lat: 18.6275, lng: 73.9165, name: "Charoli Budruk", weight: 1.5 },
  // Lohegaon residential (south of university)
  { lat: 18.6100, lng: 73.9120, name: "Lohegaon Main Road", weight: 2 },
  { lat: 18.6050, lng: 73.9180, name: "Lohegaon Market", weight: 2.5 },
  // Wagholi side (east of university)
  { lat: 18.6250, lng: 73.9350, name: "Wagholi Road", weight: 1.5 },
  { lat: 18.6180, lng: 73.9400, name: "Wagholi Main", weight: 1 },
  // Dhanori side (west of university)
  { lat: 18.6200, lng: 73.8950, name: "Dhanori", weight: 1.5 },
  { lat: 18.6100, lng: 73.8900, name: "Dhanori Gaon", weight: 1 },
  // North (towards Alandi Road)
  { lat: 18.6400, lng: 73.9080, name: "Alandi Road", weight: 1 },
  { lat: 18.6350, lng: 73.9200, name: "Sanaswadi Road", weight: 0.8 },
  // Viman Nagar (south, high demand area)
  { lat: 18.5680, lng: 73.9140, name: "Viman Nagar Hub", weight: 2 },
];

// ─── Better category mapping for Blinkit data ───
function fixCategory(blinkitCategory: string, productName: string): string {
  const nameLower = productName.toLowerCase();

  // Detect miscategorized items
  if (nameLower.includes("rolling") || nameLower.includes("crusher") ||
      nameLower.includes("grinder") || nameLower.includes("holder") ||
      nameLower.includes("tray") || nameLower.includes("stash") ||
      nameLower.includes("blaze") || nameLower.includes("bud ")) {
    return "Lifestyle";
  }
  if (nameLower.includes("candy") || nameLower.includes("papad") ||
      nameLower.includes("mouth freshener") || nameLower.includes("mukhvas")) {
    return "Munchies";
  }
  if (nameLower.includes("chips") || nameLower.includes("wafer") ||
      nameLower.includes("cracker") || nameLower.includes("namkeen") ||
      nameLower.includes("jerky") || nameLower.includes("makhana") ||
      nameLower.includes("peanut") || nameLower.includes("munchies")) {
    return "Munchies";
  }
  if (nameLower.includes("chocolate") || nameLower.includes("cacao")) {
    return "Munchies";
  }
  if (nameLower.includes("milkshake") || nameLower.includes("cold drink") ||
      nameLower.includes("cocktail") || nameLower.includes("pulp") ||
      nameLower.includes("juice")) {
    return "Beverages";
  }
  if (nameLower.includes("milk") || nameLower.includes("curd") ||
      nameLower.includes("paneer") || nameLower.includes("cheese") ||
      nameLower.includes("butter") || nameLower.includes("ghee") ||
      nameLower.includes("cream") || nameLower.includes("yogurt") ||
      nameLower.includes("lassi") || nameLower.includes("shrikhand")) {
    return "Dairy";
  }
  if (nameLower.includes("bread") || nameLower.includes("bun") ||
      nameLower.includes("cake") || nameLower.includes("muffin") ||
      nameLower.includes("croissant") || nameLower.includes("rusk")) {
    return "Bakery";
  }
  if (nameLower.includes("atta") || nameLower.includes("rice") ||
      nameLower.includes("dal") || nameLower.includes("flour") ||
      nameLower.includes("wheat") || nameLower.includes("maida") ||
      nameLower.includes("besan") || nameLower.includes("suji") ||
      nameLower.includes("poha") || nameLower.includes("rava")) {
    return "Staples";
  }
  if (nameLower.includes("noodles") || nameLower.includes("maggi") ||
      nameLower.includes("pasta") || nameLower.includes("soup") ||
      nameLower.includes("oats") || nameLower.includes("muesli") ||
      nameLower.includes("cereal") || nameLower.includes("cornflakes")) {
    return "Instant Food";
  }
  if (nameLower.includes("laddu") || nameLower.includes("barfi") ||
      nameLower.includes("sweet") || nameLower.includes("mithai")) {
    return "Munchies";
  }

  // Use Blinkit category as fallback with cleanup
  const catMap: Record<string, string> = {
    "Vegetables & Fruits": "Munchies", // mostly candies/chips in this dataset
    "Dairy & Breakfast": "Dairy",
    "Munchies": "Munchies",
    "Atta, Rice & Dal": "Staples",
  };
  return catMap[blinkitCategory] || blinkitCategory;
}

// ─── Helpers ───
function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randomTime(): string {
  let hour: number;
  const r = Math.random();
  // Student-heavy area: late morning & late night peaks
  if (r < 0.15) hour = Math.floor(randomBetween(7, 10));        // morning
  else if (r < 0.35) hour = Math.floor(randomBetween(11, 14));   // lunch rush
  else if (r < 0.55) hour = Math.floor(randomBetween(17, 20));   // evening snack
  else if (r < 0.75) hour = Math.floor(randomBetween(20, 24));   // late night (students!)
  else if (r < 0.85) hour = Math.floor(randomBetween(14, 17));   // afternoon
  else hour = Math.floor(randomBetween(0, 3));                    // midnight munchies
  const minute = Math.floor(Math.random() * 60);
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function jitter(base: number, radiusKm: number = 0.25): number {
  const offset = (radiusKm / 111.32) * (Math.random() * 2 - 1);
  return base + offset;
}

function pickWeightedStore(): (typeof STORE_LOCATIONS)[0] {
  const totalWeight = STORE_LOCATIONS.reduce((s, l) => s + l.weight, 0);
  let r = Math.random() * totalWeight;
  for (const loc of STORE_LOCATIONS) {
    r -= loc.weight;
    if (r <= 0) return loc;
  }
  return STORE_LOCATIONS[0];
}

// ─── Main ───
async function main() {
  // Read Firecrawl data
  const firecrawlPath = "/Users/himanshu/Downloads/extract-data-2026-02-28.json";
  if (!fs.existsSync(firecrawlPath)) {
    console.error("Firecrawl data not found at:", firecrawlPath);
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(firecrawlPath, "utf-8"));
  const products: Array<{
    product_name: string;
    category: string;
    pricing: { original_price?: number; discounted_price?: number };
    weight?: string;
    popularity_indicators?: { is_popular?: boolean };
  }> = raw.products;

  console.log(`Loaded ${products.length} Blinkit products from Firecrawl data.`);

  // Connect to MongoDB
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/smart_inventory";
  await mongoose.connect(uri);
  console.log("Connected to MongoDB:", mongoose.connection.name);

  // Build product catalog with fixed categories
  const catalog = products.map((p) => ({
    name: p.product_name,
    category: fixCategory(p.category, p.product_name),
    price: p.pricing.discounted_price || p.pricing.original_price || 50,
    isPopular: p.popularity_indicators?.is_popular || false,
    weight: p.weight || "",
  }));

  // Log category distribution
  const catCount: Record<string, number> = {};
  for (const c of catalog) {
    catCount[c.category] = (catCount[c.category] || 0) + 1;
  }
  console.log("\nProduct categories (after fix):");
  for (const [cat, count] of Object.entries(catCount).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count}`);
  }

  // Generate demand events — 1500 events from Firecrawl products
  const TARGET = 1500;
  const now = new Date();
  const docs = [];

  for (let i = 0; i < TARGET; i++) {
    // Pick a product — popular items get 3x weight
    let product;
    if (Math.random() < 0.4) {
      // Pick from popular items if available
      const popularItems = catalog.filter((c) => c.isPopular);
      if (popularItems.length > 0) {
        product = popularItems[Math.floor(Math.random() * popularItems.length)];
      } else {
        product = catalog[Math.floor(Math.random() * catalog.length)];
      }
    } else {
      product = catalog[Math.floor(Math.random() * catalog.length)];
    }

    // Random date in last 30 days
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    date.setHours(0, 0, 0, 0);

    // Pick a store location (weighted)
    const store = pickWeightedStore();
    const lat = jitter(store.lat, 0.25);
    const lng = jitter(store.lng, 0.25);

    // Quantity: 1-5 for most items, staples can be higher
    let quantity: number;
    if (product.category === "Staples" || product.category === "Dairy") {
      quantity = Math.ceil(Math.random() * 3);
    } else if (product.category === "Munchies" || product.category === "Beverages") {
      quantity = Math.ceil(Math.random() * 5);
    } else {
      quantity = Math.ceil(Math.random() * 4);
    }

    docs.push({
      product: product.name,
      category: product.category,
      date,
      time: randomTime(),
      location: {
        type: "Point" as const,
        coordinates: [lng, lat] as [number, number],
      },
      quantity,
      price: product.price * quantity,
      source: "firecrawl_blinkit",
    });
  }

  // Bulk insert (don't delete existing — ADD to existing data)
  const BATCH = 500;
  let inserted = 0;
  for (let i = 0; i < docs.length; i += BATCH) {
    const batch = docs.slice(i, i + BATCH);
    await DemandEvent.insertMany(batch);
    inserted += batch.length;
    console.log(`  Inserted ${inserted} / ${docs.length}`);
  }

  const totalCount = await DemandEvent.countDocuments();
  console.log(`\nDone! Total demand events in DB: ${totalCount}`);

  // Show breakdown for firecrawl data
  const fcCategories = await DemandEvent.aggregate([
    { $match: { source: "firecrawl_blinkit" } },
    { $group: { _id: "$category", count: { $sum: 1 }, totalQty: { $sum: "$quantity" }, revenue: { $sum: "$price" } } },
    { $sort: { totalQty: -1 } },
  ]);
  console.log("\nFirecrawl import — Category breakdown:");
  for (const c of fcCategories) {
    console.log(`  ${c._id}: ${c.count} events, ${c.totalQty} units, ₹${c.revenue.toLocaleString()}`);
  }

  const fcTop = await DemandEvent.aggregate([
    { $match: { source: "firecrawl_blinkit" } },
    { $group: { _id: "$product", totalQty: { $sum: "$quantity" } } },
    { $sort: { totalQty: -1 } },
    { $limit: 10 },
  ]);
  console.log("\nFirecrawl import — Top 10 products:");
  for (const p of fcTop) {
    console.log(`  ${p._id}: ${p.totalQty} units`);
  }

  // Show overall stats
  const sources = await DemandEvent.aggregate([
    { $group: { _id: "$source", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  console.log("\nAll data sources:");
  for (const s of sources) {
    console.log(`  ${s._id}: ${s.count} events`);
  }

  await mongoose.disconnect();
  console.log("\nImport complete.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
