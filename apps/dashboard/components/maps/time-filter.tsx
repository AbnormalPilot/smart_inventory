"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Clock, Calendar, X, ChevronDown } from "lucide-react"

const TIME_PRESETS = [
  { label: "Morning", subtitle: "6–10am", range: [6, 10] as [number, number] },
  { label: "Lunch", subtitle: "11am–2pm", range: [11, 14] as [number, number] },
  { label: "Afternoon", subtitle: "2–5pm", range: [14, 17] as [number, number] },
  { label: "Evening", subtitle: "5–9pm", range: [17, 21] as [number, number] },
  { label: "Night", subtitle: "9pm–12am", range: [21, 23] as [number, number] },
  { label: "Late Night", subtitle: "12–6am", range: [0, 5] as [number, number] },
]

const DATE_PRESETS = [
  { label: "7 days", days: 7 },
  { label: "14 days", days: 14 },
  { label: "30 days", days: 30 },
]

function formatHour(h: number): string {
  if (h === 0) return "12am"
  if (h < 12) return `${h}am`
  if (h === 12) return "12pm"
  return `${h - 12}pm`
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-IN", { month: "short", day: "numeric" })
}

interface TimeFilterProps {
  timeRange: [number, number] | null
  onTimeChange: (range: [number, number] | null) => void
  dateRange: { days: number; start: string | null; end: string | null }
  onDateChange: (range: { days: number; start: string | null; end: string | null }) => void
}

export function TimeFilter({ timeRange, onTimeChange, dateRange, onDateChange }: TimeFilterProps) {
  const [openPanel, setOpenPanel] = useState<"time" | "date" | null>(null)
  const [customStart, setCustomStart] = useState(0)
  const [customEnd, setCustomEnd] = useState(23)

  const timeLabel = timeRange
    ? TIME_PRESETS.find((p) => p.range[0] === timeRange[0] && p.range[1] === timeRange[1])?.label ||
      `${formatHour(timeRange[0])}–${formatHour(timeRange[1])}`
    : null

  const dateLabel = dateRange.start && dateRange.end
    ? `${formatDate(dateRange.start)}–${formatDate(dateRange.end)}`
    : `${dateRange.days}d`

  return (
    <>
      {/* Time button */}
      <div className="relative">
        <Button
          variant={timeRange ? "default" : "ghost"}
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={() => setOpenPanel(openPanel === "time" ? null : "time")}
        >
          <Clock className="h-3.5 w-3.5" />
          {timeLabel || "Time"}
          {timeRange ? (
            <button
              className="ml-0.5 hover:bg-primary-foreground/20 rounded-sm p-0.5"
              onClick={(e) => {
                e.stopPropagation()
                onTimeChange(null)
                setOpenPanel(null)
              }}
            >
              <X className="h-3 w-3" />
            </button>
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </Button>

        {openPanel === "time" && (
          <div className="absolute top-full mt-1.5 left-0 bg-background/95 backdrop-blur-md rounded-lg border shadow-xl p-3 w-60 space-y-3 z-10">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Filter by time
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {TIME_PRESETS.map((preset) => {
                const isActive =
                  timeRange && timeRange[0] === preset.range[0] && timeRange[1] === preset.range[1]
                return (
                  <button
                    key={preset.label}
                    className={`text-left p-1.5 rounded-md border text-xs transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-muted border-border"
                    }`}
                    onClick={() => {
                      onTimeChange(isActive ? null : preset.range)
                      setOpenPanel(null)
                    }}
                  >
                    <div className="font-medium leading-tight">{preset.label}</div>
                    <div className={`text-[10px] ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {preset.subtitle}
                    </div>
                  </button>
                )
              })}
            </div>
            <div className="space-y-1.5 pt-2 border-t">
              <p className="text-[10px] text-muted-foreground">Custom</p>
              <div className="flex items-center gap-1.5">
                <select
                  className="flex-1 h-6 rounded border bg-background px-1.5 text-[11px]"
                  value={customStart}
                  onChange={(e) => setCustomStart(Number(e.target.value))}
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{formatHour(i)}</option>
                  ))}
                </select>
                <span className="text-[11px] text-muted-foreground">–</span>
                <select
                  className="flex-1 h-6 rounded border bg-background px-1.5 text-[11px]"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(Number(e.target.value))}
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{formatHour(i)}</option>
                  ))}
                </select>
                <Button
                  size="sm"
                  className="h-6 px-2 text-[11px]"
                  onClick={() => {
                    onTimeChange([customStart, customEnd])
                    setOpenPanel(null)
                  }}
                >
                  Go
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Date button */}
      <div className="relative">
        <Button
          variant={dateRange.start ? "default" : "ghost"}
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={() => setOpenPanel(openPanel === "date" ? null : "date")}
        >
          <Calendar className="h-3.5 w-3.5" />
          {dateLabel}
          {dateRange.start ? (
            <button
              className="ml-0.5 hover:bg-primary-foreground/20 rounded-sm p-0.5"
              onClick={(e) => {
                e.stopPropagation()
                onDateChange({ days: 30, start: null, end: null })
                setOpenPanel(null)
              }}
            >
              <X className="h-3 w-3" />
            </button>
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </Button>

        {openPanel === "date" && (
          <DatePanel
            dateRange={dateRange}
            onDateChange={(v) => {
              onDateChange(v)
              setOpenPanel(null)
            }}
          />
        )}
      </div>
    </>
  )
}

function DatePanel({
  dateRange,
  onDateChange,
}: {
  dateRange: { days: number; start: string | null; end: string | null }
  onDateChange: (range: { days: number; start: string | null; end: string | null }) => void
}) {
  const today = new Date().toISOString().slice(0, 10)
  const [start, setStart] = useState(dateRange.start || "")
  const [end, setEnd] = useState(dateRange.end || today)

  return (
    <div className="absolute top-full mt-1.5 right-0 bg-background/95 backdrop-blur-md rounded-lg border shadow-xl p-3 w-56 space-y-3 z-10">
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
        Filter by date
      </p>

      {/* Quick presets */}
      <div className="flex gap-1.5">
        {DATE_PRESETS.map((preset) => {
          const isActive = !dateRange.start && dateRange.days === preset.days
          return (
            <button
              key={preset.days}
              className={`flex-1 py-1.5 rounded-md border text-xs font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-muted border-border"
              }`}
              onClick={() => onDateChange({ days: preset.days, start: null, end: null })}
            >
              {preset.label}
            </button>
          )
        })}
      </div>

      {/* Custom date range */}
      <div className="space-y-1.5 pt-2 border-t">
        <p className="text-[10px] text-muted-foreground">Custom range</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground w-8">From</span>
            <input
              type="date"
              className="flex-1 h-6 rounded border bg-background px-1.5 text-[11px]"
              value={start}
              max={today}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground w-8">To</span>
            <input
              type="date"
              className="flex-1 h-6 rounded border bg-background px-1.5 text-[11px]"
              value={end}
              max={today}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
          <Button
            size="sm"
            className="w-full h-6 text-[11px]"
            disabled={!start || !end}
            onClick={() => {
              if (start && end) {
                const diffMs = new Date(end).getTime() - new Date(start).getTime()
                const days = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
                onDateChange({ days, start, end })
              }
            }}
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  )
}
