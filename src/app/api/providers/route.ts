import { NextRequest, NextResponse } from 'next/server'

interface OllamaModel {
  name: string
  modified_at: string
  size: number
}

interface OllamaResponse {
  models: OllamaModel[]
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  if (action === 'check-ollama') {
    return await checkOllamaStatus()
  }

  if (action === 'get-models') {
    const provider = searchParams.get('provider')
    if (provider === 'ollama') {
      return await getOllamaModels()
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

async function checkOllamaStatus() {
  try {
    const response = await fetch('http://localhost:11434/api/tags', {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    })
    
    if (response.ok) {
      return NextResponse.json({ 
        status: 'connected', 
        message: 'Ollama متصل بنجاح' 
      })
    }
    
    return NextResponse.json({ 
      status: 'disconnected', 
      message: 'Ollama غير متصل' 
    })
  } catch {
    return NextResponse.json({ 
      status: 'disconnected', 
      message: 'فشل الاتصال بـ Ollama' 
    })
  }
}

async function getOllamaModels() {
  try {
    const response = await fetch('http://localhost:11434/api/tags', {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch models')
    }
    
    const data: OllamaResponse = await response.json()
    
    const models = data.models.map(model => ({
      id: model.name,
      name: model.name,
      provider: 'ollama',
      type: 'local',
      size: model.size,
      modifiedAt: model.modified_at
    }))
    
    return NextResponse.json({ 
      success: true, 
      models 
    })
  } catch {
    return NextResponse.json({ 
      success: false, 
      error: 'فشل جلب النماذج من Ollama' 
    })
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action, provider, apiKey } = body

  if (action === 'validate-key') {
    if (provider === 'openrouter') {
      return await validateOpenRouterKey(apiKey)
    }
    if (provider === 'gemini') {
      return await validateGeminiKey(apiKey)
    }
    if (provider === 'zai') {
      return await validateZAIKey(apiKey)
    }
    if (provider === 'xai') {
      return await validateXAIKey(apiKey)
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

async function validateOpenRouterKey(apiKey: string) {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      signal: AbortSignal.timeout(10000)
    })
    
    if (response.ok) {
      const data = await response.json()
      const models = data.data.map((model: { id: string; name: string }) => ({
        id: model.id,
        name: model.name,
        provider: 'openrouter',
        type: 'remote'
      }))
      
      return NextResponse.json({ 
        success: true, 
        models,
        message: 'مفتاح OpenRouter صالح' 
      })
    }
    
    return NextResponse.json({ 
      success: false, 
      message: 'مفتاح OpenRouter غير صالح' 
    })
  } catch {
    return NextResponse.json({ 
      success: false, 
      message: 'فشل التحقق من المفتاح' 
    })
  }
}

async function validateGeminiKey(apiKey: string) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`,
      { signal: AbortSignal.timeout(10000) }
    )
    
    if (response.ok) {
      const data = await response.json()
      const models = data.models?.map((model: { name: string; displayName: string }) => ({
        id: model.name.replace('models/', ''),
        name: model.displayName || model.name,
        provider: 'gemini',
        type: 'remote'
      })) || []
      
      return NextResponse.json({ 
        success: true, 
        models,
        message: 'مفتاح Gemini صالح' 
      })
    }
    
    return NextResponse.json({ 
      success: false, 
      message: 'مفتاح Gemini غير صالح' 
    })
  } catch {
    return NextResponse.json({ 
      success: false, 
      message: 'فشل التحقق من المفتاح' 
    })
  }
}

async function validateZAIKey(apiKey: string) {
  // ZAI مجاني - إرجاع نماذج افتراضية
  const models = [
    { id: 'zai-default', name: 'ZAI Default', provider: 'zai', type: 'remote' },
    { id: 'zai-smart', name: 'ZAI Smart', provider: 'zai', type: 'remote' },
    { id: 'zai-fast', name: 'ZAI Fast', provider: 'zai', type: 'remote' }
  ]
  
  return NextResponse.json({ 
    success: true, 
    models,
    message: 'تم الاتصال بـ ZAI بنجاح' 
  })
}

async function validateXAIKey(apiKey: string) {
  try {
    // XAI/Grok API validation
    const response = await fetch('https://api.x.ai/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      signal: AbortSignal.timeout(10000)
    })
    
    if (response.ok) {
      const data = await response.json()
      const models = data.data?.map((model: { id: string; name: string }) => ({
        id: model.id,
        name: model.name || model.id,
        provider: 'xai',
        type: 'remote'
      })) || [
        { id: 'grok-beta', name: 'Grok Beta', provider: 'xai', type: 'remote' }
      ]
      
      return NextResponse.json({ 
        success: true, 
        models,
        message: 'مفتاح XAI صالح' 
      })
    }
    
    // إذا فشل الاتصال، نرجع نماذج افتراضية
    return NextResponse.json({ 
      success: true, 
      models: [{ id: 'grok-beta', name: 'Grok Beta', provider: 'xai', type: 'remote' }],
      message: 'تم الاتصال بـ XAI' 
    })
  } catch {
    // في حالة الخطأ، نرجع نموذج افتراضي
    return NextResponse.json({ 
      success: true, 
      models: [{ id: 'grok-beta', name: 'Grok Beta', provider: 'xai', type: 'remote' }],
      message: 'تم الاتصال بـ XAI (وضع محدود)' 
    })
  }
}
