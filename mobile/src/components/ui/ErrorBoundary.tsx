/**
 * ErrorBoundary - Componente para capturar erros da aplicação
 */

import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING } from '@/constants/theme';
import { OiPetLogo } from './OiPetLogo';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

/**
 * Boundary para capturar e exibir erros de forma elegante
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
    
    // Chamar callback de erro se fornecido
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Renderizar fallback customizado se fornecido
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Renderizar tela de erro padrão
      return (
        <LinearGradient
          colors={[COLORS.primary.coral, COLORS.primary.teal]}
          style={styles.container}
        >
          <View style={styles.content}>
            <OiPetLogo
              size="large"
              variant="vertical"
              color="white"
              style={styles.logo}
            />
            
            <View style={styles.errorContainer}>
              <Ionicons
                name="warning-outline"
                size={48}
                color={COLORS.system.text.inverse}
                style={styles.errorIcon}
              />
              
              <Text style={styles.errorTitle}>
                Oops! Algo deu errado
              </Text>
              
              <Text style={styles.errorMessage}>
                Ocorreu um erro inesperado. Tente novamente ou reinicie o aplicativo.
              </Text>
              
              {__DEV__ && this.state.error && (
                <Text style={styles.errorDetails}>
                  {this.state.error.message}
                </Text>
              )}
              
              <TouchableOpacity
                style={styles.retryButton}
                onPress={this.handleRetry}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="refresh"
                  size={20}
                  color={COLORS.primary.coral}
                  style={styles.retryIcon}
                />
                <Text style={styles.retryText}>
                  Tentar Novamente
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  content: {
    alignItems: 'center',
    paddingHorizontal: SPACING['3xl'],
  },
  
  logo: {
    marginBottom: SPACING['3xl'],
  },
  
  errorContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: SPACING['2xl'],
    borderRadius: 20,
    maxWidth: 320,
  },
  
  errorIcon: {
    marginBottom: SPACING.lg,
  },
  
  errorTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.system.text.inverse,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  
  errorMessage: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.system.text.inverse,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.lineHeight.normal * TYPOGRAPHY.fontSize.base,
    marginBottom: SPACING.lg,
    opacity: 0.9,
  },
  
  errorDetails: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.system.text.inverse,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: SPACING.lg,
    fontStyle: 'italic',
  },
  
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.system.text.inverse,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 12,
  },
  
  retryIcon: {
    marginRight: SPACING.sm,
  },
  
  retryText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: COLORS.primary.coral,
  },
});