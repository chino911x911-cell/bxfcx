// العقل الجمعي (Collective Mind - RAG 2.0)
// يبحث في الإنترنت في الوقت الحقيقي عن حلول

import ZAI from 'z-ai-web-dev-sdk'

export interface WebSolution {
  source: string
  url: string
  title: string
  snippet: string
  date: string
  type: 'answer' | 'discussion' | 'tutorial' | 'documentation' | 'issue'
  relevanceScore: number
  author?: string
  votes?: number
}

export interface ErrorSolution {
  error: string
  solutions: {
    solution: string
    source: string
    confidence: 'high' | 'medium' | 'low'
    code?: string
    explanation?: string
    votes?: number
  }[]
  relatedIssues: string[]
  preventionTips: string[]
}

export interface LiveKnowledge {
  topic: string
  latestInfo: string
  changes: string[]
  trending: boolean
  confidence: number
  sources: string[]
  lastUpdated: string
}

export class CollectiveMind {
  private zai: Awaited<ReturnType<typeof ZAI.create>> | null = null

  async initialize() {
    this.zai = await ZAI.create()
  }

  // البحث عن حل لخطأ برمجي
  async findErrorSolution(errorMessage: string): Promise<ErrorSolution> {
    if (!this.zai) await this.initialize()

    // البحث في الإنترنت
    const searchQuery = `"${errorMessage.substring(0, 100)}" fix solution 2024`
    
    const searchResults = await this.zai!.functions.invoke('web_search', {
      query: searchQuery,
      num: 10,
      recency_days: 30
    })

    // تحليل وترتيب النتائج
    const solutions = await this.analyzeSolutions(errorMessage, searchResults)

    // البحث عن مشاكل مرتبطة
    const relatedQuery = `${errorMessage.substring(0, 50)} related issues causes`
    const relatedResults = await this.zai!.functions.invoke('web_search', {
      query: relatedQuery,
      num: 5
    })

    const relatedIssues = relatedResults.slice(0, 5).map((r: { name: string }) => r.name)

    // نصائح الوقاية
    const preventionTips = this.extractPreventionTips(errorMessage, searchResults)

    return {
      error: errorMessage,
      solutions,
      relatedIssues,
      preventionTips
    }
  }

  // تحليل الحلول من نتائج البحث
  private async analyzeSolutions(
    errorMessage: string,
    searchResults: unknown[]
  ): Promise<ErrorSolution['solutions']> {
    if (!this.zai) await this.initialize()

    const results = searchResults as Array<{
      name: string
      snippet: string
      url: string
      host_name: string
      date: string
    }>

    const prompt = `Analyze these search results for solving this error:

Error: "${errorMessage.substring(0, 200)}"

Search Results:
${results.map((r, i) => `
${i + 1}. ${r.name}
   ${r.snippet}
   Source: ${r.host_name}
   URL: ${r.url}
`).join('\n')}

Extract and rank the solutions. For each solution provide:
- solution: brief description
- source: domain name
- confidence: high/medium/low based on relevance
- code: code snippet if available
- explanation: why this works
- votes: if available from StackOverflow

Return JSON array of solutions sorted by confidence.`

    const response = await this.zai!.chat.completions.create({
      model: 'gemini-2.0-flash',
      messages: [
        { role: 'system', content: 'أنت خبير تصحيح أخطاء برمجية. استخرج أفضل الحلول من نتائج البحث.' },
        { role: 'user', content: prompt }
      ]
    })

    try {
      const jsonMatch = response.content.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch {}

    // حلول افتراضية
    return results.slice(0, 3).map(r => ({
      solution: r.snippet,
      source: r.host_name,
      confidence: 'medium' as const,
      explanation: `من ${r.host_name}`
    }))
  }

  // استخراج نصائح الوقاية
  private extractPreventionTips(
    errorMessage: string,
    results: unknown[]
  ): string[] {
    const tips: string[] = []
    const errorMsg = errorMessage.toLowerCase()

    if (errorMsg.includes('null') || errorMsg.includes('undefined')) {
      tips.push('🔍 استخدم Optional Chaining (?.) للوصول الآمن')
      tips.push('📊 أضف Null Checks قبل الوصول للخصائص')
    }

    if (errorMsg.includes('type') || errorMsg.includes('typeerror')) {
      tips.push('📏 استخدم TypeScript للتحقق من الأنواع')
      tips.push('🧪 أضف Unit Tests للتحقق من القيم')
    }

    if (errorMsg.includes('async') || errorMsg.includes('await')) {
      tips.push('⏳ تأكد من استخدام await مع async')
      tips.push('🔄 استخدم try-catch مع العمليات غير المتزامنة')
    }

    if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
      tips.push('🌐 أضف Timeout للطلبات الشبكية')
      tips.push('🔁 نفذ Retry Logic للطلبات الفاشلة')
    }

    tips.push('📝 راجع الوثائق الرسمية للمكتبات المستخدمة')
    tips.push('🧹 حافظ على تحديث الـ dependencies')

    return tips
  }

  // الحصول على معلومات حية عن موضوع
  async getLiveKnowledge(topic: string): Promise<LiveKnowledge> {
    if (!this.zai) await this.initialize()

    // البحث عن أحدث المعلومات
    const results = await this.zai!.functions.invoke('web_search', {
      query: `${topic} latest updates changes 2024`,
      num: 10,
      recency_days: 7
    })

    // تحليل التغييرات
    const analysisPrompt = `Analyze the latest information about "${topic}":

${(results as Array<{ name: string; snippet: string; date: string }>).map(r => `
- ${r.name} (${r.date}): ${r.snippet}
`).join('\n')}

Provide:
1. Summary of latest info
2. List of recent changes/updates
3. Is this trending (true/false)?
4. Confidence level (0-100)
5. Sources used

JSON format.`

    const response = await this.zai!.chat.completions.create({
      model: 'gemini-2.0-flash',
      messages: [
        { role: 'system', content: 'أنت محلل معلومات. استخرج أحدث التغييرات والمعلومات.' },
        { role: 'user', content: analysisPrompt }
      ]
    })

    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          topic,
          latestInfo: parsed.latestInfo || parsed.summary,
          changes: parsed.changes || [],
          trending: parsed.trending || false,
          confidence: parsed.confidence || 70,
          sources: parsed.sources || [],
          lastUpdated: new Date().toISOString()
        }
      }
    } catch {}

    return {
      topic,
      latestInfo: response.content,
      changes: [],
      trending: false,
      confidence: 50,
      sources: [],
      lastUpdated: new Date().toISOString()
    }
  }

  // البحث في GitHub Issues
  async searchGitHubIssues(error: string): Promise<{
    issues: {
      title: string
      url: string
      status: 'open' | 'closed'
      comments: number
      created: string
    }[]
    recommendedSolution?: string
  }> {
    if (!this.zai) await this.initialize()

    const searchQuery = `site:github.com "${error.substring(0, 80)}" issue`
    
    const results = await this.zai!.functions.invoke('web_search', {
      query: searchQuery,
      num: 10
    })

    const issues = (results as Array<{
      name: string
      url: string
      snippet: string
      date: string
    }>).filter(r => r.url.includes('github.com') && r.url.includes('issue'))
      .map(r => ({
        title: r.name,
        url: r.url,
        status: r.url.includes('issues') ? 'open' as const : 'closed' as const,
        comments: 0,
        created: r.date
      }))

    // البحث عن حل مقترح
    if (issues.length > 0) {
      const solutionQuery = `${error.substring(0, 60)} github solution workaround`
      const solutionResults = await this.zai!.functions.invoke('web_search', {
        query: solutionQuery,
        num: 5
      })

      if (solutionResults.length > 0) {
        return {
          issues,
          recommendedSolution: (solutionResults[0] as { snippet: string }).snippet
        }
      }
    }

    return { issues }
  }

  // مقارنة المكتبات في الوقت الحقيقي
  async compareLibraries(
    lib1: string,
    lib2: string
  ): Promise<{
    library1: { name: string; stars: number; downloads: string; lastUpdate: string; trending: string }
    library2: { name: string; stars: number; downloads: string; lastUpdate: string; trending: string }
    winner: string
    recommendation: string
  }> {
    if (!this.zai) await this.initialize()

    const [results1, results2] = await Promise.all([
      this.zai!.functions.invoke('web_search', {
        query: `${lib1} github stars npm downloads 2024`,
        num: 5
      }),
      this.zai!.functions.invoke('web_search', {
        query: `${lib2} github stars npm downloads 2024`,
        num: 5
      })
    ])

    const analysisPrompt = `Compare these two libraries:

${lib1}:
${(results1 as Array<{ name: string; snippet: string }>).map(r => `- ${r.name}: ${r.snippet}`).join('\n')}

${lib2}:
${(results2 as Array<{ name: string; snippet: string }>).map(r => `- ${r.name}: ${r.snippet}`).join('\n')}

Provide comparison with:
- GitHub stars (estimate if not found)
- NPM weekly downloads (estimate)
- Last update date
- Trending direction (rising/stable/declining)
- Overall winner and recommendation

JSON format.`

    const response = await this.zai!.chat.completions.create({
      model: 'gemini-2.0-flash',
      messages: [
        { role: 'system', content: 'أنت محلل مكتبات برمجية. قارن بشكل موضوعي.' },
        { role: 'user', content: analysisPrompt }
      ]
    })

    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch {}

    return {
      library1: { name: lib1, stars: 0, downloads: 'unknown', lastUpdate: 'unknown', trending: 'stable' },
      library2: { name: lib2, stars: 0, downloads: 'unknown', lastUpdate: 'unknown', trending: 'stable' },
      winner: 'unknown',
      recommendation: response.content
    }
  }
}

// تنسيق حل الخطأ
export function formatErrorSolution(solution: ErrorSolution): string {
  const lines: string[] = []

  lines.push('🧠 العقل الجمعي - Collective Mind')
  lines.push('═'.repeat(50))
  lines.push('')

  lines.push(`🐛 الخطأ:`)
  lines.push(solution.error.substring(0, 300))
  lines.push('')

  if (solution.solutions.length > 0) {
    lines.push(`✅ الحلول المكتشفة:`)
    solution.solutions.forEach((s, i) => {
      const confidenceEmoji = { high: '🟢', medium: '🟡', low: '🔴' }[s.confidence]
      lines.push(``)
      lines.push(`${i + 1}. ${confidenceEmoji} [${s.confidence.toUpperCase()}] ${s.solution}`)
      lines.push(`   📍 المصدر: ${s.source}`)
      if (s.code) {
        lines.push(`   💻 الكود:`)
        lines.push(`   ${s.code.split('\n').join('\n   ')}`)
      }
      if (s.explanation) {
        lines.push(`   💡 ${s.explanation}`)
      }
    })
  }

  if (solution.preventionTips.length > 0) {
    lines.push('')
    lines.push(`🛡️ نصائح الوقاية:`)
    solution.preventionTips.forEach(t => lines.push(`   ${t}`))
  }

  return lines.join('\n')
}
