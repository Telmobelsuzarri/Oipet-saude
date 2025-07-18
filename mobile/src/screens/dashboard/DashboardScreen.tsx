/**
 * DashboardScreen - Dashboard com gráficos e estatísticas
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { GlassContainer } from '../../components/ui/GlassContainer';
import { LineChart } from '../../components/charts/LineChart';
import { BarChart } from '../../components/charts/BarChart';
import { PieChart } from '../../components/charts/PieChart';
import { COLORS } from '../../constants/theme';
import { PetService } from '../../services/PetService';
import { HealthService } from '../../services/HealthService';

interface DashboardData {
  weightHistory: Array<{ x: number; y: number; date: string }>;
  activitySummary: Array<{ label: string; value: number }>;
  moodDistribution: Array<{ label: string; value: number; color?: string }>;
  healthOverview: {
    totalRecords: number;
    averageWeight: number;
    lastCheckup: string;
    activePets: number;
  };
}

const { width: screenWidth } = Dimensions.get('window');

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [selectedPet, setSelectedPet] = useState<string>('all');
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useFocusEffect(
    React.useCallback(() => {
      loadDashboardData();
    }, [selectedPet, timeRange])
  );

  const loadDashboardData = async () => {
    try {
      // Carregar lista de pets
      const petsResponse = await PetService.getUserPets();
      const petsData = petsResponse.data.data.pets || [];
      setPets(petsData);

      if (petsData.length === 0) {
        setDashboardData(null);
        setLoading(false);
        return;
      }

      // Determinar período em dias
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;

      if (selectedPet === 'all') {
        await loadOverallData(petsData, days);
      } else {
        await loadSinglePetData(selectedPet, days);
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      Alert.alert('Erro', 'Falha ao carregar dados do dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadOverallData = async (petsData: any[], days: number) => {
    // Dados combinados de todos os pets
    const allWeightHistory: any[] = [];
    const allActivityData: any[] = [];
    const allMoodData: any[] = [];
    let totalRecords = 0;

    for (const pet of petsData) {
      try {
        // Histórico de peso
        const weightResponse = await HealthService.getWeightHistory(pet._id, days);
        const weightHistory = weightResponse.data.data || [];
        
        weightHistory.forEach((record: any, index: number) => {
          allWeightHistory.push({
            x: index,
            y: record.weight,
            date: new Date(record.date).toLocaleDateString('pt-BR', { 
              day: '2-digit', 
              month: '2-digit' 
            }),
          });
        });

        // Dados de atividade
        const activityResponse = await HealthService.getActivitySummary(pet._id, days);
        const activityData = activityResponse.data.data || [];
        allActivityData.push(...activityData);

        // Estatísticas de saúde
        const statsResponse = await HealthService.getPetHealthStats(pet._id, days);
        totalRecords += statsResponse.data.data.totalRecords || 0;
      } catch (error) {
        console.error(`Erro ao carregar dados do pet ${pet.name}:`, error);
      }
    }

    // Processar dados de atividade
    const activitySummary = processActivityData(allActivityData);

    // Dados de humor (exemplo)
    const moodDistribution = [
      { label: 'Muito Feliz', value: 35, color: COLORS.semantic.success },
      { label: 'Feliz', value: 40, color: COLORS.primary.teal },
      { label: 'Neutro', value: 20, color: COLORS.semantic.warning },
      { label: 'Triste', value: 5, color: COLORS.semantic.error },
    ];

    setDashboardData({
      weightHistory: allWeightHistory.slice(-20), // Últimos 20 pontos
      activitySummary,
      moodDistribution,
      healthOverview: {
        totalRecords,
        averageWeight: allWeightHistory.length > 0 
          ? allWeightHistory.reduce((sum, point) => sum + point.y, 0) / allWeightHistory.length 
          : 0,
        lastCheckup: 'Há 3 dias',
        activePets: petsData.length,
      },
    });
  };

  const loadSinglePetData = async (petId: string, days: number) => {
    try {
      const [weightResponse, activityResponse, statsResponse] = await Promise.all([
        HealthService.getWeightHistory(petId, days),
        HealthService.getActivitySummary(petId, days),
        HealthService.getPetHealthStats(petId, days)
      ]);

      const weightHistory = weightResponse.data.data || [];
      const activityData = activityResponse.data.data || [];
      const stats = statsResponse.data.data || {};

      // Processar histórico de peso
      const processedWeightHistory = weightHistory.map((record: any, index: number) => ({
        x: index,
        y: record.weight,
        date: new Date(record.date).toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit' 
        }),
      }));

      // Processar dados de atividade
      const activitySummary = processActivityData(activityData);

      // Mock de dados de humor para pet individual
      const moodDistribution = [
        { label: 'Muito Feliz', value: 8, color: COLORS.semantic.success },
        { label: 'Feliz', value: 12, color: COLORS.primary.teal },
        { label: 'Neutro', value: 6, color: COLORS.semantic.warning },
        { label: 'Triste', value: 1, color: COLORS.semantic.error },
      ];

      setDashboardData({
        weightHistory: processedWeightHistory,
        activitySummary,
        moodDistribution,
        healthOverview: {
          totalRecords: stats.totalRecords || 0,
          averageWeight: processedWeightHistory.length > 0 
            ? processedWeightHistory.reduce((sum, point) => sum + point.y, 0) / processedWeightHistory.length 
            : 0,
          lastCheckup: 'Há 5 dias',
          activePets: 1,
        },
      });
    } catch (error) {
      console.error('Erro ao carregar dados do pet:', error);
    }
  };

  const processActivityData = (rawData: any[]) => {
    // Processar dados de atividade em formato para gráfico de barras
    const activityTypes = ['Caminhada', 'Corrida', 'Brincadeira', 'Natação', 'Outros'];
    return activityTypes.map(type => ({
      label: type,
      value: Math.random() * 60 + 20, // Mock data
    }));
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const renderPetSelector = () => (
    <GlassContainer variant="widget" style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>Visualizar dados de:</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petSelector}>
        <TouchableOpacity
          style={[
            styles.petOption,
            selectedPet === 'all' && styles.petOptionActive
          ]}
          onPress={() => setSelectedPet('all')}
        >
          <Ionicons 
            name="grid" 
            size={16} 
            color={selectedPet === 'all' ? COLORS.background.primary : COLORS.text.secondary} 
          />
          <Text style={[
            styles.petOptionText,
            selectedPet === 'all' && styles.petOptionTextActive
          ]}>
            Todos os Pets
          </Text>
        </TouchableOpacity>

        {pets.map(pet => (
          <TouchableOpacity
            key={pet._id}
            style={[
              styles.petOption,
              selectedPet === pet._id && styles.petOptionActive
            ]}
            onPress={() => setSelectedPet(pet._id)}
          >
            <Ionicons 
              name="paw" 
              size={16} 
              color={selectedPet === pet._id ? COLORS.background.primary : COLORS.text.secondary} 
            />
            <Text style={[
              styles.petOptionText,
              selectedPet === pet._id && styles.petOptionTextActive
            ]}>
              {pet.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </GlassContainer>
  );

  const renderTimeSelector = () => (
    <View style={styles.timeSelector}>
      {(['7d', '30d', '90d'] as const).map(range => (
        <TouchableOpacity
          key={range}
          style={[
            styles.timeOption,
            timeRange === range && styles.timeOptionActive
          ]}
          onPress={() => setTimeRange(range)}
        >
          <Text style={[
            styles.timeOptionText,
            timeRange === range && styles.timeOptionTextActive
          ]}>
            {range === '7d' ? '7 dias' : range === '30d' ? '30 dias' : '90 dias'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderOverviewCards = () => {
    if (!dashboardData) return null;

    const { healthOverview } = dashboardData;

    return (
      <View style={styles.overviewContainer}>
        <View style={styles.overviewRow}>
          <GlassContainer variant="widget" style={styles.overviewCard}>
            <Ionicons name="medical" size={24} color={COLORS.primary.coral} />
            <Text style={styles.overviewValue}>{healthOverview.totalRecords}</Text>
            <Text style={styles.overviewLabel}>Registros</Text>
          </GlassContainer>

          <GlassContainer variant="widget" style={styles.overviewCard}>
            <Ionicons name="scale" size={24} color={COLORS.primary.teal} />
            <Text style={styles.overviewValue}>{healthOverview.averageWeight.toFixed(1)}kg</Text>
            <Text style={styles.overviewLabel}>Peso Médio</Text>
          </GlassContainer>
        </View>

        <View style={styles.overviewRow}>
          <GlassContainer variant="widget" style={styles.overviewCard}>
            <Ionicons name="calendar" size={24} color={COLORS.semantic.success} />
            <Text style={styles.overviewValue}>{healthOverview.lastCheckup}</Text>
            <Text style={styles.overviewLabel}>Último Check-up</Text>
          </GlassContainer>

          <GlassContainer variant="widget" style={styles.overviewCard}>
            <Ionicons name="paw" size={24} color={COLORS.semantic.warning} />
            <Text style={styles.overviewValue}>{healthOverview.activePets}</Text>
            <Text style={styles.overviewLabel}>Pets Ativos</Text>
          </GlassContainer>
        </View>
      </View>
    );
  };

  if (pets.length === 0 && !loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
        </View>

        <View style={styles.emptyContainer}>
          <GlassContainer variant="widget" style={styles.emptyContent}>
            <Ionicons name="analytics" size={64} color={COLORS.text.secondary} />
            <Text style={styles.emptyTitle}>Dashboard Vazio</Text>
            <Text style={styles.emptyMessage}>
              Adicione um pet e registre dados de saúde para ver estatísticas aqui
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
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        {renderTimeSelector()}
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
        {renderPetSelector()}
        {renderOverviewCards()}

        {dashboardData && (
          <>
            {/* Gráfico de Peso */}
            <LineChart
              data={dashboardData.weightHistory}
              title="Evolução do Peso"
              yAxisLabel="Peso (kg)"
              color={COLORS.primary.coral}
              showGradient={true}
            />

            {/* Gráfico de Atividades */}
            <BarChart
              data={dashboardData.activitySummary}
              title="Atividades por Tipo"
              yAxisLabel="Minutos"
            />

            {/* Gráfico de Humor */}
            <PieChart
              data={dashboardData.moodDistribution}
              title="Distribuição do Humor"
              size={screenWidth - 64}
            />
          </>
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
    marginBottom: 16,
  },
  timeSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.glass.widget,
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border.primary,
  },
  timeOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  timeOptionActive: {
    backgroundColor: COLORS.primary.coral,
  },
  timeOptionText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  timeOptionTextActive: {
    color: COLORS.background.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  selectorContainer: {
    padding: 16,
    marginBottom: 16,
  },
  selectorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  petSelector: {
    flexDirection: 'row',
  },
  petOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glass.widget,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border.primary,
  },
  petOptionActive: {
    backgroundColor: COLORS.primary.coral,
  },
  petOptionText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginLeft: 6,
    fontWeight: '500',
  },
  petOptionTextActive: {
    color: COLORS.background.primary,
    fontWeight: '600',
  },
  overviewContainer: {
    marginBottom: 16,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  overviewCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  overviewValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginTop: 8,
  },
  overviewLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
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