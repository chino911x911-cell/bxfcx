import { NextRequest, NextResponse } from 'next/server'
import { FutureProofEngine, formatHealthReport } from '@/lib/future-proof-engine'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, libraryName, dependencies } = body

    const engine = new FutureProofEngine()
    await engine.initialize()

    if (action === 'analyze-library' && libraryName) {
      const result = await engine.analyzeLibrary(libraryName)
      return NextResponse.json({ success: true, result })
    }

    if (action === 'analyze-project' && dependencies) {
      const result = await engine.analyzeProject(dependencies)
      return NextResponse.json({ 
        success: true, 
        result,
        formatted: formatHealthReport(result)
      })
    }

    if (action === 'tech-news' && body.topic) {
      const result = await engine.getTechNews(body.topic)
      return NextResponse.json({ success: true, result })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Future-Proof Engine error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في محرك المستقبل' },
      { status: 500 }
    )
  }
}
