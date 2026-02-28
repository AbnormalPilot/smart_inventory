"use client"
import { useEffect, useState } from "react"
import { AnimatedText } from "./animated-text"

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    let rafId: number
    let currentProgress = 0

    const handleScroll = () => {
      const scrollY = window.scrollY
      const maxScroll = 400
      const targetProgress = Math.min(scrollY / maxScroll, 1)

      const smoothUpdate = () => {
        currentProgress += (targetProgress - currentProgress) * 0.1

        if (Math.abs(targetProgress - currentProgress) > 0.001) {
          setScrollProgress(currentProgress)
          rafId = requestAnimationFrame(smoothUpdate)
        } else {
          setScrollProgress(targetProgress)
        }
      }

      cancelAnimationFrame(rafId)
      smoothUpdate()
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  const easeOutQuad = (t: number) => t * (2 - t)
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

  const scale = 1 - easeOutQuad(scrollProgress) * 0.15
  const borderRadius = easeOutCubic(scrollProgress) * 48
  const heightVh = 100 - easeOutQuad(scrollProgress) * 37.5

  return (
    <section className="pt-32 pb-12 px-6 min-h-screen flex items-center relative overflow-hidden">
      <div className="absolute inset-0 top-0">
        <div
          className="w-full will-change-transform overflow-hidden"
          style={{
            transform: `scale(${scale})`,
            borderRadius: `${borderRadius}px`,
            height: `${heightVh}vh`,
          }}
        >
          {/* Image Background with a pure light tech aesthetic */}
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat relative"
            style={{ backgroundImage: `url('/hero-bg-purelight.jpg')` }}
          >
            {/* Top-heavy bright overlay: making the art soft and legible for text at the top */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/70 to-white/20" />
            
            {/* Vivid ambient iridescent glows to boost the artistic vibe */}
            <div className="absolute inset-0 opacity-40 mix-blend-color-burn" style={{
              backgroundImage: `radial-gradient(ellipse at 10% 40%, rgba(96, 165, 250, 0.4) 0%, transparent 50%),
                               radial-gradient(ellipse at 90% 20%, rgba(244, 114, 182, 0.4) 0%, transparent 50%),
                               radial-gradient(circle at 50% 80%, rgba(167, 139, 250, 0.4) 0%, transparent 60%)`
            }} />
            
            {/* Subtle noise/texture overlay for the organic feel */}
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 w-full overflow-hidden pointer-events-none z-[5] flex items-end justify-center"
        style={{
          transform: `translateY(${scrollProgress * 150}px)`,
          opacity: 1 - scrollProgress * 0.8,
          height: "100%",
        }}
      >
        <span
          className="block text-black/5 font-bold text-[28vw] sm:text-[25vw] md:text-[22vw] lg:text-[20vw] tracking-tighter select-none text-center leading-none"
          style={{ marginBottom: "0" }}
        >
          SMART
        </span>
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="text-center mb-16">
          <div
            className={`transition-all duration-1000 delay-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"}`}
          >
            <h1 className="font-serif text-[3.5rem] sm:text-[4.5rem] md:text-[5.5rem] lg:text-[6.5rem] xl:text-[7.5rem] 2xl:text-[8.5rem] font-medium leading-[1.02] tracking-[-0.02em] mb-6 w-full px-4 max-w-6xl mx-auto text-balance">
              <span className="bg-clip-text text-transparent bg-gradient-to-br from-indigo-900 via-indigo-700 to-fuchsia-700 drop-shadow-sm">
                <AnimatedText text="Inventory Optimization Reinvented" delay={0.3} />
              </span>
            </h1>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-10">
          <div
            className={`transition-all duration-[1500ms] ease-out delay-500 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <p className="text-center text-zinc-600 max-w-2xl mx-auto text-lg md:text-xl font-light tracking-wide leading-relaxed">
              AI-powered retail intelligence for modern businesses. <br className="hidden md:block"/>Demand forecasting, smart billing, and real-time aesthetic analytics.
            </p>
          </div>
          
          <div className={`flex flex-col sm:flex-row items-center gap-5 transition-all duration-1000 delay-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <button className="relative group overflow-hidden rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white px-10 py-4 font-medium tracking-wide transition-all duration-300 hover:scale-[1.03] active:scale-95 shadow-[0_10px_40px_-10px_rgba(79,70,229,0.5)]">
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-fuchsia-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
              <span className="relative z-10 flex items-center gap-2">
                Get Started 
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-1"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </span>
            </button>
            <button className="relative group overflow-hidden rounded-full border border-indigo-200/50 bg-white/60 backdrop-blur-md text-indigo-950 px-10 py-4 font-medium tracking-wide transition-all duration-300 hover:bg-indigo-50 hover:border-indigo-300 hover:shadow-[0_8px_30px_rgba(79,70,229,0.1)] active:scale-95">
              <span className="relative flex items-center gap-2">View Demo</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
