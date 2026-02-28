"use client"

import { MoreHorizontal, Pencil, PackageMinus, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import type { Product } from "@/hooks/use-products"

interface ProductTableProps {
  products: Product[]
  isLoading: boolean
  onEdit: (product: Product) => void
  onAdjustStock: (product: Product) => void
  onDelete: (product: Product) => void
}

function getStockBadge(product: Product) {
  if (product.quantity === 0) {
    return <Badge variant="destructive">Out of Stock</Badge>
  }
  if (product.quantity <= product.lowStockThreshold) {
    return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Low Stock</Badge>
  }
  return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">In Stock</Badge>
}

export function ProductTable({ products, isLoading, onEdit, onAdjustStock, onDelete }: ProductTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium">No products found</p>
        <p className="text-sm text-muted-foreground">Add your first product to get started.</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Cost</TableHead>
            <TableHead className="text-right">Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product._id}>
              <TableCell className="font-mono text-xs">{product.sku}</TableCell>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
              <TableCell className="text-right">${product.costPrice.toFixed(2)}</TableCell>
              <TableCell className="text-right">
                {product.quantity} {product.unit}
              </TableCell>
              <TableCell>{getStockBadge(product)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(product)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAdjustStock(product)}>
                      <PackageMinus className="mr-2 h-4 w-4" />
                      Adjust Stock
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(product)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
