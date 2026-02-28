"use client"

import { useState, useMemo } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useProducts, useCategories } from "@/hooks/use-products"
import { InventoryStats } from "@/components/inventory/inventory-stats"
import { InventoryFilters } from "@/components/inventory/inventory-filters"
import { ProductTable } from "@/components/inventory/product-table"
import { ProductForm } from "@/components/inventory/product-form"
import { StockAdjustmentDialog } from "@/components/inventory/stock-adjustment-dialog"
import type { Product } from "@/hooks/use-products"

export default function InventoryPage() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [lowStock, setLowStock] = useState(false)
  const [page, setPage] = useState(1)

  const { products, pagination, isLoading, refetch, deleteProduct, updateStock } = useProducts({
    page,
    search,
    category: category === "all" ? "" : category,
    lowStock,
  })
  const categories = useCategories()

  const [formOpen, setFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [stockProduct, setStockProduct] = useState<Product | null>(null)

  const stats = useMemo(() => {
    const lowStockCount = products.filter((p) => p.quantity <= p.lowStockThreshold).length
    const uniqueCategories = new Set(products.map((p) => p.category)).size
    const totalValue = products.reduce((sum, p) => sum + p.costPrice * p.quantity, 0)
    return {
      totalProducts: pagination.total,
      lowStockCount,
      categoriesCount: uniqueCategories,
      totalValue,
    }
  }, [products, pagination.total])

  function handleEdit(product: Product) {
    setEditingProduct(product)
    setFormOpen(true)
  }

  function handleAdd() {
    setEditingProduct(null)
    setFormOpen(true)
  }

  async function handleDelete(product: Product) {
    try {
      await deleteProduct(product._id)
      toast.success(`${product.name} removed from inventory`)
    } catch {
      toast.error("Failed to delete product")
    }
  }

  function resetFilters() {
    setSearch("")
    setCategory("")
    setLowStock(false)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">Manage your products, stock levels, and categories.</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <InventoryStats {...stats} />

      <InventoryFilters
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        category={category}
        onCategoryChange={(v) => { setCategory(v); setPage(1) }}
        categories={categories}
        lowStock={lowStock}
        onLowStockChange={(v) => { setLowStock(v); setPage(1) }}
        onReset={resetFilters}
      />

      <ProductTable
        products={products}
        isLoading={isLoading}
        onEdit={handleEdit}
        onAdjustStock={setStockProduct}
        onDelete={handleDelete}
      />

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1}–
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <ProductForm
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editingProduct}
        onSuccess={refetch}
      />

      <StockAdjustmentDialog
        open={!!stockProduct}
        onOpenChange={(open) => !open && setStockProduct(null)}
        product={stockProduct}
        onAdjust={updateStock}
      />
    </div>
  )
}
