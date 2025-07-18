/**
 * HealthScreen - Dashboard de saúde dos pets
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { GlassContainer } from '../../components/ui/GlassContainer';
import { COLORS } from '../../constants/theme';
import { PetService } from '../../services/PetService';
import { HealthService } from '../../services/HealthService';

interface Pet {
  _id: string;
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed: string;
  weight: number;
  height: number;
  avatar?: string;
}

interface PetHealthSummary extends Pet {
  lastRecord?: {
    date: string;
    weight?: number;
    mood?: string;
  };
  imc?: {
    value: number;
    classification: string;
  };
  stats?: {
    totalRecords: number;
    averageActivity: number;
  };
}

export const HealthScreen: React.FC = () => {
  const navigation = useNavigation();
  const [pets, setPets] = useState<PetHealthSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadPetsHealthData();
    }, [])
  );

  const loadPetsHealthData = async () => {
    try {
      const petsResponse = await PetService.getUserPets();
      const petsData = petsResponse.data.data.pets || [];

      const petsWithHealth = await Promise.all(
        petsData.map(async (pet: Pet) => {
          try {
            const [healthRecords, imcData, statsData] = await Promise.all([
              HealthService.getPetHealthRecords(pet._id, 1, 1),
              PetService.calculatePetIMC(pet._id),
              HealthService.getPetHealthStats(pet._id, 30)
            ]);

            const lastRecord = healthRecords.data.data.records?.[0];
            
            return {
              ...pet,
              lastRecord,
              imc: imcData.data.data,
              stats: statsData.data.data,
            };
          } catch (error) {
            console.error(`Erro ao carregar dados do pet ${pet.name}:`, error);
            return pet;
          }
        })
      );

      setPets(petsWithHealth);
    } catch (error) {
      console.error('Erro ao carregar pets:', error);
      Alert.alert('Erro', 'Falha ao carregar dados de saúde');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPetsHealthData();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  const getMoodEmoji = (mood?: string) => {
    switch (mood) {
      case 'very_sad': return '😢';
      case 'sad': return '😟';
      case 'neutral': return '😐';
      case 'happy': return '😊';
      case 'very_happy': return '😍';
      default: return '😐';
    }
  };

  const getIMCColor = (classification: string) => {
    switch (classification.toLowerCase()) {
      case 'abaixo do peso':
        return COLORS.semantic.warning;
      case 'peso ideal':
        return COLORS.semantic.success;
      case 'sobrepeso':
        return COLORS.semantic.warning;
      case 'obesidade':
        return COLORS.semantic.error;
      default:
        return COLORS.text.secondary;
    }
  };

  const renderPetHealthCard = ({ item }: { item: PetHealthSummary }) => (
    <TouchableOpacity
      style={styles.petCard}
      onPress={() => navigation.navigate('PetHealthHistory', { petId: item._id })}
    >
      <GlassContainer variant="widget" style={styles.cardContent}>
        <View style={styles.petHeader}>
          <View style={styles.petInfo}>
            <Text style={styles.petName}>{item.name}</Text>
            <Text style={styles.petBreed}>{item.breed}</Text>
          </View>

          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                navigation.navigate('AddHealthRecord', { petId: item._id });
              }}
            >
              <Ionicons name="add-circle" size={20} color={COLORS.primary.coral} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.healthData}>
          {/* IMC */}
          {item.imc && (
            <View style={styles.imcContainer}>
              <Text style={styles.imcLabel}>IMC</Text>
              <Text style={styles.imcValue}>{item.imc.value.toFixed(1)}</Text>
              <Text style={[
                styles.imcClassification,
                { color: getIMCColor(item.imc.classification) }
              ]}>
                {item.imc.classification}
              </Text>
            </View>
          )}

          {/* Último Registro */}
          <View style={styles.lastRecordContainer}>
            <Text style={styles.lastRecordLabel}>Último Registro</Text>
            {item.lastRecord ? (
              <View>
                <Text style={styles.lastRecordDate}>
                  {formatDate(item.lastRecord.date)}
                </Text>
                <View style={styles.lastRecordData}>
                  {item.lastRecord.weight && (
                    <Text style={styles.lastRecordValue}>
                      {item.lastRecord.weight} kg
                    </Text>
                  )}
                  {item.lastRecord.mood && (
                    <Text style={styles.moodEmoji}>
                      {getMoodEmoji(item.lastRecord.mood)}
                    </Text>
                  )}
                </View>
              </View>
            ) : (
              <Text style={styles.noRecords}>Nenhum registro</Text>
            )}
          </View>
        </View>

        {/* Estatísticas */}
        {item.stats && (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{item.stats.totalRecords}</Text>
              <Text style={styles.statLabel}>Registros</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{item.stats.averageActivity.toFixed(0)}</Text>
              <Text style={styles.statLabel}>Min/Dia</Text>
            </View>
          </View>
        )}
      </GlassContainer>
    </TouchableOpacity>
  );

  const renderHealthOverview = () => {
    const totalPets = pets.length;
    const petsWithRecords = pets.filter(pet => pet.stats?.totalRecords > 0).length;
    const totalRecords = pets.reduce((sum, pet) => sum + (pet.stats?.totalRecords || 0), 0);
    const averageActivity = pets.reduce((sum, pet) => sum + (pet.stats?.averageActivity || 0), 0) / (pets.length || 1);

    return (
      <GlassContainer variant="widget" style={styles.overviewContainer}>
        <Text style={styles.overviewTitle}>Resumo Geral</Text>
        
        <View style={styles.overviewStats}>
          <View style={styles.overviewStat}>
            <Text style={styles.overviewValue}>{totalPets}</Text>
            <Text style={styles.overviewLabel}>Pets</Text>
          </View>
          
          <View style={styles.overviewStat}>
            <Text style={styles.overviewValue}>{petsWithRecords}</Text>
            <Text style={styles.overviewLabel}>Com Registros</Text>
          </View>
          
          <View style={styles.overviewStat}>
            <Text style={styles.overviewValue}>{totalRecords}</Text>
            <Text style={styles.overviewLabel}>Total Registros</Text>
          </View>
          
          <View style={styles.overviewStat}>
            <Text style={styles.overviewValue}>{averageActivity.toFixed(0)}</Text>
            <Text style={styles.overviewLabel}>Média Atividade</Text>
          </View>
        </View>
      </GlassContainer>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <GlassContainer variant="widget" style={styles.emptyContent}>
        <Ionicons name="medical" size={64} color={COLORS.text.secondary} />
        <Text style={styles.emptyTitle}>Nenhum pet encontrado</Text>
        <Text style={styles.emptyMessage}>
          Adicione um pet primeiro para começar a monitorar sua saúde
        </Text>
        
        <TouchableOpacity
          style={styles.addPetButton}
          onPress={() => navigation.navigate('AddPet')}
        >
          <Ionicons name="add" size={24} color={COLORS.background.primary} />
          <Text style={styles.addPetButtonText}>Adicionar Pet</Text>
        </TouchableOpacity>
      </GlassContainer>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Saúde dos Pets</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary.coral}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {pets.length > 0 ? (
          <>
            {renderHealthOverview()}
            
            <Text style={styles.sectionTitle}>Seus Pets</Text>
            
            <FlatList
              data={pets}
              renderItem={renderPetHealthCard}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </>
        ) : (
          !loading && renderEmptyState()
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  content: {
    flex: 1,
  },
  overviewContainer: {
    padding: 20,
    marginBottom: 24,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  overviewStat: {
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  overviewLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  petCard: {
    marginBottom: 16,
  },
  cardContent: {
    padding: 16,
  },
  petHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  petBreed: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  quickActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.glass.widget,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.primary,
  },
  healthData: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  imcContainer: {
    alignItems: 'center',
    flex: 1,
  },
  imcLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  imcValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  imcClassification: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  lastRecordContainer: {
    alignItems: 'center',
    flex: 1,
  },
  lastRecordLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  lastRecordDate: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  lastRecordData: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    gap: 8,
  },
  lastRecordValue: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  moodEmoji: {
    fontSize: 16,
  },
  noRecords: {
    fontSize: 12,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.primary,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyContent: {
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  addPetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary.coral,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addPetButtonText: {
    color: COLORS.background.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
});