/**
 * API Service - Configuração base para requisições HTTP
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';

// Constants
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3001/api' // Desenvolvimento local
  : 'https://oipet-saude-production.up.railway.app/api'; // Produção

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - adicionar token de autenticação
    this.api.interceptors.request.use(
      async (config) => {
        try {
          const token = await SecureStore.getItemAsync('accessToken');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.warn('Erro ao obter token:', error);
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - lidar com erros de autenticação
    this.api.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Se erro 401 e não é uma tentativa de retry
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Tentar renovar o token
            const refreshToken = await SecureStore.getItemAsync('refreshToken');
            if (refreshToken) {
              const response = await this.post('/auth/refresh', { refreshToken });
              const { accessToken } = response.data;
              
              // Salvar novo token
              await SecureStore.setItemAsync('accessToken', accessToken);
              
              // Repetir a requisição original
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Se não conseguir renovar, limpar tokens e redirecionar para login
            await SecureStore.deleteItemAsync('accessToken');
            await SecureStore.deleteItemAsync('refreshToken');
            
            // TODO: Dispatch action para limpar estado de auth
            console.warn('Token expirado, redirecionando para login');
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: any) {
    if (error.response) {
      // Erro da API
      const message = error.response.data?.error || error.response.data?.message || 'Erro na requisição';
      return new Error(message);
    } else if (error.request) {
      // Erro de rede
      return new Error('Erro de conexão. Verifique sua internet.');
    } else {
      // Outro erro
      return new Error(error.message || 'Erro inesperado');
    }
  }

  // Métodos públicos
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.get(url, config);
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.post(url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.put(url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.delete(url, config);
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.patch(url, data, config);
  }

  // Método para upload de arquivos
  async uploadFile<T = any>(url: string, file: any, onProgress?: (progress: number) => void): Promise<AxiosResponse<T>> {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      type: file.type,
      name: file.fileName || 'image.jpg',
    } as any);

    return this.api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          onProgress(progress);
        }
      },
    });
  }

  // Getter para acesso direto à instância axios se necessário
  get instance() {
    return this.api;
  }
}

export const apiService = new ApiService();
export default apiService;