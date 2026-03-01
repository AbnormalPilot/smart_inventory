#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { connectDB } from "./lib/db.js";
import { inventoryTools } from "./tools/inventory.js";
import { salesTools } from "./tools/sales.js";
import { demandTools } from "./tools/demand.js";
import { restockTools } from "./tools/restock.js";

const server = new McpServer({
  name: "smart-inventory",
  version: "1.0.0",
});

// ─── Register inventory tools ───────────────────────────────
server.tool(
  "get_inventory_status",
  inventoryTools.get_inventory_status.description,
  inventoryTools.get_inventory_status.inputSchema.shape,
  inventoryTools.get_inventory_status.handler
);

server.tool(
  "get_product_details",
  inventoryTools.get_product_details.description,
  inventoryTools.get_product_details.inputSchema.shape,
  inventoryTools.get_product_details.handler
);

server.tool(
  "search_products",
  inventoryTools.search_products.description,
  inventoryTools.search_products.inputSchema.shape,
  inventoryTools.search_products.handler
);

// ─── Register sales tools ───────────────────────────────────
server.tool(
  "get_sales_summary",
  salesTools.get_sales_summary.description,
  salesTools.get_sales_summary.inputSchema.shape,
  salesTools.get_sales_summary.handler
);

server.tool(
  "get_top_products",
  salesTools.get_top_products.description,
  salesTools.get_top_products.inputSchema.shape,
  salesTools.get_top_products.handler
);

// ─── Register demand tools ──────────────────────────────────
server.tool(
  "get_demand_forecast",
  demandTools.get_demand_forecast.description,
  demandTools.get_demand_forecast.inputSchema.shape,
  demandTools.get_demand_forecast.handler
);

server.tool(
  "get_low_stock_alerts",
  demandTools.get_low_stock_alerts.description,
  demandTools.get_low_stock_alerts.inputSchema.shape,
  demandTools.get_low_stock_alerts.handler
);

// ─── Register restock tools ─────────────────────────────────
server.tool(
  "create_restock_suggestion",
  restockTools.create_restock_suggestion.description,
  restockTools.create_restock_suggestion.inputSchema.shape,
  restockTools.create_restock_suggestion.handler
);

// ─── Start server ───────────────────────────────────────────
async function main() {
  await connectDB();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("MCP Server failed to start:", err);
  process.exit(1);
});
