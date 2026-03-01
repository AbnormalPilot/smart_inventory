# Smart Inventory - AI Dhanda Operating System

**An AI-powered retail intelligence platform that tracks live sales, forecasts SKU-level demand with Chronos-2, visualizes geospatial demand heatmaps, and generates intelligent inventory reorder recommendations for small and medium businesses.**

**Live:** [smartinventory.felon.in](https://smartinventory.felon.in) | **Dashboard:** [dashboard.smartinventory.felon.in](https://dashboard.smartinventory.felon.in) | **API Docs:** [api.smartinventory.felon.in/api/docs](https://api.smartinventory.felon.in/api/docs)

---

## Problem Statement

### AI-Powered Inventory Demand Forecasting & Retail Intelligence System

Accurate demand forecasting is critical for inventory optimization. Overstocking increases holding costs and capital blockage, while understocking leads to missed sales and dissatisfied customers.

Most small and medium businesses rely on manual methods, spreadsheets, or guesswork. These approaches fail to account for seasonality, demand trends, volatility, forecast uncertainty, and risk of stockouts.

### Target Users

- Kirana stores & small retail shops
- FMCG distributors & D2C sellers
- Small wholesalers & dark stores

### Existing Gaps

- No affordable AI-based forecasting tool for SMEs
- No risk-aware reorder recommendations with confidence intervals
- No geospatial demand visualization
- No real-time demand event tracking
- No integrated AI planning assistant

---

## Solution Overview

Smart Inventory AI is a full-stack web application that combines:

- **Chronos-2 AI forecasting engine** for time-series demand prediction
- **Real-time demand heatmaps** with geospatial analytics
- **Live sales tracking** with Socket.IO real-time updates
- **POS billing system** with automatic stock management
- **AI chat assistant** powered by OpenRouter LLM
- **Risk-based inventory optimization** with confidence intervals

---

## Key Features

### AI-Powered Demand Forecasting (Chronos-2)

- **Amazon Chronos-2 T5-Small model** running on FastAPI for time-series forecasting
- SKU-level, category-level, and system-wide demand predictions
- Configurable forecast horizon: 7, 14, or 30 days ahead
- Confidence intervals with upper/lower prediction bounds
- Tomorrow's demand prediction with peak hours and trending products
- Stock shortage risk alerts with priority classification (Critical/High/Warning)
- Batch forecasting for multiple products simultaneously

### Interactive Demand Heatmaps

- Real-time geospatial demand visualization on Leaflet maps
- Heatmap mode with color-coded intensity (blue to red gradient)
- Radius mode with adjustable range (1-30+ km) for area-based analysis
- Live pulse markers for incoming demand events via Socket.IO
- Time-of-day and date range filtering
- Area statistics showing top products, categories, and peak hours for any location
- CSV upload with AI-powered data structuring for demand events

### AI Chat Assistant

- Conversational assistant powered by OpenRouter LLM with streaming responses
- Real-time token streaming via WebSocket for instant feedback
- Context-aware answers using live inventory, sales, and analytics data
- CSV file analysis with automated insights, warnings, and recommendations
- Dynamic suggestion buttons for follow-up queries

### Real-Time Dashboard Intelligence

- AI-generated rotating headlines (insights, alerts, trends, tips) via Socket.IO
- Tomorrow's demand prediction card with trend direction and top products
- AI forecast chart with interactive 7/14/30-day horizon selection
- Stock shortage risk panel with restock recommendations
- Seasonal demand analysis with monthly revenue and order trends
- Live trending products with sales momentum tracking
- KPI cards: total revenue, sales today, total products, low stock alerts

### Inventory Management

- Full product CRUD with SKU, category, pricing, cost price, and stock tracking
- Configurable low-stock thresholds with automatic alerts
- Stock adjustment with reason tracking and history
- Category-based organization, filtering, and search
- Soft delete with active/inactive status

### Billing & Point of Sale

- Shopping cart with product search, quantity adjustment, and real-time totals
- Tax rate configuration with automatic calculation
- Fixed discount support with total impact display
- Auto-generated bill numbers (BILL-YYYYMMDD-XXXX)
- Automatic stock deduction on bill creation
- Payment method tracking (Cash, Card, UPI, Other)
- Customer information capture (name, phone)
- Bill preview and recent bills history with pagination

### Analytics & Reporting

- Daily sales trend chart with revenue and order count overlay (7D/30D/90D)
- Category revenue breakdown (pie chart)
- Top-selling products ranking with progress bars
- Inventory valuation by category
- Sales summary: today, weekly, monthly, and all-time totals
- Seasonal demand analysis by month
- Recent sales transaction table

### Profile & Settings

- Business information management
- Dark/Light/System theme support
- Appearance preferences

---

## Architecture

```
smart-inventory/
├── apps/
│   ├── landing/          # Next.js 16 — Marketing site (Tailwind v4, Three.js)
│   ├── dashboard/        # Next.js 15 — Main application (Tailwind v3, Recharts, Leaflet)
│   ├── backend/          # Express 4 + TypeScript — REST API + WebSocket server
│   └── ai-engine/        # Python FastAPI — Chronos-2 forecasting model
├── packages/
│   └── mcp-server/       # MCP server for AI tool integrations
├── turbo.json            # Turborepo task configuration
├── docker-compose.yml    # Multi-service Docker deployment
└── package.json          # Root workspace config (npm workspaces)
```

### System Flow

```
User → Next.js Dashboard → Express API + Socket.IO → MongoDB Atlas
                                    ↓
                          Chronos-2 AI Engine (FastAPI)
                                    ↓
                    Demand Forecasts + Confidence Intervals
```

1. User interacts with the Next.js 15 dashboard
2. Frontend communicates with Express backend via REST API and Socket.IO WebSocket
3. Backend processes inventory, sales, analytics via MongoDB aggregation pipelines
4. AI engine (Chronos-2) generates demand forecasts from historical sales time-series
5. OpenRouter LLM powers the chat assistant with live inventory context
6. Real-time demand events stream to maps and dashboard via Socket.IO
7. AI recommendations generated from stock levels, sales trends, and forecasts

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Landing Page** | Next.js 16, React 19, Tailwind CSS v4, Three.js, Framer Motion |
| **Dashboard** | Next.js 15, React 19, Tailwind CSS v3, shadcn/ui, Recharts, Leaflet |
| **Backend** | Node.js 22, Express 4, TypeScript, Socket.IO, Mongoose |
| **AI Engine** | Python 3.13, FastAPI, Amazon Chronos-2 (T5-Small), PyTorch |
| **Database** | MongoDB Atlas |
| **LLM** | OpenRouter API (AI chat assistant, CSV analysis) |
| **Real-Time** | Socket.IO (demand events, AI headlines, forecast insights) |
| **Maps** | Leaflet + leaflet.heat (heatmaps, radius view, live pulses) |
| **Deployment** | Docker, Docker Compose, Dokploy, Traefik |
| **Monorepo** | Turborepo v2 + npm workspaces |
| **API Docs** | Swagger/OpenAPI 3.0 (auto-generated) |

---

## Database Design

### Product Schema

| Field | Type | Description |
|-------|------|-------------|
| name | String | Product name |
| sku | String | Unique product code |
| category | String | Product category |
| price | Number | Selling price |
| costPrice | Number | Purchase/cost price |
| quantity | Number | Current stock level |
| unit | String | Unit of measurement (pcs, kg, etc.) |
| lowStockThreshold | Number | Alert threshold |
| isActive | Boolean | Soft delete flag |

### Sale Schema

| Field | Type | Description |
|-------|------|-------------|
| billNumber | String | Auto-generated (BILL-YYYYMMDD-XXXX) |
| items | Array | Product references with quantities |
| subtotal | Number | Pre-tax total |
| tax / taxRate | Number | Tax amount and rate |
| discount | Number | Applied discount |
| grandTotal | Number | Final amount |
| paymentMethod | Enum | cash, card, upi, other |
| customerName | String | Optional customer info |

### DemandEvent Schema

| Field | Type | Description |
|-------|------|-------------|
| product | String | Product name |
| category | String | Product category |
| quantity | Number | Demand quantity |
| location | GeoJSON | { type: "Point", coordinates: [lng, lat] } |
| time | Date | Event timestamp |
| source | String | Origin (csv, simulation, manual) |

---

## API Documentation

Full Swagger docs available at `/api/docs` on the backend URL.

### Products API (8 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/products` | List products (paginated, searchable, filterable) |
| `POST` | `/api/products` | Create new product |
| `GET` | `/api/products/:id` | Get single product |
| `PUT` | `/api/products/:id` | Update product |
| `DELETE` | `/api/products/:id` | Soft delete product |
| `PATCH` | `/api/products/:id/stock` | Adjust stock quantity |
| `GET` | `/api/products/categories` | Get distinct categories |
| `GET` | `/api/products/low-stock` | Get products below threshold |

### Sales API (4 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/sales` | Create sale with auto stock deduction |
| `GET` | `/api/sales` | List sales (paginated, date filterable) |
| `GET` | `/api/sales/:id` | Get single sale details |
| `GET` | `/api/sales/summary` | Today/week/month/all-time totals |

### Analytics API (5 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/analytics/overview` | Dashboard KPI metrics |
| `GET` | `/api/analytics/sales-trend` | Daily sales data for charts |
| `GET` | `/api/analytics/category-breakdown` | Revenue by category |
| `GET` | `/api/analytics/top-products` | Top selling products |
| `GET` | `/api/analytics/inventory-value` | Inventory value by category |

### Demand & Geolocation API (5 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/demand/upload-csv` | CSV upload with AI structuring |
| `GET` | `/api/demand/heatmap` | Demand points for map visualization |
| `GET` | `/api/demand/forecast` | Top products, peak hours, trends |
| `GET` | `/api/demand/stats` | Total events, date range, top products |
| `GET` | `/api/demand/area-stats` | Location-based demand analytics |

### AI API (4 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/ai/recommendations` | AI restocking recommendations |
| `POST` | `/api/ai/chat` | AI assistant chat |
| `POST` | `/api/ai/analyze-csv` | Upload & analyze CSV data |
| `GET` | `/api/ai/seasonal-analysis` | Seasonal sales analysis |

### AI Forecasting API (6 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ai-forecast/product` | Single product forecast |
| `POST` | `/api/ai-forecast/category` | Category forecast |
| `POST` | `/api/ai-forecast/overall` | System-wide forecast |
| `POST` | `/api/ai-forecast/batch` | Multiple products forecast |
| `GET` | `/api/ai-forecast/products` | Forecastable products list |
| `GET` | `/api/ai-forecast/categories` | Forecastable categories list |

---

## Getting Started

### Prerequisites

- Node.js 22+
- Python 3.13+ (for AI engine)
- MongoDB Atlas cluster
- OpenRouter API key ([get one free](https://openrouter.ai/keys))

### Local Development

```bash
# Clone and install
git clone <repo-url>
cd smart-inventory
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and OpenRouter API key

# Start all services via Turborepo
npm run dev
```

| Service | URL |
|---------|-----|
| Landing Page | http://localhost:3000 |
| Dashboard | http://localhost:3001 |
| Backend API | http://localhost:7020 |
| Swagger Docs | http://localhost:7020/api/docs |
| API Status | http://localhost:7020/api/status |

### Docker Deployment

```bash
# Build and run all services
docker compose up --build
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB Atlas connection string | Yes |
| `OPENROUTER_API_KEY` | OpenRouter API key for AI chat/CSV analysis | Yes |
| `NEXT_PUBLIC_DASHBOARD_URL` | Dashboard URL (build-time, for landing links) | Production |
| `NEXT_PUBLIC_BACKEND_URL` | Backend URL (build-time, for client-side API/WebSocket) | Production |
| `BACKEND_URL` | Backend internal URL (build-time, for Next.js rewrites) | Docker |
| `AI_ENGINE_URL` | AI engine URL (auto-configured in Docker) | Docker |

---

## Production Deployment

Deployed on **Dokploy** with Traefik reverse proxy and Let's Encrypt HTTPS.

| Service | Domain | Port |
|---------|--------|------|
| Landing | [smartinventory.felon.in](https://smartinventory.felon.in) | 3000 |
| Dashboard | [dashboard.smartinventory.felon.in](https://dashboard.smartinventory.felon.in) | 3001 |
| Backend API | [api.smartinventory.felon.in](https://api.smartinventory.felon.in) | 7020 |
| AI Engine | Internal only | 8000 |

---

## End-to-End Workflow

1. User adds products via Inventory page or uploads CSV
2. Sales created through POS billing system
3. Stock automatically decremented on each sale
4. Analytics engine aggregates sales data via MongoDB pipelines
5. Chronos-2 AI engine forecasts demand from historical time-series
6. Dashboard displays KPIs, charts, forecasts, and risk alerts
7. Demand events visualized on real-time geospatial heatmaps
8. AI assistant provides natural language insights via streaming chat
9. Recommendations generated: restock, trending, seasonal, out-of-stock

---

## Impact

- Reduced stockouts through proactive AI-powered alerts
- Reduced overstock via demand-aware forecasting with confidence intervals
- Geospatial demand intelligence for location-based stocking decisions
- Real-time operational visibility with live dashboard updates
- Data-driven decision-making accessible to SMEs with zero data science expertise
- Scalable architecture: monorepo, Docker, and managed cloud deployment

---

_Built with Turborepo, Next.js, Express.js, MongoDB, Chronos-2, and Socket.IO._
