import { NextRequest, NextResponse } from 'next/server'

interface LabRequest {
  code: string
  action: 'simulate' | 'transform' | 'document'
  language?: string
  provider?: string
  apiKey?: string
  model?: string
}

// API call function
async function callLLM(provider: string, apiKey: string | undefined, systemPrompt: string, userMessage: string, model?: string): Promise<string> {
  switch (provider) {
    case 'openrouter': {
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
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ]
        })
      })
      if (!response.ok) throw new Error(`OpenRouter: ${response.status}`)
      const data = await response.json()
      return data.choices?.[0]?.message?.content || ''
    }
    
    case 'gemini': {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-1.5-flash'}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\n${userMessage}` }] }]
        })
      })
      if (!response.ok) throw new Error(`Gemini: ${response.status}`)
      const data = await response.json()
      return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    }
    
    case 'ollama': {
      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model || 'llama3',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          stream: false
        })
      })
      if (!response.ok) throw new Error(`Ollama: ${response.status}`)
      const data = await response.json()
      return data.message?.content || ''
    }
    
    case 'xai': {
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model || 'grok-beta',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ]
        })
      })
      if (!response.ok) throw new Error(`XAI: ${response.status}`)
      const data = await response.json()
      return data.choices?.[0]?.message?.content || ''
    }
    
    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
}

function extractCode(content: string, language?: string): string {
  const pattern = language 
    ? new RegExp(`\`\`\`${language}\\n?([\\s\\S]*?)\`\`\``)
    : /```[\w]*\n?([\s\S]*?)```/
  const match = content.match(pattern)
  return match ? match[1].trim() : content
}

export async function POST(request: NextRequest) {
  try {
    const body: LabRequest = await request.json()
    const { code, action, language = 'javascript', provider, apiKey, model } = body

    if (!code?.trim()) {
      return NextResponse.json({ success: false, error: 'Code is required' }, { status: 400 })
    }

    if (!provider) {
      return NextResponse.json({ success: false, error: 'Please select a provider in Settings' }, { status: 400 })
    }

    if (provider !== 'ollama' && !apiKey) {
      return NextResponse.json({ success: false, error: `Please add your ${provider} API key in Settings` }, { status: 400 })
    }

    const userMessage = `Language: ${language}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\``
    
    let systemPrompt = ''
    let result: Record<string, unknown> = {}

    switch (action) {
      case 'simulate':
        systemPrompt = `You are a code simulation engine. Analyze code for bugs, edge cases, and performance.

Respond ONLY as JSON:
{"executionTime": "~1ms", "memoryUsage": "Minimal", "issues": ["issue1"], "suggestions": ["suggestion1"], "risks": ["risk1"]}`
        const simResponse = await callLLM(provider, apiKey, systemPrompt, userMessage, model)
        try {
          const jsonMatch = simResponse.match(/\{[\s\S]*\}/)
          result = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: simResponse }
        } catch {
          result = { summary: simResponse }
        }
        break

      case 'transform':
        systemPrompt = `You are a code transformer. Convert experimental code to production-ready code:
1. Remove debug statements
2. Add error handling
3. Optimize performance
4. Add documentation
5. Follow best practices

Return ONLY the improved code.`
        const transformResponse = await callLLM(provider, apiKey, systemPrompt, userMessage, model)
        const transformedCode = extractCode(transformResponse, language)
        result = {
          transformedCode,
          originalLength: code.length,
          newLength: transformedCode.length
        }
        break

      case 'document':
        systemPrompt = `You are a technical documentation expert. Create comprehensive README documentation in Markdown format.`
        const docResponse = await callLLM(provider, apiKey, systemPrompt, userMessage, model)
        result = { documentation: docResponse }
        break

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ success: true, ...result })

  } catch (error) {
    console.error('Lab error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
