import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  FraudDetectionEngine,
  AMLDetection,
  TransactionIntegrity,
  SuspiciousActivityMonitor,
  type TransactionData,
  type UserBehaviorProfile,
  type AMLRisk
} from '../fraudDetection';

describe('FraudDetectionEngine', () => {
  let mockUserProfile: UserBehaviorProfile;
  let mockTransaction: TransactionData;
  let mockRecentTransactions: TransactionData[];

  beforeEach(() => {
    mockUserProfile = {
      userId: 'user123',
      averageTransactionAmount: 500,
      commonMerchants: ['Zomato', 'Uber', 'Amazon'],
      commonLocations: ['Mumbai', 'Delhi'],
      commonTransactionTimes: [
        { hour: 12, count: 10 },
        { hour: 19, count: 8 }
      ],
      maxSingleTransaction: 2000,
      averageDailyTransactions: 5,
      lastSeenDevices: ['device123', 'device456'],
      createdAt: new Date('2023-01-01'),
      lastUpdated: new Date('2023-06-01')
    };

    mockTransaction = {
      id: 'txn123',
      userId: 'user123',
      amount: 600,
      merchant: 'Swiggy',
      location: 'Mumbai',
      timestamp: new Date(),
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      paymentMethod: 'UPI',
      deviceFingerprint: 'device123'
    };

    mockRecentTransactions = [];
  });

  describe('analyzTransaction', () => {
    it('should return low risk for normal transaction', async () => {
      const result = await FraudDetectionEngine.analyzTransaction(
        mockTransaction,
        mockUserProfile,
        mockRecentTransactions
      );

      expect(result.riskLevel).toBe('LOW');
      expect(result.score).toBeLessThan(30);
      expect(result.blocked).toBe(false);
      expect(result.requiresReview).toBe(false);
    });

    it('should detect high amount anomaly', async () => {
      const highAmountTransaction = {
        ...mockTransaction,
        amount: 10000 // 20x normal amount
      };

      const result = await FraudDetectionEngine.analyzTransaction(
        highAmountTransaction,
        mockUserProfile,
        mockRecentTransactions
      );

      expect(result.score).toBeGreaterThan(30);
      expect(result.reasons).toContain('Transaction amount 20.0x higher than usual');
      expect(result.riskLevel).toBe('MEDIUM');
    });

    it('should detect velocity anomaly', async () => {
      // Create many recent transactions
      const manyTransactions = Array.from({ length: 15 }, (_, i) => ({
        ...mockTransaction,
        id: `txn${i}`,
        timestamp: new Date(Date.now() - i * 60000) // 1 minute apart
      }));

      const result = await FraudDetectionEngine.analyzTransaction(
        mockTransaction,
        mockUserProfile,
        manyTransactions
      );

      expect(result.score).toBeGreaterThan(30);
      expect(result.reasons.some(r => r.includes('transactions in last hour'))).toBe(true);
    });

    it('should detect unusual time pattern', async () => {
      const lateNightTransaction = {
        ...mockTransaction,
        timestamp: new Date('2023-07-15T03:00:00Z') // 3 AM
      };

      const result = await FraudDetectionEngine.analyzTransaction(
        lateNightTransaction,
        mockUserProfile,
        mockRecentTransactions
      );

      expect(result.score).toBeGreaterThan(0);
      expect(result.reasons.some(r => r.includes('normal hours'))).toBe(true);
    });

    it('should detect new merchant risk', async () => {
      const newMerchantTransaction = {
        ...mockTransaction,
        merchant: 'Unknown Crypto Exchange'
      };

      const result = await FraudDetectionEngine.analyzTransaction(
        newMerchantTransaction,
        mockUserProfile,
        mockRecentTransactions
      );

      expect(result.score).toBeGreaterThan(0);
      expect(result.reasons).toContain('High-risk merchant category: Unknown Crypto Exchange');
    });

    it('should detect new device risk', async () => {
      const newDeviceTransaction = {
        ...mockTransaction,
        deviceFingerprint: 'unknown_device'
      };

      const result = await FraudDetectionEngine.analyzTransaction(
        newDeviceTransaction,
        mockUserProfile,
        mockRecentTransactions
      );

      expect(result.score).toBeGreaterThan(0);
      expect(result.reasons).toContain('New device detected');
    });

    it('should block high-risk transactions', async () => {
      const highRiskTransaction = {
        ...mockTransaction,
        amount: 150000, // Very high amount
        merchant: 'Bitcoin Casino',
        deviceFingerprint: 'unknown_device',
        timestamp: new Date('2023-07-15T03:00:00Z')
      };

      const result = await FraudDetectionEngine.analyzTransaction(
        highRiskTransaction,
        mockUserProfile,
        mockRecentTransactions
      );

      expect(result.score).toBeGreaterThan(80);
      expect(result.riskLevel).toBe('CRITICAL');
      expect(result.blocked).toBe(true);
      expect(result.requiresReview).toBe(true);
    });
  });
});

describe('AMLDetection', () => {
  let mockMonthlyTransactions: TransactionData[];

  beforeEach(() => {
    mockMonthlyTransactions = Array.from({ length: 10 }, (_, i) => ({
      id: `txn${i}`,
      userId: 'user123',
      amount: 5000 + i * 1000,
      merchant: `Merchant${i}`,
      timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      paymentMethod: 'UPI'
    }));
  });

  describe('analyzeAMLRisk', () => {
    it('should return low risk for normal transaction volume', () => {
      const result = AMLDetection.analyzeAMLRisk('user123', mockMonthlyTransactions);

      expect(result.category).toBe('LOW');
      expect(result.riskScore).toBeLessThan(40);
      expect(result.requiresManualReview).toBe(false);
    });

    it('should detect high volume risk', () => {
      const highVolumeTransactions = Array.from({ length: 50 }, (_, i) => ({
        id: `txn${i}`,
        userId: 'user123',
        amount: 10000,
        merchant: `Merchant${i}`,
        timestamp: new Date(),
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        paymentMethod: 'UPI'
      }));

      const result = AMLDetection.analyzeAMLRisk('user123', highVolumeTransactions);

      expect(result.category).toBe('HIGH');
      expect(result.flags).toContain('HIGH_VOLUME');
      expect(result.monthlyVolume).toBe(500000);
    });

    it('should detect structuring patterns', () => {
      const structuringTransactions = Array.from({ length: 10 }, (_, i) => ({
        id: `txn${i}`,
        userId: 'user123',
        amount: 48000, // Just under 50k threshold
        merchant: `Merchant${i}`,
        timestamp: new Date(),
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        paymentMethod: 'UPI'
      }));

      const result = AMLDetection.analyzeAMLRisk('user123', structuringTransactions);

      expect(result.flags).toContain('STRUCTURING');
      expect(result.suspiciousPatterns.some(p => p.includes('near ₹50k threshold'))).toBe(true);
    });

    it('should detect repeated amounts', () => {
      const repeatedAmountTransactions = Array.from({ length: 5 }, (_, i) => ({
        id: `txn${i}`,
        userId: 'user123',
        amount: 25000, // Same amount repeated
        merchant: `Merchant${i}`,
        timestamp: new Date(),
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        paymentMethod: 'UPI'
      }));

      const result = AMLDetection.analyzeAMLRisk('user123', repeatedAmountTransactions);

      expect(result.flags).toContain('REPEATED_AMOUNTS');
      expect(result.suspiciousPatterns.some(p => p.includes('₹25,000 (5 times)'))).toBe(true);
    });

    it('should detect round amounts pattern', () => {
      const roundAmountTransactions = Array.from({ length: 10 }, (_, i) => ({
        id: `txn${i}`,
        userId: 'user123',
        amount: (i + 1) * 10000, // All round amounts
        merchant: `Merchant${i}`,
        timestamp: new Date(),
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        paymentMethod: 'UPI'
      }));

      const result = AMLDetection.analyzeAMLRisk('user123', roundAmountTransactions);

      expect(result.flags).toContain('ROUND_AMOUNTS');
      expect(result.suspiciousPatterns).toContain('High frequency of round amounts');
    });
  });
});

describe('TransactionIntegrity', () => {
  let mockTransaction: TransactionData;

  beforeEach(() => {
    mockTransaction = {
      id: 'txn123',
      userId: 'user123',
      amount: 1000,
      merchant: 'Test Merchant',
      timestamp: new Date('2023-07-15T12:00:00Z'),
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      paymentMethod: 'UPI'
    };
  });

  describe('generateTransactionHash', () => {
    it('should generate consistent hash for same transaction', () => {
      const hash1 = TransactionIntegrity.generateTransactionHash(mockTransaction);
      const hash2 = TransactionIntegrity.generateTransactionHash(mockTransaction);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 hex string
    });

    it('should generate different hash for different transactions', () => {
      const hash1 = TransactionIntegrity.generateTransactionHash(mockTransaction);
      
      const differentTransaction = { ...mockTransaction, amount: 2000 };
      const hash2 = TransactionIntegrity.generateTransactionHash(differentTransaction);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyTransactionIntegrity', () => {
    it('should verify correct transaction hash', () => {
      const expectedHash = TransactionIntegrity.generateTransactionHash(mockTransaction);
      const isValid = TransactionIntegrity.verifyTransactionIntegrity(mockTransaction, expectedHash);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect transaction hash', () => {
      const isValid = TransactionIntegrity.verifyTransactionIntegrity(mockTransaction, 'wrong-hash');

      expect(isValid).toBe(false);
    });
  });

  describe('createTransactionSignature', () => {
    it('should create valid HMAC signature', () => {
      const signature = TransactionIntegrity.createTransactionSignature(mockTransaction, 'secret-key');

      expect(signature).toHaveLength(64); // HMAC-SHA256 hex string
      expect(signature).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should create different signatures with different keys', () => {
      const sig1 = TransactionIntegrity.createTransactionSignature(mockTransaction, 'key1');
      const sig2 = TransactionIntegrity.createTransactionSignature(mockTransaction, 'key2');

      expect(sig1).not.toBe(sig2);
    });
  });

  describe('verifyTransactionSignature', () => {
    it('should verify correct signature', () => {
      const secretKey = 'test-secret-key';
      const signature = TransactionIntegrity.createTransactionSignature(mockTransaction, secretKey);
      const isValid = TransactionIntegrity.verifyTransactionSignature(mockTransaction, signature, secretKey);

      expect(isValid).toBe(true);
    });

    it('should reject signature with wrong key', () => {
      const signature = TransactionIntegrity.createTransactionSignature(mockTransaction, 'key1');
      const isValid = TransactionIntegrity.verifyTransactionSignature(mockTransaction, signature, 'key2');

      expect(isValid).toBe(false);
    });
  });
});

describe('SuspiciousActivityMonitor', () => {
  beforeEach(() => {
    // Reset static state
    vi.clearAllMocks();
  });

  describe('reportSuspiciousActivity', () => {
    it('should track suspicious activity counts', () => {
      SuspiciousActivityMonitor.reportSuspiciousActivity('user123', 'failed_login', { attempts: 1 });
      SuspiciousActivityMonitor.reportSuspiciousActivity('user123', 'failed_login', { attempts: 2 });

      const activities = SuspiciousActivityMonitor.getSuspiciousActivities('user123');
      expect(activities.get('user123:failed_login')).toBe(2);
    });

    it('should trigger alert after threshold reached', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Report activity 3 times to trigger alert
      SuspiciousActivityMonitor.reportSuspiciousActivity('user123', 'failed_login', { attempts: 1 });
      SuspiciousActivityMonitor.reportSuspiciousActivity('user123', 'failed_login', { attempts: 2 });
      SuspiciousActivityMonitor.reportSuspiciousActivity('user123', 'failed_login', { attempts: 3 });

      expect(consoleSpy).toHaveBeenCalledWith(
        '🚨 SUSPICIOUS ACTIVITY ALERT',
        expect.objectContaining({
          userId: 'user123',
          activityType: 'failed_login',
          count: 3
        })
      );

      consoleSpy.mockRestore();
    });
  });

  describe('getSuspiciousActivities', () => {
    it('should return all activities when no userId provided', () => {
      SuspiciousActivityMonitor.reportSuspiciousActivity('user1', 'activity1', {});
      SuspiciousActivityMonitor.reportSuspiciousActivity('user2', 'activity2', {});

      const allActivities = SuspiciousActivityMonitor.getSuspiciousActivities();
      expect(allActivities.size).toBeGreaterThanOrEqual(2);
    });

    it('should return only user-specific activities when userId provided', () => {
      SuspiciousActivityMonitor.reportSuspiciousActivity('user1', 'activity1', {});
      SuspiciousActivityMonitor.reportSuspiciousActivity('user2', 'activity2', {});

      const user1Activities = SuspiciousActivityMonitor.getSuspiciousActivities('user1');
      expect(user1Activities.size).toBe(1);
      expect(user1Activities.has('user1:activity1')).toBe(true);
      expect(user1Activities.has('user2:activity2')).toBe(false);
    });
  });
});
