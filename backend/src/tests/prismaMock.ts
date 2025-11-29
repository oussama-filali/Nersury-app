import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

// Mock complet du module db
jest.mock('../config/db', () => {
  const mockPrisma = mockDeep<PrismaClient>();
  return {
    __esModule: true,
    default: mockPrisma,
  };
});

import prisma from '../config/db';

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
