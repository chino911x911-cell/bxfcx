import { NextRequest, NextResponse } from 'next/server'
import { getZAI, withRetry } from '@/lib/zai-client'
import { DNAEngine, checkCodeAgainstDNA, formatDNAForDisplay, type ProjectDNA } from '@/lib/dna-engine'

interface AnalyzeRequest {
  files: { name: string; content: string; path: string }[]
  action: 'extract-dna' | 'check-consistency'
  code?: string
  fileName?: string
  existingDNA?: ProjectDNA
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json()
    const { files, action, code, fileName, existingDNA } = body

    // Validation
    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Action is required' },
        { status: 400 }
      )
    }

    if (action === 'extract-dna') {
      if (!files || files.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Files are required for DNA extraction' },
          { status: 400 }
        )
      }

      const engine = new DNAEngine(files)
      const dna = engine.extract()
      
      const zai = await getZAI()
      const analysisResponse = await withRetry(async () =>
        zai.chat.completions.create({
          messages: [
            { 
              role: 'assistant', 
              content: `You are an expert in code pattern analysis. Analyze the project DNA and provide:
1. Distinctive patterns in the project
2. Code strengths
3. Areas needing improvement
4. Actionable recommendations for code quality

Be concise and specific.`
            },
            { 
              role: 'user', 
              content: `Project DNA:\n${JSON.stringify(formatDNAForDisplay(dna), null, 2)}` 
            }
          ],
          thinking: { type: 'disabled' }
        })
      )

      const analysis = analysisResponse.choices?.[0]?.message?.content || ''

      return NextResponse.json({ 
        success: true, 
        dna,
        formattedDNA: formatDNAForDisplay(dna),
        analysis
      })
    }

    if (action === 'check-consistency') {
      if (!code || !fileName || !existingDNA) {
        return NextResponse.json(
          { success: false, error: 'Code, fileName, and existingDNA are required for consistency check' },
          { status: 400 }
        )
      }

      const result = checkCodeAgainstDNA(code, fileName, existingDNA)
      
      return NextResponse.json({ 
        success: true, 
        result 
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' }, 
      { status: 400 }
    )

  } catch (error) {
    console.error('DNA Analysis error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { success: false, error: `DNA analysis failed: ${message}` },
      { status: 500 }
    )
  }
}
