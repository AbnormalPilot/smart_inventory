"use client"

import { BarChart3, Brain, Shield } from "lucide-react"
import { useState, useEffect, useRef } from "react"

const services = [
  {
    icon: BarChart3,
    title: "Real-time analytics",
    description: "Live dashboards, sales trends, and inventory levels — always up to date across every product.",
  },
  {
    icon: Brain,
    title: "AI demand forecasting",
    description: "Machine learning predicts what to restock, when to order, and how to avoid costly stockouts.",
  },
  {
    icon: Shield,
    title: "Secure billing",
    description: "Fast POS with automatic tax calculation, discount management, and one-click bill generation.",
  },
]

function AnimatedIcon({ Icon, delay = 0 }: { Icon: any; delay?: number }) {
  const [isVisible, setIsVisible] = useState(false)
  const iconRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 },
    )

    if (iconRef.current) {
      observer.observe(iconRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={iconRef} className="relative">
      <Icon
        className={`text-foreground h-16 w-16 ${isVisible ? "animate-draw-icon" : ""}`}
        strokeWidth={1}
        style={{
          strokeDasharray: isVisible ? undefined : 1000,
          strokeDashoffset: isVisible ? undefined : 1000,
        }}
      />
    </div>
  )
}

export function ServicesSection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section id="how-it-works" className="py-32 px-6 pb-24 relative overflow-hidden bg-cover bg-center bg-fixed" style={{ backgroundImage: `url('/bg-services-tech.jpg')` }}>
      {/* Light aesthetic overlay to blend the logistics imagery with the UI */}
      <div className="absolute inset-0 bg-white/60 backdrop-blur-[4px]" />
      
      <div className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none z-0">
        <span className="font-bold text-center text-[18vw] sm:text-[16vw] md:text-[14vw] lg:text-[12vw] leading-none tracking-tighter text-black/[0.03] whitespace-nowrap mix-blend-overlay">
          MISSION
        </span>
      </div>

      <style jsx>{`
        @keyframes drawPath {
          from {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
          }
          to {
            stroke-dasharray: 1000;
            stroke-dashoffset: 0;
          }
        }
        :global(.animate-draw-icon) :global(path),
        :global(.animate-draw-icon) :global(line),
        :global(.animate-draw-icon) :global(polyline),
        :global(.animate-draw-icon) :global(circle),
        :global(.animate-draw-icon) :global(rect) {
          animation: drawPath 2s ease-out forwards;
        }
      `}</style>

      <div className="max-w-7xl mx-auto relative z-10">
        <div ref={sectionRef} className="relative px-6 lg:px-8 py-16 lg:py-10 mb-32 overflow-hidden rounded-3xl">
          {/* Background — gradient for inventory theme */}
          <div className="absolute inset-0 w-full h-full">
            <div
              className={`w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-700 transition-transform duration-1000 ease-out ${
                isVisible ? "scale-100" : "scale-110"
              }`}
            >
              <div className="absolute inset-0 opacity-30" style={{
                backgroundImage: `radial-gradient(circle at 30% 40%, rgba(59, 130, 246, 0.4) 0%, transparent 50%),
                                 radial-gradient(circle at 70% 60%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)`
              }} />
            </div>
            <div className="absolute inset-0 bg-black/20" />
          </div>

          {/* Text content */}
          <div className="relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="order-1 lg:order-2">
              <p className="text-sm uppercase tracking-[0.2em] text-white/80 font-medium mb-4">Our mission</p>
              <h2 className="font-sans md:text-4xl lg:text-5xl font-medium text-white text-balance mb-8 text-5xl">
                Eliminating inventory chaos for retailers
              </h2>
              <div className="space-y-6 text-white/90 leading-relaxed">
                <p>
                  At Smart Inventory, we believe managing stock should be as simple as scanning a barcode. Our platform connects
                  every part of your retail operation — from supplier to shelf to sale.
                </p>
                <p>
                  Every product tracked, every transaction secured. We've reimagined inventory management with AI to make
                  it transparent, fast, and intelligent.
                </p>
              </div>
            </div>

            <div className="order-2 lg:order-1 relative rounded-2xl overflow-hidden shadow-2xl h-64 lg:h-full min-h-[300px] group border border-white/10">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url('/dashboard-mockup.jpg')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-white text-xs font-semibold uppercase tracking-wider">Live System Sync</span>
                </div>
                <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 w-[85%] rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-20 relative z-10">
          <h2 className="text-4xl md:text-5xl font-normal mb-6 text-balance font-serif text-slate-900 drop-shadow-sm">Everything you need</h2>
          <p className="text-slate-800 max-w-2xl mx-auto leading-relaxed font-medium">
            A complete platform to manage your inventory from purchase to sale, whether you run one store or many.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative z-10">
          {services.map((service, index) => (
            <div
              key={index}
              className="group p-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 hover:bg-white/90 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-center"
              style={{
                boxShadow: "rgba(14, 63, 126, 0.04) 0px 8px 24px -6px",
              }}
            >
              <div className="mb-6 flex justify-center">
                <AnimatedIcon Icon={service.icon} delay={index * 0.2} />
              </div>
              <h3 className="text-xl font-medium mb-3 text-slate-900">{service.title}</h3>
              <p className="text-slate-700 leading-relaxed text-sm font-medium">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
