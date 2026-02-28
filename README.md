# Smart Inventory - AI Dhanda Operating System

**An AI-powered retail intelligence platform that tracks live sales, forecasts SKU-level demand, quantifies risk, and generates intelligent inventory reorder recommendations for small and medium businesses.**

---

## 1. Problem Statement

### Problem Title

AI-Powered Inventory Demand Forecasting & Retail Intelligence System

### Problem Description

Accurate demand forecasting is critical for inventory optimization. Overstocking increases holding costs and capital blockage, while understocking leads to missed sales and dissatisfied customers.

Most small and medium businesses rely on manual methods, spreadsheets, or guesswork. These approaches fail to account for:

- Seasonality
- Demand trends
- Volatility
- Forecast uncertainty
- Risk of stockouts

Reliable forecasting requires structured time-series modeling, which is complex and inaccessible to most SMEs.

### Target Users

- Kirana stores
- Small retail shops
- FMCG distributors
- D2C sellers
- Small wholesalers
- Dark Stores

### Existing Gaps

- No affordable AI-based forecasting tool for SMEs
- Lack of seasonal detection
- No risk-aware reorder recommendations
- No confidence interval visualization
- No integrated AI planning assistant

---

## 2. Problem Understanding & Approach

### Root Cause Analysis

- SMEs lack data science expertise
- Forecasting models are complex to implement
- Inventory decisions are reactive
- No structured time-series modeling
- No quantification of uncertainty

### Solution Strategy

Build an **AI-first Retail Intelligence Platform** that:

- Accepts historical sales data (CSV or POS generated)
- Applies structured time-series modeling
- Quantifies uncertainty & risk
- Generates actionable reorder recommendations
- Provides explainable AI insights

---

## 3. Proposed Solution

### Solution Overview

Smart Inventory AI is a full-stack web application that combines:

- Live sales tracking
- Billing & payment integration
- Forecasting engine
- Risk-based inventory optimization
- AI-powered planning assistant

### Core Idea

Transform raw sales data into **actionable inventory decisions using AI**.

Not just predictions — but intelligent business guidance.

### Key Features

#### Core AI Features

- SKU-level demand forecasting (Moving Average, Exponential Smoothing, Holt-Winters)
- Seasonal decomposition (STL)
- Risk-based forecasting (P10, P50, P90 scenarios)
- Confidence interval visualization
- Safety stock & reorder point calculation
- Forecast accuracy tracking (MAPE)
- AI Planning Assistant (LLM-based insights)

#### Base Features

- Product management with full CRUD operations
- POS billing system with cart management
- Bill generation with print support
- Payment method tracking (Cash, Card, UPI)
- Live sales tracker with real-time analytics
- Low stock alerts with configurable thresholds
- Dashboard analytics with interactive charts
- CSV upload with AI-powered analysis
- Category-wise inventory breakdown

---

## 4. System Architecture

### High-Level Flow

```
User → Next.js Frontend → Express.js Backend → AI Engine → MongoDB → Dashboard → AI Assistant
```

### Architecture Description

1. User interacts with the Next.js 15 frontend dashboard.
2. Frontend sends requests to the Express.js REST API backend.
3. Backend processes:
   - Sales data and billing
   - Product inventory management
   - Analytics aggregation via MongoDB pipelines
   - AI recommendation generation
4. AI engine analyzes sales patterns and stock levels.
5. Results stored in MongoDB with Mongoose ODM.
6. Dashboard displays interactive charts (Recharts) and KPI cards.
7. AI Assistant provides natural language insights and recommendations.

### Monorepo Structure (Turborepo)

This project uses **Turborepo** for scalable monorepo architecture.

```
smart_inventory/
│
├── apps/
│   ├── backend/          # Express.js REST API server
│   │   ├── src/
│   │   │   ├── models/       # Mongoose schemas (Product, Sale)
│   │   │   ├── routes/       # API endpoints (products, sales, analytics, ai)
│   │   │   ├── middleware/   # Stats tracker, file upload (multer)
│   │   │   ├── lib/          # DB connection, bill generation, Swagger config
│   │   │   ├── app.ts        # Express app setup
│   │   │   └── index.ts      # Server entry point
│   │   └── package.json
│   │
│   ├── dashboard/        # Next.js 15 dashboard application
│   │   ├── app/              # App Router pages
│   │   │   ├── page.tsx          # Main dashboard
│   │   │   ├── billing/          # POS billing system
│   │   │   ├── inventory/        # Product management
│   │   │   ├── analysis/         # Sales & inventory analysis
│   │   │   ├── ai-assistant/     # AI chat & CSV upload
│   │   │   └── profile/          # Business settings
│   │   ├── components/
│   │   │   ├── dashboard/    # KPI cards, charts, recommendations
│   │   │   ├── billing/      # Cart, product search, bill preview
│   │   │   ├── inventory/    # Product table, forms, filters
│   │   │   ├── analysis/     # Sales report, inventory analysis
│   │   │   ├── ai/           # Chat interface, CSV upload
│   │   │   ├── profile/      # Profile form, appearance settings
│   │   │   └── ui/           # 56 shadcn/ui components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # API client, utilities
│   │   └── package.json
│   │
│   └── landing/          # Next.js 16 marketing landing page
│       └── ...
│
├── packages/             # Shared packages (future)
├── turbo.json            # Turborepo task configuration
└── package.json          # Root workspace config
```

---

## 5. Database Design

### Core Entities

- **Products** — SKU, name, category, price, cost price, quantity, low stock threshold
- **Sales** — Bill number, items, subtotal, tax, discount, grand total, payment method
- **Forecasts** — Linked to SKU (future scope)
- **Inventory** — Linked to Product via quantity tracking

### Data Models

#### Product Schema

| Field             | Type    | Description                         |
| ----------------- | ------- | ----------------------------------- |
| name              | String  | Product name                        |
| sku               | String  | Unique product code                 |
| category          | String  | Product category                    |
| price             | Number  | Selling price                       |
| costPrice         | Number  | Purchase/cost price                 |
| quantity          | Number  | Current stock level                 |
| unit              | String  | Unit of measurement (pcs, kg, etc.) |
| lowStockThreshold | Number  | Alert threshold                     |
| isActive          | Boolean | Soft delete flag                    |

#### Sale Schema

| Field         | Type   | Description                         |
| ------------- | ------ | ----------------------------------- |
| billNumber    | String | Auto-generated (BILL-YYYYMMDD-XXXX) |
| items         | Array  | Product references with quantities  |
| subtotal      | Number | Pre-tax total                       |
| tax / taxRate | Number | Tax amount and rate                 |
| discount      | Number | Applied discount                    |
| grandTotal    | Number | Final amount                        |
| paymentMethod | Enum   | cash, card, upi, other              |
| paymentStatus | Enum   | paid, pending, partial              |
| customerName  | String | Optional customer info              |

### Relationships

- One Product → Many Sales (via sale items)
- One Product → Stock tracking (quantity field)
- Sales → Auto-decrement product stock on creation

---

## 6. Dataset

### Dataset Name

Retail Sales Time-Series Dataset (POS Generated + CSV Upload)

### Data Sources

- **Live POS** — Sales generated through the billing system
- **CSV Upload** — Historical sales data uploaded by user

### Data Type

- Date, SKU, Quantity Sold, Price, Category

### Preprocessing Steps

- Missing value handling
- Outlier detection (Z-score)
- Frequency normalization
- SKU segmentation
- Category-level aggregation

---

## 7. AI Models

### Current Implementation (Mock AI Engine)

The AI engine analyzes real sales and inventory data from MongoDB to generate:

- **Restock recommendations** based on stock levels vs thresholds
- **Trending product detection** from 7-day sales aggregation
- **Seasonal insights** based on calendar month patterns
- **Out-of-stock alerts** with priority classification
- **CSV analysis** with statistical insights and recommendations

### Model Selection (Future Scope)

| Model                 | Use Case                       |
| --------------------- | ------------------------------ |
| Moving Average        | Short-term demand smoothing    |
| Exponential Smoothing | Weighted recent trend analysis |
| Holt's Linear Trend   | Trend-based forecasting        |
| Holt-Winters Seasonal | Seasonal demand patterns       |

### Evaluation Metrics

- MAPE (Primary)
- RMSE
- MAE
- Forecast Confidence %

---

## 8. Technology Stack

### Frontend

| Technology                    | Purpose                         |
| ----------------------------- | ------------------------------- |
| **Next.js 15** (App Router)   | Dashboard application framework |
| **React 19**                  | UI component library            |
| **TypeScript**                | Type-safe development           |
| **Tailwind CSS 3**            | Utility-first styling           |
| **shadcn/ui** (56 components) | Pre-built UI component library  |
| **Recharts**                  | Interactive data visualization  |
| **Framer Motion**             | Animations                      |
| **React Hook Form + Zod**     | Form validation                 |
| **next-themes**               | Dark/light mode                 |
| **Sonner**                    | Toast notifications             |
| **Lucide React**              | Icon library                    |

### Backend

| Technology              | Purpose                  |
| ----------------------- | ------------------------ |
| **Express.js 4**        | REST API framework       |
| **TypeScript**          | Type-safe backend        |
| **Mongoose**            | MongoDB ODM              |
| **Swagger/OpenAPI 3.0** | API documentation        |
| **Multer**              | CSV file upload handling |
| **CORS**                | Cross-origin support     |

### Database

| Technology      | Purpose                   |
| --------------- | ------------------------- |
| **MongoDB 8.2** | Primary document database |
| **Mongoose**    | Schema validation & ODM   |

### DevOps & Infrastructure

| Technology         | Purpose                      |
| ------------------ | ---------------------------- |
| **Turborepo v2**   | Monorepo build orchestration |
| **npm Workspaces** | Package management           |
| **tsx**            | TypeScript execution (dev)   |
| **ESLint**         | Code linting                 |

---

## 9. API Documentation

### 22 REST API Endpoints

The API is fully documented with **Swagger/OpenAPI** at `http://localhost:6000/api/docs`.

### Products API

| Method   | Endpoint                   | Description                                            |
| -------- | -------------------------- | ------------------------------------------------------ |
| `GET`    | `/api/products`            | List products with pagination, search, category filter |
| `GET`    | `/api/products/:id`        | Get single product                                     |
| `POST`   | `/api/products`            | Create new product                                     |
| `PUT`    | `/api/products/:id`        | Update product                                         |
| `DELETE` | `/api/products/:id`        | Soft delete product                                    |
| `PATCH`  | `/api/products/:id/stock`  | Adjust stock quantity                                  |
| `GET`    | `/api/products/categories` | Get distinct categories                                |
| `GET`    | `/api/products/low-stock`  | Get products below threshold                           |

### Sales API

| Method | Endpoint             | Description                                      |
| ------ | -------------------- | ------------------------------------------------ |
| `POST` | `/api/sales`         | Create sale, auto-generate bill, decrement stock |
| `GET`  | `/api/sales`         | List sales with pagination & date range          |
| `GET`  | `/api/sales/:id`     | Get single sale details                          |
| `GET`  | `/api/sales/summary` | Today/week/month/all-time totals                 |

### Analytics API

| Method | Endpoint                            | Description                     |
| ------ | ----------------------------------- | ------------------------------- |
| `GET`  | `/api/analytics/overview`           | Dashboard KPI metrics           |
| `GET`  | `/api/analytics/sales-trend`        | Daily sales data for charts     |
| `GET`  | `/api/analytics/category-breakdown` | Revenue by category (pie chart) |
| `GET`  | `/api/analytics/top-products`       | Top selling products            |
| `GET`  | `/api/analytics/inventory-value`    | Inventory value by category     |

### AI API

| Method | Endpoint                    | Description                  |
| ------ | --------------------------- | ---------------------------- |
| `GET`  | `/api/ai/recommendations`   | AI inventory recommendations |
| `POST` | `/api/ai/chat`              | AI assistant chat            |
| `POST` | `/api/ai/analyze-csv`       | Upload & analyze CSV data    |
| `GET`  | `/api/ai/seasonal-analysis` | Seasonal sales analysis      |

### System API

| Method | Endpoint      | Description  |
| ------ | ------------- | ------------ |
| `GET`  | `/api/health` | Health check |

---

## 10. Module-wise Development

### Checkpoint 1: Foundation

**Deliverables:**

- Turborepo monorepo setup
- Express.js backend with Swagger docs
- MongoDB + Mongoose integration
- Product & Sale data models
- Next.js dashboard app shell with sidebar navigation

### Checkpoint 2: Inventory Module

**Deliverables:**

- Product CRUD API (8 endpoints)
- Inventory page with sortable product table
- Add/Edit product forms with Zod validation
- Stock adjustment dialog
- Low stock filtering and alerts
- Category management

### Checkpoint 3: Billing Module

**Deliverables:**

- Sales API with auto bill number generation
- POS billing page with product search
- Cart management with quantity controls
- Order summary with tax/discount calculation
- Bill preview with print support
- Recent bills history

### Checkpoint 4: Dashboard & Analytics

**Deliverables:**

- Analytics API (5 aggregation endpoints)
- KPI cards (revenue, sales, products, alerts)
- Sales trend area chart (7D/30D/90D)
- Category breakdown pie chart
- Top products with progress bars
- Recent sales table

### Checkpoint 5: AI Features

**Deliverables:**

- AI recommendation engine (rule-based on real data)
- AI chat assistant with contextual responses
- CSV upload with analysis (insights, warnings, recommendations)
- Seasonal analysis endpoint
- AI recommendations on dashboard

### Checkpoint 6: Profile & Polish

**Deliverables:**

- Profile page with business settings (localStorage)
- Theme switching (Light/Dark/System)
- Custom 404 page
- Print styles for billing
- Responsive design across all pages

---

## 11. End-to-End Workflow

1. User adds products via Inventory page or uploads CSV.
2. Sales created through POS billing system.
3. Stock automatically decremented on each sale.
4. Analytics engine aggregates sales data via MongoDB pipelines.
5. Dashboard displays KPI cards, charts, and trends.
6. AI engine analyzes stock levels and sales patterns.
7. Recommendations generated (restock, trending, seasonal).
8. AI assistant provides natural language insights.
9. User exports bills via print or downloads reports.

---

## 12. Development Workflow

### Prerequisites

- Node.js 18+
- MongoDB 6+ (local or Atlas)
- npm 9+

### Install Dependencies

```bash
npm install
```

### Run Development Mode

```bash
# Start MongoDB
brew services start mongodb/brew/mongodb-community

# Start all apps (backend + dashboard + landing)
npm run dev
```

### Access Points

| Service      | URL                              |
| ------------ | -------------------------------- |
| Dashboard    | http://localhost:3001            |
| Landing Page | http://localhost:3000            |
| Backend API  | http://localhost:6000            |
| Swagger Docs | http://localhost:6000/api/docs   |
| API Status   | http://localhost:6000/api/status |

### Build All Apps

```bash
npm run build
```

### Lint

```bash
npm run lint
```

### Clean Cache

```bash
npm run clean
```

---

## 13. Project Stats

| Metric                 | Value                    |
| ---------------------- | ------------------------ |
| Total Files            | 198 TypeScript/TSX files |
| Total Lines of Code    | ~23,000                  |
| Backend Modules        | 19 TypeScript files      |
| Dashboard Components   | 100 TypeScript/TSX files |
| UI Components (shadcn) | 56 pre-built components  |
| Custom Components      | 6 module directories     |
| API Endpoints          | 22 documented endpoints  |
| Dashboard Pages        | 7 (+ 404)                |

---

## 14. Core Features

### AI Intelligence Layer

- SKU-level demand analysis from real sales data
- Automated low stock detection with priority alerts
- Trending product identification (7-day rolling window)
- Seasonal insight generation (month-aware recommendations)
- CSV data analysis with statistical insights
- Natural language AI assistant with contextual responses
- Out-of-stock impact assessment
- Restock quantity suggestions (3x threshold rule)

### Business Features

- Full POS billing system with cart management
- Auto bill number generation (BILL-YYYYMMDD-XXXX)
- Payment method tracking (Cash, Card, UPI)
- Product management with soft delete
- Stock adjustment with reason tracking
- Interactive dashboard with 5 chart types
- Category-wise revenue and inventory analysis
- Customer information on bills
- Print-ready bill preview
- Dark/Light/System theme support
- Responsive design (mobile + desktop)

---

## 15. Future Scope & Scalability

### Short-Term

- ARIMA time-series integration
- Festival demand auto-detection
- Multi-store management
- Automated purchase order generation
- PDF invoice download
- Real LLM integration (OpenAI/Claude)

### Long-Term

- LSTM deep learning models
- Price elasticity modeling
- Reinforcement learning inventory control
- Supply chain optimization
- Multi-country expansion
- WebSocket live sales updates

---

## 16. Known Limitations

- Accuracy depends on historical data quality and volume
- Seasonal detection requires sufficient data history
- Forecasting less reliable for newly added SKUs
- External factors (market shocks) not modeled initially
- AI responses are rule-based (mock) — real LLM integration planned
- No authentication system (planned for next phase)

---

## 17. Impact

- Reduced stockouts through proactive low-stock alerts
- Reduced overstock via demand-aware recommendations
- Improved working capital efficiency
- Data-driven decision-making for SMEs
- Scalable AI adoption for small businesses
- Zero-setup analytics (no data science expertise needed)

---

## 18. Hackathon Deliverables Summary

- AI-powered recommendation engine with real data analysis
- Risk-based inventory optimizer with stock alerts
- Live POS billing system with cart & bill generator
- Interactive dashboard with 5 chart types
- AI chat assistant with contextual inventory insights
- CSV analyzer with insights, warnings, and recommendations
- Complete SaaS-ready monorepo architecture
- 22 documented REST API endpoints
- Full Swagger/OpenAPI documentation
- Dark/Light theme support
- Responsive mobile-first design

---

## 19. Team Roles & Responsibilities

| Member Name | Role                | Responsibilities                                  |
| ----------- | ------------------- | ------------------------------------------------- |
| Member 1    | AI Product Engineer | Forecasting engine, risk modeling, AI integration |
| Member 2    | Backend Developer   | API design, database, authentication              |
| Member 3    | Frontend Developer  | UI implementation, dashboard, POS                 |
| Member 4    | DevOps              | Deployment, CI/CD, infrastructure                 |

---

## Final Positioning

**Smart Inventory AI** is not just inventory software.

It is an **AI-Powered Retail Intelligence & Inventory Optimization Platform** built for real-world business growth — specifically designed for kirana stores, retailers, distributors, and D2C brands.

Transform raw sales data into **accurate forecasts, quantified risk insights, and intelligent reorder decisions**.

---

_Built with Turborepo, Next.js, Express.js, MongoDB, and AI._
