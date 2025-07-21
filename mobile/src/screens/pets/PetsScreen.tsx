/**
 * PetsScreen - Tela de listagem de pets
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { GlassContainer } from '../../components/ui/GlassContainer';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';
import { PetService } from '../../services/PetService';

interface Pet {
  _id: string;
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed: string;
  birthDate: string;
  weight: number;
  height: number;
  gender: 'male' | 'female';
  avatar?: string;
}

export const PetsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadPets();
    }, [])
  );

  const loadPets = async () => {
    try {
      const response = await PetService.getUserPets();
      setPets(response.data.data.pets || []);
    } catch (error) {
      console.error('Erro ao carregar pets:', error);
      Alert.alert('Erro', 'Falha ao carregar lista de pets');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPets();
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

  const getSpeciesLabel = (species: string) => {
    switch (species) {
      case 'dog': return 'Cão';
      case 'cat': return 'Gato';
      default: return 'Outro';
    }
  };

  const renderPetCard = ({ item }: { item: Pet }) => (
    <TouchableOpacity
      style={styles.petCard}
      onPress={() => navigation.navigate('PetDetail', { petId: item._id })}
    >
      <GlassContainer variant="widget" style={styles.cardContent}>
        <View style={styles.petHeader}>
          <View style={styles.petImageContainer}>
            {item.avatar ? (
              <Image source={{ uri: item.avatar }} style={styles.petImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons 
                  name={getSpeciesIcon(item.species)} 
                  size={32} 
                  color={COLORS.system.text.secondary} 
                />
              </View>
            )}
          </View>

          <View style={styles.petInfo}>
            <Text style={styles.petName}>{item.name}</Text>
            <Text style={styles.petBreed}>{item.breed}</Text>
            <Text style={styles.petDetails}>
              {getSpeciesLabel(item.species)} • {getAgeFromBirthDate(item.birthDate)}
            </Text>
          </View>

          <View style={styles.petStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{item.weight}</Text>
              <Text style={styles.statLabel}>kg</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{item.height}</Text>
              <Text style={styles.statLabel}>cm</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.genderIndicator}>
            <Ionicons 
              name={item.gender === 'male' ? 'male' : 'female'} 
              size={16} 
              color={item.gender === 'male' ? COLORS.primary.teal : COLORS.primary.coral} 
            />
            <Text style={styles.genderText}>
              {item.gender === 'male' ? 'Macho' : 'Fêmea'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('Health', { 
              screen: 'AddHealthRecord', 
              params: { petId: item._id } 
            })}
          >
            <Ionicons name="add-circle" size={20} color={COLORS.primary.coral} />
            <Text style={styles.quickActionText}>Registrar</Text>
          </TouchableOpacity>
        </View>
      </GlassContainer>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <GlassContainer variant="widget" style={styles.emptyContent}>
        <Ionicons name="paw" size={64} color={COLORS.system.text.secondary} />
        <Text style={styles.emptyTitle}>Nenhum pet cadastrado</Text>
        <Text style={styles.emptyMessage}>
          Adicione seu primeiro pet para começar a monitorar sua saúde e bem-estar
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
        <Text style={styles.title}>Meus Pets</Text>
        
        {pets.length > 0 && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddPet')}
          >
            <Ionicons name="add" size={24} color={COLORS.primary.coral} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={pets}
        renderItem={renderPetCard}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary.coral}
          />
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={pets.length === 0 ? styles.emptyList : undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.system.background,
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.system.text.primary,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.glass.widget,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.system.border.light,
  },
  petCard: {
    marginBottom: SPACING.lg,
  },
  cardContent: {
    padding: SPACING.lg,
  },
  petHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  petImageContainer: {
    marginRight: SPACING.md,
  },
  petImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.system.text.primary,
    marginBottom: 2,
  },
  petBreed: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.system.text.secondary,
    marginBottom: 2,
  },
  petDetails: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.system.text.secondary,
  },
  petStats: {
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.system.text.primary,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.system.text.secondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.system.border.light,
  },
  genderIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  genderText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.system.text.secondary,
    marginLeft: SPACING.xs,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glass.widget,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.system.border.light,
  },
  quickActionText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.system.text.primary,
    marginLeft: SPACING.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING['3xl'],
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContent: {
    padding: SPACING['3xl'],
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.system.text.primary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyMessage: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.system.text.secondary,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.lineHeight.normal * TYPOGRAPHY.fontSize.sm,
    marginBottom: SPACING['2xl'],
  },
  addPetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary.coral,
    paddingHorizontal: SPACING['2xl'],
    paddingVertical: SPACING.md,
    borderRadius: 8,
  },
  addPetButtonText: {
    color: COLORS.system.text.inverse,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    marginLeft: SPACING.sm,
  },
});