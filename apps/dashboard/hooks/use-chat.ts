"use client"

import { useState, useCallback } from "react"
import { apiFetch } from "@/lib/api"

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ChatResponse {
  response: string
  suggestions: string[]
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "👋 Hi! I'm your AI inventory assistant. I can help you with:\n\n- 📦 Inventory status\n- 💰 Sales summaries\n- 🔔 Restock recommendations\n- 📄 CSV data analysis\n\nWhat would you like to know?",
      timestamp: new Date(),
    },
  ])
  const [suggestions, setSuggestions] = useState<string[]>([
    "Show inventory status",
    "Show sales summary",
    "What should I restock?",
  ])
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = useCallback(async (text: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setIsLoading(true)
    setSuggestions([])

    try {
      const data = await apiFetch<ChatResponse>("/ai/chat", {
        method: "POST",
        body: JSON.stringify({ message: text }),
      })

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMsg])
      setSuggestions(data.suggestions || [])
    } catch {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMsg])
      setSuggestions(["Help", "Show inventory status"])
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { messages, suggestions, isLoading, sendMessage }
}
