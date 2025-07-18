/**
 * AddPetScreen - Tela para adicionar novo pet
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import { GlassContainer } from '../../components/ui/GlassContainer';
import { COLORS, GLASS_CONFIG } from '../../constants/theme';
import { PetService } from '../../services/PetService';

interface CreatePetData {
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed: string;
  birthDate: Date;
  weight: string;
  height: string;
  gender: 'male' | 'female';
  isNeutered: boolean;
  avatar?: string;
  microchipId: string;
  medicalConditions: string[];
  allergies: string[];
}

export const AddPetScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [petData, setPetData] = useState<CreatePetData>({
    name: '',
    species: 'dog',
    breed: '',
    birthDate: new Date(),
    weight: '',
    height: '',
    gender: 'male',
    isNeutered: false,
    microchipId: '',
    medicalConditions: [],
    allergies: [],
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
    if (!petData.name.trim() || !petData.breed.trim() || !petData.weight || !petData.height) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      setLoading(true);

      const submitData = {
        ...petData,
        birthDate: petData.birthDate.toISOString(),
        weight: parseFloat(petData.weight),
        height: parseFloat(petData.height),
        avatar: selectedImage,
      };

      await PetService.createPet(submitData);

      Alert.alert('Sucesso', 'Pet adicionado com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Erro ao adicionar pet:', error);
      Alert.alert('Erro', 'Falha ao adicionar pet. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setPetData({ ...petData, birthDate: selectedDate });
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <GlassContainer variant="widget" style={styles.formContainer}>
        <Text style={styles.title}>Adicionar Pet</Text>

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
            value={petData.name}
            onChangeText={(text) => setPetData({ ...petData, name: text })}
            placeholder="Nome do pet"
            placeholderTextColor={COLORS.text.secondary}
          />
        </View>

        {/* Espécie */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Espécie *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={petData.species}
              onValueChange={(value) => setPetData({ ...petData, species: value })}
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
            value={petData.breed}
            onChangeText={(text) => setPetData({ ...petData, breed: text })}
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
              {petData.birthDate.toLocaleDateString('pt-BR')}
            </Text>
            <Ionicons name="calendar" size={20} color={COLORS.text.secondary} />
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={petData.birthDate}
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
              value={petData.weight}
              onChangeText={(text) => setPetData({ ...petData, weight: text })}
              placeholder="0.0"
              placeholderTextColor={COLORS.text.secondary}
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Altura (cm) *</Text>
            <TextInput
              style={styles.input}
              value={petData.height}
              onChangeText={(text) => setPetData({ ...petData, height: text })}
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
                petData.gender === 'male' && styles.genderButtonActive
              ]}
              onPress={() => setPetData({ ...petData, gender: 'male' })}
            >
              <Text style={[
                styles.genderText,
                petData.gender === 'male' && styles.genderTextActive
              ]}>
                Macho
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.genderButton,
                petData.gender === 'female' && styles.genderButtonActive
              ]}
              onPress={() => setPetData({ ...petData, gender: 'female' })}
            >
              <Text style={[
                styles.genderText,
                petData.gender === 'female' && styles.genderTextActive
              ]}>
                Fêmea
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Castrado */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setPetData({ ...petData, isNeutered: !petData.isNeutered })}
        >
          <View style={[styles.checkbox, petData.isNeutered && styles.checkboxActive]}>
            {petData.isNeutered && (
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
            value={petData.microchipId}
            onChangeText={(text) => setPetData({ ...petData, microchipId: text })}
            placeholder="ID do microchip (opcional)"
            placeholderTextColor={COLORS.text.secondary}
          />
        </View>

        {/* Botões */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Salvando...' : 'Salvar Pet'}
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
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.glass.widget,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border.primary,
  },
  cancelButtonText: {
    fontSize: 16,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.primary.coral,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginLeft: 8,
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