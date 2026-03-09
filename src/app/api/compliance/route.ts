import { NextRequest, NextResponse } from 'next/server'
import { LegalComplianceEngine, formatComplianceReport } from '@/lib/legal-compliance'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, code, fileNames, regulations } = body

    const engine = new LegalComplianceEngine()

    if (action === 'check-compliance') {
      const result = await engine.checkCompliance(
        code || '',
        fileNames || [],
        regulations || ['gdpr', 'ccpa']
      )
      return NextResponse.json({ 
        success: true, 
        result,
        formatted: formatComplianceReport(result)
      })
    }

    if (action === 'list-regulations') {
      const regulationsList = [
        { id: 'gdpr', name: 'GDPR', region: 'EU' },
        { id: 'hipaa', name: 'HIPAA', region: 'US' },
        { id: 'ccpa', name: 'CCPA', region: 'California' },
        { id: 'pci-dss', name: 'PCI DSS', region: 'Global' }
      ]
      return NextResponse.json({ success: true, regulations: regulationsList })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Legal Compliance error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في فحص الامتثال' },
      { status: 500 }
    )
  }
}
