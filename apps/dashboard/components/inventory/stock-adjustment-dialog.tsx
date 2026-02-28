"use client"

import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Product } from "@/hooks/use-products"

interface StockAdjustmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  onAdjust: (id: string, adjustment: number, reason: string) => Promise<void>
}

const reasons = ["Restock", "Sale correction", "Damaged", "Returned", "Inventory count", "Other"]

export function StockAdjustmentDialog({ open, onOpenChange, product, onAdjust }: StockAdjustmentDialogProps) {
  const [adjustment, setAdjustment] = useState(0)
  const [reason, setReason] = useState("Restock")
  const [submitting, setSubmitting] = useState(false)

  if (!product) return null

  const newQuantity = product.quantity + adjustment

  async function handleSubmit() {
    if (adjustment === 0) {
      toast.error("Adjustment cannot be zero")
      return
    }
    if (newQuantity < 0) {
      toast.error("Stock cannot go below zero")
      return
    }
    setSubmitting(true)
    try {
      await onAdjust(product._id, adjustment, reason)
      toast.success(`Stock updated: ${product.name} → ${newQuantity} ${product.unit}`)
      onOpenChange(false)
      setAdjustment(0)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to adjust stock")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
          <DialogDescription>
            {product.name} — Current: {product.quantity} {product.unit}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Adjustment</Label>
            <Input
              type="number"
              value={adjustment}
              onChange={(e) => setAdjustment(parseInt(e.target.value) || 0)}
              placeholder="e.g. +10 or -5"
            />
            <p className="text-xs text-muted-foreground">
              Use positive numbers to add stock, negative to remove.
              New quantity: <strong className={newQuantity < 0 ? "text-destructive" : ""}>{newQuantity}</strong>
            </p>
          </div>
          <div className="space-y-2">
            <Label>Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting || adjustment === 0 || newQuantity < 0}>
            {submitting ? "Updating..." : "Update Stock"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
