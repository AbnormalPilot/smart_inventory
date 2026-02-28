"use client"
import { useEffect, useState } from "react"

function useCountUp(end: number, duration = 2000, suffix = "") {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    if (!hasStarted) return

    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(easeOutQuart * end))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration, hasStarted])

  return { value: count + suffix, start: () => setHasStarted(true), hasStarted }
}

export function StatsSection() {
  const [isVisible, setIsVisible] = useState(false)

  const products = useCountUp(10, 2000, "K+")
  const retailers = useCountUp(500, 2000, "+")
  const accuracy = useCountUp(99, 2000, "%")

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
          products.start()
          retailers.start()
          accuracy.start()
        }
      },
      { threshold: 0.3 },
    )

    const section = document.getElementById("stats-section")
    if (section) observer.observe(section)

    return () => observer.disconnect()
  }, [isVisible])
  return (
    <section id="stats-section" className="py-24 px-6 relative overflow-hidden bg-cover bg-center bg-fixed" style={{ backgroundImage: `url('/bg-stats-tech-3.jpg')` }}>
      {/* Dark frosted overlay for premium tech contrast */}
      <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm" />
      <div className="absolute inset-0 opacity-30 mix-blend-color-dodge" style={{
        backgroundImage: `radial-gradient(circle at 50% 100%, rgba(59, 130, 246, 0.2) 0%, transparent 60%)`
      }} />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          <div
            className={`text-center transition-all duration-1000 delay-200 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors shadow-2xl ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <p className="font-light text-transparent bg-clip-text bg-gradient-to-br from-blue-300 to-indigo-500 mb-2 text-6xl md:text-7xl leading-none">{products.value}</p>
            <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Products Tracked</p>
          </div>

          <div
            className={`text-center transition-all duration-1000 delay-300 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors shadow-2xl ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <p className="font-light text-transparent bg-clip-text bg-gradient-to-br from-blue-300 to-indigo-500 mb-2 text-6xl md:text-7xl leading-none">{retailers.value}</p>
            <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Retailers</p>
          </div>

          <div
            className={`text-center transition-all duration-1000 delay-400 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors shadow-2xl ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <p className="font-light text-transparent bg-clip-text bg-gradient-to-br from-blue-300 to-indigo-500 mb-2 text-6xl md:text-7xl leading-none">{accuracy.value}</p>
            <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Forecast Accuracy</p>
          </div>
        </div>
      </div>
    </section>
  )
}
