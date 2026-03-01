"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Menu, X, ArrowUpRight, ArrowRight, Package } from "lucide-react"

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3001"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    const element = document.getElementById(targetId)

    if (element) {
      const headerOffset = 100
      const elementPosition = element.getBoundingClientRect().top + window.scrollY
      const offsetPosition = elementPosition - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
      setIsOpen(false)
    }
  }

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isScrolled ? "px-4 pt-4 md:px-8 md:pt-6" : ""}`}>
      <div
        className={`max-w-7xl mx-auto transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] rounded-2xl ${
          isScrolled
            ? "bg-white/10 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_rgba(255,255,255,0.1)] px-6 py-3"
            : "bg-transparent px-6 py-6 border-transparent"
        }`}
      >
        <div className="flex items-center justify-between">
          <a href="#" onClick={handleLogoClick} className="flex items-center gap-2 cursor-pointer">
            <Package
              className={`w-6 h-6 transition-colors duration-300 ${isScrolled ? "text-black" : "text-foreground"}`}
            />
            <span
              className={`text-lg font-medium tracking-tight transition-colors duration-300 ${isScrolled ? "text-black" : "text-foreground"}`}
            >
              Smart Inventory
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-1">
            {[
              { id: "how-it-works", label: "Mission" },
              { id: "features", label: "Features" },
              { id: "showcase", label: "Showcase" },
              { id: "testimonials", label: "Reviews" },
              { id: "faq", label: "FAQ" },
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleSmoothScroll(e, item.id)}
                className={`relative px-4 py-2 text-sm transition-colors cursor-pointer group overflow-hidden rounded-full ${
                  isScrolled ? "text-zinc-600 font-medium hover:text-black" : "text-zinc-700 font-medium hover:text-black"
                }`}
              >
                <span
                  className={`absolute inset-0 w-full h-full scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isScrolled ? "bg-black/5" : "bg-black/5"
                  }`}
                />
                <span className={`relative z-10 transition-colors duration-300`}>
                  {item.label}
                </span>
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-1">
            <a
              href={DASHBOARD_URL}
              className={`relative flex items-center gap-0 border rounded-full pl-5 pr-1 py-1 transition-all duration-300 group overflow-hidden ${
                isScrolled ? "border-zinc-300" : "border-border"
              }`}
            >
              <span
                className={`absolute inset-0 rounded-full scale-x-0 origin-right group-hover:scale-x-100 transition-transform duration-300 ${
                  isScrolled ? "bg-black" : "bg-foreground"
                }`}
              />
              <span
                className={`text-sm pr-3 relative z-10 transition-colors duration-300 ${
                  isScrolled ? "text-black group-hover:text-white" : "text-foreground group-hover:text-background"
                }`}
              >
                Try Dashboard
              </span>
              <span className="w-8 h-8 rounded-full flex items-center justify-center relative z-10">
                <ArrowRight
                  className={`w-4 h-4 group-hover:opacity-0 absolute transition-opacity duration-300 ${
                    isScrolled ? "text-black" : "text-foreground"
                  }`}
                />
                <ArrowUpRight
                  className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300 ${
                    isScrolled ? "text-black group-hover:text-white" : "text-foreground group-hover:text-background"
                  }`}
                />
              </span>
            </a>
          </div>

          <button
            className={`md:hidden transition-colors duration-300 ${isScrolled ? "text-black" : "text-foreground"}`}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <nav
            className={`md:hidden mt-6 pb-6 flex flex-col gap-2 border-t pt-6 ${
              isScrolled ? "border-zinc-200" : "border-border"
            }`}
          >
            {[
              { id: "how-it-works", label: "Mission" },
              { id: "features", label: "Features" },
              { id: "showcase", label: "Showcase" },
              { id: "testimonials", label: "Reviews" },
              { id: "faq", label: "FAQ" },
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleSmoothScroll(e, item.id)}
                className={`relative px-4 py-3 text-sm transition-colors cursor-pointer group overflow-hidden rounded-xl font-medium ${
                  isScrolled ? "text-zinc-600 hover:text-black" : "text-zinc-700 hover:text-black"
                }`}
              >
                <span
                  className={`absolute inset-0 w-full h-full scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] bg-black/5`}
                />
                <span className={`relative z-10 transition-colors duration-300`}>
                  {item.label}
                </span>
              </a>
            ))}
            <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-zinc-200">
              <a
                href={DASHBOARD_URL}
                className="relative flex items-center gap-0 border border-zinc-300 rounded-full pl-5 pr-1 py-1 w-fit transition-all duration-300 group overflow-hidden"
              >
                <span className="absolute inset-0 rounded-full scale-x-0 origin-right group-hover:scale-x-100 transition-transform duration-300 bg-black" />
                <span className="text-sm pr-3 relative z-10 transition-colors duration-300 text-black group-hover:text-white">Try Dashboard</span>
                <span className="w-8 h-8 rounded-full flex items-center justify-center relative z-10">
                  <ArrowRight className="w-4 h-4 group-hover:opacity-0 absolute transition-opacity duration-300 text-black" />
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300 text-black group-hover:text-white" />
                </span>
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
