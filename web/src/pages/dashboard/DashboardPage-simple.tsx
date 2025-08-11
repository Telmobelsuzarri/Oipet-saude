import React, { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { usePetStore } from '@/stores/petStore'
import { HealthStatsWidget } from '@/components/charts/HealthStatsWidget'
import { HeartIcon, PlusIcon, ChartBarIcon, BellIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon, UserGroupIcon, ShoppingCartIcon } from '@heroicons/react/24/solid'
import { motion } from 'framer-motion'
import { AddPetModal } from '@/components/modals/AddPetModal'
import { ProgressCircle, MultiProgressCircle } from '@/components/charts/ProgressCircle'
import { WeeklyBarChart } from '@/components/charts/WeeklyBarChart'
import { ActivityTimeline, createMockActivities } from '@/components/charts/ActivityTimeline'
import { FloatingActionButton, createOiPetActions } from '@/components/ui/FloatingActionButton'
import { OiPetLogo } from '@/components/ui/OiPetLogo'
import { SmartRecommendationWidget } from '@/components/recommendations/SmartRecommendationWidget'
import { FoodPhotoWidget } from '@/components/gallery/FoodPhotoWidget'
import { UpcomingAppointmentsWidget } from '@/components/appointments/UpcomingAppointmentsWidget'
import { ChallengesWidget } from '@/components/dashboard/ChallengesWidget'

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore()
  const { pets, fetchPets } = usePetStore()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const handleAddPetSuccess = () => {
    fetchPets()
  }

  // Mock data para demonstração das funcionalidades implementadas
  const mockHealthData = {
    weight: 15.2,
    height: 45,
    imc: 22.5,
    lastWeightChange: -0.3,
    healthStatus: 'good' as const,
    lastCheckup: '2025-07-10'
  }

  const todayStats = {
    waterGoal: 1200,
    waterConsumed: 850,
    caloriesGoal: 650,
    caloriesConsumed: 420,
    exerciseGoal: 60,
    exerciseCompleted: 45,
    sleepGoal: 14,
    sleepActual: 12.5
  }

  const activePet = pets.length > 0 ? pets[0] : null

  // Dados mock para os novos componentes
  const weeklyActivity = [
    { day: 'DOM', value: 45, label: '45min' },
    { day: 'SEG', value: 60, label: '1h' },
    { day: 'TER', value: 30, label: '30min' },
    { day: 'QUA', value: 75, label: '1h15' },
    { day: 'QUI', value: 90, label: '1h30' },
    { day: 'SEX', value: 40, label: '40min' },
    { day: 'SAB', value: 85, label: '1h25' }
  ]

  const weeklyWeight = [
    { day: 'DOM', value: 15.2 },
    { day: 'SEG', value: 15.1 },
    { day: 'TER', value: 15.3 },
    { day: 'QUA', value: 15.0 },
    { day: 'QUI', value: 15.2 },
    { day: 'SEX', value: 15.1 },
    { day: 'SAB', value: 15.2 }
  ]

  const healthGoals = [
    { value: 75, maxValue: 100, color: 'coral' as const, label: 'Atividade' },
    { value: 85, maxValue: 100, color: 'blue' as const, label: 'Hidratação' },
    { value: 60, maxValue: 100, color: 'green' as const, label: 'Alimentação' }
  ]

  const recentActivities = createMockActivities()

  // Floating Action Button actions
  const fabActions = createOiPetActions({
    onAddHealth: () => {
      console.log('Registrar saúde')
      // TODO: Abrir modal de registro de saúde
    },
    onScanFood: () => {
      console.log('Escanear alimento')
      // TODO: Abrir câmera para escaneamento
    },
    onViewReports: () => {
      console.log('Ver relatórios')
      // TODO: Navegar para página de relatórios
    },
    onOpenStore: () => {
      console.log('Abrir loja')
      // TODO: Redirecionar para loja OiPet
      window.open('https://oipetcomidadeverdade.com.br', '_blank')
    },
    onAddPet: () => {
      setIsAddModalOpen(true)
    },
    onNotifications: () => {
      console.log('Notificações')
      // TODO: Abrir painel de notificações
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header com glass effect aprimorado */}
      <motion.div 
        className="glass-container bg-white/20 backdrop-blur-xl border-b border-white/30 sticky top-0 z-50 shadow-glass"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo OiPet Official */}
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <OiPetLogo 
                size="lg" 
                showText={true}
                className="hover:scale-105 transition-transform duration-300"
              />
              <div className="hidden md:block">
                <p className="text-sm text-gray-600 font-medium">Dashboard de Saúde</p>
              </div>
            </motion.div>

            {/* Actions Section */}
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {/* Notification Bell */}
              <motion.div 
                className="relative glass-widget p-2 rounded-full hover:bg-white/30 transition-all duration-300 cursor-pointer group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <BellIcon className="h-6 w-6 text-gray-700 group-hover:text-coral-600 transition-colors" />
                <motion.div 
                  className="absolute -top-1 -right-1 w-4 h-4 bg-coral-500 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1, type: "spring", stiffness: 300 }}
                >
                  <span className="text-xs text-white font-bold">3</span>
                </motion.div>
              </motion.div>

              {/* User Profile */}
              <div className="flex items-center space-x-3 glass-widget px-4 py-2 rounded-glass hover:bg-white/30 transition-all duration-300 cursor-pointer group">
                <motion.div 
                  className="w-10 h-10 bg-gradient-to-r from-coral-500 to-teal-500 rounded-full flex items-center justify-center ring-2 ring-white/30 group-hover:ring-white/50 transition-all"
                  whileHover={{ scale: 1.1 }}
                >
                  <span className="text-white text-sm font-bold">
                    {user?.name?.[0] || 'U'}
                  </span>
                </motion.div>
                <div className="hidden sm:block">
                  <span className="text-sm font-medium text-gray-800 group-hover:text-gray-900 transition-colors">
                    {user?.name || 'Usuário'}
                  </span>
                  <p className="text-xs text-gray-600">Tutor</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/30 backdrop-blur-md border border-white/20 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Olá, {user?.name?.split(' ')[0] || 'Usuário'}! 👋
                </h2>
                <p className="text-gray-600 mt-1">
                  {activePet ? `Monitorando ${activePet.name}` : 'Vamos começar adicionando seu primeiro pet'}
                </p>
              </div>
              {!activePet && (
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-coral-500 hover:bg-coral-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>Adicionar Pet</span>
                </button>
              )}
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Dashboard */}
          <div className="lg:col-span-2 space-y-6">
            {activePet ? (
              <>
                {/* Health Stats Widget */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <HealthStatsWidget
                    data={mockHealthData}
                    petName={activePet.name}
                    className=""
                  />
                </motion.div>

                {/* Métricas Diárias */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/30 backdrop-blur-md border border-white/20 rounded-2xl p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                    <ChartBarIcon className="h-5 w-5 text-coral-600" />
                    <span>Métricas de Hoje</span>
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Água */}
                    <div className="bg-blue-50/50 rounded-glass p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-blue-600">💧 Água</span>
                        <span className="text-xs text-blue-500">{Math.round((todayStats.waterConsumed / todayStats.waterGoal) * 100)}%</span>
                      </div>
                      <div className="flex items-end space-x-1 mb-2">
                        <span className="text-lg font-bold text-blue-900">{todayStats.waterConsumed}</span>
                        <span className="text-sm text-blue-600">/ {todayStats.waterGoal}ml</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <motion.div
                          className="bg-blue-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(todayStats.waterConsumed / todayStats.waterGoal) * 100}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                    </div>

                    {/* Calorias */}
                    <div className="bg-orange-50/50 rounded-glass p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-orange-600">🍖 Calorias</span>
                        <span className="text-xs text-orange-500">{Math.round((todayStats.caloriesConsumed / todayStats.caloriesGoal) * 100)}%</span>
                      </div>
                      <div className="flex items-end space-x-1 mb-2">
                        <span className="text-lg font-bold text-orange-900">{todayStats.caloriesConsumed}</span>
                        <span className="text-sm text-orange-600">/ {todayStats.caloriesGoal}kcal</span>
                      </div>
                      <div className="w-full bg-orange-200 rounded-full h-2">
                        <motion.div
                          className="bg-orange-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(todayStats.caloriesConsumed / todayStats.caloriesGoal) * 100}%` }}
                          transition={{ duration: 1, delay: 0.7 }}
                        />
                      </div>
                    </div>

                    {/* Exercício */}
                    <div className="bg-green-50/50 rounded-glass p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-green-600">🏃 Exercício</span>
                        <span className="text-xs text-green-500">{Math.round((todayStats.exerciseCompleted / todayStats.exerciseGoal) * 100)}%</span>
                      </div>
                      <div className="flex items-end space-x-1 mb-2">
                        <span className="text-lg font-bold text-green-900">{todayStats.exerciseCompleted}</span>
                        <span className="text-sm text-green-600">/ {todayStats.exerciseGoal}min</span>
                      </div>
                      <div className="w-full bg-green-200 rounded-full h-2">
                        <motion.div
                          className="bg-green-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(todayStats.exerciseCompleted / todayStats.exerciseGoal) * 100}%` }}
                          transition={{ duration: 1, delay: 0.9 }}
                        />
                      </div>
                    </div>

                    {/* Sono */}
                    <div className="bg-purple-50/50 rounded-glass p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-purple-600">😴 Sono</span>
                        <span className="text-xs text-purple-500">{Math.round((todayStats.sleepActual / todayStats.sleepGoal) * 100)}%</span>
                      </div>
                      <div className="flex items-end space-x-1 mb-2">
                        <span className="text-lg font-bold text-purple-900">{todayStats.sleepActual}</span>
                        <span className="text-sm text-purple-600">/ {todayStats.sleepGoal}h</span>
                      </div>
                      <div className="w-full bg-purple-200 rounded-full h-2">
                        <motion.div
                          className="bg-purple-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(todayStats.sleepActual / todayStats.sleepGoal) * 100}%` }}
                          transition={{ duration: 1, delay: 1.1 }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Progress Circles & Charts Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                  {/* Multi Progress Circle - Health Goals */}
                  <div className="bg-white/30 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                      <span className="text-2xl">🎯</span>
                      <span>Metas de Saúde</span>
                    </h3>
                    
                    <div className="flex items-center justify-center">
                      <MultiProgressCircle
                        circles={healthGoals}
                        size="lg"
                        className=""
                      />
                    </div>

                    {/* Individual Progress Details */}
                    <div className="mt-6 space-y-3">
                      {healthGoals.map((goal, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ 
                                backgroundColor: goal.color === 'coral' ? '#E85A5A' : 
                                                 goal.color === 'blue' ? '#3B82F6' : '#10B981'
                              }}
                            />
                            <span className="text-sm font-medium text-gray-700">{goal.label}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <ProgressCircle
                              value={goal.value}
                              maxValue={goal.maxValue}
                              color={goal.color}
                              size="sm"
                              showPercentage={true}
                              animate={false}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Weekly Activity Chart */}
                  <WeeklyBarChart
                    data={weeklyActivity}
                    maxValue={90}
                    color="coral"
                    title="📊 Atividade Semanal"
                    subtitle="Minutos de atividade por dia"
                    height={180}
                    showValues={true}
                    animate={true}
                  />
                </motion.div>

                {/* Weekly Weight Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <WeeklyBarChart
                    data={weeklyWeight.map(item => ({ ...item, label: `${item.value}kg` }))}
                    maxValue={16}
                    color="teal"
                    title="⚖️ Controle de Peso"
                    subtitle="Peso registrado nos últimos 7 dias"
                    height={160}
                    showValues={true}
                    animate={true}
                  />
                </motion.div>
              </>
            ) : (
              /* Empty State */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/30 backdrop-blur-md border border-white/20 rounded-2xl p-12 text-center"
              >
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🐾</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Nenhum pet cadastrado
                </h3>
                <p className="text-gray-600 mb-6">
                  Cadastre seu primeiro pet para começar a monitorar sua saúde
                </p>
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-coral-500 hover:bg-coral-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 mx-auto transition-colors"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>Cadastrar Pet</span>
                </button>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pet Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/30 backdrop-blur-md border border-white/20 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Meus Pets</h3>
              {pets.length > 0 ? (
                <div className="space-y-3">
                  {pets.map((pet, index) => (
                    <div key={pet._id} className="flex items-center space-x-3 p-3 bg-white/20 rounded-glass">
                      <div className="w-10 h-10 bg-gradient-to-r from-coral-400 to-teal-400 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">{pet.name[0]}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{pet.name}</p>
                        <p className="text-sm text-gray-600">{pet.breed}</p>
                      </div>
                      {index === 0 && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-sm">Nenhum pet cadastrado ainda</p>
              )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/30 backdrop-blur-md border border-white/20 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 bg-white/20 rounded-glass hover:bg-white/30 transition-colors">
                  <HeartIcon className="h-5 w-5 text-coral-600" />
                  <span className="text-sm font-medium text-gray-900">Registrar Saúde</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-white/20 rounded-glass hover:bg-white/30 transition-colors">
                  <span className="text-lg">📷</span>
                  <span className="text-sm font-medium text-gray-900">Escanear Alimento</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-white/20 rounded-glass hover:bg-white/30 transition-colors">
                  <ShoppingCartIcon className="h-5 w-5 text-teal-600" />
                  <span className="text-sm font-medium text-gray-900">Loja OiPet</span>
                </button>
              </div>
            </motion.div>

            {/* Challenges Widget */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
            >
              <ChallengesWidget />
            </motion.div>

            {/* AI Recommendations Widget */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <SmartRecommendationWidget 
                petId={activePet?._id}
              />
            </motion.div>

            {/* Upcoming Appointments Widget */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 }}
            >
              <UpcomingAppointmentsWidget />
            </motion.div>

            {/* Food Gallery Widget */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <FoodPhotoWidget 
                petId={activePet?._id}
              />
            </motion.div>

            {/* Activity Timeline */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <ActivityTimeline
                activities={recentActivities}
                maxItems={5}
                showHeader={true}
              />
            </motion.div>

            {/* Stats Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white/30 backdrop-blur-md border border-white/20 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <UserGroupIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Total Pets</span>
                  </div>
                  <span className="font-semibold text-gray-900">{pets.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <HeartIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Registros Hoje</span>
                  </div>
                  <span className="font-semibold text-gray-900">{recentActivities.filter(a => {
                    const today = new Date()
                    return a.timestamp.toDateString() === today.toDateString()
                  }).length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ChartBarIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Média Saúde</span>
                  </div>
                  <span className="font-semibold text-green-600">85%</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        actions={fabActions.slice(0, 5)} // Limitar a 5 ações principais
        position="bottom-right"
        size="md"
      />

      {/* Add Pet Modal */}
      <AddPetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddPetSuccess}
      />
    </div>
  )
}