/**
 * AddHealthRecordScreen - Tela para adicionar registro de saúde
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Switch,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

import { GlassContainer } from '../../components/ui/GlassContainer';
import { COLORS } from '../../constants/theme';
import { HealthService } from '../../services/HealthService';

interface HealthRecordData {
  date: Date;
  weight?: string;
  height?: string;
  activity?: {
    type: string;
    duration: string;
    intensity: 'low' | 'medium' | 'high';
    calories?: string;
  };
  feeding?: {
    food: string;
    amount: string;
    calories: string;
    time: string;
  };
  water?: {
    amount: string;
    times: string;
  };
  sleep?: {
    duration: string;
    quality: 'poor' | 'fair' | 'good' | 'excellent';
  };
  mood?: 'very_sad' | 'sad' | 'neutral' | 'happy' | 'very_happy';
  symptoms?: string;
  medications?: {
    name: string;
    dosage: string;
    time: string;
    givenBy: string;
  }[];
  vitals?: {
    temperature?: string;
    heartRate?: string;
    respiratoryRate?: string;
  };
  notes?: string;
}

export const AddHealthRecordScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { petId } = route.params as { petId: string };

  const [recordData, setRecordData] = useState<HealthRecordData>({
    date: new Date(),
  });

  const [activeSection, setActiveSection] = useState<string>('basic');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const [enabledSections, setEnabledSections] = useState({
    weight: false,
    activity: false,
    feeding: false,
    water: false,
    sleep: false,
    mood: false,
    vitals: false,
    medications: false,
    symptoms: false,
  });

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const submitData: any = {
        date: recordData.date.toISOString(),
      };

      if (enabledSections.weight && recordData.weight) {
        submitData.weight = parseFloat(recordData.weight);
      }

      if (enabledSections.weight && recordData.height) {
        submitData.height = parseFloat(recordData.height);
      }

      if (enabledSections.activity && recordData.activity) {
        submitData.activity = {
          type: recordData.activity.type,
          duration: parseInt(recordData.activity.duration) || 0,
          intensity: recordData.activity.intensity,
          ...(recordData.activity.calories && { 
            calories: parseFloat(recordData.activity.calories) 
          }),
        };
      }

      if (enabledSections.feeding && recordData.feeding) {
        submitData.feeding = {
          food: recordData.feeding.food,
          amount: parseFloat(recordData.feeding.amount) || 0,
          calories: parseFloat(recordData.feeding.calories) || 0,
          time: recordData.feeding.time,
        };
      }

      if (enabledSections.water && recordData.water) {
        submitData.water = {
          amount: parseFloat(recordData.water.amount) || 0,
          times: parseInt(recordData.water.times) || 0,
        };
      }

      if (enabledSections.sleep && recordData.sleep) {
        submitData.sleep = {
          duration: parseFloat(recordData.sleep.duration) || 0,
          quality: recordData.sleep.quality,
        };
      }

      if (enabledSections.mood && recordData.mood) {
        submitData.mood = recordData.mood;
      }

      if (enabledSections.symptoms && recordData.symptoms) {
        submitData.symptoms = recordData.symptoms.split(',').map(s => s.trim());
      }

      if (enabledSections.vitals && recordData.vitals) {
        submitData.vitals = {};
        if (recordData.vitals.temperature) {
          submitData.vitals.temperature = parseFloat(recordData.vitals.temperature);
        }
        if (recordData.vitals.heartRate) {
          submitData.vitals.heartRate = parseInt(recordData.vitals.heartRate);
        }
        if (recordData.vitals.respiratoryRate) {
          submitData.vitals.respiratoryRate = parseInt(recordData.vitals.respiratoryRate);
        }
      }

      if (recordData.notes) {
        submitData.notes = recordData.notes;
      }

      await HealthService.createHealthRecord(petId, submitData);

      Alert.alert('Sucesso', 'Registro de saúde adicionado com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Erro ao adicionar registro:', error);
      Alert.alert('Erro', 'Falha ao adicionar registro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setRecordData({ ...recordData, date: selectedDate });
    }
  };

  const renderMoodSelector = () => (
    <View style={styles.moodContainer}>
      <Text style={styles.label}>Humor do Pet</Text>
      <View style={styles.moodOptions}>
        {[
          { value: 'very_sad', emoji: '😢', label: 'Muito Triste' },
          { value: 'sad', emoji: '😟', label: 'Triste' },
          { value: 'neutral', emoji: '😐', label: 'Neutro' },
          { value: 'happy', emoji: '😊', label: 'Feliz' },
          { value: 'very_happy', emoji: '😍', label: 'Muito Feliz' },
        ].map((mood) => (
          <TouchableOpacity
            key={mood.value}
            style={[
              styles.moodOption,
              recordData.mood === mood.value && styles.moodOptionActive
            ]}
            onPress={() => setRecordData({ 
              ...recordData, 
              mood: mood.value as any 
            })}
          >
            <Text style={styles.moodEmoji}>{mood.emoji}</Text>
            <Text style={styles.moodLabel}>{mood.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <GlassContainer variant="widget" style={styles.headerContainer}>
        <Text style={styles.title}>Novo Registro de Saúde</Text>
        
        {/* Data */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Data do Registro</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {recordData.date.toLocaleDateString('pt-BR')}
            </Text>
            <Ionicons name="calendar" size={20} color={COLORS.text.secondary} />
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={recordData.date}
            mode="date"
            display="default"
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        )}
      </GlassContainer>

      {/* Peso e Altura */}
      <GlassContainer variant="widget" style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Peso e Altura</Text>
          <Switch
            value={enabledSections.weight}
            onValueChange={(value) => setEnabledSections({
              ...enabledSections,
              weight: value
            })}
            trackColor={{ false: COLORS.glass.widget, true: COLORS.primary.coral }}
          />
        </View>

        {enabledSections.weight && (
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Peso (kg)</Text>
              <TextInput
                style={styles.input}
                value={recordData.weight || ''}
                onChangeText={(text) => setRecordData({ 
                  ...recordData, 
                  weight: text 
                })}
                placeholder="0.0"
                placeholderTextColor={COLORS.text.secondary}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Altura (cm)</Text>
              <TextInput
                style={styles.input}
                value={recordData.height || ''}
                onChangeText={(text) => setRecordData({ 
                  ...recordData, 
                  height: text 
                })}
                placeholder="0.0"
                placeholderTextColor={COLORS.text.secondary}
                keyboardType="numeric"
              />
            </View>
          </View>
        )}
      </GlassContainer>

      {/* Atividade */}
      <GlassContainer variant="widget" style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Atividade Física</Text>
          <Switch
            value={enabledSections.activity}
            onValueChange={(value) => setEnabledSections({
              ...enabledSections,
              activity: value
            })}
            trackColor={{ false: COLORS.glass.widget, true: COLORS.primary.coral }}
          />
        </View>

        {enabledSections.activity && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tipo de Atividade</Text>
              <TextInput
                style={styles.input}
                value={recordData.activity?.type || ''}
                onChangeText={(text) => setRecordData({ 
                  ...recordData, 
                  activity: { ...recordData.activity, type: text } as any
                })}
                placeholder="Ex: Caminhada, Corrida, Brincadeira"
                placeholderTextColor={COLORS.text.secondary}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Duração (min)</Text>
                <TextInput
                  style={styles.input}
                  value={recordData.activity?.duration || ''}
                  onChangeText={(text) => setRecordData({ 
                    ...recordData, 
                    activity: { ...recordData.activity, duration: text } as any
                  })}
                  placeholder="30"
                  placeholderTextColor={COLORS.text.secondary}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Intensidade</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={recordData.activity?.intensity || 'medium'}
                    onValueChange={(value) => setRecordData({ 
                      ...recordData, 
                      activity: { ...recordData.activity, intensity: value } as any
                    })}
                    style={styles.picker}
                  >
                    <Picker.Item label="Baixa" value="low" />
                    <Picker.Item label="Média" value="medium" />
                    <Picker.Item label="Alta" value="high" />
                  </Picker>
                </View>
              </View>
            </View>
          </>
        )}
      </GlassContainer>

      {/* Humor */}
      <GlassContainer variant="widget" style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Humor</Text>
          <Switch
            value={enabledSections.mood}
            onValueChange={(value) => setEnabledSections({
              ...enabledSections,
              mood: value
            })}
            trackColor={{ false: COLORS.glass.widget, true: COLORS.primary.coral }}
          />
        </View>

        {enabledSections.mood && renderMoodSelector()}
      </GlassContainer>

      {/* Notas */}
      <GlassContainer variant="widget" style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Observações</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={recordData.notes || ''}
          onChangeText={(text) => setRecordData({ ...recordData, notes: text })}
          placeholder="Descreva observações sobre o comportamento, sintomas ou qualquer informação relevante..."
          placeholderTextColor={COLORS.text.secondary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </GlassContainer>

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
            {loading ? 'Salvando...' : 'Salvar Registro'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    padding: 16,
  },
  headerContainer: {
    padding: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 24,
  },
  sectionContainer: {
    padding: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
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
  textArea: {
    height: 100,
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
  moodContainer: {
    marginTop: 8,
  },
  moodOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  moodOption: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.glass.widget,
    borderWidth: 1,
    borderColor: COLORS.border.primary,
    minWidth: 60,
  },
  moodOptionActive: {
    backgroundColor: COLORS.primary.coral,
    borderColor: COLORS.primary.coral,
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 10,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 16,
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
  bottomSpacing: {
    height: 100,
  },
});