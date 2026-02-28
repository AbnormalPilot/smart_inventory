"use client"

import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface RadiusControlProps {
  radius: number
  onRadiusChange: (value: number) => void
}

export function RadiusControl({ radius, onRadiusChange }: RadiusControlProps) {
  return (
    <Card className="absolute bottom-4 right-4 z-[1000] w-64 bg-card/95 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium">Radius</span>
          <Badge variant="secondary">{radius} km</Badge>
        </div>
        <Slider
          min={1}
          max={10}
          step={1}
          value={[radius]}
          onValueChange={([v]) => onRadiusChange(v)}
        />
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>1 km</span>
          <span>10 km</span>
        </div>
      </CardContent>
    </Card>
  )
}
