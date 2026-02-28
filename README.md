# 📦 SmartInventory — Predictive Demand Forecasting for Dark Stores

> *Moving dark stores from reactionary ordering to predictive fulfillment.*

---

## 🔴 The Problem: The "Cost of Guessing"

Dark stores operate on **razor-thin margins** and promise **hyper-speed delivery** (10-30 minutes). Yet most small-to-medium operators rely on **manual spreadsheets** or **gut feeling** for inventory decisions. This creates three critical failures:

| Failure Mode | What Happens | Business Impact |
|---|---|---|
| **Capital Lockup** | Overstocking slow-moving goods | Wasted capital + shelf space; perishables expire |
| **Revenue Leakage** | Understocking popular items | "Out of Stock" → lost orders → lost customers |
| **Complexity Gap** | Cannot handle seasonality or trends | Reactive ordering; always one step behind demand |

**The core issue:** Basic tools cannot decompose demand into its underlying components — trend, seasonality, and noise. Without this, operational planning is always reactive, never proactive.

### Real-World Scale of the Problem
- India's quick-commerce market is projected to reach **$5.5B by 2025**
- Average dark store carries **2,000–5,000 SKUs** with daily replenishment cycles
- Industry estimates suggest **15–25% revenue loss** from stockouts alone
- Perishable waste from overstocking can account for **8–12% of inventory cost**

---

## 👤 User Persona

### Primary: Dark Store Operations Manager

| Attribute | Detail |
|---|---|
| **Who** | Mid-level operations manager at a quick-commerce company (e.g., Blinkit, Zepto, Swiggy Instamart, or independent dark store operators) |
| **Age Range** | 25–40 years |
| **Tech Comfort** | Comfortable with dashboards and spreadsheets; not a data scientist |
| **Daily Reality** | Manages 1–5 dark store locations; makes restocking decisions 1–2x daily |
| **Key Pain Points** | ① No visibility into future demand peaks ② Spreadsheet forecasts break during weekends/festivals ③ No way to quantify risk — always guessing ④ Supplier lead times make last-minute orders expensive |
| **Goal** | "Tell me *what* to order, *how much*, and *when* — before I run out." |
| **Success Metric** | Reduce stockouts by 20%, reduce overstock waste by 15% |

### Secondary: Regional/Category Manager
- Oversees 10–50 dark stores across a city/region
- Needs aggregated demand signals across locations
- Makes bulk procurement and supplier negotiation decisions

---

## 💡 The Solution: SmartInventory

SmartInventory is an **automated demand forecasting engine** that transforms historical sales chaos into actionable restocking strategy.

### Core Capabilities

#### 1. Time-Series Intelligence
Uses **Holt-Winters (Triple Exponential Smoothing)** to decompose sales data into three components:
- **Level (Trend):** Is demand for this SKU growing, declining, or stable?
- **Seasonality:** What's the weekly pattern? (Friday night spikes, Monday morning dips)
- **Noise:** Random variation that shouldn't drive decisions

#### 2. Quantified Uncertainty
Instead of a single forecast number, SmartInventory provides **95% Confidence Intervals**:
- **Best Case (Upper Bound):** Maximum likely demand → guides safety stock
- **Expected Case (Forecast):** Most probable demand → drives primary order
- **Worst Case (Lower Bound):** Minimum likely demand → identifies overstock risk

#### 3. Proactive Restock Recommendations
Translates math into action:
```
Restock Quantity = Forecasted Demand + Safety Buffer − Current Stock
```
Where Safety Buffer is dynamically calculated from forecast uncertainty (wider confidence interval → larger buffer).

#### 4. Visual Demand Dashboard
Interactive charts showing:
- Historical vs. forecasted demand with confidence bands
- Seasonal decomposition (see the weekly pattern)
- SKU-level restock alerts with priority scoring
- Anomaly detection for unusual demand spikes

---

## 🏗️ Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Frontend** | React 18 + Recharts | Interactive, responsive dashboard with real-time chart rendering |
| **Styling** | Tailwind CSS | Rapid, consistent UI development |
| **Forecasting Engine** | Custom Holt-Winters (JavaScript) | Lightweight, runs client-side; no ML infrastructure needed |
| **Data Layer** | Static JSON / CSV (PoC) → Supabase (Production) | Fast prototyping now; scalable Postgres backend later |
| **Deployment** | Vercel / Netlify | Zero-config, instant deploys |
| **Future: API Layer** | Node.js + Express or Next.js API Routes | REST endpoints for POS system integration |
| **Future: Data Pipeline** | Python (pandas, statsmodels) | Heavy-duty batch forecasting for multi-store deployments |

---

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        SmartInventory                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────────┐    ┌──────────────────┐    ┌──────────────┐ │
│   │  DATA LAYER  │───▶│ FORECASTING      │───▶│  DASHBOARD   │ │
│   │              │    │ ENGINE           │    │  (React UI)  │ │
│   │ • POS Sales  │    │                  │    │              │ │
│   │ • SKU Master │    │ • Holt-Winters   │    │ • Demand     │ │
│   │ • Stock      │    │ • Decomposition  │    │   Charts     │ │
│   │   Levels     │    │ • Confidence     │    │ • Restock    │ │
│   │ • Supplier   │    │   Intervals      │    │   Alerts     │ │
│   │   Lead Times │    │ • Safety Stock   │    │ • Seasonal   │ │
│   │              │    │   Calculation    │    │   Patterns   │ │
│   └──────────────┘    └──────────────────┘    └──────────────┘ │
│          │                     │                      │        │
│          ▼                     ▼                      ▼        │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │              RECOMMENDATION ENGINE                      │  │
│   │                                                         │  │
│   │  Restock Qty = Forecast + Safety Buffer − Current Stock │  │
│   │                                                         │  │
│   │  Priority Score = Stockout Risk × Revenue Impact        │  │
│   └─────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│                    ┌──────────────────┐                         │
│                    │  ACTION OUTPUT   │                         │
│                    │                  │                         │
│                    │ • Order List     │                         │
│                    │ • Priority Rank  │                         │
│                    │ • Alert Triggers │                         │
│                    └──────────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow
```
POS System ──▶ Sales Data (CSV/API) ──▶ Holt-Winters Engine
                                              │
                                    ┌─────────┴─────────┐
                                    ▼                   ▼
                              Forecast +          Decomposition
                              Confidence          (Trend, Season,
                              Intervals            Noise)
                                    │                   │
                                    ▼                   ▼
                              Restock            Visual Dashboard
                              Recommendation     (Charts + Alerts)
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ and npm/yarn

### Quick Start
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/smartinventory.git
cd smartinventory

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
open http://localhost:3000
```

### Project Structure
```
smartinventory/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx        # Main dashboard layout
│   │   ├── DemandChart.jsx      # Forecast visualization
│   │   ├── RestockTable.jsx     # Restock recommendations
│   │   └── SeasonalView.jsx     # Seasonal decomposition
│   ├── engine/
│   │   ├── holtWinters.js       # Forecasting algorithm
│   │   ├── confidence.js        # Confidence interval calc
│   │   └── restock.js           # Restock recommendation logic
│   ├── data/
│   │   └── sample-sales.json    # Sample dark store sales data
│   └── App.jsx
├── README.md
└── package.json
```

---

## 📊 Proof of Concept

The PoC demonstrates:
1. **Working Holt-Winters implementation** — decomposes 90 days of simulated sales data
2. **Interactive forecast chart** — historical data + 14-day forecast with 95% CI bands
3. **Restock recommendations** — per-SKU order quantities with priority scoring
4. **Seasonal pattern visualization** — weekly demand cycle extraction

### Sample Output
- **Input:** 90 days of historical daily sales for 6 SKUs
- **Output:** 14-day forecast with confidence intervals + actionable restock quantities
- **Accuracy Target:** MAPE < 15% on held-out test data

---

## 📈 Impact Projection

| Metric | Before SmartInventory | After SmartInventory | Improvement |
|---|---|---|---|
| Stockout Rate | 18–25% | 5–10% | **↓ 50–60%** |
| Overstock Waste | 8–12% of inventory cost | 3–5% | **↓ 50%+** |
| Order Planning Time | 2–3 hours/day (manual) | 15 min (review dashboard) | **↓ 85%** |
| Demand Visibility | 0 days ahead | 14 days ahead | **∞ improvement** |

---

## 🧑‍💻 Team

Bash & Bloom

Built at **Overclock 2026**

---

## 📄 License

MIT