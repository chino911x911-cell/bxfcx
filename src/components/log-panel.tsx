'use client'

import { useAnalyzerStore } from '@/store/analyzer-store'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { 
  Info, AlertTriangle, AlertCircle, CheckCircle, 
  Terminal, Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function LogPanel() {
  const { logs, clearLogs } = useAnalyzerStore()

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'info': return <Info className="w-3.5 h-3.5" />
      case 'warning': return <AlertTriangle className="w-3.5 h-3.5" />
      case 'error': return <AlertCircle className="w-3.5 h-3.5" />
      case 'success': return <CheckCircle className="w-3.5 h-3.5" />
      default: return <Info className="w-3.5 h-3.5" />
    }
  }

  const getLogColor = (level: string) => {
    switch (level) {
      case 'info': return 'text-blue-500'
      case 'warning': return 'text-yellow-500'
      case 'error': return 'text-red-500'
      case 'success': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }

  const getSourceBadge = (source?: string) => {
    if (!source) return null
    
    const labels: Record<string, string> = {
      'analyzer': 'المحلل',
      'data-hub': 'مركز البيانات',
      'lab': 'المختبر',
      'settings': 'الإعدادات',
      'system': 'النظام'
    }
    
    return (
      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
        {labels[source] || source}
      </Badge>
    )
  }

  return (
    <div className="border-t border-border bg-muted/30">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Terminal className="w-4 h-4" />
          <span>سجل النظام</span>
          <Badge variant="secondary" className="text-xs">
            {logs.length}
          </Badge>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearLogs}
          className="h-7"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Log Entries */}
      <ScrollArea className="h-32">
        <div className="p-2 space-y-1">
          {logs.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-4">
              لا توجد سجلات
            </div>
          ) : (
            logs.map((log) => (
              <div 
                key={log.id}
                className="flex items-start gap-2 text-xs font-mono p-1.5 rounded hover:bg-muted"
              >
                <span className={cn('shrink-0 mt-0.5', getLogColor(log.level))}>
                  {getLogIcon(log.level)}
                </span>
                <span className="text-muted-foreground shrink-0">
                  {log.timestamp.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                {getSourceBadge(log.source)}
                <span className="flex-1">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
