"use client"

import { Check } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { RealtimePropertyCard } from "./realtime-property-card"

const features = [
  "Add products in seconds",
  "AI-powered demand forecasts",
  "Instant billing & invoicing",
  "24/7 analytics dashboard",
  "No hidden fees",
  "Geolocation insights",
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-32 px-6 relative overflow-hidden bg-cover bg-center bg-fixed" style={{ backgroundImage: `url('/features-warehouse.jpg')` }}>
      {/* Light aesthetic overlay to blend the warehouse art with the UI */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]" />
      <div className="absolute inset-0 opacity-20 mix-blend-color-burn" style={{
        backgroundImage: `radial-gradient(circle at 80% 20%, rgba(96, 165, 250, 0.4) 0%, transparent 50%),
                         radial-gradient(circle at 20% 80%, rgba(244, 114, 182, 0.4) 0%, transparent 50%)`
      }} />

      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-center pointer-events-none z-0">
        <span className="font-bold text-center text-[20vw] sm:text-[18vw] md:text-[16vw] lg:text-[14vw] leading-none tracking-tighter text-black/[0.03] whitespace-nowrap mix-blend-overlay">
          MANAGE
        </span>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center bg-white/30 backdrop-blur-2xl border border-white/60 p-8 md:p-12 lg:p-16 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]">
          <div className="order-2 lg:order-1 relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/20 to-fuchsia-500/20 rounded-[2rem] blur-2xl -z-10" />
            <RealtimePropertyCard />
          </div>

          <div className="order-1 lg:order-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-normal mb-6 text-balance font-serif text-slate-900 drop-shadow-sm">
                Manage your inventory with ease
              </h2>
              <p className="text-slate-700 leading-relaxed text-lg font-medium">
                Track your stock, manage sales, and get AI insights from a single intuitive and modern
                interface.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center p-3 rounded-2xl bg-white/40 hover:bg-white/60 border border-white/40 transition-all duration-300 gap-3 py-2 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-fuchsia-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  </div>
                  <span className="text-sm font-medium text-slate-800">{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
