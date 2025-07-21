/**
 * ProfileScreen - Tela de perfil do usuário
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Switch 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Redux
import { useAppDispatch, useAppSelector } from '@/store';
import { logoutUser } from '@/store/slices/authSlice';

// Components
import { GlassContainer } from '@/components/ui/GlassContainer';
import { OiPetLogo } from '@/components/ui/OiPetLogo';

// Constants
import { COLORS, TYPOGRAPHY, SPACING } from '@/constants/theme';

/**
 * Tela de perfil com configurações e opções
 */
export const ProfileScreen = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    autoSync: true,
    analytics: true,
  });

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => {
            dispatch(logoutUser());
          },
        },
      ],
    );
  };

  const renderProfileHeader = () => (
    <GlassContainer style={styles.headerContainer}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatarPlaceholder}>
          <Ionicons name="person" size={40} color={COLORS.primary.coral} />
        </View>
      </View>
      
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user?.name || 'Usuário'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'usuario@email.com'}</Text>
      </View>
      
      <TouchableOpacity style={styles.editButton}>
        <Ionicons name="pencil" size={20} color={COLORS.primary.coral} />
      </TouchableOpacity>
    </GlassContainer>
  );

  const renderMenuSection = (title: string, items: any[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <GlassContainer style={styles.menuContainer}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.menuItem,
              index < items.length - 1 && styles.menuItemBorder
            ]}
            onPress={item.onPress}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={styles.menuItemText}>{item.title}</Text>
            </View>
            
            {item.toggle ? (
              <Switch
                value={settings[item.key as keyof typeof settings]}
                onValueChange={(value) => 
                  setSettings(prev => ({ ...prev, [item.key]: value }))
                }
                trackColor={{ false: COLORS.glass.widget, true: COLORS.primary.coral }}
              />
            ) : (
              <Ionicons name="chevron-forward" size={20} color={COLORS.system.text.secondary} />
            )}
          </TouchableOpacity>
        ))}
      </GlassContainer>
    </View>
  );

  const accountItems = [
    {
      title: 'Editar Perfil',
      icon: 'person-circle',
      color: COLORS.primary.coral,
      onPress: () => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento'),
    },
    {
      title: 'Segurança',
      icon: 'shield-checkmark',
      color: COLORS.system.success,
      onPress: () => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento'),
    },
    {
      title: 'Privacidade',
      icon: 'eye-off',
      color: COLORS.system.warning,
      onPress: () => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento'),
    },
  ];

  const settingsItems = [
    {
      title: 'Notificações',
      icon: 'notifications',
      color: COLORS.primary.teal,
      key: 'notifications',
      toggle: true,
    },
    {
      title: 'Modo Escuro',
      icon: 'moon',
      color: COLORS.system.text.secondary,
      key: 'darkMode',
      toggle: true,
    },
    {
      title: 'Sincronização Automática',
      icon: 'sync',
      color: COLORS.system.info,
      key: 'autoSync',
      toggle: true,
    },
    {
      title: 'Análise de Dados',
      icon: 'analytics',
      color: COLORS.system.warning,
      key: 'analytics',
      toggle: true,
    },
  ];

  const supportItems = [
    {
      title: 'Central de Ajuda',
      icon: 'help-circle',
      color: COLORS.system.info,
      onPress: () => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento'),
    },
    {
      title: 'Fale Conosco',
      icon: 'chatbubble',
      color: COLORS.primary.teal,
      onPress: () => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento'),
    },
    {
      title: 'Avaliar App',
      icon: 'star',
      color: COLORS.system.warning,
      onPress: () => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderProfileHeader()}
        
        {renderMenuSection('Conta', accountItems)}
        {renderMenuSection('Configurações', settingsItems)}
        {renderMenuSection('Suporte', supportItems)}
        
        {/* Logout Button */}
        <GlassContainer style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={24} color={COLORS.system.error} />
            <Text style={styles.logoutText}>Sair da Conta</Text>
          </TouchableOpacity>
        </GlassContainer>
        
        {/* App Info */}
        <View style={styles.appInfo}>
          <OiPetLogo size="small" variant="horizontal" color="coral" />
          <Text style={styles.versionText}>Versão 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.system.background,
  },
  
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  
  avatarContainer: {
    marginRight: SPACING.lg,
  },
  
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.system.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.system.border.light,
  },
  
  userInfo: {
    flex: 1,
  },
  
  userName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.system.text.primary,
    marginBottom: SPACING.xs,
  },
  
  userEmail: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.system.text.secondary,
  },
  
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.system.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.system.border.light,
  },
  
  section: {
    marginBottom: SPACING.xl,
  },
  
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: COLORS.system.text.primary,
    marginBottom: SPACING.md,
  },
  
  menuContainer: {
    paddingVertical: SPACING.xs,
  },
  
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.system.border.light,
  },
  
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  
  menuItemText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.system.text.primary,
  },
  
  logoutContainer: {
    marginBottom: SPACING.xl,
  },
  
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  
  logoutText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: COLORS.system.error,
    marginLeft: SPACING.sm,
  },
  
  appInfo: {
    alignItems: 'center',
    paddingBottom: SPACING['3xl'],
  },
  
  versionText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.system.text.secondary,
    marginTop: SPACING.sm,
  },
});