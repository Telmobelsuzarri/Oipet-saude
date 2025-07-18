import React from 'react'
import { motion } from 'framer-motion'
import { 
  CogIcon,
  BellIcon,
  PaintBrushIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  MoonIcon,
  SunIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  XMarkIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { Switch } from '@headlessui/react'
import toast from 'react-hot-toast'

import { GlassContainer, GlassCard, GlassWidget } from '@/components/ui/GlassContainer'
import { cn } from '@/lib/utils'

interface SettingsState {
  // Notifications
  emailNotifications: boolean
  pushNotifications: boolean
  healthReminders: boolean
  feedingReminders: boolean
  appointmentReminders: boolean
  weeklyReports: boolean
  
  // Privacy
  profileVisibility: 'public' | 'friends' | 'private'
  dataSharing: boolean
  analyticsOptIn: boolean
  
  // Appearance
  theme: 'light' | 'dark' | 'system'
  language: 'pt' | 'en' | 'es'
  timezone: string
  
  // Data & Storage
  autoBackup: boolean
  offlineMode: boolean
  cacheSize: 'small' | 'medium' | 'large'
}

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = React.useState<SettingsState>({
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    healthReminders: true,
    feedingReminders: true,
    appointmentReminders: true,
    weeklyReports: false,
    
    // Privacy
    profileVisibility: 'private',
    dataSharing: false,
    analyticsOptIn: true,
    
    // Appearance
    theme: 'system',
    language: 'pt',
    timezone: 'America/Sao_Paulo',
    
    // Data & Storage
    autoBackup: true,
    offlineMode: false,
    cacheSize: 'medium',
  })

  const [isLoading, setIsLoading] = React.useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false)

  const updateSetting = <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasUnsavedChanges(true)
  }

  const handleSaveSettings = async () => {
    setIsLoading(true)
    try {
      // Here you would save settings to the API
      await new Promise(resolve => setTimeout(resolve, 1000)) // Mock API call
      toast.success('Configurações salvas com sucesso!')
      setHasUnsavedChanges(false)
    } catch (error) {
      toast.error('Erro ao salvar configurações')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetSettings = () => {
    setSettings({
      emailNotifications: true,
      pushNotifications: true,
      healthReminders: true,
      feedingReminders: true,
      appointmentReminders: true,
      weeklyReports: false,
      profileVisibility: 'private',
      dataSharing: false,
      analyticsOptIn: true,
      theme: 'system',
      language: 'pt',
      timezone: 'America/Sao_Paulo',
      autoBackup: true,
      offlineMode: false,
      cacheSize: 'medium',
    })
    setHasUnsavedChanges(true)
    toast.success('Configurações restauradas para o padrão')
  }

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case 'light': return <SunIcon className="h-5 w-5" />
      case 'dark': return <MoonIcon className="h-5 w-5" />
      default: return <ComputerDesktopIcon className="h-5 w-5" />
    }
  }

  const getCacheSizeLabel = (size: string) => {
    switch (size) {
      case 'small': return '100 MB'
      case 'medium': return '500 MB'
      case 'large': return '1 GB'
      default: return '500 MB'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
            <p className="text-gray-600 mt-1">
              Personalize sua experiência no OiPet Saúde
            </p>
          </div>
          {hasUnsavedChanges && (
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleResetSettings}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-glass font-medium hover:bg-gray-300 transition-colors"
              >
                <XMarkIcon className="h-4 w-4" />
                <span>Restaurar</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSaveSettings}
                disabled={isLoading}
                className="flex items-center space-x-2 bg-gradient-to-r from-coral-500 to-coral-600 text-white px-6 py-2 rounded-glass font-medium hover:from-coral-600 hover:to-coral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-4 w-4" />
                    <span>Salvar</span>
                  </>
                )}
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <GlassCard>
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-coral-100 rounded-glass">
                <BellIcon className="h-5 w-5 text-coral-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Notificações</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Notificações por Email</h3>
                  <p className="text-sm text-gray-600">Receba emails sobre atualizações importantes</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onChange={(value) => updateSetting('emailNotifications', value)}
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    settings.emailNotifications ? 'bg-coral-500' : 'bg-gray-200'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </Switch>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Notificações Push</h3>
                  <p className="text-sm text-gray-600">Receba notificações no navegador</p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onChange={(value) => updateSetting('pushNotifications', value)}
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    settings.pushNotifications ? 'bg-coral-500' : 'bg-gray-200'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      settings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </Switch>
              </div>

              <hr className="border-gray-200/50" />

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700">Lembretes</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Saúde dos Pets</h3>
                    <p className="text-sm text-gray-600">Lembretes de medicação e check-ups</p>
                  </div>
                  <Switch
                    checked={settings.healthReminders}
                    onChange={(value) => updateSetting('healthReminders', value)}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      settings.healthReminders ? 'bg-coral-500' : 'bg-gray-200'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        settings.healthReminders ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </Switch>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Alimentação</h3>
                    <p className="text-sm text-gray-600">Horários de refeição</p>
                  </div>
                  <Switch
                    checked={settings.feedingReminders}
                    onChange={(value) => updateSetting('feedingReminders', value)}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      settings.feedingReminders ? 'bg-coral-500' : 'bg-gray-200'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        settings.feedingReminders ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </Switch>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Consultas</h3>
                    <p className="text-sm text-gray-600">Compromissos veterinários</p>
                  </div>
                  <Switch
                    checked={settings.appointmentReminders}
                    onChange={(value) => updateSetting('appointmentReminders', value)}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      settings.appointmentReminders ? 'bg-coral-500' : 'bg-gray-200'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        settings.appointmentReminders ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </Switch>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Relatórios Semanais</h3>
                    <p className="text-sm text-gray-600">Resumo semanal da saúde dos pets</p>
                  </div>
                  <Switch
                    checked={settings.weeklyReports}
                    onChange={(value) => updateSetting('weeklyReports', value)}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      settings.weeklyReports ? 'bg-coral-500' : 'bg-gray-200'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        settings.weeklyReports ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </Switch>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Appearance */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <GlassCard>
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-teal-100 rounded-glass">
                <PaintBrushIcon className="h-5 w-5 text-teal-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Aparência</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tema
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'light', label: 'Claro' },
                    { value: 'dark', label: 'Escuro' },
                    { value: 'system', label: 'Sistema' }
                  ].map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() => updateSetting('theme', theme.value as any)}
                      className={cn(
                        'flex flex-col items-center p-3 rounded-glass border-2 transition-all duration-200',
                        settings.theme === theme.value
                          ? 'border-coral-500 bg-coral-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      {getThemeIcon(theme.value)}
                      <span className="text-sm font-medium mt-2">{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Idioma
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => updateSetting('language', e.target.value as any)}
                  className="w-full px-4 py-2 bg-white/50 border border-white/20 rounded-glass focus:bg-white/70 focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="pt">Português (Brasil)</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fuso Horário
                </label>
                <select
                  value={settings.timezone}
                  onChange={(e) => updateSetting('timezone', e.target.value)}
                  className="w-full px-4 py-2 bg-white/50 border border-white/20 rounded-glass focus:bg-white/70 focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="America/Sao_Paulo">São Paulo (UTC-3)</option>
                  <option value="America/New_York">Nova York (UTC-5)</option>
                  <option value="Europe/London">Londres (UTC+0)</option>
                  <option value="Europe/Madrid">Madrid (UTC+1)</option>
                </select>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Privacy & Security */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <GlassCard>
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-glass">
                <ShieldCheckIcon className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Privacidade & Segurança</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visibilidade do Perfil
                </label>
                <select
                  value={settings.profileVisibility}
                  onChange={(e) => updateSetting('profileVisibility', e.target.value as any)}
                  className="w-full px-4 py-2 bg-white/50 border border-white/20 rounded-glass focus:bg-white/70 focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="public">Público</option>
                  <option value="friends">Apenas Amigos</option>
                  <option value="private">Privado</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Compartilhamento de Dados</h3>
                  <p className="text-sm text-gray-600">Permitir compartilhamento para pesquisas veterinárias</p>
                </div>
                <Switch
                  checked={settings.dataSharing}
                  onChange={(value) => updateSetting('dataSharing', value)}
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    settings.dataSharing ? 'bg-coral-500' : 'bg-gray-200'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      settings.dataSharing ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </Switch>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Analytics</h3>
                  <p className="text-sm text-gray-600">Ajudar a melhorar o app com dados anônimos</p>
                </div>
                <Switch
                  checked={settings.analyticsOptIn}
                  onChange={(value) => updateSetting('analyticsOptIn', value)}
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    settings.analyticsOptIn ? 'bg-coral-500' : 'bg-gray-200'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      settings.analyticsOptIn ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </Switch>
              </div>

              <div className="p-4 bg-blue-50 rounded-glass border border-blue-200">
                <div className="flex items-start space-x-3">
                  <InformationCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">Política de Privacidade</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Seus dados são protegidos de acordo com nossa política de privacidade. 
                      <a href="/privacy" className="underline hover:no-underline">Saiba mais</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Data & Storage */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <GlassCard>
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-green-100 rounded-glass">
                <GlobeAltIcon className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Dados & Armazenamento</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Backup Automático</h3>
                  <p className="text-sm text-gray-600">Fazer backup dos dados na nuvem</p>
                </div>
                <Switch
                  checked={settings.autoBackup}
                  onChange={(value) => updateSetting('autoBackup', value)}
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    settings.autoBackup ? 'bg-coral-500' : 'bg-gray-200'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      settings.autoBackup ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </Switch>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Modo Offline</h3>
                  <p className="text-sm text-gray-600">Permitir uso sem conexão</p>
                </div>
                <Switch
                  checked={settings.offlineMode}
                  onChange={(value) => updateSetting('offlineMode', value)}
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    settings.offlineMode ? 'bg-coral-500' : 'bg-gray-200'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      settings.offlineMode ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </Switch>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tamanho do Cache ({getCacheSizeLabel(settings.cacheSize)})
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'small', label: 'Pequeno' },
                    { value: 'medium', label: 'Médio' },
                    { value: 'large', label: 'Grande' }
                  ].map((size) => (
                    <button
                      key={size.value}
                      onClick={() => updateSetting('cacheSize', size.value as any)}
                      className={cn(
                        'p-2 text-sm rounded-glass border-2 transition-all duration-200',
                        settings.cacheSize === size.value
                          ? 'border-coral-500 bg-coral-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <button className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-glass border border-gray-200 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Limpar Cache</h4>
                      <p className="text-xs text-gray-600">Liberar espaço de armazenamento</p>
                    </div>
                    <span className="text-xs text-gray-500">~{getCacheSizeLabel(settings.cacheSize)}</span>
                  </div>
                </button>

                <button className="w-full p-3 text-left bg-red-50 hover:bg-red-100 rounded-glass border border-red-200 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-red-900">Exportar Dados</h4>
                      <p className="text-xs text-red-600">Baixar todos os seus dados</p>
                    </div>
                    <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                  </div>
                </button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* App Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <GlassCard>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Sobre o App</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-700">Versão</h3>
              <p className="text-lg font-semibold text-gray-900">2.1.0</p>
            </div>
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-700">Última Atualização</h3>
              <p className="text-lg font-semibold text-gray-900">15/01/2025</p>
            </div>
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-700">Suporte</h3>
              <a 
                href="mailto:suporte@oipet.com" 
                className="text-lg font-semibold text-coral-600 hover:text-coral-700"
              >
                Contato
              </a>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}