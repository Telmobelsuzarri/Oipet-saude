/**
 * Testes para sistema de autenticação
 */

import request from 'supertest';
import app from '@/index';
import { User } from '@/models/User';
import { authService } from '@/services/authService';

describe('Authentication System', () => {
  // Limpar usuários antes de cada teste
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    const validUserData = {
      name: 'João Silva',
      email: 'joao@email.com',
      password: '123456',
      phone: '(11) 99999-9999',
    };

    test('deve registrar usuário com dados válidos', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(validUserData.email);
      expect(response.body.data.user.name).toBe(validUserData.name);
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();
      expect(response.body.data.user.password).toBeUndefined();
    });

    test('deve retornar erro com email inválido', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...validUserData,
          email: 'email-invalido',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Dados inválidos');
    });

    test('deve retornar erro com senha muito curta', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...validUserData,
          password: '123',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toContain('Senha deve ter pelo menos 6 caracteres');
    });

    test('deve retornar erro com email duplicado', async () => {
      // Criar usuário primeiro
      await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(201);

      // Tentar criar novamente
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Email já está em uso');
    });
  });

  describe('POST /api/auth/login', () => {
    const userData = {
      name: 'João Silva',
      email: 'joao@email.com',
      password: '123456',
    };

    beforeEach(async () => {
      // Criar usuário para testes de login
      await request(app)
        .post('/api/auth/register')
        .send(userData);
    });

    test('deve fazer login com credenciais válidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();
    });

    test('deve retornar erro com email inválido', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'email-inexistente@email.com',
          password: userData.password,
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Credenciais inválidas');
    });

    test('deve retornar erro com senha inválida', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: 'senha-errada',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Credenciais inválidas');
    });
  });

  describe('POST /api/auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      // Criar usuário e obter refresh token
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'João Silva',
          email: 'joao@email.com',
          password: '123456',
        });

      refreshToken = response.body.data.tokens.refreshToken;
    });

    test('deve renovar token com refresh token válido', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.user).toBeDefined();
    });

    test('deve retornar erro com refresh token inválido', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'token-invalido' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Token de refresh inválido');
    });
  });

  describe('POST /api/auth/logout', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Criar usuário e obter access token
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'João Silva',
          email: 'joao@email.com',
          password: '123456',
        });

      accessToken = response.body.data.tokens.accessToken;
    });

    test('deve fazer logout com token válido', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logout realizado com sucesso');
    });

    test('deve retornar erro sem token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Token de acesso não fornecido');
    });
  });

  describe('AuthService', () => {
    describe('validatePasswordStrength', () => {
      test('deve validar senha forte', () => {
        const result = authService.validatePasswordStrength('MinhaSenh@123');
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      test('deve rejeitar senha fraca', () => {
        const result = authService.validatePasswordStrength('123');
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });

      test('deve rejeitar senha sem maiúscula', () => {
        const result = authService.validatePasswordStrength('minhasenha123');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Senha deve conter pelo menos uma letra maiúscula');
      });

      test('deve rejeitar senha sem minúscula', () => {
        const result = authService.validatePasswordStrength('MINHASENHA123');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Senha deve conter pelo menos uma letra minúscula');
      });

      test('deve rejeitar senha sem número', () => {
        const result = authService.validatePasswordStrength('MinhaSenha');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Senha deve conter pelo menos um número');
      });
    });

    describe('generateRandomPassword', () => {
      test('deve gerar senha com tamanho especificado', () => {
        const password = authService.generateRandomPassword(10);
        expect(password.length).toBe(10);
      });

      test('deve gerar senha com tamanho padrão', () => {
        const password = authService.generateRandomPassword();
        expect(password.length).toBe(12);
      });

      test('deve gerar senhas diferentes', () => {
        const password1 = authService.generateRandomPassword();
        const password2 = authService.generateRandomPassword();
        expect(password1).not.toBe(password2);
      });
    });

    describe('Token Management', () => {
      let user: any;

      beforeEach(async () => {
        user = await User.create({
          name: 'João Silva',
          email: 'joao@email.com',
          password: '123456',
        });
      });

      test('deve gerar access token válido', () => {
        const token = authService.generateAccessToken(user);
        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
      });

      test('deve gerar refresh token válido', () => {
        const token = authService.generateRefreshToken(user);
        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
      });

      test('deve verificar access token válido', () => {
        const token = authService.generateAccessToken(user);
        const decoded = authService.verifyAccessToken(token);
        expect(decoded.userId).toBe(user._id.toString());
        expect(decoded.email).toBe(user.email);
        expect(decoded.type).toBe('access');
      });

      test('deve verificar refresh token válido', () => {
        const token = authService.generateRefreshToken(user);
        const decoded = authService.verifyRefreshToken(token);
        expect(decoded.userId).toBe(user._id.toString());
        expect(decoded.email).toBe(user.email);
        expect(decoded.type).toBe('refresh');
      });

      test('deve rejeitar token inválido', () => {
        expect(() => {
          authService.verifyAccessToken('token-invalido');
        }).toThrow('Token inválido');
      });

      test('deve rejeitar refresh token como access token', () => {
        const refreshToken = authService.generateRefreshToken(user);
        expect(() => {
          authService.verifyAccessToken(refreshToken);
        }).toThrow('Token inválido');
      });
    });
  });
});