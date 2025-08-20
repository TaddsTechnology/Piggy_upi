import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  DollarSign,
  Clock,
  TrendingUp,
  Shield,
  Sparkles,
  Target,
  Coffee,
  Car,
  ShoppingBag,
  Gamepad2
} from "lucide-react";

interface OnboardingProps {
  onComplete: (data: any) => void;
}

const SimpleOnboarding = ({ onComplete }: OnboardingProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    monthlySpending: '',
    spendingCategories: [] as string[],
    investmentGoal: '',
    riskComfort: ''
  });

  const totalSteps = 5;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const spendingOptions = [
    { id: 'food', label: 'Food & Dining', icon: Coffee, color: 'bg-orange-100 text-orange-600' },
    { id: 'transport', label: 'Transportation', icon: Car, color: 'bg-blue-100 text-blue-600' },
    { id: 'shopping', label: 'Shopping', icon: ShoppingBag, color: 'bg-pink-100 text-pink-600' },
    { id: 'entertainment', label: 'Entertainment', icon: Gamepad2, color: 'bg-purple-100 text-purple-600' }
  ];

  const investmentGoals = [
    { id: 'emergency', label: 'Emergency Fund', desc: 'Build a safety net for unexpected expenses' },
    { id: 'vacation', label: 'Dream Vacation', desc: 'Save for that trip you\'ve always wanted' },
    { id: 'gadget', label: 'New Gadget', desc: 'iPhone, laptop, or other tech purchases' },
    { id: 'future', label: 'Future Planning', desc: 'Long-term wealth building and retirement' }
  ];

  const riskOptions = [
    { id: 'safe', label: 'Play it Safe', desc: 'Lower returns but very secure (8-10%)', color: 'bg-green-100 text-green-700' },
    { id: 'balanced', label: 'Balanced Growth', desc: 'Mix of safety and growth (10-12%)', color: 'bg-blue-100 text-blue-700' },
    { id: 'aggressive', label: 'Growth Focused', desc: 'Higher potential returns (12-15%)', color: 'bg-purple-100 text-purple-700' }
  ];

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Calculate recommended weekly investment based on spending
    const monthlySpending = parseInt(formData.monthlySpending) || 5000;
    const recommendedWeekly = Math.max(Math.floor(monthlySpending * 0.02), 50); // 2% of monthly spending, minimum ₹50
    
    const result = {
      ...formData,
      recommendedWeeklyAmount: recommendedWeekly,
      setupDate: new Date(),
      estimatedMonthlyInvestment: recommendedWeekly * 4.33
    };
    
    onComplete(result);
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleCategory = (categoryId: string) => {
    const currentCategories = formData.spendingCategories;
    if (currentCategories.includes(categoryId)) {
      updateFormData('spendingCategories', currentCategories.filter(id => id !== categoryId));
    } else {
      updateFormData('spendingCategories', [...currentCategories, categoryId]);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: return formData.name.trim().length > 0;
      case 1: return formData.monthlySpending.length > 0;
      case 2: return formData.spendingCategories.length > 0;
      case 3: return formData.investmentGoal.length > 0;
      case 4: return formData.riskComfort.length > 0;
      default: return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Hi there! What should we call you? 👋</h2>
              <p className="text-gray-600">Just your first name is fine</p>
            </div>
            <div className="space-y-3">
              <Label htmlFor="name" className="text-sm font-medium">Your Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., Rahul"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                className="h-12 text-lg"
                autoFocus
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">How much do you spend per month? 💳</h2>
              <p className="text-gray-600">Including food, transport, shopping, bills - everything!</p>
            </div>
            <div className="space-y-3">
              <Label htmlFor="spending" className="text-sm font-medium">Monthly Spending (₹)</Label>
              <Input
                id="spending"
                type="number"
                placeholder="e.g., 15000"
                value={formData.monthlySpending}
                onChange={(e) => updateFormData('monthlySpending', e.target.value)}
                className="h-12 text-lg"
                autoFocus
              />
              <div className="flex justify-center gap-2 mt-4">
                {['5000', '10000', '20000', '35000'].map(amount => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => updateFormData('monthlySpending', amount)}
                    className="text-xs"
                  >
                    ₹{amount}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">What do you spend money on? 🛒</h2>
              <p className="text-gray-600">Select all that apply (we'll round up these transactions)</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {spendingOptions.map(option => {
                const Icon = option.icon;
                const isSelected = formData.spendingCategories.includes(option.id);
                return (
                  <div
                    key={option.id}
                    onClick={() => toggleCategory(option.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`${option.color} w-10 h-10 rounded-full flex items-center justify-center mb-3`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-sm">{option.label}</h3>
                    {isSelected && <CheckCircle className="h-5 w-5 text-blue-500 mt-2" />}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">What are you saving for? 🎯</h2>
              <p className="text-gray-600">Having a goal makes it easier to stay motivated</p>
            </div>
            <div className="space-y-3">
              {investmentGoals.map(goal => (
                <div
                  key={goal.id}
                  onClick={() => updateFormData('investmentGoal', goal.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.investmentGoal === goal.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{goal.label}</h3>
                      <p className="text-sm text-gray-600">{goal.desc}</p>
                    </div>
                    {formData.investmentGoal === goal.id && (
                      <CheckCircle className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">How do you feel about risk? 📊</h2>
              <p className="text-gray-600">Don't worry, all options are safe and regulated</p>
            </div>
            <div className="space-y-3">
              {riskOptions.map(option => (
                <div
                  key={option.id}
                  onClick={() => updateFormData('riskComfort', option.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.riskComfort === option.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={option.color}>{option.label}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{option.desc}</p>
                    </div>
                    {formData.riskComfort === option.id && (
                      <CheckCircle className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6 pt-8">
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Step {currentStep + 1} of {totalSteps}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Main Content */}
        <Card className="shadow-xl border-0">
          <CardContent className="p-8">
            {renderStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={!isStepValid()}
            className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {currentStep === totalSteps - 1 ? (
              <>
                <Sparkles className="h-4 w-4" />
                Complete Setup
              </>
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-center space-y-2">
          <p className="text-xs text-gray-500">
            🔒 Your information is encrypted and secure
          </p>
          <div className="flex justify-center items-center gap-4 text-xs text-gray-400">
            <Badge variant="outline" className="gap-1">
              <Shield className="h-3 w-3" />
              Bank-level security
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              2 minutes left
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleOnboarding;
