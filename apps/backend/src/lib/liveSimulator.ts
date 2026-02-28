import { Server } from "socket.io";
import { DemandEvent } from "../models/DemandEvent.js";

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

const HOTSPOTS = [
  { lat: 18.5308, lng: 73.8474 }, // Shivajinagar
  { lat: 18.5074, lng: 73.8077 }, // Kothrud
  { lat: 18.5602, lng: 73.7796 }, // Hinjewadi
  { lat: 18.4883, lng: 73.8131 }, // Sinhagad Rd
  { lat: 18.5362, lng: 73.8959 }, // Koregaon Park
  { lat: 18.4721, lng: 73.8602 }, // Katraj
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomHour(): number {
  const r = Math.random();
  if (r < 0.25) return randomInt(7, 9);
  if (r < 0.55) return randomInt(18, 21);
  if (r < 0.75) return randomInt(11, 14);
  return randomInt(10, 22);
}

function randomPointNear(
  lat: number,
  lng: number,
  radiusKm: number
): { lat: number; lng: number } {
  const r = radiusKm / 111.32;
  const angle = Math.random() * 2 * Math.PI;
  const dist = Math.random() * r;
  return {
    lat: lat + dist * Math.cos(angle),
    lng: lng + dist * Math.sin(angle),
  };
}

export function startLiveSimulator(io: Server): void {
  console.log("  Live simulator started");

  setInterval(async () => {
    const count = randomInt(1, 3);
    const events: Array<{
      lat: number;
      lng: number;
      intensity: number;
      product: string;
      category: string;
      quantity: number;
      time: string;
    }> = [];

    const now = new Date();
    const hour = randomHour();
    const minute = randomInt(0, 59);
    const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

    for (let i = 0; i < count; i++) {
      const product = PRODUCTS[randomInt(0, PRODUCTS.length - 1)];
      const quantity = randomInt(1, 15);

      let point: { lat: number; lng: number };
      if (Math.random() < 0.7) {
        const hotspot = HOTSPOTS[randomInt(0, HOTSPOTS.length - 1)];
        point = randomPointNear(hotspot.lat, hotspot.lng, 0.8);
      } else {
        point = randomPointNear(18.5204, 73.8567, 5);
      }

      // Save to MongoDB
      try {
        await DemandEvent.create({
          product: product.name,
          category: product.category,
          date: now,
          time,
          location: {
            type: "Point",
            coordinates: [point.lng, point.lat],
          },
          quantity,
          source: "live",
        });
      } catch {
        // silently skip DB errors
      }

      events.push({
        lat: point.lat,
        lng: point.lng,
        intensity: Math.min(quantity / 15, 1),
        product: product.name,
        category: product.category,
        quantity,
        time,
      });
    }

    io.emit("demand:new-events", events);
  }, 3000);
}
