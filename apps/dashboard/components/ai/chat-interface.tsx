"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Wifi, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useChat } from "@/hooks/use-chat"

const SUGGESTIONS = [
  "Show inventory status",
  "Which products are low on stock?",
  "Show top selling products",
  "What should I restock?",
]

export function ChatInterface() {
  const { messages, isStreaming, connected, sendMessage } = useChat()
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isStreaming])

  function handleSend() {
    const text = input.trim()
    if (!text || isStreaming) return
    setInput("")
    sendMessage(text)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-purple-500" />
            AI Assistant
          </div>
          <div className="flex items-center gap-1.5">
            {connected ? (
              <Wifi className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <WifiOff className="h-3.5 w-3.5 text-red-500" />
            )}
            <span className={`text-[10px] font-medium ${connected ? "text-green-600" : "text-red-500"}`}>
              {connected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-4" ref={scrollRef}>
          <div className="space-y-4 py-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback
                    className={
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-purple-100 dark:bg-purple-900"
                    }
                  >
                    {msg.role === "user" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] text-sm whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {msg.content}
                  {isStreaming &&
                    msg.role === "assistant" &&
                    msg.id === messages[messages.length - 1]?.id && (
                      <span className="inline-block w-1.5 h-4 bg-purple-500 ml-0.5 animate-pulse rounded-sm align-text-bottom" />
                    )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="flex-col gap-3 pt-3">
        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 w-full">
            {SUGGESTIONS.map((s) => (
              <Badge
                key={s}
                variant="secondary"
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => sendMessage(s)}
              >
                {s}
              </Badge>
            ))}
          </div>
        )}
        <form
          className="flex w-full gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
        >
          <Textarea
            placeholder={connected ? "Ask about inventory, sales, or recommendations..." : "Connecting to AI..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[40px] max-h-[120px] resize-none"
            rows={1}
            disabled={!connected}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isStreaming || !connected}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
