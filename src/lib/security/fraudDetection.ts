// Fraud Detection & Financial Security System
import crypto from 'crypto';

export interface TransactionData {
  id: string;
  userId: string;
  amount: number;
  merchant: string;
  location?: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  paymentMethod: string;
  deviceFingerprint?: string;
}

export interface FraudScore {
  score: number; // 0-100 (100 = highest risk)
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reasons: string[];
  blocked: boolean;
  requiresReview: boolean;
}

export interface UserBehaviorProfile {
  userId: string;
  averageTransactionAmount: number;
  commonMerchants: string[];
  commonLocations: string[];
  commonTransactionTimes: { hour: number; count: number; }[];
  maxSingleTransaction: number;
  averageDailyTransactions: number;
  lastSeenDevices: string[];
  createdAt: Date;
  lastUpdated: Date;
}

// AML (Anti-Money Laundering) Risk Categories
export interface AMLRisk {
  userId: string;
  riskScore: number;
  category: 'LOW' | 'MEDIUM' | 'HIGH';
  flags: string[];
  monthlyVolume: number;
  suspiciousPatterns: string[];
  requiresManualReview: boolean;
}

export class FraudDetectionEngine {
  private static readonly FRAUD_THRESHOLDS = {
    AMOUNT_SPIKE: 5, // 5x normal amount
    VELOCITY_LIMIT: 10, // Max transactions in 1 hour
    DAILY_LIMIT: 50000, // Max daily amount
    LOCATION_CHANGE: 100, // km/hour travel speed
    DEVICE_CHANGE_PENALTY: 20,
    TIME_ANOMALY_PENALTY: 15,
    MERCHANT_ANOMALY_PENALTY: 10
  };

  static async analyzTransaction(
    transaction: TransactionData,
    userProfile: UserBehaviorProfile,
    recentTransactions: TransactionData[]
  ): Promise<FraudScore> {
    let fraudScore = 0;
    const reasons: string[] = [];

    // 1. Amount Analysis
    const amountRisk = this.analyzeAmount(transaction, userProfile);
    fraudScore += amountRisk.score;
    if (amountRisk.reason) reasons.push(amountRisk.reason);

    // 2. Velocity Analysis
    const velocityRisk = this.analyzeVelocity(recentTransactions);
    fraudScore += velocityRisk.score;
    if (velocityRisk.reason) reasons.push(velocityRisk.reason);

    // 3. Time Pattern Analysis
    const timeRisk = this.analyzeTimePattern(transaction, userProfile);
    fraudScore += timeRisk.score;
    if (timeRisk.reason) reasons.push(timeRisk.reason);

    // 4. Merchant Analysis
    const merchantRisk = this.analyzeMerchant(transaction, userProfile);
    fraudScore += merchantRisk.score;
    if (merchantRisk.reason) reasons.push(merchantRisk.reason);

    // 5. Device Analysis
    const deviceRisk = this.analyzeDevice(transaction, userProfile);
    fraudScore += deviceRisk.score;
    if (deviceRisk.reason) reasons.push(deviceRisk.reason);

    // 6. Location Analysis
    const locationRisk = await this.analyzeLocation(transaction, recentTransactions);
    fraudScore += locationRisk.score;
    if (locationRisk.reason) reasons.push(locationRisk.reason);

    // Determine risk level and actions
    const riskLevel = this.getRiskLevel(fraudScore);
    const blocked = fraudScore >= 80;
    const requiresReview = fraudScore >= 60;

    return {
      score: Math.min(fraudScore, 100),
      riskLevel,
      reasons,
      blocked,
      requiresReview
    };
  }

  private static analyzeAmount(
    transaction: TransactionData,
    profile: UserBehaviorProfile
  ): { score: number; reason?: string } {
    const avgAmount = profile.averageTransactionAmount;
    const maxAmount = profile.maxSingleTransaction;
    const ratio = transaction.amount / avgAmount;

    if (transaction.amount > 100000) {
      return { score: 40, reason: 'Extremely high transaction amount' };
    }

    if (ratio > this.FRAUD_THRESHOLDS.AMOUNT_SPIKE) {
      return { 
        score: 30, 
        reason: `Transaction amount ${ratio.toFixed(1)}x higher than usual` 
      };
    }

    if (transaction.amount > maxAmount * 2) {
      return { score: 25, reason: 'Amount exceeds historical maximum by 2x' };
    }

    return { score: 0 };
  }

  private static analyzeVelocity(
    recentTransactions: TransactionData[]
  ): { score: number; reason?: string } {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const hourlyTxns = recentTransactions.filter(t => t.timestamp > oneHourAgo);
    const dailyTxns = recentTransactions.filter(t => t.timestamp > oneDayAgo);

    const dailyAmount = dailyTxns.reduce((sum, t) => sum + t.amount, 0);

    if (hourlyTxns.length > this.FRAUD_THRESHOLDS.VELOCITY_LIMIT) {
      return { 
        score: 35, 
        reason: `${hourlyTxns.length} transactions in last hour` 
      };
    }

    if (dailyAmount > this.FRAUD_THRESHOLDS.DAILY_LIMIT) {
      return { 
        score: 30, 
        reason: `Daily transaction limit exceeded: ₹${dailyAmount.toLocaleString()}` 
      };
    }

    return { score: 0 };
  }

  private static analyzeTimePattern(
    transaction: TransactionData,
    profile: UserBehaviorProfile
  ): { score: number; reason?: string } {
    const hour = transaction.timestamp.getHours();
    const commonHours = profile.commonTransactionTimes.map(t => t.hour);

    // Check if transaction is during unusual hours
    if (!commonHours.includes(hour)) {
      // Very late night transactions (2-5 AM) are suspicious
      if (hour >= 2 && hour <= 5) {
        return { score: 20, reason: 'Transaction during unusual hours (2-5 AM)' };
      }
      
      return { score: 10, reason: 'Transaction outside normal hours' };
    }

    return { score: 0 };
  }

  private static analyzeMerchant(
    transaction: TransactionData,
    profile: UserBehaviorProfile
  ): { score: number; reason?: string } {
    const isKnownMerchant = profile.commonMerchants.includes(transaction.merchant);

    if (!isKnownMerchant) {
      // Check for high-risk merchant categories
      const highRiskKeywords = [
        'crypto', 'bitcoin', 'gambling', 'casino', 'betting', 
        'gift card', 'money transfer', 'wire transfer'
      ];

      const merchantLower = transaction.merchant.toLowerCase();
      const isHighRisk = highRiskKeywords.some(keyword => 
        merchantLower.includes(keyword)
      );

      if (isHighRisk) {
        return { 
          score: 25, 
          reason: `High-risk merchant category: ${transaction.merchant}` 
        };
      }

      return { score: 5, reason: 'New merchant' };
    }

    return { score: 0 };
  }

  private static analyzeDevice(
    transaction: TransactionData,
    profile: UserBehaviorProfile
  ): { score: number; reason?: string } {
    if (!transaction.deviceFingerprint) {
      return { score: 15, reason: 'Missing device fingerprint' };
    }

    const isKnownDevice = profile.lastSeenDevices.includes(transaction.deviceFingerprint);

    if (!isKnownDevice) {
      return { score: 20, reason: 'New device detected' };
    }

    return { score: 0 };
  }

  private static async analyzeLocation(
    transaction: TransactionData,
    recentTransactions: TransactionData[]
  ): Promise<{ score: number; reason?: string }> {
    if (!transaction.location) {
      return { score: 10, reason: 'Location data unavailable' };
    }

    // Check for impossible travel
    const lastTransaction = recentTransactions
      .filter(t => t.location)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

    if (lastTransaction && lastTransaction.location) {
      const timeDiff = (transaction.timestamp.getTime() - lastTransaction.timestamp.getTime()) / (1000 * 60 * 60); // hours
      const distance = this.calculateDistance(transaction.location, lastTransaction.location);
      const speed = distance / timeDiff;

      if (speed > this.FRAUD_THRESHOLDS.LOCATION_CHANGE) {
        return { 
          score: 35, 
          reason: `Impossible travel: ${distance.toFixed(0)}km in ${timeDiff.toFixed(1)}h` 
        };
      }
    }

    return { score: 0 };
  }

  private static calculateDistance(loc1: string, loc2: string): number {
    // Simplified distance calculation
    // In production, use proper geolocation APIs
    if (loc1 === loc2) return 0;
    
    // Mock calculation - return random distance for different locations
    const hash1 = crypto.createHash('md5').update(loc1).digest('hex');
    const hash2 = crypto.createHash('md5').update(loc2).digest('hex');
    
    return hash1 === hash2 ? 0 : Math.random() * 500;
  }

  private static getRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 30) return 'MEDIUM';
    return 'LOW';
  }
}

// AML (Anti-Money Laundering) Detection
export class AMLDetection {
  private static readonly AML_THRESHOLDS = {
    MONTHLY_VOLUME: 200000, // ₹2 Lakh per month
    ROUND_AMOUNT_FREQUENCY: 0.8, // 80% round amounts suspicious
    VELOCITY_SUSPICIOUS: 20, // 20 txns in short time
    STRUCTURING_AMOUNT: 49000 // Just under ₹50k reporting limit
  };

  static analyzeAMLRisk(
    userId: string,
    monthlyTransactions: TransactionData[]
  ): AMLRisk {
    let riskScore = 0;
    const flags: string[] = [];
    const suspiciousPatterns: string[] = [];

    const monthlyVolume = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);

    // 1. High Volume Analysis
    if (monthlyVolume > this.AML_THRESHOLDS.MONTHLY_VOLUME) {
      riskScore += 30;
      flags.push('HIGH_VOLUME');
      suspiciousPatterns.push(`Monthly volume: ₹${monthlyVolume.toLocaleString()}`);
    }

    // 2. Structuring Detection (Breaking large amounts into smaller ones)
    const structuringRisk = this.detectStructuring(monthlyTransactions);
    riskScore += structuringRisk.score;
    flags.push(...structuringRisk.flags);
    suspiciousPatterns.push(...structuringRisk.patterns);

    // 3. Round Amount Detection
    const roundAmountRisk = this.detectRoundAmounts(monthlyTransactions);
    riskScore += roundAmountRisk.score;
    if (roundAmountRisk.suspicious) {
      flags.push('ROUND_AMOUNTS');
      suspiciousPatterns.push('High frequency of round amounts');
    }

    // 4. Rapid Fire Transactions
    const rapidFireRisk = this.detectRapidFire(monthlyTransactions);
    riskScore += rapidFireRisk.score;
    flags.push(...rapidFireRisk.flags);

    const category = riskScore >= 70 ? 'HIGH' : riskScore >= 40 ? 'MEDIUM' : 'LOW';
    const requiresManualReview = riskScore >= 50;

    return {
      userId,
      riskScore: Math.min(riskScore, 100),
      category,
      flags,
      monthlyVolume,
      suspiciousPatterns,
      requiresManualReview
    };
  }

  private static detectStructuring(transactions: TransactionData[]): {
    score: number;
    flags: string[];
    patterns: string[];
  } {
    const flags: string[] = [];
    const patterns: string[] = [];
    let score = 0;

    // Look for multiple transactions just under reporting thresholds
    const nearThresholdTxns = transactions.filter(t => 
      t.amount >= 45000 && t.amount <= this.AML_THRESHOLDS.STRUCTURING_AMOUNT
    );

    if (nearThresholdTxns.length >= 5) {
      score += 40;
      flags.push('STRUCTURING');
      patterns.push(`${nearThresholdTxns.length} transactions near ₹50k threshold`);
    }

    // Look for same amounts repeated frequently
    const amountFrequency = new Map<number, number>();
    transactions.forEach(t => {
      amountFrequency.set(t.amount, (amountFrequency.get(t.amount) || 0) + 1);
    });

    const suspiciousAmounts = Array.from(amountFrequency.entries())
      .filter(([amount, count]) => count >= 3 && amount >= 10000)
      .map(([amount, count]) => ({ amount, count }));

    if (suspiciousAmounts.length > 0) {
      score += 20;
      flags.push('REPEATED_AMOUNTS');
      patterns.push(`Repeated amounts: ${suspiciousAmounts.map(s => 
        `₹${s.amount.toLocaleString()} (${s.count} times)`
      ).join(', ')}`);
    }

    return { score, flags, patterns };
  }

  private static detectRoundAmounts(transactions: TransactionData[]): {
    score: number;
    suspicious: boolean;
  } {
    const roundAmounts = transactions.filter(t => t.amount % 1000 === 0);
    const roundPercentage = roundAmounts.length / transactions.length;

    if (roundPercentage > this.AML_THRESHOLDS.ROUND_AMOUNT_FREQUENCY) {
      return { score: 25, suspicious: true };
    }

    return { score: 0, suspicious: false };
  }

  private static detectRapidFire(transactions: TransactionData[]): {
    score: number;
    flags: string[];
  } {
    const flags: string[] = [];
    let score = 0;

    // Sort transactions by time
    const sortedTxns = transactions.sort((a, b) => 
      a.timestamp.getTime() - b.timestamp.getTime()
    );

    // Look for clusters of transactions in short time periods
    for (let i = 0; i < sortedTxns.length - this.AML_THRESHOLDS.VELOCITY_SUSPICIOUS; i++) {
      const startTime = sortedTxns[i].timestamp;
      const endIndex = i + this.AML_THRESHOLDS.VELOCITY_SUSPICIOUS - 1;
      const endTime = sortedTxns[endIndex].timestamp;
      
      const timeDiff = (endTime.getTime() - startTime.getTime()) / (1000 * 60); // minutes

      if (timeDiff <= 60) { // 20 transactions in 1 hour
        score += 30;
        flags.push('RAPID_FIRE');
        break;
      }
    }

    return { score, flags };
  }
}

// Transaction Integrity Checker
export class TransactionIntegrity {
  static generateTransactionHash(transaction: TransactionData): string {
    const data = `${transaction.userId}${transaction.amount}${transaction.merchant}${transaction.timestamp.toISOString()}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  static verifyTransactionIntegrity(
    transaction: TransactionData,
    expectedHash: string
  ): boolean {
    const calculatedHash = this.generateTransactionHash(transaction);
    return calculatedHash === expectedHash;
  }

  static createTransactionSignature(
    transaction: TransactionData,
    secretKey: string
  ): string {
    const data = JSON.stringify({
      id: transaction.id,
      userId: transaction.userId,
      amount: transaction.amount,
      timestamp: transaction.timestamp.toISOString()
    });

    return crypto
      .createHmac('sha256', secretKey)
      .update(data)
      .digest('hex');
  }

  static verifyTransactionSignature(
    transaction: TransactionData,
    signature: string,
    secretKey: string
  ): boolean {
    const expectedSignature = this.createTransactionSignature(transaction, secretKey);
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }
}

// Suspicious Activity Monitor
export class SuspiciousActivityMonitor {
  private static suspiciousPatterns = new Map<string, number>();

  static reportSuspiciousActivity(
    userId: string,
    activityType: string,
    details: any
  ): void {
    const key = `${userId}:${activityType}`;
    const count = this.suspiciousPatterns.get(key) || 0;
    this.suspiciousPatterns.set(key, count + 1);

    // Alert if pattern exceeds threshold
    if (count + 1 >= 3) {
      this.triggerAlert(userId, activityType, details, count + 1);
    }
  }

  private static triggerAlert(
    userId: string,
    activityType: string,
    details: any,
    count: number
  ): void {
    console.log(`🚨 SUSPICIOUS ACTIVITY ALERT`, {
      userId,
      activityType,
      count,
      details,
      timestamp: new Date().toISOString()
    });

    // In production, send to monitoring system
    // - Alert security team
    // - Log to SIEM
    // - Create case for investigation
  }

  static getSuspiciousActivities(userId?: string): Map<string, number> {
    if (userId) {
      const userActivities = new Map<string, number>();
      for (const [key, count] of this.suspiciousPatterns) {
        if (key.startsWith(`${userId}:`)) {
          userActivities.set(key, count);
        }
      }
      return userActivities;
    }
    return this.suspiciousPatterns;
  }
}
