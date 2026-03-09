// وكيل الجدوى الاقتصادية (CFO Agent)
// يربط الكود بتكاليف السحابة والموارد

export interface CloudPricing {
  provider: 'aws' | 'azure' | 'gcp'
  region: string
  computeCostPerHour: number
  storageCostPerGB: number
  dataTransferPerGB: number
  lambdaPerMillion: number
  databasePerHour: number
}

export interface CostEstimation {
  monthlyUsers: number
  computeHours: number
  storageGB: number
  bandwidthGB: number
  databaseHours: number
  lambdaInvocations: number
}

export interface CodeCostAnalysis {
  functionName: string
  complexity: number
  estimatedExecutionTime: number // milliseconds
  memoryRequired: number // MB
  estimatedCalls: number
  currentCost: number // monthly
  optimizedCost: number // monthly
  savings: number
  savingsPercentage: number
  optimizations: string[]
}

export interface ProjectCostReport {
  totalMonthlyCost: number
  optimizedMonthlyCost: number
  totalSavings: number
  breakdown: {
    compute: number
    storage: number
    bandwidth: number
    database: number
    functions: number
  }
  recommendations: string[]
  functionAnalyses: CodeCostAnalysis[]
}

// أسعار السوق الحالية (تقريبية)
const CLOUD_PRICING: CloudPricing[] = [
  {
    provider: 'aws',
    region: 'us-east-1',
    computeCostPerHour: 0.0464, // t3.medium
    storageCostPerGB: 0.023, // S3
    dataTransferPerGB: 0.09,
    lambdaPerMillion: 0.20,
    databasePerHour: 0.018 // RDS t3.micro
  },
  {
    provider: 'gcp',
    region: 'us-central1',
    computeCostPerHour: 0.0347, // e2-medium
    storageCostPerGB: 0.020,
    dataTransferPerGB: 0.12,
    lambdaPerMillion: 0.40,
    databasePerHour: 0.015
  },
  {
    provider: 'azure',
    region: 'eastus',
    computeCostPerHour: 0.042,
    storageCostPerGB: 0.0184,
    dataTransferPerGB: 0.087,
    lambdaPerMillion: 0.20,
    databasePerHour: 0.016
  }
]

export class CFOAgent {
  private pricing: CloudPricing

  constructor(provider: 'aws' | 'azure' | 'gcp' = 'aws') {
    this.pricing = CLOUD_PRICING.find(p => p.provider === provider) || CLOUD_PRICING[0]
  }

  // تحليل تكلفة دالة برمجية
  analyzeFunction(
    code: string,
    estimatedCalls: number = 10000
  ): CodeCostAnalysis {
    // تحليل تعقيد الكود
    const complexity = this.calculateComplexity(code)
    
    // تقدير وقت التنفيذ بناءً على التعقيد
    const estimatedExecutionTime = this.estimateExecutionTime(code, complexity)
    
    // تقدير الذاكرة المطلوبة
    const memoryRequired = this.estimateMemory(code)
    
    // حساب التكلفة الحالية
    const executionSeconds = estimatedExecutionTime / 1000
    const gbSeconds = (memoryRequired / 1024) * executionSeconds * estimatedCalls
    const currentCost = (gbSeconds / 1000000) * this.pricing.lambdaPerMillion

    // تحسينات مقترحة
    const optimizations = this.suggestOptimizations(code)
    
    // تكلفة بعد التحسين
    const optimizedCost = currentCost * 0.4 // تقدير: 60% توفير

    return {
      functionName: this.extractFunctionName(code) || 'unknown',
      complexity,
      estimatedExecutionTime,
      memoryRequired,
      estimatedCalls,
      currentCost: Math.round(currentCost * 100) / 100,
      optimizedCost: Math.round(optimizedCost * 100) / 100,
      savings: Math.round((currentCost - optimizedCost) * 100) / 100,
      savingsPercentage: 60,
      optimizations
    }
  }

  // حساب تعقيد الكود
  private calculateComplexity(code: string): number {
    let complexity = 1
    
    // زيادة التعقيد لكل بنية تحكم
    const loops = (code.match(/for|while|forEach|map|filter|reduce/g) || []).length
    const conditionals = (code.match(/if|else|switch|case|?\s*:|&&|\|\|/g) || []).length
    const nestedFunctions = (code.match(/function|=>/g) || []).length
    
    complexity += loops * 2
    complexity += conditionals
    complexity += nestedFunctions * 0.5
    
    return complexity
  }

  // تقدير وقت التنفيذ
  private estimateExecutionTime(code: string, complexity: number): number {
    const baseTime = 10 // ms
    const lengthFactor = code.length / 1000
    return Math.round(baseTime * complexity * lengthFactor)
  }

  // تقدير الذاكرة
  private estimateMemory(code: string): number {
    // تقدير بسيط بناءً على حجم الكود والمتغيرات
    const variableCount = (code.match(/const|let|var/g) || []).length
    const arrayOperations = (code.match(/\[|\]|push|pop|shift/g) || []).length
    
    return Math.max(128, 128 + variableCount * 10 + arrayOperations * 50)
  }

  // اقتراح تحسينات
  private suggestOptimizations(code: string): string[] {
    const suggestions: string[] = []

    if (code.includes('for (let i = 0; i <') && code.includes('.length')) {
      suggestions.push('💡 استخدم for...of أو forEach بدلاً من for التقليدية')
    }

    if (code.includes('await') && (code.match(/await/g) || []).length > 1) {
      suggestions.push('💡 استخدم Promise.all() للعمليات المتوازية')
    }

    if (code.includes('JSON.parse') && code.includes('JSON.stringify')) {
      suggestions.push('💡 قلل من تحويلات JSON - استخدم الكائنات مباشرة')
    }

    if ((code.match(/console\.log/g) || []).length > 2) {
      suggestions.push('💡 أزل console.log في الإنتاج لتقليل التنفيذ')
    }

    if (code.includes('new Array') || code.includes('.push(')) {
      suggestions.push('💡 حدد حجم المصفوفة مسبقاً إذا كان معروفاً')
    }

    return suggestions
  }

  // استخراج اسم الدالة
  private extractFunctionName(code: string): string | null {
    const match = code.match(/(?:function\s+(\w+)|const\s+(\w+)\s*=|def\s+(\w+))/)
    return match ? match[1] || match[2] || match[3] : null
  }

  // تحليل تكلفة المشروع بالكامل
  analyzeProject(
    files: { name: string; content: string }[],
    estimation: CostEstimation
  ): ProjectCostReport {
    // تحليل كل دالة
    const functionAnalyses: CodeCostAnalysis[] = []
    
    for (const file of files) {
      const functions = this.extractFunctions(file.content)
      for (const func of functions) {
        const analysis = this.analyzeFunction(func.code, estimation.lambdaInvocations / files.length)
        functionAnalyses.push(analysis)
      }
    }

    // حساب التكاليف الإجمالية
    const compute = estimation.computeHours * this.pricing.computeCostPerHour * 24 * 30
    const storage = estimation.storageGB * this.pricing.storageCostPerGB
    const bandwidth = estimation.bandwidthGB * this.pricing.dataTransferPerGB
    const database = estimation.databaseHours * this.pricing.databasePerHour * 24 * 30
    const functions = functionAnalyses.reduce((acc, f) => acc + f.currentCost, 0)

    const totalMonthlyCost = compute + storage + bandwidth + database + functions
    const optimizedMonthlyCost = functionAnalyses.reduce((acc, f) => acc + f.optimizedCost, 0) + 
      compute * 0.7 + storage * 0.5 + database * 0.8

    const recommendations: string[] = []
    
    if (bandwidth > 100) {
      recommendations.push('🌐 استخدم CDN لتقليل تكلفة نقل البيانات بنسبة 60%')
    }
    
    if (functions > 50) {
      recommendations.push('⚡ دمج دوال Lambda المتشابهة لتقليل التكاليف')
    }

    if (compute > 200) {
      recommendations.push('💻 استخدم Reserved Instances لتوفير 40%')
    }

    return {
      totalMonthlyCost: Math.round(totalMonthlyCost * 100) / 100,
      optimizedMonthlyCost: Math.round(optimizedMonthlyCost * 100) / 100,
      totalSavings: Math.round((totalMonthlyCost - optimizedMonthlyCost) * 100) / 100,
      breakdown: {
        compute: Math.round(compute * 100) / 100,
        storage: Math.round(storage * 100) / 100,
        bandwidth: Math.round(bandwidth * 100) / 100,
        database: Math.round(database * 100) / 100,
        functions: Math.round(functions * 100) / 100
      },
      recommendations,
      functionAnalyses
    }
  }

  // استخراج الدوال من الكود
  private extractFunctions(code: string): { name: string; code: string }[] {
    const functions: { name: string; code: string }[] = []
    
    // استخراج دوال JavaScript/TypeScript
    const funcRegex = /(?:function\s+(\w+)\s*\([^)]*\)\s*\{[\s\S]*?\}|const\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>\s*\{[\s\S]*?\})/g
    let match
    
    while ((match = funcRegex.exec(code)) !== null) {
      functions.push({
        name: match[1] || match[2] || 'anonymous',
        code: match[0]
      })
    }

    return functions
  }
}

// تنسيق تقرير التكاليف
export function formatCostReport(report: ProjectCostReport): string {
  const lines: string[] = []

  lines.push('💰 تقرير التكاليف الاقتصادية')
  lines.push('═'.repeat(50))
  lines.push('')
  
  lines.push('📊 التكلفة الشهرية المتوقعة:')
  lines.push(`   💻 الحوسبة: $${report.breakdown.compute}`)
  lines.push(`   📦 التخزين: $${report.breakdown.storage}`)
  lines.push(`   🌐 النقل: $${report.breakdown.bandwidth}`)
  lines.push(`   🗄️ قاعدة البيانات: $${report.breakdown.database}`)
  lines.push(`   ⚡ الدوال: $${report.breakdown.functions}`)
  lines.push('   ' + '─'.repeat(30))
  lines.push(`   📍 الإجمالي: $${report.totalMonthlyCost}`)
  lines.push('')

  lines.push('💡 بعد التحسين:')
  lines.push(`   🎯 التكلفة المحسّنة: $${report.optimizedMonthlyCost}`)
  lines.push(`   ✨ التوفير الشهري: $${report.totalSavings}`)
  lines.push('')

  if (report.recommendations.length > 0) {
    lines.push('📝 التوصيات:')
    report.recommendations.forEach(r => lines.push(`   ${r}`))
  }

  return lines.join('\n')
}
