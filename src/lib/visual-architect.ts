// المعماري البصري (Visual Architect)
// يحول الصور والرسومات إلى كود والعكس

import ZAI from 'zai-web-dev-sdk'

export interface VisualAnalysis {
  type: 'flowchart' | 'wireframe' | 'erd' | 'architecture' | 'screenshot' | 'whiteboard' | 'other'
  components: {
    type: string
    label?: string
    connections?: string[]
    position?: { x: number; y: number }
  }[]
  description: string
  suggestedStack: string[]
  estimatedComplexity: 'simple' | 'medium' | 'complex'
}

export interface CodeVisualization {
  code: string
  diagramType: 'flowchart' | 'sequence' | 'class' | 'component'
  mermaidCode?: string
  description: string
}

export interface VisualToCodeResult {
  analysis: VisualAnalysis
  generatedCode: {
    language: string
    code: string
    files?: { name: string; content: string }[]
  }
  explanation: string
  nextSteps: string[]
}

export class VisualArchitect {
  private zai: Awaited<ReturnType<typeof ZAI.create>> | null = null

  async initialize() {
    this.zai = await ZAI.create()
  }

  // تحليل صورة وتحويلها إلى كود
  async analyzeImage(imageUrl: string): Promise<VisualToCodeResult> {
    if (!this.zai) await this.initialize()

    // تحليل الصورة باستخدام Vision
    const analysisPrompt = `Analyze this image and identify:

1. Type: Is it a flowchart, wireframe, ERD diagram, architecture diagram, screenshot, whiteboard sketch, or other?
2. Components: List all visible components, their types, labels, and connections
3. Technology Stack: What technologies would be best suited to implement this?
4. Complexity: Rate as simple, medium, or complex

Respond in JSON format:
{
  "type": "flowchart|wireframe|erd|architecture|screenshot|whiteboard|other",
  "components": [
    {"type": "component_type", "label": "visible_label", "connections": ["connected_to"]}
  ],
  "description": "detailed description of what this represents",
  "suggestedStack": ["React", "Node.js", "PostgreSQL"],
  "estimatedComplexity": "simple|medium|complex"
}`

    const visionResponse = await this.zai!.chat.completions.createVision({
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: analysisPrompt },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        }
      ]
    })

    let analysis: VisualAnalysis
    try {
      const jsonMatch = visionResponse.choices[0]?.message?.content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Failed to parse analysis')
      }
    } catch {
      analysis = {
        type: 'other',
        components: [],
        description: visionResponse.choices[0]?.message?.content || 'Unable to analyze',
        suggestedStack: [],
        estimatedComplexity: 'medium'
      }
    }

    // توليد الكود بناءً على التحليل
    const codeGenerationPrompt = `Based on this visual analysis:
${JSON.stringify(analysis, null, 2)}

Generate implementation code. The image type is: ${analysis.type}

Provide:
1. Main code file (JavaScript/TypeScript)
2. If it's an architecture, provide folder structure
3. If it's a flowchart, provide the logic implementation

Respond in JSON:
{
  "language": "typescript",
  "code": "main code here",
  "files": [{"name": "filename.ts", "content": "code"}],
  "explanation": "What was generated and why",
  "nextSteps": ["step 1", "step 2"]
}`

    const codeResponse = await this.zai!.chat.completions.create({
      model: 'gemini-2.0-flash',
      messages: [
        { role: 'system', content: 'أنت معماري برمجيات. حول التصاميم البصرية إلى كود قابل للتنفيذ.' },
        { role: 'user', content: codeGenerationPrompt }
      ]
    })

    let generatedCode
    try {
      const jsonMatch = codeResponse.content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        generatedCode = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Failed to parse code')
      }
    } catch {
      generatedCode = {
        language: 'typescript',
        code: '// Failed to generate code',
        explanation: codeResponse.content,
        nextSteps: []
      }
    }

    return {
      analysis,
      generatedCode,
      explanation: generatedCode.explanation || '',
      nextSteps: generatedCode.nextSteps || []
    }
  }

  // تحويل الكود إلى رسم بياني
  async codeToDiagram(code: string): Promise<CodeVisualization> {
    if (!this.zai) await this.initialize()

    const prompt = `Analyze this code and create a visual representation:

\`\`\`
${code}
\`\`\`

1. Determine the best diagram type (flowchart, sequence, class, component)
2. Generate Mermaid diagram code
3. Provide a description

Respond in JSON:
{
  "diagramType": "flowchart",
  "mermaidCode": "mermaid syntax here",
  "description": "What this diagram shows"
}`

    const response = await this.zai!.chat.completions.create({
      model: 'gemini-2.0-flash',
      messages: [
        { role: 'system', content: 'أنت محلل كود. حول الكود إلى رسوم بيانية باستخدام Mermaid.' },
        { role: 'user', content: prompt }
      ]
    })

    let visualization
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        visualization = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Failed to parse')
      }
    } catch {
      visualization = {
        diagramType: 'flowchart',
        mermaidCode: '',
        description: response.content
      }
    }

    return {
      code,
      diagramType: visualization.diagramType || 'flowchart',
      mermaidCode: visualization.mermaidCode,
      description: visualization.description || ''
    }
  }

  // تحليل screenshot تطبيق مشابه
  async analyzeScreenshot(imageUrl: string): Promise<{
    uiComponents: { type: string; purpose: string }[]
    colorScheme: string[]
    layoutDescription: string
    suggestedImplementation: string
  }> {
    if (!this.zai) await this.initialize()

    const prompt = `Analyze this application screenshot:

1. Identify all UI components (buttons, forms, cards, modals, etc.)
2. Extract the color scheme
3. Describe the layout
4. Suggest how to implement this

Respond in JSON.`

    const response = await this.zai!.chat.completions.createVision({
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        }
      ]
    })

    try {
      const jsonMatch = response.choices[0]?.message?.content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch {}

    return {
      uiComponents: [],
      colorScheme: [],
      layoutDescription: response.choices[0]?.message?.content || '',
      suggestedImplementation: ''
    }
  }
}

// تنسيق نتيجة التحليل البصري
export function formatVisualResult(result: VisualToCodeResult): string {
  const lines: string[] = []

  lines.push('🖼️ تحليل الصورة')
  lines.push('═'.repeat(50))
  lines.push('')

  lines.push(`📋 النوع: ${result.analysis.type}`)
  lines.push(`📊 التعقيد: ${result.analysis.estimatedComplexity}`)
  lines.push('')
  
  lines.push(`📝 الوصف:`)
  lines.push(result.analysis.description)
  lines.push('')

  if (result.analysis.suggestedStack.length > 0) {
    lines.push(`🛠️ التقنيات المقترحة:`)
    lines.push(result.analysis.suggestedStack.join(', '))
    lines.push('')
  }

  if (result.generatedCode.files && result.generatedCode.files.length > 0) {
    lines.push(`📁 الملفات المولدة: ${result.generatedCode.files.length}`)
    result.generatedCode.files.forEach(f => {
      lines.push(`   - ${f.name}`)
    })
    lines.push('')
  }

  lines.push(`💡 التوضيح:`)
  lines.push(result.explanation)
  lines.push('')

  if (result.nextSteps.length > 0) {
    lines.push(`🎯 الخطوات التالية:`)
    result.nextSteps.forEach((step, i) => {
      lines.push(`   ${i + 1}. ${step}`)
    })
  }

  return lines.join('\n')
}
