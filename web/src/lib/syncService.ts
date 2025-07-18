/**
 * Sync Service - Sincronização de dados entre plataformas (Web)
 * Garante que dados estejam sempre atualizados entre mobile e web
 */

import { api } from './api';

interface SyncConfig {
  interval: number; // milliseconds
  retryAttempts: number;
  enabled: boolean;
}

interface SyncData {
  lastSync: string;
  version: number;
  hash: string;
}

class SyncService {
  private config: SyncConfig = {
    interval: 30000, // 30 seconds
    retryAttempts: 3,
    enabled: true
  };

  private syncTimer: number | null = null;
  private syncCallbacks: Map<string, Function[]> = new Map();

  /**
   * Inicializar serviço de sincronização
   */
  async initialize() {
    if (!this.config.enabled) return;

    console.log('🔄 Iniciando serviço de sincronização...');
    
    // Verificar se há dados pendentes de sincronização
    await this.syncPendingData();
    
    // Iniciar sincronização periódica
    this.startPeriodicSync();
  }

  /**
   * Parar serviço de sincronização
   */
  stop() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
    console.log('⏹️ Serviço de sincronização parado');
  }

  /**
   * Iniciar sincronização periódica
   */
  private startPeriodicSync() {
    this.syncTimer = window.setInterval(async () => {
      try {
        await this.performSync();
      } catch (error) {
        console.warn('Erro na sincronização periódica:', error);
      }
    }, this.config.interval);
  }

  /**
   * Executar sincronização completa
   */
  async performSync(): Promise<boolean> {
    try {
      console.log('🔄 Iniciando sincronização...');

      // Sincronizar cada tipo de dados
      const results = await Promise.allSettled([
        this.syncUserData(),
        this.syncPetsData(),
        this.syncHealthData(),
        this.syncNotificationsData()
      ]);

      const failures = results.filter(result => result.status === 'rejected');
      
      if (failures.length === 0) {
        this.updateLastSyncTime();
        console.log('✅ Sincronização completa bem-sucedida');
        this.notifyCallbacks('sync:success');
        return true;
      } else {
        console.warn(`⚠️ Sincronização parcial: ${failures.length} falhas`);
        this.notifyCallbacks('sync:partial');
        return false;
      }
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      this.notifyCallbacks('sync:error', error);
      return false;
    }
  }

  /**
   * Sincronizar dados do usuário
   */
  private async syncUserData(): Promise<void> {
    try {
      const response = await api.users.getProfile();
      const userData = response.data.data;
      
      // Armazenar dados atualizados localmente
      localStorage.setItem('user_data', JSON.stringify(userData));
      localStorage.setItem('user_sync', JSON.stringify({
        lastSync: new Date().toISOString(),
        version: userData.updatedAt ? new Date(userData.updatedAt).getTime() : Date.now()
      }));

      this.notifyCallbacks('user:updated', userData);
    } catch (error) {
      console.warn('Erro ao sincronizar dados do usuário:', error);
      throw error;
    }
  }

  /**
   * Sincronizar dados dos pets
   */
  private async syncPetsData(): Promise<void> {
    try {
      const response = await api.pets.getAll();
      const petsData = response.data.data;
      
      // Verificar se há mudanças
      const storedPets = localStorage.getItem('pets_data');
      const currentPets = storedPets ? JSON.parse(storedPets) : [];
      
      if (JSON.stringify(petsData) !== JSON.stringify(currentPets)) {
        localStorage.setItem('pets_data', JSON.stringify(petsData));
        localStorage.setItem('pets_sync', JSON.stringify({
          lastSync: new Date().toISOString(),
          version: Date.now(),
          count: petsData.length
        }));

        this.notifyCallbacks('pets:updated', petsData);
        console.log(`🐾 ${petsData.length} pets sincronizados`);
      }
    } catch (error) {
      console.warn('Erro ao sincronizar dados dos pets:', error);
      throw error;
    }
  }

  /**
   * Sincronizar registros de saúde
   */
  private async syncHealthData(): Promise<void> {
    try {
      // Buscar pets para sincronizar registros de saúde
      const petsData = localStorage.getItem('pets_data');
      if (!petsData) return;

      const pets = JSON.parse(petsData);
      const healthRecords: any[] = [];

      // Buscar registros de saúde para cada pet
      for (const pet of pets) {
        try {
          const response = await api.health.getPetRecords(pet._id, { limit: 50 });
          const petHealthRecords = response.data.data || [];
          healthRecords.push(...petHealthRecords.map((record: any) => ({
            ...record,
            petId: pet._id,
            petName: pet.name
          })));
        } catch (error) {
          console.warn(`Erro ao buscar registros de saúde do pet ${pet.name}:`, error);
        }
      }

      // Armazenar registros sincronizados
      localStorage.setItem('health_data', JSON.stringify(healthRecords));
      localStorage.setItem('health_sync', JSON.stringify({
        lastSync: new Date().toISOString(),
        version: Date.now(),
        count: healthRecords.length
      }));

      this.notifyCallbacks('health:updated', healthRecords);
      console.log(`💊 ${healthRecords.length} registros de saúde sincronizados`);
    } catch (error) {
      console.warn('Erro ao sincronizar registros de saúde:', error);
      throw error;
    }
  }

  /**
   * Sincronizar notificações
   */
  private async syncNotificationsData(): Promise<void> {
    try {
      const response = await api.notifications.getAll({ limit: 100 });
      const notificationsData = response.data.data;
      
      // Verificar se há mudanças
      const storedNotifications = localStorage.getItem('notifications_data');
      const currentNotifications = storedNotifications ? JSON.parse(storedNotifications) : [];
      
      if (JSON.stringify(notificationsData) !== JSON.stringify(currentNotifications)) {
        localStorage.setItem('notifications_data', JSON.stringify(notificationsData));
        localStorage.setItem('notifications_sync', JSON.stringify({
          lastSync: new Date().toISOString(),
          version: Date.now(),
          count: notificationsData.length,
          unread: notificationsData.filter((n: any) => !n.isRead).length
        }));

        this.notifyCallbacks('notifications:updated', notificationsData);
        console.log(`🔔 ${notificationsData.length} notificações sincronizadas`);
      }
    } catch (error) {
      console.warn('Erro ao sincronizar notificações:', error);
      throw error;
    }
  }

  /**
   * Sincronizar dados pendentes (offline to online)
   */
  private async syncPendingData(): Promise<void> {
    try {
      const pendingActions = localStorage.getItem('pending_sync_actions');
      if (!pendingActions) return;

      const actions = JSON.parse(pendingActions);
      console.log(`📤 ${actions.length} ações pendentes para sincronizar`);

      const completedActions: string[] = [];

      for (const action of actions) {
        try {
          await this.executePendingAction(action);
          completedActions.push(action.id);
        } catch (error) {
          console.warn(`Erro ao executar ação pendente ${action.id}:`, error);
        }
      }

      // Remover ações completadas
      const remainingActions = actions.filter((action: any) => 
        !completedActions.includes(action.id)
      );

      if (remainingActions.length === 0) {
        localStorage.removeItem('pending_sync_actions');
      } else {
        localStorage.setItem('pending_sync_actions', JSON.stringify(remainingActions));
      }

      console.log(`✅ ${completedActions.length} ações sincronizadas`);
    } catch (error) {
      console.warn('Erro ao sincronizar dados pendentes:', error);
    }
  }

  /**
   * Executar ação pendente
   */
  private async executePendingAction(action: any): Promise<void> {
    switch (action.type) {
      case 'create_pet':
        await api.pets.create(action.data);
        break;
      case 'update_pet':
        await api.pets.update(action.petId, action.data);
        break;
      case 'delete_pet':
        await api.pets.delete(action.petId);
        break;
      case 'create_health_record':
        await api.health.createRecord(action.petId, action.data);
        break;
      case 'update_health_record':
        await api.health.updateRecord(action.recordId, action.data);
        break;
      case 'delete_health_record':
        await api.health.deleteRecord(action.recordId);
        break;
      case 'mark_notification_read':
        await api.notifications.markAsRead(action.notificationId);
        break;
      default:
        console.warn(`Tipo de ação desconhecido: ${action.type}`);
    }
  }

  /**
   * Adicionar ação para sincronização posterior (quando offline)
   */
  async addPendingAction(action: any): Promise<void> {
    try {
      const pendingActions = localStorage.getItem('pending_sync_actions');
      const actions = pendingActions ? JSON.parse(pendingActions) : [];
      
      actions.push({
        ...action,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString()
      });

      localStorage.setItem('pending_sync_actions', JSON.stringify(actions));
      console.log(`📝 Ação adicionada para sincronização: ${action.type}`);
    } catch (error) {
      console.error('Erro ao adicionar ação pendente:', error);
    }
  }

  /**
   * Registrar callback para eventos de sincronização
   */
  onSync(event: string, callback: Function): void {
    if (!this.syncCallbacks.has(event)) {
      this.syncCallbacks.set(event, []);
    }
    this.syncCallbacks.get(event)!.push(callback);
  }

  /**
   * Remover callback de eventos de sincronização
   */
  offSync(event: string, callback: Function): void {
    const callbacks = this.syncCallbacks.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Notificar callbacks registrados
   */
  private notifyCallbacks(event: string, data?: any): void {
    const callbacks = this.syncCallbacks.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.warn(`Erro ao executar callback de ${event}:`, error);
        }
      });
    }
  }

  /**
   * Atualizar timestamp da última sincronização
   */
  private updateLastSyncTime(): void {
    localStorage.setItem('last_sync_time', new Date().toISOString());
  }

  /**
   * Obter timestamp da última sincronização
   */
  getLastSyncTime(): string | null {
    return localStorage.getItem('last_sync_time');
  }

  /**
   * Forçar sincronização imediata
   */
  async forcSync(): Promise<boolean> {
    console.log('🔄 Forçando sincronização imediata...');
    return this.performSync();
  }

  /**
   * Verificar se dados estão sincronizados
   */
  isSynced(): boolean {
    try {
      const lastSync = this.getLastSyncTime();
      if (!lastSync) return false;

      const syncTime = new Date(lastSync);
      const now = new Date();
      const timeDiff = now.getTime() - syncTime.getTime();
      
      // Considerar sincronizado se última sync foi há menos de 1 minuto
      return timeDiff < 60000;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obter status da sincronização
   */
  getSyncStatus(): {
    lastSync: string | null;
    isSynced: boolean;
    pendingActions: number;
  } {
    const lastSync = this.getLastSyncTime();
    const isSynced = this.isSynced();
    
    const pendingActions = localStorage.getItem('pending_sync_actions');
    const pendingCount = pendingActions ? JSON.parse(pendingActions).length : 0;

    return {
      lastSync,
      isSynced,
      pendingActions: pendingCount
    };
  }

  /**
   * Limpar todos os dados de sincronização
   */
  clearSyncData(): void {
    const syncKeys = [
      'user_data', 'user_sync',
      'pets_data', 'pets_sync',
      'health_data', 'health_sync',
      'notifications_data', 'notifications_sync',
      'last_sync_time', 'pending_sync_actions'
    ];

    syncKeys.forEach(key => localStorage.removeItem(key));
    console.log('🗑️ Dados de sincronização limpos');
  }

  /**
   * Verificar conectividade e sincronizar se necessário
   */
  async checkAndSync(): Promise<void> {
    if (navigator.onLine) {
      if (!this.isSynced()) {
        await this.performSync();
      }
    } else {
      console.log('📱 Modo offline - dados serão sincronizados quando conectar');
    }
  }
}

export const syncService = new SyncService();

// Inicializar automaticamente quando online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('🌐 Conectividade restaurada - iniciando sincronização');
    syncService.checkAndSync();
  });

  window.addEventListener('offline', () => {
    console.log('📱 Modo offline ativado');
  });
}

export default syncService;