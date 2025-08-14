import '@testing-library/jest-dom';

// Mock environment variables
process.env.VITE_SUPABASE_URL = 'http://localhost:54321';
process.env.VITE_SUPABASE_ANON_KEY = 'test-key';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock crypto for Node.js environment
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => '123e4567-e89b-12d3-a456-426614174000',
    randomBytes: (size: number) => Buffer.alloc(size, 0),
    createHash: () => ({
      update: () => ({ digest: () => 'mock-hash' }),
    }),
    createHmac: () => ({
      update: () => ({ digest: () => 'mock-hmac' }),
    }),
  },
});

// Global test utilities
global.mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  full_name: 'Test User',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
};

global.mockTransaction = {
  id: 'test-txn-1',
  user_id: 'test-user-id',
  amount: 100,
  direction: 'debit' as const,
  merchant: 'Test Merchant',
  category: 'Food',
  timestamp: new Date(),
  created_at: '2023-01-01T00:00:00Z',
};
