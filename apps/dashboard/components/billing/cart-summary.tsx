"use client"

import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CartSummaryProps {
  subtotal: number
  tax: number
  taxRate: number
  onTaxRateChange: (rate: number) => void
  discount: number
  onDiscountChange: (discount: number) => void
  grandTotal: number
  itemCount: number
  isCheckingOut: boolean
  onCheckout: (paymentMethod: string, customerName: string, customerPhone: string, notes: string) => Promise<unknown>
  onBillGenerated: (sale: Record<string, unknown>) => void
}

export function CartSummary({
  subtotal,
  tax,
  taxRate,
  onTaxRateChange,
  discount,
  onDiscountChange,
  grandTotal,
  itemCount,
  isCheckingOut,
  onCheckout,
  onBillGenerated,
}: CartSummaryProps) {
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")

  async function handleCheckout() {
    try {
      const sale = await onCheckout(paymentMethod, customerName, customerPhone, "")
      toast.success("Bill generated successfully!")
      setCustomerName("")
      setCustomerPhone("")
      if (sale) onBillGenerated(sale as Record<string, unknown>)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Customer Name</Label>
          <Input
            placeholder="Optional"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input
            placeholder="Optional"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Payment Method</Label>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="upi">UPI</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal ({itemCount} items)</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm whitespace-nowrap">Tax %</Label>
            <Input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={taxRate}
              onChange={(e) => onTaxRateChange(parseFloat(e.target.value) || 0)}
              className="h-8 w-20"
            />
            <span className="text-sm ml-auto">${tax.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm">Discount $</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={discount}
              onChange={(e) => onDiscountChange(parseFloat(e.target.value) || 0)}
              className="h-8 w-20"
            />
            <span className="text-sm ml-auto">-${discount.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>${grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          size="lg"
          disabled={itemCount === 0 || isCheckingOut}
          onClick={handleCheckout}
        >
          {isCheckingOut ? "Processing..." : "Generate Bill"}
        </Button>
      </CardFooter>
    </Card>
  )
}
