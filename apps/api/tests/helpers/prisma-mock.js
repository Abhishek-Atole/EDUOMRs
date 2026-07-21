import { jest } from '@jest/globals';

const mockPrisma = {
  $transaction: jest.fn(),
  $on: jest.fn(),
  user: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  institution: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
  subscriptionPlan: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  paymentUpload: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  subscription: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
};

const mockModule = {
  getPrisma: () => mockPrisma,
  disconnectPrisma: jest.fn(),
};

export function getMockPrisma() {
  return mockPrisma;
}

export function getPrismaMockModule() {
  return mockModule;
}
