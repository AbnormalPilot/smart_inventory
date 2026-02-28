"use client"

import { useState } from "react"
import { useCart } from "@/hooks/use-cart"
import { ProductSearch } from "@/components/billing/product-search"
import { Cart } from "@/components/billing/cart"
import { CartSummary } from "@/components/billing/cart-summary"
import { BillPreview } from "@/components/billing/bill-preview"
import { RecentBills } from "@/components/billing/recent-bills"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function BillingPage() {
  const cart = useCart()
  const [billPreview, setBillPreview] = useState<Record<string, unknown> | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  function handleBillGenerated(sale: Record<string, unknown>) {
    setBillPreview(sale)
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground">
          Create bills, manage cart, and generate invoices.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Products</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductSearch onSelect={(product) => cart.addItem(product)} />
            </CardContent>
          </Card>

          <Cart
            items={cart.items}
            onUpdateQuantity={cart.updateQuantity}
            onRemove={cart.removeItem}
          />
        </div>

        <div>
          <CartSummary
            subtotal={cart.subtotal}
            tax={cart.tax}
            taxRate={cart.taxRate}
            onTaxRateChange={cart.setTaxRate}
            discount={cart.discount}
            onDiscountChange={cart.setDiscount}
            grandTotal={cart.grandTotal}
            itemCount={cart.items.length}
            isCheckingOut={cart.isCheckingOut}
            onCheckout={cart.checkout}
            onBillGenerated={handleBillGenerated}
          />
        </div>
      </div>

      <RecentBills refreshKey={refreshKey} />

      <BillPreview
        open={!!billPreview}
        onOpenChange={(open) => !open && setBillPreview(null)}
        sale={billPreview}
      />
    </div>
  )
}
