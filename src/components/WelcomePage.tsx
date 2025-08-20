import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Play,
  PiggyBank, 
  IndianRupee, 
  TrendingUp, 
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Clock,
  Target,
  Lightbulb
} from "lucide-react";

const WelcomePage = ({ onGetStarted }: { onGetStarted: () => void }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "💸 Spend Money Normally",
      description: "Shop at Zomato, Amazon, anywhere you like",
      example: "₹127 → rounded to ₹130"
    },
    {
      title: "🪙 We Save Your Change",
      description: "We automatically save the extra ₹3",
      example: "Spare change adds up!"
    },
    {
      title: "📈 We Invest It",
      description: "Your saved money grows in safe investments",
      example: "₹3 becomes ₹3.40 in a year"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="max-w-4xl mx-auto space-y-8 pt-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-pink-500 to-purple-600 text-white p-4 rounded-full shadow-lg">
              <PiggyBank className="h-12 w-12" />
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">Piggy</span>! 🐷
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            The <strong>simplest way</strong> to start investing in India. No complicated forms, no minimum amounts, no stress!
          </p>
        </div>

        {/* How It Works - Simple Version */}
        <Card className="bg-white shadow-xl border-0">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                How does this work? 🤔
              </h2>
              <p className="text-gray-600">It's actually super simple. Let us show you:</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {steps.map((step, index) => (
                <div 
                  key={index}
                  className={`text-center p-6 rounded-xl transition-all duration-300 ${
                    currentStep === index 
                      ? 'bg-gradient-to-br from-blue-100 to-purple-100 border-2 border-blue-300 scale-105' 
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="text-4xl mb-3">{index + 1}</div>
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{step.description}</p>
                  <div className="bg-white p-2 rounded text-sm font-medium text-blue-600">
                    {step.example}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-6">
              <Button 
                onClick={() => setCurrentStep((prev) => (prev + 1) % steps.length)}
                variant="outline" 
                size="sm"
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                Show me step {currentStep + 1}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Benefits - Simple Language */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-green-100 to-blue-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-500 text-white p-2 rounded-full">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg">Safe & Secure</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Bank-level security (same as your banking app)</li>
                <li>• Your money is invested in government-backed funds</li>
                <li>• You can withdraw anytime, no lock-in</li>
                <li>• Regulated by SEBI (like all mutual funds)</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-100 to-pink-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-500 text-white p-2 rounded-full">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg">Actually Works</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Average user saves ₹500/month automatically</li>
                <li>• 10-12% returns (historically, mutual funds)</li>
                <li>• No effort required once set up</li>
                <li>• Start with as little as ₹1</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Real Example */}
        <Card className="bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-300">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-yellow-500 text-white p-2 rounded-full">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Real Example: Meet Priya 👩‍💼</h3>
                <p className="text-gray-700 mb-3">
                  Priya, a 25-year-old from Bangalore, spends ₹100-300 daily on food, transport, and shopping. 
                  She never thought she could invest because she doesn't understand the stock market.
                </p>
                <div className="bg-white p-4 rounded-lg">
                  <div className="grid md:grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">₹50</p>
                      <p className="text-sm text-gray-600">Average saved per week</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">₹2,600</p>
                      <p className="text-sm text-gray-600">Invested in 1 year</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-600">₹2,920</p>
                      <p className="text-sm text-gray-600">Value after returns</p>
                    </div>
                  </div>
                  <p className="text-center text-sm text-gray-600 mt-3">
                    <strong>₹320 extra money</strong> - just from spare change! 🎉
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-3">Ready to start? It takes 2 minutes ⏰</h2>
            <p className="text-blue-100 mb-6">
              No paperwork, no complicated questions. Just answer a few simple questions about your spending.
            </p>
            
            <div className="grid md:grid-cols-3 gap-4 mb-6 text-sm">
              <div className="bg-white/20 p-3 rounded-lg">
                <Clock className="h-5 w-5 mx-auto mb-2" />
                <p>2 minutes setup</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Target className="h-5 w-5 mx-auto mb-2" />
                <p>Start with ₹1</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Shield className="h-5 w-5 mx-auto mb-2" />
                <p>100% secure</p>
              </div>
            </div>

            <Button 
              onClick={onGetStarted}
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 font-bold text-lg px-8 py-4 rounded-full shadow-lg"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Start Investing My Spare Change
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <p className="text-xs text-blue-200 mt-4">
              No credit card required • No minimum balance • Cancel anytime
            </p>
          </CardContent>
        </Card>

        {/* Trust Indicators */}
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-500">Trusted by 50,000+ Indians</p>
          <div className="flex justify-center items-center gap-6 text-xs text-gray-400">
            <Badge variant="outline" className="gap-1">
              <Shield className="h-3 w-3" />
              SEBI Registered
            </Badge>
            <Badge variant="outline" className="gap-1">
              <CheckCircle className="h-3 w-3" />
              256-bit SSL
            </Badge>
            <Badge variant="outline" className="gap-1">
              <TrendingUp className="h-3 w-3" />
              12% Avg Returns
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
