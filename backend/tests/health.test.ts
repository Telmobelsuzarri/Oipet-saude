/**
 * Testes básicos para health check
 */

import request from 'supertest';
import app from '@/index';

describe('Health Check', () => {
  test('GET /health should return 200', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toMatchObject({
      status: 'OK',
      service: 'OiPet Saúde Backend'
    });

    expect(response.body.timestamp).toBeDefined();
    expect(response.body.environment).toBe('test');
  });

  test('GET /nonexistent should return 404', async () => {
    const response = await request(app)
      .get('/nonexistent')
      .expect(404);

    expect(response.body).toMatchObject({
      success: false,
      error: expect.stringContaining('Rota não encontrada')
    });
  });
});