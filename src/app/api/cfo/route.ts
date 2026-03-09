import { NextRequest, NextResponse } from 'next/server'
import { CFOAgent, formatCostReport } from '@/lib/cfo-agent'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, code, files, estimation, provider } = body

    const agent = new CFOAgent(provider || 'aws')

    if (action === 'analyze-function' && code) {
      const result = agent.analyzeFunction(code, body.estimatedCalls || 10000)
      return NextResponse.json({ success: true, result })
    }

    if (action === 'analyze-project' && files && estimation) {
      const result = agent.analyzeProject(files, estimation)
      return NextResponse.json({ 
        success: true, 
        result,
        formatted: formatCostReport(result)
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('CFO Agent error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في تحليل التكاليف' },
      { status: 500 }
    )
  }
}
