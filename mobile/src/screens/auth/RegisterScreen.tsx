/**
 * RegisterScreen - Tela de cadastro
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

// Redux
import { useAppDispatch, useAppSelector } from '@/store';
import { registerUser } from '@/store/slices/authSlice';

// Components
import { OiPetLogo } from '@/components/ui/OiPetLogo';
import { GlassContainer } from '@/components/ui/GlassContainer';

// Constants
import { COLORS, TYPOGRAPHY, SPACING } from '@/constants/theme';

/**
 * Tela de cadastro com design glass
 */
export const RegisterScreen = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector(state => state.auth);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { name, email, password, confirmPassword } = formData;
    
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Erro', 'Por favor, insira um email válido');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      const { name, email, phone, password } = formData;
      await dispatch(registerUser({ name, email, phone, password })).unwrap();
      // Navigation será automática devido ao estado de autenticação
    } catch (err) {
      Alert.alert('Erro no Cadastro', err as string);
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login' as never);
  };

  return (
    <LinearGradient
      colors={[COLORS.primary.coral, COLORS.primary.teal]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <OiPetLogo
                size="medium"
                variant="horizontal"
                color="white"
              />
            </View>

            {/* Register Form */}
            <GlassContainer
              variant="modal"
              style={styles.formContainer}
              contentStyle={styles.formContent}
            >
              <Text style={styles.title}>Criar Conta</Text>
              
              {/* Name Input */}
              <View style={styles.inputContainer}>
                <Ionicons 
                  name="person-outline" 
                  size={20} 
                  color={COLORS.system.text.secondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Nome completo *"
                  placeholderTextColor={COLORS.system.text.secondary}
                  value={formData.name}
                  onChangeText={(value) => updateField('name', value)}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Ionicons 
                  name="mail-outline" 
                  size={20} 
                  color={COLORS.system.text.secondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email *"
                  placeholderTextColor={COLORS.system.text.secondary}
                  value={formData.email}
                  onChangeText={(value) => updateField('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Phone Input */}
              <View style={styles.inputContainer}>
                <Ionicons 
                  name="call-outline" 
                  size={20} 
                  color={COLORS.system.text.secondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Telefone (opcional)"
                  placeholderTextColor={COLORS.system.text.secondary}
                  value={formData.phone}
                  onChangeText={(value) => updateField('phone', value)}
                  keyboardType="phone-pad"
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Ionicons 
                  name="lock-closed-outline" 
                  size={20} 
                  color={COLORS.system.text.secondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Senha *"
                  placeholderTextColor={COLORS.system.text.secondary}
                  value={formData.password}
                  onChangeText={(value) => updateField('password', value)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.passwordToggle}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color={COLORS.system.text.secondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <Ionicons 
                  name="lock-closed-outline" 
                  size={20} 
                  color={COLORS.system.text.secondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Confirmar senha *"
                  placeholderTextColor={COLORS.system.text.secondary}
                  value={formData.confirmPassword}
                  onChangeText={(value) => updateField('confirmPassword', value)}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.passwordToggle}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color={COLORS.system.text.secondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Error Message */}
              {error && (
                <Text style={styles.errorText}>{error}</Text>
              )}

              {/* Register Button */}
              <TouchableOpacity
                style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
                onPress={handleRegister}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <Text style={styles.registerButtonText}>
                  {isLoading ? 'Criando conta...' : 'Criar Conta'}
                </Text>
              </TouchableOpacity>

              {/* Terms */}
              <Text style={styles.termsText}>
                Ao criar uma conta, você concorda com nossos{' '}
                <Text style={styles.termsLink}>Termos de Uso</Text>
                {' '}e{' '}
                <Text style={styles.termsLink}>Política de Privacidade</Text>
              </Text>
            </GlassContainer>

            {/* Login Link */}
            <View style={styles.footer}>
              <Text style={styles.loginText}>
                Já tem uma conta?{' '}
              </Text>
              <TouchableOpacity onPress={handleLogin}>
                <Text style={styles.loginLink}>
                  Entrar
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  safeArea: {
    flex: 1,
  },
  
  content: {
    flex: 1,
  },
  
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  
  formContainer: {
    marginBottom: SPACING.lg,
  },
  
  formContent: {
    paddingVertical: SPACING.xl,
  },
  
  title: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.system.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.system.surface,
    borderRadius: 12,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    height: 50,
  },
  
  inputIcon: {
    marginRight: SPACING.sm,
  },
  
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.system.text.primary,
  },
  
  passwordInput: {
    paddingRight: SPACING.lg,
  },
  
  passwordToggle: {
    position: 'absolute',
    right: SPACING.md,
    padding: SPACING.xs,
  },
  
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.system.error,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  
  registerButton: {
    backgroundColor: COLORS.primary.coral,
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    marginTop: SPACING.md,
  },
  
  registerButtonDisabled: {
    opacity: 0.6,
  },
  
  registerButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: COLORS.system.text.inverse,
  },
  
  termsText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.system.text.secondary,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.lineHeight.normal * TYPOGRAPHY.fontSize.xs,
  },
  
  termsLink: {
    color: COLORS.primary.coral,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    textDecorationLine: 'underline',
  },
  
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  
  loginText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.system.text.inverse,
    opacity: 0.9,
  },
  
  loginLink: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: COLORS.system.text.inverse,
    textDecorationLine: 'underline',
  },
});