"use client"

import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface BillPreviewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sale: Record<string, unknown> | null
}

export function BillPreview({ open, onOpenChange, sale }: BillPreviewProps) {
  if (!sale) return null

  const items = (sale.items as Array<Record<string, unknown>>) || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Bill #{sale.billNumber as string}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 print:text-black" id="bill-content">
          <div className="text-center">
            <h2 className="text-xl font-bold">Smart Inventory</h2>
            <p className="text-sm text-muted-foreground">AI-Powered Inventory Management</p>
            <Separator className="my-2" />
          </div>

          <div className="flex justify-between text-sm">
            <div>
              <p>Bill: <strong>{sale.billNumber as string}</strong></p>
              <p>Date: {new Date(sale.createdAt as string).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              {sale.customerName && <p>Customer: {sale.customerName as string}</p>}
              {sale.customerPhone && <p>Phone: {sale.customerPhone as string}</p>}
              <Badge variant="secondary">{sale.paymentMethod as string}</Badge>
            </div>
          </div>

          <Separator />

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-1">Item</th>
                <th className="text-right py-1">Qty</th>
                <th className="text-right py-1">Price</th>
                <th className="text-right py-1">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className="border-b border-dashed">
                  <td className="py-1">
                    <p className="font-medium">{item.productName as string}</p>
                    <p className="text-xs text-muted-foreground">{item.sku as string}</p>
                  </td>
                  <td className="text-right py-1">{item.quantity as number}</td>
                  <td className="text-right py-1">₹{(item.unitPrice as number).toFixed(2)}</td>
                  <td className="text-right py-1">₹{(item.total as number).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <Separator />

          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{(sale.subtotal as number).toFixed(2)}</span>
            </div>
            {(sale.taxRate as number) > 0 && (
              <div className="flex justify-between">
                <span>Tax ({sale.taxRate as number}%)</span>
                <span>₹{(sale.tax as number).toFixed(2)}</span>
              </div>
            )}
            {(sale.discount as number) > 0 && (
              <div className="flex justify-between">
                <span>Discount</span>
                <span>-₹{(sale.discount as number).toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Grand Total</span>
              <span>₹{(sale.grandTotal as number).toFixed(2)}</span>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Thank you for your business!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
