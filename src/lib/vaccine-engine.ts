// نظام اللقاح (Vaccine Engine) - Mutation Testing
// يقوم بتعذيب الكود عمداً لاختبار قوة الاختبارات

export interface Mutant {
  id: string
  type: MutationType
  originalCode: string
  mutatedCode: string
  line: number
  survived: boolean // إذا نجا = الاختبارات ضعيفة
  killedBy: string[] // الاختبارات التي اكتشفته
}

export type MutationType = 
  | 'arithmetic-operator'
  | 'comparison-operator'
  | 'logical-operator'
  | 'conditional'
  | 'boolean-literal'
  | 'string-literal'
  | 'return-value'
  | 'function-call'
  | 'array-length'
  | 'object-property'

export interface MutationResult {
  totalMutants: number
  killedMutants: number
  survivedMutants: number
  mutationScore: number // 0-100 (100 = كل الطفرات تم اكتشافها)
  mutants: Mutant[]
  weakSpots: WeakSpot[]
  suggestedTests: string[]
}

export interface WeakSpot {
  line: number
  type: MutationType
  message: string
  severity: 'critical' | 'high' | 'medium'
}

// محرك الطفرات
export class VaccineEngine {
  private code: string
  private mutants: Mutant[] = []
  
  constructor(code: string) {
    this.code = code
  }
  
  // توليد جميع الطفرات الممكنة
  generateMutants(): Mutant[] {
    this.mutants = []
    
    this.mutateArithmeticOperators()
    this.mutateComparisonOperators()
    this.mutateLogicalOperators()
    this.mutateConditionals()
    this.mutateBooleanLiterals()
    this.mutateStringLiterals()
    this.mutateReturnValues()
    this.mutateArrayLength()
    
    return this.mutants
  }
  
  // طفرات المعاملات الحسابية
  private mutateArithmeticOperators(): void {
    const operators = [
      { from: '+', to: '-' },
      { from: '-', to: '+' },
      { from: '*', to: '/' },
      { from: '/', to: '*' },
      { from: '%', to: '*' },
      { from: '+=', to: '-=' },
      { from: '-=', to: '+=' },
      { from: '*=', to: '/=' },
      { from: '++', to: '--' },
      { from: '--', to: '++' }
    ]
    
    for (const op of operators) {
      const regex = new RegExp(`\\${op.from}(?!=)`, 'g')
      let match
      while ((match = regex.exec(this.code)) !== null) {
        const line = this.code.substring(0, match.index).split('\n').length
        const mutatedCode = this.code.substring(0, match.index) + 
                           op.to + 
                           this.code.substring(match.index + op.from.length)
        
        this.mutants.push({
          id: `mutant-${this.mutants.length}`,
          type: 'arithmetic-operator',
          originalCode: op.from,
          mutatedCode: op.to,
          line,
          survived: false,
          killedBy: []
        })
      }
    }
  }
  
  // طفرات معاملات المقارنة
  private mutateComparisonOperators(): void {
    const operators = [
      { from: '===', to: '!==' },
      { from: '!==', to: '===' },
      { from: '==', to: '!=' },
      { from: '!=', to: '==' },
      { from: '>', to: '>=' },
      { from: '>=', to: '>' },
      { from: '<', to: '<=' },
      { from: '<=', to: '<' },
      { from: '>', to: '<' },
      { from: '<', to: '>' }
    ]
    
    for (const op of operators) {
      const regex = new RegExp(op.from.replace(/([=<>!])/g, '\\$1'), 'g')
      let match
      while ((match = regex.exec(this.code)) !== null) {
        const line = this.code.substring(0, match.index).split('\n').length
        
        this.mutants.push({
          id: `mutant-${this.mutants.length}`,
          type: 'comparison-operator',
          originalCode: op.from,
          mutatedCode: op.to,
          line,
          survived: false,
          killedBy: []
        })
      }
    }
  }
  
  // طفرات المعاملات المنطقية
  private mutateLogicalOperators(): void {
    const operators = [
      { from: '&&', to: '||' },
      { from: '||', to: '&&' },
      { from: '!', to: '' }
    ]
    
    for (const op of operators) {
      let match
      const regex = new RegExp(op.from.replace(/([|&!])/g, '\\$1'), 'g')
      while ((match = regex.exec(this.code)) !== null) {
        const line = this.code.substring(0, match.index).split('\n').length
        
        this.mutants.push({
          id: `mutant-${this.mutants.length}`,
          type: 'logical-operator',
          originalCode: op.from,
          mutatedCode: op.to,
          line,
          survived: false,
          killedBy: []
        })
      }
    }
  }
  
  // طفرات الشروط
  private mutateConditionals(): void {
    // استبدال if بـ if (!...)
    const ifRegex = /if\s*\(([^)]+)\)/g
    let match
    while ((match = ifRegex.exec(this.code)) !== null) {
      const line = this.code.substring(0, match.index).split('\n').length
      const condition = match[1]
      
      // إضافة نفي للشرط
      this.mutants.push({
        id: `mutant-${this.mutants.length}`,
        type: 'conditional',
        originalCode: `if (${condition})`,
        mutatedCode: `if (!(${condition}))`,
        line,
        survived: false,
        killedBy: []
      })
    }
    
    // حذف else
    const elseRegex = /else\s*\{/g
    while ((match = elseRegex.exec(this.code)) !== null) {
      const line = this.code.substring(0, match.index).split('\n').length
      
      this.mutants.push({
        id: `mutant-${this.mutants.length}`,
        type: 'conditional',
        originalCode: 'else {',
        mutatedCode: '// else removed',
        line,
        survived: false,
        killedBy: []
      })
    }
  }
  
  // طفرات القيم المنطقية
  private mutateBooleanLiterals(): void {
    const trueRegex = /\btrue\b/g
    const falseRegex = /\bfalse\b/g
    
    let match
    while ((match = trueRegex.exec(this.code)) !== null) {
      const line = this.code.substring(0, match.index).split('\n').length
      this.mutants.push({
        id: `mutant-${this.mutants.length}`,
        type: 'boolean-literal',
        originalCode: 'true',
        mutatedCode: 'false',
        line,
        survived: false,
        killedBy: []
      })
    }
    
    while ((match = falseRegex.exec(this.code)) !== null) {
      const line = this.code.substring(0, match.index).split('\n').length
      this.mutants.push({
        id: `mutant-${this.mutants.length}`,
        type: 'boolean-literal',
        originalCode: 'false',
        mutatedCode: 'true',
        line,
        survived: false,
        killedBy: []
      })
    }
  }
  
  // طفرات النصوص
  private mutateStringLiterals(): void {
    const stringRegex = /'([^']*)'|"([^"]*)"|`([^`]*)`/g
    let match
    while ((match = stringRegex.exec(this.code)) !== null) {
      const line = this.code.substring(0, match.index).split('\n').length
      const originalString = match[0]
      
      // تغيير النص لنص فارغ
      this.mutants.push({
        id: `mutant-${this.mutants.length}`,
        type: 'string-literal',
        originalCode: originalString,
        mutatedCode: '""',
        line,
        survived: false,
        killedBy: []
      })
    }
  }
  
  // طفرات القيم المرجعة
  private mutateReturnValues(): void {
    // return x -> return undefined
    const returnRegex = /return\s+([^;}\n]+)/g
    let match
    while ((match = returnRegex.exec(this.code)) !== null) {
      const line = this.code.substring(0, match.index).split('\n').length
      
      this.mutants.push({
        id: `mutant-${this.mutants.length}`,
        type: 'return-value',
        originalCode: `return ${match[1]}`,
        mutatedCode: 'return undefined',
        line,
        survived: false,
        killedBy: []
      })
    }
  }
  
  // طفرات طول المصفوفة
  private mutateArrayLength(): void {
    const lengthRegex = /\.length/g
    let match
    while ((match = lengthRegex.exec(this.code)) !== null) {
      const line = this.code.substring(0, match.index).split('\n').length
      
      // تغيير .length إلى 0
      this.mutants.push({
        id: `mutant-${this.mutants.length}`,
        type: 'array-length',
        originalCode: '.length',
        mutatedCode: '/* mutated */ 0',
        line,
        survived: false,
        killedBy: []
      })
    }
  }
  
  // محاكاة تشغيل الاختبارات على الطفرات
  // (في الإنتاج، سيتم تشغيل الاختبارات الفعلية)
  simulateTestRun(): MutationResult {
    // محاكاة: بعض الطفرات تنجو وبعضها يُقتل
    const killedMutants: Mutant[] = []
    const survivedMutants: Mutant[] = []
    const weakSpots: WeakSpot[] = []
    
    for (const mutant of this.mutants) {
      // محاكاة: 60% من الطفرات تُقتل
      const isKilled = Math.random() > 0.4
      
      if (isKilled) {
        mutant.survived = false
        mutant.killedBy = ['test-suite']
        killedMutants.push(mutant)
      } else {
        mutant.survived = true
        survivedMutants.push(mutant)
        
        // تحديد نقاط الضعف
        weakSpots.push({
          line: mutant.line,
          type: mutant.type,
          message: this.getWeakSpotMessage(mutant),
          severity: this.getWeakSpotSeverity(mutant.type)
        })
      }
    }
    
    const mutationScore = this.mutants.length > 0 
      ? Math.round((killedMutants.length / this.mutants.length) * 100) 
      : 0
    
    return {
      totalMutants: this.mutants.length,
      killedMutants: killedMutants.length,
      survivedMutants: survivedMutants.length,
      mutationScore,
      mutants: this.mutants,
      weakSpots,
      suggestedTests: this.generateSuggestedTests(weakSpots)
    }
  }
  
  // رسائل نقاط الضعف
  private getWeakSpotMessage(mutant: Mutant): string {
    const messages: Record<MutationType, string> = {
      'arithmetic-operator': `تغيير '${mutant.originalCode}' إلى '${mutant.mutatedCode}' لم يكتشفه أي اختبار`,
      'comparison-operator': `المقارنة '${mutant.originalCode}' ضعيفة - التغيير إلى '${mutant.mutatedCode}' نجا`,
      'logical-operator': `المعامل المنطقي '${mutant.originalCode}' غير مغطى بالاختبارات`,
      'conditional': `الشرط في السطر ${mutant.line} ضعيف`,
      'boolean-literal': `القيمة ${mutant.originalCode} يمكن تغييرها دون اكتشاف`,
      'string-literal': `النص "${mutant.originalCode}" غير مُختبر`,
      'return-value': 'القيمة المرجعة غير مُختبرة',
      'function-call': 'استدعاء الدالة غير مُختبر',
      'array-length': 'طول المصفوفة غير مُختبر',
      'object-property': 'الخاصية غير مُختبرة'
    }
    return messages[mutant.type]
  }
  
  // شدة نقطة الضعف
  private getWeakSpotSeverity(type: MutationType): WeakSpot['severity'] {
    const critical: MutationType[] = ['comparison-operator', 'conditional', 'boolean-literal']
    const high: MutationType[] = ['logical-operator', 'return-value', 'arithmetic-operator']
    
    if (critical.includes(type)) return 'critical'
    if (high.includes(type)) return 'high'
    return 'medium'
  }
  
  // اقتراح اختبارات
  private generateSuggestedTests(weakSpots: WeakSpot[]): string[] {
    const suggestions: string[] = []
    
    for (const spot of weakSpots) {
      switch (spot.type) {
        case 'comparison-operator':
          suggestions.push(`// أضف اختبار للتحقق من الحد الفاصل
test('should handle boundary case', () => {
  // اختبر الحالة عندما يكون المتساوي مختلفاً بمقدار واحد
});`)
          break
        case 'conditional':
          suggestions.push(`// أضف اختبار للحالة المعاكسة
test('should handle opposite condition', () => {
  // اختبر ما يحدث عندما يكون الشرط false
});`)
          break
        case 'boolean-literal':
          suggestions.push(`// أضف اختبار للقيمة المعاكسة
test('should handle ${weakSpots[0].message.includes('true') ? 'false' : 'true'} case', () => {
  // اختبر القيمة المعاكسة
});`)
          break
        case 'return-value':
          suggestions.push(`// أضف اختبار للتحقق من القيمة المرجعة
test('should return correct value', () => {
  const result = functionUnderTest();
  expect(result).toBeDefined();
  expect(result).not.toBeUndefined();
});`)
          break
      }
    }
    
    return [...new Set(suggestions)] // إزالة التكرارات
  }
}

// واجهة لعرض نتائج اللقاح
export function formatVaccineResult(result: MutationResult): string {
  const lines: string[] = []
  
  lines.push('🧪 نتائج اختبار اللقاح (Mutation Testing)')
  lines.push('═'.repeat(50))
  lines.push(``)
  lines.push(`📊 النتيجة الإجمالية:`)
  lines.push(`   درجة المناعة: ${result.mutationScore}%`)
  lines.push(`   الطفرات المكتشفة: ${result.killedMutants}/${result.totalMutants}`)
  lines.push(`   الطفرات الناجية: ${result.survivedMutants}`)
  lines.push(``)
  
  if (result.survivedMutants > 0) {
    lines.push(`⚠️ نقاط الضعف المكتشفة:`)
    for (const spot of result.weakSpots.slice(0, 10)) {
      lines.push(`   [${spot.severity.toUpperCase()}] السطر ${spot.line}: ${spot.message}`)
    }
    lines.push(``)
    
    lines.push(`💡 اختبارات مقترحة:`)
    for (const test of result.suggestedTests) {
      lines.push(test)
    }
  } else {
    lines.push(`✅ ممتاز! جميع الطفرات تم اكتشافها. كودك محمي بمناعة عالية!`)
  }
  
  return lines.join('\n')
}
