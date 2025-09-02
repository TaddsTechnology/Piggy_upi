import { toast } from '@/hooks/use-toast';
import UserService from './user-service';
import { razorpayService } from './razorpay-service';

// Types for KYC
export interface KYCFormData {
  // Personal Info
  fullName: string;
  dateOfBirth: string;
  gender: string;
  fatherName: string;
  motherName?: string;
  
  // Contact Info
  email: string;
  phone: string;
  
  // Address
  address: string;
  city: string;
  state: string;
  pincode: string;
  
  // Identity
  panNumber: string;
  aadhaarNumber: string;
  
  // Bank Details
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  
  // Income
  annualIncome: string;
  occupation: string;
}

export interface KYCDocuments {
  panCard: File | null;
  aadhaarCard: File | null;
  bankStatement: File | null;
  photo: File | null;
}

export interface KYCSubmission extends KYCFormData {
  documents: KYCDocuments;
}

export interface KYCStatus {
  status: 'pending' | 'in_progress' | 'verified' | 'rejected';
  verificationId: string;
  submittedAt: Date;
  documents: {
    pan: { status: string; url?: string };
    aadhaar: { status: string; url?: string };
    bankStatement: { status: string; url?: string };
    photo: { status: string; url?: string };
  };
  bankVerification?: {
    pennyDropStatus: 'pending' | 'success' | 'failed';
    verifiedAt?: Date;
  };
  razorpayCustomerId?: string;
}

export interface BankVerificationResult {
  success: boolean;
  accountHolderName?: string;
  error?: string;
}

class KYCService {
  private static baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  /**
   * Submit KYC data and documents for verification
   */
  static async submitKYC(data: KYCSubmission): Promise<{
    verificationId: string;
    razorpayCustomerId?: string;
  }> {
    const userId = UserService.getCurrentUserId();
    
    try {
      // 1. Upload documents to secure storage
      const documentUrls = await this.uploadDocuments(data.documents);
      
      // 2. Create KYC submission record
      const kycRecord = await this.createKYCRecord(userId, data, documentUrls);
      
      // 3. Create Razorpay customer for future payments
      let razorpayCustomerId: string | undefined;
      try {
        razorpayCustomerId = await this.createRazorpayCustomer({
          name: data.fullName,
          email: data.email,
          contact: data.phone
        });
      } catch (error) {
        console.warn('Razorpay customer creation failed:', error);
        // Don't fail KYC submission if Razorpay fails
      }
      
      // 4. Update user profile with KYC status and Razorpay customer ID
      await this.updateUserKYCStatus(userId, {
        kycStatus: 'in_progress',
        razorpayCustomerId
      });
      
      // 5. Store locally for immediate UI updates
      this.storeKYCStatusLocally({
        status: 'in_progress',
        verificationId: kycRecord.verificationId,
        submittedAt: new Date(),
        documents: {
          pan: { status: 'pending' },
          aadhaar: { status: 'pending' },
          bankStatement: { status: 'pending' },
          photo: { status: 'pending' }
        },
        razorpayCustomerId
      });
      
      // 6. Trigger background verification process
      this.initiateBackgroundVerification(kycRecord.verificationId);
      
      return {
        verificationId: kycRecord.verificationId,
        razorpayCustomerId
      };
      
    } catch (error) {
      console.error('KYC submission failed:', error);
      throw new Error('Failed to submit KYC. Please try again.');
    }
  }

  /**
   * Get current KYC status for user
   */
  static async getKYCStatus(userId?: string): Promise<KYCStatus | null> {
    const targetUserId = userId || UserService.getCurrentUserId();
    
    try {
      // Try to get from server first
      const response = await fetch(`${this.baseUrl}/kyc/status/${targetUserId}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        return await response.json();
      }
      
      // Fallback to local storage
      return this.getKYCStatusLocally();
      
    } catch (error) {
      console.error('Failed to fetch KYC status:', error);
      return this.getKYCStatusLocally();
    }
  }

  /**
   * Verify bank account using penny drop
   */
  static async verifyBankAccount(
    accountNumber: string,
    ifscCode: string,
    accountHolderName: string
  ): Promise<BankVerificationResult> {
    try {
      const response = await fetch(`${this.baseUrl}/kyc/verify-bank`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          accountNumber,
          ifscCode,
          accountHolderName
        })
      });

      if (!response.ok) {
        throw new Error('Bank verification request failed');
      }

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Bank Account Verified! ✅",
          description: `Account verified for ${result.accountHolderName}`,
          duration: 5000,
        });
      } else {
        toast({
          title: "Bank Verification Failed",
          description: result.error || "Please check your account details",
          variant: "destructive",
        });
      }
      
      return result;
      
    } catch (error) {
      console.error('Bank verification failed:', error);
      
      // Mock verification for demo
      const mockResult: BankVerificationResult = {
        success: true,
        accountHolderName: accountHolderName
      };
      
      toast({
        title: "Bank Account Verified! ✅ (Demo)",
        description: `Account verified for ${accountHolderName}`,
        duration: 5000,
      });
      
      return mockResult;
    }
  }

  /**
   * Check if KYC is required for a payment amount
   */
  static async isKYCRequiredForAmount(amount: number): Promise<{
    required: boolean;
    reason?: string;
    limit?: number;
  }> {
    const kycStatus = await this.getKYCStatus();
    
    // RBI guidelines for KYC requirements
    const SMALL_ACCOUNT_LIMIT = 10000; // ₹10,000 annual limit without full KYC
    const TRANSACTION_LIMIT = 5000; // ₹5,000 per transaction without KYC
    
    if (!kycStatus || kycStatus.status === 'pending') {
      if (amount > TRANSACTION_LIMIT) {
        return {
          required: true,
          reason: `KYC is required for transactions above ₹${TRANSACTION_LIMIT}`,
          limit: TRANSACTION_LIMIT
        };
      }
      return { required: false };
    }
    
    if (kycStatus.status === 'rejected') {
      return {
        required: true,
        reason: 'Your KYC was rejected. Please complete KYC to continue investing.'
      };
    }
    
    return { required: false };
  }

  /**
   * Update Razorpay customer information after KYC verification
   */
  static async updateRazorpayCustomerKYC(
    customerId: string,
    kycData: Partial<KYCFormData>
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/razorpay/customers/${customerId}/kyc`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: kycData.fullName,
          email: kycData.email,
          contact: kycData.phone,
          notes: {
            pan: kycData.panNumber,
            kyc_status: 'verified',
            updated_at: new Date().toISOString()
          }
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to update Razorpay customer KYC:', error);
      return false;
    }
  }

  /**
   * Get KYC compliance status for dashboard
   */
  static async getComplianceStatus(): Promise<{
    isCompliant: boolean;
    kycStatus: string;
    pendingActions: string[];
    nextSteps: string[];
  }> {
    const kycStatus = await this.getKYCStatus();
    
    if (!kycStatus) {
      return {
        isCompliant: false,
        kycStatus: 'not_started',
        pendingActions: ['Complete KYC verification'],
        nextSteps: ['Submit required documents', 'Verify bank account']
      };
    }
    
    const pendingActions: string[] = [];
    const nextSteps: string[] = [];
    
    // Check document statuses
    Object.entries(kycStatus.documents).forEach(([docType, doc]) => {
      if (doc.status === 'pending') {
        pendingActions.push(`${docType} verification pending`);
      } else if (doc.status === 'rejected') {
        pendingActions.push(`Re-submit ${docType} document`);
      }
    });
    
    // Check bank verification
    if (!kycStatus.bankVerification || kycStatus.bankVerification.pennyDropStatus !== 'success') {
      pendingActions.push('Bank account verification pending');
      nextSteps.push('Complete bank account verification');
    }
    
    const isCompliant = kycStatus.status === 'verified' && 
                       pendingActions.length === 0;
    
    if (!isCompliant && kycStatus.status === 'in_progress') {
      nextSteps.push('Wait for document verification (24-48 hours)');
    }
    
    return {
      isCompliant,
      kycStatus: kycStatus.status,
      pendingActions,
      nextSteps
    };
  }

  // Private helper methods
  private static async uploadDocuments(documents: KYCDocuments): Promise<{
    pan?: string;
    aadhaar?: string;
    bankStatement?: string;
    photo?: string;
  }> {
    const uploadPromises: Promise<{type: string, url: string}>[] = [];
    
    Object.entries(documents).forEach(([type, file]) => {
      if (file) {
        uploadPromises.push(this.uploadDocument(type, file));
      }
    });
    
    const uploadResults = await Promise.all(uploadPromises);
    
    return uploadResults.reduce((acc, {type, url}) => {
      acc[type as keyof typeof acc] = url;
      return acc;
    }, {} as any);
  }

  private static async uploadDocument(type: string, file: File): Promise<{type: string, url: string}> {
    // In production, upload to secure storage (AWS S3, Supabase Storage, etc.)
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      
      const response = await fetch(`${this.baseUrl}/kyc/upload-document`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Failed to upload ${type}`);
      }
      
      const result = await response.json();
      return { type, url: result.url };
      
    } catch (error) {
      console.error(`Document upload failed for ${type}:`, error);
      // Mock URL for demo
      return { 
        type, 
        url: `https://demo-storage.com/kyc/${type}_${Date.now()}.jpg`
      };
    }
  }

  private static async createKYCRecord(
    userId: string,
    data: KYCSubmission,
    documentUrls: any
  ): Promise<{ verificationId: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/kyc/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          personalInfo: {
            fullName: data.fullName,
            dateOfBirth: data.dateOfBirth,
            gender: data.gender,
            fatherName: data.fatherName,
            motherName: data.motherName
          },
          contactInfo: {
            email: data.email,
            phone: data.phone
          },
          address: {
            address: data.address,
            city: data.city,
            state: data.state,
            pincode: data.pincode
          },
          identity: {
            panNumber: data.panNumber,
            aadhaarNumber: data.aadhaarNumber
          },
          bankDetails: {
            accountNumber: data.accountNumber,
            ifscCode: data.ifscCode,
            bankName: data.bankName
          },
          financialInfo: {
            annualIncome: data.annualIncome,
            occupation: data.occupation
          },
          documents: documentUrls
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create KYC record');
      }

      return await response.json();
      
    } catch (error) {
      console.error('Failed to create KYC record:', error);
      // Mock response for demo
      return {
        verificationId: 'KYC' + Date.now().toString().slice(-6)
      };
    }
  }

  private static async createRazorpayCustomer(customerData: {
    name: string;
    email: string;
    contact: string;
  }): Promise<string> {
    const response = await fetch(`${this.baseUrl}/razorpay/customers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: customerData.name,
        email: customerData.email,
        contact: customerData.contact,
        notes: {
          source: 'upi_piggy',
          created_at: new Date().toISOString()
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create Razorpay customer');
    }

    const result = await response.json();
    return result.id;
  }

  private static async updateUserKYCStatus(
    userId: string,
    updates: { kycStatus: string; razorpayCustomerId?: string }
  ): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/users/${userId}/kyc-status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
    } catch (error) {
      console.error('Failed to update user KYC status:', error);
    }
  }

  private static async initiateBackgroundVerification(verificationId: string): Promise<void> {
    try {
      // Trigger background verification process
      await fetch(`${this.baseUrl}/kyc/verify/${verificationId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Failed to initiate background verification:', error);
    }
  }

  private static storeKYCStatusLocally(status: KYCStatus): void {
    localStorage.setItem('kyc_status', JSON.stringify(status));
    localStorage.setItem('kyc_verification_id', status.verificationId);
  }

  private static getKYCStatusLocally(): KYCStatus | null {
    try {
      const stored = localStorage.getItem('kyc_status');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private static getAuthToken(): string {
    return localStorage.getItem('auth_token') || 'demo_token';
  }
}

export default KYCService;
