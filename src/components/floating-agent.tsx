/**
 * Floating Agent - Smart AI Assistant
 * Professional floating chat window with real AI integration
 */

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useAnalyzerStore } from '@/store/analyzer-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
  Bot, X, Send, Minimize2, Sparkles, 
  Code, Bug, Lightbulb, Zap, Loader2,
  AlertCircle, RefreshCw
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  error?: boolean
}

export function FloatingAgent() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! 👋 I am your Smart Dev Hub assistant.\n\nI can help you with:\n• 📝 Code analysis & bug fixes\n• ⚡ Performance optimization\n• 🔒 Security vulnerabilities\n• 🛠️ Platform guidance\n\nWhat would you like to know?',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const { addLog } = useAnalyzerStore()

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen, isMinimized])

  // Send message
  const handleSend = useCallback(async () => {
    if (!input.trim() || isTyping) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)
    setError(null)

    try {
      const history = messages
        .filter(m => !m.error)
        .slice(-10)
        .map(m => ({
          role: m.role,
          content: m.content
        }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          history
        })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to get response')
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
      addLog('info', `Agent: Responded to query`, 'agent')

    } catch (err) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        error: true
      }
      setMessages(prev => [...prev, errorMessage])
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsTyping(false)
    }
  }, [input, isTyping, messages, addLog])

  // Quick actions
  const quickActions = [
    { icon: Code, label: 'Analyze', action: 'How do I analyze my code?' },
    { icon: Bug, label: 'Fix Bug', action: 'Help me find and fix bugs' },
    { icon: Lightbulb, label: 'Improve', action: 'How can I improve my code?' },
    { icon: Zap, label: 'Optimize', action: 'Tips for code optimization' }
  ]

  // Retry last message
  const handleRetry = useCallback(() => {
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')
    if (lastUserMessage) {
      setMessages(prev => prev.filter(m => m.id !== lastUserMessage.id))
      setInput(lastUserMessage.content)
    }
  }, [messages])

  return (
    <>
      {/* Chat Window */}
      {isOpen && !isMinimized && (
        <div 
          className={cn(
            "fixed z-50 flex flex-col rounded-2xl shadow-2xl border backdrop-blur-sm",
            "bg-background/95 dark:bg-background/98 border-border",
            "bottom-24 left-6",
            "w-[400px] h-[550px]",
            "animate-in fade-in-0 zoom-in-95 duration-200"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-l from-violet-600 to-purple-600 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white">Smart Agent</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-white/70">Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                onClick={() => setIsMinimized(true)}
                title="Minimize"
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                onClick={() => setIsOpen(false)}
                title="Close"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5",
                      message.role === 'user'
                        ? "bg-primary text-primary-foreground rounded-bl-sm"
                        : message.error
                        ? "bg-destructive/10 text-destructive rounded-br-sm border border-destructive/20"
                        : "bg-muted rounded-br-sm"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    {message.error && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 h-7 text-xs gap-1"
                        onClick={handleRetry}
                      >
                        <RefreshCw className="w-3 h-3" />
                        Retry
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-br-sm px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error state */}
              {error && !isTyping && (
                <div className="flex justify-center">
                  <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Quick Actions */}
          {messages.length <= 2 && !isTyping && (
            <div className="px-4 pb-2">
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1.5"
                    onClick={() => setInput(action.action)}
                  >
                    <action.icon className="w-3.5 h-3.5" />
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t bg-muted/30">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 bg-background"
                disabled={isTyping}
              />
              <Button 
                onClick={handleSend} 
                disabled={!input.trim() || isTyping}
                size="icon"
                className="shrink-0"
              >
                {isTyping ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Minimized Bar */}
      {isOpen && isMinimized && (
        <button
          onClick={() => setIsMinimized(false)}
          className={cn(
            "fixed z-50 flex items-center gap-3 px-5 py-3 rounded-full shadow-lg",
            "bg-gradient-to-l from-violet-600 to-purple-600 text-white",
            "bottom-24 left-6",
            "hover:shadow-xl hover:scale-105 transition-all duration-200"
          )}
        >
          <Bot className="w-5 h-5" />
          <span className="text-sm font-medium">Smart Agent</span>
          <Sparkles className="w-4 h-4 opacity-70" />
          {messages.length > 1 && (
            <span className="w-5 h-5 bg-white/20 rounded-full text-xs flex items-center justify-center">
              {messages.length - 1}
            </span>
          )}
        </button>
      )}

      {/* Floating Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen)
          setIsMinimized(false)
        }}
        className={cn(
          "fixed z-40 w-16 h-16 rounded-full shadow-xl flex items-center justify-center transition-all duration-300",
          "bg-gradient-to-l from-violet-600 to-purple-600",
          "hover:shadow-2xl hover:scale-110",
          "bottom-6 left-6",
          "active:scale-95"
        )}
      >
        {isOpen ? (
          <X className="w-7 h-7 text-white" />
        ) : (
          <>
            <Bot className="w-7 h-7 text-white" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
          </>
        )}
      </button>
    </>
  )
}
