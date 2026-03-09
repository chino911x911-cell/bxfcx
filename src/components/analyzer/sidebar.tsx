'use client'

import { useEffect, useState } from 'react'
import { useAnalyzerStore } from '@/store/analyzer-store'
import { useTheme } from 'next-themes'
import { 
  FileCode, Database, FlaskConical, Settings, Bot, 
  Wifi, WifiOff, Activity, Octagon, Dna, Sun, Moon, Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const { 
    activeTab, setActiveTab, isOllamaRunning, 
    octopusModeEnabled, models, logs,
    language, setLanguage
  } = useAnalyzerStore()
  
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // منع Hydration Error - التحميل بعد التصيير الأولي
  useEffect(() => {
    // استخدام setTimeout لتجنب التحذير
    const timer = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(timer)
  }, [])
  
  // التأكد من أن models مصفوفة
  const modelsArray = Array.isArray(models) ? models : []
  const localModels = modelsArray.filter(m => m.type === 'local')
  const remoteModels = modelsArray.filter(m => m.type === 'remote')
  
  const navItems = [
    { id: 'analyzer', label: language === 'ar' ? 'محلل الكود' : 'Code Analyzer', icon: FileCode },
    { id: 'data', label: language === 'ar' ? 'مركز البيانات' : 'Data Hub', icon: Database },
    { id: 'lab', label: language === 'ar' ? 'المختبر' : 'The Lab', icon: FlaskConical },
    { id: 'evolution', label: language === 'ar' ? 'التطور الذاتي' : 'Self Evolution', icon: Dna },
    { id: 'settings', label: language === 'ar' ? 'الإعدادات' : 'Settings', icon: Settings },
  ] as const

  // تبديل الثيم
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  // تبديل اللغة
  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar')
  }

  return (
    <div className="w-64 bg-sidebar border-l border-sidebar-border h-screen flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Bot className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg">
              {language === 'ar' ? 'منصة التطوير الذكي' : 'Smart Dev Hub'}
            </h1>
            <p className="text-xs text-muted-foreground">v2.0</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'hover:bg-sidebar-accent text-sidebar-foreground'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Status Section */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        {/* Octopus Mode */}
        {octopusModeEnabled && (
          <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg">
            <Octagon className="w-4 h-4" />
            <span>{language === 'ar' ? 'وضع الأخطبوط نشط' : 'Octopus Mode Active'}</span>
          </div>
        )}

        {/* Connection Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Ollama</span>
            <div className={cn(
              'flex items-center gap-1',
              isOllamaRunning ? 'text-green-600' : 'text-red-500'
            )}>
              {isOllamaRunning ? (
                <>
                  <Wifi className="w-3.5 h-3.5" />
                  <span className="text-xs">{language === 'ar' ? 'متصل' : 'Connected'}</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span className="text-xs">{language === 'ar' ? 'منفصل' : 'Disconnected'}</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {language === 'ar' ? 'نماذج محلية' : 'Local Models'}
            </span>
            <span className="text-xs font-medium">{localModels.length}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {language === 'ar' ? 'نماذج سحابية' : 'Remote Models'}
            </span>
            <span className="text-xs font-medium">{remoteModels.length}</span>
          </div>
        </div>

        {/* Theme & Language Toggle */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8"
            onClick={toggleTheme}
            disabled={!mounted}
          >
            {mounted ? (
              theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )
            ) : (
              <Sun className="w-4 h-4 opacity-50" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8"
            onClick={toggleLanguage}
          >
            <Globe className="w-4 h-4 mr-1" />
            {language === 'ar' ? 'EN' : 'عربي'}
          </Button>
        </div>

        {/* Activity Indicator */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Activity className="w-3.5 h-3.5" />
          <span>{logs.length} {language === 'ar' ? 'سجل' : 'logs'}</span>
        </div>
      </div>
    </div>
  )
}
