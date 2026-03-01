"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { io, Socket } from "socket.io-client"

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm your AI inventory assistant powered by real-time intelligence. I can help you with:\n\n- Inventory status & stock alerts\n- Sales analysis & trends\n- Demand forecasting\n- Restock recommendations\n\nWhat would you like to know?",
      timestamp: new Date(),
    },
  ])
  const [isStreaming, setIsStreaming] = useState(false)
  const [connected, setConnected] = useState(false)

  const socketRef = useRef<Socket | null>(null)
  const streamingIdRef = useRef<string | null>(null)
  const streamingTextRef = useRef("")

  useEffect(() => {
    const socket = io("http://localhost:6000")
    socketRef.current = socket

    socket.on("connect", () => setConnected(true))
    socket.on("disconnect", () => setConnected(false))

    socket.on("ai:token", (data: { token: string }) => {
      streamingTextRef.current += data.token
      const currentId = streamingIdRef.current
      if (currentId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === currentId
              ? { ...msg, content: streamingTextRef.current }
              : msg
          )
        )
      }
    })

    socket.on("ai:done", (data: { text: string }) => {
      const currentId = streamingIdRef.current
      if (currentId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === currentId ? { ...msg, content: data.text } : msg
          )
        )
      }
      streamingIdRef.current = null
      streamingTextRef.current = ""
      setIsStreaming(false)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const sendMessage = useCallback((text: string) => {
    if (!socketRef.current || isStreaming) return

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    }

    const aiMsgId = `ai-${Date.now()}`
    const aiMsg: ChatMessage = {
      id: aiMsgId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    }

    streamingIdRef.current = aiMsgId
    streamingTextRef.current = ""
    setIsStreaming(true)
    setMessages((prev) => [...prev, userMsg, aiMsg])

    socketRef.current.emit("ai:message", { message: text })
  }, [isStreaming])

  return { messages, isStreaming, connected, sendMessage }
}
