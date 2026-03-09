import { NextRequest, NextResponse } from 'next/server'

interface ExportFile {
  name: string
  path: string
  content: string
  isProcessed: boolean
  fixedContent?: string
}

interface ExportRequest {
  files: ExportFile[]
  format: 'zip' | 'session' | 'report'
  reportFormat?: 'md' | 'txt'
  sessionData?: {
    personaName: string
    modelName: string
    analysisMode: string
    totalFiles: number
    totalIssues: number
    timestamp: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ExportRequest = await request.json()
    const { files, format, reportFormat, sessionData } = body

    if (format === 'report') {
      const report = generateReport(files, sessionData, reportFormat || 'md')
      return new NextResponse(report, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': `attachment; filename="analysis-report.${reportFormat || 'md'}"`
        }
      })
    }

    if (format === 'session') {
      const sessionJson = JSON.stringify({
        ...sessionData,
        files: files.map(f => ({
          name: f.name,
          path: f.path,
          hasIssues: f.isProcessed
        })),
        exportedAt: new Date().toISOString()
      }, null, 2)
      
      return new NextResponse(sessionJson, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': 'attachment; filename="session-export.json"'
        }
      })
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 })

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء التصدير' },
      { status: 500 }
    )
  }
}

function generateReport(
  files: ExportFile[], 
  sessionData: ExportRequest['sessionData'],
  format: 'md' | 'txt'
): string {
  const separator = format === 'md' ? '##' : '='.repeat(50)
  const subSeparator = format === 'md' ? '###' : '-'.repeat(30)
  
  let report = ''
  
  // Header
  report += `${separator} تقرير تحليل الكود\n\n`
  
  if (sessionData) {
    report += `${subSeparator} معلومات الجلسة\n`
    report += `- الوكيل: ${sessionData.personaName}\n`
    report += `- النموذج: ${sessionData.modelName}\n`
    report += `- وضع التحليل: ${sessionData.analysisMode}\n`
    report += `- عدد الملفات: ${sessionData.totalFiles}\n`
    report += `- إجمالي المشاكل: ${sessionData.totalIssues}\n`
    report += `- التاريخ: ${sessionData.timestamp}\n\n`
  }
  
  // Files
  report += `${separator} الملفات المحللة\n\n`
  
  files.forEach((file, index) => {
    report += `${subSeparator} ${index + 1}. ${file.name}\n`
    report += `- المسار: ${file.path}\n`
    report += `- الحالة: ${file.isProcessed ? 'تم التحليل ✓' : 'لم يتم التحليل'}\n`
    
    if (file.isProcessed && file.fixedContent) {
      report += `- تم إنشاء كود مصحح\n`
    }
    report += '\n'
  })
  
  // Footer
  report += `${separator}\n`
  report += `تم إنشاء هذا التقرير تلقائياً بواسطة Smart Dev Hub\n`
  report += `التاريخ: ${new Date().toLocaleString('ar-SA')}\n`
  
  return report
}
