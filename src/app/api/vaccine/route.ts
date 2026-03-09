import { NextRequest, NextResponse } from 'next/server'
import { getZAI, withRetry } from '@/lib/zai-client'
import { VaccineEngine, formatVaccineResult } from '@/lib/vaccine-engine'

interface VaccineRequest {
  code: string
  language?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: VaccineRequest = await request.json()
    const { code, language = 'javascript' }

    // Validation
    if (!code?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Code is required' },
        { status: 400 }
      )
    }

    const engine = new VaccineEngine(code)
    engine.generateMutants()
    const result = engine.simulateTestRun()
    
    const zai = await getZAI()
    const analysisResponse = await withRetry(async () =>
      zai.chat.completions.create({
        messages: [
          { 
            role: 'assistant', 
            content: `You are a software testing expert. Analyze Mutation Testing results and provide practical, actionable recommendations for improving test quality. Be concise and specific.`
          },
          { 
            role: 'user', 
            content: `Vaccine Test Results:
- Immunity Score: ${result.mutationScore}%
- Total Mutants: ${result.totalMutants}
- Killed Mutants: ${result.killedMutants}
- Survived Mutants: ${result.survivedMutants}

Weak Spots:
${result.weakSpots.map(s => `- [${s.severity}] Line ${s.line}: ${s.message}`).join('\n')}

Provide brief recommendations for improving test coverage.`
          }
        ],
        thinking: { type: 'disabled' }
      })
    )

    const recommendations = analysisResponse.choices?.[0]?.message?.content || ''

    return NextResponse.json({ 
      success: true, 
      result,
      formattedResult: formatVaccineResult(result),
      recommendations
    })

  } catch (error) {
    console.error('Vaccine error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { success: false, error: `Vaccine test failed: ${message}` },
      { status: 500 }
    )
  }
}
