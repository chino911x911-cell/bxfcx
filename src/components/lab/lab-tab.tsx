'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAnalyzerStore } from '@/store/analyzer-store'
import { 
  Play, RefreshCw, FileCode, Clock, MemoryStick, 
  AlertTriangle, CheckCircle, Lightbulb, Bug, Shield, FileText,
  Dna, Syringe, TestTube, FlaskConical, Beaker, Sparkles,
  Zap, Code2, ArrowRightLeft, Loader2, Atom
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { DNAAnalysisPanel } from '@/components/dna/dna-panel'
import { VaccinePanel } from '@/components/vaccine/vaccine-panel'
import { 
  ResizablePanelGroup, 
  ResizablePanel, 
  ResizableHandle 
} from '@/components/ui/resizable'
import { cn } from '@/lib/utils'

// Translations - English
const TRANSLATIONS_EN = {
  header: {
    title: 'Advanced Laboratory Center',
    subtitle: 'Simulate • Transform • Document • Analyze'
  },
  tabs: {
    lab: 'Lab',
    dna: 'DNA',
    vaccine: 'Vaccine'
  },
  input: {
    title: 'Experiment Code',
    placeholder: 'Enter code here to run simulation...'
  },
  buttons: {
    simulate: 'Simulate',
    transform: 'Transform',
    document: 'Document'
  },
  output: {
    title: 'Optimized Code',
    emptyTitle: 'No optimized code',
    emptyDesc: 'Press "Transform" to optimize code'
  },
  results: {
    title: 'Results',
    executionTime: 'Execution Time',
    memoryUsage: 'Memory Usage',
    undefined: 'Undefined',
    issues: 'Detected Issues',
    suggestions: 'Suggestions',
    risks: 'Potential Risks',
    emptyTitle: 'No results',
    emptyDesc: 'Press "Simulate" to analyze code'
  },
  docs: {
    title: 'Documentation',
    emptyTitle: 'No documentation',
    emptyDesc: 'Press "Document" to create README'
  },
  loading: {
    processing: 'Processing...'
  },
  logs: {
    startSimulation: 'Starting simulation...',
    simulationComplete: 'Simulation completed',
    simulationFailed: 'Simulation failed',
    startTransform: 'Starting code transformation...',
    transformComplete: 'Transformation complete',
    transformFailed: 'Code transformation failed',
    startDocument: 'Generating documentation...',
    documentComplete: 'Documentation generated',
    documentFailed: 'Documentation generation failed',
    startDNA: 'Starting project DNA extraction...',
    dnaComplete: 'DNA extracted',
    dnaFailed: 'DNA extraction failed',
    startVaccine: 'Starting Vaccine (Mutation Testing)...',
    vaccineComplete: 'Immunity score',
    vaccineFailed: 'Vaccine test failed'
  }
}

// Translations - Arabic
const TRANSLATIONS_AR = {
  header: {
    title: 'مركز المختبرات المتقدمة',
    subtitle: 'محاكاة • تحويل • توثيق • تحليل'
  },
  tabs: {
    lab: 'المختبر',
    dna: 'DNA',
    vaccine: 'اللقاح'
  },
  input: {
    title: 'كود التجربة',
    placeholder: 'أدخل الكود هنا لتشغيل المحاكاة...'
  },
  buttons: {
    simulate: 'محاكاة',
    transform: 'تحويل',
    document: 'توثيق'
  },
  output: {
    title: 'الكود المحسن',
    emptyTitle: 'لا يوجد كود محسن',
    emptyDesc: 'اضغط "تحويل" لتحسين الكود'
  },
  results: {
    title: 'النتائج',
    executionTime: 'زمن التنفيذ',
    memoryUsage: 'استخدام الذاكرة',
    undefined: 'غير محدد',
    issues: 'المشاكل المكتشفة',
    suggestions: 'الاقتراحات',
    risks: 'المخاطر المحتملة',
    emptyTitle: 'لا توجد نتائج',
    emptyDesc: 'اضغط "محاكاة" لتحليل الكود'
  },
  docs: {
    title: 'التوثيق',
    emptyTitle: 'لا يوجد توثيق',
    emptyDesc: 'اضغط "توثيق" لإنشاء README'
  },
  loading: {
    processing: 'جاري المعالجة...'
  },
  logs: {
    startSimulation: 'بدء تشغيل المحاكاة...',
    simulationComplete: 'اكتملت المحاكاة',
    simulationFailed: 'فشلت المحاكاة',
    startTransform: 'بدء تحويل الكود...',
    transformComplete: 'تم التحويل',
    transformFailed: 'فشل تحويل الكود',
    startDocument: 'توليد التوثيق...',
    documentComplete: 'تم توليد التوثيق',
    documentFailed: 'فشل توليد التوثيق',
    startDNA: 'بدء استخراج DNA المشروع...',
    dnaComplete: 'تم استخراج DNA',
    dnaFailed: 'فشل استخراج DNA',
    startVaccine: 'بدء اختبار اللقاح (Mutation Testing)...',
    vaccineComplete: 'درجة المناعة',
    vaccineFailed: 'فشل اختبار اللقاح'
  }
}

// Use English translations
const TRANSLATIONS = TRANSLATIONS_EN

// Animated Loading Icon Component
const AnimatedLoadingIcon = ({ type }: { type: 'simulate' | 'transform' | 'document' }) => {
  const icons = {
    simulate: <TestTube className="w-4 h-4" />,
    transform: <Sparkles className="w-4 h-4" />,
    document: <FileText className="w-4 h-4" />
  }
  
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
      {icons[type]}
    </motion.div>
  )
}

// Pulsing Dots Loader
const PulsingDots = () => (
  <div className="flex gap-1 items-center justify-center">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="w-2 h-2 bg-primary rounded-full"
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
      />
    ))}
  </div>
)

// Animated Counter
const AnimatedCounter = ({ value, suffix = '' }: { value: number; suffix?: string }) => {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="font-bold"
    >
      {value}{suffix}
    </motion.span>
  )
}

export function LabTab() {
  const { addLog, files, setProjectDNA, setDNAAnalysis, setVaccineResult, setVaccineRecommendations } = useAnalyzerStore()
  const [activeLabTab, setActiveLabTab] = useState<'lab' | 'dna' | 'vaccine'>('lab')
  
  const [inputCode, setInputCode] = useState(`// Example: Experimental code
function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price * items[i].quantity;
    console.log("Processing item", i); // Should be removed
  }
  return total;
}

// TODO: Add error handling
// FIXME: May cause issues if items is empty`)
  
  const [outputCode, setOutputCode] = useState('')
  const [documentation, setDocumentation] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeAction, setActiveAction] = useState<string | null>(null)
  const [results, setResults] = useState<{
    executionTime?: string
    memoryUsage?: string
    issues: string[]
    suggestions: string[]
    risks: string[]
  } | null>(null)

  // Run simulation
  const runSimulation = async () => {
    setIsLoading(true)
    setActiveAction('simulate')
    addLog('info', TRANSLATIONS.logs.startSimulation, 'lab')

    try {
      const response = await fetch('/api/lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: inputCode,
          action: 'simulate',
          language: 'javascript'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setResults({
          executionTime: data.result.executionTime,
          memoryUsage: data.result.memoryUsage,
          issues: data.result.issues || [],
          suggestions: data.result.suggestions || [],
          risks: data.result.risks || []
        })
        addLog('success', TRANSLATIONS.logs.simulationComplete, 'lab')
      }
    } catch (error) {
      addLog('error', TRANSLATIONS.logs.simulationFailed, 'lab')
    } finally {
      setIsLoading(false)
      setActiveAction(null)
    }
  }

  // Transform to production
  const transformToProduction = async () => {
    setIsLoading(true)
    setActiveAction('transform')
    addLog('info', TRANSLATIONS.logs.startTransform, 'lab')

    try {
      const response = await fetch('/api/lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: inputCode,
          action: 'transform',
          language: 'javascript'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setOutputCode(data.transformedCode)
        addLog('success', `${TRANSLATIONS.logs.transformComplete} (${data.originalLength} → ${data.newLength} chars)`, 'lab')
      }
    } catch (error) {
      addLog('error', TRANSLATIONS.logs.transformFailed, 'lab')
    } finally {
      setIsLoading(false)
      setActiveAction(null)
    }
  }

  // Generate documentation
  const generateDocumentation = async () => {
    setIsLoading(true)
    setActiveAction('document')
    addLog('info', TRANSLATIONS.logs.startDocument, 'lab')

    try {
      const response = await fetch('/api/lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: inputCode || outputCode,
          action: 'document',
          language: 'javascript'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setDocumentation(data.documentation)
        addLog('success', TRANSLATIONS.logs.documentComplete, 'lab')
      }
    } catch (error) {
      addLog('error', TRANSLATIONS.logs.documentFailed, 'lab')
    } finally {
      setIsLoading(false)
      setActiveAction(null)
    }
  }

  // Extract DNA
  const extractDNA = async () => {
    setIsLoading(true)
    addLog('info', TRANSLATIONS.logs.startDNA, 'dna')

    try {
      const response = await fetch('/api/dna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: files.map(f => ({ name: f.name, content: f.content || '', path: f.path })),
          action: 'extract-dna'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setProjectDNA(data.dna)
        setDNAAnalysis(data.analysis)
        addLog('success', `${TRANSLATIONS.logs.dnaComplete} - ${data.dna.consistencyScore}% consistency`, 'dna')
      }
    } catch (error) {
      addLog('error', TRANSLATIONS.logs.dnaFailed, 'dna')
    } finally {
      setIsLoading(false)
    }
  }

  // Run Vaccine
  const runVaccine = async (code: string) => {
    setIsLoading(true)
    addLog('info', TRANSLATIONS.logs.startVaccine, 'vaccine')

    try {
      const response = await fetch('/api/vaccine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language: 'javascript' })
      })

      const data = await response.json()
      
      if (data.success) {
        setVaccineResult(data.result)
        setVaccineRecommendations(data.recommendations)
        addLog('success', `${TRANSLATIONS.logs.vaccineComplete}: ${data.result.mutationScore}%`, 'vaccine')
      }
    } catch (error) {
      addLog('error', TRANSLATIONS.logs.vaccineFailed, 'vaccine')
    } finally {
      setIsLoading(false)
    }
  }

  // Tab Button Component
  const TabButton = ({ 
    active, 
    onClick, 
    icon: Icon, 
    label, 
    gradient 
  }: { 
    active: boolean
    onClick: () => void
    icon: React.ElementType
    label: string
    gradient: string
  }) => (
    <motion.button
      onClick={onClick}
      className={cn(
        "relative px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2",
        active 
          ? "text-white shadow-lg" 
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {active && (
        <motion.div
          layoutId="activeTab"
          className={cn("absolute inset-0 rounded-lg", gradient)}
          transition={{ type: "spring", duration: 0.5 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">
        <Icon className="w-4 h-4" />
        {label}
      </span>
    </motion.button>
  )

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header with Tabs */}
      <div className="p-4 border-b border-border/50 bg-gradient-to-r from-card/80 to-card/40 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <FlaskConical className="w-8 h-8 text-primary" />
              </motion.div>
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {TRANSLATIONS.header.title}
              </h2>
              <p className="text-xs text-muted-foreground">{TRANSLATIONS.header.subtitle}</p>
            </div>
          </motion.div>
          
          {/* Lab Type Tabs */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-1 bg-muted/30 p-1 rounded-xl backdrop-blur-sm border border-border/50"
          >
            <TabButton
              active={activeLabTab === 'lab'}
              onClick={() => setActiveLabTab('lab')}
              icon={Beaker}
              label={TRANSLATIONS.tabs.lab}
              gradient="bg-gradient-to-r from-blue-500 to-cyan-500"
            />
            <TabButton
              active={activeLabTab === 'dna'}
              onClick={() => setActiveLabTab('dna')}
              icon={Dna}
              label={TRANSLATIONS.tabs.dna}
              gradient="bg-gradient-to-r from-purple-500 to-pink-500"
            />
            <TabButton
              active={activeLabTab === 'vaccine'}
              onClick={() => setActiveLabTab('vaccine')}
              icon={Syringe}
              label={TRANSLATIONS.tabs.vaccine}
              gradient="bg-gradient-to-r from-green-500 to-emerald-500"
            />
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* DNA Tab */}
          {activeLabTab === 'dna' && (
            <motion.div
              key="dna"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full p-4 overflow-auto"
            >
              <DNAAnalysisPanel onExtractDNA={extractDNA} />
            </motion.div>
          )}

          {/* Vaccine Tab */}
          {activeLabTab === 'vaccine' && (
            <motion.div
              key="vaccine"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full p-4 overflow-auto"
            >
              <VaccinePanel onRunVaccine={runVaccine} />
            </motion.div>
          )}

          {/* Classic Lab Tab */}
          {activeLabTab === 'lab' && (
            <motion.div
              key="lab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 min-h-0"
            >
              <ResizablePanelGroup direction="horizontal" className="h-full">
                {/* Input Panel */}
                <ResizablePanel defaultSize={50} minSize={30}>
                  <div className="h-full flex flex-col bg-gradient-to-b from-card/50 to-card/30">
                    {/* Input Header */}
                    <div className="p-3 border-b border-border/50 bg-gradient-to-r from-muted/50 to-muted/30 flex items-center justify-between backdrop-blur-sm">
                      <h3 className="font-medium flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: isLoading && activeAction === 'simulate' ? 360 : 0 }}
                          transition={{ duration: 1, repeat: isLoading && activeAction === 'simulate' ? Infinity : 0, ease: "linear" }}
                        >
                          <Code2 className="w-4 h-4 text-blue-500" />
                        </motion.div>
                        <span>{TRANSLATIONS.input.title}</span>
                        <Badge variant="outline" className="text-xs">Input</Badge>
                      </h3>
                      <div className="flex gap-2">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button 
                            onClick={runSimulation}
                            disabled={isLoading || !inputCode}
                            variant="outline"
                            size="sm"
                            className={cn(
                              "gap-2 transition-all duration-300",
                              activeAction === 'simulate' && "border-blue-500 text-blue-500"
                            )}
                          >
                            {activeAction === 'simulate' ? (
                              <AnimatedLoadingIcon type="simulate" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                            {TRANSLATIONS.buttons.simulate}
                          </Button>
                        </motion.div>
                        
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button 
                            onClick={transformToProduction}
                            disabled={isLoading || !inputCode}
                            size="sm"
                            className={cn(
                              "gap-2 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600",
                              activeAction === 'transform' && "ring-2 ring-violet-400"
                            )}
                          >
                            {activeAction === 'transform' ? (
                              <AnimatedLoadingIcon type="transform" />
                            ) : (
                              <Sparkles className="w-4 h-4" />
                            )}
                            {TRANSLATIONS.buttons.transform}
                          </Button>
                        </motion.div>
                        
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button 
                            onClick={generateDocumentation}
                            disabled={isLoading || (!inputCode && !outputCode)}
                            variant="secondary"
                            size="sm"
                            className={cn(
                              "gap-2",
                              activeAction === 'document' && "ring-2 ring-green-400"
                            )}
                          >
                            {activeAction === 'document' ? (
                              <AnimatedLoadingIcon type="document" />
                            ) : (
                              <FileText className="w-4 h-4" />
                            )}
                            {TRANSLATIONS.buttons.document}
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                    
                    {/* Code Editor */}
                    <div className="flex-1 relative">
                      <Textarea
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value)}
                        placeholder={TRANSLATIONS.input.placeholder}
                        className="h-full font-mono text-sm rounded-none border-0 resize-none focus-visible:ring-0 bg-transparent"
                      />
                      {/* Loading Overlay */}
                      <AnimatePresence>
                        {isLoading && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-background/50 backdrop-blur-[2px] flex items-center justify-center pointer-events-none"
                          >
                            <div className="flex flex-col items-center gap-3">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                              >
                                <Atom className="w-8 h-8 text-primary" />
                              </motion.div>
                              <PulsingDots />
                              <span className="text-sm text-muted-foreground">{TRANSLATIONS.loading.processing}</span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </ResizablePanel>

                {/* Resize Handle */}
                <ResizableHandle withHandle className="w-2 bg-gradient-to-b from-border to-border/50 hover:bg-primary/20 transition-colors" />

                {/* Output Panel */}
                <ResizablePanel defaultSize={50} minSize={30}>
                  <div className="h-full flex flex-col bg-gradient-to-b from-card/30 to-card/20">
                    <Tabs defaultValue="output" className="flex-1 flex flex-col">
                      <TabsList className="px-3 pt-2 bg-muted/30 gap-1">
                        <TabsTrigger 
                          value="output" 
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white"
                        >
                          <ArrowRightLeft className="w-4 h-4 mr-1" />
                          {TRANSLATIONS.output.title}
                        </TabsTrigger>
                        <TabsTrigger 
                          value="results"
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white"
                        >
                          <Zap className="w-4 h-4 mr-1" />
                          {TRANSLATIONS.results.title}
                        </TabsTrigger>
                        <TabsTrigger 
                          value="docs"
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white"
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          {TRANSLATIONS.docs.title}
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="output" className="flex-1 m-0">
                        <AnimatePresence mode="wait">
                          {outputCode ? (
                            <motion.div
                              key="output"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="h-full"
                            >
                              <ScrollArea className="h-full [&>div]:!overflow-y-auto [&>div]:scrollbar-thin [&>div]:scrollbar-thumb-muted-foreground/20 [&>div]:scrollbar-track-transparent hover:[&>div]:scrollbar-thumb-muted-foreground/40">
                                <pre className="p-4 text-sm font-mono bg-gradient-to-b from-green-950/80 to-green-900/40 text-green-100 min-h-full">
                                  <code>{outputCode}</code>
                                </pre>
                              </ScrollArea>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="empty"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="h-full flex items-center justify-center text-muted-foreground"
                            >
                              <div className="text-center p-8">
                                <motion.div
                                  animate={{ y: [0, -5, 0] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                >
                                  <Sparkles className="w-16 h-16 mx-auto mb-4 text-violet-500/50" />
                                </motion.div>
                                <p className="text-lg font-medium">{TRANSLATIONS.output.emptyTitle}</p>
                                <p className="text-sm mt-1">{TRANSLATIONS.output.emptyDesc}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </TabsContent>

                      <TabsContent value="results" className="flex-1 m-0 overflow-hidden">
                        <ScrollArea className="h-full [&>div]:!overflow-y-auto [&>div]:scrollbar-thin [&>div]:scrollbar-thumb-muted-foreground/20 [&>div]:scrollbar-track-transparent hover:[&>div]:scrollbar-thumb-muted-foreground/40">
                          <AnimatePresence mode="wait">
                            {results ? (
                              <motion.div
                                key="results"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="p-4 space-y-4"
                              >
                                {/* Performance Metrics */}
                                <motion.div 
                                  initial={{ y: 20, opacity: 0 }}
                                  animate={{ y: 0, opacity: 1 }}
                                  transition={{ delay: 0.1 }}
                                  className="grid grid-cols-2 gap-4"
                                >
                                  <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-500/20">
                                    <CardContent className="p-4">
                                      <div className="flex items-center gap-3">
                                        <motion.div
                                          animate={{ rotate: [0, 10, -10, 0] }}
                                          transition={{ duration: 2, repeat: Infinity }}
                                        >
                                          <Clock className="w-6 h-6 text-blue-500" />
                                        </motion.div>
                                        <div>
                                          <p className="text-sm text-muted-foreground">{TRANSLATIONS.results.executionTime}</p>
                                          <p className="text-xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                                            {results.executionTime || TRANSLATIONS.results.undefined}
                                          </p>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                  <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border-purple-500/20">
                                    <CardContent className="p-4">
                                      <div className="flex items-center gap-3">
                                        <motion.div
                                          animate={{ scale: [1, 1.1, 1] }}
                                          transition={{ duration: 1.5, repeat: Infinity }}
                                        >
                                          <MemoryStick className="w-6 h-6 text-purple-500" />
                                        </motion.div>
                                        <div>
                                          <p className="text-sm text-muted-foreground">{TRANSLATIONS.results.memoryUsage}</p>
                                          <p className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                                            {results.memoryUsage || TRANSLATIONS.results.undefined}
                                          </p>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </motion.div>

                                {/* Issues */}
                                <AnimatePresence>
                                  {results.issues.length > 0 && (
                                    <motion.div
                                      initial={{ y: 20, opacity: 0 }}
                                      animate={{ y: 0, opacity: 1 }}
                                      exit={{ y: -20, opacity: 0 }}
                                      transition={{ delay: 0.2 }}
                                    >
                                      <Card className="border-red-500/30 bg-gradient-to-br from-red-500/10 to-orange-500/5">
                                        <CardHeader className="pb-2">
                                          <CardTitle className="text-base flex items-center gap-2 text-red-500">
                                            <motion.div
                                              animate={{ rotate: [0, -10, 10, 0] }}
                                              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                                            >
                                              <Bug className="w-5 h-5" />
                                            </motion.div>
                                            {TRANSLATIONS.results.issues}
                                            <Badge variant="destructive" className="ml-2">
                                              <AnimatedCounter value={results.issues.length} />
                                            </Badge>
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                          <ul className="space-y-2">
                                            {results.issues.map((issue, i) => (
                                              <motion.li
                                                key={i}
                                                initial={{ x: -20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: 0.1 * i }}
                                                className="flex items-start gap-2 text-sm p-2 rounded-lg bg-red-500/5"
                                              >
                                                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                                {issue}
                                              </motion.li>
                                            ))}
                                          </ul>
                                        </CardContent>
                                      </Card>
                                    </motion.div>
                                  )}
                                </AnimatePresence>

                                {/* Suggestions */}
                                <AnimatePresence>
                                  {results.suggestions.length > 0 && (
                                    <motion.div
                                      initial={{ y: 20, opacity: 0 }}
                                      animate={{ y: 0, opacity: 1 }}
                                      exit={{ y: -20, opacity: 0 }}
                                      transition={{ delay: 0.3 }}
                                    >
                                      <Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/5">
                                        <CardHeader className="pb-2">
                                          <CardTitle className="text-base flex items-center gap-2 text-green-500">
                                            <motion.div
                                              animate={{ scale: [1, 1.2, 1] }}
                                              transition={{ duration: 1, repeat: Infinity }}
                                            >
                                              <Lightbulb className="w-5 h-5" />
                                            </motion.div>
                                            {TRANSLATIONS.results.suggestions}
                                            <Badge variant="default" className="ml-2 bg-green-500">
                                              <AnimatedCounter value={results.suggestions.length} />
                                            </Badge>
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                          <ul className="space-y-2">
                                            {results.suggestions.map((suggestion, i) => (
                                              <motion.li
                                                key={i}
                                                initial={{ x: -20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: 0.1 * i }}
                                                className="flex items-start gap-2 text-sm p-2 rounded-lg bg-green-500/5"
                                              >
                                                <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                                {suggestion}
                                              </motion.li>
                                            ))}
                                          </ul>
                                        </CardContent>
                                      </Card>
                                    </motion.div>
                                  )}
                                </AnimatePresence>

                                {/* Risks */}
                                <AnimatePresence>
                                  {results.risks.length > 0 && (
                                    <motion.div
                                      initial={{ y: 20, opacity: 0 }}
                                      animate={{ y: 0, opacity: 1 }}
                                      exit={{ y: -20, opacity: 0 }}
                                      transition={{ delay: 0.4 }}
                                    >
                                      <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-yellow-500/5">
                                        <CardHeader className="pb-2">
                                          <CardTitle className="text-base flex items-center gap-2 text-amber-500">
                                            <Shield className="w-5 h-5" />
                                            {TRANSLATIONS.results.risks}
                                            <Badge variant="outline" className="ml-2 border-amber-500 text-amber-500">
                                              <AnimatedCounter value={results.risks.length} />
                                            </Badge>
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                          <ul className="space-y-2">
                                            {results.risks.map((risk, i) => (
                                              <motion.li
                                                key={i}
                                                initial={{ x: -20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: 0.1 * i }}
                                                className="flex items-start gap-2 text-sm p-2 rounded-lg bg-amber-500/5"
                                              >
                                                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                                {risk}
                                              </motion.li>
                                            ))}
                                          </ul>
                                        </CardContent>
                                      </Card>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </motion.div>
                            ) : (
                              <motion.div
                                key="empty-results"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="h-full flex items-center justify-center text-muted-foreground"
                              >
                                <div className="text-center p-8">
                                  <motion.div
                                    animate={{ rotate: [0, 360] }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                  >
                                    <TestTube className="w-16 h-16 mx-auto mb-4 text-blue-500/50" />
                                  </motion.div>
                                  <p className="text-lg font-medium">{TRANSLATIONS.results.emptyTitle}</p>
                                  <p className="text-sm mt-1">{TRANSLATIONS.results.emptyDesc}</p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </ScrollArea>
                      </TabsContent>

                      <TabsContent value="docs" className="flex-1 m-0 overflow-hidden">
                        <ScrollArea className="h-full [&>div]:!overflow-y-auto [&>div]:scrollbar-thin [&>div]:scrollbar-thumb-muted-foreground/20 [&>div]:scrollbar-track-transparent hover:[&>div]:scrollbar-thumb-muted-foreground/40">
                          <AnimatePresence mode="wait">
                            {documentation ? (
                              <motion.div
                                key="docs"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="p-4"
                              >
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                  <pre className="whitespace-pre-wrap text-sm bg-gradient-to-br from-amber-950/30 to-orange-900/20 p-4 rounded-lg border border-amber-500/20">
                                    {documentation}
                                  </pre>
                                </div>
                              </motion.div>
                            ) : (
                              <motion.div
                                key="empty-docs"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="h-full flex items-center justify-center text-muted-foreground"
                              >
                                <div className="text-center p-8">
                                  <motion.div
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                  >
                                    <FileText className="w-16 h-16 mx-auto mb-4 text-amber-500/50" />
                                  </motion.div>
                                  <p className="text-lg font-medium">{TRANSLATIONS.docs.emptyTitle}</p>
                                  <p className="text-sm mt-1">{TRANSLATIONS.docs.emptyDesc}</p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </ScrollArea>
                      </TabsContent>
                    </Tabs>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
