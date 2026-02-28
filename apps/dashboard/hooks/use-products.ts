"use client"

import { useState, useEffect, useCallback } from "react"
import { apiFetch } from "@/lib/api"

export interface Product {
  _id: string
  name: string
  sku: string
  category: string
  description: string
  price: number
  costPrice: number
  quantity: number
  unit: string
  lowStockThreshold: number
  imageUrl: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface ProductsResponse {
  products: Product[]
  pagination: Pagination
}

interface UseProductsOptions {
  page?: number
  limit?: number
  search?: string
  category?: string
  lowStock?: boolean
}

export function useProducts(options: UseProductsOptions = {}) {
  const { page = 1, limit = 20, search = "", category = "", lowStock = false } = options
  const [products, setProducts] = useState<Product[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set("page", String(page))
      params.set("limit", String(limit))
      if (search) params.set("search", search)
      if (category) params.set("category", category)
      if (lowStock) params.set("lowStock", "true")

      const data = await apiFetch<ProductsResponse>(`/products?${params}`)
      setProducts(data.products)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products")
    } finally {
      setIsLoading(false)
    }
  }, [page, limit, search, category, lowStock])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const deleteProduct = async (id: string) => {
    await apiFetch(`/products/${id}`, { method: "DELETE" })
    await fetchProducts()
  }

  const updateStock = async (id: string, adjustment: number, reason: string) => {
    await apiFetch(`/products/${id}/stock`, {
      method: "PATCH",
      body: JSON.stringify({ adjustment, reason }),
    })
    await fetchProducts()
  }

  return { products, pagination, isLoading, error, refetch: fetchProducts, deleteProduct, updateStock }
}

export function useCategories() {
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    apiFetch<{ categories: string[] }>("/products/categories")
      .then((data) => setCategories(data.categories))
      .catch(() => {})
  }, [])

  return categories
}
