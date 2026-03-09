import { NextRequest, NextResponse } from 'next/server'
import { CollectiveMind, formatErrorSolution } from '@/lib/collective-mind'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, error, topic, lib1, lib2 } = body

    const mind = new CollectiveMind()
    await mind.initialize()

    if (action === 'find-solution' && error) {
      const result = await mind.findErrorSolution(error)
      return NextResponse.json({ 
        success: true, 
        result,
        formatted: formatErrorSolution(result)
      })
    }

    if (action === 'live-knowledge' && topic) {
      const result = await mind.getLiveKnowledge(topic)
      return NextResponse.json({ success: true, result })
    }

    if (action === 'github-issues' && error) {
      const result = await mind.searchGitHubIssues(error)
      return NextResponse.json({ success: true, result })
    }

    if (action === 'compare-libs' && lib1 && lib2) {
      const result = await mind.compareLibraries(lib1, lib2)
      return NextResponse.json({ success: true, result })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Collective Mind error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في العقل الجمعي' },
      { status: 500 }
    )
  }
}
