import { Sale } from "../models/Sale.js";

export async function generateBillNumber(): Promise<string> {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const prefix = `BILL-${today}-`;
  const lastBill = await Sale.findOne(
    { billNumber: { $regex: `^${prefix}` } },
    { billNumber: 1 },
    { sort: { billNumber: -1 } }
  );
  const seq = lastBill
    ? parseInt(lastBill.billNumber.split("-").pop()!) + 1
    : 1;
  return `${prefix}${String(seq).padStart(4, "0")}`;
}
