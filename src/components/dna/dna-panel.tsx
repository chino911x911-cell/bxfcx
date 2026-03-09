'use client'

import { useState } from 'react'
import { useAnalyzerStore } from '@/store/analyzer-store'
import { 
  Dna, Sparkles, CheckCircle, XCircle, AlertTriangle,
  Code, FileCode, Hash, ArrowRight, Syringe
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface DNAAnalysisPanelProps {
  onExtractDNA: () => void
}

export function DNAAnalysisPanel({ onExtractDNA }: DNAAnalysisPanelProps) {
  const { projectDNA, dnaAnalysis, files, isLoading } = useAnalyzerStore()
  const [activeTab, setActiveTab] = useState<'patterns' | 'naming' | 'stats' | 'analysis'>('patterns')

  if (!projectDNA) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <Dna className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-bold mb-2">الحمض النووي للمشروع</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            سيتم استخراج أنماط الكود غير المكتوبة من مشروعك.
            يساعدك هذا على كتابة كود متسق 100% مع فريقك.
          </p>
          <Button 
            onClick={onExtractDNA}
            disabled={files.length === 0 || isLoading}
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            استخراج DNA
          </Button>
          {files.length === 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              قم بتحميل ملفات المشروع أولاً
            </p>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-l from-primary/5 to-transparent">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Dna className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold">Project DNA</h3>
                <p className="text-xs text-muted-foreground">
                  تم الاستخراج • {projectDNA.stats?.totalFiles || files.length} ملف
                </p>
              </div>
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-primary">
                {projectDNA.consistencyScore || 85}%
              </div>
              <p className="text-xs text-muted-foreground">درجة التناسق</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        {[
          { id: 'patterns', label: 'الأنماط' },
          { id: 'naming', label: 'التسمية' },
          { id: 'stats', label: 'الإحصائيات' },
          { id: 'analysis', label: 'التحليل' }
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      <ScrollArea className="h-[400px]">
        {activeTab === 'patterns' && projectDNA.patterns && (
          <div className="space-y-3 p-1">
            <PatternCard
              title="دوال السهم"
              description="استخدام Arrow Functions"
              isPreferred={projectDNA.patterns.prefersArrowFunctions}
              icon={<Code className="w-4 h-4" />}
            />
            <PatternCard
              title="const بدلاً من let"
              description="استخدام const للمتغيرات الثابتة"
              isPreferred={projectDNA.patterns.prefersConstOverLet}
              icon={<Hash className="w-4 h-4" />}
            />
            <PatternCard
              title="الفواصل المنقوطة"
              description="استخدام الفواصل المنقوطة"
              isPreferred={projectDNA.patterns.usesSemicolons}
              icon={<span className="text-sm font-bold">;</span>}
            />
            <PatternCard
              title="اقتباسات مفردة"
              description="استخدام الاقتباسات المفردة بدلاً من المزدوجة"
              isPreferred={projectDNA.patterns.usesSingleQuotes}
              icon={<span className="text-sm font-bold">&apos;</span>}
            />
            <PatternCard
              title="async/await"
              description="استخدام async/await بدلاً من .then()"
              isPreferred={projectDNA.patterns.prefersAsyncAwait}
              icon={<ArrowRight className="w-4 h-4" />}
            />
            <PatternCard
              title="try-catch"
              description="معالجة الأخطاء بـ try-catch"
              isPreferred={projectDNA.patterns.usesTryCatch}
              icon={<AlertTriangle className="w-4 h-4" />}
            />
          </div>
        )}

        {activeTab === 'naming' && projectDNA.naming && (
          <div className="space-y-3 p-1">
            <NamingCard title="المتغيرات" pattern={projectDNA.naming.variables} />
            <NamingCard title="الدوال" pattern={projectDNA.naming.functions} />
            <NamingCard title="الثوابت" pattern={projectDNA.naming.constants} />
            <NamingCard title="الفئات" pattern={projectDNA.naming.classes} />
          </div>
        )}

        {activeTab === 'stats' && projectDNA.stats && (
          <div className="grid grid-cols-2 gap-4 p-1">
            <StatCard label="إجمالي الملفات" value={projectDNA.stats.totalFiles} icon={<FileCode className="w-4 h-4" />} />
            <StatCard label="إجمالي الأسطر" value={projectDNA.stats.totalLines} icon={<Code className="w-4 h-4" />} />
            <StatCard label="متوسط طول الملف" value={`${projectDNA.stats.averageFileLength} سطر`} icon={<Hash className="w-4 h-4" />} />
            <StatCard label="درجة التعقيد" value={projectDNA.stats.complexityScore} icon={<AlertTriangle className="w-4 h-4" />} />
          </div>
        )}

        {activeTab === 'analysis' && dnaAnalysis && (
          <div className="p-1">
            <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
              {dnaAnalysis}
            </pre>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

// مكون بطاقة النمط
function PatternCard({ 
  title, 
  description, 
  isPreferred, 
  icon 
}: { 
  title: string
  description: string
  isPreferred: boolean
  icon: React.ReactNode
}) {
  return (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-lg border",
      isPreferred ? "border-green-200 bg-green-50 dark:bg-green-900/10" : "border-border"
    )}>
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center",
          isPreferred ? "bg-green-100 dark:bg-green-900/20 text-green-600" : "bg-muted"
        )}>
          {icon}
        </div>
        <div>
          <h4 className="font-medium text-sm">{title}</h4>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {isPreferred ? (
        <CheckCircle className="w-5 h-5 text-green-500" />
      ) : (
        <XCircle className="w-5 h-5 text-muted-foreground" />
      )}
    </div>
  )
}

// مكون بطاقة التسمية
function NamingCard({ title, pattern }: { title: string; pattern: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border">
      <span className="font-medium text-sm">{title}</span>
      <Badge variant="outline" className="font-mono">
        {pattern}
      </Badge>
    </div>
  )
}

// مكون بطاقة الإحصائيات
function StatCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2 text-muted-foreground">
          {icon}
          <span className="text-xs">{label}</span>
        </div>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}
