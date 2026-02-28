/**
 * One-time script to transform the Kaggle demand-forecasting dataset
 * into DemandEvent documents mapped to north-of-Pune-airport locations.
 *
 * Run: npx tsx apps/backend/src/lib/transformKaggle.ts
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

// ─── Pune Airport: 18.5822, 73.9197 — all stores NORTH of airport ───
const STORE_LOCATIONS: Record<number, { lat: number; lng: number; name: string }> = {
  // Lohegaon cluster (directly north of airport)
  1:  { lat: 18.5955, lng: 73.9120, name: "Lohegaon Main Road" },
  2:  { lat: 18.6020, lng: 73.9180, name: "Lohegaon North" },
  3:  { lat: 18.6080, lng: 73.9050, name: "Lohegaon West" },
  // Dhanori cluster (northwest of airport)
  4:  { lat: 18.5920, lng: 73.8960, name: "Dhanori Chowk" },
  5:  { lat: 18.5980, lng: 73.8880, name: "Dhanori North" },
  // Vishrantwadi (west of airport)
  6:  { lat: 18.5750, lng: 73.8850, name: "Vishrantwadi" },
  // Viman Nagar (south-west of airport, still close)
  7:  { lat: 18.5680, lng: 73.9140, name: "Viman Nagar Hub" },
  8:  { lat: 18.5720, lng: 73.9250, name: "Viman Nagar East" },
  // Wadgaon Sheri / Kharadi (east/southeast)
  9:  { lat: 18.5580, lng: 73.9350, name: "Kharadi IT Park" },
  10: { lat: 18.5520, lng: 73.9280, name: "Wadgaon Sheri" },
};

// ─── 80 daily-use quick commerce products with realistic prices (INR) ───
const ITEM_MAP: Record<number, { product: string; category: string; price: number }> = {
  // Dairy & Breakfast (1-12)
  1:  { product: "Amul Toned Milk 500ml", category: "Dairy", price: 27 },
  2:  { product: "Amul Gold Full Cream 1L", category: "Dairy", price: 68 },
  3:  { product: "Mother Dairy Curd 400g", category: "Dairy", price: 35 },
  4:  { product: "Amul Fresh Paneer 200g", category: "Dairy", price: 80 },
  5:  { product: "Amul Butter 100g", category: "Dairy", price: 56 },
  6:  { product: "Amul Cheese Slices 5-pack", category: "Dairy", price: 120 },
  7:  { product: "Britannia White Bread", category: "Bakery", price: 40 },
  8:  { product: "English Oven Brown Bread", category: "Bakery", price: 55 },
  9:  { product: "Pav Buns 8-pack", category: "Bakery", price: 30 },
  10: { product: "Eggs (6 pack)", category: "Eggs", price: 42 },
  11: { product: "Eggs (12 pack)", category: "Eggs", price: 78 },
  12: { product: "Amul Taaza Milk 1L", category: "Dairy", price: 54 },

  // Fruits (13-18)
  13: { product: "Banana (1 dozen)", category: "Fruits", price: 50 },
  14: { product: "Apple Shimla 1kg", category: "Fruits", price: 160 },
  15: { product: "Papaya 1kg", category: "Fruits", price: 45 },
  16: { product: "Pomegranate 500g", category: "Fruits", price: 120 },
  17: { product: "Mosambi (Sweet Lime) 1kg", category: "Fruits", price: 80 },
  18: { product: "Watermelon 1 piece", category: "Fruits", price: 60 },

  // Vegetables (19-30)
  19: { product: "Onion 1kg", category: "Vegetables", price: 35 },
  20: { product: "Tomato 1kg", category: "Vegetables", price: 30 },
  21: { product: "Potato 1kg", category: "Vegetables", price: 28 },
  22: { product: "Green Chilli 250g", category: "Vegetables", price: 15 },
  23: { product: "Coriander Bunch", category: "Vegetables", price: 10 },
  24: { product: "Capsicum 500g", category: "Vegetables", price: 40 },
  25: { product: "Cucumber 500g", category: "Vegetables", price: 25 },
  26: { product: "Lady Finger 500g", category: "Vegetables", price: 30 },
  27: { product: "Spinach Bunch", category: "Vegetables", price: 20 },
  28: { product: "Carrot 500g", category: "Vegetables", price: 30 },
  29: { product: "Ginger 100g", category: "Vegetables", price: 15 },
  30: { product: "Garlic 200g", category: "Vegetables", price: 25 },

  // Beverages (31-40)
  31: { product: "Coca Cola 750ml", category: "Beverages", price: 38 },
  32: { product: "Thumbs Up 2L", category: "Beverages", price: 87 },
  33: { product: "Pepsi 750ml", category: "Beverages", price: 38 },
  34: { product: "Appy Fizz 250ml", category: "Beverages", price: 25 },
  35: { product: "Real Mango Juice 1L", category: "Beverages", price: 99 },
  36: { product: "Bisleri Water 1L", category: "Beverages", price: 20 },
  37: { product: "Paper Boat Aam Panna", category: "Beverages", price: 30 },
  38: { product: "Red Bull 250ml", category: "Beverages", price: 125 },
  39: { product: "Tropicana Orange 1L", category: "Beverages", price: 99 },
  40: { product: "Sprite 750ml", category: "Beverages", price: 38 },

  // Snacks (41-52)
  41: { product: "Lays Classic 52g", category: "Snacks", price: 20 },
  42: { product: "Kurkure Masala Munch", category: "Snacks", price: 20 },
  43: { product: "Haldiram Aloo Bhujia 200g", category: "Snacks", price: 65 },
  44: { product: "Dark Fantasy Choco 75g", category: "Snacks", price: 40 },
  45: { product: "Parle-G Gold 100g", category: "Snacks", price: 25 },
  46: { product: "Oreo Original 120g", category: "Snacks", price: 30 },
  47: { product: "Bingo Mad Angles 66g", category: "Snacks", price: 20 },
  48: { product: "Hide & Seek Bourbon", category: "Snacks", price: 35 },
  49: { product: "Haldiram Namkeen Mixture 200g", category: "Snacks", price: 55 },
  50: { product: "Act II Popcorn Butter", category: "Snacks", price: 30 },

  // Instant Food (51-56) — offset to avoid key overlap
  51: { product: "Maggi 2-Min Masala 4-pack", category: "Instant Food", price: 56 },
  52: { product: "Yippee Noodles Magic Masala", category: "Instant Food", price: 14 },
  53: { product: "Cup Noodles Mazedaar Masala", category: "Instant Food", price: 45 },
  54: { product: "MTR Ready-to-Eat Poha", category: "Instant Food", price: 65 },
  55: { product: "Knorr Tomato Soup", category: "Instant Food", price: 40 },
  56: { product: "Top Ramen Curry Noodles", category: "Instant Food", price: 14 },

  // Staples & Cooking (57-66)
  57: { product: "Aashirvaad Atta 5kg", category: "Staples", price: 275 },
  58: { product: "Fortune Sunflower Oil 1L", category: "Staples", price: 130 },
  59: { product: "Toor Dal 1kg", category: "Staples", price: 140 },
  60: { product: "India Gate Basmati Rice 1kg", category: "Staples", price: 120 },
  61: { product: "Sugar 1kg", category: "Staples", price: 45 },
  62: { product: "Tata Salt 1kg", category: "Staples", price: 28 },
  63: { product: "MDH Garam Masala 50g", category: "Staples", price: 55 },
  64: { product: "Everest Turmeric 100g", category: "Staples", price: 38 },
  65: { product: "Saffola Gold Oil 1L", category: "Staples", price: 175 },
  66: { product: "Besan (Gram Flour) 500g", category: "Staples", price: 55 },

  // Household (67-74)
  67: { product: "Surf Excel Easy Wash 1kg", category: "Household", price: 120 },
  68: { product: "Vim Dishwash Bar 200g", category: "Household", price: 28 },
  69: { product: "Harpic Toilet Cleaner 500ml", category: "Household", price: 85 },
  70: { product: "Lizol Floor Cleaner 500ml", category: "Household", price: 95 },
  71: { product: "Garbage Bags 30-pack", category: "Household", price: 99 },
  72: { product: "Scotch-Brite Scrub Pad 3-pack", category: "Household", price: 45 },
  73: { product: "Hit Cockroach Spray 200ml", category: "Household", price: 145 },
  74: { product: "Fresho Paper Napkins 100-pack", category: "Household", price: 40 },

  // Personal Care (75-82)
  75: { product: "Colgate MaxFresh 80g", category: "Personal Care", price: 65 },
  76: { product: "Dove Soap 100g", category: "Personal Care", price: 52 },
  77: { product: "Head & Shoulders 180ml", category: "Personal Care", price: 189 },
  78: { product: "Dettol Handwash 200ml", category: "Personal Care", price: 55 },
  79: { product: "Nivea Body Lotion 200ml", category: "Personal Care", price: 175 },
  80: { product: "Gillette Guard Razor", category: "Personal Care", price: 45 },

  // Baby & Pet (81-84) — high frequency in quick commerce
  81: { product: "Pampers Diapers S 10-pack", category: "Baby Care", price: 199 },
  82: { product: "Cerelac Wheat 300g", category: "Baby Care", price: 225 },
  83: { product: "Pedigree Adult Dog Food 400g", category: "Pet Care", price: 80 },
  84: { product: "Whiskas Cat Food Pouch 85g", category: "Pet Care", price: 30 },
};

const TOTAL_ITEMS = Object.keys(ITEM_MAP).length;

// ─── Helpers ───────────────────────────────────────────────────
function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randomTime(): string {
  let hour: number;
  const r = Math.random();
  if (r < 0.25) hour = Math.floor(randomBetween(7, 10));       // morning peak
  else if (r < 0.55) hour = Math.floor(randomBetween(18, 22));  // evening peak
  else if (r < 0.72) hour = Math.floor(randomBetween(11, 14));  // lunch
  else if (r < 0.85) hour = Math.floor(randomBetween(14, 18));  // afternoon
  else hour = Math.floor(randomBetween(6, 23));                  // rest
  const minute = Math.floor(Math.random() * 60);
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function jitter(base: number, radiusKm: number = 0.35): number {
  const offset = (radiusKm / 111.32) * (Math.random() * 2 - 1);
  return base + offset;
}

// ─── Main ──────────────────────────────────────────────────────
async function main() {
  const uri =
    process.env.MONGODB_URI || "mongodb://localhost:27017/smart_inventory";
  await mongoose.connect(uri);
  console.log("Connected to MongoDB:", mongoose.connection.name);

  const deleted = await DemandEvent.deleteMany({});
  console.log(`Cleared ${deleted.deletedCount} existing demand events.`);

  const trainPath = "/tmp/demand-kaggle/train.csv";
  if (!fs.existsSync(trainPath)) {
    console.error("train.csv not found. Run: unzip demand-forecasting-kernels-only.zip -d /tmp/demand-kaggle");
    process.exit(1);
  }

  const raw = fs.readFileSync(trainPath, "utf-8");
  const lines = raw.split("\n").filter((l) => l.trim());
  const dataLines = lines.slice(1);

  console.log(`Total CSV rows: ${dataLines.length}`);

  // Take last 90 days of dataset for a wider spread
  const cutoffDate = "2017-10-01";
  const recentLines = dataLines.filter((line) => line.split(",")[0] >= cutoffDate);
  console.log(`Rows after ${cutoffDate}: ${recentLines.length}`);

  // Sample 2500 events
  const TARGET = 2500;
  const sampled: string[] = [];
  for (let i = 0; i < recentLines.length; i++) {
    if (sampled.length < TARGET) {
      sampled.push(recentLines[i]);
    } else {
      const j = Math.floor(Math.random() * (i + 1));
      if (j < TARGET) sampled[j] = recentLines[i];
    }
  }

  console.log(`Sampled ${sampled.length} events for import.`);

  const now = new Date();
  const datasetStart = new Date("2017-10-01").getTime();
  const datasetEnd = new Date("2017-12-31").getTime();
  const datasetSpan = datasetEnd - datasetStart;

  const docs = sampled.map((line) => {
    const [dateStr, storeStr, itemStr, salesStr] = line.split(",");
    const store = parseInt(storeStr) || 1;
    const sales = parseInt(salesStr) || 1;
    const rawItem = parseInt(itemStr) || 1;

    // Map date to last 30 days
    const origDate = new Date(dateStr).getTime();
    const ratio = Math.min(1, Math.max(0, (origDate - datasetStart) / datasetSpan));
    const mappedDate = new Date(now.getTime() - (1 - ratio) * 30 * 24 * 60 * 60 * 1000);
    mappedDate.setHours(0, 0, 0, 0);

    // Spread kaggle items across full 84-product catalog
    const hash = (rawItem * 17 + store * 31 + mappedDate.getDate() * 7) % TOTAL_ITEMS;
    const item = hash + 1;

    const loc = STORE_LOCATIONS[store] || STORE_LOCATIONS[1];
    const lat = jitter(loc.lat, 0.35);
    const lng = jitter(loc.lng, 0.35);

    const productInfo = ITEM_MAP[item] || { product: `Product #${item}`, category: "Other", price: 50 };

    return {
      product: productInfo.product,
      category: productInfo.category,
      date: mappedDate,
      time: randomTime(),
      location: {
        type: "Point" as const,
        coordinates: [lng, lat] as [number, number],
      },
      quantity: sales,
      price: productInfo.price * sales,
      source: "kaggle_import",
    };
  });

  // Bulk insert
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

  const categories = await DemandEvent.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 }, totalQty: { $sum: "$quantity" } } },
    { $sort: { totalQty: -1 } },
  ]);
  console.log("\nCategory breakdown:");
  for (const c of categories) {
    console.log(`  ${c._id}: ${c.count} events, ${c.totalQty} units`);
  }

  const topProducts = await DemandEvent.aggregate([
    { $group: { _id: "$product", totalQty: { $sum: "$quantity" } } },
    { $sort: { totalQty: -1 } },
    { $limit: 10 },
  ]);
  console.log("\nTop 10 products:");
  for (const p of topProducts) {
    console.log(`  ${p._id}: ${p.totalQty} units`);
  }

  await mongoose.disconnect();
  console.log("\nImport complete.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
