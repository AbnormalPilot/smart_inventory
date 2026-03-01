"use client"

import { useState, useRef } from "react"
import { Upload, FileText, AlertTriangle, Lightbulb, Info } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"

interface AnalysisResult {
  summary: {
    fileName: string
    totalRows: number
    columns: string[]
    fileSize: string
  }
  insights: string[]
  warnings: string[]
  recommendations: string[]
}

export function CsvUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleUpload(file: File) {
    setIsUploading(true)
    setProgress(30)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      setProgress(60)

      const apiBase = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:7020") + "/api"
      const res = await fetch(`${apiBase}/ai/analyze-csv`, {
        method: "POST",
        body: formData,
      })

      setProgress(90)

      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Upload failed" }))
        throw new Error(error.message)
      }

      const data = await res.json()
      setResult(data)
      setProgress(100)
      toast.success("CSV analyzed successfully!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to analyze CSV")
    } finally {
      setIsUploading(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            CSV Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-medium">
              {isUploading ? "Analyzing..." : "Click to upload CSV"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Max 5MB, .csv files only</p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>
          {progress > 0 && <Progress value={progress} className="mt-3" />}
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Analysis Results</CardTitle>
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge variant="outline">{result.summary.fileName}</Badge>
              <Badge variant="outline">{result.summary.totalRows} rows</Badge>
              <Badge variant="outline">{result.summary.fileSize}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" defaultValue={["insights", "recommendations"]}>
              {result.insights.length > 0 && (
                <AccordionItem value="insights">
                  <AccordionTrigger>
                    <span className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-blue-500" />
                      Insights ({result.insights.length})
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-1">
                      {result.insights.map((insight, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-blue-500 mt-0.5">•</span>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )}

              {result.warnings.length > 0 && (
                <AccordionItem value="warnings">
                  <AccordionTrigger>
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      Warnings ({result.warnings.length})
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-1">
                      {result.warnings.map((warning, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-yellow-500 mt-0.5">•</span>
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )}

              {result.recommendations.length > 0 && (
                <AccordionItem value="recommendations">
                  <AccordionTrigger>
                    <span className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-green-500" />
                      Recommendations ({result.recommendations.length})
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-1">
                      {result.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
