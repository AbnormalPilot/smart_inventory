import { ArrowUpRight, ArrowRight } from "lucide-react"
import { AnimatedRevenueChart } from "./animated-revenue-chart"

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3001"

export function CTASection() {
  return (
    <section 
      className="py-32 px-6 relative overflow-hidden bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url('/bg-cta-tech.jpg')` }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
        <span className="text-[20vw] font-bold font-sans tracking-tighter leading-none text-white/[0.03] whitespace-nowrap">
          SIMPLIFY
        </span>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-normal leading-tight max-w-4xl mx-auto mb-6 font-serif text-white">
            Ready to optimize your inventory?
          </h2>
          <p className="text-zinc-300 max-w-2xl mx-auto mb-10 text-lg">
            Join hundreds of retailers who trust Smart Inventory for their stock management and sales analytics.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={DASHBOARD_URL} className="relative flex items-center justify-center gap-0 bg-white text-black rounded-full pl-6 pr-1.5 py-1.5 transition-all duration-300 group overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95">
              <span className="text-sm font-medium pr-4">Try Dashboard</span>
              <span className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 text-black" />
              </span>
            </a>

            <a href="#features" className="relative flex items-center justify-center gap-0 border border-white/20 bg-white/5 backdrop-blur-md rounded-full pl-6 pr-1.5 py-1.5 transition-all duration-300 group overflow-hidden hover:bg-white/10 active:scale-95">
              <span className="text-sm text-white pr-4 relative z-10 transition-colors duration-300">
                Explore Features
              </span>
              <span className="w-10 h-10 rounded-full flex items-center justify-center relative z-10">
                <ArrowRight className="w-4 h-4 text-white group-hover:opacity-0 absolute transition-opacity duration-300" />
                <ArrowUpRight className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-all duration-300" />
              </span>
            </a>
          </div>
        </div>

        <div className="flex justify-center mb-16">
          <AnimatedRevenueChart />
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-16 relative z-10 pt-8">
          <div className="text-center">
            <p className="text-7xl font-light text-white drop-shadow-sm">500+</p>
            <p className="text-xs text-zinc-400 uppercase tracking-wider mt-2">Retailers</p>
          </div>
          <div className="text-center">
            <p className="text-7xl font-light text-white drop-shadow-sm">10K+</p>
            <p className="text-xs text-zinc-400 uppercase tracking-wider mt-2">Products Tracked</p>
          </div>
          <div className="text-center">
            <p className="text-7xl font-light text-white drop-shadow-sm">99.9%</p>
            <p className="text-xs text-zinc-400 uppercase tracking-wider mt-2">Uptime</p>
          </div>
        </div>
      </div>
    </section>
  )
}
