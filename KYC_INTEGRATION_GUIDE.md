# KYC Integration with Razorpay - Complete Guide

## Overview
This guide explains the comprehensive KYC (Know Your Customer) integration implemented in the UPI Piggy financial app, including seamless integration with Razorpay payment gateway for regulatory compliance.

## 📋 Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Implementation](#implementation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Security](#security)
- [Compliance](#compliance)

## ✨ Features

### 1. Complete KYC Workflow
- **4-Step KYC Process**: Personal Info → Address → Financial Details → Document Upload
- **Document Verification**: PAN, Aadhaar, Bank Statement, Photo
- **Bank Account Verification**: Penny drop validation
- **Real-time Status Updates**: Progress tracking and notifications

### 2. Razorpay Integration
- **Customer Creation**: Automatic Razorpay customer setup after KYC
- **Payment Validation**: KYC checks before payment processing
- **Transaction Limits**: RBI-compliant transaction limits enforcement
- **Enhanced Prefill**: KYC-verified user data for seamless payments

### 3. Compliance Features
- **RBI Guidelines**: Adherence to regulatory requirements
- **Transaction Limits**: ₹5,000 per transaction, ₹10,000 annual limit without full KYC
- **Document Security**: Encrypted storage and secure handling
- **Audit Trail**: Complete verification history

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   KYC Service   │────│ Razorpay Service │────│ Payment Gateway │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Database      │    │  User Service   │    │   File Storage  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Implementation

### 1. Core Files

#### KYC Service (`src/lib/kyc-service.ts`)
```typescript
// Main KYC service handling all KYC operations
class KYCService {
  static async submitKYC(data: KYCSubmission): Promise<{
    verificationId: string;
    razorpayCustomerId?: string;
  }>;
  
  static async getKYCStatus(userId?: string): Promise<KYCStatus | null>;
  
  static async verifyBankAccount(
    accountNumber: string,
    ifscCode: string,
    accountHolderName: string
  ): Promise<BankVerificationResult>;
  
  static async isKYCRequiredForAmount(amount: number): Promise<{
    required: boolean;
    reason?: string;
    limit?: number;
  }>;
}
```

#### Enhanced KYC Page (`src/pages/KYCPage.tsx`)
- Multi-step form with validation
- Real-time bank account verification
- Document upload with progress tracking
- Integration with KYC service

#### KYC Status Component (`src/components/KYCStatusCard.tsx`)
- Dashboard widget showing compliance status
- Progress tracking and next steps
- Direct navigation to KYC completion

### 2. Razorpay Integration

#### Enhanced Razorpay Service (`src/lib/razorpay-service.ts`)
```typescript
// KYC validation before payment
async createOrder(amount: number): Promise<any> {
  // Check KYC requirements
  const kycCheck = await KYCService.isKYCRequiredForAmount(amount);
  if (kycCheck.required) {
    throw new Error(`KYC_REQUIRED: ${kycCheck.reason}`);
  }
  
  // Proceed with order creation...
}
```

### 3. Database Schema

#### KYC Documents Table
```sql
CREATE TABLE kyc_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    document_type TEXT CHECK (document_type IN ('pan', 'aadhaar', 'bank_statement', 'selfie')) NOT NULL,
    document_url TEXT,
    document_number TEXT, -- Encrypted
    verification_status TEXT CHECK (verification_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
    rejection_reason TEXT,
    verified_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Users Table (Enhanced)
```sql
CREATE TABLE users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    pan_number TEXT, -- Encrypted
    aadhaar_hash TEXT, -- Hashed for privacy
    kyc_status TEXT CHECK (kyc_status IN ('pending', 'in_progress', 'verified', 'rejected')) DEFAULT 'pending',
    razorpay_customer_id TEXT, -- Added for Razorpay integration
    -- ... other fields
);
```

## 📱 Usage

### 1. Starting KYC Process
```typescript
// User initiates KYC from dashboard
navigate('/kyc');

// KYC page loads with user's existing data
const { user } = useAuth();
const [formData, setFormData] = useState<LocalKYCFormData>({
  fullName: user?.user_metadata?.full_name || '',
  email: user?.email || '',
  // ... other fields
});
```

### 2. Document Upload
```typescript
// File upload with validation
const handleFileChange = (field: keyof LocalKYCFormData, file: File | null) => {
  setFormData(prev => ({ ...prev, [field]: file }));
};

// Validation before submission
const validateStep = (step: number): boolean => {
  switch (step) {
    case 4: // Documents step
      return !!(formData.panCard && formData.aadhaarCard && 
               formData.bankStatement && formData.photo);
    // ... other steps
  }
};
```

### 3. Bank Account Verification
```typescript
// Real-time bank verification
const handleBankVerification = async () => {
  setBankVerifying(true);
  try {
    const result = await KYCService.verifyBankAccount(
      formData.accountNumber,
      formData.ifscCode,
      formData.fullName
    );
    if (result.success) {
      toast({ title: "Bank Account Verified! ✅" });
    }
  } catch (error) {
    console.error('Bank verification failed:', error);
  } finally {
    setBankVerifying(false);
  }
};
```

### 4. Payment with KYC Check
```typescript
// Before creating payment order
try {
  const order = await razorpayService.createOrder(1500, 'Investment');
  // Proceed with payment...
} catch (error) {
  if (error.message.startsWith('KYC_REQUIRED:')) {
    // Show KYC requirement dialog
    showKYCRequiredModal(error.message);
  }
}
```

### 5. Dashboard Integration
```typescript
// Show KYC status on dashboard
import KYCStatusCard from '@/components/KYCStatusCard';

function Dashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <KYCStatusCard showFullDetails={true} />
      {/* Other dashboard components */}
    </div>
  );
}
```

## 🔗 API Endpoints

### KYC Endpoints
```
POST /api/kyc/submit              # Submit KYC data
GET  /api/kyc/status/:userId      # Get KYC status
POST /api/kyc/verify-bank         # Verify bank account
POST /api/kyc/upload-document     # Upload KYC document
POST /api/kyc/verify/:verificationId  # Trigger verification
```

### Razorpay Integration
```
POST /api/razorpay/customers      # Create Razorpay customer
PUT  /api/razorpay/customers/:id/kyc  # Update customer KYC
POST /api/razorpay/customers/:id/payments  # Record payment
```

### User Management
```
PUT  /api/users/:id/kyc-status    # Update user KYC status
GET  /api/users/me                # Get current user with KYC
```

## 🔒 Security

### 1. Data Encryption
- **PAN Numbers**: Encrypted before storage
- **Aadhaar Numbers**: Hashed for privacy
- **Bank Details**: Encrypted sensitive information
- **Documents**: Secure cloud storage with access controls

### 2. Access Control
- **Row Level Security**: Users can only access their own data
- **API Authentication**: Bearer token validation
- **Document Access**: Signed URLs with expiration

### 3. Audit Trail
```sql
-- Audit logs for all KYC actions
INSERT INTO audit_logs (user_id, action, resource_type, resource_id, timestamp)
VALUES (?, 'kyc_submitted', 'kyc_documents', ?, NOW());
```

## 📋 Compliance

### 1. RBI Guidelines
- **KYC Requirements**: Full compliance with RBI norms
- **Transaction Limits**: Enforced as per regulations
- **Document Standards**: Accepted document types and formats

### 2. Transaction Limits
```typescript
// Without KYC
const WITHOUT_KYC_LIMITS = {
  perTransaction: 5000,    // ₹5,000
  annualLimit: 10000      // ₹10,000
};

// With verified KYC
const WITH_KYC_LIMITS = {
  perTransaction: 1000000,  // ₹10,00,000
  annualLimit: 10000000    // ₹1,00,00,000
};
```

### 3. Document Requirements
- **PAN Card**: Mandatory for investments
- **Aadhaar Card**: Government ID verification
- **Bank Statement**: Account ownership proof
- **Photo**: Identity verification

## 🎯 Benefits

### For Users
- **Seamless Experience**: Integrated KYC within the app
- **Real-time Updates**: Progress tracking and notifications
- **Higher Limits**: Increased transaction limits post-verification
- **Security**: Enhanced account security and fraud protection

### For Business
- **Regulatory Compliance**: Full adherence to RBI/SEBI guidelines
- **Risk Management**: Reduced fraud and compliance risks
- **Better UX**: Streamlined onboarding and payment flow
- **Scalability**: Supports growth with compliant infrastructure

## 🚀 Getting Started

### 1. Environment Setup
```env
# Add to .env file
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_RAZORPAY_KEY_SECRET=your_razorpay_key_secret
VITE_API_URL=your_backend_api_url
```

### 2. Backend Setup
- Configure KYC document storage (AWS S3, Supabase Storage)
- Set up document verification APIs
- Implement bank verification service
- Configure Razorpay webhook handlers

### 3. Testing
```bash
# Test KYC flow
npm run test:kyc

# Test Razorpay integration
npm run test:payments

# Test compliance checks
npm run test:compliance
```

## 📚 Additional Resources

- [RBI Guidelines for KYC](https://rbi.org.in/scripts/BS_ViewMasDirections.aspx?id=11566)
- [Razorpay KYC Documentation](https://razorpay.com/docs/customers/)
- [SEBI Investment Guidelines](https://sebi.gov.in/legal/regulations.html)

## 🤝 Support

For implementation support or questions:
- Create an issue in the repository
- Check the documentation wiki
- Contact the development team

---

**Note**: This implementation provides a robust foundation for KYC compliance in financial applications. Always consult with legal and compliance teams before deploying to production.
