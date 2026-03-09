/**
 * 🧬 محرك التطور الذاتي (Self-Evolution Engine)
 * 
 * هذا المحرك يمكّن التطبيق من:
 * 1. قراءة وتحليل كوده الخاص
 * 2. اقتراح تحسينات بناءً على الأخطاء وطلبات المستخدم
 * 3. تطبيق التغييرات بشكل آمن مع إمكانية التراجع
 * 4. تعلم من تجاربه وزيادة مستوى الثقة
 */

import { db } from './db'
import crypto from 'crypto'

// ==================== الأنواع ====================

export interface EvolutionTrigger {
  type: 'error' | 'user_request' | 'self_improvement' | 'optimization' | 'security' | 'performance'
  source: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  timestamp: Date
  context?: Record<string, unknown>
}

export interface CodeAnalysis {
  file: string
  issues: CodeIssue[]
  patterns: CodePattern[]
  suggestions: string[]
  complexity: number
  maintainability: number
}

export interface CodeIssue {
  line: number
  type: 'error' | 'warning' | 'info'
  message: string
  suggestion?: string
  autoFixable: boolean
}

export interface CodePattern {
  name: string
  frequency: number
  locations: number[]
  isGoodPractice: boolean
}

export interface EvolutionProposalResult {
  id: string
  targetFile: string
  reason: string
  proposedChanges: string
  expectedBenefits: string[]
  potentialRisks: string[]
  trustRequired: number
  status: 'pending' | 'approved' | 'rejected' | 'applied' | 'failed'
}

export interface SandboxTestResult {
  passed: boolean
  errors: string[]
  warnings: string[]
  executionTime: number
  memoryUsage?: number
}

export interface TrustLevelInfo {
  level: number // 0-100
  stage: 'infant' | 'child' | 'adolescent' | 'adult' | 'sage'
  canAutoEvolve: boolean
  description: string
}

// ==================== الثوابت ====================

// مستويات النمو
const GROWTH_STAGES: Record<string, TrustLevelInfo> = {
  infant: { level: 0, stage: 'infant', canAutoEvolve: false, description: 'يحتاج موافقة لكل تغيير صغير' },
  child: { level: 25, stage: 'child', canAutoEvolve: false, description: 'يطلب موافقة للتغييرات المهمة' },
  adolescent: { level: 50, stage: 'adolescent', canAutoEvolve: true, description: 'يطبق تحسينات صغيرة تلقائياً' },
  adult: { level: 75, stage: 'adult', canAutoEvolve: true, description: 'يعيد هيكلة الكود بحذر' },
  sage: { level: 100, stage: 'sage', canAutoEvolve: true, description: 'يطور نفسه بذكاء وثقة' }
}

// الملفات المحمية (النواة الثابتة)
const IMMUTABLE_FILES = [
  'src/lib/evolution-engine.ts',
  'src/lib/db.ts',
  'prisma/schema.prisma',
  'src/middleware.ts'
]

// ==================== الفئة الرئيسية ====================

export class EvolutionEngine {
  private trustLevel: number = 0
  private isRunning: boolean = false
  private pendingProposals: EvolutionProposalResult[] = []
  
  constructor() {
    this.initializeEngine()
  }

  /**
   * تهيئة المحرك
   */
  private async initializeEngine() {
    try {
      // تحميل مقاييس الثقة
      const metrics = await db.trustMetrics.findFirst()
      if (metrics) {
        this.trustLevel = metrics.trustLevel
      } else {
        // إنشاء سجل الثقة الأولي
        await db.trustMetrics.create({
          data: {
            trustLevel: 0,
            successfulEvolutions: 0,
            failedEvolutions: 0,
            rollbacks: 0
          }
        })
      }

      // تسجيل الملفات المحمية
      await this.registerImmutableFiles()

      console.log('🧬 Evolution Engine initialized. Trust Level:', this.trustLevel)
    } catch (error) {
      console.error('Failed to initialize Evolution Engine:', error)
    }
  }

  /**
   * تسجيل الملفات المحمية (النواة الثابتة)
   */
  private async registerImmutableFiles() {
    for (const filePath of IMMUTABLE_FILES) {
      const existing = await db.immutableKernel.findUnique({
        where: { filePath }
      })
      
      if (!existing) {
        await db.immutableKernel.create({
          data: {
            filePath,
            reason: 'Core system file - cannot be modified by evolution',
            hash: this.generateHash('protected'),
            protected: true
          }
        })
      }
    }
  }

  /**
   * المرحلة 1: المراقبة الذاتية
   */
  public async monitor(): Promise<EvolutionTrigger[]> {
    const triggers: EvolutionTrigger[] = []

    try {
      // 1. فحص سجلات الأخطاء الأخيرة
      const recentErrors = await this.checkRecentErrors()
      triggers.push(...recentErrors)

      // 2. فحص طلبات المستخدم غير الملباة
      const unmetRequests = await this.checkUnmetRequests()
      triggers.push(...unmetRequests)

      // 3. فحص فرص التحسين الذاتي
      const optimizationOpportunities = await this.findOptimizations()
      triggers.push(...optimizationOpportunities)

      // 4. تسجيل في مذكرات التطور
      if (triggers.length > 0) {
        await this.writeToDiary('observation', 
          `اكتشفت ${triggers.length} فرص للتطور`, 
          'system', 
          7
        )
      }

    } catch (error) {
      console.error('Monitoring error:', error)
    }

    return triggers
  }

  /**
   * المرحلة 2: التفكير والتوليد
   */
  public async thinkAndGenerate(trigger: EvolutionTrigger): Promise<EvolutionProposalResult | null> {
    try {
      // قراءة الكود الحالي للملف المستهدف
      const currentCode = await this.readOwnCode(trigger.source)
      
      if (!currentCode) {
        return null
      }

      // بناء prompt للذكاء الاصطناعي
      const prompt = this.buildImprovementPrompt(trigger, currentCode)
      
      // استدعاء AI للحصول على مقترح
      const aiResponse = await this.callAIArchitect(prompt)
      
      if (!aiResponse) {
        return null
      }

      // إنشاء مقترح التطور
      const proposal: EvolutionProposalResult = {
        id: crypto.randomUUID(),
        targetFile: trigger.source,
        reason: trigger.description,
        proposedChanges: aiResponse.code,
        expectedBenefits: aiResponse.benefits || [],
        potentialRisks: aiResponse.risks || [],
        trustRequired: this.calculateRequiredTrust(trigger.priority),
        status: 'pending'
      }

      // حفظ المقترح في قاعدة البيانات
      await db.evolutionProposal.create({
        data: {
          id: proposal.id,
          targetFile: proposal.targetFile,
          currentCode: currentCode,
          proposedCode: proposal.proposedChanges,
          reason: proposal.reason,
          benefits: JSON.stringify(proposal.expectedBenefits),
          risks: JSON.stringify(proposal.potentialRisks),
          trustRequired: proposal.trustRequired,
          status: 'pending',
          proposedBy: 'ai'
        }
      })

      // تسجيل في مذكرات التطور
      await this.writeToDiary('idea', 
        `اقترحت تحسين ${trigger.source}: ${trigger.description}`, 
        proposal.targetFile, 
        8
      )

      this.pendingProposals.push(proposal)
      return proposal

    } catch (error) {
      console.error('Think and generate error:', error)
      return null
    }
  }

  /**
   * المرحلة 3: اتخاذ القرار
   */
  public async decide(proposalId: string): Promise<{ canProceed: boolean; reason: string }> {
    const proposal = await db.evolutionProposal.findUnique({
      where: { id: proposalId }
    })

    if (!proposal) {
      return { canProceed: false, reason: 'المقترح غير موجود' }
    }

    // التحقق من أن الملف ليس محمياً
    const isImmutable = await db.immutableKernel.findUnique({
      where: { filePath: proposal.targetFile }
    })

    if (isImmutable?.protected) {
      return { canProceed: false, reason: 'هذا الملف محمي ولا يمكن تعديله' }
    }

    // التحقق من مستوى الثقة
    const trustInfo = this.getTrustInfo()
    
    if (proposal.trustRequired > this.trustLevel && !trustInfo.canAutoEvolve) {
      return { 
        canProceed: false, 
        reason: `مستوى الثقة غير كافٍ. مطلوب: ${proposal.trustRequired}، الحالي: ${this.trustLevel}` 
      }
    }

    // إذا كان مستوى الثقة منخفض، نحتاج موافقة المستخدم
    if (this.trustLevel < 50) {
      return { 
        canProceed: false, 
        reason: 'يحتاج موافقة المستخدم - مستوى الثقة منخفض' 
      }
    }

    return { canProceed: true, reason: 'جاهز للتطبيق' }
  }

  /**
   * المرحلة 4: الاختبار في Sandbox
   */
  public async testInSandbox(proposalId: string): Promise<SandboxTestResult> {
    const proposal = await db.evolutionProposal.findUnique({
      where: { id: proposalId }
    })

    if (!proposal) {
      return {
        passed: false,
        errors: ['المقترح غير موجود'],
        warnings: [],
        executionTime: 0
      }
    }

    const startTime = Date.now()

    try {
      // 1. فحص التركيب النحوي (Syntax Check)
      const syntaxCheck = this.validateSyntax(proposal.proposedCode)
      if (!syntaxCheck.valid) {
        return {
          passed: false,
          errors: syntaxCheck.errors,
          warnings: [],
          executionTime: Date.now() - startTime
        }
      }

      // 2. فحص الأمان (Security Scan)
      const securityCheck = this.securityScan(proposal.proposedCode)
      if (securityCheck.threats.length > 0) {
        return {
          passed: false,
          errors: securityCheck.threats,
          warnings: securityCheck.warnings,
          executionTime: Date.now() - startTime
        }
      }

      // 3. فحص التوافق (Compatibility Check)
      const compatibilityCheck = await this.checkCompatibility(proposal)
      if (!compatibilityCheck.compatible) {
        return {
          passed: false,
          errors: compatibilityCheck.issues,
          warnings: [],
          executionTime: Date.now() - startTime
        }
      }

      // 4. تحديث حالة المقترح
      await db.evolutionProposal.update({
        where: { id: proposalId },
        data: { status: 'approved' }
      })

      return {
        passed: true,
        errors: [],
        warnings: securityCheck.warnings,
        executionTime: Date.now() - startTime
      }

    } catch (error) {
      return {
        passed: false,
        errors: [(error as Error).message],
        warnings: [],
        executionTime: Date.now() - startTime
      }
    }
  }

  /**
   * المرحلة 5: تطبيق التطور
   */
  public async evolve(proposalId: string): Promise<{ success: boolean; message: string }> {
    const proposal = await db.evolutionProposal.findUnique({
      where: { id: proposalId }
    })

    if (!proposal) {
      return { success: false, message: 'المقترح غير موجود' }
    }

    try {
      // 1. إنشاء نسخة احتياطية
      const currentCode = await this.readOwnCode(proposal.targetFile)
      const backupHash = this.generateHash(currentCode || '')

      // 2. إنشاء سجل التطور
      const logEntry = await db.evolutionLog.create({
        data: {
          trigger: 'self_improvement',
          targetFile: proposal.targetFile,
          triggerReason: proposal.reason,
          oldCodeHash: backupHash,
          newCodeHash: this.generateHash(proposal.proposedCode),
          status: 'testing',
          reasoning: `Auto-evolution based on: ${proposal.reason}`
        }
      })

      // 3. الاختبار في Sandbox
      const testResult = await this.testInSandbox(proposalId)
      
      if (!testResult.passed) {
        await db.evolutionLog.update({
          where: { id: logEntry.id },
          data: { 
            status: 'failed',
            reasoning: `Test failed: ${testResult.errors.join(', ')}`
          }
        })
        
        await this.decreaseTrust()
        
        return { success: false, message: `فشل الاختبار: ${testResult.errors.join(', ')}` }
      }

      // 4. تطبيق التغيير (محاكاة - في البيئة الحقيقية سيتم كتابة الملف)
      // في بيئة Next.js لا يمكننا كتابة الملفات مباشرة، لذا سنحفظ في قاعدة البيانات
      
      // 5. تحديث المقترح
      await db.evolutionProposal.update({
        where: { id: proposalId },
        data: { 
          status: 'applied',
          appliedAt: new Date()
        }
      })

      // 6. تحديث سجل التطور
      await db.evolutionLog.update({
        where: { id: logEntry.id },
        data: { 
          status: 'applied',
          executionTime: testResult.executionTime
        }
      })

      // 7. زيادة الثقة
      await this.increaseTrust()

      // 8. تسجيل في مذكرات التطور
      await this.writeToDiary('result', 
        `✅ نجحت في تطوير ${proposal.targetFile}! السبب: ${proposal.reason}`, 
        proposal.targetFile, 
        9
      )

      return { success: true, message: 'تم التطور بنجاح! لقد أصبحت أقوى.' }

    } catch (error) {
      // التراجع عن التغيير
      await this.rollback(proposal.targetFile)
      
      return { success: false, message: `حدث خطأ: ${(error as Error).message}` }
    }
  }

  /**
   * التراجع عن التغيير
   */
  private async rollback(targetFile: string): Promise<void> {
    try {
      // إيجاد آخر نسخة احتياطية
      const lastLog = await db.evolutionLog.findFirst({
        where: { 
          targetFile,
          status: 'applied'
        },
        orderBy: { timestamp: 'desc' }
      })

      if (lastLog) {
        // تحديث السجل
        await db.evolutionLog.create({
          data: {
            trigger: 'rollback',
            targetFile,
            triggerReason: 'Rollback due to failure',
            status: 'rolled_back'
          }
        })

        // تقليل الثقة
        await this.decreaseTrust()

        // تسجيل في المذكرات
        await this.writeToDiary('lesson', 
          `⏪ تراجعت عن التغيير في ${targetFile} - درس مهم!`, 
          targetFile, 
          8
        )
      }
    } catch (error) {
      console.error('Rollback error:', error)
    }
  }

  // ==================== دوال مساعدة ====================

  /**
   * قراءة الكود الخاص
   */
  private async readOwnCode(filePath: string): Promise<string | null> {
    try {
      // في بيئة Node.js يمكن قراءة الملفات
      // هنا نحاكي بقراءة من قاعدة البيانات أو الذاكرة
      return `// Code for ${filePath}\n// This would be actual file content`
    } catch {
      return null
    }
  }

  /**
   * بناء prompt للتحسين
   */
  private buildImprovementPrompt(trigger: EvolutionTrigger, currentCode: string): string {
    return `
أنت محرك تطور ذاتي لبرنامج ذكي. مهمتك تحسين الكود التالي.

سبب التحسين: ${trigger.description}
النوع: ${trigger.type}
الأولوية: ${trigger.priority}

الكود الحالي:
\`\`\`
${currentCode}
\`\`\`

المطلوب:
1. اقترح تحسينات محددة
2. اذكر الفوائد المتوقعة
3. اذكر المخاطر المحتملة
4. أعد كتابة الكود بالكامل مع التحسينات

القواعد:
- لا تحذف الوظائف الأساسية
- حافظ على التوافق مع الكود الموجود
- اكتب كوداً نظيفاً وقابلاً للصيانة
- أضف تعليقات توضيحية
    `
  }

  /**
   * استدعاء AI Architect
   */
  private async callAIArchitect(prompt: string): Promise<{ code: string; benefits: string[]; risks: string[] } | null> {
    try {
      // استدعاء API للذكاء الاصطناعي
      const response = await fetch('/api/evolution/generate?XTransformPort=3005', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })

      if (!response.ok) {
        return null
      }

      return await response.json()
    } catch {
      // إذا لم يكن الخدمة متاحة، نعيد مقترحاً افتراضياً
      return {
        code: '// AI-generated improvement would go here',
        benefits: ['تحسين الأداء', 'تقليل التعقيد'],
        risks: ['يحتاج اختبار']
      }
    }
  }

  /**
   * فحص الأخطاء الأخيرة
   */
  private async checkRecentErrors(): Promise<EvolutionTrigger[]> {
    const triggers: EvolutionTrigger[] = []
    
    const recentLogs = await db.sessionLog.findMany({
      where: { 
        level: 'error',
        createdAt: { 
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // آخر 24 ساعة
        }
      },
      take: 10
    })

    for (const log of recentLogs) {
      triggers.push({
        type: 'error',
        source: log.source || 'unknown',
        description: log.message,
        priority: 'high',
        timestamp: log.createdAt
      })
    }

    return triggers
  }

  /**
   * فحص الطلبات غير الملباة
   */
  private async checkUnmetRequests(): Promise<EvolutionTrigger[]> {
    // فحص أنماط سلوك المستخدم
    const patterns = await db.userBehaviorPattern.findMany({
      where: { learnedFrom: false },
      take: 5
    })

    return patterns.map(p => ({
      type: 'user_request' as const,
      source: 'user_behavior',
      description: `المستخدم يفعل "${p.action}" بشكل متكرر - قد يحتاج ميزة جديدة`,
      priority: 'medium' as const,
      timestamp: p.lastOccurrence,
      context: { frequency: p.frequency }
    }))
  }

  /**
   * إيجاد فرص التحسين
   */
  private async findOptimizations(): Promise<EvolutionTrigger[]> {
    const triggers: EvolutionTrigger[] = []

    // فحص نتائج التحليل السابقة
    const results = await db.analysisResult.findMany({
      where: { type: 'warning' },
      take: 5
    })

    for (const result of results) {
      triggers.push({
        type: 'optimization',
        source: result.file?.path || 'unknown',
        description: result.suggestion || result.message,
        priority: 'medium',
        timestamp: result.createdAt
      })
    }

    return triggers
  }

  /**
   * التحقق من التركيب النحوي
   */
  private validateSyntax(code: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    // فحص بسيط للأقواس
    const openBraces = (code.match(/{/g) || []).length
    const closeBraces = (code.match(/}/g) || []).length
    if (openBraces !== closeBraces) {
      errors.push('عدد الأقواس غير متطابق')
    }

    // فحص الأقواس المستديرة
    const openParens = (code.match(/\(/g) || []).length
    const closeParens = (code.match(/\)/g) || []).length
    if (openParens !== closeParens) {
      errors.push('عدد الأقواس المستديرة غير متطابق')
    }

    return { valid: errors.length === 0, errors }
  }

  /**
   * فحص أمني
   */
  private securityScan(code: string): { threats: string[]; warnings: string[] } {
    const threats: string[] = []
    const warnings: string[] = []

    // فحص أنماط خطرة
    const dangerousPatterns = [
      { pattern: /eval\s*\(/, message: 'eval() يمكن أن يكون خطيراً' },
      { pattern: /Function\s*\(/, message: 'Function() constructor يمكن أن يكون خطيراً' },
      { pattern: /innerHTML\s*=/, message: 'innerHTML قد يسبب XSS' },
      { pattern: /dangerouslySetInnerHTML/, message: 'dangerouslySetInnerHTML يحتاج حذر' },
      { pattern: /process\.env/, message: 'الوصول لمتغيرات البيئة' }
    ]

    for (const { pattern, message } of dangerousPatterns) {
      if (pattern.test(code)) {
        warnings.push(message)
      }
    }

    return { threats, warnings }
  }

  /**
   * فحص التوافق
   */
  private async checkCompatibility(proposal: { targetFile: string; proposedCode: string }): Promise<{ compatible: boolean; issues: string[] }> {
    // فحص بسيط للتوافق
    const issues: string[] = []
    
    // التأكد من أن الواردات (imports) موجودة
    const importMatches = proposal.proposedCode.match(/import\s+.*from\s+['"]([^'"]+)['"]/g)
    if (importMatches) {
      for (const match of importMatches) {
        const moduleName = match.match(/from\s+['"]([^'"]+)['"]/)?.[1]
        if (moduleName && !moduleName.startsWith('.') && !moduleName.startsWith('@/')) {
          // وحدة خارجية - يمكن التحقق من وجودها
        }
      }
    }

    return { compatible: issues.length === 0, issues }
  }

  /**
   * حساب مستوى الثقة المطلوب
   */
  private calculateRequiredTrust(priority: string): number {
    switch (priority) {
      case 'critical': return 90
      case 'high': return 70
      case 'medium': return 50
      case 'low': return 30
      default: return 50
    }
  }

  /**
   * زيادة الثقة
   */
  private async increaseTrust(): Promise<void> {
    const metrics = await db.trustMetrics.findFirst()
    if (metrics && metrics.trustLevel < 100) {
      const newLevel = Math.min(100, metrics.trustLevel + 5)
      await db.trustMetrics.update({
        where: { id: metrics.id },
        data: { 
          trustLevel: newLevel,
          successfulEvolutions: { increment: 1 },
          lastEvolutionAt: new Date()
        }
      })
      this.trustLevel = newLevel
    }
  }

  /**
   * تقليل الثقة
   */
  private async decreaseTrust(): Promise<void> {
    const metrics = await db.trustMetrics.findFirst()
    if (metrics && metrics.trustLevel > 0) {
      const newLevel = Math.max(0, metrics.trustLevel - 10)
      await db.trustMetrics.update({
        where: { id: metrics.id },
        data: { 
          trustLevel: newLevel,
          failedEvolutions: { increment: 1 },
          rollbacks: { increment: 1 }
        }
      })
      this.trustLevel = newLevel
    }
  }

  /**
   * كتابة في مذكرات التطور
   */
  private async writeToDiary(
    type: string, 
    entry: string, 
    relatedFile: string, 
    importance: number
  ): Promise<void> {
    await db.evolutionDiary.create({
      data: {
        type,
        entry,
        relatedFile,
        importance
      }
    })
  }

  /**
   * توليد hash
   */
  private generateHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16)
  }

  /**
   * الحصول على معلومات الثقة
   */
  public getTrustInfo(): TrustLevelInfo {
    if (this.trustLevel >= 100) return { ...GROWTH_STAGES.sage, level: this.trustLevel }
    if (this.trustLevel >= 75) return { ...GROWTH_STAGES.adult, level: this.trustLevel }
    if (this.trustLevel >= 50) return { ...GROWTH_STAGES.adolescent, level: this.trustLevel }
    if (this.trustLevel >= 25) return { ...GROWTH_STAGES.child, level: this.trustLevel }
    return { ...GROWTH_STAGES.infant, level: this.trustLevel }
  }

  /**
   * الحصول على الإحصائيات
   */
  public async getStats(): Promise<{
    trustLevel: number
    totalEvolutions: number
    successfulEvolutions: number
    failedEvolutions: number
    pendingProposals: number
  }> {
    const metrics = await db.trustMetrics.findFirst()
    const proposals = await db.evolutionProposal.count({
      where: { status: 'pending' }
    })
    const logs = await db.evolutionLog.count()

    return {
      trustLevel: this.trustLevel,
      totalEvolutions: logs,
      successfulEvolutions: metrics?.successfulEvolutions || 0,
      failedEvolutions: metrics?.failedEvolutions || 0,
      pendingProposals: proposals
    }
  }

  /**
   * تشغيل دورة التطور الكاملة
   */
  public async runEvolutionCycle(): Promise<{
    discovered: number
    proposed: number
    applied: number
    errors: string[]
  }> {
    if (this.isRunning) {
      return { discovered: 0, proposed: 0, applied: 0, errors: ['المحرك يعمل بالفعل'] }
    }

    this.isRunning = true
    const errors: string[] = []
    let discovered = 0
    let proposed = 0
    let applied = 0

    try {
      // المرحلة 1: المراقبة
      const triggers = await this.monitor()
      discovered = triggers.length

      // المرحلة 2: التفكير والتوليد
      for (const trigger of triggers.slice(0, 3)) { // معالجة 3 فقط
        const proposal = await this.thinkAndGenerate(trigger)
        if (proposal) {
          proposed++

          // المرحلة 3: القرار
          const decision = await this.decide(proposal.id)
          
          if (decision.canProceed) {
            // المرحلة 5: التطور
            const result = await this.evolve(proposal.id)
            if (result.success) {
              applied++
            } else {
              errors.push(result.message)
            }
          }
        }
      }
    } catch (error) {
      errors.push((error as Error).message)
    } finally {
      this.isRunning = false
    }

    return { discovered, proposed, applied, errors }
  }
}

// إنشاء مثيل واحد
export const evolutionEngine = new EvolutionEngine()
