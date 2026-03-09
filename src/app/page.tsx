'use client'

import { useEffect } from 'react'
import { useAnalyzerStore } from '@/store/analyzer-store'
import { Sidebar } from '@/components/analyzer/sidebar'
import { AnalyzerTab } from '@/components/analyzer/analyzer-tab'
import { DataHubTab } from '@/components/data-hub/data-hub-tab'
import { LabTab } from '@/components/lab/lab-tab'
import { SettingsTab } from '@/components/settings/settings-tab'
import { EvolutionTab } from '@/components/evolution/evolution-tab'
import { LogPanel } from '@/components/log-panel'

export default function Home() {
  const { activeTab, addLog, language } = useAnalyzerStore()

  useEffect(() => {
    addLog('success', language === 'ar' ? 'تم تحميل النظام بنجاح' : 'System loaded successfully', 'system')
  }, [addLog, language])

  return (
    <div className="flex h-screen bg-background text-foreground" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Tab Content - قابلة للتمرير */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'analyzer' && <AnalyzerTab />}
          {activeTab === 'data' && <DataHubTab />}
          {activeTab === 'lab' && <LabTab />}
          {activeTab === 'evolution' && <EvolutionTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>

        {/* Log Panel */}
        <LogPanel />
      </main>
    </div>
  )
}
