// محرك رادار المستقبل (Future-Proof Engine)
// يتصل بالإنترنت لفحص حالة المكتبات والتقنيات

import ZAI from 'z-ai-web-dev-sdk'

export interface TechTrend {
  name: string
  currentVersion: string
  latestVersion: string
  isDeprecated: boolean
  deprecationRisk: 'low' | 'medium' | 'high' | 'critical'
  trendDirection: 'rising' | 'stable' | 'declining' | 'dead'
  alternatives: string[]
  survivalScore: number // 0-100
  recommendation: string
  githubStars?: number
  npmDownloads?: number
  lastUpdate?: string
}

export interface ProjectHealthReport {
  overallScore: number
  technologies: TechTrend[]
  warnings: string[]
  recommendations: string[]
  migrationPaths: { from: string; to: string; effort: 'easy' | 'medium' | 'hard' }[]
}

export class FutureProofEngine {
  private zai: Awaited<ReturnType<typeof ZAI.create>> | null = null

  async initialize() {
    this.zai = await ZAI.create()
  }

  // البحث عن معلومات مكتبة معينة
  async analyzeLibrary(libraryName: string): Promise<TechTrend> {
    if (!this.zai) await this.initialize()

    // البحث في الإنترنت عن أحدث المعلومات
    const searchQuery = `${libraryName} latest version 2024 deprecated alternatives npm github stars`
    
    const searchResults = await this.zai!.functions.invoke('web_search', {
      query: searchQuery,
      num: 10
    })

    // تحليل النتائج باستخدام AI
    const analysisPrompt = `Analyze this library: ${libraryName}

Based on these search results:
${searchResults.map((r: { name: string; snippet: string; date: string }) => `
- ${r.name}: ${r.snippet} (${r.date})
`).join('\n')}

Provide a JSON response with:
{
  "currentVersion": "x.x.x",
  "latestVersion": "y.y.y",
  "isDeprecated": false,
  "deprecationRisk": "low|medium|high|critical",
  "trendDirection": "rising|stable|declining|dead",
  "alternatives": ["lib1", "lib2"],
  "survivalScore": 85,
  "recommendation": "Keep using / Migrate to X / Avoid",
  "githubStars": 50000,
  "npmDownloads": "2M/week",
  "lastUpdate": "2024-01-15"
}`

    const response = await this.zai!.chat.completions.create({
      model: 'gemini-2.0-flash',
      messages: [
        { role: 'system', content: 'You are a technology analyst. Provide accurate JSON data about libraries and frameworks.' },
        { role: 'user', content: analysisPrompt }
      ]
    })

    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0])
        return {
          name: libraryName,
          ...data
        }
      }
    } catch {}

    // قيم افتراضية
    return {
      name: libraryName,
      currentVersion: 'unknown',
      latestVersion: 'unknown',
      isDeprecated: false,
      deprecationRisk: 'low',
      trendDirection: 'stable',
      alternatives: [],
      survivalScore: 50,
      recommendation: 'Unable to analyze'
    }
  }

  // تحليل المشروع بالكامل
  async analyzeProject(
    dependencies: { name: string; version: string }[]
  ): Promise<ProjectHealthReport> {
    const technologies: TechTrend[] = []
    const warnings: string[] = []
    const recommendations: string[] = []

    for (const dep of dependencies.slice(0, 10)) { // تحليل أول 10 مكتبات
      const trend = await this.analyzeLibrary(dep.name)
      technologies.push(trend)

      if (trend.deprecationRisk === 'critical' || trend.deprecationRisk === 'high') {
        warnings.push(
          `🚨 ${dep.name}: خطر الإهمال ${trend.deprecationRisk === 'critical' ? 'حرج' : 'عالي'}! ${
            trend.alternatives.length > 0 ? `البديل المقترح: ${trend.alternatives[0]}` : ''
          }`
        )
      }

      if (trend.trendDirection === 'declining' || trend.trendDirection === 'dead') {
        recommendations.push(
          `⚠️ ${dep.name}: الاتجاه ${trend.trendDirection === 'dead' ? 'منتهي' : 'متراجع'}. يُنصح بالهجرة.`
        )
      }
    }

    const overallScore = Math.round(
      technologies.reduce((acc, t) => acc + t.survivalScore, 0) / technologies.length
    )

    const migrationPaths = technologies
      .filter(t => t.alternatives.length > 0 && t.deprecationRisk !== 'low')
      .map(t => ({
        from: t.name,
        to: t.alternatives[0],
        effort: t.deprecationRisk === 'critical' ? 'hard' : 'medium' as const
      }))

    return {
      overallScore,
      technologies,
      warnings,
      recommendations,
      migrationPaths
    }
  }

  // البحث عن ترند تقني معين
  async getTechNews(topic: string): Promise<{
    headlines: { title: string; source: string; date: string; url: string }[]
    summary: string
  }> {
    if (!this.zai) await this.initialize()

    const results = await this.zai!.functions.invoke('web_search', {
      query: `${topic} latest news trends 2024`,
      num: 10,
      recency_days: 7
    })

    const headlines = results.map((r: { name: string; host_name: string; date: string; url: string }) => ({
      title: r.name,
      source: r.host_name,
      date: r.date,
      url: r.url
    }))

    // توليد ملخص
    const summaryPrompt = `Summarize the latest news about ${topic} based on these headlines:
${headlines.map((h: { title: string }) => `- ${h.title}`).join('\n')}

Provide a brief summary in Arabic highlighting key trends and developments.`

    const summaryResponse = await this.zai!.chat.completions.create({
      model: 'gemini-2.0-flash',
      messages: [
        { role: 'system', content: 'أنت محلل تقني. لخص الأخبار بشكل موجز وواضح.' },
        { role: 'user', content: summaryPrompt }
      ]
    })

    return {
      headlines: headlines.slice(0, 5),
      summary: summaryResponse.content
    }
  }
}

// تنسيق التقرير للعرض
export function formatHealthReport(report: ProjectHealthReport): string {
  const lines: string[] = []

  lines.push('🌐 تقرير صحة المشروع - Future-Proof Analysis')
  lines.push('═'.repeat(50))
  lines.push('')
  lines.push(`📊 النتيجة الإجمالية: ${report.overallScore}/100`)
  lines.push('')

  if (report.warnings.length > 0) {
    lines.push('🚨 تحذيرات:')
    report.warnings.forEach(w => lines.push(`   ${w}`))
    lines.push('')
  }

  if (report.recommendations.length > 0) {
    lines.push('💡 توصيات:')
    report.recommendations.forEach(r => lines.push(`   ${r}`))
    lines.push('')
  }

  lines.push('📚 تحليل المكتبات:')
  report.technologies.forEach(t => {
    const riskEmoji = {
      low: '✅',
      medium: '⚠️',
      high: '🔴',
      critical: '💀'
    }[t.deprecationRisk]

    lines.push(`   ${riskEmoji} ${t.name}: ${t.survivalScore}% - ${t.trendDirection}`)
    if (t.alternatives.length > 0) {
      lines.push(`      البدائل: ${t.alternatives.slice(0, 3).join(', ')}`)
    }
  })

  return lines.join('\n')
}
