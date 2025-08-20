import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Shield,
  Target,
  IndianRupee,
  PieChart,
  BarChart3,
  CheckCircle,
  Clock,
  Award,
  Zap,
  AlertTriangle,
  Info,
  Wallet,
  CreditCard,
  Smartphone,
  Star,
  Lock,
  Users,
  Calendar
} from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/lib/algorithms';
import { usePiggyCore } from '@/hooks/use-piggy-core';

interface Portfolio {
  id: string;
  name: string;
  description: string;
  expectedReturn: string;
  riskLevel: 'low' | 'medium' | 'high';
  allocation: { asset: string; percentage: number; color: string }[];
  features: string[];
  color: string;
  icon: React.ReactNode;
  minInvestment: number;
  avgReturn3Y: number;
  volatility: number;
  expenseRatio: number;
}

const ModernInvestmentFlow = () => {
  const navigate = useNavigate();
  const [piggyState, piggyActions] = usePiggyCore();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState([50]);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [investmentComplete, setInvestmentComplete] = useState(false);

  const portfolios: Portfolio[] = [
    {
      id: 'conservative',
      name: 'Conservative Growth',
      description: 'Perfect for beginners - low risk with steady returns',
      expectedReturn: '8-10%',
      riskLevel: 'low',
      color: 'from-green-400 to-emerald-600',
      icon: <Shield className="h-6 w-6" />,
      minInvestment: 10,
      avgReturn3Y: 8.5,
      volatility: 12,
      expenseRatio: 0.5,
      allocation: [
        { asset: 'Government Bonds', percentage: 40, color: '#10B981' },
        { asset: 'Large Cap Equity', percentage: 30, color: '#3B82F6' },
        { asset: 'Corporate Bonds', percentage: 20, color: '#8B5CF6' },
        { asset: 'Gold ETF', percentage: 10, color: '#F59E0B' }
      ],
      features: [
        'Low volatility',
        'Capital protection focus',
        'Suitable for first-time investors',
        'Tax efficient'
      ]
    },
    {
      id: 'balanced',
      name: 'Balanced Portfolio',
      description: 'Best of both worlds - growth with stability',
      expectedReturn: '10-14%',
      riskLevel: 'medium',
      color: 'from-blue-400 to-indigo-600',
      icon: <BarChart3 className="h-6 w-6" />,
      minInvestment: 25,
      avgReturn3Y: 12.3,
      volatility: 18,
      expenseRatio: 0.7,
      allocation: [
        { asset: 'Large Cap Equity', percentage: 40, color: '#3B82F6' },
        { asset: 'Mid Cap Equity', percentage: 25, color: '#8B5CF6' },
        { asset: 'Government Bonds', percentage: 20, color: '#10B981' },
        { asset: 'International Funds', percentage: 15, color: '#F59E0B' }
      ],
      features: [
        'Diversified risk',
        'Good growth potential',
        'Professional management',
        'Regular rebalancing'
      ]
    },
    {
      id: 'aggressive',
      name: 'Growth Focused',
      description: 'Maximum growth potential for long-term wealth',
      expectedReturn: '12-18%',
      riskLevel: 'high',
      color: 'from-purple-400 to-pink-600',
      icon: <TrendingUp className="h-6 w-6" />,
      minInvestment: 50,
      avgReturn3Y: 15.7,
      volatility: 25,
      expenseRatio: 0.9,
      allocation: [
        { asset: 'Mid Cap Equity', percentage: 35, color: '#8B5CF6' },
        { asset: 'Small Cap Equity', percentage: 30, color: '#EC4899' },
        { asset: 'Large Cap Equity', percentage: 20, color: '#3B82F6' },
        { asset: 'Tech & Innovation', percentage: 15, color: '#F59E0B' }
      ],
      features: [
        'High growth potential',
        'Equity focused',
        'Long-term wealth creation',
        'Tax saving benefits'
      ]
    }
  ];

  const steps = [
    'Choose Portfolio',
    'Set Amount',
    'Payment Method',
    'Confirm & Invest'
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handlePortfolioSelect = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio);
    setInvestmentAmount([Math.max(portfolio.minInvestment, investmentAmount[0])]);
  };

  const handleInvestment = async () => {
    if (!selectedPortfolio) return;
    
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Process investment
    await piggyActions.manualInvest(investmentAmount[0], selectedPortfolio.name);
    
    setIsProcessing(false);
    setInvestmentComplete(true);
    
    // Redirect after success
    setTimeout(() => {
      navigate('/portfolio');
    }, 3000);
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 0: return selectedPortfolio !== null;
      case 1: return investmentAmount[0] >= (selectedPortfolio?.minInvestment || 10);
      case 2: return paymentMethod !== '';
      default: return true;
    }
  };

  if (investmentComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-white shadow-xl border-0">
          <CardContent className="p-8 text-center">
            <div className="bg-green-100 text-green-600 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Investment Successful! 🎉
            </h2>
            <p className="text-gray-600 mb-6">
              Your investment of {formatCurrency(investmentAmount[0])} in {selectedPortfolio?.name} 
              has been processed successfully.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Portfolio:</span>
                <span className="font-semibold">{selectedPortfolio?.name}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold text-green-600">{formatCurrency(investmentAmount[0])}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-600">Expected Return:</span>
                <span className="font-semibold">{selectedPortfolio?.expectedReturn}</span>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Redirecting to your portfolio...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-white shadow-xl border-0">
          <CardContent className="p-8 text-center">
            <div className="animate-spin bg-blue-100 text-blue-600 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Clock className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Processing Investment...
            </h2>
            <p className="text-gray-600 mb-6">
              Please wait while we process your investment of {formatCurrency(investmentAmount[0])} 
              in {selectedPortfolio?.name}.
            </p>
            <Progress value={66} className="mb-4" />
            <p className="text-sm text-gray-500">
              This usually takes 30-60 seconds
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Invest Your Money</h1>
                <p className="text-sm text-gray-600">Step {currentStep + 1} of {steps.length}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Available Balance</p>
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(piggyState.piggyBalance)}
              </p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <Progress value={(currentStep + 1) / steps.length * 100} className="h-2" />
            <div className="flex justify-between mt-2">
              {steps.map((step, index) => (
                <span 
                  key={index} 
                  className={`text-xs ${index <= currentStep ? 'text-blue-600 font-medium' : 'text-gray-400'}`}
                >
                  {step}
                </span>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Step 0: Choose Portfolio */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Choose Your Investment Portfolio
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Select a portfolio that matches your risk appetite and financial goals. 
                All portfolios are professionally managed and diversified.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {portfolios.map((portfolio) => (
                <Card 
                  key={portfolio.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-xl ${
                    selectedPortfolio?.id === portfolio.id 
                      ? 'ring-2 ring-blue-500 shadow-lg' 
                      : 'hover:shadow-lg'
                  }`}
                  onClick={() => handlePortfolioSelect(portfolio)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`bg-gradient-to-r ${portfolio.color} text-white p-3 rounded-lg`}>
                        {portfolio.icon}
                      </div>
                      <Badge className={getRiskColor(portfolio.riskLevel)}>
                        {portfolio.riskLevel} risk
                      </Badge>
                    </div>
                    <CardTitle className="text-xl mb-2">{portfolio.name}</CardTitle>
                    <p className="text-gray-600 text-sm">{portfolio.description}</p>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Expected Return</span>
                      <span className="font-semibold text-green-600 text-lg">
                        {portfolio.expectedReturn}
                      </span>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Asset Allocation</h4>
                      <div className="space-y-2">
                        {portfolio.allocation.map((asset, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: asset.color }}
                              />
                              <span className="text-sm text-gray-600">{asset.asset}</span>
                            </div>
                            <span className="text-sm font-medium">{asset.percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-xs text-gray-500">3Y Avg Return</p>
                        <p className="font-semibold text-green-600">{portfolio.avgReturn3Y}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Min Investment</p>
                        <p className="font-semibold">{formatCurrency(portfolio.minInvestment)}</p>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <ul className="space-y-1">
                        {portfolio.features.slice(0, 2).map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-xs text-gray-600">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Set Amount */}
        {currentStep === 1 && selectedPortfolio && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                How much would you like to invest?
              </h2>
              <p className="text-gray-600">
                Set your investment amount for {selectedPortfolio.name}
              </p>
            </div>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center mb-2">
                    <IndianRupee className="h-8 w-8 text-blue-600" />
                    <span className="text-4xl font-bold text-gray-900">
                      {investmentAmount[0].toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-gray-600">Investment Amount</p>
                </div>

                <div className="space-y-6">
                  <Slider
                    value={investmentAmount}
                    onValueChange={setInvestmentAmount}
                    max={Math.min(piggyState.piggyBalance, 10000)}
                    min={selectedPortfolio.minInvestment}
                    step={10}
                    className="w-full"
                  />
                  
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>₹{selectedPortfolio.minInvestment}</span>
                    <span>₹{Math.min(piggyState.piggyBalance, 10000)}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {[100, 500, 1000].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => setInvestmentAmount([amount])}
                        disabled={amount > piggyState.piggyBalance}
                        className="w-full"
                      >
                        ₹{amount}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Investment Projection</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600">Potential Value in 1 Year</p>
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency(investmentAmount[0] * (1 + selectedPortfolio.avgReturn3Y / 100))}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Potential Gains</p>
                    <p className="text-lg font-semibold text-green-600">
                      +{formatCurrency(investmentAmount[0] * (selectedPortfolio.avgReturn3Y / 100))}
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <p className="text-xs text-yellow-800">
                      Past performance doesn't guarantee future returns. Investments are subject to market risks.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Payment Method */}
        {currentStep === 2 && (
          <div className="max-w-lg mx-auto space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Choose Payment Method
              </h2>
              <p className="text-gray-600">
                Select how you'd like to fund your investment
              </p>
            </div>

            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="space-y-4">
                <Label 
                  htmlFor="upi" 
                  className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <RadioGroupItem value="upi" id="upi" className="mr-4" />
                  <div className="flex items-center gap-3 flex-1">
                    <div className="bg-green-100 text-green-600 p-2 rounded-lg">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">UPI Payment</p>
                      <p className="text-sm text-gray-600">Pay via GPay, PhonePe, Paytm</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700">Recommended</Badge>
                </Label>

                <Label 
                  htmlFor="netbanking" 
                  className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <RadioGroupItem value="netbanking" id="netbanking" className="mr-4" />
                  <div className="flex items-center gap-3 flex-1">
                    <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Net Banking</p>
                      <p className="text-sm text-gray-600">All major banks supported</p>
                    </div>
                  </div>
                </Label>

                <Label 
                  htmlFor="piggy" 
                  className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <RadioGroupItem value="piggy" id="piggy" className="mr-4" />
                  <div className="flex items-center gap-3 flex-1">
                    <div className="bg-purple-100 text-purple-600 p-2 rounded-lg">
                      <Wallet className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Piggy Balance</p>
                      <p className="text-sm text-gray-600">
                        Available: {formatCurrency(piggyState.piggyBalance)}
                      </p>
                    </div>
                  </div>
                  {investmentAmount[0] <= piggyState.piggyBalance && (
                    <Badge className="bg-blue-100 text-blue-700">Sufficient</Badge>
                  )}
                </Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Step 3: Confirm & Invest */}
        {currentStep === 3 && selectedPortfolio && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Confirm Your Investment
              </h2>
              <p className="text-gray-600">
                Review your investment details before proceeding
              </p>
            </div>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`bg-gradient-to-r ${selectedPortfolio.color} text-white p-3 rounded-lg`}>
                        {selectedPortfolio.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{selectedPortfolio.name}</h3>
                        <p className="text-sm text-gray-600">{selectedPortfolio.description}</p>
                      </div>
                    </div>
                    <Badge className={getRiskColor(selectedPortfolio.riskLevel)}>
                      {selectedPortfolio.riskLevel} risk
                    </Badge>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600">Investment Amount</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(investmentAmount[0])}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Expected Return</p>
                      <p className="text-2xl font-bold text-green-600">
                        {selectedPortfolio.expectedReturn}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method</span>
                      <span className="font-medium capitalize">{paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Processing Fee</span>
                      <span className="font-medium text-green-600">₹0</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="font-medium">Total Amount</span>
                      <span className="font-bold text-lg">{formatCurrency(investmentAmount[0])}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Important Information</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <Lock className="h-4 w-4 text-green-500 mt-0.5" />
                      Your investment is secure and regulated by SEBI
                    </li>
                    <li className="flex items-start gap-2">
                      <Users className="h-4 w-4 text-blue-500 mt-0.5" />
                      Professionally managed by certified fund managers
                    </li>
                    <li className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-purple-500 mt-0.5" />
                      You can redeem your investment anytime (subject to exit load)
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 max-w-2xl mx-auto">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceedToNext()}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleInvestment}
              disabled={!canProceedToNext()}
              className="bg-green-600 hover:bg-green-700"
            >
              <Zap className="h-4 w-4 mr-2" />
              Confirm Investment
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernInvestmentFlow;
