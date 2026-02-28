"use client"

import { useRef, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { BarChart3, Receipt, Package, Map, Bot, LineChart, ArrowUpRight } from "lucide-react"

const showcaseItems = [
  {
    title: "Intelligent Dashboard",
    description: "Real-time KPIs, AI recommendations, and sales trends at a glance.",
    icon: BarChart3,
    color: "from-blue-400 to-indigo-500",
    features: ["Live Revenue", "AI Alerts", "Sales Trends", "Stock Levels"],
  },
  {
    title: "Smart Billing",
    description: "Lightning-fast POS with automatic tax calculation and bill generation.",
    icon: Receipt,
    color: "from-emerald-400 to-teal-500",
    features: ["Quick Search", "Auto Tax", "Discounts", "Print/Email"],
  },
  {
    title: "Inventory Tracking",
    description: "Live stock levels with smart alerts for low stock and out-of-stock items.",
    icon: Package,
    color: "from-amber-400 to-orange-500",
    features: ["Real-time Stock", "Low Stock Alerts", "Batch Tracking", "SKU Management"],
  },
  {
    title: "Geolocation Maps",
    description: "Visualize customer reach, delivery zones, and demand hotspots.",
    icon: Map,
    color: "from-rose-400 to-pink-500",
    features: ["Customer Radius", "Delivery Zones", "Heatmaps", "Competitor Intel"],
  },
  {
    title: "AI Chat Assistant",
    description: "Ask questions in plain English — get instant inventory insights.",
    icon: Bot,
    color: "from-violet-400 to-purple-500",
    features: ["Natural Language", "Demand Forecast", "Restock Alerts", "Trend Analysis"],
  },
  {
    title: "Sales Analytics",
    description: "Detailed breakdowns by day, category, and product with interactive charts.",
    icon: LineChart,
    color: "from-cyan-400 to-blue-500",
    features: ["Weekly Reports", "Category Split", "Growth Metrics", "Export Data"],
  },
]

function FeatureCard({ item }: { item: (typeof showcaseItems)[0] }) {
  const Icon = item.icon
  return (
    <div
      className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 p-6 h-full flex flex-col transition-all duration-300 hover:-translate-y-2 hover:bg-white/90 hover:shadow-xl"
      style={{
        boxShadow:
          "rgba(14, 63, 126, 0.04) 0px 8px 24px -6px",
      }}
    >
      {/* Icon header */}
      <div className={`w-full h-40 rounded-2xl bg-gradient-to-br ${item.color} mb-5 flex items-center justify-center relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "radial-gradient(circle at 30% 70%, white 0%, transparent 50%)"
        }} />
        <Icon className="w-12 h-12 text-white relative z-10" strokeWidth={1.5} />
      </div>

      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
        <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
      </div>

      <p className="text-sm text-muted-foreground mb-4 leading-relaxed flex-1">{item.description}</p>

      {/* Feature badges */}
      <div className="flex flex-wrap gap-1.5">
        {item.features.map((f, i) => (
          <span key={i} className="text-xs bg-zinc-100 text-zinc-600 rounded-full px-2.5 py-1">{f}</span>
        ))}
      </div>
    </div>
  )
}

export function PricingSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const positionRef = useRef(0)
  const animationRef = useRef<number>(0)

  const duplicatedItems = [...showcaseItems, ...showcaseItems, ...showcaseItems]

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    const speed = isHovered ? 0.3 : 1
    let lastTime = performance.now()

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime
      lastTime = currentTime

      positionRef.current += speed * (deltaTime / 16)

      const totalWidth = scrollContainer.scrollWidth / 3

      if (positionRef.current >= totalWidth) {
        positionRef.current = 0
      }

      scrollContainer.style.transform = `translateX(-${positionRef.current}px)`
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isHovered])

  return (
    <section id="showcase" className="py-32 overflow-hidden relative bg-cover bg-center bg-fixed" style={{ backgroundImage: `url('/bg-showcase-tech.jpg')` }}>
      {/* Light aesthetic overlay to blend the abstract code art with the UI */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-[3px]" />
      <div className="absolute inset-0 opacity-20 mix-blend-color-burn" style={{
        backgroundImage: `radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.4) 0%, transparent 60%)`
      }} />

      <div className="max-w-7xl mx-auto px-6 text-center mb-20 relative z-10">
        <h2 className="text-4xl md:text-5xl font-normal mb-6 text-balance font-serif text-slate-900 drop-shadow-sm">Feature showcase</h2>
        <p className="text-slate-800 font-medium max-w-2xl mx-auto leading-relaxed">
          Explore the tools that make Smart Inventory the most complete retail intelligence platform.
        </p>
      </div>

      <div className="relative w-full" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        <div ref={scrollRef} className="flex gap-6" style={{ width: "fit-content" }}>
          {duplicatedItems.map((item, index) => (
            <div key={index} className="flex-shrink-0 w-[85vw] sm:w-[60vw] lg:w-[400px]">
              <FeatureCard item={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
