import React from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { 
  UserIcon,
  CameraIcon,
  PencilIcon,
  KeyIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { UserCircleIcon } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'

import { GlassContainer, GlassCard, GlassWidget } from '@/components/ui/GlassContainer'
import { useAuthStore } from '@/stores/authStore'
import { api } from '@/lib/api'
import { isEmail, isPhone, formatPhone, formatDateTime } from '@/lib/utils'

interface ProfileForm {
  name: string
  email: string
  phone: string
}

interface PasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuthStore()
  const [isEditing, setIsEditing] = React.useState(false)
  const [isChangingPassword, setIsChangingPassword] = React.useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false)
  const [showNewPassword, setShowNewPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [passwordLoading, setPasswordLoading] = React.useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)

  const profileForm = useForm<ProfileForm>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  })

  const passwordForm = useForm<PasswordForm>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const handleProfileSubmit = async (data: ProfileForm) => {
    if (!isEmail(data.email)) {
      profileForm.setError('email', { message: 'Email inválido' })
      return
    }

    if (data.phone && !isPhone(data.phone)) {
      profileForm.setError('phone', { message: 'Telefone inválido' })
      return
    }

    setIsLoading(true)
    try {
      const response = await api.users.updateProfile({
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
      })

      updateUser(response.data.data)
      toast.success('Perfil atualizado com sucesso!')
      setIsEditing(false)
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao atualizar perfil'
      toast.error(message)
      
      if (error.response?.status === 409) {
        profileForm.setError('email', { message: 'Este email já está em uso' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = async (data: PasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      passwordForm.setError('confirmPassword', { message: 'Senhas não conferem' })
      return
    }

    if (data.newPassword.length < 6) {
      passwordForm.setError('newPassword', { message: 'Nova senha deve ter pelo menos 6 caracteres' })
      return
    }

    setPasswordLoading(true)
    try {
      await api.users.changePassword(data.currentPassword, data.newPassword)
      toast.success('Senha alterada com sucesso!')
      setIsChangingPassword(false)
      passwordForm.reset()
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao alterar senha'
      toast.error(message)
      
      if (error.response?.status === 401) {
        passwordForm.setError('currentPassword', { message: 'Senha atual incorreta' })
      }
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida')
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error('Imagem deve ter no máximo 5MB')
      return
    }

    try {
      const response = await api.users.uploadAvatar(file)
      updateUser(response.data.data)
      toast.success('Foto atualizada com sucesso!')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao enviar foto'
      toast.error(message)
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    profileForm.setValue('phone', formatted)
  }

  const handleDeleteAccount = async () => {
    // Implementation would go here
    toast.error('Funcionalidade não implementada ainda')
    setShowDeleteDialog(false)
  }

  React.useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      })
    }
  }, [user, profileForm])

  const accountStats = {
    joinDate: user?.createdAt || new Date().toISOString(),
    lastLogin: new Date().toISOString(), // This should come from user data
    totalPets: 3, // This should come from API
    healthRecords: 15, // This should come from API
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
            <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
            <p className="text-gray-600 mt-1">
              Gerencie suas informações pessoais e configurações
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-1"
        >
          <GlassCard>
            <div className="text-center">
              {/* Avatar */}
              <div className="relative inline-block mb-6">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-24 w-24 rounded-full object-cover mx-auto"
                  />
                ) : (
                  <UserCircleIcon className="h-24 w-24 text-gray-400 mx-auto" />
                )}
                <label className="absolute bottom-0 right-0 p-2 bg-coral-500 text-white rounded-full cursor-pointer hover:bg-coral-600 transition-colors">
                  <CameraIcon className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* User Info */}
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {user?.name || 'Usuário'}
              </h2>
              <p className="text-gray-600 mb-4">{user?.email}</p>
              
              {user?.isAdmin && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 mb-4">
                  Administrador
                </span>
              )}

              <div className="text-sm text-gray-500 space-y-1">
                <p>Membro desde {formatDateTime(accountStats.joinDate).split(' ')[0]}</p>
                <p>Último acesso: {formatDateTime(accountStats.lastLogin)}</p>
              </div>
            </div>
          </GlassCard>

          {/* Account Stats */}
          <GlassCard className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Pets cadastrados</span>
                <span className="font-semibold text-gray-900">{accountStats.totalPets}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Registros de saúde</span>
                <span className="font-semibold text-gray-900">{accountStats.healthRecords}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Email verificado</span>
                <span className={`font-semibold ${user?.isEmailVerified ? 'text-green-600' : 'text-red-600'}`}>
                  {user?.isEmailVerified ? 'Sim' : 'Não'}
                </span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Forms */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2 space-y-8"
        >
          {/* Profile Form */}
          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Informações Pessoais</h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 text-coral-600 hover:text-coral-700 font-medium"
                >
                  <PencilIcon className="h-4 w-4" />
                  <span>Editar</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      profileForm.reset()
                    }}
                    className="flex items-center space-x-1 text-gray-600 hover:text-gray-700"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    <span>Cancelar</span>
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome completo
                </label>
                <input
                  {...profileForm.register('name', { 
                    required: 'Nome é obrigatório',
                    minLength: { value: 2, message: 'Nome deve ter pelo menos 2 caracteres' }
                  })}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-glass focus:bg-white/70 focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {profileForm.formState.errors.name && (
                  <p className="mt-1 text-sm text-red-600">{profileForm.formState.errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  {...profileForm.register('email', { 
                    required: 'Email é obrigatório',
                    validate: (value) => isEmail(value) || 'Email inválido'
                  })}
                  disabled={!isEditing}
                  type="email"
                  className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-glass focus:bg-white/70 focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {profileForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">{profileForm.formState.errors.email.message}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone <span className="text-gray-500">(opcional)</span>
                </label>
                <input
                  {...profileForm.register('phone', {
                    validate: (value) => !value || isPhone(value) || 'Telefone inválido'
                  })}
                  disabled={!isEditing}
                  onChange={handlePhoneChange}
                  type="tel"
                  placeholder="(11) 9 9999-9999"
                  className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-glass focus:bg-white/70 focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {profileForm.formState.errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{profileForm.formState.errors.phone.message}</p>
                )}
              </div>

              {isEditing && (
                <div className="flex items-center space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center space-x-2 bg-gradient-to-r from-coral-500 to-coral-600 text-white px-6 py-3 rounded-glass font-medium hover:from-coral-600 hover:to-coral-700 focus:ring-2 focus:ring-coral-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <>
                        <CheckIcon className="h-4 w-4" />
                        <span>Salvar Alterações</span>
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </form>
          </GlassCard>

          {/* Password Change */}
          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Alterar Senha</h3>
              {!isChangingPassword ? (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="flex items-center space-x-2 text-coral-600 hover:text-coral-700 font-medium"
                >
                  <KeyIcon className="h-4 w-4" />
                  <span>Alterar Senha</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsChangingPassword(false)
                    passwordForm.reset()
                  }}
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-700"
                >
                  <XMarkIcon className="h-4 w-4" />
                  <span>Cancelar</span>
                </button>
              )}
            </div>

            {isChangingPassword ? (
              <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-6">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Senha atual
                  </label>
                  <div className="relative">
                    <input
                      {...passwordForm.register('currentPassword', { 
                        required: 'Senha atual é obrigatória'
                      })}
                      type={showCurrentPassword ? 'text' : 'password'}
                      className="w-full px-4 py-3 pr-12 bg-white/50 border border-white/20 rounded-glass focus:bg-white/70 focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordForm.formState.errors.currentPassword.message}</p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nova senha
                  </label>
                  <div className="relative">
                    <input
                      {...passwordForm.register('newPassword', { 
                        required: 'Nova senha é obrigatória',
                        minLength: { value: 6, message: 'Nova senha deve ter pelo menos 6 caracteres' }
                      })}
                      type={showNewPassword ? 'text' : 'password'}
                      className="w-full px-4 py-3 pr-12 bg-white/50 border border-white/20 rounded-glass focus:bg-white/70 focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {passwordForm.formState.errors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordForm.formState.errors.newPassword.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar nova senha
                  </label>
                  <div className="relative">
                    <input
                      {...passwordForm.register('confirmPassword', { 
                        required: 'Confirmação de senha é obrigatória'
                      })}
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="w-full px-4 py-3 pr-12 bg-white/50 border border-white/20 rounded-glass focus:bg-white/70 focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={passwordLoading}
                  className="flex items-center space-x-2 bg-gradient-to-r from-coral-500 to-coral-600 text-white px-6 py-3 rounded-glass font-medium hover:from-coral-600 hover:to-coral-700 focus:ring-2 focus:ring-coral-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {passwordLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Alterando...</span>
                    </>
                  ) : (
                    <>
                      <KeyIcon className="h-4 w-4" />
                      <span>Alterar Senha</span>
                    </>
                  )}
                </motion.button>
              </form>
            ) : (
              <p className="text-gray-600">
                Por segurança, recomendamos alterar sua senha regularmente.
              </p>
            )}
          </GlassCard>

          {/* Danger Zone */}
          <GlassCard className="border-red-200">
            <div className="flex items-start space-x-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 mb-2">Zona de Perigo</h3>
                <p className="text-red-700 mb-4">
                  Ao excluir sua conta, todos os seus dados serão permanentemente removidos. 
                  Esta ação não pode ser desfeita.
                </p>
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-glass font-medium hover:bg-red-700 transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                  <span>Excluir Conta</span>
                </button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Delete Account Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md"
          >
            <GlassCard className="p-6">
              <div className="text-center">
                <ExclamationTriangleIcon className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Excluir Conta
                </h3>
                <p className="text-gray-600 mb-6">
                  Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita 
                  e todos os seus dados serão permanentemente removidos.
                </p>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowDeleteDialog(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-glass font-medium hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-glass font-medium hover:bg-red-700 transition-colors"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </div>
  )
}