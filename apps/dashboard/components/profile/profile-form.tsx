"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

const profileSchema = z.object({
  shopName: z.string().min(1, "Shop name is required"),
  ownerName: z.string().min(1, "Owner name is required"),
  email: z.string().email("Invalid email").or(z.literal("")),
  phone: z.string(),
  address: z.string(),
  taxRate: z.coerce.number().min(0).max(100),
  currency: z.string().min(1),
})

type ProfileValues = z.infer<typeof profileSchema>

const STORAGE_KEY = "smart-inventory-profile"

function loadProfile(): ProfileValues {
  if (typeof window === "undefined") return getDefaults()
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : getDefaults()
  } catch {
    return getDefaults()
  }
}

function getDefaults(): ProfileValues {
  return {
    shopName: "My Shop",
    ownerName: "",
    email: "",
    phone: "",
    address: "",
    taxRate: 0,
    currency: "USD",
  }
}

export function ProfileForm() {
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: getDefaults(),
  })

  useEffect(() => {
    const saved = loadProfile()
    form.reset(saved)
  }, [form])

  function onSubmit(values: ProfileValues) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values))
    toast.success("Profile saved successfully")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Information</CardTitle>
        <CardDescription>Your shop details and default settings.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="shopName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shop Name</FormLabel>
                    <FormControl><Input placeholder="My Shop" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ownerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner Name</FormLabel>
                    <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" placeholder="shop@example.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl><Input placeholder="+1 234 567 890" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl><Textarea placeholder="Shop address" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="taxRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Tax Rate (%)</FormLabel>
                    <FormControl><Input type="number" min="0" max="100" step="0.1" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <FormControl><Input placeholder="USD" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={form.formState.isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              Save Profile
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
