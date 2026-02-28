"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { apiFetch } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Product } from "@/hooks/use-products"

interface ProductSearchProps {
  onSelect: (product: Product) => void
}

export function ProductSearch({ onSelect }: ProductSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Product[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    const timeout = setTimeout(async () => {
      try {
        const data = await apiFetch<{ products: Product[] }>(
          `/products?search=${encodeURIComponent(query)}&limit=10`
        )
        setResults(data.products)
        setIsOpen(true)
      } catch {
        setResults([])
      }
    }, 300)
    return () => clearTimeout(timeout)
  }, [query])

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search products by name or SKU..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          className="pl-9"
        />
      </div>
      {isOpen && results.length > 0 && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
          <ScrollArea className="max-h-[300px]">
            {results.map((product) => (
              <button
                key={product._id}
                className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-accent transition-colors"
                onMouseDown={(e) => {
                  e.preventDefault()
                  onSelect(product)
                  setQuery("")
                  setIsOpen(false)
                }}
              >
                <div>
                  <p className="font-medium text-sm">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    SKU: {product.sku} | ₹{product.price.toFixed(2)}
                  </p>
                </div>
                <Badge variant={product.quantity > 0 ? "secondary" : "destructive"} className="text-xs">
                  {product.quantity} {product.unit}
                </Badge>
              </button>
            ))}
          </ScrollArea>
        </div>
      )}
    </div>
  )
}
