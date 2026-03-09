'use client'

import { useState } from 'react'
import { useAnalyzerStore } from '@/store/analyzer-store'
import { 
  Syringe, Shield, ShieldAlert, ShieldCheck, 
  Bug, Code, AlertTriangle, CheckCircle, XCircle,
  Sparkles, TestTube
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface VaccinePanelProps {
  onRunVaccine: (code: string) => void
}

export function VaccinePanel({ onRunVaccine }: VaccinePanelProps) {
  const { vaccineResult, vaccineRecommendations, isLoading } = useAnalyzerStore()
  const [code, setCode] = useState('')
  const [activeView, setActiveView] = useState<'input' | 'results' | 'recommendations'>('input')

  const handleRun = () => {
    if (code.trim()) {
      onRunVaccine(code)
      setActiveView('results')
    }
  }

  if (!vaccineResult && activeView === 'input') {
    return (
      <div className="space-y-4">
        <Card className="border-dashed">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <Syringe className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold">محرك اللقاح</h3>
                <p className="text-sm text-muted-foreground">Mutation Testing</p>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              يقوم المحرك بإنشاء "طفرات" من الكود (تغيير المنطق عمداً) واختبار ما إذا كانت اختباراتك تكتشف هذه التغييرات.
              إذا نجت الطفرة = اختباراتك ضعيفة!
            </p>
            
            <Textarea
              placeholder="أدخل الكود الذي تريد اختباره هنا..."
              className="font-mono text-sm min-h-[200px]"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            
            <Button 
              onClick={handleRun}
              disabled={!code.trim() || isLoading}
              className="w-full mt-4 gap-2"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  جاري الحقن...
                </>
              ) : (
                <>
                  <Syringe className="w-4 h-4" />
                  تشغيل اللقاح
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Score Header */}
      <Card className={cn(
        "border-2",
        vaccineResult!.mutationScore >= 80 ? "border-green-500 bg-green-50 dark:bg-green-900/10" :
        vaccineResult!.mutationScore >= 50 ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10" :
        "border-red-500 bg-red-50 dark:bg-red-900/10"
      )}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center",
                vaccineResult!.mutationScore >= 80 ? "bg-green-100 dark:bg-green-900/20" :
                vaccineResult!.mutationScore >= 50 ? "bg-yellow-100 dark:bg-yellow-900/20" :
                "bg-red-100 dark:bg-red-900/20"
              )}>
                {vaccineResult!.mutationScore >= 80 ? (
                  <ShieldCheck className="w-8 h-8 text-green-600" />
                ) : vaccineResult!.mutationScore >= 50 ? (
                  <Shield className="w-8 h-8 text-yellow-600" />
                ) : (
                  <ShieldAlert className="w-8 h-8 text-red-600" />
                )}
              </div>
              <div>
                <h3 className="text-2xl font-bold">
                  {vaccineResult!.mutationScore >= 80 ? 'مناعة قوية!' :
                   vaccineResult!.mutationScore >= 50 ? 'مناعة متوسطة' : 'مناعة ضعيفة!'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {vaccineResult!.killedMutants} من {vaccineResult!.totalMutants} طفرة تم اكتشافها
                </p>
              </div>
            </div>
            <div className="text-left">
              <div className={cn(
                "text-5xl font-bold",
                vaccineResult!.mutationScore >= 80 ? "text-green-600" :
                vaccineResult!.mutationScore >= 50 ? "text-yellow-600" : "text-red-600"
              )}>
                {vaccineResult!.mutationScore}%
              </div>
              <p className="text-xs text-muted-foreground">درجة المناعة</p>
            </div>
          </div>
          
          <Progress 
            value={vaccineResult!.mutationScore} 
            className={cn(
              "h-3",
              vaccineResult!.mutationScore >= 80 ? "[&>div]:bg-green-500" :
              vaccineResult!.mutationScore >= 50 ? "[&>div]:bg-yellow-500" : "[&>div]:bg-red-500"
            )}
          />
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatBadge 
          icon={<TestTube className="w-4 h-4" />}
          label="إجمالي الطفرات"
          value={vaccineResult!.totalMutants}
          variant="default"
        />
        <StatBadge 
          icon={<CheckCircle className="w-4 h-4" />}
          label="المكتشفة"
          value={vaccineResult!.killedMutants}
          variant="success"
        />
        <StatBadge 
          icon={<Bug className="w-4 h-4" />}
          label="الناجية"
          value={vaccineResult!.survivedMutants}
          variant={vaccineResult!.survivedMutants > 0 ? "destructive" : "success"}
        />
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        <Button
          variant={activeView === 'results' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveView('results')}
        >
          نتائج الطفرات
        </Button>
        <Button
          variant={activeView === 'recommendations' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveView('recommendations')}
        >
          الاختبارات المقترحة
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="h-[300px]">
        {activeView === 'results' && (
          <div className="space-y-2 p-1">
            {vaccineResult!.mutants.slice(0, 20).map((mutant) => (
              <MutantCard key={mutant.id} mutant={mutant} />
            ))}
          </div>
        )}

        {activeView === 'recommendations' && vaccineRecommendations && (
          <div className="prose prose-sm dark:prose-invert max-w-none p-1">
            <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
              {vaccineRecommendations}
            </pre>
          </div>
        )}
      </ScrollArea>

      {/* Run Again */}
      <Button 
        variant="outline" 
        onClick={() => {
          setActiveView('input')
        }}
        className="w-full"
      >
        تشغيل مرة أخرى
      </Button>
    </div>
  )
}

// مكون بطاقة الطفرة
function MutantCard({ mutant }: { mutant: { 
  id: string; 
  type: string; 
  originalCode: string; 
  mutatedCode: string; 
  line: number; 
  survived: boolean 
}}) {
  return (
    <div className={cn(
      "p-3 rounded-lg border text-sm",
      mutant.survived 
        ? "border-red-200 bg-red-50 dark:bg-red-900/10" 
        : "border-green-200 bg-green-50 dark:bg-green-900/10"
    )}>
      <div className="flex items-center justify-between mb-2">
        <Badge variant="outline" className="text-xs">
          {mutant.type}
        </Badge>
        <div className="flex items-center gap-1">
          {mutant.survived ? (
            <>
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-xs text-red-600">نجت!</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-xs text-green-600">اكتشفت</span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 font-mono text-xs">
        <span className="text-muted-foreground">السطر {mutant.line}:</span>
        <span className="line-through text-red-400">{mutant.originalCode}</span>
        <span>→</span>
        <span className="text-green-600">{mutant.mutatedCode}</span>
      </div>
    </div>
  )
}

// مكون شارة الإحصائيات
function StatBadge({ 
  icon, 
  label, 
  value, 
  variant 
}: { 
  icon: React.ReactNode
  label: string
  value: number
  variant: 'default' | 'success' | 'destructive'
}) {
  const colors = {
    default: 'bg-muted text-foreground',
    success: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
    destructive: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
  }

  return (
    <div className={cn("p-3 rounded-lg", colors[variant])}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  )
}
