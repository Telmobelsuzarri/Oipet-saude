/**
 * HomeScreen - Tela principal do dashboard
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Redux
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchUserPets } from '@/store/slices/petSlice';
import { fetchUnreadNotifications } from '@/store/slices/notificationSlice';

// Components
import { OiPetLogo } from '@/components/ui/OiPetLogo';
import { GlassWidget, GlassContainer } from '@/components/ui/GlassContainer';

// Constants
import { COLORS, TYPOGRAPHY, SPACING } from '@/constants/theme';

/**
 * Tela principal com dashboard e widgets
 */
export const HomeScreen = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { pets, isLoading: petsLoading } = useAppSelector(state => state.pet);
  const { unreadNotifications } = useAppSelector(state => state.notification);
  
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        dispatch(fetchUserPets()),
        dispatch(fetchUnreadNotifications()),
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const renderWelcomeSection = () => (
    <View style={styles.welcomeSection}>
      <View style={styles.welcomeHeader}>
        <OiPetLogo
          size="small"
          variant="horizontal"
          color="coral"
        />
        
        {unreadNotifications.length > 0 && (
          <TouchableOpacity style={styles.notificationBadge}>
            <Ionicons name="notifications" size={20} color={COLORS.primary.coral} />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadNotifications.length}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
      
      <Text style={styles.welcomeText}>
        Olá, {user?.name || 'Pet Parent'}! 👋
      </Text>
      <Text style={styles.welcomeSubtext}>
        Como estão seus pets hoje?
      </Text>
    </View>
  );

  const renderQuickStats = () => (
    <View style={styles.statsContainer}>
      <GlassWidget style={styles.statCard}>
        <View style={styles.statContent}>
          <Ionicons name="paw" size={24} color={COLORS.primary.coral} />
          <Text style={styles.statNumber}>{pets.length}</Text>
          <Text style={styles.statLabel}>Pets</Text>
        </View>
      </GlassWidget>
      
      <GlassWidget style={styles.statCard}>
        <View style={styles.statContent}>
          <Ionicons name="heart" size={24} color={COLORS.system.success} />
          <Text style={styles.statNumber}>98%</Text>
          <Text style={styles.statLabel}>Saúde</Text>
        </View>
      </GlassWidget>
      
      <GlassWidget style={styles.statCard}>
        <View style={styles.statContent}>
          <Ionicons name="fitness" size={24} color={COLORS.primary.teal} />
          <Text style={styles.statNumber}>5</Text>
          <Text style={styles.statLabel}>Atividades</Text>
        </View>
      </GlassWidget>
    </View>
  );

  const renderRecentPets = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Seus Pets</Text>
      
      {pets.length === 0 ? (
        <GlassContainer style={styles.emptyState}>
          <Ionicons name="paw-outline" size={48} color={COLORS.system.text.secondary} />
          <Text style={styles.emptyStateTitle}>Nenhum pet cadastrado</Text>
          <Text style={styles.emptyStateText}>
            Adicione seu primeiro pet para começar a monitorar sua saúde
          </Text>
          <TouchableOpacity style={styles.addPetButton}>
            <Text style={styles.addPetButtonText}>Adicionar Pet</Text>
          </TouchableOpacity>
        </GlassContainer>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {pets.slice(0, 5).map((pet) => (
            <GlassWidget key={pet._id} style={styles.petCard}>
              <View style={styles.petAvatar}>
                <Ionicons 
                  name={pet.species === 'dog' ? 'paw' : pet.species === 'cat' ? 'paw' : 'heart'} 
                  size={24} 
                  color={COLORS.primary.coral} 
                />
              </View>
              <Text style={styles.petName}>{pet.name}</Text>
              <Text style={styles.petInfo}>{pet.breed}</Text>
              <Text style={styles.petAge}>{pet.age} anos</Text>
            </GlassWidget>
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Ações Rápidas</Text>
      
      <View style={styles.actionsGrid}>
        <TouchableOpacity style={styles.actionCard}>
          <GlassWidget style={styles.actionButton}>
            <Ionicons name="add-circle" size={28} color={COLORS.primary.coral} />
            <Text style={styles.actionText}>Adicionar Registro</Text>
          </GlassWidget>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionCard}>
          <GlassWidget style={styles.actionButton}>
            <Ionicons name="camera" size={28} color={COLORS.primary.teal} />
            <Text style={styles.actionText}>Escanear Alimento</Text>
          </GlassWidget>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionCard}>
          <GlassWidget style={styles.actionButton}>
            <Ionicons name="calendar" size={28} color={COLORS.system.warning} />
            <Text style={styles.actionText}>Agendar Lembrete</Text>
          </GlassWidget>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionCard}>
          <GlassWidget style={styles.actionButton}>
            <Ionicons name="analytics" size={28} color={COLORS.system.info} />
            <Text style={styles.actionText}>Ver Relatórios</Text>
          </GlassWidget>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary.coral}
            colors={[COLORS.primary.coral]}
          />
        }
      >
        {renderWelcomeSection()}
        {renderQuickStats()}
        {renderRecentPets()}
        {renderQuickActions()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.system.background,
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100, // Space for tab bar
  },
  
  welcomeSection: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  
  notificationBadge: {
    position: 'relative',
  },
  
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.system.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  badgeText: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.system.text.inverse,
  },
  
  welcomeText: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.system.text.primary,
    marginBottom: SPACING.xs,
  },
  
  welcomeSubtext: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.system.text.secondary,
  },
  
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  
  statCard: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  
  statContent: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  
  statNumber: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.system.text.primary,
    marginTop: SPACING.sm,
  },
  
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.system.text.secondary,
    marginTop: SPACING.xs,
  },
  
  section: {
    marginBottom: SPACING.xl,
  },
  
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: COLORS.system.text.primary,
    marginBottom: SPACING.lg,
  },
  
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING['3xl'],
  },
  
  emptyStateTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: COLORS.system.text.primary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  
  emptyStateText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.system.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: TYPOGRAPHY.lineHeight.normal * TYPOGRAPHY.fontSize.base,
  },
  
  addPetButton: {
    backgroundColor: COLORS.primary.coral,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 12,
  },
  
  addPetButtonText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: COLORS.system.text.inverse,
  },
  
  petCard: {
    width: 120,
    marginRight: SPACING.md,
  },
  
  petAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.system.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    alignSelf: 'center',
  },
  
  petName: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: COLORS.system.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  
  petInfo: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.system.text.secondary,
    textAlign: 'center',
  },
  
  petAge: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.primary.coral,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  actionCard: {
    width: '48%',
    marginBottom: SPACING.md,
  },
  
  actionButton: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  
  actionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.system.text.primary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
});