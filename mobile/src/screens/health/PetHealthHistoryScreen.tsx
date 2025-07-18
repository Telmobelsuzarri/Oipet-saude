/**
 * PetHealthHistoryScreen - Tela de histórico de saúde do pet
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { GlassContainer } from '../../components/ui/GlassContainer';
import { COLORS } from '../../constants/theme';
import { HealthService } from '../../services/HealthService';

interface HealthRecord {
  _id: string;
  date: string;
  weight?: number;
  height?: number;
  activity?: {
    type: string;
    duration: number;
    intensity: 'low' | 'medium' | 'high';
    calories?: number;
  };
  feeding?: {
    food: string;
    amount: number;
    calories: number;
    time?: string;
  };
  water?: {
    amount: number;
    times: number;
  };
  sleep?: {
    duration: number;
    quality: 'poor' | 'fair' | 'good' | 'excellent';
  };
  mood?: 'very_sad' | 'sad' | 'neutral' | 'happy' | 'very_happy';
  symptoms?: string[];
  vitals?: {
    temperature?: number;
    heartRate?: number;
    respiratoryRate?: number;
  };
  notes?: string;
}

export const PetHealthHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { petId } = route.params as { petId: string };

  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadHealthRecords(true);
    }, [])
  );

  const loadHealthRecords = async (reset = false) => {
    try {
      const currentPage = reset ? 1 : page;
      const response = await HealthService.getPetHealthRecords(petId, currentPage, 20);
      const newRecords = response.data.data.records || [];

      if (reset) {
        setRecords(newRecords);
        setPage(2);
      } else {
        setRecords(prev => [...prev, ...newRecords]);
        setPage(prev => prev + 1);
      }

      setHasMore(newRecords.length === 20);
    } catch (error) {
      console.error('Erro ao carregar registros:', error);
      Alert.alert('Erro', 'Falha ao carregar histórico de saúde');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadHealthRecords(true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadHealthRecords(false);
    }
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

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'low': return COLORS.semantic.success;
      case 'medium': return COLORS.semantic.warning;
      case 'high': return COLORS.semantic.error;
      default: return COLORS.text.secondary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderHealthRecord = ({ item }: { item: HealthRecord }) => (
    <TouchableOpacity style={styles.recordCard}>
      <GlassContainer variant="widget" style={styles.cardContent}>
        <View style={styles.recordHeader}>
          <View>
            <Text style={styles.recordDate}>{formatDate(item.date)}</Text>
            <Text style={styles.recordTime}>{formatTime(item.date)}</Text>
          </View>
          
          {item.mood && (
            <View style={styles.moodContainer}>
              <Text style={styles.moodEmoji}>{getMoodEmoji(item.mood)}</Text>
            </View>
          )}
        </View>

        <View style={styles.recordData}>
          {/* Peso e Altura */}
          {(item.weight || item.height) && (
            <View style={styles.dataSection}>
              <Text style={styles.sectionTitle}>Medidas</Text>
              <View style={styles.dataRow}>
                {item.weight && (
                  <View style={styles.dataItem}>
                    <Ionicons name="scale" size={16} color={COLORS.primary.coral} />
                    <Text style={styles.dataValue}>{item.weight} kg</Text>
                  </View>
                )}
                {item.height && (
                  <View style={styles.dataItem}>
                    <Ionicons name="resize" size={16} color={COLORS.primary.teal} />
                    <Text style={styles.dataValue}>{item.height} cm</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Atividade */}
          {item.activity && (
            <View style={styles.dataSection}>
              <Text style={styles.sectionTitle}>Atividade</Text>
              <View style={styles.activityInfo}>
                <Text style={styles.activityType}>{item.activity.type}</Text>
                <View style={styles.activityDetails}>
                  <Text style={styles.activityDuration}>
                    {item.activity.duration} min
                  </Text>
                  <View style={[
                    styles.intensityBadge,
                    { backgroundColor: getIntensityColor(item.activity.intensity) }
                  ]}>
                    <Text style={styles.intensityText}>
                      {item.activity.intensity.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Alimentação */}
          {item.feeding && (
            <View style={styles.dataSection}>
              <Text style={styles.sectionTitle}>Alimentação</Text>
              <Text style={styles.feedingFood}>{item.feeding.food}</Text>
              <Text style={styles.feedingAmount}>
                {item.feeding.amount}g • {item.feeding.calories} cal
              </Text>
            </View>
          )}

          {/* Água */}
          {item.water && (
            <View style={styles.dataSection}>
              <Text style={styles.sectionTitle}>Hidratação</Text>
              <Text style={styles.waterInfo}>
                {item.water.amount}ml em {item.water.times} vezes
              </Text>
            </View>
          )}

          {/* Sono */}
          {item.sleep && (
            <View style={styles.dataSection}>
              <Text style={styles.sectionTitle}>Sono</Text>
              <Text style={styles.sleepInfo}>
                {item.sleep.duration}h - {item.sleep.quality}
              </Text>
            </View>
          )}

          {/* Sintomas */}
          {item.symptoms && item.symptoms.length > 0 && (
            <View style={styles.dataSection}>
              <Text style={styles.sectionTitle}>Sintomas</Text>
              <View style={styles.symptomsContainer}>
                {item.symptoms.map((symptom, index) => (
                  <View key={index} style={styles.symptomTag}>
                    <Text style={styles.symptomText}>{symptom}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Notas */}
          {item.notes && (
            <View style={styles.dataSection}>
              <Text style={styles.sectionTitle}>Observações</Text>
              <Text style={styles.notesText}>{item.notes}</Text>
            </View>
          )}
        </View>
      </GlassContainer>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <GlassContainer variant="widget" style={styles.emptyContent}>
        <Ionicons name="medical" size={64} color={COLORS.text.secondary} />
        <Text style={styles.emptyTitle}>Nenhum registro encontrado</Text>
        <Text style={styles.emptyMessage}>
          Comece a registrar informações de saúde do seu pet para acompanhar seu bem-estar
        </Text>
        
        <TouchableOpacity
          style={styles.addRecordButton}
          onPress={() => navigation.navigate('AddHealthRecord', { petId })}
        >
          <Ionicons name="add" size={24} color={COLORS.background.primary} />
          <Text style={styles.addRecordButtonText}>Primeiro Registro</Text>
        </TouchableOpacity>
      </GlassContainer>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Histórico de Saúde</Text>
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddHealthRecord', { petId })}
        >
          <Ionicons name="add" size={24} color={COLORS.primary.coral} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={records}
        renderItem={renderHealthRecord}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary.coral}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={records.length === 0 ? styles.emptyList : undefined}
      />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.glass.widget,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.primary,
  },
  recordCard: {
    marginBottom: 16,
  },
  cardContent: {
    padding: 16,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recordDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  recordTime: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  moodContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.glass.widget,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.primary,
  },
  moodEmoji: {
    fontSize: 20,
  },
  recordData: {
    gap: 12,
  },
  dataSection: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  dataRow: {
    flexDirection: 'row',
    gap: 16,
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dataValue: {
    fontSize: 14,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  activityInfo: {
    gap: 4,
  },
  activityType: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  activityDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activityDuration: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  intensityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  intensityText: {
    fontSize: 10,
    color: COLORS.background.primary,
    fontWeight: '600',
  },
  feedingFood: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  feedingAmount: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  waterInfo: {
    fontSize: 14,
    color: COLORS.text.primary,
  },
  sleepInfo: {
    fontSize: 14,
    color: COLORS.text.primary,
  },
  symptomsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  symptomTag: {
    backgroundColor: COLORS.semantic.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  symptomText: {
    fontSize: 12,
    color: COLORS.background.primary,
    fontWeight: '500',
  },
  notesText: {
    fontSize: 14,
    color: COLORS.text.primary,
    lineHeight: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyList: {
    flexGrow: 1,
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
  addRecordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary.coral,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addRecordButtonText: {
    color: COLORS.background.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
});