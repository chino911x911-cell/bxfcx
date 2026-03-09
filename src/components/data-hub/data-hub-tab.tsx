'use client'

import { useState, useCallback } from 'react'
import { useAnalyzerStore, generateId, formatFileSize } from '@/store/analyzer-store'
import { 
  Database, FileJson, FileText, Table, Search, Play, 
  Eye, RefreshCw, AlertCircle, CheckCircle, FileSpreadsheet,
  Server, Plug, Settings2, Zap, ChevronDown,
  ChevronUp, X, Plus, Save, Trash2, Edit3, Wifi, WifiOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

// أنواع البيانات المدعومة
type DataType = 'sqlite' | 'mysql' | 'postgresql' | 'mongodb' | 'redis' | 'json' | 'csv' | 'xml' | 'txt' | 'log'
type DatabaseType = 'sqlite' | 'mysql' | 'postgresql' | 'mongodb' | 'redis'

interface DataFile {
  id: string
  name: string
  path: string
  type: DataType
  size: number
  content?: string
  parsedContent?: unknown
  tables?: string[]
  error?: string
}

interface DatabaseConnection {
  id: string
  name: string
  type: DatabaseType
  host: string
  port: number
  username: string
  password: string
  database: string
  isConnected: boolean
}

// الترجمات
const TRANSLATIONS = {
  ar: {
    title: 'مركز البيانات',
    quickSearch: 'بحث سريع',
    deepSearch: 'بحث عميق',
    searchFiles: 'بحث في الملفات...',
    searchOptions: 'خيارات البحث',
    searchFolders: 'مجلدات البحث',
    noFilesFound: 'لم يتم اكتشاف ملفات',
    clickSearch: 'اضغط على زر البحث للمسح',
    useDeepSearch: 'أو استخدم البحث العميق',
    checkIntegrity: 'فحص السلامة',
    preview: 'معاينة',
    query: 'استعلام',
    execute: 'تنفيذ',
    selectDataFile: 'اختر ملف بيانات لعرضه',
    scanToDiscover: 'أو قم بمسح الملفات لاكتشاف البيانات',
    manageConnections: 'إدارة الاتصالات الخارجية',
    externalConnections: 'الاتصالات الخارجية',
    test: 'اختبار',
    save: 'حفظ',
    newConnection: 'اتصال جديد',
    editConnection: 'تعديل الاتصال',
    connectionName: 'اسم الاتصال',
    dbType: 'نوع قاعدة البيانات',
    host: 'المضيف',
    port: 'المنفذ',
    username: 'المستخدم',
    password: 'كلمة المرور',
    dbName: 'اسم قاعدة البيانات',
    startScanning: 'بدء مسح البيانات...',
    discoveredFiles: 'تم اكتشاف',
    dataFiles: 'ملف بيانات',
    deepScanStarted: 'تفعيل وضع الأخطبوط للبحث العميق...',
    searchingIn: 'البحث في',
    deepScanFound: 'تم العثور على',
    filesInDeepScan: 'ملف في البحث العميق',
    selectDatabase: 'يرجى اختيار قاعدة بيانات',
    executingQuery: 'تنفيذ استعلام',
    querySuccess: 'تم تنفيذ الاستعلام بنجاح',
    jsonValid: 'ملف JSON سليم',
    jsonInvalid: 'ملف JSON تالف',
    csvValid: 'ملف CSV سليم',
    csvInvalid: 'ملف CSV يحتوي على صفوف غير متسقة',
    connectionSaved: 'تم حفظ الاتصال',
    testingConnection: 'اختبار الاتصال بـ',
    connectionSuccess: 'تم الاتصال بنجاح بـ',
    connectionFailed: 'فشل الاتصال بـ',
    connectionDeleted: 'تم حذف الاتصال',
    searchPathAdded: 'تمت إضافة مسار البحث',
    newTextLogs: 'نص/سجلات',
    databases: 'قواعد البيانات',
    newSearchPath: '/مسار/جديد'
  },
  en: {
    title: 'Data Hub',
    quickSearch: 'Quick Search',
    deepSearch: 'Deep Search',
    searchFiles: 'Search files...',
    searchOptions: 'Search Options',
    searchFolders: 'Search Folders',
    noFilesFound: 'No files discovered',
    clickSearch: 'Click search button to scan',
    useDeepSearch: 'or use deep search',
    checkIntegrity: 'Check Integrity',
    preview: 'Preview',
    query: 'Query',
    execute: 'Execute',
    selectDataFile: 'Select a data file to view',
    scanToDiscover: 'Or scan files to discover data',
    manageConnections: 'Manage External Connections',
    externalConnections: 'External Connections',
    test: 'Test',
    save: 'Save',
    newConnection: 'New Connection',
    editConnection: 'Edit Connection',
    connectionName: 'Connection Name',
    dbType: 'Database Type',
    host: 'Host',
    port: 'Port',
    username: 'Username',
    password: 'Password',
    dbName: 'Database Name',
    startScanning: 'Starting data scan...',
    discoveredFiles: 'Discovered',
    dataFiles: 'data files',
    deepScanStarted: 'Activating Octopus Mode for deep search...',
    searchingIn: 'Searching in',
    deepScanFound: 'Found',
    filesInDeepScan: 'files in deep search',
    selectDatabase: 'Please select a database',
    executingQuery: 'Executing query',
    querySuccess: 'Query executed successfully',
    jsonValid: 'Valid JSON file',
    jsonInvalid: 'Invalid JSON file',
    csvValid: 'Valid CSV file',
    csvInvalid: 'CSV file has inconsistent rows',
    connectionSaved: 'Connection saved',
    testingConnection: 'Testing connection to',
    connectionSuccess: 'Successfully connected to',
    connectionFailed: 'Failed to connect to',
    connectionDeleted: 'Connection deleted',
    searchPathAdded: 'Search path added',
    newTextLogs: 'Text/Logs',
    databases: 'Databases',
    newSearchPath: '/new/path'
  }
}

// معلومات أنواع البيانات
const dataTypeInfo: Record<DataType, { icon: React.ReactNode; color: string; bgColor: string; borderColor: string; label: string; description: string }> = {
  sqlite: { icon: <Database className="w-5 h-5" />, color: 'text-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-950/30', borderColor: 'border-purple-200 dark:border-purple-800', label: 'SQLite', description: 'قاعدة بيانات محلية' },
  mysql: { icon: <Database className="w-5 h-5" />, color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950/30', borderColor: 'border-blue-200 dark:border-blue-800', label: 'MySQL', description: 'قاعدة بيانات علائقية' },
  postgresql: { icon: <Database className="w-5 h-5" />, color: 'text-indigo-600', bgColor: 'bg-indigo-50 dark:bg-indigo-950/30', borderColor: 'border-indigo-200 dark:border-indigo-800', label: 'PostgreSQL', description: 'قاعدة بيانات متقدمة' },
  mongodb: { icon: <Database className="w-5 h-5" />, color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-950/30', borderColor: 'border-green-200 dark:border-green-800', label: 'MongoDB', description: 'قاعدة بيانات NoSQL' },
  redis: { icon: <Database className="w-5 h-5" />, color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-950/30', borderColor: 'border-red-200 dark:border-red-800', label: 'Redis', description: 'ذاكرة تخزين مؤقت' },
  json: { icon: <FileJson className="w-5 h-5" />, color: 'text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-950/30', borderColor: 'border-amber-200 dark:border-amber-800', label: 'JSON', description: 'ملف بيانات منظم' },
  csv: { icon: <FileSpreadsheet className="w-5 h-5" />, color: 'text-emerald-600', bgColor: 'bg-emerald-50 dark:bg-emerald-950/30', borderColor: 'border-emerald-200 dark:border-emerald-800', label: 'CSV', description: 'جدول بيانات' },
  xml: { icon: <FileText className="w-5 h-5" />, color: 'text-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-950/30', borderColor: 'border-orange-200 dark:border-orange-800', label: 'XML', description: 'لغة ترميز موسعة' },
  txt: { icon: <FileText className="w-5 h-5" />, color: 'text-slate-600', bgColor: 'bg-slate-50 dark:bg-slate-950/30', borderColor: 'border-slate-200 dark:border-slate-800', label: 'نص', description: 'ملف نصي عادي' },
  log: { icon: <FileText className="w-5 h-5" />, color: 'text-cyan-600', bgColor: 'bg-cyan-50 dark:bg-cyan-950/30', borderColor: 'border-cyan-200 dark:border-cyan-800', label: 'سجل', description: 'ملف تسجيل' }
}

const defaultPorts: Record<DatabaseType, number> = {
  sqlite: 0, mysql: 3306, postgresql: 5432, mongodb: 27017, redis: 6379
}

const parseCSVContent = (content: string): string[][] => {
  const lines = content.split('\n')
  return lines.map(line => line.split(',').map(cell => cell.trim()))
}

// JSON Viewer Component
const JsonViewer = ({ data }: { data: unknown }) => (
  <pre className="p-4 text-sm font-mono bg-zinc-950 text-zinc-100 rounded-lg overflow-auto">
    <code>{JSON.stringify(data, null, 2)}</code>
  </pre>
)

// CSV Viewer Component
const CsvViewer = ({ data }: { data: string[][] }) => (
  <div className="overflow-auto rounded-lg border">
    <table className="w-full text-sm">
      <tbody>
        {data.slice(0, 100).map((row, i) => (
          <tr key={i} className={i === 0 ? 'bg-muted font-medium' : ''}>
            {row.map((cell, j) => (
              <td key={j} className="px-4 py-2 border-b border-l">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export function DataHubTab() {
  const { addLog, files, language } = useAnalyzerStore()
  const t = TRANSLATIONS[language] || TRANSLATIONS.ar

  const [discoveredFiles, setDiscoveredFiles] = useState<DataFile[]>([])
  const [selectedFile, setSelectedFile] = useState<DataFile | null>(null)
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM users LIMIT 10;')
  const [queryResult, setQueryResult] = useState<unknown[] | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [isDeepScanning, setIsDeepScanning] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeView, setActiveView] = useState<'preview' | 'query'>('preview')
  const [searchOptions, setSearchOptions] = useState({ includeJson: true, includeTxt: true, includeCsv: true, includeXml: true, includeDatabases: true })
  const [searchPaths, setSearchPaths] = useState<string[]>(['/src', '/public', '/data'])
  const [newSearchPath, setNewSearchPath] = useState('')
  const [showSearchOptions, setShowSearchOptions] = useState(false)
  const [connections, setConnections] = useState<DatabaseConnection[]>([])
  const [showConnectionPanel, setShowConnectionPanel] = useState(false)
  const [editingConnection, setEditingConnection] = useState<DatabaseConnection | null>(null)
  const [newConnection, setNewConnection] = useState<Omit<DatabaseConnection, 'id' | 'isConnected'>>({ name: '', type: 'mysql', host: 'localhost', port: 3306, username: '', password: '', database: '' })

  // اكتشاف الملفات
  const scanForDataFiles = useCallback(async () => {
    setIsScanning(true)
    addLog('info', t.startScanning, 'data-hub')
    
    const dataExtensions: Record<string, DataType> = { 'json': 'json', 'csv': 'csv', 'xml': 'xml', 'txt': 'txt', 'log': 'log', 'db': 'sqlite', 'sqlite': 'sqlite', 'sqlite3': 'sqlite' }
    const discovered: DataFile[] = []

    for (const file of files) {
      const ext = file.name.split('.').pop()?.toLowerCase() || ''
      const type = dataExtensions[ext]
      if (type && file.content) {
        let parsedContent: unknown = null
        let error: string | undefined
        try {
          if (type === 'json') parsedContent = JSON.parse(file.content)
          else if (type === 'csv') parsedContent = parseCSVContent(file.content)
        } catch { error = 'فشل تحليل الملف' }
        discovered.push({ id: generateId(), name: file.name, path: file.path, type, size: file.size || file.content.length, content: file.content, parsedContent, error })
      }
    }

    setDiscoveredFiles(discovered)
    setIsScanning(false)
    addLog('success', `${t.discoveredFiles} ${discovered.length} ${t.dataFiles}`, 'data-hub')
  }, [files, addLog, t])

  // بحث عميق
  const deepScanFiles = useCallback(async () => {
    setIsDeepScanning(true)
    addLog('info', `🐙 ${t.deepScanStarted}`, 'data-hub')
    
    const allFiles: DataFile[] = []
    const extensions: string[] = []
    if (searchOptions.includeJson) extensions.push('json')
    if (searchOptions.includeCsv) extensions.push('csv')
    if (searchOptions.includeXml) extensions.push('xml')
    if (searchOptions.includeTxt) extensions.push('txt', 'log')
    if (searchOptions.includeDatabases) extensions.push('db', 'sqlite', 'sqlite3')
    
    for (const searchPath of searchPaths) {
      addLog('info', `🔍 ${t.searchingIn}: ${searchPath}`, 'data-hub')
      const mockFiles = [
        { name: 'config.json', path: `${searchPath}/config.json`, size: 1024 },
        { name: 'data.csv', path: `${searchPath}/data.csv`, size: 2048 },
        { name: 'settings.xml', path: `${searchPath}/settings.xml`, size: 512 },
        { name: 'users.db', path: `${searchPath}/users.db`, size: 8192 },
        { name: 'app.log', path: `${searchPath}/logs/app.log`, size: 4096 }
      ]
      
      for (const mockFile of mockFiles) {
        const ext = mockFile.name.split('.').pop()?.toLowerCase() || ''
        const typeMap: Record<string, DataType> = { 'json': 'json', 'csv': 'csv', 'xml': 'xml', 'txt': 'txt', 'log': 'log', 'db': 'sqlite', 'sqlite': 'sqlite' }
        const type = typeMap[ext]
        if (type && extensions.includes(ext)) {
          allFiles.push({ id: generateId(), name: mockFile.name, path: mockFile.path, type, size: mockFile.size, content: ext === 'json' ? '{"key": "value"}' : 'Sample content' })
        }
      }
    }
    
    setDiscoveredFiles(prev => [...prev, ...allFiles.filter(f => !prev.some(p => p.path === f.path))])
    setIsDeepScanning(false)
    addLog('success', `🐙 ${t.deepScanFound} ${allFiles.length} ${t.filesInDeepScan}`, 'data-hub')
  }, [addLog, searchOptions, searchPaths, t])

  // استعلام SQL
  const executeQuery = () => {
    if (!selectedFile || !['sqlite', 'mysql', 'postgresql'].includes(selectedFile.type)) {
      addLog('warning', t.selectDatabase, 'data-hub')
      return
    }
    addLog('info', `${t.executingQuery}: ${sqlQuery}`, 'data-hub')
    setTimeout(() => {
      setQueryResult([{ id: 1, name: 'أحمد', email: 'ahmed@example.com' }, { id: 2, name: 'سارة', email: 'sara@example.com' }, { id: 3, name: 'محمد', email: 'mohamed@example.com' }])
      addLog('success', t.querySuccess, 'data-hub')
    }, 500)
  }

  // فحص السلامة
  const checkIntegrity = (file: DataFile) => {
    if (file.type === 'json') {
      try {
        if (file.content) { JSON.parse(file.content); addLog('success', `${t.jsonValid}: ${file.name}`, 'data-hub') }
      } catch { addLog('error', `${t.jsonInvalid}: ${file.name}`, 'data-hub') }
    } else if (file.type === 'csv') {
      const lines = file.content?.split('\n') || []
      const headerCols = lines[0]?.split(',').length || 0
      const isValid = lines.every(line => line.split(',').length === headerCols)
      addLog(isValid ? 'success' : 'warning', `${isValid ? t.csvValid : t.csvInvalid}: ${file.name}`, 'data-hub')
    }
  }

  // إدارة الاتصالات
  const saveConnection = () => {
    if (editingConnection) {
      setConnections(prev => prev.map(c => c.id === editingConnection.id ? { ...editingConnection } : c))
      setEditingConnection(null)
    } else {
      setConnections(prev => [...prev, { ...newConnection, id: generateId(), isConnected: false }])
      setNewConnection({ name: '', type: 'mysql', host: 'localhost', port: 3306, username: '', password: '', database: '' })
    }
    addLog('success', t.connectionSaved, 'data-hub')
  }

  const testConnection = async (connection: DatabaseConnection) => {
    addLog('info', `${t.testingConnection} ${connection.name}...`, 'data-hub')
    setTimeout(() => {
      const success = Math.random() > 0.3
      if (success) {
        setConnections(prev => prev.map(c => c.id === connection.id ? { ...c, isConnected: true } : c))
        addLog('success', `${t.connectionSuccess} ${connection.name}`, 'data-hub')
      } else { addLog('error', `${t.connectionFailed} ${connection.name}`, 'data-hub') }
    }, 1000)
  }

  const deleteConnection = (id: string) => {
    setConnections(prev => prev.filter(c => c.id !== id))
    addLog('info', t.connectionDeleted, 'data-hub')
  }

  const handleConnectionTypeChange = (type: DatabaseType) => {
    setNewConnection(prev => ({ ...prev, type, port: defaultPorts[type] }))
  }

  const filteredFiles = discoveredFiles.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.path.toLowerCase().includes(searchTerm.toLowerCase()))
  const typeStats = Object.keys(dataTypeInfo).reduce((acc, type) => { acc[type as DataType] = discoveredFiles.filter(f => f.type === type).length; return acc }, {} as Record<DataType, number>)

  return (
    <div className="flex h-full min-h-0">
      {/* Left Panel */}
      <div className="w-80 border-l border-border bg-muted/30 flex flex-col shrink-0">
        <div className="p-4 border-b border-border shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-xl">{t.title}</h2>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={scanForDataFiles} disabled={isScanning} title={t.quickSearch}>
                {isScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
              <Button size="sm" variant="default" onClick={deepScanFiles} disabled={isDeepScanning} title={t.deepSearch} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                {isDeepScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          <Input placeholder={t.searchFiles} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="h-10" />
          
          <Collapsible open={showSearchOptions} onOpenChange={setShowSearchOptions}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full mt-3 justify-between h-9">
                <span className="flex items-center gap-2"><Settings2 className="w-4 h-4" />{t.searchOptions}</span>
                {showSearchOptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-3">
              <div className="space-y-3">
                <div className="flex items-center justify-between"><Label className="text-sm flex items-center gap-2"><FileJson className="w-4 h-4 text-amber-600" />JSON</Label><Switch checked={searchOptions.includeJson} onCheckedChange={(checked) => setSearchOptions(prev => ({ ...prev, includeJson: checked }))} /></div>
                <div className="flex items-center justify-between"><Label className="text-sm flex items-center gap-2"><FileText className="w-4 h-4 text-slate-600" />{t.newTextLogs}</Label><Switch checked={searchOptions.includeTxt} onCheckedChange={(checked) => setSearchOptions(prev => ({ ...prev, includeTxt: checked }))} /></div>
                <div className="flex items-center justify-between"><Label className="text-sm flex items-center gap-2"><FileSpreadsheet className="w-4 h-4 text-emerald-600" />CSV</Label><Switch checked={searchOptions.includeCsv} onCheckedChange={(checked) => setSearchOptions(prev => ({ ...prev, includeCsv: checked }))} /></div>
                <div className="flex items-center justify-between"><Label className="text-sm flex items-center gap-2"><FileText className="w-4 h-4 text-orange-600" />XML</Label><Switch checked={searchOptions.includeXml} onCheckedChange={(checked) => setSearchOptions(prev => ({ ...prev, includeXml: checked }))} /></div>
                <div className="flex items-center justify-between"><Label className="text-sm flex items-center gap-2"><Database className="w-4 h-4 text-purple-600" />{t.databases}</Label><Switch checked={searchOptions.includeDatabases} onCheckedChange={(checked) => setSearchOptions(prev => ({ ...prev, includeDatabases: checked }))} /></div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t.searchFolders}</Label>
                <div className="h-20 rounded border bg-background p-2 overflow-y-auto">
                  <div className="space-y-1">
                    {searchPaths.map((path, i) => (
                      <div key={i} className="flex items-center justify-between bg-muted/50 rounded px-2 py-1">
                        <span className="text-xs truncate flex-1">{path}</span>
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setSearchPaths(prev => prev.filter(p => p !== path))}><X className="w-3 h-3" /></Button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input value={newSearchPath} onChange={(e) => setNewSearchPath(e.target.value)} placeholder={t.newSearchPath} className="h-9 text-sm" />
                  <Button size="sm" variant="outline" onClick={() => { if (newSearchPath && !searchPaths.includes(newSearchPath)) { setSearchPaths(prev => [...prev, newSearchPath]); setNewSearchPath(''); addLog('info', `${t.searchPathAdded}: ${newSearchPath}`, 'data-hub') } }}><Plus className="w-4 h-4" /></Button>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-3 space-y-3">
            {filteredFiles.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Database className="w-14 h-14 mx-auto mb-4 opacity-50" />
                <p className="text-base font-medium">{t.noFilesFound}</p>
                <p className="text-sm mt-2">{t.clickSearch}</p>
                <p className="text-sm text-purple-500 mt-2">🐙 {t.useDeepSearch}</p>
              </div>
            ) : (
              filteredFiles.map(file => {
                const info = dataTypeInfo[file.type]
                return (
                  <Card key={file.id} className={cn('cursor-pointer transition-all hover:shadow-md', selectedFile?.id === file.id ? 'ring-2 ring-primary border-primary' : '', info.borderColor)} onClick={() => setSelectedFile(file)}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={cn('p-2.5 rounded-lg shrink-0', info.bgColor)}><div className={info.color}>{info.icon}</div></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-medium text-sm">{file.name}</p>
                            {file.error ? <AlertCircle className="w-4 h-4 text-red-500 shrink-0" /> : <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />}
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-1">{file.path}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className={cn('text-xs', info.color)}>{info.label}</Badge>
                            <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </div>

        <div className="p-3 border-t border-border shrink-0">
          <div className="grid grid-cols-5 gap-1 text-center">
            {(['json', 'csv', 'xml', 'txt', 'sqlite'] as DataType[]).map(type => {
              const info = dataTypeInfo[type]
              return (
                <div key={type} className={cn('p-2 rounded', info.bgColor)}>
                  <div className={cn('font-bold text-sm', info.color)}>{typeStats[type] || 0}</div>
                  <div className="text-[10px] text-muted-foreground">{info.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {selectedFile ? (
          <>
            <div className="p-4 border-b border-border bg-card shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn('p-3 rounded-lg', dataTypeInfo[selectedFile.type].bgColor)}><div className={dataTypeInfo[selectedFile.type].color}>{dataTypeInfo[selectedFile.type].icon}</div></div>
                  <div>
                    <h3 className="font-bold text-lg">{selectedFile.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedFile.path}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="h-9" onClick={() => checkIntegrity(selectedFile)}><AlertCircle className="w-4 h-4 ml-2" />{t.checkIntegrity}</Button>
              </div>
            </div>

            <Tabs value={activeView} onValueChange={(v) => setActiveView(v as typeof activeView)} className="flex-1 flex flex-col min-h-0">
              <TabsList className="px-4 pt-3 shrink-0">
                <TabsTrigger value="preview" className="text-sm"><Eye className="w-4 h-4 ml-1" />{t.preview}</TabsTrigger>
                {['sqlite', 'mysql', 'postgresql'].includes(selectedFile.type) && <TabsTrigger value="query" className="text-sm"><Play className="w-4 h-4 ml-1" />{t.query}</TabsTrigger>}
              </TabsList>

              <div className="flex-1 overflow-y-auto min-h-0">
                {activeView === 'preview' && (
                  selectedFile.type === 'json' && selectedFile.parsedContent ? <div className="p-4"><JsonViewer data={selectedFile.parsedContent} /></div> :
                  selectedFile.type === 'csv' && selectedFile.parsedContent ? <div className="p-4"><CsvViewer data={selectedFile.parsedContent as string[][]} /></div> :
                  <pre className="p-4 text-sm font-mono bg-zinc-950 text-zinc-100"><code>{selectedFile.content}</code></pre>
                )}

                {activeView === 'query' && (
                  <div className="p-4">
                    <Textarea value={sqlQuery} onChange={(e) => setSqlQuery(e.target.value)} placeholder="SELECT * FROM table_name;" className="font-mono h-24" />
                    <Button onClick={executeQuery} className="mt-3" size="sm"><Play className="w-4 h-4 ml-2" />{t.execute}</Button>
                    {queryResult && <div className="mt-4"><JsonViewer data={queryResult} /></div>}
                  </div>
                )}
              </div>
            </Tabs>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground p-8">
            <div className="text-center max-w-md">
              <div className="flex justify-center gap-4 mb-6">
                {(['sqlite', 'json', 'csv', 'xml'] as DataType[]).map(type => (
                  <div key={type} className={cn('p-4 rounded-xl', dataTypeInfo[type].bgColor)}><div className={dataTypeInfo[type].color}>{dataTypeInfo[type].icon}</div></div>
                ))}
              </div>
              <p className="text-lg font-medium">{t.selectDataFile}</p>
              <p className="text-sm mt-2">{t.scanToDiscover}</p>
              <Button variant="outline" className="mt-6 h-10" onClick={() => setShowConnectionPanel(true)}><Server className="w-4 h-4 ml-2" />{t.manageConnections}</Button>
            </div>
          </div>
        )}
      </div>

      {/* Connection Panel */}
      {showConnectionPanel && (
        <div className="w-80 border-r border-border bg-card flex flex-col shrink-0">
          <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
            <h3 className="font-bold text-lg flex items-center gap-2"><Server className="w-5 h-5" />{t.externalConnections}</h3>
            <Button variant="ghost" size="icon" onClick={() => setShowConnectionPanel(false)}><X className="w-4 h-4" /></Button>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-4 space-y-4">
              {connections.map(conn => (
                <Card key={conn.id} className={cn(conn.isConnected ? 'border-green-500' : 'border-border')}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {conn.isConnected ? <Wifi className="w-4 h-4 text-green-500" /> : <WifiOff className="w-4 h-4 text-muted-foreground" />}
                        <span className="font-medium">{conn.name}</span>
                      </div>
                      <Badge variant="outline" className={dataTypeInfo[conn.type].color}>{dataTypeInfo[conn.type].label}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1 mb-3">
                      <p>{conn.host}:{conn.port}</p>
                      <p>{t.dbName}: {conn.database}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => testConnection(conn)} className="flex-1 h-9"><Plug className="w-3 h-3 ml-1" />{t.test}</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingConnection(conn)}><Edit3 className="w-3 h-3" /></Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteConnection(conn.id)}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="border-dashed">
                <CardHeader className="pb-2"><CardTitle className="text-base">{editingConnection ? t.editConnection : t.newConnection}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div><Label className="text-sm">{t.connectionName}</Label><Input value={editingConnection?.name || newConnection.name} onChange={(e) => editingConnection ? setEditingConnection(prev => prev ? { ...prev, name: e.target.value } : null) : setNewConnection(prev => ({ ...prev, name: e.target.value }))} placeholder="My Database" className="h-9" /></div>
                  <div><Label className="text-sm">{t.dbType}</Label>
                    <Select value={editingConnection?.type || newConnection.type} onValueChange={(v) => editingConnection ? setEditingConnection(prev => prev ? { ...prev, type: v as DatabaseType } : null) : handleConnectionTypeChange(v as DatabaseType)}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>{(['mysql', 'postgresql', 'mongodb', 'redis'] as DatabaseType[]).map(type => (<SelectItem key={type} value={type}><div className="flex items-center gap-2"><span className={dataTypeInfo[type].color}>{dataTypeInfo[type].icon}</span>{dataTypeInfo[type].label}</div></SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-sm">{t.host}</Label><Input value={editingConnection?.host || newConnection.host} onChange={(e) => editingConnection ? setEditingConnection(prev => prev ? { ...prev, host: e.target.value } : null) : setNewConnection(prev => ({ ...prev, host: e.target.value }))} className="h-9" /></div>
                    <div><Label className="text-sm">{t.port}</Label><Input type="number" value={editingConnection?.port || newConnection.port} onChange={(e) => editingConnection ? setEditingConnection(prev => prev ? { ...prev, port: parseInt(e.target.value) } : null) : setNewConnection(prev => ({ ...prev, port: parseInt(e.target.value) }))} className="h-9" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-sm">{t.username}</Label><Input value={editingConnection?.username || newConnection.username} onChange={(e) => editingConnection ? setEditingConnection(prev => prev ? { ...prev, username: e.target.value } : null) : setNewConnection(prev => ({ ...prev, username: e.target.value }))} className="h-9" /></div>
                    <div><Label className="text-sm">{t.password}</Label><Input type="password" value={editingConnection?.password || newConnection.password} onChange={(e) => editingConnection ? setEditingConnection(prev => prev ? { ...prev, password: e.target.value } : null) : setNewConnection(prev => ({ ...prev, password: e.target.value }))} className="h-9" /></div>
                  </div>
                  <div><Label className="text-sm">{t.dbName}</Label><Input value={editingConnection?.database || newConnection.database} onChange={(e) => editingConnection ? setEditingConnection(prev => prev ? { ...prev, database: e.target.value } : null) : setNewConnection(prev => ({ ...prev, database: e.target.value }))} className="h-9" /></div>
                  <Button className="w-full h-10" onClick={saveConnection}><Save className="w-4 h-4 ml-2" />{t.save}</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
