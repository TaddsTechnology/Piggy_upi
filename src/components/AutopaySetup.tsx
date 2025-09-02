import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Calendar,
  Zap,
  IndianRupee,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  PiggyBank,
  TrendingUp,
  Shield,
  RefreshCw,
  Smartphone,
  Bell,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

import razorpayService, { AutopaySetup as AutopayConfig } from '@/lib/razorpay-service';
import UPIAutopayService, { UPIMandateRequest, AutopaySetupFlow } from '@/lib/upi-autopay-service';
import { toast } from '@/hooks/use-toast';

interface AutopaySetupProps {
  onSetupComplete?: (autopaySetup: AutopayConfig) => void;
  onCancel?: () => void;
}

const AutopaySetup: React.FC<AutopaySetupProps> = ({
  onSetupComplete,
  onCancel
}) => {
  // UPI Autopay states
  const [step, setStep] = useState<'form' | 'processing' | 'pending_approval' | 'approved' | 'failed'>('form');
  const [upiId, setUpiId] = useState('');
  const [maxAmount, setMaxAmount] = useState<string>('1000');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setupFlow, setSetupFlow] = useState<AutopaySetupFlow | null>(null);
  const [mandate, setMandate] = useState<UPIMandateRequest | null>(null);
  const [statusCheckInterval, setStatusCheckInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Legacy support
  const [existingAutopay, setExistingAutopay] = useState<AutopayConfig | null>(null);
  const [activeMandates, setActiveMandates] = useState<UPIMandateRequest[]>([]);

  useEffect(() => {
    // Check for existing setups
    const existing = razorpayService.getAutopaySetup();
    const mandates = UPIAutopayService.getActiveMandates();
    
    if (existing) {
      setExistingAutopay(existing);
      setMaxAmount(existing.maxAmount.toString());
      setFrequency(existing.frequency);
    }
    
    setActiveMandates(mandates);
    
    // Cleanup interval on unmount
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [statusCheckInterval]);

  const handleSetupAutopay = async () => {
    const amount = parseFloat(maxAmount);
    
    if (!amount || amount < 100) {
      toast({
        title: "Invalid Amount",
        description: "Minimum autopay amount is ₹100",
        variant: "destructive",
      });
      return;
    }

    if (!upiId.trim()) {
      toast({
        title: "UPI ID Required",
        description: "Please enter your UPI ID",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Initiate UPI autopay setup
      const flow = await UPIAutopayService.initiateAutopaySetup(upiId, amount, frequency);
      setSetupFlow(flow);
      setMandate(flow.mandateRequest || null);
      setStep('processing');

      // Step 2: Start checking mandate status
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
        // Create legacy autopay config for compatibility
        if (mandate) {
          const legacyConfig: AutopayConfig = {
            tokenId: mandate.id,
            customerId: mandate.userId,
            maxAmount: mandate.maxAmount,
            frequency: mandate.frequency,
            isActive: true,
            nextPaymentDate: mandate.endDate
          };
          onSetupComplete?.(legacyConfig);
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

  const handleDisableAutopay = async (mandateId?: string) => {
    if (mandateId) {
      await UPIAutopayService.cancelAutopay(mandateId);
    }
    localStorage.removeItem('piggy_autopay_setup');
    setExistingAutopay(null);
    setActiveMandates([]);
    
    toast({
      title: "Autopay Disabled",
      description: "Automatic investments have been disabled",
    });
  };

  const formatNextPaymentDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const getFrequencyDescription = (freq: string) => {
    switch (freq) {
      case 'daily':
        return 'Every day at 9:00 AM';
      case 'weekly':
        return 'Every Monday at 9:00 AM';
      case 'monthly':
        return 'Every 1st of the month at 9:00 AM';
      default:
        return 'As scheduled';
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

  // Show UPI mandate setup flow
  if (step !== 'form') {
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
                UPI mandate approval flow
              </p>
            </div>
          </CardTitle>
          
          <div className="mt-4">
            <Progress value={getStepProgress()} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Step {step === 'processing' ? '2' : step === 'pending_approval' ? '3' : '4'} of 4
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

          {/* Processing */}
          {step === 'processing' && (
            <div className="text-center space-y-4">
              <div className="animate-pulse">
                <Smartphone className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              </div>
              <div>
                <h3 className="font-medium">Creating UPI Mandate...</h3>
                <p className="text-sm text-muted-foreground">
                  Setting up autopay with your bank
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

          {/* Pending Approval */}
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

          {/* Approved */}
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
                onClick={onCancel}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                Continue to Dashboard
              </Button>
            </div>
          )}

          {/* Failed */}
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
  }

  // Show active mandates if any exist
  if ((existingAutopay || activeMandates.length > 0)) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        {/* Existing Autopay Status */}
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-all duration-500 animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-green-800">
              <div className="p-2 bg-green-600 rounded-full text-white animate-pulse">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xl font-bold">AutoPay Active</span>
                <p className="text-sm text-green-600 font-normal">Your investments are automated! 🚀</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white/70 rounded-lg hover:bg-white transition-colors duration-200">
                  <span className="text-gray-700 font-medium">Max Amount:</span>
                  <span className="font-bold text-xl text-green-600 animate-counter">₹{existingAutopay.maxAmount}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-white/70 rounded-lg hover:bg-white transition-colors duration-200">
                  <span className="text-gray-700 font-medium">Frequency:</span>
                  <Badge className="bg-blue-100 text-blue-800 capitalize font-semibold px-3 py-1">
                    {existingAutopay.frequency}
                  </Badge>
                </div>

                <div className="flex justify-between items-center p-3 bg-white/70 rounded-lg hover:bg-white transition-colors duration-200">
                  <span className="text-gray-700 font-medium">Status:</span>
                  <Badge className="bg-green-100 text-green-800 font-semibold px-3 py-1 animate-pulse">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                      {existingAutopay.isActive ? 'Active' : 'Paused'}
                    </div>
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm text-blue-700 font-medium mb-1">Schedule</div>
                  <div className="text-blue-800 font-semibold">{getFrequencyDescription(existingAutopay.frequency)}</div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-sm text-purple-700 font-medium mb-1">Next Payment</div>
                  <div className="text-purple-800 font-semibold">
                    {formatNextPaymentDate(existingAutopay.nextPaymentDate)}
                  </div>
                </div>
              </div>
            </div>

            <Alert className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-300 hover:shadow-lg transition-all duration-300 animate-slide-in-right">
              <PiggyBank className="h-5 w-5 text-blue-600 animate-bounce" />
              <AlertDescription className="text-blue-800">
                <strong>🎯 Smart Automation Active:</strong> Your investments will be automatically processed according to your schedule. 
                Plus, spare change from each transaction will boost your returns automatically! 🐷💰
              </AlertDescription>
            </Alert>

            <div className="flex gap-3 animate-fade-in-delay">
              <Button
                onClick={() => setStep('form')}
                variant="outline"
                className="flex-1 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 hover:scale-105"
              >
                <RefreshCw className="h-4 w-4 mr-2 transition-transform duration-200 hover:rotate-180" />
                Setup New Autopay
              </Button>
              
              <Button
                onClick={() => handleDisableAutopay(activeMandates[0]?.id)}
                variant="destructive"
                className="flex-1 hover:scale-105 transition-all duration-200"
              >
                Cancel Autopay
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* How it Works */}
        <Card className="hover:shadow-lg transition-all duration-300 animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg text-white">
                <TrendingUp className="h-5 w-5" />
              </div>
              How Smart AutoPay Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-blue-50 transition-colors duration-200 group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-sm font-bold text-white group-hover:scale-110 transition-transform duration-200">1</div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors duration-200">🔍 Automatic Detection</p>
                <p className="text-sm text-gray-600 mt-1">AI monitors your spending patterns, balance, and optimal investment timing</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-green-50 transition-colors duration-200 group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-sm font-bold text-white group-hover:scale-110 transition-transform duration-200">2</div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 group-hover:text-green-700 transition-colors duration-200">💡 Smart Investment</p>
                <p className="text-sm text-gray-600 mt-1">Invests optimal amounts based on your risk profile, goals, and market conditions</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-purple-50 transition-colors duration-200 group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white group-hover:scale-110 transition-transform duration-200">3</div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 group-hover:text-purple-700 transition-colors duration-200">🐷 Spare Change Boost</p>
                <p className="text-sm text-gray-600 mt-1">Round-off from all transactions automatically invested for compound growth</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {onCancel && (
          <Button onClick={onCancel} variant="outline" className="w-full">
            Back
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Setup Header */}
      <div className="text-center animate-slide-down">
        <div className="mb-4">
          <div className="inline-flex p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full mb-4">
            <Zap className="h-12 w-12 text-purple-600 animate-pulse" />
          </div>
        </div>
        <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          {existingAutopay ? 'Update AutoPay Settings' : 'Setup Smart AutoPay'}
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Let UPI Piggy's AI automatically invest for you with optimal timing and amounts. 
          <span className="font-semibold text-purple-600">Grow your wealth effortlessly!</span> 🚀💰
        </p>
      </div>

      {/* Configuration Form */}
      <Card className="border-2 border-blue-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 animate-slide-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xl">AutoPay Configuration</span>
              <p className="text-sm text-gray-600 font-normal">Customize your automated investment strategy</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Max Amount */}
          <div className="space-y-2">
            <Label htmlFor="maxAmount">Maximum Amount per Investment</Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="maxAmount"
                type="number"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                className="pl-10 h-12 text-lg"
                placeholder="Enter amount"
                min="100"
                step="10"
              />
            </div>
            <p className="text-sm text-gray-500">
              We'll never invest more than this amount in a single transaction. Minimum: ₹100
            </p>
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label>Investment Frequency</Label>
            <Select value={frequency} onValueChange={(value: any) => setFrequency(value)}>
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <div>
                      <p className="font-medium">Daily</p>
                      <p className="text-xs text-gray-500">Every day at 9:00 AM</p>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="weekly">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <div>
                      <p className="font-medium">Weekly</p>
                      <p className="text-xs text-gray-500">Every Monday at 9:00 AM</p>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="monthly">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <div>
                      <p className="font-medium">Monthly</p>
                      <p className="text-xs text-gray-500">1st of every month at 9:00 AM</p>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* UPI ID */}
          <div className="space-y-2">
            <Label htmlFor="upiId">Your UPI ID *</Label>
            <Input
              id="upiId"
              type="text"
              placeholder="yourname@paytm"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="h-12 text-center"
            />
            <p className="text-sm text-gray-500">
              Enter the UPI ID you use for payments (e.g., yourname@paytm, yourname@phonepe)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Benefits & Security */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <PiggyBank className="h-5 w-5" />
            UPI Autopay Benefits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
            <span className="text-sm">True UPI mandate - approved in your UPI app</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
            <span className="text-sm">Automatic payments without manual approval</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
            <span className="text-sm">Bank-grade security through UPI infrastructure</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
            <span className="text-sm">Cancel anytime from your UPI app</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
            <span className="text-sm">No card details or net banking required</span>
          </div>
        </CardContent>
      </Card>
      
      <Alert>
        <ShieldCheck className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Secure & Safe:</strong> You'll approve the mandate in your UPI app (GPay, PhonePe, etc.). 
          Future payments happen automatically within your approved limits. Cancel anytime!
        </AlertDescription>
      </Alert>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {onCancel && (
          <Button onClick={onCancel} variant="outline" className="flex-1">
            Cancel
          </Button>
        )}
        
        <Button
          onClick={handleSetupAutopay}
          disabled={isLoading || !upiId || !maxAmount || parseFloat(maxAmount) < 100}
          className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Creating UPI Mandate...
            </>
          ) : (
            <>
              Setup UPI Autopay
              <ArrowRight className="h-5 w-5 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Security note */}
      <div className="text-center text-xs text-gray-500 flex items-center justify-center gap-1">
        <Shield className="h-3 w-3" />
        Your payment information is secured by Razorpay's bank-grade security
      </div>
    </div>
  );
};

export default AutopaySetup;
