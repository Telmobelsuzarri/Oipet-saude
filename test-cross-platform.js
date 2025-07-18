/**
 * Cross-Platform Integration Tests
 * Testa funcionalidades específicas entre Mobile e Web
 */

const axios = require('axios');
const chalk = require('chalk');

const BACKEND_URL = 'https://oipet-saude-production.up.railway.app/api';

// Test data
const testUser = {
  name: 'Cross Platform Test User',
  email: `crossplatform-test-${Date.now()}@example.com`,
  password: 'Test123456'
};

const testPet = {
  name: 'Max Cross Platform',
  species: 'dog',
  breed: 'Labrador',
  birthDate: '2020-06-15',
  weight: 30.0,
  height: 65.0,
  gender: 'male',
  isNeutered: true
};

// Helper functions
const log = {
  info: (msg) => console.log(chalk.blue('ℹ'), msg),
  success: (msg) => console.log(chalk.green('✓'), msg),
  error: (msg) => console.log(chalk.red('✗'), msg),
  warning: (msg) => console.log(chalk.yellow('⚠'), msg),
  title: (msg) => console.log(chalk.bold.cyan('\n' + msg))
};

class CrossPlatformTester {
  constructor() {
    this.mobileSession = null;
    this.webSession = null;
    this.testData = {
      userId: null,
      petId: null,
      healthRecordId: null,
      notificationId: null
    };
  }

  /**
   * Simular sessão mobile
   */
  async createMobileSession() {
    try {
      log.info('Criando sessão mobile...');
      
      // Register user
      await axios.post(`${BACKEND_URL}/auth/register`, testUser);
      
      // Login
      const loginResponse = await axios.post(`${BACKEND_URL}/auth/login`, {
        email: testUser.email,
        password: testUser.password
      });

      this.mobileSession = {
        token: loginResponse.data.data.accessToken,
        refreshToken: loginResponse.data.data.refreshToken,
        user: loginResponse.data.data.user,
        headers: {
          Authorization: `Bearer ${loginResponse.data.data.accessToken}`,
          'X-Platform': 'mobile',
          'X-App-Version': '1.0.0'
        }
      };

      this.testData.userId = this.mobileSession.user._id;
      log.success('Sessão mobile criada com sucesso');
      return true;
    } catch (error) {
      log.error(`Erro ao criar sessão mobile: ${error.response?.data?.message || error.message}`);
      return false;
    }
  }

  /**
   * Simular sessão web (reutilizando login)
   */
  async createWebSession() {
    try {
      log.info('Criando sessão web...');
      
      // Login with same credentials
      const loginResponse = await axios.post(`${BACKEND_URL}/auth/login`, {
        email: testUser.email,
        password: testUser.password
      });

      this.webSession = {
        token: loginResponse.data.data.accessToken,
        refreshToken: loginResponse.data.data.refreshToken,
        user: loginResponse.data.data.user,
        headers: {
          Authorization: `Bearer ${loginResponse.data.data.accessToken}`,
          'X-Platform': 'web',
          'X-App-Version': '1.0.0'
        }
      };

      log.success('Sessão web criada com sucesso');
      return true;
    } catch (error) {
      log.error(`Erro ao criar sessão web: ${error.response?.data?.message || error.message}`);
      return false;
    }
  }

  /**
   * Teste 1: Criar pet no mobile, verificar no web
   */
  async testPetSyncMobileToWeb() {
    try {
      log.title('🧪 Teste 1: Pet criado no Mobile → visível no Web');

      // 1. Criar pet no mobile
      const createResponse = await axios.post(`${BACKEND_URL}/pets`, testPet, {
        headers: this.mobileSession.headers
      });
      
      this.testData.petId = createResponse.data.data._id;
      log.success('Pet criado no mobile');

      // 2. Buscar pet no web (simular delay)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const webPetsResponse = await axios.get(`${BACKEND_URL}/pets`, {
        headers: this.webSession.headers
      });

      const pets = webPetsResponse.data.data;
      const createdPet = pets.find(pet => pet._id === this.testData.petId);

      if (createdPet && createdPet.name === testPet.name) {
        log.success('Pet sincronizado corretamente no web');
        return true;
      } else {
        log.error('Pet não encontrado no web');
        return false;
      }
    } catch (error) {
      log.error(`Erro no teste mobile→web: ${error.message}`);
      return false;
    }
  }

  /**
   * Teste 2: Atualizar pet no web, verificar no mobile
   */
  async testPetSyncWebToMobile() {
    try {
      log.title('🧪 Teste 2: Pet atualizado no Web → sincronizado no Mobile');

      // 1. Atualizar pet no web
      const updatedData = {
        ...testPet,
        weight: 32.0,
        notes: 'Atualizado via web'
      };

      await axios.put(`${BACKEND_URL}/pets/${this.testData.petId}`, updatedData, {
        headers: this.webSession.headers
      });
      log.success('Pet atualizado no web');

      // 2. Verificar no mobile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mobilePetResponse = await axios.get(`${BACKEND_URL}/pets/${this.testData.petId}`, {
        headers: this.mobileSession.headers
      });

      const pet = mobilePetResponse.data.data;
      
      if (pet.weight === 32.0) {
        log.success('Atualização sincronizada no mobile');
        return true;
      } else {
        log.error('Atualização não sincronizada no mobile');
        return false;
      }
    } catch (error) {
      log.error(`Erro no teste web→mobile: ${error.message}`);
      return false;
    }
  }

  /**
   * Teste 3: Registro de saúde cross-platform
   */
  async testHealthRecordSync() {
    try {
      log.title('🧪 Teste 3: Registros de saúde cross-platform');

      // 1. Criar registro de saúde no mobile
      const healthRecord = {
        date: new Date().toISOString(),
        weight: 32.0,
        activity: {
          type: 'Caminhada',
          duration: 45,
          intensity: 'medium'
        },
        mood: 'happy',
        notes: 'Pet muito ativo, teste cross-platform'
      };

      const createHealthResponse = await axios.post(
        `${BACKEND_URL}/health/pets/${this.testData.petId}`, 
        healthRecord,
        { headers: this.mobileSession.headers }
      );

      this.testData.healthRecordId = createHealthResponse.data.data._id;
      log.success('Registro de saúde criado no mobile');

      // 2. Verificar no web
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const webHealthResponse = await axios.get(
        `${BACKEND_URL}/health/pets/${this.testData.petId}`,
        { headers: this.webSession.headers }
      );

      const healthRecords = webHealthResponse.data.data;
      const syncedRecord = healthRecords.find(record => record._id === this.testData.healthRecordId);

      if (syncedRecord && syncedRecord.notes.includes('cross-platform')) {
        log.success('Registro de saúde sincronizado no web');

        // 3. Atualizar registro no web
        const updatedRecord = {
          ...healthRecord,
          notes: 'Atualizado via web - teste cross-platform'
        };

        await axios.put(
          `${BACKEND_URL}/health/${this.testData.healthRecordId}`,
          updatedRecord,
          { headers: this.webSession.headers }
        );
        log.success('Registro atualizado no web');

        // 4. Verificar atualização no mobile
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mobileHealthResponse = await axios.get(
          `${BACKEND_URL}/health/${this.testData.healthRecordId}`,
          { headers: this.mobileSession.headers }
        );

        const updatedMobileRecord = mobileHealthResponse.data.data;
        
        if (updatedMobileRecord.notes.includes('Atualizado via web')) {
          log.success('Atualização de registro sincronizada no mobile');
          return true;
        } else {
          log.error('Atualização não sincronizada no mobile');
          return false;
        }
      } else {
        log.error('Registro não sincronizado no web');
        return false;
      }
    } catch (error) {
      log.error(`Erro no teste de registros de saúde: ${error.message}`);
      return false;
    }
  }

  /**
   * Teste 4: Notificações cross-platform
   */
  async testNotificationSync() {
    try {
      log.title('🧪 Teste 4: Notificações cross-platform');

      // 1. Buscar notificações no mobile
      const mobileNotificationsResponse = await axios.get(`${BACKEND_URL}/notifications`, {
        headers: this.mobileSession.headers
      });

      const mobileNotifications = mobileNotificationsResponse.data.data;
      
      if (mobileNotifications.length > 0) {
        const notification = mobileNotifications[0];
        this.testData.notificationId = notification._id;

        // 2. Marcar como lida no mobile
        await axios.put(`${BACKEND_URL}/notifications/${notification._id}/read`, {}, {
          headers: this.mobileSession.headers
        });
        log.success('Notificação marcada como lida no mobile');

        // 3. Verificar status no web
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const webNotificationsResponse = await axios.get(`${BACKEND_URL}/notifications`, {
          headers: this.webSession.headers
        });

        const webNotifications = webNotificationsResponse.data.data;
        const syncedNotification = webNotifications.find(n => n._id === notification._id);

        if (syncedNotification && syncedNotification.isRead) {
          log.success('Status de notificação sincronizado no web');
          return true;
        } else {
          log.error('Status de notificação não sincronizado');
          return false;
        }
      } else {
        log.warning('Nenhuma notificação disponível para teste');
        return true; // Not a failure, just no data
      }
    } catch (error) {
      log.error(`Erro no teste de notificações: ${error.message}`);
      return false;
    }
  }

  /**
   * Teste 5: Dados do usuário cross-platform
   */
  async testUserDataSync() {
    try {
      log.title('🧪 Teste 5: Dados do usuário cross-platform');

      // 1. Atualizar perfil no web
      const updatedProfile = {
        name: 'Cross Platform Updated Name',
        phone: '(11) 99999-9999'
      };

      await axios.put(`${BACKEND_URL}/users/profile`, updatedProfile, {
        headers: this.webSession.headers
      });
      log.success('Perfil atualizado no web');

      // 2. Verificar no mobile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mobileProfileResponse = await axios.get(`${BACKEND_URL}/users/profile`, {
        headers: this.mobileSession.headers
      });

      const mobileProfile = mobileProfileResponse.data.data;
      
      if (mobileProfile.name === updatedProfile.name) {
        log.success('Perfil sincronizado no mobile');
        return true;
      } else {
        log.error('Perfil não sincronizado no mobile');
        return false;
      }
    } catch (error) {
      log.error(`Erro no teste de perfil: ${error.message}`);
      return false;
    }
  }

  /**
   * Teste 6: Simultaneidade de operações
   */
  async testConcurrentOperations() {
    try {
      log.title('🧪 Teste 6: Operações simultâneas');

      // 1. Operações simultâneas (mobile e web)
      const promises = [
        // Mobile: Criar segundo pet
        axios.post(`${BACKEND_URL}/pets`, {
          ...testPet,
          name: 'Pet Mobile Concurrent',
          species: 'cat'
        }, { headers: this.mobileSession.headers }),

        // Web: Atualizar pet existente
        axios.put(`${BACKEND_URL}/pets/${this.testData.petId}`, {
          ...testPet,
          weight: 33.0,
          notes: 'Concurrent update from web'
        }, { headers: this.webSession.headers })
      ];

      const results = await Promise.allSettled(promises);
      
      const allSuccessful = results.every(result => result.status === 'fulfilled');
      
      if (allSuccessful) {
        log.success('Operações simultâneas executadas com sucesso');

        // 2. Verificar consistência
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const finalPetsResponse = await axios.get(`${BACKEND_URL}/pets`, {
          headers: this.mobileSession.headers
        });

        const finalPets = finalPetsResponse.data.data;
        
        if (finalPets.length >= 2) {
          log.success('Dados consistentes após operações simultâneas');
          return true;
        } else {
          log.error('Inconsistência nos dados após operações simultâneas');
          return false;
        }
      } else {
        log.error('Falha em operações simultâneas');
        return false;
      }
    } catch (error) {
      log.error(`Erro no teste de simultaneidade: ${error.message}`);
      return false;
    }
  }

  /**
   * Limpeza dos dados de teste
   */
  async cleanup() {
    try {
      log.info('Limpando dados de teste...');

      // Delete health record
      if (this.testData.healthRecordId) {
        await axios.delete(`${BACKEND_URL}/health/${this.testData.healthRecordId}`, {
          headers: this.mobileSession.headers
        }).catch(() => {});
      }

      // Delete all pets created during test
      const petsResponse = await axios.get(`${BACKEND_URL}/pets`, {
        headers: this.mobileSession.headers
      });
      
      const pets = petsResponse.data.data;
      for (const pet of pets) {
        await axios.delete(`${BACKEND_URL}/pets/${pet._id}`, {
          headers: this.mobileSession.headers
        }).catch(() => {});
      }

      log.success('Limpeza concluída');
    } catch (error) {
      log.warning('Erro na limpeza - alguns dados podem permanecer');
    }
  }

  /**
   * Executar todos os testes
   */
  async runAllTests() {
    log.title('🚀 Executando Testes Cross-Platform');

    // Setup
    const mobileSessionOK = await this.createMobileSession();
    if (!mobileSessionOK) return false;

    const webSessionOK = await this.createWebSession();
    if (!webSessionOK) return false;

    // Execute tests
    const testResults = {
      petMobileToWeb: await this.testPetSyncMobileToWeb(),
      petWebToMobile: await this.testPetSyncWebToMobile(),
      healthRecords: await this.testHealthRecordSync(),
      notifications: await this.testNotificationSync(),
      userData: await this.testUserDataSync(),
      concurrent: await this.testConcurrentOperations()
    };

    // Cleanup
    await this.cleanup();

    // Results
    log.title('📊 Resultados dos Testes Cross-Platform');
    
    const results = Object.entries(testResults);
    results.forEach(([test, passed]) => {
      const status = passed ? chalk.green('✓ PASSOU') : chalk.red('✗ FALHOU');
      console.log(`${test}: ${status}`);
    });

    const allPassed = Object.values(testResults).every(result => result === true);
    
    if (allPassed) {
      console.log(chalk.bold.green('\n🎉 Todos os testes cross-platform passaram!'));
      console.log(chalk.green('✅ Sincronização entre Mobile e Web está funcionando perfeitamente'));
      return true;
    } else {
      console.log(chalk.bold.red('\n❌ Alguns testes cross-platform falharam'));
      console.log(chalk.red('Verifique a sincronização entre as plataformas'));
      return false;
    }
  }
}

async function main() {
  const tester = new CrossPlatformTester();
  const success = await tester.runAllTests();
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main().catch(error => {
    console.error(chalk.red(`Erro inesperado: ${error.message}`));
    process.exit(1);
  });
}

module.exports = CrossPlatformTester;