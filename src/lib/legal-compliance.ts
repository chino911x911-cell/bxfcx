// نظام الامتثال القانوني الذكي (Legal Compliance AI)
// يراقب تغيرات القوانين ويفحص الكود

export interface LegalRegulation {
  id: string
  name: string
  region: string
  description: string
  effectiveDate: string
  lastUpdated: string
  severity: 'info' | 'warning' | 'critical'
  requirements: string[]
}

export interface ComplianceViolation {
  regulation: string
  severity: 'info' | 'warning' | 'critical'
  line?: number
  code?: string
  issue: string
  impact: string
  fix: string
  fine?: string
}

export interface ComplianceReport {
  overallScore: number
  status: 'compliant' | 'partial' | 'non-compliant'
  violations: ComplianceViolation[]
  recommendations: string[]
  checkedRegulations: string[]
  lastCheck: string
}

// القوانين المدعومة
export const REGULATIONS: LegalRegulation[] = [
  {
    id: 'gdpr',
    name: 'GDPR',
    region: 'EU',
    description: 'General Data Protection Regulation',
    effectiveDate: '2018-05-25',
    lastUpdated: '2024-01-01',
    severity: 'critical',
    requirements: [
      'Consent for data collection',
      'Right to be forgotten',
      'Data portability',
      'Privacy by design',
      'Data retention limits',
      'Breach notification'
    ]
  },
  {
    id: 'hipaa',
    name: 'HIPAA',
    region: 'US',
    description: 'Health Insurance Portability and Accountability Act',
    effectiveDate: '1996-08-21',
    lastUpdated: '2024-01-01',
    severity: 'critical',
    requirements: [
      'PHI encryption',
      'Access controls',
      'Audit logs',
      'Minimum necessary standard',
      'Business associate agreements'
    ]
  },
  {
    id: 'ccpa',
    name: 'CCPA/CPRA',
    region: 'California',
    description: 'California Consumer Privacy Act',
    effectiveDate: '2020-01-01',
    lastUpdated: '2023-01-01',
    severity: 'warning',
    requirements: [
      'Right to know',
      'Right to delete',
      'Right to opt-out',
      'Non-discrimination',
      'Data inventory'
    ]
  },
  {
    id: 'pci-dss',
    name: 'PCI DSS',
    region: 'Global',
    description: 'Payment Card Industry Data Security Standard',
    effectiveDate: '2004-12-15',
    lastUpdated: '2022-03-01',
    severity: 'critical',
    requirements: [
      'Firewall configuration',
      'Default passwords',
      'Cardholder data protection',
      'Encryption of transmissions',
      'Antivirus software',
      'Secure systems'
    ]
  }
]

export class LegalComplianceEngine {
  private regulations: Map<string, LegalRegulation>

  constructor() {
    this.regulations = new Map(REGULATIONS.map(r => [r.id, r]))
  }

  // فحص الامتثال للكود
  async checkCompliance(
    code: string,
    fileNames: string[],
    applicableRegulations: string[] = ['gdpr', 'ccpa']
  ): Promise<ComplianceReport> {
    const violations: ComplianceViolation[] = []
    const checkedRegulations: string[] = []
    const recommendations: string[] = []

    for (const regId of applicableRegulations) {
      const regulation = this.regulations.get(regId)
      if (!regulation) continue
      
      checkedRegulations.push(regulation.name)

      // فحص متطلبات القانون
      switch (regId) {
        case 'gdpr':
          violations.push(...this.checkGDPR(code, fileNames))
          break
        case 'hipaa':
          violations.push(...this.checkHIPAA(code, fileNames))
          break
        case 'ccpa':
          violations.push(...this.checkCCPA(code, fileNames))
          break
        case 'pci-dss':
          violations.push(...this.checkPCIDSS(code, fileNames))
          break
      }
    }

    // حساب النتيجة
    const criticalCount = violations.filter(v => v.severity === 'critical').length
    const warningCount = violations.filter(v => v.severity === 'warning').length
    
    let overallScore = 100
    overallScore -= criticalCount * 20
    overallScore -= warningCount * 5
    
    let status: 'compliant' | 'partial' | 'non-compliant' = 'compliant'
    if (criticalCount > 0) status = 'non-compliant'
    else if (warningCount > 0) status = 'partial'

    // توصيات
    if (violations.some(v => v.issue.includes('IP'))) {
      recommendations.push('🔧 نفذ نظام Anonymization لعناوين IP')
    }
    if (violations.some(v => v.issue.includes('password'))) {
      recommendations.push('🔐 استخدم bcrypt أو Argon2 للتشفير')
    }
    if (violations.some(v => v.issue.includes('consent'))) {
      recommendations.push('📋 أضف نظام Consent Management')
    }

    return {
      overallScore: Math.max(0, overallScore),
      status,
      violations,
      recommendations,
      checkedRegulations,
      lastCheck: new Date().toISOString()
    }
  }

  // فحص GDPR
  private checkGDPR(code: string, fileNames: string[]): ComplianceViolation[] {
    const violations: ComplianceViolation[] = []

    // فحص تخزين IP بدون موافقة
    if (code.includes('req.ip') || code.includes('request.ip')) {
      if (!code.includes('consent') && !code.includes('anonymiz')) {
        violations.push({
          regulation: 'GDPR',
          severity: 'critical',
          issue: 'تخزين عنوان IP بدون موافقة صريحة',
          impact: 'غرامة تصل إلى 4% من الإيرادات السنوية أو €20M',
          fix: `// Before: const ip = req.ip;
// After:
const ip = req.ip;
const hashedIP = crypto.createHash('sha256').update(ip).digest('hex');
// أو احصل على موافقة صريحة قبل التخزين`
        })
      }
    }

    // فحص كلمات المرور بدون تشفير
    if (code.includes('password') && !code.includes('bcrypt') && !code.includes('argon2')) {
      violations.push({
        regulation: 'GDPR',
        severity: 'critical',
        issue: 'كلمات المرور قد لا تكون مشفرة بشكل كافٍ',
        impact: 'خرق للائحة حماية البيانات',
        fix: 'استخدم bcrypt.hash(password, 10) أو Argon2'
      })
    }

    // فحص عدم وجود Right to be Forgotten
    if (fileNames.some(f => f.includes('user')) && !code.includes('delete') && !code.includes('remove')) {
      violations.push({
        regulation: 'GDPR',
        severity: 'warning',
        issue: 'لا يوجد آلية لحذف بيانات المستخدم',
        impact: 'خرق المادة 17 - Right to Erasure',
        fix: `// أضف نقطة نهاية للحذف
app.delete('/user/:id', async (req, res) => {
  await User.destroy({ where: { id: req.params.id } });
  // احذف أيضاً البيانات المرتبطة
  await UserData.destroy({ where: { userId: req.params.id } });
});`
      })
    }

    // فحص الاحتفاظ بالبيانات
    if (code.includes('save') || code.includes('create')) {
      if (!code.includes('retention') && !code.includes('expire') && !code.includes('ttl')) {
        violations.push({
          regulation: 'GDPR',
          severity: 'warning',
          issue: 'لا يوجد حد لفترة الاحتفاظ بالبيانات',
          impact: 'خرق مبدأ Storage Limitation',
          fix: 'أضف تاريخ انتهاء للبيانات: expiresAt: new Date(Date.now() + 30*24*60*60*1000)'
        })
      }
    }

    return violations
  }

  // فحص HIPAA
  private checkHIPAA(code: string, fileNames: string[]): ComplianceViolation[] {
    const violations: ComplianceViolation[] = []

    if (code.includes('patient') || code.includes('medical') || code.includes('health')) {
      if (!code.includes('encrypt')) {
        violations.push({
          regulation: 'HIPAA',
          severity: 'critical',
          issue: 'بيانات صحية بدون تشفير',
          impact: 'غرامات من $100 إلى $50,000 لكل انتهاك',
          fix: 'استخدم AES-256 لتشفير جميع بيانات المرضى'
        })
      }

      if (!code.includes('audit') && !code.includes('log')) {
        violations.push({
          regulation: 'HIPAA',
          severity: 'warning',
          issue: 'لا يوجد نظام Audit Trail',
          impact: 'عدم القدرة على تتبع الوصول',
          fix: 'سجل جميع عمليات الوصول للبيانات الصحية'
        })
      }
    }

    return violations
  }

  // فحص CCPA
  private checkCCPA(code: string, fileNames: string[]): ComplianceViolation[] {
    const violations: ComplianceViolation[] = []

    if (code.includes('sell') || code.includes('share') || code.includes('third')) {
      if (!code.includes('opt-out') && !code.includes('consent')) {
        violations.push({
          regulation: 'CCPA',
          severity: 'critical',
          issue: 'بيع أو مشاركة بيانات بدون خيار Opt-Out',
          impact: 'غرامات تصل إلى $7,500 لكل انتهاك',
          fix: 'أضف رابط "Do Not Sell My Personal Information" ونفذ Opt-Out'
        })
      }
    }

    return violations
  }

  // فحص PCI-DSS
  private checkPCIDSS(code: string, fileNames: string[]): ComplianceViolation[] {
    const violations: ComplianceViolation[] = []

    // فحص أرقام البطاقات
    if (code.includes('card') || code.includes('credit') || code.includes('payment')) {
      if (code.match(/\d{16}/) || code.includes('cardNumber')) {
        if (!code.includes('token')) {
          violations.push({
            regulation: 'PCI-DSS',
            severity: 'critical',
            issue: 'قد يتم تخزين أرقام البطاقات بشكل صريح',
            impact: 'غرامات شهرية من $5,000 إلى $100,000',
            fix: `// لا تخزن أرقام البطاقات أبداً!
// استخدم Tokenization
const token = await paymentProvider.tokenize(cardNumber);
// خزن الـ token فقط`
          })
        }
      }

      if (!code.includes('https') && !code.includes('tls')) {
        violations.push({
          regulation: 'PCI-DSS',
          severity: 'critical',
          issue: 'نقل بيانات الدفع بدون تشفير',
          impact: 'خرق Requirement 4',
          fix: 'استخدم HTTPS/TLS 1.2+ لجميع اتصالات الدفع'
        })
      }
    }

    return violations
  }
}

// تنسيق تقرير الامتثال
export function formatComplianceReport(report: ComplianceReport): string {
  const lines: string[] = []
  
  lines.push('⚖️ تقرير الامتثال القانوني')
  lines.push('═'.repeat(50))
  lines.push('')
  
  const statusEmoji = {
    'compliant': '✅',
    'partial': '⚠️',
    'non-compliant': '🚨'
  }
  
  lines.push(`الحالة: ${statusEmoji[report.status]} ${report.status.toUpperCase()}`)
  lines.push(`النتيجة: ${report.overallScore}/100`)
  lines.push(`تاريخ الفحص: ${new Date(report.lastCheck).toLocaleString('ar')}`)
  lines.push('')
  
  lines.push(`القوانين المفحوصة: ${report.checkedRegulations.join(', ')}`)
  lines.push('')

  if (report.violations.length > 0) {
    lines.push('📋 الانتهاكات المكتشفة:')
    lines.push('')
    
    report.violations.forEach((v, i) => {
      const severityEmoji = { info: 'ℹ️', warning: '⚠️', critical: '🚨' }[v.severity]
      lines.push(`${i + 1}. ${severityEmoji} [${v.regulation}] ${v.issue}`)
      lines.push(`   الأثر: ${v.impact}`)
      if (v.fine) lines.push(`   الغرامة: ${v.fine}`)
      lines.push('')
    })
  }

  if (report.recommendations.length > 0) {
    lines.push('💡 التوصيات:')
    report.recommendations.forEach(r => lines.push(`   ${r}`))
  }

  return lines.join('\n')
}
