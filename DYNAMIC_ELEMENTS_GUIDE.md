# 🔄 Dynamic Elements Guide for UPI Piggy

## 🚨 **CRITICAL: Replace These Before Production**

### **1. Environment Variables (.env)**
```bash
# ❌ CURRENT (Fake/Test Keys)
VITE_RAZORPAY_KEY_ID=rzp_test_1DP5mmOlF5G5ag
VITE_RAZORPAY_KEY_SECRET=thiswillnotwork

# ✅ REPLACE WITH REAL KEYS
VITE_RAZORPAY_KEY_ID=rzp_test_YOUR_ACTUAL_KEY
VITE_RAZORPAY_KEY_SECRET=YOUR_ACTUAL_SECRET

# Get real keys from: https://dashboard.razorpay.com/app/keys
```

### **2. User Data (Currently Static/Mock)**

#### **A. User Information**
```javascript
// ❌ CURRENT (Static)
userId: 'demo_user'
customerId: 'demo_customer_' + Date.now()
name: 'Demo User'
email: 'demo@example.com'
phone: '+91-9999999999'

// ✅ SHOULD BE DYNAMIC
userId: user.id                    // From authentication
customerId: user.razorpayCustomerId // From user profile/database
name: user.name                    // From user profile
email: user.email                  // From authentication
phone: user.phone                  // From user profile
```

#### **B. Transaction History**
```javascript
// ❌ CURRENT (localStorage only)
localStorage.getItem('piggy_transactions')

// ✅ SHOULD BE DYNAMIC (Database + Real-time)
await fetch('/api/transactions/' + userId)
// Sync with backend database
// Real-time updates via WebSocket/SSE
```

#### **C. Round-off Settings**
```javascript
// ❌ CURRENT (Default/localStorage)
roundOffSettings: {
  enabled: true,           // Static default
  roundUpThreshold: 0.5,   // Static default
  maxRoundOff: 10,         // Static default
  investRoundOff: true     // Static default
}

// ✅ SHOULD BE DYNAMIC (User Preferences)
roundOffSettings: {
  enabled: user.preferences.roundOffEnabled,
  roundUpThreshold: user.preferences.roundUpThreshold,
  maxRoundOff: user.preferences.maxRoundOff,
  investRoundOff: user.preferences.investRoundOff
}
```

### **3. Investment Data (Currently Mock)**

#### **A. Available Balance**
```javascript
// ✅ ALREADY DYNAMIC
availableBalance: piggyState.piggyBalance  // From piggy-core hook

// But should sync with real bank account/wallet balance
```

#### **B. Portfolio Data**
```javascript
// ❌ CURRENT (Mock portfolios)
MockInvestmentAPI.getPortfolios()

// ✅ SHOULD BE DYNAMIC
await fetch('/api/portfolios')  // Real fund data
// NAV prices from live market data APIs
// Real fund performance data
```

#### **C. Investment Orders**
```javascript
// ❌ CURRENT (Mock investment)
MockInvestmentAPI.investMoney()

// ✅ SHOULD BE DYNAMIC
await fetch('/api/investments', {
  method: 'POST',
  body: JSON.stringify({
    userId,
    portfolioId,
    amount,
    paymentId: razorpayPaymentId
  })
})
// Real broker API integration (Zerodha, etc.)
```

### **4. Autopay Configuration (User-Specific)**

```javascript
// ❌ CURRENT (localStorage only)
localStorage.getItem('piggy_autopay_setup')

// ✅ SHOULD BE DYNAMIC
await fetch(`/api/users/${userId}/autopay`)
// Save to database
// User-specific settings
// Real Razorpay subscription management
```

## 🔧 **How to Make Things Dynamic**

### **Step 1: Get Real Razorpay Keys**
1. Go to https://dashboard.razorpay.com/
2. Sign up (FREE for testing)
3. Go to Settings → API Keys
4. Copy Test Key ID and Secret
5. Update your `.env` file

### **Step 2: Create Backend APIs**
You need these API endpoints:

```javascript
// User Management
GET    /api/user/me                 // Get current user
PUT    /api/user/preferences        // Update user preferences
GET    /api/user/autopay           // Get autopay settings
PUT    /api/user/autopay           // Update autopay settings

// Transactions
GET    /api/transactions/:userId    // Get user transactions
POST   /api/transactions           // Create new transaction
PUT    /api/transactions/:id       // Update transaction status

// Investments
GET    /api/portfolios             // Get available portfolios
POST   /api/investments           // Create investment order
GET    /api/investments/:userId   // Get user investments

// Razorpay Integration
POST   /api/razorpay/orders       // Create Razorpay order
POST   /api/razorpay/verify       // Verify payment signature
POST   /api/razorpay/webhook      // Handle Razorpay webhooks
```

### **Step 3: Update Frontend Services**

Replace localStorage with API calls:

```javascript
// Example: Dynamic User Service
class UserService {
  static async getCurrentUser() {
    const response = await fetch('/api/user/me');
    return response.json();
  }
  
  static async updatePreferences(preferences) {
    await fetch('/api/user/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences)
    });
  }
}

// Example: Dynamic Transaction Service  
class TransactionService {
  static async getTransactions(userId) {
    const response = await fetch(`/api/transactions/${userId}`);
    return response.json();
  }
  
  static async createTransaction(transactionData) {
    const response = await fetch('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData)
    });
    return response.json();
  }
}
```

### **Step 4: Real-time Updates**

Implement real-time updates for:
- Payment status changes
- Balance updates  
- Investment confirmations
- Autopay notifications

```javascript
// WebSocket for real-time updates
const ws = new WebSocket('ws://localhost:3000/ws');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  switch(data.type) {
    case 'PAYMENT_SUCCESS':
      updateTransactionStatus(data.transactionId, 'paid');
      break;
    case 'BALANCE_UPDATE':
      updatePiggyBalance(data.newBalance);
      break;
  }
};
```

## 📊 **Dynamic Data Flow**

```
User Action → Frontend → Backend API → Database
                    ↓
              Razorpay API → Payment Gateway
                    ↓
              Webhook → Backend → Real-time Update → Frontend
```

## 🧪 **Testing Dynamic Features**

### **With Real Razorpay Test Keys:**
1. Use real test keys from Razorpay dashboard
2. Test with ₹1 transactions (minimum amount)
3. Use test cards: 4111 1111 1111 1111
4. Test UPI with test VPA: success@razorpay

### **Dynamic Balance Testing:**
1. Start with real piggy balance
2. Make test investment
3. Verify balance reduces correctly
4. Check investment reflects in portfolio

### **User Preference Testing:**
1. Change round-off settings
2. Make payment with different amounts
3. Verify round-off calculation changes
4. Check settings persist for user

## 🚀 **Production Checklist**

- [ ] Replace Razorpay test keys with live keys
- [ ] Setup backend APIs for all user data
- [ ] Implement real payment verification
- [ ] Add webhook handling for payment status
- [ ] Setup real-time updates (WebSocket/SSE)
- [ ] Add proper error handling and retries
- [ ] Implement user authentication flow
- [ ] Add transaction reconciliation
- [ ] Setup monitoring and logging
- [ ] Add rate limiting and security measures

## 💡 **Current vs Production Architecture**

### **Current (Demo/Test):**
```
Frontend → localStorage → Mock APIs → Fake Razorpay Keys
```

### **Production (Dynamic):**
```
Frontend → Backend APIs → Database → Real Razorpay → Bank/UPI
                ↓
           Real Investment Platforms (Zerodha, etc.)
```

---

**Remember:** The current integration works perfectly for **testing and demo purposes**. For production, you need to replace the static/mock elements with real dynamic data and APIs.
