import { NextRequest, NextResponse } from 'next/server'
import { VisualArchitect, formatVisualResult } from '@/lib/visual-architect'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, imageUrl, code } = body

    const architect = new VisualArchitect()
    await architect.initialize()

    if (action === 'analyze-image' && imageUrl) {
      const result = await architect.analyzeImage(imageUrl)
      return NextResponse.json({ 
        success: true, 
        result,
        formatted: formatVisualResult(result)
      })
    }

    if (action === 'code-to-diagram' && code) {
      const result = await architect.codeToDiagram(code)
      return NextResponse.json({ success: true, result })
    }

    if (action === 'analyze-screenshot' && imageUrl) {
      const result = await architect.analyzeScreenshot(imageUrl)
      return NextResponse.json({ success: true, result })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Visual Architect error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في التحليل البصري' },
      { status: 500 }
    )
  }
}
