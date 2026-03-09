import { NextRequest, NextResponse } from 'next/server'

interface ChatRequest {
  message: string
  history?: { role: 'user' | 'assistant' | 'system'; content: string }[]
  provider?: string
  apiKey?: string
  model?: string
}

// API Call functions (same as analyze)
async function callOpenRouter(apiKey: string, messages: { role: string; content: string }[], model?: string) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://smart-dev-hub.local',
      'X-Title': 'Smart Dev Hub'
    },
    body: JSON.stringify({
      model: model || 'anthropic/claude-3-haiku',
      messages
    })
  })

  if (!response.ok) {
    throw new Error(`OpenRouter: ${response.status}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

async function callGemini(apiKey: string, messages: { role: string; content: string }[], model?: string) {
  const contents = messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }))
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-1.5-flash'}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents })
  })

  if (!response.ok) throw new Error(`Gemini: ${response.status}`)

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

async function callOllama(messages: { role: string; content: string }[], model?: string) {
  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model || 'llama3',
      messages,
      stream: false
    })
  })

  if (!response.ok) throw new Error(`Ollama: ${response.status}`)

  const data = await response.json()
  return data.message?.content || ''
}

async function callXAI(apiKey: string, messages: { role: string; content: string }[], model?: string) {
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model || 'grok-beta',
      messages
    })
  })

  if (!response.ok) throw new Error(`XAI: ${response.status}`)

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

const SYSTEM_PROMPT = `You are a helpful coding assistant for "Smart Dev Hub" - a code analysis platform.

Help users with:
- Code analysis and bug detection
- Performance optimization
- Security vulnerabilities
- Platform guidance

Be helpful, concise, and respond in the user's language.`

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const { message, history = [], provider, apiKey, model } = body

    if (!message?.trim()) {
      return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 })
    }

    if (!provider) {
      return NextResponse.json({ success: false, error: 'Please configure a provider in Settings' }, { status: 400 })
    }

    if (provider !== 'ollama' && !apiKey) {
      return NextResponse.json({ success: false, error: `Please add your ${provider} API key in Settings` }, { status: 400 })
    }

    // Build messages array
    const messages: { role: string; content: string }[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-10),
      { role: 'user', content: message }
    ]

    let response = ''

    switch (provider) {
      case 'openrouter':
        response = await callOpenRouter(apiKey!, messages, model)
        break
      case 'gemini':
        response = await callGemini(apiKey!, messages, model)
        break
      case 'ollama':
        response = await callOllama(messages, model)
        break
      case 'xai':
        response = await callXAI(apiKey!, messages, model)
        break
      default:
        return NextResponse.json({ success: false, error: `Unknown provider: ${provider}` }, { status: 400 })
    }

    return NextResponse.json({ success: true, response })

  } catch (error) {
    console.error('Chat error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
