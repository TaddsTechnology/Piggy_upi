import { toast } from '@/hooks/use-toast';
import UserService from './user-service';

// UPI Autopay Types
export interface UPIMandateRequest {
  id: string;
  userId: string;
  upiId: string;
  maxAmount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'as_required';
  startDate: Date;
  endDate: Date;
  merchantId: string;
  merchantName: string;
  description: string;
  status: 'initiated' | 'pending_approval' | 'approved' | 'rejected' | 'cancelled' | 'expired';
  razorpayMandateId?: string;
  bankReference?: string;
  createdAt: Date;
  approvedAt?: Date;
}

export interface AutopaySetupFlow {
  step: 'collect_upi' | 'create_mandate' | 'pending_approval' | 'approved' | 'failed';
  mandateRequest?: UPIMandateRequest;
  approvalUrl?: string;
  qrCode?: string;
  instructions: string[];
}

export interface AutopayExecution {
  id: string;
  mandateId: string;
  amount: number;
  description: string;
  status: 'initiated' | 'success' | 'failed' | 'insufficient_funds';
  razorpayPaymentId?: string;
  failureReason?: string;
  executedAt: Date;
}

class UPIAutopayService {
  private static baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  
  /**
   * Step 1: Initiate UPI Autopay Setup
   */
  static async initiateAutopaySetup(
    upiId: string,
    maxAmount: number,
    frequency: 'daily' | 'weekly' | 'monthly' = 'monthly'
  ): Promise<AutopaySetupFlow> {
    const userId = UserService.getCurrentUserId();
    
    try {
      // Validate UPI ID format
      if (!this.isValidUPIId(upiId)) {
        throw new Error('Please enter a valid UPI ID (e.g., yourname@paytm)');
      }

      // Create mandate request
      const mandateRequest = await this.createMandateRequest({
        userId,
        upiId,
        maxAmount,
        frequency,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        merchantName: 'UPI Piggy',
        description: `Autopay for investments up to ₹${maxAmount}`
      });

      return {
        step: 'create_mandate',
        mandateRequest,
        instructions: [
          'We are creating your UPI autopay mandate...',
          'You will receive a notification in your UPI app shortly',
          'Please approve the mandate to activate autopay'
        ]
      };

    } catch (error) {
      console.error('Failed to initiate autopay setup:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to setup autopay');
    }
  }

  /**
   * Step 2: Create UPI Mandate Request
   */
  private static async createMandateRequest(data: {
    userId: string;
    upiId: string;
    maxAmount: number;
    frequency: string;
    startDate: Date;
    endDate: Date;
    merchantName: string;
    description: string;
  }): Promise<UPIMandateRequest> {
    try {
      const response = await fetch(`${this.baseUrl}/upi/create-mandate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customer_id: data.userId,
          vpa: data.upiId,
          amount: data.maxAmount * 100, // Convert to paise
          frequency: data.frequency,
          start_at: Math.floor(data.startDate.getTime() / 1000),
          expire_at: Math.floor(data.endDate.getTime() / 1000),
          description: data.description,
          merchant_id: 'UPI_PIGGY',
          notes: {
            purpose: 'investment_autopay',
            app: 'upi_piggy'
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create UPI mandate');
      }

      const result = await response.json();
      
      // Store mandate request locally for tracking
      const mandateRequest: UPIMandateRequest = {
        id: result.id || `mandate_${Date.now()}`,
        userId: data.userId,
        upiId: data.upiId,
        maxAmount: data.maxAmount,
        frequency: data.frequency as any,
        startDate: data.startDate,
        endDate: data.endDate,
        merchantId: 'UPI_PIGGY',
        merchantName: data.merchantName,
        description: data.description,
        status: 'pending_approval',
        razorpayMandateId: result.id,
        createdAt: new Date()
      };

      // Save to local storage for demo
      this.saveMandateRequest(mandateRequest);
      
      return mandateRequest;

    } catch (error) {
      console.error('Mandate creation failed:', error);
      
      // Mock mandate for demo purposes
      const mockMandate: UPIMandateRequest = {
        id: `mandate_${Date.now()}`,
        userId: data.userId,
        upiId: data.upiId,
        maxAmount: data.maxAmount,
        frequency: data.frequency as any,
        startDate: data.startDate,
        endDate: data.endDate,
        merchantId: 'UPI_PIGGY',
        merchantName: data.merchantName,
        description: data.description,
        status: 'pending_approval',
        bankReference: `UPI${Date.now()}`,
        createdAt: new Date()
      };
      
      this.saveMandateRequest(mockMandate);
      return mockMandate;
    }
  }

  /**
   * Step 3: Check Mandate Status (Called periodically)
   */
  static async checkMandateStatus(mandateId: string): Promise<AutopaySetupFlow> {
    try {
      const response = await fetch(`${this.baseUrl}/upi/mandate-status/${mandateId}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Fallback to local storage for demo
        return this.getMockMandateStatus(mandateId);
      }

      const result = await response.json();
      
      return this.mapStatusToFlow(result);

    } catch (error) {
      console.error('Failed to check mandate status:', error);
      return this.getMockMandateStatus(mandateId);
    }
  }

  /**
   * Step 4: Execute Autopay Payment
   */
  static async executeAutopayment(
    mandateId: string, 
    amount: number, 
    description: string = 'Investment via Autopay'
  ): Promise<AutopayExecution> {
    try {
      const response = await fetch(`${this.baseUrl}/upi/execute-autopay`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mandate_id: mandateId,
          amount: amount * 100, // Convert to paise
          description,
          currency: 'INR'
        })
      });

      if (!response.ok) {
        throw new Error('Autopay execution failed');
      }

      const result = await response.json();
      
      const execution: AutopayExecution = {
        id: result.id || `autopay_${Date.now()}`,
        mandateId,
        amount,
        description,
        status: result.status === 'captured' ? 'success' : 'failed',
        razorpayPaymentId: result.razorpay_payment_id,
        executedAt: new Date()
      };

      // Store execution record
      this.saveAutopayExecution(execution);

      if (execution.status === 'success') {
        toast({
          title: "Autopay Successful! 🎉",
          description: `₹${amount} invested automatically via UPI autopay`,
          duration: 5000,
        });
      } else {
        toast({
          title: "Autopay Failed",
          description: `Failed to execute autopay of ₹${amount}. Please check your UPI app.`,
          variant: "destructive",
        });
      }

      return execution;

    } catch (error) {
      console.error('Autopay execution failed:', error);
      
      // Mock successful execution for demo
      const mockExecution: AutopayExecution = {
        id: `autopay_${Date.now()}`,
        mandateId,
        amount,
        description,
        status: 'success',
        razorpayPaymentId: `pay_${Date.now()}`,
        executedAt: new Date()
      };

      this.saveAutopayExecution(mockExecution);
      
      toast({
        title: "Autopay Successful! 🎉 (Demo)",
        description: `₹${amount} invested automatically via UPI autopay`,
        duration: 5000,
      });

      return mockExecution;
    }
  }

  /**
   * Cancel/Pause Autopay Mandate
   */
  static async cancelAutopay(mandateId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/upi/cancel-mandate/${mandateId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Update local storage
        const mandate = this.getMandateRequest(mandateId);
        if (mandate) {
          mandate.status = 'cancelled';
          this.saveMandateRequest(mandate);
        }

        toast({
          title: "Autopay Cancelled",
          description: "Your UPI autopay has been successfully cancelled",
          duration: 3000,
        });

        return true;
      }

      return false;

    } catch (error) {
      console.error('Failed to cancel autopay:', error);
      return false;
    }
  }

  /**
   * Get Active Autopay Mandates
   */
  static getActiveMandates(userId?: string): UPIMandateRequest[] {
    const targetUserId = userId || UserService.getCurrentUserId();
    const mandates = this.getAllMandateRequests();
    
    return mandates.filter(mandate => 
      mandate.userId === targetUserId && 
      mandate.status === 'approved'
    );
  }

  /**
   * Get Autopay Execution History
   */
  static getAutopayHistory(mandateId?: string): AutopayExecution[] {
    const executions = this.getAllAutopayExecutions();
    
    if (mandateId) {
      return executions.filter(exec => exec.mandateId === mandateId);
    }
    
    return executions;
  }

  // Helper Methods
  private static isValidUPIId(upiId: string): boolean {
    const upiRegex = /^[a-zA-Z0-9.-]+@[a-zA-Z0-9.-]+$/;
    return upiRegex.test(upiId);
  }

  private static mapStatusToFlow(apiResult: any): AutopaySetupFlow {
    switch (apiResult.status) {
      case 'created':
        return {
          step: 'pending_approval',
          instructions: [
            'Mandate request sent to your UPI app',
            'Please open your UPI app (GPay, PhonePe, etc.)',
            'Approve the autopay mandate request',
            'We\'ll notify you once it\'s activated'
          ]
        };
      case 'confirmed':
        return {
          step: 'approved',
          instructions: [
            'Autopay mandate approved successfully! ✅',
            'Your automatic investments are now active',
            'Payments will be deducted as per your schedule'
          ]
        };
      case 'rejected':
        return {
          step: 'failed',
          instructions: [
            'Mandate request was rejected',
            'Please try again with a different UPI ID',
            'Ensure your UPI app is updated'
          ]
        };
      default:
        return {
          step: 'pending_approval',
          instructions: [
            'Waiting for your approval...',
            'Check your UPI app for pending requests'
          ]
        };
    }
  }

  private static getMockMandateStatus(mandateId: string): AutopaySetupFlow {
    const mandate = this.getMandateRequest(mandateId);
    if (!mandate) {
      return {
        step: 'failed',
        instructions: ['Mandate not found']
      };
    }

    // Simulate approval after 30 seconds for demo
    const timeSinceCreation = Date.now() - mandate.createdAt.getTime();
    if (timeSinceCreation > 30000 && mandate.status === 'pending_approval') {
      mandate.status = 'approved';
      mandate.approvedAt = new Date();
      this.saveMandateRequest(mandate);
      
      toast({
        title: "Autopay Activated! 🎉",
        description: `Your UPI autopay is now active for up to ₹${mandate.maxAmount}`,
        duration: 5000,
      });
    }

    return this.mapStatusToFlow({ status: mandate.status === 'approved' ? 'confirmed' : mandate.status });
  }

  // Local Storage Methods (for demo - replace with actual database)
  private static saveMandateRequest(mandate: UPIMandateRequest): void {
    const existing = this.getAllMandateRequests();
    const index = existing.findIndex(m => m.id === mandate.id);
    
    if (index >= 0) {
      existing[index] = mandate;
    } else {
      existing.push(mandate);
    }
    
    localStorage.setItem('upi_mandate_requests', JSON.stringify(existing));
  }

  private static getMandateRequest(mandateId: string): UPIMandateRequest | null {
    const mandates = this.getAllMandateRequests();
    return mandates.find(m => m.id === mandateId) || null;
  }

  private static getAllMandateRequests(): UPIMandateRequest[] {
    try {
      const stored = localStorage.getItem('upi_mandate_requests');
      if (stored) {
        return JSON.parse(stored).map((m: any) => ({
          ...m,
          startDate: new Date(m.startDate),
          endDate: new Date(m.endDate),
          createdAt: new Date(m.createdAt),
          approvedAt: m.approvedAt ? new Date(m.approvedAt) : undefined
        }));
      }
      return [];
    } catch {
      return [];
    }
  }

  private static saveAutopayExecution(execution: AutopayExecution): void {
    const existing = this.getAllAutopayExecutions();
    existing.push(execution);
    localStorage.setItem('autopay_executions', JSON.stringify(existing));
  }

  private static getAllAutopayExecutions(): AutopayExecution[] {
    try {
      const stored = localStorage.getItem('autopay_executions');
      if (stored) {
        return JSON.parse(stored).map((e: any) => ({
          ...e,
          executedAt: new Date(e.executedAt)
        }));
      }
      return [];
    } catch {
      return [];
    }
  }

  private static getAuthToken(): string {
    return localStorage.getItem('auth_token') || 'demo_token';
  }
}

export default UPIAutopayService;
