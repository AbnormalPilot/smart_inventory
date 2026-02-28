"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"

const testimonials = [
  {
    name: "Rajesh Sharma",
    role: "Grocery Store Owner, Mumbai",
    content: "Smart Inventory cut my stockouts by 80%. The AI predictions are remarkably accurate!",
    avatar: "/avatar-1.jpg",
  },
  {
    name: "Priya Patel",
    role: "Pharmacy Owner, Delhi",
    content: "The billing system is lightning fast. My checkout queue has basically disappeared.",
    avatar: "/avatar-2.jpg",
  },
  {
    name: "Amit Kumar",
    role: "Electronics Retailer, Bangalore",
    content: "The geolocation feature helped me identify a delivery zone I was completely missing. Revenue up 30%!",
    avatar: "/avatar-3.jpg",
  },
]

const testimonials2 = [
  {
    name: "Sneha Desai",
    role: "Fashion Boutique, Pune",
    content: "Best inventory tool I've used. The AI chat assistant feels like having a business analyst on call 24/7.",
    avatar: "/avatar-4.jpg",
  },
  {
    name: "Vikram Singh",
    role: "Supermarket Chain, Jaipur",
    content: "We manage 5 stores with Smart Inventory. The dashboard gives me a real-time pulse of every location.",
    avatar: "/avatar-5.jpg",
  },
  {
    name: "Meera Joshi",
    role: "Bakery Owner, Hyderabad",
    content: "No more wasted ingredients. The demand forecasting alone paid for itself in the first month.",
    avatar: "/avatar-6.jpg",
  },
]

const duplicatedTestimonials = [...testimonials, ...testimonials, ...testimonials]
const duplicatedTestimonials2 = [...testimonials2, ...testimonials2, ...testimonials2]

export function TestimonialsSection() {
  const [isPaused, setIsPaused] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollRef2 = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollRef2.current) {
        scrollRef2.current.scrollLeft = scrollRef2.current.scrollWidth / 3
      }
      setIsInitialized(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (isPaused || !isInitialized || !scrollRef.current) return

    const scrollContainer = scrollRef.current
    let animationFrameId: number
    let isActive = true

    const scroll = () => {
      if (!isActive || !scrollContainer) return

      scrollContainer.scrollLeft += 1
      const maxScroll = scrollContainer.scrollWidth / 3

      if (scrollContainer.scrollLeft >= maxScroll) {
        scrollContainer.scrollLeft = 0
      }

      animationFrameId = requestAnimationFrame(scroll)
    }

    animationFrameId = requestAnimationFrame(scroll)

    return () => {
      isActive = false
      cancelAnimationFrame(animationFrameId)
    }
  }, [isPaused, isInitialized])

  useEffect(() => {
    if (isPaused || !isInitialized || !scrollRef2.current) return

    const scrollContainer = scrollRef2.current
    let animationFrameId: number
    let isActive = true

    const scroll = () => {
      if (!isActive || !scrollContainer) return

      scrollContainer.scrollLeft -= 1

      if (scrollContainer.scrollLeft <= 0) {
        scrollContainer.scrollLeft = scrollContainer.scrollWidth / 3
      }

      animationFrameId = requestAnimationFrame(scroll)
    }

    animationFrameId = requestAnimationFrame(scroll)

    return () => {
      isActive = false
      cancelAnimationFrame(animationFrameId)
    }
  }, [isPaused, isInitialized])

  return (
    <section id="testimonials" className="py-32 px-6 relative overflow-hidden bg-cover bg-center bg-fixed" style={{ backgroundImage: `url('/bg-testimonials-tech.jpg')` }}>
      {/* Dark frosted overlay for perfect dark-mode legibility and premium contrast */}
      <div className="absolute inset-0 bg-zinc-950/85 backdrop-blur-sm" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-normal leading-tight font-serif text-white">What they say about us</h2>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-zinc-950/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-zinc-950/80 to-transparent z-10 pointer-events-none" />

            <div
              ref={scrollRef}
              className="flex gap-6 overflow-x-hidden"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setIsPaused(false)}
              style={{ scrollBehavior: "auto" }}
            >
              {duplicatedTestimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-full sm:w-[400px] bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 rounded-2xl p-8 py-4 shadow-xl"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <Image
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <p className="text-zinc-300 leading-relaxed flex-1 text-lg">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>
                  </div>
                  <div className="mt-auto">
                    <p className="text-white text-sm font-bold">{testimonial.name}</p>
                    <p className="text-zinc-400 text-xs">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-zinc-950/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-zinc-950/80 to-transparent z-10 pointer-events-none" />

            <div
              ref={scrollRef2}
              className="flex gap-6 overflow-x-hidden"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setIsPaused(false)}
              style={{ scrollBehavior: "auto" }}
            >
              {duplicatedTestimonials2.map((testimonial, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-full sm:w-[400px] bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 rounded-2xl p-8 py-4 shadow-xl"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <Image
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <p className="text-lg text-zinc-300 leading-relaxed flex-1">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>
                  </div>
                  <div className="mt-auto">
                    <p className="text-white text-sm font-bold">{testimonial.name}</p>
                    <p className="text-sm text-zinc-400">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
