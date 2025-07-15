/**
 * LoginScreen - Tela de login
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

// Redux
import { useAppDispatch, useAppSelector } from '@/store';
import { loginUser } from '@/store/slices/authSlice';

// Components
import { OiPetLogo } from '@/components/ui/OiPetLogo';
import { GlassContainer } from '@/components/ui/GlassContainer';

// Constants
import { COLORS, TYPOGRAPHY, SPACING } from '@/constants/theme';

/**
 * Tela de login com design glass
 */
export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector(state => state.auth);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    try {
      await dispatch(loginUser({ email, password })).unwrap();
      // Navigation será automática devido ao estado de autenticação
    } catch (err) {
      Alert.alert('Erro no Login', err as string);
    }
  };

  const handleRegister = () => {
    navigation.navigate('Register' as never);
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
          {/* Header */}
          <View style={styles.header}>
            <OiPetLogo
              size="large"
              variant="vertical"
              color="white"
              showTagline
            />
          </View>

          {/* Login Form */}
          <GlassContainer
            variant="modal"
            style={styles.formContainer}
            contentStyle={styles.formContent}
          >
            <Text style={styles.title}>Entrar</Text>
            
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
                placeholder="Email"
                placeholderTextColor={COLORS.system.text.secondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
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
                placeholder="Senha"
                placeholderTextColor={COLORS.system.text.secondary}
                value={password}
                onChangeText={setPassword}
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

            {/* Error Message */}
            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Text>
            </TouchableOpacity>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>
                Esqueceu sua senha?
              </Text>
            </TouchableOpacity>
          </GlassContainer>

          {/* Register Link */}
          <View style={styles.footer}>
            <Text style={styles.registerText}>
              Não tem uma conta?{' '}
            </Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={styles.registerLink}>
                Cadastre-se
              </Text>
            </TouchableOpacity>
          </View>
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
    paddingHorizontal: SPACING.xl,
    justifyContent: 'center',
  },
  
  header: {
    alignItems: 'center',
    marginBottom: SPACING['3xl'],
  },
  
  formContainer: {
    marginBottom: SPACING.xl,
  },
  
  formContent: {
    paddingVertical: SPACING['2xl'],
  },
  
  title: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.system.text.primary,
    textAlign: 'center',
    marginBottom: SPACING['2xl'],
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.system.surface,
    borderRadius: 12,
    marginBottom: SPACING.lg,
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
  
  loginButton: {
    backgroundColor: COLORS.primary.coral,
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  
  loginButtonDisabled: {
    opacity: 0.6,
  },
  
  loginButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: COLORS.system.text.inverse,
  },
  
  forgotPassword: {
    alignItems: 'center',
  },
  
  forgotPasswordText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.primary.coral,
  },
  
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  registerText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.system.text.inverse,
    opacity: 0.9,
  },
  
  registerLink: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: COLORS.system.text.inverse,
    textDecorationLine: 'underline',
  },
});