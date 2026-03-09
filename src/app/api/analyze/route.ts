import { NextRequest, NextResponse } from 'next/server'

interface AnalysisRequest {
  code: string
  fileName: string
  persona?: {
    id: string
    name: string
    systemPrompt: string
    focusKeywords: string[]
  }
  mode?: 'fix' | 'audit' | 'security' | 'web3'
  provider?: string
  apiKey?: string
  model?: string
}

interface AnalysisIssue {
  id: string
  line: number
  type: 'error' | 'warning' | 'info'
  message: string
  suggestion?: string
}

const MODE_PROMPTS = {
  fix: 'Focus on fixing errors and correcting code. Provide the complete fixed code.',
  audit: 'Perform a comprehensive code review. Look for performance and quality issues.',
  security: 'Focus only on security vulnerabilities. Look for XSS, SQL Injection, CSRF.',
  web3: 'Analyze as smart contracts. Look for Reentrancy, Gas optimization.'
}

// Call OpenRouter API
async function callOpenRouter(apiKey: string, systemPrompt: string, userMessage: string, model?: string) {
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

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

// Call Gemini API
async function callGemini(apiKey: string, systemPrompt: string, userMessage: string, model?: string) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-1.5-flash'}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: `${systemPrompt}\n\n${userMessage}` }
          ]
        }
      ]
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Gemini API error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

// Call Ollama (local)
async function callOllama(systemPrompt: string, userMessage: string, model?: string) {
  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model || 'llama3',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      stream: false
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Ollama error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  return data.message?.content || ''
}

// Call XAI (Grok) API
async function callXAI(apiKey: string, systemPrompt: string, userMessage: string, model?: string) {
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

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`XAI API error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalysisRequest = await request.json()
    const { code, fileName, persona, mode, provider, apiKey, model } = body

    // Validation
    if (!code?.trim()) {
      return NextResponse.json({ success: false, error: 'Code is required' }, { status: 400 })
    }

    if (!fileName?.trim()) {
      return NextResponse.json({ success: false, error: 'File name is required' }, { status: 400 })
    }

    // Check provider and API key
    if (!provider) {
      return NextResponse.json({ success: false, error: 'Please select a provider in Settings' }, { status: 400 })
    }

    if (provider !== 'ollama' && !apiKey) {
      return NextResponse.json({ success: false, error: `Please add your ${provider} API key in Settings` }, { status: 400 })
    }

    const systemPrompt = `${persona?.systemPrompt || 'You are an expert code analyzer.'}

${MODE_PROMPTS[mode || 'fix']}

Important: Analyze code line by line. For each issue provide: line, type (error/warning/info), message, suggestion.

Respond ONLY as JSON:
{"issues": [{"line": 10, "type": "error", "message": "desc", "suggestion": "fix"}], "fixedCode": "code", "summary": "summary", "score": 85}`

    const userMessage = `File: ${fileName}\n\nCode:\n\`\`\`\n${code}\n\`\`\``

    let responseContent = ''

    // Call the appropriate provider
    switch (provider) {
      case 'openrouter':
        responseContent = await callOpenRouter(apiKey!, systemPrompt, userMessage, model)
        break
      case 'gemini':
        responseContent = await callGemini(apiKey!, systemPrompt, userMessage, model)
        break
      case 'ollama':
        responseContent = await callOllama(systemPrompt, userMessage, model)
        break
      case 'xai':
        responseContent = await callXAI(apiKey!, systemPrompt, userMessage, model)
        break
      default:
        return NextResponse.json({ success: false, error: `Unknown provider: ${provider}` }, { status: 400 })
    }

    // Parse JSON response
    let analysisResult
    try {
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found')
      }
    } catch {
      analysisResult = {
        issues: [{ line: 1, type: 'info' as const, message: 'Analysis completed', suggestion: responseContent.substring(0, 200) }],
        fixedCode: code,
        summary: responseContent.substring(0, 500),
        score: 70
      }
    }

    const result = {
      fileId: `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fileName,
      issues: (analysisResult.issues || []).map((issue: AnalysisIssue, idx: number) => ({
        ...issue,
        id: `issue-${idx}`
      })),
      fixedCode: analysisResult.fixedCode || code,
      summary: analysisResult.summary || 'Analysis completed',
      score: typeof analysisResult.score === 'number' ? analysisResult.score : 70
    }

    return NextResponse.json({ success: true, result })

  } catch (error) {
    console.error('Analysis error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
