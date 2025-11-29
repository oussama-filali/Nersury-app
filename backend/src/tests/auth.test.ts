import request from 'supertest';
import { prismaMock } from './prismaMock';
import { hashPassword } from '../utils/hashing';
import app from '../app';

// Mock du module de hashing pour éviter de ralentir les tests
jest.mock('../utils/hashing', () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
}));

// Mock du module JWT pour éviter les erreurs de configuration
jest.mock('../utils/jwt', () => ({
  generateTokens: jest.fn(() => ({
    accessToken: 'mock_access_token',
    refreshToken: 'mock_refresh_token'
  })),
  verifyRefreshToken: jest.fn(),
}));

describe('Auth Controller', () => {
  
  describe('POST /api/v1/auth/register/parent', () => {
    
    it('should register a new parent successfully', async () => {
      const parentData = {
        email: 'test@parent.com',
        password: 'password123',
        firstname: 'John',
        lastname: 'Doe',
        phone: '0612345678',
        address: '123 Rue Test'
      };

      // Mock Prisma responses
      prismaMock.parent.findUnique.mockResolvedValue(null); // Email not taken
      (hashPassword as jest.Mock).mockResolvedValue('hashed_password');
      prismaMock.parent.create.mockResolvedValue({
        id: 'parent-123',
        ...parentData,
        password: 'hashed_password',
        createdAt: new Date(),
        updatedAt: new Date(),
        profilePicture: null,
        isVerified: false
      } as any);

      const res = await request(app)
        .post('/api/v1/auth/register/parent')
        .send(parentData);

      // Debugging output if test fails
      if (res.status !== 201) {
        console.error('Test failed response:', res.body);
      }

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.user.email).toBe(parentData.email);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
    });

    it('should return 409 if email already exists', async () => {
      const parentData = {
        email: 'existing@parent.com',
        password: 'password123',
        firstname: 'John',
        lastname: 'Doe',
        phone: '0612345678',
        address: '123 Rue Test'
      };

      prismaMock.parent.findUnique.mockResolvedValue({
        id: 'existing-123',
        email: parentData.email
      } as any);

      const res = await request(app)
        .post('/api/v1/auth/register/parent')
        .send(parentData);

      expect(res.status).toBe(409);
      expect(res.body.message).toBe('Cet email est déjà utilisé');
    });
  });
});
