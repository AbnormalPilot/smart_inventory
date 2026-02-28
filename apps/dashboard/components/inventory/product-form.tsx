"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { apiFetch } from "@/lib/api"
import type { Product } from "@/hooks/use-products"

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be positive"),
  costPrice: z.coerce.number().min(0, "Cost price must be positive"),
  quantity: z.coerce.number().int().min(0, "Quantity must be 0 or more"),
  unit: z.string().min(1, "Unit is required"),
  lowStockThreshold: z.coerce.number().int().min(0, "Threshold must be 0 or more"),
})

type ProductFormValues = z.infer<typeof productSchema>

interface ProductFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
  onSuccess: () => void
}

const units = ["pcs", "kg", "g", "liters", "ml", "boxes", "packs", "dozens"]

export function ProductForm({ open, onOpenChange, product, onSuccess }: ProductFormProps) {
  const isEditing = !!product

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          sku: product.sku,
          category: product.category,
          description: product.description,
          price: product.price,
          costPrice: product.costPrice,
          quantity: product.quantity,
          unit: product.unit,
          lowStockThreshold: product.lowStockThreshold,
        }
      : {
          name: "",
          sku: "",
          category: "",
          description: "",
          price: 0,
          costPrice: 0,
          quantity: 0,
          unit: "pcs",
          lowStockThreshold: 10,
        },
  })

  async function onSubmit(values: ProductFormValues) {
    try {
      if (isEditing) {
        await apiFetch(`/products/${product._id}`, {
          method: "PUT",
          body: JSON.stringify(values),
        })
        toast.success("Product updated successfully")
      } else {
        await apiFetch("/products", {
          method: "POST",
          body: JSON.stringify(values),
        })
        toast.success("Product created successfully")
      }
      onOpenChange(false)
      form.reset()
      onSuccess()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Product" : "Add New Product"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the product details below." : "Fill in the details to add a new product."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Product name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input placeholder="SKU-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Electronics" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {units.map((u) => (
                          <SelectItem key={u} value={u}>{u}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selling Price ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="costPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost Price ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lowStockThreshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Low Stock Threshold</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Optional product description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? "Saving..."
                  : isEditing
                    ? "Update Product"
                    : "Add Product"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
