/**
 * PetDetailScreen - Tela de detalhes do pet
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { GlassContainer } from '../../components/ui/GlassContainer';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';
import { PetService } from '../../services/PetService';
import { HealthService } from '../../services/HealthService';

interface Pet {
  _id: string;
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed: string;
  birthDate: string;
  weight: number;
  height: number;
  gender: 'male' | 'female';
  isNeutered: boolean;
  avatar?: string;
  microchipId?: string;
  medicalConditions?: string[];
  allergies?: string[];
  imc?: {
    value: number;
    classification: string;
  };
}

interface HealthStats {
  totalRecords: number;
  lastWeight?: number;
  averageActivity: number;
  lastUpdate: string;
}

export const PetDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { petId } = route.params as { petId: string };

  const [pet, setPet] = useState<Pet | null>(null);
  const [healthStats, setHealthStats] = useState<HealthStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadPetData();
    }, [])
  );

  const loadPetData = async () => {
    try {
      const [petResponse, statsResponse, imcResponse] = await Promise.all([
        PetService.getPetById(petId),
        HealthService.getPetHealthStats(petId, 30),
        PetService.calculatePetIMC(petId)
      ]);

      const petData = petResponse.data.data;
      setPet({
        ...petData,
        imc: imcResponse.data.data
      });
      
      setHealthStats(statsResponse.data.data);
    } catch (error) {
      console.error('Erro ao carregar dados do pet:', error);
      Alert.alert('Erro', 'Falha ao carregar dados do pet');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPetData();
  };

  const getAgeFromBirthDate = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - birth.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'mês' : 'meses'}`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} ${years === 1 ? 'ano' : 'anos'}`;
    }
  };

  const getSpeciesIcon = (species: string) => {
    switch (species) {
      case 'dog': return 'paw';
      case 'cat': return 'paw';
      default: return 'heart';
    }
  };

  const getIMCColor = (classification: string) => {
    switch (classification.toLowerCase()) {
      case 'abaixo do peso':
        return COLORS.system.warning;
      case 'peso ideal':
        return COLORS.system.success;
      case 'sobrepeso':
        return COLORS.system.warning;
      case 'obesidade':
        return COLORS.system.error;
      default:
        return COLORS.system.text.secondary;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary.coral} />
        <Text style={styles.loadingText}>Carregando dados do pet...</Text>
      </View>
    );
  }

  if (!pet) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color={COLORS.system.error} />
        <Text style={styles.errorText}>Pet não encontrado</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.primary.coral}
        />
      }
    >
      {/* Header com foto e nome */}
      <GlassContainer variant="widget" style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <View style={styles.petImageContainer}>
            {pet.avatar ? (
              <Image source={{ uri: pet.avatar }} style={styles.petImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons 
                  name={getSpeciesIcon(pet.species)} 
                  size={48} 
                  color={COLORS.system.text.secondary} 
                />
              </View>
            )}
          </View>
          
          <View style={styles.petInfo}>
            <Text style={styles.petName}>{pet.name}</Text>
            <Text style={styles.petBreed}>{pet.breed}</Text>
            <Text style={styles.petAge}>{getAgeFromBirthDate(pet.birthDate)}</Text>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditPet', { petId: pet._id })}
          >
            <Ionicons name="pencil" size={20} color={COLORS.primary.coral} />
          </TouchableOpacity>
        </View>
      </GlassContainer>

      {/* Informações básicas */}
      <GlassContainer variant="widget" style={styles.infoContainer}>
        <Text style={styles.sectionTitle}>Informações Básicas</Text>
        
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Ionicons name="scale" size={20} color={COLORS.primary.coral} />
            <Text style={styles.infoLabel}>Peso</Text>
            <Text style={styles.infoValue}>{pet.weight} kg</Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="resize" size={20} color={COLORS.primary.teal} />
            <Text style={styles.infoLabel}>Altura</Text>
            <Text style={styles.infoValue}>{pet.height} cm</Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="male-female" size={20} color={COLORS.primary.coral} />
            <Text style={styles.infoLabel}>Gênero</Text>
            <Text style={styles.infoValue}>
              {pet.gender === 'male' ? 'Macho' : 'Fêmea'}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="medical" size={20} color={COLORS.primary.teal} />
            <Text style={styles.infoLabel}>Castrado</Text>
            <Text style={styles.infoValue}>
              {pet.isNeutered ? 'Sim' : 'Não'}
            </Text>
          </View>
        </View>

        {pet.microchipId && (
          <View style={styles.microchipContainer}>
            <Ionicons name="hardware-chip" size={20} color={COLORS.system.text.secondary} />
            <Text style={styles.microchipText}>Microchip: {pet.microchipId}</Text>
          </View>
        )}
      </GlassContainer>

      {/* IMC */}
      {pet.imc && (
        <GlassContainer variant="widget" style={styles.imcContainer}>
          <Text style={styles.sectionTitle}>Índice de Massa Corporal</Text>
          
          <View style={styles.imcContent}>
            <View style={styles.imcValue}>
              <Text style={styles.imcNumber}>{pet.imc.value.toFixed(1)}</Text>
              <Text style={[
                styles.imcClassification,
                { color: getIMCColor(pet.imc.classification) }
              ]}>
                {pet.imc.classification}
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.imcButton}
              onPress={() => navigation.navigate('Health', { 
                screen: 'AddHealthRecord', 
                params: { petId: pet._id } 
              })}
            >
              <Text style={styles.imcButtonText}>Registrar Peso</Text>
            </TouchableOpacity>
          </View>
        </GlassContainer>
      )}

      {/* Estatísticas de saúde */}
      {healthStats && (
        <GlassContainer variant="widget" style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Resumo de Saúde (30 dias)</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{healthStats.totalRecords}</Text>
              <Text style={styles.statLabel}>Registros</Text>
            </View>
            
            {healthStats.lastWeight && (
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{healthStats.lastWeight} kg</Text>
                <Text style={styles.statLabel}>Último Peso</Text>
              </View>
            )}
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{healthStats.averageActivity.toFixed(0)}</Text>
              <Text style={styles.statLabel}>Min/Dia Atividade</Text>
            </View>
          </View>
        </GlassContainer>
      )}

      {/* Ações rápidas */}
      <GlassContainer variant="widget" style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Health', { 
              screen: 'AddHealthRecord', 
              params: { petId: pet._id } 
            })}
          >
            <Ionicons name="add-circle" size={24} color={COLORS.primary.coral} />
            <Text style={styles.actionText}>Novo Registro</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Health', { 
              screen: 'PetHealthHistory', 
              params: { petId: pet._id } 
            })}
          >
            <Ionicons name="bar-chart" size={24} color={COLORS.primary.teal} />
            <Text style={styles.actionText}>Histórico</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Scanner')}
          >
            <Ionicons name="camera" size={24} color={COLORS.primary.coral} />
            <Text style={styles.actionText}>Escanear</Text>
          </TouchableOpacity>
        </View>
      </GlassContainer>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.system.background,
    padding: SPACING.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.system.background,
  },
  loadingText: {
    marginTop: SPACING.lg,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.system.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.system.background,
    padding: SPACING['3xl'],
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.system.text.primary,
    marginTop: SPACING.lg,
    marginBottom: SPACING['2xl'],
  },
  backButton: {
    backgroundColor: COLORS.primary.coral,
    paddingHorizontal: SPACING['2xl'],
    paddingVertical: SPACING.md,
    borderRadius: 8,
  },
  backButtonText: {
    color: COLORS.system.text.inverse,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
  },
  headerContainer: {
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  petImageContainer: {
    marginRight: SPACING.lg,
  },
  petImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.glass.modal,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.system.border.light,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.system.text.primary,
    marginBottom: SPACING.xs,
  },
  petBreed: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.system.text.secondary,
    marginBottom: 2,
  },
  petAge: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.system.text.secondary,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.glass.widget,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.system.border.light,
  },
  infoContainer: {
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.system.text.primary,
    marginBottom: SPACING.lg,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    backgroundColor: COLORS.glass.widget,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.system.border.light,
  },
  infoLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.system.text.secondary,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  infoValue: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: COLORS.system.text.primary,
  },
  microchipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glass.widget,
    borderRadius: 12,
    padding: SPACING.lg,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.system.border.light,
  },
  microchipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.system.text.secondary,
    marginLeft: SPACING.sm,
  },
  imcContainer: {
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  imcContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imcValue: {
    alignItems: 'center',
  },
  imcNumber: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.system.text.primary,
  },
  imcClassification: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    marginTop: SPACING.xs,
  },
  imcButton: {
    backgroundColor: COLORS.primary.coral,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 8,
  },
  imcButtonText: {
    color: COLORS.system.text.inverse,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
  },
  statsContainer: {
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.system.text.primary,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.system.text.secondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  actionsContainer: {
    padding: SPACING.xl,
    marginBottom: SPACING['3xl'],
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: COLORS.glass.widget,
    borderRadius: 12,
    padding: SPACING.lg,
    width: '30%',
    borderWidth: 1,
    borderColor: COLORS.system.border.light,
  },
  actionText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.system.text.primary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
});