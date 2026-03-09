'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAnalyzerStore, EvolutionStats, EvolutionProposal, DiaryEntry } from '@/store/analyzer-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Dna,
  Play,
  Pause,
  RefreshCw,
  Brain,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Target,
  Lightbulb,
  BookOpen,
  Shield,
  Zap,
  Activity,
  Eye
} from 'lucide-react'

// Translations - English
const TRANSLATIONS_EN = {
  header: {
    title: 'Self-Evolution Engine',
    subtitle: 'Core nucleus for autonomous improvement'
  },
  growth: {
    title: 'Growth Stage',
    autoEvolve: 'Auto Evolution',
    needsApproval: 'Needs Approval'
  },
  stages: {
    infant: '🥚 Infant - Needs approval for every change',
    child: '🐣 Child - Requests approval for major changes',
    adolescent: '🐥 Teen - Applies small improvements automatically',
    adult: '🦅 Adult - Refactors code cautiously',
    sage: '🐉 Sage - Evolves intelligently with confidence'
  },
  stats: {
    title: 'Statistics',
    total: 'Total Evolutions',
    successful: 'Successful',
    failed: 'Failed',
    pending: 'Pending',
    successRate: 'Success Rate'
  },
  proposals: {
    title: 'Pending Proposals',
    description: 'Improvement suggestions awaiting your approval',
    empty: 'No proposals currently',
    emptyHint: 'Run monitoring to discover improvement opportunities',
    benefits: 'Benefits:',
    approve: 'Approve',
    reject: 'Reject',
    trust: 'Trust'
  },
  diary: {
    title: 'Evolution Diary',
    description: 'Record of the app\'s thoughts and learning',
    empty: 'No entries recorded yet',
    importance: 'Importance'
  },
  tabs: {
    dashboard: 'Dashboard',
    diary: 'Diary',
    settings: 'Settings'
  },
  controls: {
    runCycle: 'Run Evolution Cycle',
    monitorOnly: 'Monitor Only',
    refresh: 'Refresh'
  },
  alerts: {
    systemTitle: 'Self-Evolution System',
    systemDesc: 'This system allows the app to improve itself automatically based on errors and user requests. Higher trust level means more independent evolution capability.',
    coreTitle: 'Protected Core',
    coreDesc: 'Some core files are protected and cannot be modified through the evolution system to ensure app stability.',
    protectedFiles: 'Protected Files:',
    growthLevels: 'Growth Levels:'
  },
  settings: {
    title: 'Evolution Settings',
    description: 'Control how the app evolves'
  },
  logs: {
    cycleStart: '🧬 Starting self-evolution cycle...',
    cycleComplete: '✅ Cycle completed: {discovered} discoveries, {proposed} proposals, {applied} applied',
    monitorStart: '👁️ Starting self-monitoring...',
    monitorFound: 'Discovered {count} evolution opportunities',
    evolveRunning: 'Evolving...',
    fetchFailed: 'Failed to fetch evolution stats',
    diaryFailed: 'Failed to fetch diary',
    cycleFailed: 'Evolution cycle failed',
    monitorFailed: 'Monitoring failed'
  }
}

// Translations - Arabic
const TRANSLATIONS_AR = {
  header: {
    title: 'نواة التطور الذاتي',
    subtitle: 'النواة الأساسية للتحسين المستقل'
  },
  growth: {
    title: 'مرحلة النمو',
    autoEvolve: 'تطور تلقائي',
    needsApproval: 'يحتاج موافقة'
  },
  stages: {
    infant: '🥚 الرضيع - يحتاج موافقة لكل تغيير',
    child: '🐣 الطفل - يطلب موافقة للتغييرات المهمة',
    adolescent: '🐥 المراهق - يطبق تحسينات صغيرة تلقائياً',
    adult: '🦅 البالغ - يعيد هيكلة الكود بحذر',
    sage: '🐉 الحكيم - يطور نفسه بذكاء وثقة'
  },
  stats: {
    title: 'الإحصائيات',
    total: 'إجمالي التطورات',
    successful: 'ناجحة',
    failed: 'فاشلة',
    pending: 'معلقة',
    successRate: 'معدل النجاح'
  },
  proposals: {
    title: 'المقترحات المعلقة',
    description: 'اقتراحات التحسين التي تحتاج موافقتك',
    empty: 'لا توجد مقترحات حالياً',
    emptyHint: 'شغّل المراقبة لاكتشاف فرص التحسين',
    benefits: 'الفوائد:',
    approve: 'موافقة',
    reject: 'رفض',
    trust: 'ثقة'
  },
  diary: {
    title: 'مذكرات التطور',
    description: 'سجل تفكير التطبيق وتعلمه',
    empty: 'لم يتم تسجيل أي مداخلات بعد',
    importance: 'أهمية'
  },
  tabs: {
    dashboard: 'لوحة التحكم',
    diary: 'المذكرات',
    settings: 'الإعدادات'
  },
  controls: {
    runCycle: 'تشغيل دورة التطور',
    monitorOnly: 'مراقبة فقط',
    refresh: 'تحديث'
  },
  alerts: {
    systemTitle: 'نظام التطور الذاتي',
    systemDesc: 'هذا النظام يسمح للتطبيق بتحسين نفسه تلقائياً بناءً على الأخطاء وطلبات المستخدم. كلما زاد مستوى الثقة، زادت قدرة التطبيق على التطور المستقل.',
    coreTitle: 'النواة الثابتة',
    coreDesc: 'بعض الملفات الأساسية محمية ولا يمكن تعديلها من خلال نظام التطور لضمان استقرار التطبيق.',
    protectedFiles: 'الملفات المحمية:',
    growthLevels: 'مستويات النمو:'
  },
  settings: {
    title: 'إعدادات التطور',
    description: 'تحكم في كيفية تطور التطبيق'
  },
  logs: {
    cycleStart: '🧬 بدء دورة التطور الذاتي...',
    cycleComplete: '✅ اكتملت الدورة: {discovered} اكتشاف، {proposed} مقترح، {applied} تطبيق',
    monitorStart: '👁️ بدء المراقبة الذاتية...',
    monitorFound: 'اكتشفت {count} فرص للتطور',
    evolveRunning: 'جاري التطور...',
    fetchFailed: 'فشل في جلب إحصائيات التطور',
    diaryFailed: 'فشل في جلب المذكرات',
    cycleFailed: 'فشل دورة التطور',
    monitorFailed: 'فشلت المراقبة'
  }
}

// Use English translations
const TRANSLATIONS = TRANSLATIONS_EN

// Growth stage icons
const STAGE_ICONS: Record<string, string> = {
  infant: '🥚',
  child: '🐣',
  adolescent: '🐥',
  adult: '🦅',
  sage: '🐉'
}

// ألوان المراحل
const STAGE_COLORS: Record<string, string> = {
  infant: 'bg-gray-500',
  child: 'bg-blue-500',
  adolescent: 'bg-green-500',
  adult: 'bg-purple-500',
  sage: 'bg-amber-500'
}

export function EvolutionTab() {
  const {
    evolutionStats,
    setEvolutionStats,
    evolutionProposals,
    addEvolutionProposal,
    removeEvolutionProposal,
    evolutionDiary,
    setEvolutionDiary,
    isEvolutionRunning,
    setIsEvolutionRunning,
    addLog
  } = useAnalyzerStore()

  const [activeSubTab, setActiveSubTab] = useState('dashboard')
  const [isLoading, setIsLoading] = useState(false)

  // جلب الإحصائيات
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/evolution?XTransformPort=3005')
      const data = await response.json()
      if (data.success && data.stats) {
        setEvolutionStats(data.stats as EvolutionStats)
      }
    } catch (error) {
      console.error('Failed to fetch evolution stats:', error)
    }
  }, [setEvolutionStats])

  // جلب المذكرات
  const fetchDiary = useCallback(async () => {
    try {
      const response = await fetch('/api/evolution?XTransformPort=3005', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'diary' })
      })
      const data = await response.json()
      if (data.success && data.diary) {
        setEvolutionDiary(data.diary as DiaryEntry[])
      }
    } catch (error) {
      console.error('Failed to fetch diary:', error)
    }
  }, [setEvolutionDiary])

  // التهيئة
  useEffect(() => {
    fetchStats()
    fetchDiary()
    const interval = setInterval(fetchStats, 30000) // كل 30 ثانية
    return () => clearInterval(interval)
  }, [fetchStats, fetchDiary])

  // تشغيل دورة التطور
  const runEvolutionCycle = async () => {
    setIsLoading(true)
    setIsEvolutionRunning(true)
    addLog('info', '🧬 بدء دورة التطور الذاتي...', 'evolution')

    try {
      const response = await fetch('/api/evolution?XTransformPort=3005', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cycle' })
      })
      const data = await response.json()

      if (data.success) {
        const { discovered, proposed, applied, errors } = data.result
        addLog('success', 
          `✅ اكتملت الدورة: ${discovered} اكتشاف، ${proposed} مقترح، ${applied} تطبيق`, 
          'evolution'
        )
        if (errors.length > 0) {
          errors.forEach((e: string) => addLog('warning', e, 'evolution'))
        }
      }

      await fetchStats()
      await fetchDiary()
    } catch (error) {
      addLog('error', `فشل في تشغيل الدورة: ${(error as Error).message}`, 'evolution')
    } finally {
      setIsLoading(false)
      setIsEvolutionRunning(false)
    }
  }

  // تشغيل المراقبة فقط
  const runMonitoring = async () => {
    setIsLoading(true)
    addLog('info', '👁️ بدء المراقبة الذاتية...', 'evolution')

    try {
      const response = await fetch('/api/evolution?XTransformPort=3005', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'monitor' })
      })
      const data = await response.json()

      if (data.success && data.triggers) {
        addLog('success', `اكتشفت ${data.triggers.length} فرص للتطور`, 'evolution')
        data.triggers.forEach((t: { type: string; description: string }) => {
          addLog('info', `  • [${t.type}] ${t.description}`, 'evolution')
        })
      }
    } catch (error) {
      addLog('error', `فشل في المراقبة: ${(error as Error).message}`, 'evolution')
    } finally {
      setIsLoading(false)
    }
  }

  // عرض حالة النمو
  const GrowthStage = () => {
    const stats = evolutionStats || {
      trustLevel: 0,
      stage: 'infant' as const,
      stageDescription: TRANSLATIONS.stages.infant,
      totalEvolutions: 0,
      successfulEvolutions: 0,
      failedEvolutions: 0,
      pendingProposals: 0,
      isRunning: false,
      canAutoEvolve: false
    }

    return (
      <Card className="relative overflow-hidden">
        <div className={`absolute top-0 left-0 right-0 h-1 ${STAGE_COLORS[stats.stage]}`} />
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="text-3xl">{STAGE_ICONS[stats.stage]}</span>
              {TRANSLATIONS.growth.title}
            </CardTitle>
            <Badge variant={stats.canAutoEvolve ? "default" : "secondary"}>
              {stats.canAutoEvolve ? TRANSLATIONS.growth.autoEvolve : TRANSLATIONS.growth.needsApproval}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-4">
            <div className="text-4xl font-bold mb-2">{stats.trustLevel}%</div>
            <p className="text-sm text-muted-foreground">{stats.stageDescription}</p>
          </div>
          
          <Progress value={stats.trustLevel} className="h-3" />
          
          <div className="grid grid-cols-5 gap-1 text-xs text-center">
            {['infant', 'child', 'adolescent', 'adult', 'sage'].map((stage) => (
              <div 
                key={stage}
                className={`p-1 rounded ${
                  stats.stage === stage 
                    ? STAGE_COLORS[stage] + ' text-white' 
                    : 'bg-muted'
                }`}
              >
                {STAGE_ICONS[stage]}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // عرض الإحصائيات
  const StatsPanel = () => {
    const stats = evolutionStats || {
      totalEvolutions: 0,
      successfulEvolutions: 0,
      failedEvolutions: 0,
      pendingProposals: 0
    }

    const successRate = stats.totalEvolutions > 0 
      ? Math.round((stats.successfulEvolutions / stats.totalEvolutions) * 100) 
      : 0

    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5" />
            {TRANSLATIONS.stats.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{stats.totalEvolutions}</div>
              <div className="text-xs text-muted-foreground">{TRANSLATIONS.stats.total}</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-500">{stats.successfulEvolutions}</div>
              <div className="text-xs text-muted-foreground">{TRANSLATIONS.stats.successful}</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-red-500">{stats.failedEvolutions}</div>
              <div className="text-xs text-muted-foreground">{TRANSLATIONS.stats.failed}</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-amber-500">{stats.pendingProposals}</div>
              <div className="text-xs text-muted-foreground">{TRANSLATIONS.stats.pending}</div>
            </div>
          </div>

          {stats.totalEvolutions > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>{TRANSLATIONS.stats.successRate}</span>
                <span>{successRate}%</span>
              </div>
              <Progress value={successRate} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // عرض المقترحات
  const ProposalsPanel = () => {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="h-5 w-5" />
            {TRANSLATIONS.proposals.title}
          </CardTitle>
          <CardDescription>
            {TRANSLATIONS.proposals.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {evolutionProposals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Lightbulb className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>{TRANSLATIONS.proposals.empty}</p>
              <p className="text-sm">{TRANSLATIONS.proposals.emptyHint}</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {evolutionProposals.map((proposal) => (
                  <div key={proposal.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{proposal.targetFile}</h4>
                        <p className="text-sm text-muted-foreground">{proposal.reason}</p>
                      </div>
                      <Badge>{TRANSLATIONS.proposals.trust}: {proposal.trustRequired}%</Badge>
                    </div>
                    
                    {proposal.expectedBenefits.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs text-green-500">{TRANSLATIONS.proposals.benefits}</span>
                        <ul className="text-xs list-disc list-inside">
                          {proposal.expectedBenefits.map((b, i) => (
                            <li key={i}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="default">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {TRANSLATIONS.proposals.approve}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => removeEvolutionProposal(proposal.id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        {TRANSLATIONS.proposals.reject}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    )
  }

  // عرض المذكرات
  const DiaryPanel = () => {
    const typeIcons: Record<string, React.ReactNode> = {
      observation: <Eye className="h-4 w-4" />,
      idea: <Lightbulb className="h-4 w-4" />,
      experiment: <Zap className="h-4 w-4" />,
      result: <CheckCircle className="h-4 w-4" />,
      lesson: <BookOpen className="h-4 w-4" />
    }

    const typeColors: Record<string, string> = {
      observation: 'text-blue-500',
      idea: 'text-yellow-500',
      experiment: 'text-purple-500',
      result: 'text-green-500',
      lesson: 'text-amber-500'
    }

    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5" />
            {TRANSLATIONS.diary.title}
          </CardTitle>
          <CardDescription>
            {TRANSLATIONS.diary.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {evolutionDiary.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>{TRANSLATIONS.diary.empty}</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {evolutionDiary.map((entry, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-3 p-3 bg-muted rounded-lg"
                  >
                    <div className={typeColors[entry.type]}>
                      {typeIcons[entry.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{entry.entry}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleString('ar-SA')}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {TRANSLATIONS.diary.importance}: {entry.importance}/10
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    )
  }

  // لوحة التحكم الرئيسية
  const DashboardTab = () => (
    <div className="space-y-4">
      {/* أزرار التحكم */}
      <div className="flex gap-2 flex-wrap">
        <Button 
          onClick={runEvolutionCycle}
          disabled={isLoading || isEvolutionRunning}
          className="gap-2"
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          {TRANSLATIONS.controls.runCycle}
        </Button>
        
        <Button 
          variant="outline"
          onClick={runMonitoring}
          disabled={isLoading}
          className="gap-2"
        >
          <Eye className="h-4 w-4" />
          {TRANSLATIONS.controls.monitorOnly}
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => { fetchStats(); fetchDiary(); }}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          {TRANSLATIONS.controls.refresh}
        </Button>
      </div>

      {/* حالة النمو والإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GrowthStage />
        <StatsPanel />
      </div>

      {/* الملاحظات */}
      <Alert>
        <Brain className="h-4 w-4" />
        <AlertTitle>{TRANSLATIONS.alerts.systemTitle}</AlertTitle>
        <AlertDescription>
          {TRANSLATIONS.alerts.systemDesc}
        </AlertDescription>
      </Alert>

      {/* المقترحات */}
      <ProposalsPanel />
    </div>
  )

  return (
    <div className="h-full flex flex-col p-4">
      {/* العنوان */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Dna className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{TRANSLATIONS.header.title}</h1>
            <p className="text-sm text-muted-foreground">
              {TRANSLATIONS.header.subtitle}
            </p>
          </div>
        </div>
        
        {isEvolutionRunning && (
          <Badge variant="default" className="gap-1">
            <RefreshCw className="h-3 w-3 animate-spin" />
            {TRANSLATIONS.logs.evolveRunning}
          </Badge>
        )}
      </div>

      {/* التبويبات */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="flex-1">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">
            <Target className="h-4 w-4 ml-2" />
            {TRANSLATIONS.tabs.dashboard}
          </TabsTrigger>
          <TabsTrigger value="diary">
            <BookOpen className="h-4 w-4 ml-2" />
            {TRANSLATIONS.tabs.diary}
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Shield className="h-4 w-4 ml-2" />
            {TRANSLATIONS.tabs.settings}
          </TabsTrigger>
        </TabsList>

        <div className="mt-4 flex-1 overflow-auto">
          <TabsContent value="dashboard" className="m-0">
            <DashboardTab />
          </TabsContent>
          
          <TabsContent value="diary" className="m-0">
            <DiaryPanel />
          </TabsContent>
          
          <TabsContent value="settings" className="m-0">
            <Card>
              <CardHeader>
                <CardTitle>{TRANSLATIONS.settings.title}</CardTitle>
                <CardDescription>
                  {TRANSLATIONS.settings.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{TRANSLATIONS.alerts.coreTitle}</AlertTitle>
                  <AlertDescription>
                    {TRANSLATIONS.alerts.coreDesc}
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <h4 className="font-medium">{TRANSLATIONS.alerts.protectedFiles}</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• src/lib/evolution-engine.ts</li>
                    <li>• src/lib/db.ts</li>
                    <li>• prisma/schema.prisma</li>
                    <li>• mini-services/evolution-service/index.ts</li>
                  </ul>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">{TRANSLATIONS.alerts.growthLevels}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span>🥚</span>
                      <span>{TRANSLATIONS.stages.infant}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>🐣</span>
                      <span>{TRANSLATIONS.stages.child}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>🐥</span>
                      <span>{TRANSLATIONS.stages.adolescent}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>🦅</span>
                      <span>{TRANSLATIONS.stages.adult}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>🐉</span>
                      <span>{TRANSLATIONS.stages.sage}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
