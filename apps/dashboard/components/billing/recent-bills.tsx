"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { apiFetch } from "@/lib/api"

interface Sale {
  _id: string
  billNumber: string
  grandTotal: number
  paymentMethod: string
  paymentStatus: string
  customerName: string
  items: { productName: string }[]
  createdAt: string
}

interface RecentBillsProps {
  refreshKey: number
}

export function RecentBills({ refreshKey }: RecentBillsProps) {
  const [sales, setSales] = useState<Sale[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    apiFetch<{ sales: Sale[] }>("/sales?limit=10")
      .then((data) => setSales(data.sales))
      .catch(() => setSales([]))
      .finally(() => setIsLoading(false))
  }, [refreshKey])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Bills</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : sales.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No bills yet</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill #</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale._id}>
                    <TableCell className="font-mono text-xs">{sale.billNumber}</TableCell>
                    <TableCell className="text-sm">
                      {sale.items.length} item{sale.items.length > 1 ? "s" : ""}
                    </TableCell>
                    <TableCell className="font-medium">${sale.grandTotal.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{sale.paymentMethod}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(sale.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
