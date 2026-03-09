// نظام الحمض النووي للمشروع (Project DNA)
// يستخرج الأنماط غير المكتوبة من الكود

export interface ProjectDNA {
  id: string
  createdAt: Date
  updatedAt: Date
  
  // أنماط التسمية
  naming: {
    variables: 'camelCase' | 'snake_case' | 'PascalCase' | 'mixed'
    functions: 'camelCase' | 'snake_case' | 'PascalCase'
    constants: 'UPPER_SNAKE_CASE' | 'camelCase' | 'mixed'
    classes: 'PascalCase' | 'camelCase'
  }
  
  // أنماط الكود
  patterns: {
    prefersArrowFunctions: boolean
    prefersConstOverLet: boolean
    usesSemicolons: boolean
    usesSingleQuotes: boolean
    prefersAsyncAwait: boolean
    usesTryCatch: boolean
    usesOptionalChaining: boolean
    usesDestructuring: boolean
    usesTemplateLiterals: boolean
  }
  
  // أنماط الاستيراد
  imports: {
    style: 'default' | 'named' | 'mixed'
    prefersRelativeImports: boolean
    commonImports: Map<string, number>
  }
  
  // أنماط الأخطاء
  errorHandling: {
    style: 'try-catch' | 'promise-catch' | 'mixed' | 'none'
    prefersCustomErrors: boolean
    logsErrors: boolean
  }
  
  // أنماط التعليقات
  comments: {
    style: 'jsdoc' | 'inline' | 'minimal' | 'extensive'
    language: 'ar' | 'en' | 'mixed'
  }
  
  // المكتبات المستخدمة
  dependencies: {
    frameworks: string[]
    libraries: string[]
    testingFrameworks: string[]
  }
  
  // درجة التطابق (للملفات الجديدة)
  consistencyScore: number
  
  // إحصائيات
  stats: {
    totalFiles: number
    totalLines: number
    averageFileLength: number
    complexityScore: number
  }
}

// نتيجة تحليل DNA لملف معين
export interface DNACheckResult {
  fileId: string
  fileName: string
  consistencyScore: number // 0-100
  violations: DNAViolation[]
  suggestions: string[]
}

export interface DNAViolation {
  type: 'naming' | 'pattern' | 'style' | 'import' | 'error-handling'
  severity: 'info' | 'warning' | 'error'
  message: string
  line?: number
  currentPattern: string
  expectedPattern: string
}

// محرك استخراج الـ DNA
export class DNAEngine {
  private files: { name: string; content: string; path: string }[]
  
  constructor(files: { name: string; content: string; path: string }[]) {
    this.files = files
  }
  
  // استخراج الـ DNA الكامل
  extract(): ProjectDNA {
    const naming = this.analyzeNamingPatterns()
    const patterns = this.analyzeCodePatterns()
    const imports = this.analyzeImportPatterns()
    const errorHandling = this.analyzeErrorHandling()
    const comments = this.analyzeCommentPatterns()
    const dependencies = this.analyzeDependencies()
    const stats = this.calculateStats()
    
    return {
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      naming,
      patterns,
      imports,
      errorHandling,
      comments,
      dependencies,
      consistencyScore: 100, // سيتم حسابه لاحقاً
      stats
    }
  }
  
  // تحليل أنماط التسمية
  private analyzeNamingPatterns(): ProjectDNA['naming'] {
    let camelCaseVars = 0
    let snakeCaseVars = 0
    let pascalCaseVars = 0
    let upperSnakeCase = 0
    
    let arrowFunctions = 0
    let regularFunctions = 0
    let pascalFunctions = 0
    
    let pascalClasses = 0
    let camelClasses = 0
    
    for (const file of this.files) {
      if (!file.content) continue
      
      // تحليل المتغيرات
      const varDeclarations = file.content.matchAll(/(?:const|let|var)\s+(\w+)/g)
      for (const match of varDeclarations) {
        const name = match[1]
        if (/^[a-z]+[A-Z]/.test(name)) camelCaseVars++
        if (/_/.test(name)) {
          if (/^[A-Z_]+$/.test(name)) upperSnakeCase++
          else snakeCaseVars++
        }
        if (/^[A-Z]/.test(name) && !/^[A-Z_]+$/.test(name)) pascalCaseVars++
      }
      
      // تحليل الدوال
      const arrowMatches = file.content.match(/=>\s*{/g) || []
      arrowFunctions += arrowMatches.length
      
      const funcMatches = file.content.matchAll(/function\s+(\w+)/g)
      for (const match of funcMatches) {
        const name = match[1]
        if (/^[A-Z]/.test(name)) pascalFunctions++
        else regularFunctions++
      }
      
      // تحليل الفئات
      const classMatches = file.content.matchAll(/class\s+(\w+)/g)
      for (const match of classMatches) {
        const name = match[1]
        if (/^[A-Z]/.test(name)) pascalClasses++
        else camelClasses++
      }
    }
    
    return {
      variables: this.determineNamingStyle(camelCaseVars, snakeCaseVars, pascalCaseVars),
      functions: pascalFunctions > regularFunctions ? 'PascalCase' : 'camelCase',
      constants: upperSnakeCase > camelCaseVars ? 'UPPER_SNAKE_CASE' : 'camelCase',
      classes: pascalClasses > camelClasses ? 'PascalCase' : 'camelCase'
    }
  }
  
  // تحليل أنماط الكود
  private analyzeCodePatterns(): ProjectDNA['patterns'] {
    let arrowCount = 0
    let funcCount = 0
    let constCount = 0
    let letCount = 0
    let semicolons = 0
    let noSemicolons = 0
    let singleQuotes = 0
    let doubleQuotes = 0
    let asyncAwait = 0
    let thenCatch = 0
    let tryCatch = 0
    let promiseCatch = 0
    let optionalChaining = 0
    let destructuring = 0
    let templateLiterals = 0
    
    for (const file of this.files) {
      if (!file.content) continue
      
      arrowCount += (file.content.match(/=>/g) || []).length
      funcCount += (file.content.match(/function\s+\w+/g) || []).length
      constCount += (file.content.match(/const\s+/g) || []).length
      letCount += (file.content.match(/let\s+/g) || []).length
      
      // Count lines with semicolons vs without
      const lines = file.content.split('\n')
      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('*')) {
          if (trimmed.endsWith(';')) semicolons++
          else if (trimmed.includes('=') || trimmed.includes('return')) noSemicolons++
        }
      }
      
      singleQuotes += (file.content.match(/'/g) || []).length
      doubleQuotes += (file.content.match(/"/g) || []).length
      
      asyncAwait += (file.content.match(/async\s+/g) || []).length + (file.content.match(/await\s+/g) || []).length
      thenCatch += (file.content.match(/\.then\(/g) || []).length + (file.content.match(/\.catch\(/g) || []).length
      
      tryCatch += (file.content.match(/try\s*{/g) || []).length
      promiseCatch += (file.content.match(/\.catch\(/g) || []).length
      
      optionalChaining += (file.content.match(/\?\\./g) || []).length
      destructuring += (file.content.match(/\{[^}]+\}\s*=/g) || []).length
      templateLiterals += (file.content.match(/`[^`]*\$\{/g) || []).length
    }
    
    return {
      prefersArrowFunctions: arrowCount > funcCount,
      prefersConstOverLet: constCount > letCount,
      usesSemicolons: semicolons > noSemicolons,
      usesSingleQuotes: singleQuotes > doubleQuotes,
      prefersAsyncAwait: asyncAwait > thenCatch,
      usesTryCatch: tryCatch > promiseCatch,
      usesOptionalChaining: optionalChaining > 0,
      usesDestructuring: destructuring > 0,
      usesTemplateLiterals: templateLiterals > 0
    }
  }
  
  // تحليل أنماط الاستيراد
  private analyzeImportPatterns(): ProjectDNA['imports'] {
    let defaultImports = 0
    let namedImports = 0
    let relativeImports = 0
    let absoluteImports = 0
    const commonImports = new Map<string, number>()
    
    for (const file of this.files) {
      if (!file.content) continue
      
      // Default imports: import x from 'y'
      const defaultMatches = file.content.matchAll(/import\s+(\w+)\s+from/g)
      for (const match of defaultMatches) {
        defaultImports++
      }
      
      // Named imports: import { x, y } from 'z'
      const namedMatches = file.content.matchAll(/import\s*\{[^}]+\}\s+from/g)
      for (const match of namedMatches) {
        namedImports++
      }
      
      // Relative vs absolute
      const importMatches = file.content.matchAll(/from\s+['"]([^'"]+)['"]/g)
      for (const match of importMatches) {
        const path = match[1]
        if (path.startsWith('.') || path.startsWith('..')) {
          relativeImports++
        } else {
          absoluteImports++
          // Track common imports
          const count = commonImports.get(path) || 0
          commonImports.set(path, count + 1)
        }
      }
    }
    
    return {
      style: defaultImports > namedImports ? 'default' : namedImports > defaultImports ? 'named' : 'mixed',
      prefersRelativeImports: relativeImports > absoluteImports,
      commonImports
    }
  }
  
  // تحليل معالجة الأخطاء
  private analyzeErrorHandling(): ProjectDNA['errorHandling'] {
    let tryCatch = 0
    let promiseCatch = 0
    let customErrors = 0
    let logErrors = 0
    
    for (const file of this.files) {
      if (!file.content) continue
      
      tryCatch += (file.content.match(/try\s*{/g) || []).length
      promiseCatch += (file.content.match(/\.catch\(/g) || []).length
      customErrors += (file.content.match(/throw\s+new\s+\w+Error/g) || []).length
      logErrors += (file.content.match(/console\.(error|log)\s*\(/g) || []).length
    }
    
    let style: ProjectDNA['errorHandling']['style'] = 'none'
    if (tryCatch > 0 && promiseCatch > 0) style = 'mixed'
    else if (tryCatch > promiseCatch) style = 'try-catch'
    else if (promiseCatch > 0) style = 'promise-catch'
    
    return {
      style,
      prefersCustomErrors: customErrors > 0,
      logsErrors: logErrors > 0
    }
  }
  
  // تحليل أنماط التعليقات
  private analyzeCommentPatterns(): ProjectDNA['comments'] {
    let jsdocComments = 0
    let inlineComments = 0
    let totalLines = 0
    let arabicComments = 0
    let englishComments = 0
    
    for (const file of this.files) {
      if (!file.content) continue
      
      jsdocComments += (file.content.match(/\/\*\*[\s\S]*?\*\//g) || []).length
      inlineComments += (file.content.match(/\/\/.*/g) || []).length
      totalLines += file.content.split('\n').length
      
      // Check for Arabic characters in comments
      const allComments = file.content.match(/(\/\/.*|\/\*[\s\S]*?\*\/)/g) || []
      for (const comment of allComments) {
        if (/[\u0600-\u06FF]/.test(comment)) arabicComments++
        else englishComments++
      }
    }
    
    const commentRatio = inlineComments / Math.max(totalLines, 1)
    let style: ProjectDNA['comments']['style'] = 'minimal'
    if (jsdocComments > inlineComments) style = 'jsdoc'
    else if (commentRatio > 0.1) style = 'extensive'
    else if (commentRatio > 0.02) style = 'inline'
    
    return {
      style,
      language: arabicComments > englishComments ? 'ar' : englishComments > arabicComments ? 'en' : 'mixed'
    }
  }
  
  // تحليل المكتبات
  private analyzeDependencies(): ProjectDNA['dependencies'] {
    const frameworks: string[] = []
    const libraries: string[] = []
    const testingFrameworks: string[] = []
    
    // البحث في package.json
    const packageJsonFile = this.files.find(f => f.name === 'package.json')
    if (packageJsonFile?.content) {
      try {
        const pkg = JSON.parse(packageJsonFile.content)
        const allDeps = { ...pkg.dependencies, ...pkg.devDependencies }
        
        for (const [name] of Object.entries(allDeps)) {
          // Frameworks
          if (['react', 'vue', 'angular', 'next', 'nuxt', 'svelte', 'express', 'fastify', 'nestjs'].includes(name)) {
            frameworks.push(name)
          }
          // Testing
          else if (['jest', 'mocha', 'vitest', 'cypress', 'playwright', 'testing-library'].some(t => name.includes(t))) {
            testingFrameworks.push(name)
          }
          // Libraries
          else {
            libraries.push(name)
          }
        }
      } catch {}
    }
    
    return { frameworks, libraries, testingFrameworks }
  }
  
  // حساب الإحصائيات
  private calculateStats(): ProjectDNA['stats'] {
    let totalLines = 0
    let totalComplexity = 0
    
    for (const file of this.files) {
      if (!file.content) continue
      const lines = file.content.split('\n').length
      totalLines += lines
      
      // Simple complexity: count nested blocks
      const nesting = (file.content.match(/\{/g) || []).length
      totalComplexity += nesting
    }
    
    return {
      totalFiles: this.files.length,
      totalLines,
      averageFileLength: Math.round(totalLines / Math.max(this.files.length, 1)),
      complexityScore: Math.round(totalComplexity / Math.max(this.files.length, 1))
    }
  }
  
  // تحديد نمط التسمية
  private determineNamingStyle(camel: number, snake: number, pascal: number): ProjectDNA['naming']['variables'] {
    const total = camel + snake + pascal
    if (total === 0) return 'camelCase'
    
    if (camel / total > 0.6) return 'camelCase'
    if (snake / total > 0.6) return 'snake_case'
    if (pascal / total > 0.6) return 'PascalCase'
    return 'mixed'
  }
  
  private generateId(): string {
    return `dna-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

// فحص تطابق الكود مع الـ DNA
export function checkCodeAgainstDNA(
  code: string,
  fileName: string,
  dna: ProjectDNA
): DNACheckResult {
  const violations: DNAViolation[] = []
  const suggestions: string[] = []
  
  // 1. فحص أنماط التسمية
  const varMatches = code.matchAll(/(?:const|let|var)\s+(\w+)/g)
  for (const match of varMatches) {
    const varName = match[1]
    const line = code.substring(0, match.index!).split('\n').length
    
    if (dna.naming.variables === 'camelCase' && /_/.test(varName) && !/^[A-Z_]+$/.test(varName)) {
      violations.push({
        type: 'naming',
        severity: 'warning',
        message: `المتغير '${varName}' يستخدم snake_case لكن مشروعك يفضل camelCase`,
        line,
        currentPattern: 'snake_case',
        expectedPattern: 'camelCase'
      })
    }
    
    if (dna.naming.variables === 'snake_case' && /^[a-z]+[A-Z]/.test(varName)) {
      violations.push({
        type: 'naming',
        severity: 'warning',
        message: `المتغير '${varName}' يستخدم camelCase لكن مشروعك يفضل snake_case`,
        line,
        currentPattern: 'camelCase',
        expectedPattern: 'snake_case'
      })
    }
  }
  
  // 2. فحص دوال السهم
  if (dna.patterns.prefersArrowFunctions) {
    const funcMatches = code.matchAll(/function\s+(\w+)\s*\(/g)
    for (const match of funcMatches) {
      const line = code.substring(0, match.index!).split('\n').length
      violations.push({
        type: 'pattern',
        severity: 'info',
        message: `مشروعك يفضل استخدام Arrow Functions. هل تريد تحويل '${match[1]}'؟`,
        line,
        currentPattern: 'function declaration',
        expectedPattern: 'arrow function'
      })
    }
  }
  
  // 3. فحص الفواصل المنقوطة
  if (dna.patterns.usesSemicolons) {
    const lines = code.split('\n')
    lines.forEach((line, idx) => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.endsWith(';') && !trimmed.endsWith('{') && !trimmed.endsWith('}') && 
          !trimmed.startsWith('//') && !trimmed.startsWith('*') && !trimmed.startsWith('import')) {
        if (trimmed.includes('=') || trimmed.includes('return')) {
          violations.push({
            type: 'style',
            severity: 'info',
            message: 'مشروعك يستخدم الفواصل المنقوطة. يُنصح بإضافتها',
            line: idx + 1,
            currentPattern: 'no semicolon',
            expectedPattern: 'semicolon'
          })
        }
      }
    })
  }
  
  // 4. فحص الاقتباسات
  if (dna.patterns.usesSingleQuotes) {
    const doubleQuoteMatches = code.matchAll(/"[^"]*"/g)
    for (const match of doubleQuoteMatches) {
      const line = code.substring(0, match.index!).split('\n').length
      violations.push({
        type: 'style',
        severity: 'info',
        message: 'مشروعك يفضل استخدام الاقتباسات المفردة',
        line,
        currentPattern: 'double quotes',
        expectedPattern: 'single quotes'
      })
      break // واحد كافي
    }
  }
  
  // 5. فحص async/await
  if (dna.patterns.prefersAsyncAwait) {
    const thenMatches = code.matchAll(/\.then\s*\(/g)
    for (const match of thenMatches) {
      const line = code.substring(0, match.index!).split('\n').length
      violations.push({
        type: 'pattern',
        severity: 'warning',
        message: 'مشروعك يفضل استخدام async/await بدلاً من .then()',
        line,
        currentPattern: '.then()',
        expectedPattern: 'async/await'
      })
    }
  }
  
  // حساب درجة التطابق
  const totalChecks = 5
  const errors = violations.filter(v => v.severity === 'error').length
  const warnings = violations.filter(v => v.severity === 'warning').length
  const infos = violations.filter(v => v.severity === 'info').length
  
  const consistencyScore = Math.max(0, 100 - (errors * 20) - (warnings * 10) - (infos * 5))
  
  // إنشاء اقتراحات
  if (violations.length > 0) {
    suggestions.push(`تم اكتشاف ${violations.length} اختلاف عن أنماط مشروعك`)
    if (errors > 0) suggestions.push(`${errors} مشكلة حرجة تحتاج إصلاح`)
    if (warnings > 0) suggestions.push(`${warnings} تحذير يُنصح بمراجعته`)
  }
  
  return {
    fileId: fileName,
    fileName,
    consistencyScore,
    violations,
    suggestions
  }
}

// تنسيق DNA لعرضه
export function formatDNAForDisplay(dna: ProjectDNA) {
  return {
    'أنماط التسمية': {
      'المتغيرات': dna.naming.variables,
      'الدوال': dna.naming.functions,
      'الثوابت': dna.naming.constants,
      'الفئات': dna.naming.classes
    },
    'أنماط الكود': {
      'دوال السهم': dna.patterns.prefersArrowFunctions ? '✓ مفضلة' : '✗ غير مفضلة',
      'const بدلاً من let': dna.patterns.prefersConstOverLet ? '✓' : '✗',
      'الفواصل المنقوطة': dna.patterns.usesSemicolons ? '✓ مستخدمة' : '✗ غير مستخدمة',
      'اقتباسات مفردة': dna.patterns.usesSingleQuotes ? '✓' : '✗',
      'async/await': dna.patterns.prefersAsyncAwait ? '✓ مفضل' : '✗',
      'try-catch': dna.patterns.usesTryCatch ? '✓' : '✗'
    },
    'معالجة الأخطاء': {
      'النمط': dna.errorHandling.style,
      'أخطاء مخصصة': dna.errorHandling.prefersCustomErrors ? '✓' : '✗',
      'تسجيل الأخطاء': dna.errorHandling.logsErrors ? '✓' : '✗'
    },
    'التعليقات': {
      'النمط': dna.comments.style,
      'اللغة': dna.comments.language
    },
    'الإحصائيات': {
      'عدد الملفات': dna.stats.totalFiles,
      'عدد الأسطر': dna.stats.totalLines,
      'متوسط طول الملف': dna.stats.averageFileLength,
      'درجة التعقيد': dna.stats.complexityScore
    }
  }
}
