import { DemandEvent } from "../models/DemandEvent.js";

// Pune center: 18.5204, 73.8567
const PUNE_CENTER = { lat: 18.5204, lng: 73.8567 };

const PRODUCTS: { name: string; category: string }[] = [
  { name: "Toned Milk 500ml", category: "Dairy" },
  { name: "Curd 400g", category: "Dairy" },
  { name: "Paneer 200g", category: "Dairy" },
  { name: "White Bread", category: "Bakery" },
  { name: "Brown Bread", category: "Bakery" },
  { name: "Eggs (6 pack)", category: "Eggs & Meat" },
  { name: "Eggs (12 pack)", category: "Eggs & Meat" },
  { name: "Banana (1 dozen)", category: "Fruits" },
  { name: "Apple (1 kg)", category: "Fruits" },
  { name: "Onion (1 kg)", category: "Vegetables" },
  { name: "Tomato (1 kg)", category: "Vegetables" },
  { name: "Potato (1 kg)", category: "Vegetables" },
  { name: "Coca Cola 750ml", category: "Beverages" },
  { name: "Pepsi 750ml", category: "Beverages" },
  { name: "Appy Fizz 250ml", category: "Beverages" },
  { name: "Lays Classic 52g", category: "Snacks" },
  { name: "Kurkure Masala", category: "Snacks" },
  { name: "Maggi Noodles 4-pack", category: "Instant Food" },
  { name: "Aashirvaad Atta 5kg", category: "Staples" },
  { name: "Fortune Oil 1L", category: "Staples" },
  { name: "Amul Butter 100g", category: "Dairy" },
  { name: "Haldiram Namkeen 200g", category: "Snacks" },
  { name: "Surf Excel 1kg", category: "Household" },
  { name: "Vim Bar", category: "Household" },
  { name: "Colgate Toothpaste 100g", category: "Personal Care" },
];

// Hotspot clusters around Pune (dark store / high-demand zones)
const HOTSPOTS = [
  { lat: 18.5308, lng: 73.8474, weight: 1.5 }, // Shivajinagar
  { lat: 18.5074, lng: 73.8077, weight: 1.3 }, // Kothrud
  { lat: 18.5602, lng: 73.7796, weight: 1.2 }, // Hinjewadi
  { lat: 18.4883, lng: 73.8131, weight: 1.0 }, // Sinhagad Rd
  { lat: 18.5362, lng: 73.8959, weight: 1.1 }, // Koregaon Park
  { lat: 18.4721, lng: 73.8602, weight: 0.9 }, // Katraj
];

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomInt(min: number, max: number): number {
  return Math.floor(randomBetween(min, max + 1));
}

// Weighted hour distribution — peaks at morning (7-9) and evening (6-9)
function randomHour(): number {
  const r = Math.random();
  if (r < 0.25) return randomInt(7, 9);   // morning peak
  if (r < 0.55) return randomInt(18, 21);  // evening peak
  if (r < 0.75) return randomInt(11, 14);  // lunch
  return randomInt(10, 22);                // general hours
}

function randomPointNear(
  lat: number,
  lng: number,
  radiusKm: number
): { lat: number; lng: number } {
  const r = radiusKm / 111.32; // rough degree offset
  const angle = Math.random() * 2 * Math.PI;
  const dist = Math.random() * r;
  return {
    lat: lat + dist * Math.cos(angle),
    lng: lng + dist * Math.sin(angle),
  };
}

export async function seedDemandEvents(): Promise<void> {
  const count = await DemandEvent.countDocuments();
  if (count > 0) {
    console.log(
      `  Demand events already seeded (${count} docs). Skipping.`
    );
    return;
  }

  const events: Array<{
    product: string;
    category: string;
    date: Date;
    time: string;
    location: { type: "Point"; coordinates: [number, number] };
    quantity: number;
    source: string;
  }> = [];

  const now = new Date();

  for (let i = 0; i < 200; i++) {
    const product = PRODUCTS[randomInt(0, PRODUCTS.length - 1)];
    const daysAgo = randomInt(0, 29);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(0, 0, 0, 0);

    const hour = randomHour();
    const minute = randomInt(0, 59);
    const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

    // Pick a hotspot or random Pune location
    let point: { lat: number; lng: number };
    if (Math.random() < 0.7) {
      const hotspot = HOTSPOTS[randomInt(0, HOTSPOTS.length - 1)];
      point = randomPointNear(hotspot.lat, hotspot.lng, 0.8);
    } else {
      point = randomPointNear(PUNE_CENTER.lat, PUNE_CENTER.lng, 5);
    }

    events.push({
      product: product.name,
      category: product.category,
      date,
      time,
      location: {
        type: "Point",
        coordinates: [point.lng, point.lat], // GeoJSON: [lng, lat]
      },
      quantity: randomInt(1, 15),
      source: "seed",
    });
  }

  await DemandEvent.insertMany(events);
  console.log(`  Seeded ${events.length} demand events around Pune.`);
}
