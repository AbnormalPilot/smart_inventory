"use client"

import { useEffect, useState, useCallback } from "react"
import { io } from "socket.io-client"
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, Package, Zap } from "lucide-react"

interface Headline {
  id: string
  text: string
  type: "insight" | "alert" | "trend" | "tip"
  timestamp: string
}

const TYPE_CONFIG = {
  insight: {
    icon: Sparkles,
    gradient: "from-violet-600 via-purple-600 to-indigo-600",
    glow: "shadow-purple-500/20",
  },
  alert: {
    icon: AlertTriangle,
    gradient: "from-amber-500 via-orange-500 to-red-500",
    glow: "shadow-orange-500/20",
  },
  trend: {
    icon: TrendingUp,
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    glow: "shadow-teal-500/20",
  },
  tip: {
    icon: Zap,
    gradient: "from-blue-500 via-indigo-500 to-violet-500",
    glow: "shadow-indigo-500/20",
  },
}

export function AiHeadlines() {
  const [headlines, setHeadlines] = useState<Headline[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:7020")

    socket.on("connect", () => setConnected(true))
    socket.on("disconnect", () => setConnected(false))

    socket.on("ai:headline", (data: Headline) => {
      setHeadlines((prev) => {
        const next = [data, ...prev].slice(0, 10)
        return next
      })
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  // Auto-rotate headlines
  useEffect(() => {
    if (headlines.length <= 1) return
    const interval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % headlines.length)
        setIsTransitioning(false)
      }, 300)
    }, 6000)
    return () => clearInterval(interval)
  }, [headlines.length])

  // Reset index if it goes out of bounds
  useEffect(() => {
    if (activeIndex >= headlines.length && headlines.length > 0) {
      setActiveIndex(0)
    }
  }, [activeIndex, headlines.length])

  if (headlines.length === 0) {
    if (!connected) return null
    return (
      <div className="relative overflow-hidden rounded-xl border bg-gradient-to-r from-muted/50 to-muted/30 px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-8 w-8 items-center justify-center">
            <div className="absolute inset-0 animate-ping rounded-full bg-purple-400/20" />
            <div className="relative rounded-full bg-purple-100 dark:bg-purple-900/50 p-1.5">
              <Sparkles className="h-4 w-4 text-purple-500 animate-pulse" />
            </div>
          </div>
          <span className="text-sm text-muted-foreground">
            AI is analyzing your inventory data...
          </span>
        </div>
      </div>
    )
  }

  const headline = headlines[activeIndex]
  if (!headline) return null

  const config = TYPE_CONFIG[headline.type] || TYPE_CONFIG.insight
  const Icon = config.icon

  return (
    <div className={`relative overflow-hidden rounded-xl border shadow-lg ${config.glow}`}>
      {/* Animated gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-[0.06] dark:opacity-[0.12]`} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/80 via-transparent to-transparent dark:from-black/30" />

      <div className="relative px-5 py-3.5">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${config.gradient} shadow-md`}>
            <Icon className="h-4 w-4 text-white" />
          </div>

          {/* Headline text */}
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-medium leading-snug transition-all duration-300 ${
                isTransitioning
                  ? "opacity-0 translate-y-2"
                  : "opacity-100 translate-y-0"
              }`}
            >
              {headline.text}
            </p>
          </div>

          {/* Dots indicator + live badge */}
          <div className="flex items-center gap-3 shrink-0">
            {headlines.length > 1 && (
              <div className="flex items-center gap-1">
                {headlines.slice(0, Math.min(headlines.length, 5)).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setIsTransitioning(true)
                      setTimeout(() => {
                        setActiveIndex(i)
                        setIsTransitioning(false)
                      }, 200)
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === activeIndex
                        ? `w-4 bg-gradient-to-r ${config.gradient}`
                        : "w-1.5 bg-muted-foreground/25 hover:bg-muted-foreground/40"
                    }`}
                  />
                ))}
              </div>
            )}
            <div className="flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Live AI
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
