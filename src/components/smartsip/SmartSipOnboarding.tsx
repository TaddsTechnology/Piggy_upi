import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingUp, Target, Star, ArrowRight } from 'lucide-react';
import { SmartSipEngine, SipRecommendation, SipGamification } from '@/lib/smart-sip';

interface UserProfile {
  age: number;
  monthlyIncome?: number;
  riskTolerance?: 'low' | 'medium' | 'high';
  investmentExperience?: 'beginner' | 'intermediate' | 'advanced';
}

interface Transaction {
  amount: number;
  date: Date;
  category?: string;
  merchant?: string;
}

interface SmartSipOnboardingProps {
  userTransactions: Transaction[];
  onComplete: (recommendation: SipRecommendation) => void;
  className?: string;
}

export const SmartSipOnboarding: React.FC<SmartSipOnboardingProps> = ({
  userTransactions,
  onComplete,
  className = ""
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userProfile, setUserProfile] = useState<UserProfile>({ age: 25 });
  const [recommendation, setRecommendation] = useState<SipRecommendation | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const steps = [
    'Profile Setup',
    'Spending Analysis', 
    'Investment Recommendation',
    'Confirmation'
  ];

  // Generate recommendation when profile is complete
  useEffect(() => {
    if (currentStep === 1 && userProfile.age) {
      setIsAnalyzing(true);
      
      // Simulate analysis delay for better UX
      setTimeout(() => {
        const sipRecommendation = SmartSipEngine.analyzeSpendingAndRecommendSip(
          userTransactions,
          userProfile
        );
        setRecommendation(sipRecommendation);
        setIsAnalyzing(false);
        setCurrentStep(2);
      }, 2000);
    }
  }, [currentStep, userProfile, userTransactions]);

  const renderProfileSetup = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Let's personalize your investment strategy
        </h2>
        <p className="text-gray-600">
          Tell us a bit about yourself to get the best recommendations
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Age
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { range: '18-25', value: 22 },
              { range: '26-35', value: 30 },
              { range: '36+', value: 40 }
            ].map(({ range, value }) => (
              <Button
                key={range}
                variant={userProfile.age === value ? "default" : "outline"}
                onClick={() => setUserProfile(prev => ({ ...prev, age: value }))}
                className="h-12"
              >
                {range}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Investment Experience
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Beginner', value: 'beginner' as const },
              { label: 'Some Experience', value: 'intermediate' as const },
              { label: 'Experienced', value: 'advanced' as const }
            ].map(({ label, value }) => (
              <Button
                key={value}
                variant={userProfile.investmentExperience === value ? "default" : "outline"}
                onClick={() => setUserProfile(prev => ({ ...prev, investmentExperience: value }))}
                className="h-12 text-sm"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Risk Appetite
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Conservative', value: 'low' as const, desc: 'Steady growth' },
              { label: 'Balanced', value: 'medium' as const, desc: 'Moderate risk' },
              { label: 'Aggressive', value: 'high' as const, desc: 'High returns' }
            ].map(({ label, value, desc }) => (
              <Button
                key={value}
                variant={userProfile.riskTolerance === value ? "default" : "outline"}
                onClick={() => setUserProfile(prev => ({ ...prev, riskTolerance: value }))}
                className="h-16 flex-col"
              >
                <span className="font-medium">{label}</span>
                <span className="text-xs text-gray-500">{desc}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      <Button
        onClick={() => setCurrentStep(1)}
        className="w-full h-12"
        disabled={!userProfile.age || !userProfile.investmentExperience || !userProfile.riskTolerance}
      >
        Analyze My Spending <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );

  const renderSpendingAnalysis = () => (
    <div className="space-y-6 text-center">
      <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
        <TrendingUp className="h-10 w-10 text-blue-600" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Analyzing Your Spending Patterns
        </h2>
        <p className="text-gray-600">
          We're studying your transaction history to create the perfect investment plan...
        </p>
      </div>

      <div className="space-y-4">
        <Progress value={isAnalyzing ? 75 : 100} className="h-3" />
        
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-gray-900">{userTransactions.length}</div>
            <div className="text-gray-500">Transactions</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">30</div>
            <div className="text-gray-500">Days Analyzed</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">5%</div>
            <div className="text-gray-500">Optimal Rate</div>
          </div>
        </div>
      </div>

      {isAnalyzing && (
        <div className="text-sm text-gray-500">
          Creating your personalized investment strategy...
        </div>
      )}
    </div>
  );

  const renderRecommendation = () => {
    if (!recommendation) return null;

    const userLevel = SipGamification.calculateUserLevel(0, 0); // New user

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Target className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Your Smart SIP Plan is Ready!
          </h2>
          <p className="text-gray-600">
            Based on your spending patterns, here's your personalized investment strategy
          </p>
        </div>

        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-green-600">
                ₹{recommendation.weeklyAmount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">per week</div>
              <div className="text-lg text-gray-900 mt-1">
                ₹{recommendation.monthlyAmount.toLocaleString()}/month
              </div>
            </div>

            <Badge 
              variant={recommendation.riskLevel === 'low' ? 'secondary' : 
                     recommendation.riskLevel === 'medium' ? 'default' : 'destructive'}
              className="mx-auto block w-fit mb-4"
            >
              {recommendation.riskLevel.toUpperCase()} RISK
            </Badge>

            <p className="text-sm text-gray-600 text-center">
              {recommendation.reasoningText}
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="font-semibold text-gray-900">
                ₹{recommendation.expectedReturns.oneYear.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">After 1 Year</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="font-semibold text-gray-900">
                ₹{recommendation.expectedReturns.threeYear.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">After 3 Years</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="font-semibold text-gray-900">
                ₹{recommendation.expectedReturns.fiveYear.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">After 5 Years</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Star className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium text-blue-900">{userLevel.title}</div>
                <div className="text-sm text-blue-600">
                  Complete setup to unlock achievements and track progress
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={() => setCurrentStep(3)}
          className="w-full h-12"
        >
          Set Up Automatic Investing <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  };

  const renderConfirmation = () => {
    if (!recommendation) return null;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Ready to Start Building Wealth?
          </h2>
          <p className="text-gray-600">
            Your automatic investment plan will begin next Sunday
          </p>
        </div>

        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Weekly Investment</span>
                <span className="font-bold text-lg">₹{recommendation.weeklyAmount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Investment Type</span>
                <span className="font-medium">{recommendation.riskLevel.toUpperCase()} Risk ETFs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Expected Annual Return</span>
                <span className="font-medium text-green-600">12-15%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800">Zero-friction investing</p>
              <p className="text-yellow-700 mt-1">
                After setup, investments happen automatically every Sunday. You can modify or pause anytime.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(2)}
            className="h-12"
          >
            Modify Plan
          </Button>
          <Button
            onClick={() => onComplete(recommendation)}
            className="h-12"
          >
            Start Investing
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className={`max-w-2xl mx-auto ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Smart SIP Setup</CardTitle>
          <Badge variant="outline">{currentStep + 1} of {steps.length}</Badge>
        </div>
        <Progress value={(currentStep / (steps.length - 1)) * 100} className="h-2" />
      </CardHeader>
      
      <CardContent className="p-6">
        {currentStep === 0 && renderProfileSetup()}
        {currentStep === 1 && renderSpendingAnalysis()}
        {currentStep === 2 && renderRecommendation()}
        {currentStep === 3 && renderConfirmation()}
      </CardContent>
    </Card>
  );
};

export default SmartSipOnboarding;
