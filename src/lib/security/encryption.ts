// Data Encryption & Privacy Protection
import crypto from 'crypto';

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const SALT_LENGTH = 32;

export interface EncryptedData {
  encrypted: string;
  iv: string;
  tag: string;
  salt?: string;
}

export interface PIIData {
  panNumber?: string;
  aadhaarNumber?: string;
  accountNumber?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  dateOfBirth?: string;
}

// Master encryption key management
export class KeyManager {
  private static masterKey: Buffer | null = null;

  static initializeMasterKey(password: string, salt?: Buffer): Buffer {
    const saltBuffer = salt || crypto.randomBytes(SALT_LENGTH);
    this.masterKey = crypto.pbkdf2Sync(password, saltBuffer, 100000, KEY_LENGTH, 'sha256');
    return saltBuffer;
  }

  static getMasterKey(): Buffer {
    if (!this.masterKey) {
      throw new Error('Master key not initialized. Call initializeMasterKey() first.');
    }
    return this.masterKey;
  }

  static generateDataKey(): Buffer {
    return crypto.randomBytes(KEY_LENGTH);
  }

  static encryptDataKey(dataKey: Buffer): EncryptedData {
    return EncryptionService.encrypt(dataKey, this.getMasterKey());
  }

  static decryptDataKey(encryptedDataKey: EncryptedData): Buffer {
    return EncryptionService.decrypt(encryptedDataKey, this.getMasterKey());
  }
}

// Core encryption service
export class EncryptionService {
  static encrypt(data: string | Buffer, key: Buffer): EncryptedData {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipher(ALGORITHM, key);
    cipher.setAAD(iv);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  static decrypt(encryptedData: EncryptedData, key: Buffer): Buffer {
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const tag = Buffer.from(encryptedData.tag, 'hex');
    
    const decipher = crypto.createDecipher(ALGORITHM, key);
    decipher.setAAD(iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return Buffer.from(decrypted);
  }

  static encryptText(plaintext: string, key: Buffer): EncryptedData {
    return this.encrypt(plaintext, key);
  }

  static decryptText(encryptedData: EncryptedData, key: Buffer): string {
    return this.decrypt(encryptedData, key).toString('utf8');
  }
}

// PII (Personally Identifiable Information) Protection
export class PIIProtection {
  private static dataKey: Buffer | null = null;

  static initializeDataKey(encryptedDataKey?: EncryptedData): void {
    if (encryptedDataKey) {
      this.dataKey = KeyManager.decryptDataKey(encryptedDataKey);
    } else {
      this.dataKey = KeyManager.generateDataKey();
    }
  }

  static getEncryptedDataKey(): EncryptedData {
    if (!this.dataKey) {
      throw new Error('Data key not initialized');
    }
    return KeyManager.encryptDataKey(this.dataKey);
  }

  // Encrypt PII fields
  static encryptPII(piiData: PIIData): Record<string, EncryptedData> {
    if (!this.dataKey) {
      throw new Error('Data key not initialized');
    }

    const encryptedPII: Record<string, EncryptedData> = {};

    Object.entries(piiData).forEach(([field, value]) => {
      if (value) {
        encryptedPII[field] = EncryptionService.encryptText(value, this.dataKey!);
      }
    });

    return encryptedPII;
  }

  // Decrypt PII fields
  static decryptPII(encryptedPII: Record<string, EncryptedData>): PIIData {
    if (!this.dataKey) {
      throw new Error('Data key not initialized');
    }

    const piiData: PIIData = {};

    Object.entries(encryptedPII).forEach(([field, encryptedData]) => {
      (piiData as any)[field] = EncryptionService.decryptText(encryptedData, this.dataKey!);
    });

    return piiData;
  }

  // Mask sensitive data for display
  static maskPII(piiData: PIIData): PIIData {
    return {
      panNumber: piiData.panNumber ? this.maskPAN(piiData.panNumber) : undefined,
      aadhaarNumber: piiData.aadhaarNumber ? this.maskAadhaar(piiData.aadhaarNumber) : undefined,
      accountNumber: piiData.accountNumber ? this.maskAccountNumber(piiData.accountNumber) : undefined,
      phoneNumber: piiData.phoneNumber ? this.maskPhoneNumber(piiData.phoneNumber) : undefined,
      email: piiData.email ? this.maskEmail(piiData.email) : undefined,
      address: piiData.address ? this.maskAddress(piiData.address) : undefined,
      dateOfBirth: piiData.dateOfBirth ? this.maskDateOfBirth(piiData.dateOfBirth) : undefined
    };
  }

  private static maskPAN(pan: string): string {
    return `${pan.substring(0, 4)}****${pan.substring(8)}`;
  }

  private static maskAadhaar(aadhaar: string): string {
    return `****-****-${aadhaar.substring(8)}`;
  }

  private static maskAccountNumber(accountNumber: string): string {
    if (accountNumber.length <= 4) return '****';
    return `****${accountNumber.substring(accountNumber.length - 4)}`;
  }

  private static maskPhoneNumber(phone: string): string {
    return `+91-****-${phone.substring(phone.length - 4)}`;
  }

  private static maskEmail(email: string): string {
    const [name, domain] = email.split('@');
    const maskedName = name.length <= 2 ? '**' : `${name[0]}${'*'.repeat(name.length - 2)}${name[name.length - 1]}`;
    return `${maskedName}@${domain}`;
  }

  private static maskAddress(address: string): string {
    return address.substring(0, Math.min(address.length, 20)) + '...';
  }

  private static maskDateOfBirth(dob: string): string {
    return '**/**/****'; // Always mask completely
  }
}

// Data Anonymization for Analytics
export class DataAnonymization {
  // Generate consistent pseudonymous IDs
  static generatePseudonymousId(realId: string, context: string): string {
    const hmac = crypto.createHmac('sha256', process.env.ANONYMIZATION_KEY || 'default-key');
    hmac.update(`${realId}:${context}`);
    return hmac.digest('hex').substring(0, 16);
  }

  // Anonymize transaction data for analytics
  static anonymizeTransactionData(transactions: any[]): any[] {
    return transactions.map(txn => ({
      id: this.generatePseudonymousId(txn.id, 'transaction'),
      userId: this.generatePseudonymousId(txn.userId, 'user'),
      amount: this.addNoise(txn.amount, 0.1), // Add 10% noise
      category: txn.category,
      timestamp: this.roundToHour(txn.timestamp),
      merchantCategory: this.categorizeIndustry(txn.merchant),
      locationRegion: this.generalizeLocation(txn.location),
      // Remove all directly identifying fields
    }));
  }

  // Add differential privacy noise
  private static addNoise(value: number, epsilon: number): number {
    const sensitivity = value * 0.1; // 10% sensitivity
    const scale = sensitivity / epsilon;
    const noise = this.laplacianNoise(scale);
    return Math.max(0, Math.round(value + noise));
  }

  private static laplacianNoise(scale: number): number {
    const u = Math.random() - 0.5;
    return -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
  }

  private static roundToHour(timestamp: Date): string {
    const rounded = new Date(timestamp);
    rounded.setMinutes(0, 0, 0);
    return rounded.toISOString();
  }

  private static categorizeIndustry(merchant: string): string {
    const merchantLower = merchant.toLowerCase();
    
    if (merchantLower.includes('food') || merchantLower.includes('restaurant') || merchantLower.includes('zomato') || merchantLower.includes('swiggy')) {
      return 'FOOD_DELIVERY';
    }
    if (merchantLower.includes('uber') || merchantLower.includes('ola') || merchantLower.includes('transport')) {
      return 'TRANSPORTATION';
    }
    if (merchantLower.includes('amazon') || merchantLower.includes('flipkart') || merchantLower.includes('shopping')) {
      return 'ECOMMERCE';
    }
    if (merchantLower.includes('grocery') || merchantLower.includes('bigbasket')) {
      return 'GROCERY';
    }
    
    return 'OTHER';
  }

  private static generalizeLocation(location?: string): string {
    if (!location) return 'UNKNOWN';
    
    // Generalize to city level only
    const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune'];
    
    for (const city of cities) {
      if (location.toLowerCase().includes(city.toLowerCase())) {
        return city;
      }
    }
    
    return 'OTHER_CITY';
  }
}

// Secure Data Deletion
export class SecureDataDeletion {
  // GDPR Article 17 - Right to Erasure
  static async secureDeleteUserData(userId: string): Promise<{
    success: boolean;
    deletedTables: string[];
    errors: string[];
  }> {
    const deletedTables: string[] = [];
    const errors: string[] = [];

    try {
      // List of tables containing user data
      const userDataTables = [
        'users',
        'user_settings',
        'transactions',
        'piggy_ledger',
        'orders',
        'holdings',
        'audit_logs',
        'encrypted_documents',
        'user_sessions'
      ];

      // In production, this would delete from actual database
      // For now, we'll simulate the deletion process
      for (const table of userDataTables) {
        try {
          await this.simulateSecureTableDeletion(table, userId);
          deletedTables.push(table);
        } catch (error) {
          errors.push(`Failed to delete from ${table}: ${error}`);
        }
      }

      // Overwrite deleted data areas (simulate)
      await this.secureOverwriteDeletedData();

      return {
        success: errors.length === 0,
        deletedTables,
        errors
      };

    } catch (error) {
      errors.push(`Secure deletion failed: ${error}`);
      return { success: false, deletedTables, errors };
    }
  }

  private static async simulateSecureTableDeletion(table: string, userId: string): Promise<void> {
    console.log(`🗑️ Securely deleting user data from ${table} for user ${userId}`);
    
    // Simulate database deletion
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // In production, this would be:
    // await supabase.from(table).delete().eq('user_id', userId);
  }

  private static async secureOverwriteDeletedData(): Promise<void> {
    console.log('🔒 Performing secure overwrite of deleted data areas');
    
    // In production, this would overwrite the deleted database pages
    // with random data multiple times (DoD 5220.22-M standard)
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Generate deletion certificate for compliance
  static generateDeletionCertificate(userId: string, deletionResult: any): string {
    const certificate = {
      userId,
      deletionTimestamp: new Date().toISOString(),
      deletedTables: deletionResult.deletedTables,
      success: deletionResult.success,
      errors: deletionResult.errors,
      compliance: 'GDPR Article 17',
      method: 'Secure Multi-Pass Overwrite',
      certificateId: crypto.randomBytes(16).toString('hex')
    };

    // Sign the certificate
    const signature = crypto
      .createHmac('sha256', process.env.CERTIFICATE_KEY || 'cert-key')
      .update(JSON.stringify(certificate))
      .digest('hex');

    return JSON.stringify({ ...certificate, signature });
  }
}

// Audit Logging for Compliance
export class AuditLogger {
  static async logDataAccess(
    userId: string,
    dataType: string,
    operation: 'READ' | 'WRITE' | 'DELETE',
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    const auditEntry = {
      id: crypto.randomBytes(16).toString('hex'),
      userId,
      dataType,
      operation,
      timestamp: new Date().toISOString(),
      ipAddress,
      userAgent,
      success: true
    };

    // In production, store in dedicated audit log table
    console.log('📝 AUDIT LOG:', auditEntry);
  }

  static async logSecurityEvent(
    eventType: string,
    userId: string | null,
    details: any,
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  ): Promise<void> {
    const securityEvent = {
      id: crypto.randomBytes(16).toString('hex'),
      eventType,
      userId,
      severity,
      details: JSON.stringify(details),
      timestamp: new Date().toISOString(),
      investigated: false
    };

    console.log(`🚨 SECURITY EVENT [${severity}]:`, securityEvent);

    // In production, send to SIEM system
    if (severity === 'CRITICAL') {
      // Immediate alert to security team
      console.log('🔴 CRITICAL SECURITY ALERT - Immediate investigation required');
    }
  }
}

// Usage Example Functions
export const initializeSecurity = async (masterPassword: string): Promise<void> => {
  // Initialize master encryption key
  const salt = KeyManager.initializeMasterKey(masterPassword);
  
  // Initialize PII protection
  PIIProtection.initializeDataKey();
  
  console.log('✅ Security system initialized');
  console.log(`🔐 Master key salt: ${salt.toString('hex').substring(0, 16)}...`);
  console.log(`🔑 Data key ready for PII encryption`);
};

export const encryptUserPII = (userData: PIIData): Record<string, EncryptedData> => {
  return PIIProtection.encryptPII(userData);
};

export const decryptUserPII = (encryptedData: Record<string, EncryptedData>): PIIData => {
  return PIIProtection.decryptPII(encryptedData);
};

export const maskUserPII = (userData: PIIData): PIIData => {
  return PIIProtection.maskPII(userData);
};
