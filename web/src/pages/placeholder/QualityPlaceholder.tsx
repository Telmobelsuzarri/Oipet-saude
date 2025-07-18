import React from 'react'
import { motion } from 'framer-motion'
import { GlassContainer } from '@/components/ui/GlassContainer'

interface QualityPlaceholderProps {
  title: string
  description: string
  icon: string
  features?: string[]
  comingSoon?: boolean
}

export const QualityPlaceholder: React.FC<QualityPlaceholderProps> = ({
  title,
  description,
  icon,
  features = [],
  comingSoon = true
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center">
        <div className="text-8xl mb-4">{icon}</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">{description}</p>
      </div>

      {/* Status */}
      <div className="text-center">
        <GlassContainer className="inline-block px-6 py-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">
              {comingSoon ? 'Em desenvolvimento' : 'Funcionalidade indisponível'}
            </span>
          </div>
        </GlassContainer>
      </div>

      {/* Features Preview */}
      {features.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassContainer className="p-6 h-full">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-coral-500 rounded-full"></div>
                  <p className="text-gray-700 font-medium">{feature}</p>
                </div>
              </GlassContainer>
            </motion.div>
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="text-center">
        <GlassContainer className="inline-block p-8 max-w-lg mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Novidades em breve
          </h3>
          <p className="text-gray-600 mb-4">
            Esta funcionalidade está sendo desenvolvida com todo carinho para oferecer a melhor experiência para você e seu pet.
          </p>
          <button className="bg-coral-500 hover:bg-coral-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
            Ser notificado
          </button>
        </GlassContainer>
      </div>
    </motion.div>
  )
}

// Páginas específicas usando o placeholder de qualidade
export const ForgotPasswordPage = () => (
  <QualityPlaceholder
    title="Recuperar Senha"
    description="Esqueceu sua senha? Em breve você poderá recuperá-la facilmente."
    icon="🔐"
    features={[
      'Recuperação por email',
      'Verificação segura',
      'Nova senha temporária',
      'Histórico de alterações'
    ]}
  />
)

export const PetDetailPage = () => (
  <QualityPlaceholder
    title="Detalhes do Pet"
    description="Visualize informações detalhadas sobre seu pet, histórico médico e muito mais."
    icon="🐾"
    features={[
      'Perfil completo do pet',
      'Histórico médico',
      'Gráficos de crescimento',
      'Agenda de cuidados',
      'Fotos e memórias',
      'Compartilhamento com veterinário'
    ]}
  />
)

export const FoodScannerPage = () => (
  <QualityPlaceholder
    title="Scanner de Alimentos"
    description="Escaneie alimentos e receba informações nutricionais personalizadas para seu pet."
    icon="📷"
    features={[
      'Reconhecimento por IA',
      'Análise nutricional',
      'Compatibilidade com pets',
      'Histórico de escaneamentos',
      'Recomendações personalizadas',
      'Alertas de ingredientes'
    ]}
  />
)

export const StorePage = () => (
  <QualityPlaceholder
    title="Loja OiPet"
    description="Encontre os melhores produtos para seu pet com recomendações personalizadas."
    icon="🛒"
    features={[
      'Produtos recomendados',
      'Filtros por pet',
      'Avaliações verificadas',
      'Entrega rápida',
      'Programa de fidelidade',
      'Ofertas exclusivas'
    ]}
  />
)

export const ReportsPage = () => (
  <QualityPlaceholder
    title="Relatórios de Saúde"
    description="Gere relatórios completos sobre a saúde e desenvolvimento do seu pet."
    icon="📊"
    features={[
      'Relatórios personalizados',
      'Gráficos interativos',
      'Exportação PDF',
      'Compartilhamento',
      'Análise de tendências',
      'Recomendações veterinárias'
    ]}
  />
)

export const NotificationsPage = () => (
  <QualityPlaceholder
    title="Central de Notificações"
    description="Gerencie todas as notificações e lembretes do seu pet em um só lugar."
    icon="🔔"
    features={[
      'Lembretes de medicação',
      'Alertas de saúde',
      'Notificações de atividade',
      'Configuração personalizada',
      'Histórico completo',
      'Sincronização multiplataforma'
    ]}
  />
)

export const ProfilePage = () => (
  <QualityPlaceholder
    title="Meu Perfil"
    description="Gerencie suas informações pessoais e preferências da conta."
    icon="👤"
    features={[
      'Informações pessoais',
      'Configurações de conta',
      'Preferências de privacidade',
      'Histórico de atividades',
      'Configurações de notificação',
      'Gerenciamento de dados'
    ]}
  />
)

export const SettingsPage = () => (
  <QualityPlaceholder
    title="Configurações"
    description="Personalize sua experiência no OiPet Saúde."
    icon="⚙️"
    features={[
      'Configurações gerais',
      'Preferências de tema',
      'Configurações de privacidade',
      'Notificações',
      'Sincronização',
      'Backup de dados'
    ]}
  />
)

export const AdminDashboardPage = () => (
  <QualityPlaceholder
    title="Dashboard Administrativo"
    description="Painel de controle para administradores do sistema."
    icon="👨‍💼"
    features={[
      'Métricas em tempo real',
      'Gestão de usuários',
      'Relatórios de sistema',
      'Configurações globais',
      'Logs de auditoria',
      'Backup e segurança'
    ]}
  />
)

export const AdminUsersPage = () => (
  <QualityPlaceholder
    title="Gerenciamento de Usuários"
    description="Gerencie usuários, permissões e acessos do sistema."
    icon="👥"
    features={[
      'Lista de usuários',
      'Controle de permissões',
      'Histórico de atividades',
      'Bloqueio/desbloqueio',
      'Relatórios de uso',
      'Suporte técnico'
    ]}
  />
)

export const AdminAnalyticsPage = () => (
  <QualityPlaceholder
    title="Analytics Administrativo"
    description="Análise detalhada de dados e métricas do sistema."
    icon="📈"
    features={[
      'Métricas de uso',
      'Análise de comportamento',
      'Relatórios de performance',
      'Dashboards customizáveis',
      'Exportação de dados',
      'Insights automáticos'
    ]}
  />
)

export const AboutPage = () => (
  <QualityPlaceholder
    title="Sobre o OiPet Saúde"
    description="Conheça nossa missão de cuidar melhor dos pets através da tecnologia."
    icon="ℹ️"
    features={[
      'Nossa história',
      'Missão e valores',
      'Equipe especializada',
      'Tecnologia avançada',
      'Parcerias veterinárias',
      'Compromisso com qualidade'
    ]}
    comingSoon={false}
  />
)

export const ContactPage = () => (
  <QualityPlaceholder
    title="Fale Conosco"
    description="Entre em contato conosco para dúvidas, sugestões ou suporte."
    icon="📞"
    features={[
      'Suporte 24/7',
      'Chat ao vivo',
      'Email especializado',
      'FAQ completo',
      'Tutoriais em vídeo',
      'Comunidade de usuários'
    ]}
    comingSoon={false}
  />
)

export const NotFoundPage = () => (
  <QualityPlaceholder
    title="Página Não Encontrada"
    description="Ops! A página que você procura não existe ou foi movida."
    icon="❌"
    features={[
      'Busca inteligente',
      'Páginas relacionadas',
      'Navegação rápida',
      'Suporte ao usuário'
    ]}
    comingSoon={false}
  />
)