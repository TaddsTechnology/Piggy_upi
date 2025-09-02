import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  CreditCard,
  ArrowRight,
  Loader2,
  RefreshCw,
  Bell,
  ShieldCheck,
  Zap
} from 'lucide-react';
import UPIAutopayService, { AutopaySetupFlow, UPIMandateRequest } from '@/lib/upi-autopay-service';

interface UPIAutopaySetupProps {
  onSetupComplete?: (mandate: UPIMandateRequest) => void;
  onCancel?: () => void;
  defaultAmount?: number;
}

const UPIAutopaySetup: React.FC<UPIAutopaySetupProps> = ({ 
  onSetupComplete, 
  onCancel,
  defaultAmount = 500 
}) => {
  const [step, setStep] = useState<'form' | 'processing' | 'pending_approval' | 'approved' | 'failed'>('form');
  const [upiId, setUpiId] = useState('');
  const [maxAmount, setMaxAmount] = useState(defaultAmount);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setupFlow, setSetupFlow] = useState<AutopaySetupFlow | null>(null);
  const [mandate, setMandate] = useState<UPIMandateRequest | null>(null);
  const [statusCheckInterval, setStatusCheckInterval] = useState<NodeJS.Timeout | null>(null);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [statusCheckInterval]);

  const handleSetupAutopay = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Step 1: Initiate autopay setup
      const flow = await UPIAutopayService.initiateAutopaySetup(upiId, maxAmount, frequency);
      setSetupFlow(flow);
      setMandate(flow.mandateRequest || null);
      setStep('processing');

      // Step 2: Start checking mandate status periodically
      if (flow.mandateRequest) {
        startStatusChecking(flow.mandateRequest.id);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to setup autopay');
      setStep('failed');
    } finally {
      setIsLoading(false);
    }
  };

  const startStatusChecking = (mandateId: string) => {
    // Check immediately
    checkMandateStatus(mandateId);
    
    // Then check every 5 seconds
    const interval = setInterval(() => {
      checkMandateStatus(mandateId);
    }, 5000);
    
    setStatusCheckInterval(interval);
    
    // Auto-cleanup after 5 minutes
    setTimeout(() => {
      clearInterval(interval);
    }, 300000);
  };

  const checkMandateStatus = async (mandateId: string) => {
    try {
      const flow = await UPIAutopayService.checkMandateStatus(mandateId);
      setSetupFlow(flow);
      
      if (flow.step === 'approved') {
        setStep('approved');
        if (statusCheckInterval) {
          clearInterval(statusCheckInterval);
          setStatusCheckInterval(null);
        }
        if (mandate && onSetupComplete) {
          onSetupComplete(mandate);
        }
      } else if (flow.step === 'failed') {
        setStep('failed');
        if (statusCheckInterval) {
          clearInterval(statusCheckInterval);
          setStatusCheckInterval(null);
        }
      } else if (flow.step === 'pending_approval') {
        setStep('pending_approval');
      }
    } catch (error) {
      console.error('Failed to check mandate status:', error);
    }
  };

  const handleRetry = () => {
    setStep('form');
    setError(null);
    setSetupFlow(null);
    setMandate(null);
    if (statusCheckInterval) {
      clearInterval(statusCheckInterval);
      setStatusCheckInterval(null);
    }
  };

  const getStepProgress = () => {
    switch (step) {
      case 'form': return 25;
      case 'processing': return 50;
      case 'pending_approval': return 75;
      case 'approved': return 100;
      case 'failed': return 25;
      default: return 0;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className={`p-2 rounded-lg text-white ${
            step === 'approved' ? 'bg-green-500' : 
            step === 'failed' ? 'bg-red-500' : 
            'bg-blue-500'
          }`}>
            {step === 'approved' ? <CheckCircle2 size={20} /> :
             step === 'failed' ? <AlertTriangle size={20} /> :
             <Zap size={20} />}
          </div>
          <div>
            <span className="text-lg">Setup UPI Autopay</span>
            <p className="text-sm text-muted-foreground font-normal">
              Automatic investment setup
            </p>
          </div>
        </CardTitle>
        
        <div className="mt-4">
          <Progress value={getStepProgress()} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            Step {step === 'form' ? '1' : step === 'processing' ? '2' : step === 'pending_approval' ? '3' : '4'} of 4
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Form Input */}
        {step === 'form' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="upiId">Your UPI ID *</Label>
              <Input
                id="upiId"
                type="text"
                placeholder="yourname@paytm"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="text-center"
              />
              <p className="text-xs text-muted-foreground">
                Enter the UPI ID you use for payments (e.g., yourname@paytm, yourname@phonepe)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxAmount">Maximum Amount per Transaction</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₹</span>
                <Input
                  id="maxAmount"
                  type="number"
                  min="100"
                  max="25000"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(Number(e.target.value))}
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Maximum amount that can be deducted automatically (₹100 - ₹25,000)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Investment Frequency</Label>
              <Select value={frequency} onValueChange={(value: 'daily' | 'weekly' | 'monthly') => setFrequency(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Alert>
              <ShieldCheck className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Secure & Safe:</strong> You'll approve each transaction in your UPI app. 
                You can cancel anytime, and we never store your UPI PIN.
              </AlertDescription>
            </Alert>

            <Button 
              onClick={handleSetupAutopay}
              disabled={!upiId || maxAmount < 100 || isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  Setup Autopay
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}

        {/* Step 2: Processing */}
        {step === 'processing' && (
          <div className="text-center space-y-4">
            <div className="animate-pulse">
              <CreditCard className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            </div>
            <div>
              <h3 className="font-medium">Creating UPI Mandate...</h3>
              <p className="text-sm text-muted-foreground">
                Setting up your autopay with your bank
              </p>
            </div>
            <div className="space-y-2">
              {setupFlow?.instructions.map((instruction, index) => (
                <p key={index} className="text-xs text-muted-foreground">
                  {instruction}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Pending Approval */}
        {step === 'pending_approval' && (
          <div className="text-center space-y-4">
            <div className="animate-bounce">
              <Bell className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            </div>
            <div>
              <h3 className="font-medium">Waiting for Your Approval</h3>
              <p className="text-sm text-muted-foreground">
                Check your UPI app for the mandate request
              </p>
            </div>

            {mandate && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="text-sm">
                  <p><strong>UPI ID:</strong> {mandate.upiId}</p>
                  <p><strong>Max Amount:</strong> ₹{mandate.maxAmount}</p>
                  <p><strong>Frequency:</strong> {mandate.frequency}</p>
                </div>
              </div>
            )}

            <Alert>
              <Smartphone className="h-4 w-4" />
              <AlertDescription>
                <strong>Action Required:</strong> Open your UPI app (GPay, PhonePe, Paytm, etc.) 
                and approve the autopay mandate request from UPI Piggy.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              {setupFlow?.instructions.map((instruction, index) => (
                <p key={index} className="text-xs text-muted-foreground">
                  {instruction}
                </p>
              ))}
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => mandate && checkMandateStatus(mandate.id)}
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Check Status
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onCancel}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Approved */}
        {step === 'approved' && (
          <div className="text-center space-y-4">
            <div className="animate-bounce">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            </div>
            <div>
              <h3 className="font-medium text-green-900">Autopay Activated! 🎉</h3>
              <p className="text-sm text-green-700">
                Your automatic investments are now active
              </p>
            </div>

            {mandate && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="text-sm">
                  <p><strong>UPI ID:</strong> {mandate.upiId}</p>
                  <p><strong>Max Amount:</strong> ₹{mandate.maxAmount}</p>
                  <p><strong>Frequency:</strong> {mandate.frequency}</p>
                  <Badge className="bg-green-100 text-green-800 mt-2">Active</Badge>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {setupFlow?.instructions.map((instruction, index) => (
                <p key={index} className="text-xs text-muted-foreground">
                  {instruction}
                </p>
              ))}
            </div>

            <Button 
              onClick={() => onSetupComplete && mandate && onSetupComplete(mandate)}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              Continue to Dashboard
            </Button>
          </div>
        )}

        {/* Step: Failed */}
        {step === 'failed' && (
          <div className="text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <div>
              <h3 className="font-medium text-red-900">Setup Failed</h3>
              <p className="text-sm text-red-700">
                Unable to setup autopay. Please try again.
              </p>
            </div>

            <div className="space-y-2">
              {setupFlow?.instructions.map((instruction, index) => (
                <p key={index} className="text-xs text-muted-foreground">
                  {instruction}
                </p>
              ))}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleRetry} className="flex-1">
                Try Again
              </Button>
              <Button variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UPIAutopaySetup;
