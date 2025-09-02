import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import {
  CreditCard,
  IndianRupee,
  Zap,
  PiggyBank,
  CheckCircle2,
  AlertCircle,
  Settings,
  ArrowUpCircle,
  TrendingUp,
  Loader2,
  Smartphone,
  Shield,
  FileText,
  Clock,
  ArrowRight
} from 'lucide-react';

import razorpayService, { RazorpayTransaction, RoundOffSettings } from '@/lib/razorpay-service';
import { toast } from '@/hooks/use-toast';

interface RazorpayPaymentProps {
  amount: number;
  description?: string;
  portfolioId?: string;
  onPaymentSuccess?: (transaction: RazorpayTransaction) => void;
  onPaymentFailure?: (error: any) => void;
  disabled?: boolean;
}

const RazorpayPayment: React.FC<RazorpayPaymentProps> = ({
  amount,
  description = 'Investment via UPI Piggy',
  portfolioId,
  onPaymentSuccess,
  onPaymentFailure,
  disabled = false
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [roundOffSettings, setRoundOffSettings] = useState<RoundOffSettings>(
    razorpayService.getRoundOffSettings()
  );
  const [showSettings, setShowSettings] = useState(false);
  const [roundOffPreview, setRoundOffPreview] = useState<any>(null);
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [showKycWarning, setShowKycWarning] = useState(false);

  useEffect(() => {
    // Calculate round-off preview when amount changes
    const preview = razorpayService.calculateRoundOff(amount);
    setRoundOffPreview(preview);
    
    // Check KYC status
    const kyc = localStorage.getItem('kyc_status');
    setKycStatus(kyc);
    
    // Show KYC warning if not completed for investments above ₹50,000
    if (amount >= 50000 && (!kyc || kyc === 'pending')) {
      setShowKycWarning(true);
    } else {
      setShowKycWarning(false);
    }
  }, [amount, roundOffSettings]);

  const handlePayment = async () => {
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to proceed.",
        variant: "destructive",
      });
      return;
    }
    
    // Check KYC requirement for high-value transactions
    if (amount >= 50000 && (!kycStatus || kycStatus !== 'completed')) {
      toast({
        title: "KYC Required",
        description: "Please complete KYC verification for investments above ₹50,000",
        variant: "destructive",
      });
      return;
    }
    
    // For demo purposes, allow smaller amounts without KYC but show warning
    if (amount >= 10000 && (!kycStatus || kycStatus === 'pending')) {
      toast({
        title: "KYC Recommended",
        description: "Consider completing KYC for better investment limits and features",
        duration: 3000,
      });
    }

    setIsProcessing(true);

    try {
      // Create order with round-off calculation
      const { order, transaction, roundOffInfo } = await razorpayService.createOrder(
        amount,
        description
      );

      // Process payment
      await razorpayService.processPayment(
        order.id,
        roundOffInfo.roundedAmount,
        (paymentData) => {
          setIsProcessing(false);
          onPaymentSuccess?.(transaction);
        },
        (error) => {
          setIsProcessing(false);
          onPaymentFailure?.(error);
        }
      );
    } catch (error) {
      console.error('Payment error:', error);
      setIsProcessing(false);
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to process payment",
        variant: "destructive",
      });
      onPaymentFailure?.(error);
    }
  };

  const updateRoundOffSettings = (updates: Partial<RoundOffSettings>) => {
    const newSettings = { ...roundOffSettings, ...updates };
    setRoundOffSettings(newSettings);
    razorpayService.updateRoundOffSettings(newSettings);
  };

  const totalRoundOffInvested = razorpayService.getTotalRoundOffInvested();

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* KYC Warning for High Value Transactions */}
      {showKycWarning && (
        <Alert className="border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 animate-slide-down">
          <FileText className="h-5 w-5 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <div className="space-y-3">
              <div>
                <strong>🏛️ KYC Verification Required</strong>
                <p className="text-sm mt-1">
                  For investments above ₹50,000, KYC completion is mandatory as per RBI guidelines. 
                  This helps us provide you with better investment limits and enhanced security.
                </p>
              </div>
              
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Takes 24-48 hours</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  <span>Bank-grade security</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>One-time process</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => navigate('/kyc')}
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                >
                  Complete KYC Now
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
                {amount < 50000 && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowKycWarning(false)}
                    className="border-orange-300 text-orange-700 hover:bg-orange-100"
                  >
                    Continue Without KYC
                  </Button>
                )}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {/* KYC Status Display */}
      {kycStatus && (
        <Card className={`border-2 ${
          kycStatus === 'completed' ? 'border-green-200 bg-green-50' :
          kycStatus === 'pending' ? 'border-yellow-200 bg-yellow-50' :
          'border-gray-200'
        } animate-slide-up`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                kycStatus === 'completed' ? 'bg-green-100' :
                kycStatus === 'pending' ? 'bg-yellow-100' :
                'bg-gray-100'
              }`}>
                {kycStatus === 'completed' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : kycStatus === 'pending' ? (
                  <Clock className="h-4 w-4 text-yellow-600 animate-pulse" />
                ) : (
                  <FileText className="h-4 w-4 text-gray-600" />
                )}
              </div>
              
              <div className="flex-1">
                <p className={`font-medium text-sm ${
                  kycStatus === 'completed' ? 'text-green-800' :
                  kycStatus === 'pending' ? 'text-yellow-800' :
                  'text-gray-800'
                }`}>
                  {kycStatus === 'completed' ? '✅ KYC Completed' :
                   kycStatus === 'pending' ? '⏳ KYC Under Review' :
                   '📄 KYC Required'}
                </p>
                <p className="text-xs text-gray-600">
                  {kycStatus === 'completed' ? 'You can invest any amount without limits' :
                   kycStatus === 'pending' ? 'Verification in progress. Limited to ₹50,000' :
                   'Complete KYC for higher investment limits'}
                </p>
              </div>
              
              {kycStatus === 'pending' && (
                <Badge className="bg-yellow-100 text-yellow-800">
                  ID: {localStorage.getItem('kyc_verification_id')}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Payment Summary Card */}
      <Card className="border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg group">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 group-hover:text-blue-700 transition-colors duration-200">
            <CreditCard className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Amount breakdown */}
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200">
              <span className="text-gray-600 font-medium">Investment Amount:</span>
              <span className="font-bold text-lg animate-counter">₹{amount.toFixed(2)}</span>
            </div>
            
            {roundOffPreview && roundOffPreview.roundOffAmount > 0 && (
              <>
                <div className="flex justify-between items-center text-sm p-2 rounded-lg bg-green-50 border border-green-200 animate-slide-in-right">
                  <span className="text-green-700 flex items-center gap-2 font-medium">
                    <PiggyBank className="h-4 w-4 animate-bounce" />
                    Smart Spare Change:
                  </span>
                  <span className="text-green-600 font-bold">
                    +₹{roundOffPreview.roundOffAmount.toFixed(2)}
                  </span>
                </div>
                <div className="border-t-2 border-dashed border-blue-300 pt-3 flex justify-between items-center font-bold bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg">
                  <span className="text-gray-800">Total Payment:</span>
                  <span className="text-2xl text-blue-600 animate-pulse">₹{roundOffPreview.roundedAmount.toFixed(2)}</span>
                </div>
              </>
            )}

            {(!roundOffPreview || roundOffPreview.roundOffAmount === 0) && (
              <div className="border-t-2 border-dashed border-blue-300 pt-3 flex justify-between items-center font-bold bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg">
                <span className="text-gray-800">Total Payment:</span>
                <span className="text-2xl text-blue-600">₹{amount.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Round-off info */}
          {roundOffSettings.enabled && roundOffPreview && roundOffPreview.roundOffAmount > 0 && (
            <Alert className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 hover:shadow-lg transition-all duration-300 animate-slide-up">
              <PiggyBank className="h-5 w-5 text-green-600 animate-bounce" />
              <AlertDescription className="text-sm">
                {roundOffSettings.investRoundOff ? (
                  <>
                    <strong className="text-green-800">🚀 Smart Round-off Active:</strong> ₹{roundOffPreview.roundOffAmount.toFixed(2)} will be 
                    automatically invested as spare change! This boosts your returns over time. 🐷💰
                  </>
                ) : (
                  <>
                    <strong className="text-green-800">💰 Round-off Enabled:</strong> ₹{roundOffPreview.roundOffAmount.toFixed(2)} spare change 
                    will be added to your balance for future investments.
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Payment methods */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200 hover:border-blue-300 transition-all duration-300">
            <div className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              Secure Payment Methods
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="flex items-center gap-2 py-2 px-3 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 cursor-pointer">
                <Smartphone className="h-4 w-4 text-blue-600" />
                <span className="font-medium">UPI (Instant)</span>
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2 py-2 px-3 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 cursor-pointer">
                <CreditCard className="h-4 w-4 text-green-600" />
                <span className="font-medium">Cards</span>
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2 py-2 px-3 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 cursor-pointer">
                <Shield className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Net Banking</span>
              </Badge>
            </div>
            <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              <span>256-bit SSL encryption • PCI DSS compliant</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Round-off Settings */}
      <Card className="hover:shadow-lg transition-all duration-300 border-purple-200 animate-slide-up">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <PiggyBank className="h-5 w-5 text-purple-600 animate-bounce" />
              Smart Spare Change Settings
              {totalRoundOffInvested > 0 && (
                <Badge className="bg-purple-100 text-purple-700 text-xs">
                  ₹{totalRoundOffInvested.toFixed(0)} invested
                </Badge>
              )}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="hover:bg-purple-100 hover:text-purple-700 transition-all duration-200"
            >
              <Settings className={`h-4 w-4 transition-transform duration-300 ${showSettings ? 'rotate-45' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Round-off toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Enable Spare Change</Label>
              <p className="text-xs text-gray-500">
                Round up payments and save/invest the spare change
              </p>
            </div>
            <Switch
              checked={roundOffSettings.enabled}
              onCheckedChange={(enabled) => updateRoundOffSettings({ enabled })}
            />
          </div>

          {/* Auto-invest toggle */}
          {roundOffSettings.enabled && (
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Auto-Invest Spare Change
                </Label>
                <p className="text-xs text-gray-500">
                  Automatically invest spare change for better returns
                </p>
              </div>
              <Switch
                checked={roundOffSettings.investRoundOff}
                onCheckedChange={(investRoundOff) => updateRoundOffSettings({ investRoundOff })}
              />
            </div>
          )}

          {/* Settings panel */}
          {showSettings && roundOffSettings.enabled && (
            <div className="space-y-3 border-t pt-4">
              <div className="space-y-2">
                <Label htmlFor="threshold">Round-up Threshold</Label>
                <Input
                  id="threshold"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="0.9"
                  value={roundOffSettings.roundUpThreshold}
                  onChange={(e) => updateRoundOffSettings({ 
                    roundUpThreshold: parseFloat(e.target.value) || 0.5 
                  })}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Amounts ending with this value or higher will round up (e.g., 0.5 means ₹100.50+ rounds to ₹101)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxRoundOff">Maximum Round-off Amount</Label>
                <Input
                  id="maxRoundOff"
                  type="number"
                  min="1"
                  max="100"
                  value={roundOffSettings.maxRoundOff}
                  onChange={(e) => updateRoundOffSettings({ 
                    maxRoundOff: parseFloat(e.target.value) || 10 
                  })}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Maximum amount to round off per transaction
                </p>
              </div>
            </div>
          )}

          {/* Stats */}
          {totalRoundOffInvested > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm">
                <ArrowUpCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium">
                  Total Spare Change Invested: ₹{totalRoundOffInvested.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Button */}
      <div className="relative animate-slide-up">
        <Button
          onClick={handlePayment}
          disabled={disabled || isProcessing || !amount || amount <= 0}
          className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group animate-glow"
          size="lg"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
          
          {isProcessing ? (
            <div className="flex items-center animate-fade-in">
              <Loader2 className="h-5 w-5 animate-spin mr-3" />
              <div className="flex flex-col items-start">
                <span className="font-semibold">Processing Payment...</span>
                <span className="text-xs opacity-80">Securing your transaction</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <IndianRupee className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
              <div className="flex flex-col items-start">
                <span className="font-bold text-xl">
                  {roundOffPreview && roundOffPreview.roundOffAmount > 0
                    ? `₹${roundOffPreview.roundedAmount.toFixed(2)}`
                    : `₹${amount.toFixed(2)}`
                  }
                </span>
                {roundOffPreview && roundOffPreview.roundOffAmount > 0 && (
                  <span className="text-xs opacity-90 font-medium">
                    +₹{roundOffPreview.roundOffAmount.toFixed(2)} spare change 🐷
                  </span>
                )}
              </div>
              <Zap className="h-5 w-5 text-yellow-300 animate-pulse" />
            </div>
          )}
        </Button>
        
        {/* Security indicators */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-2 text-xs text-gray-500">
          <Shield className="h-3 w-3 text-green-500" />
          <span>Bank-grade security</span>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <span>Instant refunds</span>
        </div>
      </div>

      {/* Razorpay branding */}
      <div className="text-center text-xs text-gray-500 flex items-center justify-center gap-1">
        <Shield className="h-3 w-3" />
        Secured by Razorpay • All payments are encrypted and secure
      </div>
    </div>
  );
};

export default RazorpayPayment;
