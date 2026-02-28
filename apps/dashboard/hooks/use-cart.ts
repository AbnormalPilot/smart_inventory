"use client"

import { useState, useMemo, useCallback } from "react"
import { apiFetch } from "@/lib/api"

export interface CartItem {
  productId: string
  name: string
  sku: string
  price: number
  quantity: number
  maxQuantity: number
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])
  const [taxRate, setTaxRate] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  )
  const tax = useMemo(() => subtotal * (taxRate / 100), [subtotal, taxRate])
  const grandTotal = useMemo(() => subtotal + tax - discount, [subtotal, tax, discount])

  const addItem = useCallback((product: { _id: string; name: string; sku: string; price: number; quantity: number }) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product._id)
      if (existing) {
        if (existing.quantity >= product.quantity) return prev
        return prev.map((i) =>
          i.productId === product._id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          sku: product.sku,
          price: product.price,
          quantity: 1,
          maxQuantity: product.quantity,
        },
      ]
    })
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(1, Math.min(quantity, item.maxQuantity)) }
          : item
      )
    )
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    setTaxRate(0)
    setDiscount(0)
  }, [])

  const checkout = useCallback(
    async (paymentMethod: string, customerName: string, customerPhone: string, notes: string) => {
      setIsCheckingOut(true)
      try {
        const sale = await apiFetch<Record<string, unknown>>("/sales", {
          method: "POST",
          body: JSON.stringify({
            items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
            taxRate,
            discount,
            paymentMethod,
            customerName,
            customerPhone,
            notes,
          }),
        })
        clearCart()
        return sale
      } finally {
        setIsCheckingOut(false)
      }
    },
    [items, taxRate, discount, clearCart]
  )

  return {
    items,
    subtotal,
    tax,
    taxRate,
    setTaxRate,
    discount,
    setDiscount,
    grandTotal,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    checkout,
    isCheckingOut,
  }
}
