'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAnalyzerStore, DEFAULT_PERSONAS, Persona } from '@/store/analyzer-store'
import { 
  Key, Server, Bot, RefreshCw, CheckCircle, XCircle, 
  Plus, Edit, Trash2, Eye, EyeOff, Octagon, Palette,
  Star, Globe, Brain, Sparkles, Zap, Wifi, WifiOff,
  AlertCircle, Loader2, Crown, Flame, Shield, Code2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

// Translations - English
const TRANSLATIONS_EN = {
  header: {
    title: 'Settings',
    description: 'Manage providers, agents, and preferences'
  },
  octopus: {
    title: 'Octopus System',
    badge: 'Advanced',
    description: 'Dual Processing (Local + Cloud)',
    info: 'When enabled, analysis runs in parallel on both local and cloud providers, then results are merged for more comprehensive and accurate analysis.',
    activeStatus: 'Dual processing is active...'
  },
  providers: {
    title: 'AI Providers',
    description: 'Enter API keys to connect to cloud providers',
    ollama: {
      name: 'Ollama',
      description: 'Local execution without internet'
    },
    openrouter: {
      name: 'OpenRouter',
      description: 'Access to 200+ models'
    },
    gemini: {
      name: 'Google Gemini',
      description: 'Google advanced models'
    },
    zai: {
      name: 'ZAI',
      description: 'Free smart models'
    },
    xai: {
      name: 'XAI',
      description: 'Grok and more'
    },
    status: {
      connected: 'Connected',
      disconnected: 'Disconnected',
      checking: 'Checking...',
      error: 'Error'
    },
    modelsAvailable: 'models available',
    rescan: 'Rescan',
    freeConnect: 'Free Connection'
  },
  models: {
    title: 'Available Models',
    description: 'All connected models with their features',
    features: {
      analysis: 'Best for Analysis',
      lab: 'Best for Lab',
      free: 'Free',
      internet: 'Internet',
      thinking: 'Thinking'
    }
  },
  personas: {
    title: 'Agents (Personas)',
    description: 'Choose the right agent for your analysis',
    add: 'Add Agent',
    active: 'Active',
    custom: 'Custom',
    tone: {
      formal: 'Formal',
      friendly: 'Friendly',
      technical: 'Technical'
    },
    dialog: {
      addTitle: 'Add New Agent',
      addDesc: 'Create a custom analysis agent',
      editTitle: 'Edit Agent',
      editDesc: 'Modify custom agent information',
      nameEn: 'Name (English)',
      nameAr: 'Name (Arabic)',
      icon: 'Icon',
      toneLabel: 'Tone',
      prompt: 'System Prompt',
      promptPlaceholder: 'You are an expert in...',
      cancel: 'Cancel',
      add: 'Add',
      save: 'Save Changes'
    },
    defaultPersonas: {
      investigator: 'You are an expert code investigator. Your task is to find logical errors...',
      securityGuard: 'You are a security expert specialized in detecting vulnerabilities. Look for XSS,...',
      web3Guard: 'You are a smart contract auditor specialized in...',
      optimizer: 'You are a performance expert. Focus on optimizing algorithm complexity...',
      cleaner: 'You are a code quality expert. Look for dead code, unused variables...'
    }
  },
  footer: 'Smart Dev Hub v2.0 • Analysis & Smart Lab Platform',
  logs: {
    connected: 'Connected to',
    connectionFailed: 'Connection failed to',
    personaAdded: 'Agent added successfully',
    personaUpdated: 'Agent updated successfully',
    personaDeleted: 'Agent deleted successfully',
    fillAllFields: 'Please fill all required fields'
  }
}

// Translations - Arabic
const TRANSLATIONS_AR = {
  header: {
    title: 'الإعدادات',
    description: 'إدارة المزودين والشخصيات والتفضيلات'
  },
  octopus: {
    title: 'نظام الأخطبوط',
    badge: 'متقدم',
    description: 'المعالجة المزدوجة (محلي + سحابي)',
    info: 'عند التفعيل، يتم تشغيل التحليل بالتوازي على كلا المزودين المحلي والسحابي، ثم يتم دمج النتائج للحصول على تحليل أشمل وأدق.',
    activeStatus: 'جاري استخدام المعالجة المزدوجة...'
  },
  providers: {
    title: 'مزودو الذكاء الاصطناعي',
    description: 'أدخل مفاتيح API للاتصال بالمزودين السحابيين',
    ollama: {
      name: 'Ollama',
      description: 'تشغيل محلي بدون إنترنت'
    },
    openrouter: {
      name: 'OpenRouter',
      description: 'وصول لـ 200+ نموذج'
    },
    gemini: {
      name: 'Google Gemini',
      description: 'نماذج جوجل المتقدمة'
    },
    zai: {
      name: 'ZAI',
      description: 'نماذج ذكية مجانية'
    },
    xai: {
      name: 'XAI',
      description: 'Grok والمزيد'
    },
    status: {
      connected: 'متصل',
      disconnected: 'منفصل',
      checking: 'جاري الفحص...',
      error: 'خطأ'
    },
    modelsAvailable: 'نموذج متاح',
    rescan: 'إعادة الفحص',
    freeConnect: 'اتصال مجاني'
  },
  models: {
    title: 'النماذج المتاحة',
    description: 'جميع النماذج المتصلة مع ميزاتها',
    features: {
      analysis: 'مفضل للتحليل',
      lab: 'مفضل للمختبر',
      free: 'مجاني',
      internet: 'إنترنت',
      thinking: 'تفكير'
    }
  },
  personas: {
    title: 'الشخصيات (Agents)',
    description: 'اختر الشخصية المناسبة لتحليلك',
    add: 'إضافة شخصية',
    active: 'نشط',
    custom: 'مخصص',
    tone: {
      formal: 'رسمي',
      friendly: 'ودود',
      technical: 'تقني'
    },
    dialog: {
      addTitle: 'إضافة شخصية جديدة',
      addDesc: 'أنشئ شخصية مخصصة للتحليل',
      editTitle: 'تعديل الشخصية',
      editDesc: 'عدّل معلومات الشخصية المخصصة',
      nameEn: 'الاسم (إنجليزي)',
      nameAr: 'الاسم (عربي)',
      icon: 'الأيقونة',
      toneLabel: 'النبرة',
      prompt: 'التعليمات البرمجية',
      promptPlaceholder: 'أنت خبير في...',
      cancel: 'إلغاء',
      add: 'إضافة',
      save: 'حفظ التغييرات'
    },
    defaultPersonas: {
      investigator: 'أنت محقق خبير في تحليل الكود...',
      securityGuard: 'أنت خبير أمني متخصص في اكتشاف الثغرات...',
      web3Guard: 'أنت مدقق عقود ذكية متخصص...',
      optimizer: 'أنت خبير أداء. ركز على تحسين تعقيد الخوارزميات...',
      cleaner: 'أنت خبير في جودة الكود ونظافته...'
    }
  },
  footer: 'Smart Dev Hub v2.0 • منصة التحليل والمختبر الذكي',
  logs: {
    connected: 'تم الاتصال بـ',
    connectionFailed: 'فشل الاتصال بـ',
    personaAdded: 'تمت إضافة الشخصية بنجاح',
    personaUpdated: 'تم تحديث الشخصية بنجاح',
    personaDeleted: 'تم حذف الشخصية بنجاح',
    fillAllFields: 'يرجى ملء جميع الحقول المطلوبة'
  }
}

// Use English translations
const TRANSLATIONS = TRANSLATIONS_EN

interface ProviderStatus {
  name: string
  id: string
  type: 'local' | 'remote'
  status: 'connected' | 'disconnected' | 'checking' | 'error'
  modelCount: number
  icon: string
  description: string
  gradient: string
}

// Model features configuration
interface ModelFeature {
  id: string
  name: string
  icon: React.ElementType
  color: string
  bgColor: string
}

const MODEL_FEATURES: ModelFeature[] = [
  { id: 'analysis', name: TRANSLATIONS.models.features.analysis, icon: Star, color: 'text-amber-500', bgColor: 'bg-amber-500/10 border-amber-500/30' },
  { id: 'lab', name: TRANSLATIONS.models.features.lab, icon: Code2, color: 'text-blue-500', bgColor: 'bg-blue-500/10 border-blue-500/30' },
  { id: 'free', name: TRANSLATIONS.models.features.free, icon: Zap, color: 'text-green-500', bgColor: 'bg-green-500/10 border-green-500/30' },
  { id: 'internet', name: TRANSLATIONS.models.features.internet, icon: Globe, color: 'text-cyan-500', bgColor: 'bg-cyan-500/10 border-cyan-500/30' },
  { id: 'thinking', name: TRANSLATIONS.models.features.thinking, icon: Brain, color: 'text-purple-500', bgColor: 'bg-purple-500/10 border-purple-500/30' },
]

// Default models with features
const DEFAULT_MODELS_WITH_FEATURES: Record<string, string[]> = {
  'openrouter-anthropic/claude-3.5-sonnet': ['analysis', 'thinking', 'internet'],
  'openrouter-anthropic/claude-3-haiku': ['free', 'lab'],
  'openrouter-openai/gpt-4o': ['analysis', 'internet'],
  'openrouter-openai/gpt-3.5-turbo': ['free', 'lab'],
  'openrouter-meta-llama/llama-3.1-70b-instruct': ['free', 'lab'],
  'openrouter-google/gemini-pro': ['free', 'internet'],
  'openrouter-deepseek/deepseek-chat': ['free', 'thinking'],
  'gemini-gemini-1.5-pro': ['analysis', 'internet'],
  'gemini-gemini-1.5-flash': ['free', 'lab'],
  'zai-default': ['free', 'internet', 'thinking'],
  'xai-grok-beta': ['analysis', 'internet'],
}

export function SettingsTab() {
  const { 
    isOllamaRunning, setIsOllamaRunning,
    models, setModels, addModels, removeModelsByProvider,
    apiKeys, setApiKey,
    octopusModeEnabled, setOctopusModeEnabled,
    activePersona, setActivePersona,
    personas, setPersonas, addPersona, updatePersona, deletePersona,
    addLog
  } = useAnalyzerStore()

  const [showKeys, setShowKeys] = useState({ 
    openrouter: false, 
    gemini: false, 
    zai: false,
    xai: false 
  })
  
  const [providers, setProviders] = useState<ProviderStatus[]>([
    { name: 'Ollama', id: 'ollama', type: 'local', status: 'checking', modelCount: 0, icon: '🦙', description: TRANSLATIONS.providers.ollama.description, gradient: 'from-orange-500 to-amber-500' },
    { name: 'OpenRouter', id: 'openrouter', type: 'remote', status: 'disconnected', modelCount: 0, icon: '🔗', description: TRANSLATIONS.providers.openrouter.description, gradient: 'from-blue-500 to-cyan-500' },
    { name: 'Google Gemini', id: 'gemini', type: 'remote', status: 'disconnected', modelCount: 0, icon: '✨', description: TRANSLATIONS.providers.gemini.description, gradient: 'from-purple-500 to-pink-500' },
    { name: 'ZAI', id: 'zai', type: 'remote', status: 'disconnected', modelCount: 0, icon: '🧠', description: TRANSLATIONS.providers.zai.description, gradient: 'from-green-500 to-emerald-500' },
    { name: 'XAI', id: 'xai', type: 'remote', status: 'disconnected', modelCount: 0, icon: '🚀', description: TRANSLATIONS.providers.xai.description, gradient: 'from-red-500 to-orange-500' }
  ])
  
  const [isValidating, setIsValidating] = useState<string | null>(null)
  const [editPersona, setEditPersona] = useState<Persona | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  
  // New persona form
  const [newPersona, setNewPersona] = useState<Omit<Persona, 'id'>>({
    name: '',
    nameAr: '',
    icon: '🤖',
    systemPrompt: '',
    focusKeywords: [],
    tone: 'formal'
  })

  // Check Ollama status
  const checkOllama = useCallback(async () => {
    setProviders(prev => prev.map(p => 
      p.id === 'ollama' ? { ...p, status: 'checking' } : p
    ))

    try {
      const response = await fetch('/api/providers?action=check-ollama')
      const data = await response.json()

      if (data.status === 'connected') {
        setIsOllamaRunning(true)
        
        const modelsRes = await fetch('/api/providers?action=get-models&provider=ollama')
        const modelsData = await modelsRes.json()
        
        if (modelsData.success) {
          setModels(modelsData.models)
          setProviders(prev => prev.map(p => 
            p.id === 'ollama' ? { ...p, status: 'connected', modelCount: modelsData.models.length } : p
          ))
        }
      } else {
        setIsOllamaRunning(false)
        setProviders(prev => prev.map(p => 
          p.id === 'ollama' ? { ...p, status: 'disconnected' } : p
        ))
      }
    } catch {
      setIsOllamaRunning(false)
      setProviders(prev => prev.map(p => 
        p.id === 'ollama' ? { ...p, status: 'error' } : p
      ))
    }
  }, [setIsOllamaRunning, setModels])

  // Validate API key
  const validateApiKey = async (provider: 'openrouter' | 'gemini' | 'zai' | 'xai', key: string) => {
    if (!key.trim()) return

    setIsValidating(provider)
    setProviders(prev => prev.map(p => 
      p.id === provider ? { ...p, status: 'checking' } : p
    ))

    try {
      const response = await fetch('/api/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'validate-key',
          provider,
          apiKey: key
        })
      })

      const data = await response.json()

      if (data.success && Array.isArray(data.models)) {
        removeModelsByProvider(provider)
        
        const newModels = data.models.map((m: { id: string; name: string }) => ({
          id: `${provider}-${m.id}`,
          name: m.name,
          provider: provider as 'openrouter' | 'gemini' | 'zai' | 'xai',
          type: 'remote' as const
        }))
        
        addModels(newModels)
        
        setProviders(prev => prev.map(p => 
          p.id === provider ? { ...p, status: 'connected', modelCount: data.models.length } : p
        ))
        
        localStorage.setItem('api_keys', JSON.stringify({ ...apiKeys, [provider]: key }))
        addLog('success', `${TRANSLATIONS.logs.connected} ${provider} - ${data.models.length} models`, 'settings')
      } else {
        setProviders(prev => prev.map(p => 
          p.id === provider ? { ...p, status: 'error' } : p
        ))
        addLog('error', `${TRANSLATIONS.logs.connectionFailed} ${provider}: ${data.message || 'Unknown error'}`, 'settings')
      }
    } catch (error) {
      setProviders(prev => prev.map(p => 
        p.id === provider ? { ...p, status: 'error' } : p
      ))
      addLog('error', `${TRANSLATIONS.logs.connectionFailed} ${provider}`, 'settings')
    } finally {
      setIsValidating(null)
    }
  }

  // Load saved keys
  useEffect(() => {
    checkOllama()
    
    const savedKeys = localStorage.getItem('api_keys')
    if (savedKeys) {
      const keys = JSON.parse(savedKeys)
      if (keys.openrouter) {
        setApiKey('openrouter', keys.openrouter)
        validateApiKey('openrouter', keys.openrouter)
      }
      if (keys.gemini) {
        setApiKey('gemini', keys.gemini)
        validateApiKey('gemini', keys.gemini)
      }
      if (keys.zai) {
        setApiKey('zai', keys.zai)
        validateApiKey('zai', keys.zai)
      }
      if (keys.xai) {
        setApiKey('xai', keys.xai)
        validateApiKey('xai', keys.xai)
      }
    }
  }, [])

  const getStatusIcon = (status: ProviderStatus['status']) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'disconnected': return <WifiOff className="w-4 h-4 text-gray-400" />
      case 'checking': return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusBadge = (status: ProviderStatus['status']) => {
    const variants: Record<ProviderStatus['status'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
      connected: 'default',
      disconnected: 'secondary',
      checking: 'outline',
      error: 'destructive'
    }
    
    return (
      <Badge 
        variant={variants[status]}
        className={cn(
          status === 'connected' && 'bg-green-500 hover:bg-green-600',
          status === 'error' && 'bg-red-500 hover:bg-red-600'
        )}
      >
        {TRANSLATIONS.providers.status[status]}
      </Badge>
    )
  }

  // Get model features
  const getModelFeatures = (modelId: string): ModelFeature[] => {
    const features = DEFAULT_MODELS_WITH_FEATURES[modelId] || []
    return MODEL_FEATURES.filter(f => features.includes(f.id))
  }

  // Add persona handler
  const handleAddPersona = () => {
    if (!newPersona.name || !newPersona.nameAr || !newPersona.systemPrompt) {
      addLog('error', TRANSLATIONS.logs.fillAllFields, 'settings')
      return
    }

    const persona: Persona = {
      id: `custom-${Date.now()}`,
      ...newPersona,
      focusKeywords: newPersona.focusKeywords || []
    }

    addPersona(persona)
    setNewPersona({
      name: '',
      nameAr: '',
      icon: '🤖',
      systemPrompt: '',
      focusKeywords: [],
      tone: 'formal'
    })
    setIsAddDialogOpen(false)
    addLog('success', `${TRANSLATIONS.logs.personaAdded} "${newPersona.nameAr}"`, 'settings')
  }

  // Update persona handler
  const handleUpdatePersona = () => {
    if (!editPersona) return
    
    updatePersona(editPersona)
    setEditPersona(null)
    setIsEditDialogOpen(false)
    addLog('success', `${TRANSLATIONS.logs.personaUpdated} "${editPersona.nameAr}"`, 'settings')
  }

  // Delete persona handler
  const handleDeletePersona = (id: string) => {
    deletePersona(id)
    addLog('success', TRANSLATIONS.logs.personaDeleted, 'settings')
  }

  // Provider Card Component
  const ProviderCard = ({ provider }: { provider: ProviderStatus }) => {
    const needsApiKey = provider.type === 'remote' && provider.id !== 'zai'
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "p-4 rounded-xl border transition-all duration-300",
          provider.status === 'connected' 
            ? "border-green-500/30 bg-gradient-to-br from-green-500/5 to-transparent" 
            : provider.status === 'error'
            ? "border-red-500/30 bg-gradient-to-br from-red-500/5 to-transparent"
            : "border-border bg-card/50"
        )}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br",
              provider.gradient
            )}>
              {provider.icon}
            </div>
            <div>
              <h4 className="font-semibold">{provider.name}</h4>
              <p className="text-xs text-muted-foreground">{provider.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(provider.status)}
            {getStatusBadge(provider.status)}
          </div>
        </div>
        
        {/* Model Count */}
        {provider.status === 'connected' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-3"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Brain className="w-4 h-4" />
              <span>{provider.modelCount} {TRANSLATIONS.providers.modelsAvailable}</span>
            </div>
          </motion.div>
        )}

        {/* API Key Input for remote providers */}
        {needsApiKey && (
          <div className="flex gap-2 mt-3">
            <div className="relative flex-1">
              <Input
                type={showKeys[provider.id as keyof typeof showKeys] ? 'text' : 'password'}
                placeholder={`${provider.name} API Key...`}
                value={apiKeys[provider.id as keyof typeof apiKeys] || ''}
                onChange={(e) => setApiKey(provider.id as 'openrouter' | 'gemini' | 'xai', e.target.value)}
                className="pr-10 bg-background/50"
              />
              <button
                type="button"
                onClick={() => setShowKeys(prev => ({ ...prev, [provider.id]: !prev[provider.id as keyof typeof prev] }))}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showKeys[provider.id as keyof typeof showKeys] ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <Button 
              onClick={() => validateApiKey(provider.id as 'openrouter' | 'gemini' | 'xai', apiKeys[provider.id as keyof typeof apiKeys] || '')}
              disabled={!apiKeys[provider.id as keyof typeof apiKeys] || isValidating === provider.id}
              className={cn(
                "bg-gradient-to-r hover:opacity-90 transition-opacity",
                provider.gradient
              )}
            >
              {isValidating === provider.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Key className="w-4 h-4" />
              )}
            </Button>
          </div>
        )}

        {/* Connect button for ZAI (free) */}
        {provider.id === 'zai' && provider.status !== 'connected' && (
          <Button 
            onClick={() => validateApiKey('zai', 'free-access')}
            disabled={isValidating === 'zai'}
            className={cn(
              "w-full mt-3 bg-gradient-to-r hover:opacity-90 transition-opacity",
              provider.gradient
            )}
          >
            {isValidating === 'zai' ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            {TRANSLATIONS.providers.freeConnect}
          </Button>
        )}

        {/* Refresh for Ollama */}
        {provider.id === 'ollama' && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkOllama}
            className="mt-3 w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {TRANSLATIONS.providers.rescan}
          </Button>
        )}
      </motion.div>
    )
  }

  // Model Badge Component
  const ModelFeatureBadge = ({ feature }: { feature: ModelFeature }) => (
    <Badge 
      variant="outline" 
      className={cn("text-xs gap-1 border", feature.bgColor)}
    >
      <feature.icon className={cn("w-3 h-3", feature.color)} />
      <span className={feature.color}>{feature.name}</span>
    </Badge>
  )

  // Persona Card Component
  const PersonaCard = ({ persona, isActive }: { persona: Persona; isActive: boolean }) => (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => setActivePersona(persona)}
      className={cn(
        'flex items-center justify-between p-4 rounded-xl border transition-all duration-300 cursor-pointer group',
        isActive 
          ? 'border-primary bg-gradient-to-l from-primary/10 to-transparent shadow-lg shadow-primary/5' 
          : 'border-border hover:border-primary/50 hover:bg-muted/50'
      )}
    >
      <div className="flex items-center gap-3">
        <motion.span 
          className="text-3xl"
          animate={isActive ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          {persona.icon}
        </motion.span>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">{persona.nameAr}</h4>
            {isActive && (
              <Badge variant="default" className="text-xs bg-primary">
                {TRANSLATIONS.personas.active}
              </Badge>
            )}
            {persona.id.startsWith('custom-') && (
              <Badge variant="outline" className="text-xs">
                <Crown className="w-3 h-3 mr-1" />
                {TRANSLATIONS.personas.custom}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
            {persona.systemPrompt.substring(0, 60)}...
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="capitalize">
          {TRANSLATIONS.personas.tone[persona.tone as keyof typeof TRANSLATIONS.personas.tone]}
        </Badge>
        {persona.id.startsWith('custom-') && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                setEditPersona(persona)
                setIsEditDialogOpen(true)
              }}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                handleDeletePersona(persona.id)
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </motion.div>
  )

  return (
    <ScrollArea className="h-full [&>div]:!overflow-y-auto [&>div]:scrollbar-thin [&>div]:scrollbar-thumb-muted-foreground/20 [&>div]:scrollbar-track-transparent hover:[&>div]:scrollbar-thumb-muted-foreground/40">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {TRANSLATIONS.header.title}
          </h1>
          <p className="text-muted-foreground">{TRANSLATIONS.header.description}</p>
        </motion.div>

        {/* Octopus Mode */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/5 overflow-hidden relative">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  >
                    <Octagon className="w-8 h-8 text-amber-500" />
                  </motion.div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {TRANSLATIONS.octopus.title}
                      <Badge variant="outline" className="border-amber-500 text-amber-500">
                        <Flame className="w-3 h-3 mr-1" />
                        {TRANSLATIONS.octopus.badge}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{TRANSLATIONS.octopus.description}</CardDescription>
                  </div>
                </div>
                <Switch
                  checked={octopusModeEnabled}
                  onCheckedChange={setOctopusModeEnabled}
                />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-sm text-muted-foreground">
                {TRANSLATIONS.octopus.info}
              </p>
              {octopusModeEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20"
                >
                  <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                    <Wifi className="w-4 h-4" />
                    <span>{TRANSLATIONS.octopus.activeStatus}</span>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Providers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                {TRANSLATIONS.providers.title}
              </CardTitle>
              <CardDescription>{TRANSLATIONS.providers.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {providers.map((provider, index) => (
                <motion.div
                  key={provider.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <ProviderCard provider={provider} />
                  {index < providers.length - 1 && <Separator className="my-4" />}
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Models with Features */}
        {models.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  {TRANSLATIONS.models.title}
                </CardTitle>
                <CardDescription>{TRANSLATIONS.models.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 max-h-64 overflow-y-auto custom-scrollbar">
                  {models.slice(0, 20).map((model, index) => {
                    const features = getModelFeatures(model.id)
                    return (
                      <motion.div
                        key={model.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * index }}
                        className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{model.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{model.provider}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {features.map(feature => (
                            <ModelFeatureBadge key={feature.id} feature={feature} />
                          ))}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Personas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    {TRANSLATIONS.personas.title}
                  </CardTitle>
                  <CardDescription>{TRANSLATIONS.personas.description}</CardDescription>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Plus className="w-4 h-4" />
                      {TRANSLATIONS.personas.add}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{TRANSLATIONS.personas.dialog.addTitle}</DialogTitle>
                      <DialogDescription>
                        {TRANSLATIONS.personas.dialog.addDesc}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{TRANSLATIONS.personas.dialog.nameEn}</Label>
                          <Input
                            value={newPersona.name}
                            onChange={(e) => setNewPersona(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Expert"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{TRANSLATIONS.personas.dialog.nameAr}</Label>
                          <Input
                            value={newPersona.nameAr}
                            onChange={(e) => setNewPersona(prev => ({ ...prev, nameAr: e.target.value }))}
                            placeholder="Expert"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>{TRANSLATIONS.personas.dialog.icon}</Label>
                        <Input
                          value={newPersona.icon}
                          onChange={(e) => setNewPersona(prev => ({ ...prev, icon: e.target.value }))}
                          placeholder="🤖"
                          className="w-20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{TRANSLATIONS.personas.dialog.toneLabel}</Label>
                        <Select
                          value={newPersona.tone}
                          onValueChange={(value: 'formal' | 'friendly' | 'technical') => 
                            setNewPersona(prev => ({ ...prev, tone: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="formal">{TRANSLATIONS.personas.tone.formal}</SelectItem>
                            <SelectItem value="friendly">{TRANSLATIONS.personas.tone.friendly}</SelectItem>
                            <SelectItem value="technical">{TRANSLATIONS.personas.tone.technical}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{TRANSLATIONS.personas.dialog.prompt}</Label>
                        <Textarea
                          value={newPersona.systemPrompt}
                          onChange={(e) => setNewPersona(prev => ({ ...prev, systemPrompt: e.target.value }))}
                          placeholder={TRANSLATIONS.personas.dialog.promptPlaceholder}
                          rows={4}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        {TRANSLATIONS.personas.dialog.cancel}
                      </Button>
                      <Button onClick={handleAddPersona}>
                        {TRANSLATIONS.personas.dialog.add}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {personas.map((persona) => (
                  <PersonaCard 
                    key={persona.id} 
                    persona={persona} 
                    isActive={activePersona.id === persona.id}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Edit Persona Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{TRANSLATIONS.personas.dialog.editTitle}</DialogTitle>
              <DialogDescription>
                {TRANSLATIONS.personas.dialog.editDesc}
              </DialogDescription>
            </DialogHeader>
            {editPersona && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{TRANSLATIONS.personas.dialog.nameEn}</Label>
                    <Input
                      value={editPersona.name}
                      onChange={(e) => setEditPersona(prev => prev ? { ...prev, name: e.target.value } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{TRANSLATIONS.personas.dialog.nameAr}</Label>
                    <Input
                      value={editPersona.nameAr}
                      onChange={(e) => setEditPersona(prev => prev ? { ...prev, nameAr: e.target.value } : null)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{TRANSLATIONS.personas.dialog.icon}</Label>
                  <Input
                    value={editPersona.icon}
                    onChange={(e) => setEditPersona(prev => prev ? { ...prev, icon: e.target.value } : null)}
                    className="w-20"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{TRANSLATIONS.personas.dialog.toneLabel}</Label>
                  <Select
                    value={editPersona.tone}
                    onValueChange={(value: 'formal' | 'friendly' | 'technical') => 
                      setEditPersona(prev => prev ? { ...prev, tone: value } : null)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formal">{TRANSLATIONS.personas.tone.formal}</SelectItem>
                      <SelectItem value="friendly">{TRANSLATIONS.personas.tone.friendly}</SelectItem>
                      <SelectItem value="technical">{TRANSLATIONS.personas.tone.technical}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{TRANSLATIONS.personas.dialog.prompt}</Label>
                  <Textarea
                    value={editPersona.systemPrompt}
                    onChange={(e) => setEditPersona(prev => prev ? { ...prev, systemPrompt: e.target.value } : null)}
                    rows={4}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                {TRANSLATIONS.personas.dialog.cancel}
              </Button>
              <Button onClick={handleUpdatePersona}>
                {TRANSLATIONS.personas.dialog.save}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-muted-foreground py-4"
        >
          <p>{TRANSLATIONS.footer}</p>
        </motion.div>
      </div>
    </ScrollArea>
  )
}
