import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Shield,
  Target,
  Zap,
  CheckCircle,
  AlertTriangle,
  IndianRupee,
  PieChart,
  BarChart3,
  Clock,
  Loader2,
  CreditCard,
  Smartphone
} from "lucide-react";

import { 
  MockInvestmentAPI, 
  Portfolio, 
  Investment,
  formatCurrency, 
  formatPercentage,
  getRiskColor 
} from "@/lib/mock-investment-api";

interface InvestmentFlowProps {
  availableBalance: number;
  onInvestmentComplete: (investment: Investment) => void;
  onBack: () => void;
}

const InvestmentFlow = ({ availableBalance, onInvestmentComplete, onBack }: InvestmentFlowProps) => {
  const [step, setStep] = useState(1);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentNAV, setCurrentNAV] = useState<number>(0);
  const [marketStatus, setMarketStatus] = useState<any>(null);
  const [error, setError] = useState<string>('');

  // Load portfolios on component mount
  useEffect(() => {
    loadPortfolios();
    loadMarketStatus();
  }, []);

  // Load current NAV when portfolio is selected
  useEffect(() => {
    if (selectedPortfolio) {
      loadCurrentNAV();
    }
  }, [selectedPortfolio]);

  const loadPortfolios = async () => {
    try {
      setIsLoading(true);
      const data = await MockInvestmentAPI.getPortfolios();
      setPortfolios(data);
    } catch (error) {
      setError('Failed to load portfolios');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCurrentNAV = async () => {
    if (!selectedPortfolio) return;
    
    try {
      const nav = await MockInvestmentAPI.getCurrentNAV(selectedPortfolio.id);
      setCurrentNAV(nav);
    } catch (error) {
      console.error('Failed to load NAV:', error);
    }
  };

  const loadMarketStatus = async () => {
    try {
      const status = await MockInvestmentAPI.getMarketStatus();
      setMarketStatus(status);
    } catch (error) {
      console.error('Failed to load market status:', error);
    }
  };

  const handlePortfolioSelect = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio);
    setStep(2);
  };

  const handleAmountConfirm = () => {
    const amount = parseFloat(investmentAmount);
    if (!amount || amount < (selectedPortfolio?.minimumInvestment || 0)) {
      setError(`Minimum investment is ₹${selectedPortfolio?.minimumInvestment}`);
      return;
    }
    if (amount > availableBalance) {
      setError('Insufficient balance');
      return;
    }
    setError('');
    setStep(3);
  };

  const handleInvestmentSubmit = async () => {
    if (!selectedPortfolio) return;

    try {
      setIsLoading(true);
      const result = await MockInvestmentAPI.investMoney(
        'demo_user',
        selectedPortfolio.id,
        parseFloat(investmentAmount)
      );

      if (result.success && result.investment) {
        onInvestmentComplete(result.investment);
        setStep(4);
      } else {
        setError(result.error || 'Investment failed');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choose Your Investment Plan</h2>
        <p className="text-gray-600">Select the portfolio that matches your investment goals</p>
      </div>

      {/* Market Status */}
      {marketStatus && (
        <div className={`p-4 rounded-lg border ${
          marketStatus.isOpen 
            ? 'bg-green-50 border-green-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              marketStatus.isOpen ? 'bg-green-500' : 'bg-yellow-500'
            }`} />
            <p className="text-sm font-medium">{marketStatus.message}</p>
          </div>
        </div>
      )}

      {/* Portfolio Cards */}
      <div className="space-y-4">
        {portfolios.map((portfolio) => (
          <Card 
            key={portfolio.id}
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-blue-300"
            onClick={() => handlePortfolioSelect(portfolio)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{portfolio.name}</h3>
                    <Badge className={getRiskColor(portfolio.riskLevel)}>
                      {portfolio.riskLevel.toUpperCase()} RISK
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{portfolio.description}</p>
                  
                  {/* Expected Returns */}
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">
                        {portfolio.expectedReturns.min}-{portfolio.expectedReturns.max}% returns
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Historical: {portfolio.expectedReturns.historical}%
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2">
                    {portfolio.features.slice(0, 3).map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-gray-500 mb-1">Min. Investment</div>
                  <div className="font-semibold">₹{portfolio.minimumInvestment}</div>
                </div>
              </div>

              {/* Portfolio Composition */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs font-medium text-gray-700 mb-2">Portfolio Mix:</div>
                <div className="grid grid-cols-2 gap-2">
                  {portfolio.composition.map((asset, index) => (
                    <div key={index} className="text-xs">
                      <span className="font-medium">{asset.asset}:</span>
                      <span className="text-gray-600 ml-1">{asset.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setStep(1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Badge className={getRiskColor(selectedPortfolio?.riskLevel || 'medium')}>
          {selectedPortfolio?.riskLevel.toUpperCase()} RISK
        </Badge>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{selectedPortfolio?.name}</h2>
        <p className="text-gray-600">How much would you like to invest?</p>
      </div>

      {/* Current NAV */}
      {currentNAV > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Current NAV</div>
                <div className="text-lg font-bold">₹{currentNAV}</div>
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Live Price</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Investment Amount Input */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Investment Amount</label>
          <div className="relative">
            <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="number"
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(e.target.value)}
              className="pl-10 h-14 text-lg"
              placeholder="Enter amount"
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Min: ₹{selectedPortfolio?.minimumInvestment}</span>
            <span>Available: ₹{availableBalance}</span>
          </div>
        </div>

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {[100, 500, 1000, 2000].map((amount) => (
            <Button
              key={amount}
              variant="outline"
              size="sm"
              onClick={() => setInvestmentAmount(amount.toString())}
              disabled={amount > availableBalance}
            >
              ₹{amount}
            </Button>
          ))}
        </div>

        {/* Investment Calculator */}
        {investmentAmount && parseFloat(investmentAmount) > 0 && currentNAV > 0 && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Investment Amount:</span>
                  <span className="font-medium">₹{parseFloat(investmentAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>NAV per unit:</span>
                  <span className="font-medium">₹{currentNAV}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Units you'll get:</span>
                  <span className="font-bold">
                    {(parseFloat(investmentAmount) / currentNAV).toFixed(4)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <div className="text-red-600 text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        )}

        <Button 
          onClick={handleAmountConfirm}
          className="w-full h-12 text-lg"
          disabled={!investmentAmount || parseFloat(investmentAmount) < (selectedPortfolio?.minimumInvestment || 0)}
        >
          Continue to Review
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setStep(2)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Badge className="bg-yellow-100 text-yellow-800">Review</Badge>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Review Your Investment</h2>
        <p className="text-gray-600">Please confirm the details before investing</p>
      </div>

      {/* Investment Summary */}
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Investment Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Portfolio:</span>
              <span className="font-medium">{selectedPortfolio?.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Investment Amount:</span>
              <span className="font-medium">₹{parseFloat(investmentAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>NAV per unit:</span>
              <span className="font-medium">₹{currentNAV}</span>
            </div>
            <div className="flex justify-between">
              <span>Units:</span>
              <span className="font-medium">{(parseFloat(investmentAmount) / currentNAV).toFixed(4)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span>Total Amount:</span>
              <span className="font-bold text-lg">₹{parseFloat(investmentAmount).toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expected Returns */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span className="font-medium">Expected Returns</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-green-600">
                ₹{(parseFloat(investmentAmount) * (1 + (selectedPortfolio?.expectedReturns.min || 8) / 100)).toFixed(0)}
              </div>
              <div className="text-xs text-gray-600">Conservative (1 year)</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">
                ₹{(parseFloat(investmentAmount) * (1 + (selectedPortfolio?.expectedReturns.historical || 10) / 100)).toFixed(0)}
              </div>
              <div className="text-xs text-gray-600">Expected (1 year)</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">
                ₹{(parseFloat(investmentAmount) * (1 + (selectedPortfolio?.expectedReturns.max || 12) / 100)).toFixed(0)}
              </div>
              <div className="text-xs text-gray-600">Optimistic (1 year)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Smartphone className="h-5 w-5 text-blue-600" />
            <div>
              <div className="font-medium">UPI Payment</div>
              <div className="text-sm text-gray-600">Secure & instant payment via UPI</div>
            </div>
            <CheckCircle className="h-5 w-5 text-green-600 ml-auto" />
          </div>
        </CardContent>
      </Card>

      <Button 
        onClick={handleInvestmentSubmit}
        className="w-full h-12 text-lg bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Processing Investment...
          </>
        ) : (
          <>
            <IndianRupee className="h-5 w-5 mr-2" />
            Invest ₹{parseFloat(investmentAmount).toFixed(2)}
          </>
        )}
      </Button>

      <div className="text-xs text-gray-500 text-center">
        By investing, you agree to our terms and conditions. Your investment is subject to market risks.
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="bg-green-100 p-4 rounded-full">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-green-800 mb-2">Investment Successful! 🎉</h2>
        <p className="text-gray-600">Your money is now working for you</p>
      </div>

      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-6">
          <div className="space-y-2">
            <div className="text-lg font-bold">₹{parseFloat(investmentAmount).toFixed(2)}</div>
            <div className="text-sm text-gray-600">invested in {selectedPortfolio?.name}</div>
            <div className="text-xs text-gray-500">
              {(parseFloat(investmentAmount) / currentNAV).toFixed(4)} units allocated
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Button 
          onClick={() => {
            setStep(1);
            setSelectedPortfolio(null);
            setInvestmentAmount('');
          }}
          variant="outline" 
          className="w-full"
        >
          Invest More
        </Button>
        <Button onClick={onBack} className="w-full">
          Back to Dashboard
        </Button>
      </div>
    </div>
  );

  if (isLoading && portfolios.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading investment options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Step {step} of 4</span>
          <span className="text-sm text-gray-600">{Math.round((step / 4) * 100)}% Complete</span>
        </div>
        <Progress value={(step / 4) * 100} className="h-2" />
      </div>

      {/* Step Content */}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
    </div>
  );
};

export default InvestmentFlow;
