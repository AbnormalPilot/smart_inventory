"use client"

import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface InventoryFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  category: string
  onCategoryChange: (value: string) => void
  categories: string[]
  lowStock: boolean
  onLowStockChange: (value: boolean) => void
  onReset: () => void
}

export function InventoryFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  categories,
  lowStock,
  onLowStockChange,
  onReset,
}: InventoryFiltersProps) {
  const hasFilters = search || category || lowStock

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search products by name or SKU..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={category} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex items-center space-x-2">
        <Switch id="low-stock" checked={lowStock} onCheckedChange={onLowStockChange} />
        <Label htmlFor="low-stock" className="text-sm whitespace-nowrap">Low Stock Only</Label>
      </div>
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onReset}>
          <X className="mr-1 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  )
}
