'use client'

import { useState, useCallback, useRef } from 'react'
import { useAnalyzerStore, generateId, shouldIgnoreFile, FileNode } from '@/store/analyzer-store'
import { 
  Upload, Play, Download, FileText, FolderArchive, CheckCircle, 
  AlertCircle, AlertTriangle, Info, Loader2, Trash2, FileCode,
  FolderUp, FileArchive, Search, X, Zap, File, Folder
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

// الترجمات
const TRANSLATIONS = {
  ar: {
    title: 'محلل الكود',
    uploadFile: 'رفع ملف',
    uploadFolder: 'رفع مجلد',
    uploadZip: 'رفع ZIP/TAR/RAR',
    files: 'الملفات',
    analyzed: 'محلل',
    dragFiles: 'اسحب الملفات هنا',
    orUseButtons: 'أو استخدم الأزرار أعلاه',
    selectPersona: 'الشخصية',
    selectModel: 'اختر النموذج',
    noModels: 'لا توجد نماذج',
    goSettings: 'اذهب للإعدادات لإضافة مزود',
    localModels: 'محلي (Ollama)',
    remoteModels: 'سحابي',
    mode: 'الوضع',
    fix: 'إصلاح',
    audit: 'تدقيق',
    security: 'أمني',
    analyzeFile: 'تحليل الملف',
    analyzeProject: 'تحليل المشروع',
    analyzing: 'جاري التحليل...',
    analyzingFiles: 'تحليل الملفات...',
    originalCode: 'الكود الأصلي',
    issues: 'المشاكل',
    fixedCode: 'الكود المصحح',
    analysisSummary: 'ملخص التحليل',
    line: 'سطر',
    error: 'خطأ',
    warning: 'تحذير',
    info: 'معلومة',
    selectFileToAnalyze: 'اختر ملفاً لبدء التحليل',
    outputAndExport: 'الإخراج والتصدير',
    downloadFixed: 'تحميل الملف المصحح',
    downloadProjectZip: 'تحميل المشروع (ZIP)',
    exportReport: 'تصدير التقرير',
    statistics: 'إحصائيات',
    loadedFiles: 'ملفات محملة',
    analyzedFiles: 'تم تحليلها',
    totalIssues: 'إجمالي المشاكل',
    clearAll: 'مسح الكل',
    clearResults: 'مسح النتائج',
    searchModels: 'بحث في النماذج...',
    decompressing: 'فك ضغط الملف...',
    filesExtracted: 'تم استخراج',
    filesUploaded: 'تم تحميل',
    file: 'ملف',
    from: 'من',
    startAnalysis: 'بدء تحليل',
    analysisComplete: 'اكتمل تحليل المشروع',
    projectAnalysis: 'تحليل المشروع',
    octopusMode: 'وضع الأخطبوط مفعّل - المعالجة المتوازية',
    noFilesToAnalyze: 'لا توجد ملفات للتحليل',
    selectModelFirst: 'الرجاء اختيار نموذج أولاً',
    selectFileFirst: 'الرجاء اختيار ملف أولاً'
  },
  en: {
    title: 'Code Analyzer',
    uploadFile: 'Upload File',
    uploadFolder: 'Upload Folder',
    uploadZip: 'Upload ZIP/TAR/RAR',
    files: 'Files',
    analyzed: 'Analyzed',
    dragFiles: 'Drag files here',
    orUseButtons: 'or use the buttons above',
    selectPersona: 'Persona',
    selectModel: 'Select Model',
    noModels: 'No models available',
    goSettings: 'Go to Settings to add a provider',
    localModels: 'Local (Ollama)',
    remoteModels: 'Remote',
    mode: 'Mode',
    fix: 'Fix',
    audit: 'Audit',
    security: 'Security',
    analyzeFile: 'Analyze File',
    analyzeProject: 'Analyze Project',
    analyzing: 'Analyzing...',
    analyzingFiles: 'Analyzing files...',
    originalCode: 'Original Code',
    issues: 'Issues',
    fixedCode: 'Fixed Code',
    analysisSummary: 'Analysis Summary',
    line: 'Line',
    error: 'Error',
    warning: 'Warning',
    info: 'Info',
    selectFileToAnalyze: 'Select a file to start analysis',
    outputAndExport: 'Output & Export',
    downloadFixed: 'Download Fixed File',
    downloadProjectZip: 'Download Project (ZIP)',
    exportReport: 'Export Report',
    statistics: 'Statistics',
    loadedFiles: 'Loaded Files',
    analyzedFiles: 'Analyzed',
    totalIssues: 'Total Issues',
    clearAll: 'Clear All',
    clearResults: 'Clear Results',
    searchModels: 'Search models...',
    decompressing: 'Decompressing file...',
    filesExtracted: 'Extracted',
    filesUploaded: 'Uploaded',
    file: 'file',
    from: 'from',
    startAnalysis: 'Start analysis',
    analysisComplete: 'Project analysis complete',
    projectAnalysis: 'Project Analysis',
    octopusMode: 'Octopus Mode enabled - Parallel processing',
    noFilesToAnalyze: 'No files to analyze',
    selectModelFirst: 'Please select a model first',
    selectFileFirst: 'Please select a file first'
  }
}

export function AnalyzerTab() {
  const {
    files, selectedFile, setSelectedFile, setFiles, clearFiles, addFiles,
    personas, activePersona, setActivePersona,
    models, selectedModel, setSelectedModel,
    analysisResults, setAnalysisResult, clearAnalysisResults,
    isLoading, setIsLoading, loadingMessage, setLoadingMessage,
    analysisMode, setAnalysisMode,
    addLog, isOllamaRunning, octopusModeEnabled, language,
    apiKeys
  } = useAnalyzerStore()

  const t = TRANSLATIONS[language] || TRANSLATIONS.ar

  // التأكد من أن models مصفوفة
  const modelsArray = Array.isArray(models) ? models : []
  const localModels = modelsArray.filter(m => m.type === 'local')
  const remoteModels = modelsArray.filter(m => m.type === 'remote')

  const [activeView, setActiveView] = useState<'code' | 'issues' | 'fixed'>('code')
  const [modelSearch, setModelSearch] = useState('')
  const [isModelSelectOpen, setIsModelSelectOpen] = useState(false)
  
  // متغيرات تحليل المشروع
  const [projectProgress, setProjectProgress] = useState(0)
  const [projectTotal, setProjectTotal] = useState(0)
  const [projectCurrent, setProjectCurrent] = useState(0)
  const [isProjectAnalyzing, setIsProjectAnalyzing] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)

  // تصفية النماذج حسب البحث
  const filteredLocalModels = localModels.filter(m => 
    m.name.toLowerCase().includes(modelSearch.toLowerCase())
  )
  const filteredRemoteModels = remoteModels.filter(m => 
    m.name.toLowerCase().includes(modelSearch.toLowerCase())
  )

  // رفع ملفات عادية
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (!fileList) return

    const newFiles = []
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      const path = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name
      
      if (shouldIgnoreFile(path)) continue

      const content = await readFileContent(file)
      newFiles.push({
        id: generateId(),
        name: file.name,
        type: 'file' as const,
        content,
        path,
        size: file.size
      })
    }

    addFiles(newFiles)
    addLog('success', `${t.filesUploaded} ${newFiles.length} ${t.file}`, 'analyzer')
  }, [addFiles, addLog, t])

  // رفع ملف مضغوط
  const handleZipUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setLoadingMessage(t.decompressing)
    addLog('info', `${t.decompressing} ${file.name}...`, 'analyzer')

    try {
      const JSZipModule = await import('jszip')
      const JSZip = JSZipModule.default || JSZipModule
      const zip = await JSZip.loadAsync(file)
      
      const newFiles: FileNode[] = []

      for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
        if (zipEntry.dir || shouldIgnoreFile(relativePath)) continue

        const content = await zipEntry.async('string')
        const fileName = relativePath.split('/').pop() || relativePath

        newFiles.push({
          id: generateId(),
          name: fileName,
          type: 'file' as const,
          content,
          path: relativePath,
          size: content.length
        })
      }

      addFiles(newFiles)
      addLog('success', `${t.filesExtracted} ${newFiles.length} ${t.file} ${from} ${file.name}`, 'analyzer')
    } catch (error) {
      addLog('error', `فشل فك الضغط: ${(error as Error).message}`, 'analyzer')
    } finally {
      setIsLoading(false)
      setLoadingMessage('')
    }
  }, [addFiles, addLog, setIsLoading, setLoadingMessage, t])

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string || '')
      reader.readAsText(file)
    })
  }

  // تحليل ملف واحد
  const runAnalysis = async () => {
    if (!selectedFile || !selectedFile.content) {
      addLog('error', t.selectFileFirst, 'analyzer')
      return
    }

    if (!selectedModel) {
      addLog('error', t.selectModelFirst, 'analyzer')
      return
    }

    // Check for API key if needed
    const provider = selectedModel.provider
    if (provider !== 'ollama' && !apiKeys[provider]) {
      addLog('error', `Please add your ${provider} API key in Settings`, 'analyzer')
      return
    }

    setIsLoading(true)
    setLoadingMessage(t.analyzing)
    addLog('info', `${t.startAnalysis}: ${selectedFile.name}`, 'analyzer')

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: selectedFile.content,
          fileName: selectedFile.name,
          persona: activePersona,
          mode: analysisMode,
          provider: provider,
          apiKey: apiKeys[provider],
          model: selectedModel?.id
        })
      })

      const data = await response.json()

      if (data.success) {
        setAnalysisResult(selectedFile.id, data.result)
        setActiveView('issues')
        addLog('success', `تم تحليل ${selectedFile.name} - ${data.result.issues.length} مشكلة`, 'analyzer')
      } else {
        addLog('error', data.error || 'فشل التحليل', 'analyzer')
      }
    } catch (error) {
      addLog('error', 'حدث خطأ أثناء التحليل', 'analyzer')
    } finally {
      setIsLoading(false)
      setLoadingMessage('')
    }
  }

  // تحليل المشروع كاملاً
  const analyzeProject = async () => {
    if (files.length === 0) {
      addLog('error', t.noFilesToAnalyze, 'analyzer')
      return
    }

    if (!selectedModel) {
      addLog('error', t.selectModelFirst, 'analyzer')
      return
    }

    // Check for API key if needed
    const provider = selectedModel.provider
    if (provider !== 'ollama' && !apiKeys[provider]) {
      addLog('error', `Please add your ${provider} API key in Settings`, 'analyzer')
      return
    }

    setIsProjectAnalyzing(true)
    setProjectTotal(files.length)
    setProjectCurrent(0)
    setProjectProgress(0)
    addLog('info', `🚀 ${t.projectAnalysis} (${files.length} ${t.files})...`, 'analyzer')

    if (octopusModeEnabled) {
      addLog('info', `🐙 ${t.octopusMode}`, 'analyzer')
    }

    const batchSize = octopusModeEnabled ? 3 : 1
    
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize)
      
      await Promise.all(batch.map(async (file) => {
        if (!file.content || analysisResults.has(file.id)) return

        try {
          const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code: file.content,
              fileName: file.name,
              persona: activePersona,
              mode: analysisMode,
              provider: provider,
              apiKey: apiKeys[provider],
              model: selectedModel?.id
            })
          })

          const data = await response.json()
          if (data.success) {
            setAnalysisResult(file.id, data.result)
          }
        } catch (error) {
          addLog('warning', `فشل تحليل ${file.name}`, 'analyzer')
        }
      }))

      const completed = Math.min(i + batchSize, files.length)
      setProjectCurrent(completed)
      setProjectProgress(Math.round((completed / files.length) * 100))
    }

    setIsProjectAnalyzing(false)
    addLog('success', `✅ ${t.analysisComplete}!`, 'analyzer')
  }

  // تحميل الملف المصحح
  const downloadFixedFile = () => {
    if (!selectedFile) return
    const result = analysisResults.get(selectedFile.id)
    if (!result?.fixedCode) return

    const blob = new Blob([result.fixedCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fixed_${selectedFile.name}`
    a.click()
    URL.revokeObjectURL(url)
    addLog('success', 'تم تحميل الملف المصحح', 'analyzer')
  }

  // تحميل المشروع كـ ZIP
  const downloadProjectZip = async () => {
    const { default: JSZipModule } = await import('jszip')
    const { default: saveAs } = await import('file-saver')
    
    const zip = new JSZipModule()
    
    files.forEach(file => {
      const result = analysisResults.get(file.id)
      const content = result?.fixedCode || file.content || ''
      zip.file(file.path, content)
    })

    const blob = await zip.generateAsync({ type: 'blob' })
    saveAs(blob, 'refined_project.zip')
    addLog('success', 'تم تحميل المشروع المضغوط', 'analyzer')
  }

  // تصدير التقرير
  const exportReport = async (format: 'md' | 'txt') => {
    const totalIssues = Array.from(analysisResults.values())
      .reduce((acc, r) => acc + r.issues.length, 0)

    const response = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        files: files.map(f => ({
          name: f.name,
          path: f.path,
          content: f.content || '',
          isProcessed: analysisResults.has(f.id),
          fixedContent: analysisResults.get(f.id)?.fixedCode
        })),
        format: 'report',
        reportFormat: format,
        sessionData: {
          personaName: activePersona.nameAr,
          modelName: selectedModel?.name || 'غير محدد',
          analysisMode: analysisMode,
          totalFiles: files.length,
          totalIssues,
          timestamp: new Date().toLocaleString('ar-SA')
        }
      })
    })

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analysis-report.${format}`
    a.click()
    URL.revokeObjectURL(url)
    addLog('success', `تم تصدير التقرير بصيغة ${format.toUpperCase()}`, 'analyzer')
  }

  const currentResult = selectedFile ? analysisResults.get(selectedFile.id) : null

  // أيقونة حسب نوع الملف
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    const iconMap: Record<string, React.ReactNode> = {
      'js': '📜',
      'ts': '📘',
      'tsx': '⚛️',
      'jsx': '⚛️',
      'py': '🐍',
      'java': '☕',
      'go': '🔷',
      'rs': '🦀',
      'sol': '⛓️',
      'json': '📋',
      'md': '📝',
      'css': '🎨',
      'html': '🌐'
    }
    return iconMap[ext || ''] || <File className="w-4 h-4" />
  }

  return (
    <div className="flex h-full min-h-0">
      {/* Left Panel: Files */}
      <div className="w-72 border-l border-border bg-muted/30 flex flex-col shrink-0">
        {/* Upload Area */}
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex gap-2">
            <label className="flex-1">
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                <FileArchive className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">{t.uploadFile}</p>
              </div>
              <input 
                ref={fileInputRef}
                type="file" 
                multiple 
                accept=".js,.ts,.tsx,.jsx,.py,.java,.go,.rs,.sol,.json,.md,.css,.html,.zip,.tar,.rar"
                onChange={handleFileUpload} 
                className="hidden"
              />
            </label>
            
            <label className="flex-1">
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                <FolderUp className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">{t.uploadFolder}</p>
              </div>
              <input 
                ref={folderInputRef}
                type="file" 
                multiple
                // @ts-ignore
                webkitdirectory=""
                directory=""
                onChange={handleFileUpload} 
                className="hidden"
              />
            </label>
          </div>

          {/* زر رفع ZIP منفصل */}
          <label className="block">
            <Button variant="outline" className="w-full h-10" asChild>
              <span className="flex items-center justify-center gap-2">
                <FileArchive className="w-4 h-4" />
                {t.uploadZip}
              </span>
            </Button>
            <input 
              type="file" 
              accept=".zip,.tar,.rar,.gz"
              onChange={handleZipUpload} 
              className="hidden"
            />
          </label>
          
          {files.length > 0 && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 h-9"
                onClick={clearFiles}
              >
                <Trash2 className="w-4 h-4 ml-1" />
                {t.clearAll}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 h-9"
                onClick={clearAnalysisResults}
              >
                <Trash2 className="w-4 h-4 ml-1" />
                {t.clearResults}
              </Button>
            </div>
          )}
        </div>

        {/* File List - قابل للتمرير */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-3">
            <div className="flex items-center justify-between px-2 py-2 mb-3">
              <span className="text-sm font-medium text-muted-foreground">
                {t.files} ({files.length})
              </span>
              <span className="text-sm text-green-500 font-medium">
                {analysisResults.size} {t.analyzed}
              </span>
            </div>
            
            {files.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FolderArchive className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-base font-medium">{t.dragFiles}</p>
                <p className="text-sm mt-2">{t.orUseButtons}</p>
              </div>
            ) : (
              files.map(file => (
                <button
                  key={file.id}
                  onClick={() => setSelectedFile(file)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-right transition-colors mb-2',
                    selectedFile?.id === file.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted'
                  )}
                >
                  <span className="text-lg">{getFileIcon(file.name)}</span>
                  <span className="truncate flex-1 font-medium">{file.name}</span>
                  {analysisResults.has(file.id) && (
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Middle Panel: Editor & Analysis */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Controls */}
        <div className="p-4 border-b border-border bg-card shrink-0">
          <div className="flex flex-wrap items-center gap-4">
            {/* Persona Select */}
            <Select value={activePersona.id} onValueChange={(v) => {
              const persona = personas.find(p => p.id === v)
              if (persona) setActivePersona(persona)
            }}>
              <SelectTrigger className="w-40 h-10">
                <SelectValue placeholder={t.selectPersona} />
              </SelectTrigger>
              <SelectContent>
                {personas.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    <span className="flex items-center gap-2">
                      <span>{p.icon}</span>
                      <span>{language === 'ar' ? p.nameAr : p.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Model Select with Search */}
            <div className="relative">
              <Select value={selectedModel?.id || ''} onValueChange={(v) => {
                const model = modelsArray.find(m => m.id === v)
                setSelectedModel(model || null)
                setIsModelSelectOpen(false)
              }} open={isModelSelectOpen} onOpenChange={setIsModelSelectOpen}>
                <SelectTrigger className="w-52 h-10">
                  <SelectValue placeholder={modelsArray.length === 0 ? t.noModels : t.selectModel} />
                </SelectTrigger>
                <SelectContent className="w-72">
                  {/* صندوق البحث */}
                  <div className="p-3 border-b sticky top-0 bg-popover z-10">
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        placeholder={t.searchModels}
                        value={modelSearch}
                        onChange={(e) => setModelSearch(e.target.value)}
                        className="h-9 pr-9"
                        onClick={(e) => e.stopPropagation()}
                      />
                      {modelSearch && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation()
                            setModelSearch('')
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {modelsArray.length === 0 ? (
                    <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                      {t.noModels}
                      <p className="text-xs mt-2">{t.goSettings}</p>
                    </div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto">
                      {filteredLocalModels.length > 0 && (
                        <>
                          <div className="px-3 py-2 text-xs font-medium text-muted-foreground sticky top-0 bg-popover">
                            🏠 {t.localModels}
                          </div>
                          {filteredLocalModels.map(m => (
                            <SelectItem key={m.id} value={m.id}>
                              <div className="flex items-center justify-between w-full py-1">
                                <span>{m.name}</span>
                                {m.contextLength && (
                                  <span className="text-xs text-muted-foreground">
                                    {Math.round(m.contextLength / 1000)}k
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </>
                      )}
                      {filteredRemoteModels.length > 0 && (
                        <>
                          <div className="px-3 py-2 text-xs font-medium text-muted-foreground sticky top-0 bg-popover">
                            ☁️ {t.remoteModels}
                          </div>
                          {filteredRemoteModels.map(m => (
                            <SelectItem key={m.id} value={m.id}>
                              <div className="flex items-center justify-between w-full py-1">
                                <span>{m.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {m.provider}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Mode Select */}
            <Select value={analysisMode} onValueChange={(v) => setAnalysisMode(v as typeof analysisMode)}>
              <SelectTrigger className="w-32 h-10">
                <SelectValue placeholder={t.mode} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fix">{t.fix}</SelectItem>
                <SelectItem value="audit">{t.audit}</SelectItem>
                <SelectItem value="security">{t.security}</SelectItem>
                <SelectItem value="web3">Web3</SelectItem>
              </SelectContent>
            </Select>

            {/* Analyze Buttons */}
            <div className="flex items-center gap-3 mr-auto">
              <Button 
                onClick={runAnalysis}
                disabled={!selectedFile || isLoading || !selectedModel || isProjectAnalyzing}
                className="h-10 px-5"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    {loadingMessage || t.analyzing}
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 ml-2" />
                    {t.analyzeFile}
                  </>
                )}
              </Button>
              
              <Button 
                variant={octopusModeEnabled ? "default" : "outline"}
                onClick={analyzeProject}
                disabled={files.length === 0 || isProjectAnalyzing || !selectedModel}
                className={cn("h-10 px-5", octopusModeEnabled && "bg-gradient-to-r from-purple-600 to-indigo-600")}
              >
                {isProjectAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    {projectCurrent}/{projectTotal}
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 ml-2" />
                    {t.analyzeProject}
                    {octopusModeEnabled && <span className="mr-1">🐙</span>}
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* شريط التقدم */}
          {isProjectAnalyzing && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{t.analyzingFiles}</span>
                <span className="font-medium">{projectProgress}%</span>
              </div>
              <Progress value={projectProgress} className="h-2" />
            </div>
          )}
        </div>

        {/* Content Area - قابل للتمرير */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {selectedFile ? (
            <Tabs value={activeView} onValueChange={(v) => setActiveView(v as typeof activeView)} className="h-full flex flex-col">
              <TabsList className="px-4 pt-3 shrink-0">
                <TabsTrigger value="code" className="text-sm">{t.originalCode}</TabsTrigger>
                <TabsTrigger value="issues" disabled={!currentResult} className="text-sm">
                  {t.issues} {currentResult && `(${currentResult.issues.length})`}
                </TabsTrigger>
                <TabsTrigger value="fixed" disabled={!currentResult?.fixedCode} className="text-sm">
                  {t.fixedCode}
                </TabsTrigger>
              </TabsList>
              
              <div className="flex-1 overflow-y-auto min-h-0">
                {activeView === 'code' && (
                  <pre className="p-5 text-sm font-mono bg-zinc-950 text-zinc-100">
                    <code>{selectedFile.content}</code>
                  </pre>
                )}
                
                {activeView === 'issues' && currentResult && (
                  <div className="p-5 space-y-5">
                    {/* Summary Card */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-3">
                          {t.analysisSummary}
                          <Badge variant={currentResult.score >= 70 ? 'default' : currentResult.score >= 50 ? 'secondary' : 'destructive'} className="text-sm">
                            {currentResult.score}%
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-base text-muted-foreground">{currentResult.summary}</p>
                      </CardContent>
                    </Card>

                    {/* Issues List */}
                    <div className="space-y-3">
                      {currentResult.issues.map((issue) => (
                        <Card key={issue.id} className={cn(
                          'border-r-4',
                          issue.type === 'error' && 'border-r-red-500',
                          issue.type === 'warning' && 'border-r-yellow-500',
                          issue.type === 'info' && 'border-r-blue-500'
                        )}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              {issue.type === 'error' && <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />}
                              {issue.type === 'warning' && <AlertTriangle className="w-6 h-6 text-yellow-500 shrink-0 mt-0.5" />}
                              {issue.type === 'info' && <Info className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />}
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <Badge variant="outline" className="text-sm">
                                    {t.line} {issue.line}
                                  </Badge>
                                  <Badge variant={issue.type === 'error' ? 'destructive' : issue.type === 'warning' ? 'secondary' : 'outline'} className="text-sm">
                                    {issue.type === 'error' ? t.error : issue.type === 'warning' ? t.warning : t.info}
                                  </Badge>
                                </div>
                                <p className="text-base">{issue.message}</p>
                                {issue.suggestion && (
                                  <p className="text-sm text-muted-foreground mt-2">
                                    💡 {issue.suggestion}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                
                {activeView === 'fixed' && (
                  <pre className="p-5 text-sm font-mono bg-green-950 text-green-100">
                    <code>{currentResult?.fixedCode}</code>
                  </pre>
                )}
              </div>
            </Tabs>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground p-8">
              <div className="text-center">
                <FileCode className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">{t.selectFileToAnalyze}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Export */}
      <div className="w-64 border-r border-border bg-muted/30 p-5 shrink-0 overflow-y-auto">
        <h3 className="font-bold text-lg mb-5">{t.outputAndExport}</h3>
        
        <div className="space-y-3 mb-8">
          <Button 
            onClick={downloadFixedFile} 
            disabled={!currentResult?.fixedCode}
            variant="outline"
            className="w-full h-10 justify-start"
          >
            <Download className="w-4 h-4 ml-2" />
            {t.downloadFixed}
          </Button>
          
          <Button 
            onClick={downloadProjectZip} 
            disabled={files.length === 0}
            variant="outline"
            className="w-full h-10 justify-start"
          >
            <FolderArchive className="w-4 h-4 ml-2" />
            {t.downloadProjectZip}
          </Button>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">{t.exportReport}</h4>
          <Button 
            onClick={() => exportReport('md')} 
            disabled={analysisResults.size === 0}
            variant="secondary"
            size="sm"
            className="w-full h-9 justify-start"
          >
            <FileText className="w-4 h-4 ml-2" />
            Markdown (.md)
          </Button>
          <Button 
            onClick={() => exportReport('txt')} 
            disabled={analysisResults.size === 0}
            variant="secondary"
            size="sm"
            className="w-full h-9 justify-start"
          >
            <FileText className="w-4 h-4 ml-2" />
            Text (.txt)
          </Button>
        </div>

        {/* إحصائيات سريعة */}
        <div className="mt-8 p-4 bg-background rounded-lg border">
          <h4 className="text-sm font-medium mb-3">{t.statistics}</h4>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>{t.loadedFiles}:</span>
              <span className="font-medium text-foreground">{files.length}</span>
            </div>
            <div className="flex justify-between">
              <span>{t.analyzedFiles}:</span>
              <span className="font-medium text-green-500">{analysisResults.size}</span>
            </div>
            <div className="flex justify-between">
              <span>{t.totalIssues}:</span>
              <span className="font-medium text-red-500">
                {Array.from(analysisResults.values()).reduce((acc, r) => acc + r.issues.length, 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper for translation
const from = 'من'
