/**
 * نظام الترجمة (Internationalization)
 * يدعم العربية والإنجليزية
 */

export type Language = 'ar' | 'en'

export interface TranslationStrings {
  [key: string]: {
    ar: string
    en: string
  }
}

export const translations: TranslationStrings = {
  // التطبيق
  appName: { ar: 'منصة التطوير الذكي', en: 'Smart Dev Hub' },
  appVersion: { ar: 'الإصدار 2.0', en: 'Version 2.0' },
  
  // التنقل
  analyzer: { ar: 'محلل الكود', en: 'Code Analyzer' },
  dataHub: { ar: 'مركز البيانات', en: 'Data Hub' },
  lab: { ar: 'المختبر', en: 'The Lab' },
  evolution: { ar: 'التطور الذاتي', en: 'Self Evolution' },
  settings: { ar: 'الإعدادات', en: 'Settings' },
  
  // محلل الكود
  uploadFile: { ar: 'رفع ملف', en: 'Upload File' },
  uploadFolder: { ar: 'رفع مجلد', en: 'Upload Folder' },
  uploadZip: { ar: 'رفع ZIP/TAR/RAR', en: 'Upload ZIP/TAR/RAR' },
  selectModel: { ar: 'اختر النموذج', en: 'Select Model' },
  selectPersona: { ar: 'اختر الشخصية', en: 'Select Persona' },
  analysisMode: { ar: 'وضع التحليل', en: 'Analysis Mode' },
  analyze: { ar: 'تحليل', en: 'Analyze' },
  analyzeProject: { ar: 'تحليل المشروع', en: 'Analyze Project' },
  analyzing: { ar: 'جاري التحليل...', en: 'Analyzing...' },
  analyzingFile: { ar: 'تحليل الملف', en: 'Analyzing File' },
  
  // نتائج التحليل
  issues: { ar: 'المشاكل', en: 'Issues' },
  fixedCode: { ar: 'الكود المصحح', en: 'Fixed Code' },
  originalCode: { ar: 'الكود الأصلي', en: 'Original Code' },
  summary: { ar: 'ملخص', en: 'Summary' },
  score: { ar: 'النتيجة', en: 'Score' },
  line: { ar: 'سطر', en: 'Line' },
  error: { ar: 'خطأ', en: 'Error' },
  warning: { ar: 'تحذير', en: 'Warning' },
  info: { ar: 'معلومة', en: 'Info' },
  
  // التصدير
  download: { ar: 'تحميل', en: 'Download' },
  downloadFixed: { ar: 'تحميل الملف المصحح', en: 'Download Fixed File' },
  downloadProject: { ar: 'تحميل المشروع (ZIP)', en: 'Download Project (ZIP)' },
  exportReport: { ar: 'تصدير التقرير', en: 'Export Report' },
  
  // مركز البيانات
  scan: { ar: 'مسح', en: 'Scan' },
  deepScan: { ar: 'بحث عميق', en: 'Deep Scan' },
  searchPaths: { ar: 'مسارات البحث', en: 'Search Paths' },
  addPath: { ar: 'إضافة مسار', en: 'Add Path' },
  connections: { ar: 'الاتصالات', en: 'Connections' },
  addConnection: { ar: 'إضافة اتصال', en: 'Add Connection' },
  testConnection: { ar: 'اختبار الاتصال', en: 'Test Connection' },
  integrityCheck: { ar: 'فحص السلامة', en: 'Integrity Check' },
  
  // أنواع البيانات
  sqlite: { ar: 'SQLite', en: 'SQLite' },
  mysql: { ar: 'MySQL', en: 'MySQL' },
  postgresql: { ar: 'PostgreSQL', en: 'PostgreSQL' },
  mongodb: { ar: 'MongoDB', en: 'MongoDB' },
  redis: { ar: 'Redis', en: 'Redis' },
  json: { ar: 'JSON', en: 'JSON' },
  csv: { ar: 'CSV', en: 'CSV' },
  xml: { ar: 'XML', en: 'XML' },
  
  // المختبر
  simulate: { ar: 'محاكاة', en: 'Simulate' },
  transform: { ar: 'تحويل', en: 'Transform' },
  document: { ar: 'توثيق', en: 'Document' },
  input: { ar: 'المدخل', en: 'Input' },
  output: { ar: 'المخرج', en: 'Output' },
  executionTime: { ar: 'وقت التنفيذ', en: 'Execution Time' },
  memoryUsage: { ar: 'استخدام الذاكرة', en: 'Memory Usage' },
  
  // التطور الذاتي
  trustLevel: { ar: 'مستوى الثقة', en: 'Trust Level' },
  growthStage: { ar: 'مرحلة النمو', en: 'Growth Stage' },
  infant: { ar: 'الرضيع', en: 'Infant' },
  child: { ar: 'الطفل', en: 'Child' },
  adolescent: { ar: 'المراهق', en: 'Adolescent' },
  adult: { ar: 'البالغ', en: 'Adult' },
  sage: { ar: 'الحكيم', en: 'Sage' },
  runCycle: { ar: 'تشغيل دورة التطور', en: 'Run Evolution Cycle' },
  monitoring: { ar: 'المراقبة', en: 'Monitoring' },
  diary: { ar: 'المذكرات', en: 'Diary' },
  proposals: { ar: 'المقترحات', en: 'Proposals' },
  autoEvolve: { ar: 'تطور تلقائي', en: 'Auto Evolve' },
  needsApproval: { ar: 'يحتاج موافقة', en: 'Needs Approval' },
  
  // الإعدادات
  providers: { ar: 'المزودين', en: 'Providers' },
  models: { ar: 'النماذج', en: 'Models' },
  personas: { ar: 'الشخصيات', en: 'Personas' },
  addPersona: { ar: 'إضافة شخصية', en: 'Add Persona' },
  editPersona: { ar: 'تعديل الشخصية', en: 'Edit Persona' },
  deletePersona: { ar: 'حذف الشخصية', en: 'Delete Persona' },
  octopusMode: { ar: 'وضع الأخطبوط', en: 'Octopus Mode' },
  apiKey: { ar: 'مفتاح API', en: 'API Key' },
  connect: { ar: 'اتصال', en: 'Connect' },
  disconnect: { ar: 'قطع الاتصال', en: 'Disconnect' },
  connected: { ar: 'متصل', en: 'Connected' },
  disconnected: { ar: 'منفصل', en: 'Disconnected' },
  
  // الثيم
  theme: { ar: 'السمة', en: 'Theme' },
  darkMode: { ar: 'الوضع الداكن', en: 'Dark Mode' },
  lightMode: { ar: 'الوضع الفاتح', en: 'Light Mode' },
  toggleTheme: { ar: 'تبديل السمة', en: 'Toggle Theme' },
  
  // اللغة
  language: { ar: 'اللغة', en: 'Language' },
  arabic: { ar: 'العربية', en: 'Arabic' },
  english: { ar: 'الإنجليزية', en: 'English' },
  
  // الوكيل
  agent: { ar: 'الوكيل الذكي', en: 'AI Agent' },
  askAgent: { ar: 'اسأل الوكيل...', en: 'Ask the agent...' },
  send: { ar: 'إرسال', en: 'Send' },
  
  // عام
  files: { ar: 'الملفات', en: 'Files' },
  noFiles: { ar: 'لا توجد ملفات', en: 'No files' },
  loading: { ar: 'جاري التحميل...', en: 'Loading...' },
  success: { ar: 'نجاح', en: 'Success' },
  failed: { ar: 'فشل', en: 'Failed' },
  cancel: { ar: 'إلغاء', en: 'Cancel' },
  save: { ar: 'حفظ', en: 'Save' },
  delete: { ar: 'حذف', en: 'Delete' },
  edit: { ar: 'تعديل', en: 'Edit' },
  add: { ar: 'إضافة', en: 'Add' },
  search: { ar: 'بحث', en: 'Search' },
  filter: { ar: 'تصفية', en: 'Filter' },
  clear: { ar: 'مسح', en: 'Clear' },
  refresh: { ar: 'تحديث', en: 'Refresh' },
  logs: { ar: 'السجلات', en: 'Logs' },
  noLogs: { ar: 'لا توجد سجلات', en: 'No logs' },
  systemLogs: { ar: 'سجل النظام', en: 'System Logs' },
  
  // الحالات
  status: { ar: 'الحالة', en: 'Status' },
  pending: { ar: 'قيد الانتظار', en: 'Pending' },
  running: { ar: 'قيد التشغيل', en: 'Running' },
  completed: { ar: 'مكتمل', en: 'Completed' },
  error: { ar: 'خطأ', en: 'Error' },
  
  // شارات الموديلات
  favoriteForAnalysis: { ar: 'مفضل للتحليل', en: 'Favorite for Analysis' },
  favoriteForLab: { ar: 'مفضل للمختبر', en: 'Favorite for Lab' },
  free: { ar: 'مجاني', en: 'Free' },
  internet: { ar: 'إنترنت', en: 'Internet' },
  thinking: { ar: 'تفكير', en: 'Thinking' },
  
  // إحصائيات
  statistics: { ar: 'إحصائيات', en: 'Statistics' },
  totalFiles: { ar: 'إجمالي الملفات', en: 'Total Files' },
  analyzedFiles: { ar: 'تم تحليلها', en: 'Analyzed' },
  totalIssues: { ar: 'إجمالي المشاكل', en: 'Total Issues' },
  successRate: { ar: 'معدل النجاح', en: 'Success Rate' },
}

// دالة للحصول على الترجمة
export function t(key: string, lang: Language): string {
  return translations[key]?.[lang] || key
}

// دالة لتنسيق الأرقام
export function formatNumber(num: number, lang: Language): string {
  if (lang === 'ar') {
    return num.toLocaleString('ar-SA')
  }
  return num.toLocaleString('en-US')
}

// دالة لتنسيق التاريخ
export function formatDate(date: Date, lang: Language): string {
  if (lang === 'ar') {
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
