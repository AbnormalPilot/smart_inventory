"use client"

import { useTheme } from "next-themes"
import { Sun, Moon, Monitor } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme()

  const themes = [
    { value: "light", label: "Light", icon: Sun, description: "Light background with dark text" },
    { value: "dark", label: "Dark", icon: Moon, description: "Dark background with light text" },
    { value: "system", label: "System", icon: Monitor, description: "Follow system preference" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Customize how the app looks.</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={theme} onValueChange={setTheme} className="grid grid-cols-3 gap-4">
          {themes.map((t) => (
            <div key={t.value}>
              <RadioGroupItem value={t.value} id={t.value} className="peer sr-only" />
              <Label
                htmlFor={t.value}
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <t.icon className="mb-3 h-6 w-6" />
                <span className="text-sm font-medium">{t.label}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
