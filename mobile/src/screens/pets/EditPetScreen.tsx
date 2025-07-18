/**
 * EditPetScreen - Tela para editar dados do pet
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import { GlassContainer } from '../../components/ui/GlassContainer';
import { COLORS } from '../../constants/theme';
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
  isNeutered: boolean;
  avatar?: string;
  microchipId?: string;
  medicalConditions?: string[];
  allergies?: string[];
}

export const EditPetScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { petId } = route.params as { petId: string };

  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    species: 'dog' as 'dog' | 'cat' | 'other',
    breed: '',
    birthDate: new Date(),
    weight: '',
    height: '',
    gender: 'male' as 'male' | 'female',
    isNeutered: false,
    microchipId: '',
  });

  useEffect(() => {
    loadPetData();
  }, []);

  const loadPetData = async () => {
    try {
      const response = await PetService.getPetById(petId);
      const petData = response.data.data;
      
      setPet(petData);
      setFormData({
        name: petData.name,
        species: petData.species,
        breed: petData.breed,
        birthDate: new Date(petData.birthDate),
        weight: petData.weight.toString(),
        height: petData.height.toString(),
        gender: petData.gender,
        isNeutered: petData.isNeutered || false,
        microchipId: petData.microchipId || '',
      });
      
      if (petData.avatar) {
        setSelectedImage(petData.avatar);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do pet:', error);
      Alert.alert('Erro', 'Falha ao carregar dados do pet');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permissão negada', 'É necessário permitir acesso à galeria para adicionar foto');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.breed.trim() || !formData.weight || !formData.height) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      setSaving(true);

      const updateData = {
        name: formData.name,
        species: formData.species,
        breed: formData.breed,
        birthDate: formData.birthDate.toISOString(),
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        gender: formData.gender,
        isNeutered: formData.isNeutered,
        microchipId: formData.microchipId,
        avatar: selectedImage,
      };

      await PetService.updatePet(petId, updateData);

      Alert.alert('Sucesso', 'Dados do pet atualizados com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Erro ao atualizar pet:', error);
      Alert.alert('Erro', 'Falha ao atualizar dados do pet. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Remover Pet',
      `Tem certeza que deseja remover ${pet?.name}? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Remover', 
          style: 'destructive',
          onPress: confirmDelete
        }
      ]
    );
  };

  const confirmDelete = async () => {
    try {
      setSaving(true);
      await PetService.deletePet(petId);
      
      Alert.alert('Sucesso', 'Pet removido com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Erro ao remover pet:', error);
      Alert.alert('Erro', 'Falha ao remover pet. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData({ ...formData, birthDate: selectedDate });
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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <GlassContainer variant="widget" style={styles.formContainer}>
        <Text style={styles.title}>Editar {pet?.name}</Text>

        {/* Foto do Pet */}
        <TouchableOpacity style={styles.imageContainer} onPress={handleImagePick}>
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.petImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="camera" size={32} color={COLORS.text.secondary} />
              <Text style={styles.imageText}>Adicionar Foto</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Nome */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome *</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="Nome do pet"
            placeholderTextColor={COLORS.text.secondary}
          />
        </View>

        {/* Espécie */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Espécie *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.species}
              onValueChange={(value) => setFormData({ ...formData, species: value })}
              style={styles.picker}
            >
              <Picker.Item label="Cão" value="dog" />
              <Picker.Item label="Gato" value="cat" />
              <Picker.Item label="Outro" value="other" />
            </Picker>
          </View>
        </View>

        {/* Raça */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Raça *</Text>
          <TextInput
            style={styles.input}
            value={formData.breed}
            onChangeText={(text) => setFormData({ ...formData, breed: text })}
            placeholder="Raça do pet"
            placeholderTextColor={COLORS.text.secondary}
          />
        </View>

        {/* Data de Nascimento */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Data de Nascimento *</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {formData.birthDate.toLocaleDateString('pt-BR')}
            </Text>
            <Ionicons name="calendar" size={20} color={COLORS.text.secondary} />
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={formData.birthDate}
            mode="date"
            display="default"
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        )}

        {/* Peso e Altura */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Peso (kg) *</Text>
            <TextInput
              style={styles.input}
              value={formData.weight}
              onChangeText={(text) => setFormData({ ...formData, weight: text })}
              placeholder="0.0"
              placeholderTextColor={COLORS.text.secondary}
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Altura (cm) *</Text>
            <TextInput
              style={styles.input}
              value={formData.height}
              onChangeText={(text) => setFormData({ ...formData, height: text })}
              placeholder="0.0"
              placeholderTextColor={COLORS.text.secondary}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Gênero */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gênero *</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[
                styles.genderButton,
                formData.gender === 'male' && styles.genderButtonActive
              ]}
              onPress={() => setFormData({ ...formData, gender: 'male' })}
            >
              <Text style={[
                styles.genderText,
                formData.gender === 'male' && styles.genderTextActive
              ]}>
                Macho
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.genderButton,
                formData.gender === 'female' && styles.genderButtonActive
              ]}
              onPress={() => setFormData({ ...formData, gender: 'female' })}
            >
              <Text style={[
                styles.genderText,
                formData.gender === 'female' && styles.genderTextActive
              ]}>
                Fêmea
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Castrado */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setFormData({ ...formData, isNeutered: !formData.isNeutered })}
        >
          <View style={[styles.checkbox, formData.isNeutered && styles.checkboxActive]}>
            {formData.isNeutered && (
              <Ionicons name="checkmark" size={16} color={COLORS.background.primary} />
            )}
          </View>
          <Text style={styles.checkboxText}>Pet castrado</Text>
        </TouchableOpacity>

        {/* Microchip */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>ID do Microchip</Text>
          <TextInput
            style={styles.input}
            value={formData.microchipId}
            onChangeText={(text) => setFormData({ ...formData, microchipId: text })}
            placeholder="ID do microchip (opcional)"
            placeholderTextColor={COLORS.text.secondary}
          />
        </View>

        {/* Botões */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={saving}
          >
            <Ionicons name="trash" size={20} color={COLORS.semantic.error} />
            <Text style={styles.deleteButtonText}>Remover</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={saving}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSubmit}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Text>
          </TouchableOpacity>
        </View>
      </GlassContainer>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  formContainer: {
    padding: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 24,
  },
  imageContainer: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  petImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.glass.modal,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.border.primary,
    borderStyle: 'dashed',
  },
  imageText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.glass.widget,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text.primary,
    borderWidth: 1,
    borderColor: COLORS.border.primary,
  },
  pickerContainer: {
    backgroundColor: COLORS.glass.widget,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.primary,
  },
  picker: {
    color: COLORS.text.primary,
  },
  dateButton: {
    backgroundColor: COLORS.glass.widget,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.primary,
  },
  dateText: {
    fontSize: 16,
    color: COLORS.text.primary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  genderContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.glass.widget,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border.primary,
  },
  genderButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: COLORS.primary.coral,
  },
  genderText: {
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  genderTextActive: {
    color: COLORS.background.primary,
    fontWeight: '600',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxActive: {
    backgroundColor: COLORS.primary.coral,
    borderColor: COLORS.primary.coral,
  },
  checkboxText: {
    fontSize: 16,
    color: COLORS.text.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  deleteButton: {
    backgroundColor: COLORS.glass.widget,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.semantic.error,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '30%',
  },
  deleteButtonText: {
    fontSize: 14,
    color: COLORS.semantic.error,
    fontWeight: '600',
    marginLeft: 4,
  },
  cancelButton: {
    backgroundColor: COLORS.glass.widget,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.primary,
    width: '30%',
  },
  cancelButtonText: {
    fontSize: 16,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: COLORS.primary.coral,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '30%',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    color: COLORS.background.primary,
    fontWeight: '600',
  },
});