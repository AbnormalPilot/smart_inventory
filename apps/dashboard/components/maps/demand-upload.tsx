"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

const API_BASE = ""

interface UploadResult {
  message: string
  count: number
}

interface DemandUploadProps {
  onUploadComplete: () => void
}

export function DemandUpload({ onUploadComplete }: DemandUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (!file.name.endsWith(".csv")) {
      setError("Only CSV files are accepted")
      return
    }

    setUploading(true)
    setError(null)
    setResult(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch(`${API_BASE}/api/demand/upload-csv`, {
        method: "POST",
        body: formData,
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Upload failed")
        return
      }

      setResult({ message: data.message, count: data.count })
      onUploadComplete()
    } catch {
      setError("Network error — is the backend running?")
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card className="w-72 bg-background/80 backdrop-blur-md border-border/50 shadow-lg">
      <CardHeader className="pb-2 pt-3 px-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload Sales CSV
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }`}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            const file = e.dataTransfer.files[0]
            if (file) handleFile(file)
          }}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2 py-1">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Processing with AI...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <FileText className="h-6 w-6 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Drop CSV or click to upload
              </p>
            </div>
          )}
        </div>

        {result && (
          <div className="mt-2 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
            <span className="text-xs text-green-600">{result.message}</span>
          </div>
        )}

        {error && (
          <div className="mt-2 flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
            <span className="text-xs text-destructive">{error}</span>
          </div>
        )}

        <div className="mt-2">
          <Badge variant="outline" className="text-[10px] font-normal">
            CSV: product, date, time, lat, lng, qty
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
