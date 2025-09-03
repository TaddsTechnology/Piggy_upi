import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  IndianRupee, 
  Target, 
  Star,
  ArrowRight,
  Sparkles,
  Trophy,
  Zap,
  BarChart3
} from "lucide-react";
import { usePiggyCore } from "@/hooks/use-piggy-core";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency, formatPercentage } from "@/lib/algorithms";
import { MarketStatus, MarketIndicator } from "@/components/MarketStatus";
import SmartSipOnboarding from "@/components/smartsip/SmartSipOnboarding";
import SmartSipDashboard from "@/components/smartsip/SmartSipDashboard";
import { SmartSipEngine, SipRecommendation } from "@/lib/smart-sip";
import { useGamification } from "@/hooks/useGamification";

const SmartSipHomePage = () => {
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good morning! 🌅" : currentHour < 17 ? "Good afternoon! ☀️" : "Good evening! 🌙";
  
  const navigate = useNavigate();
  const { user, demoMode } = useAuth();
  const [piggyState, piggyActions] = usePiggyCore();
  const { gamificationData, userStats, isLoading: gamificationLoading } = useGamification();
  
  // Smart SIP state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userSipRecommendation, setUserSipRecommendation] = useState<SipRecommendation | null>(null);
  const [hasCompletedSipSetup, setHasCompletedSipSetup] = useState(false);

  // Check user status
  const isNewUser = !demoMode && user && piggyState.transactions.length === 0 && piggyState.holdings.length === 0;
  const hasEmptyPiggy = piggyState.piggyBalance === 0;
  const hasNoTransactions = piggyState.transactions.length === 0;

  // Mock user transactions for Smart SIP analysis
  const mockUserTransactions = React.useMemo(() => {
    const transactions = [];
    const categories = ['food', 'transport', 'shopping', 'entertainment', 'utilities'];
    
    for (let i = 0; i < 30; i++) {
      transactions.push({
        amount: Math.floor(Math.random() * 500) + 100,
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        category: categories[Math.floor(Math.random() * categories.length)],
        merchant: ['Zomato', 'Swiggy', 'Amazon', 'Uber', 'Netflix'][Math.floor(Math.random() * 5)]
      });
    }
    return transactions;
  }, []);

  // Use real user stats from gamification service, fallback to demo data if needed
  const realUserStats = userStats ? {
    totalInvested: userStats.totalInvested,
    monthsActive: userStats.monthsActive,
    consecutiveWeeks: userStats.consecutiveWeeks,
    maxWeeklyInvestment: userStats.maxWeeklyInvestment,
    currentPortfolioValue: userStats.currentPortfolioValue,
    totalReturns: userStats.totalReturns,
    weeklyAmount: userSipRecommendation?.weeklyAmount || userStats.weeklyAmount,
    age: userStats.age || 25
  } : {
    // Fallback to piggy state or demo data
    totalInvested: piggyState.totalInvested || 0,
    monthsActive: 0,
    consecutiveWeeks: 0,
    maxWeeklyInvestment: 0,
    currentPortfolioValue: piggyState.portfolioValue || 0,
    totalReturns: piggyState.totalGains || 0,
    weeklyAmount: userSipRecommendation?.weeklyAmount || 0,
    age: 25
  };

  // Mock other users for social comparison
  const mockAllUsers = [
    { investment: 3000, age: 24 },
    { investment: 8000, age: 26 },
    { investment: 2000, age: 23 },
    { investment: 12000, age: 27 },
    { investment: 6000, age: 25 }
  ];

  const handleSipOnboardingComplete = (recommendation: SipRecommendation) => {
    setUserSipRecommendation(recommendation);
    setShowOnboarding(false);
    setHasCompletedSipSetup(true);
    
    // You would typically save this to your backend/database
    console.log('SIP Setup Complete:', recommendation);
  };

  const handleStartSmartSip = () => {
    if (isNewUser || hasNoTransactions) {
      // Generate some demo transactions first
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          piggyActions.simulateTransaction(
            Math.floor(Math.random() * 300) + 100,
            ['Zomato', 'Swiggy', 'Amazon', 'Uber', 'BigBasket'][Math.floor(Math.random() * 5)]
          );
        }, i * 200);
      }
    }
    setShowOnboarding(true);
  };

  // Show onboarding if requested
  if (showOnboarding) {
    return (
      <div className="container-mobile xl:container xl:max-w-4xl xl:mx-auto xl:py-8">
        <SmartSipOnboarding
          userTransactions={mockUserTransactions}
          onComplete={handleSipOnboardingComplete}
        />
      </div>
    );
  }

  // Show Smart SIP Dashboard if setup is complete
  if (hasCompletedSipSetup && userSipRecommendation) {
    return (
      <div className="container-mobile xl:container xl:max-w-4xl xl:mx-auto xl:py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl xl:text-4xl font-heading font-semibold text-foreground mb-2">
                {greeting}
              </h1>
              <p className="text-muted-foreground xl:text-lg">Your wealth is growing automatically!</p>
            </div>
            <MarketIndicator className="hidden xl:block" />
          </div>
        </div>

        <SmartSipDashboard
          userStats={realUserStats}
          allUsers={mockAllUsers}
        />
      </div>
    );
  }

  // Main homepage with Smart SIP intro
  return (
    <div className="px-4 py-6 xl:container xl:grid xl:grid-cols-12 xl:gap-8 xl:py-8 max-w-full">
      {/* Left Column - Main Content */}
      <div className="xl:col-span-8 space-y-4 xl:space-y-6">
        {/* Header with Navigation */}
        <div className="text-center xl:text-left">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl xl:text-4xl font-heading font-semibold text-foreground mb-2">
                {greeting}
              </h1>
              <p className="text-muted-foreground xl:text-lg">
                {isNewUser ? "Welcome to India's smartest investing app!" : "Let's grow your wealth today"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="gap-2 hidden xl:flex bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 hover:from-blue-700 hover:to-purple-700"
              >
                <BarChart3 size={16} />
                Advanced Dashboard
              </Button>
              <MarketIndicator className="hidden xl:block" />
            </div>
          </div>
          
          {/* Mobile navigation buttons */}
          <div className="flex justify-center mb-4 xl:hidden">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 hover:from-blue-700 hover:to-purple-700"
            >
              <BarChart3 size={14} />
              Advanced Dashboard
            </Button>
          </div>
        </div>

        {/* Smart SIP Hero Section */}
        {isNewUser && (
          <Card className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white shadow-2xl">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                    <Sparkles className="h-12 w-12 text-yellow-300" />
                  </div>
                </div>
                
                <div>
                  <h2 className="text-3xl font-bold mb-3">Smart SIP Technology</h2>
                  <p className="text-blue-100 text-lg">
                    India's first AI-powered investment app that analyzes your spending and invests automatically
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div className="space-y-2">
                    <Zap className="h-8 w-8 text-yellow-300 mx-auto" />
                    <h3 className="font-semibold">Set & Forget</h3>
                    <p className="text-sm text-blue-100">Automatic investing based on your spending patterns</p>
                  </div>
                  <div className="space-y-2">
                    <TrendingUp className="h-8 w-8 text-green-300 mx-auto" />
                    <h3 className="font-semibold">12-15% Returns</h3>
                    <p className="text-sm text-blue-100">Invest in curated ETF portfolios for optimal growth</p>
                  </div>
                  <div className="space-y-2">
                    <Trophy className="h-8 w-8 text-orange-300 mx-auto" />
                    <h3 className="font-semibold">Gamified</h3>
                    <p className="text-sm text-blue-100">Unlock achievements and compete with friends</p>
                  </div>
                </div>

                <Button 
                  onClick={handleStartSmartSip}
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-gray-100 font-bold text-lg px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Star className="mr-2 h-5 w-5" />
                  Get My Smart SIP Plan
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Existing User Portfolio */}
        {!isNewUser && !hasEmptyPiggy && (
          <Card className="mb-6 bg-gradient-to-br from-primary via-primary/90 to-secondary text-white shadow-2xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="text-yellow-300" size={20} />
                    <p className="text-white/90 text-sm font-medium">Smart SIP Portfolio</p>
                    <Badge className="bg-green-500 text-white text-xs">Active</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <IndianRupee size={28} />
                    <span className="text-4xl xl:text-5xl font-heading font-bold tracking-tight">
                      {piggyState.portfolioValue.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-white/70 text-sm mt-1">Growing automatically every week</p>
                </div>
                <div className="text-right">
                  <div className="bg-white/20 text-white border border-white/30 px-3 py-2 rounded-full text-sm font-semibold">
                    <TrendingUp size={12} className="mr-1 inline" />
                    {formatPercentage(piggyState.gainsPercent)}
                  </div>
                  <p className="text-white/70 text-xs mt-1">Total Returns</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-4 text-white/80 text-sm">
                <div>
                  <p className="text-white/60 text-xs">Invested</p>
                  <p className="font-semibold">{formatCurrency(piggyState.totalInvested)}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs">Weekly SIP</p>
                  <p className="font-semibold text-green-200">₹200</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs">Next Investment</p>
                  <p className="font-semibold text-blue-200">This Sunday</p>
                </div>
              </div>
              
              <div className="mt-6 flex gap-3">
                <Button 
                  onClick={() => setShowOnboarding(true)}
                  variant="secondary" 
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                >
                  View Dashboard
                </Button>
                <Button 
                  onClick={() => navigate('/settings')}
                  variant="outline" 
                  size="sm"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Modify SIP
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Call to Action for New Users or Setup */}
        {!hasCompletedSipSetup && (
          <div className="space-y-4">
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {isNewUser ? "Start Your Wealth Journey" : "Upgrade to Smart SIP"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {isNewUser 
                    ? "Join thousands of Indians who are building wealth automatically with just ₹50/week"
                    : "Switch from manual round-ups to intelligent automatic investing"
                  }
                </p>
                <Button 
                  onClick={handleStartSmartSip}
                  size="lg" 
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold"
                >
                  {isNewUser ? "Setup Smart SIP (5 minutes)" : "Analyze My Spending"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
            
            {/* Social Proof */}
            <div className="text-center space-y-2">
              <div className="flex justify-center items-center space-x-1">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-sm text-gray-600">
                "Smart SIP helped me invest ₹50,000 in 2 years without thinking about it!" - Rahul, Age 26
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Right Column - Market Status & Info */}
      <div className="xl:col-span-4 xl:space-y-6 mt-6 xl:mt-0">
        <MarketStatus />
        
        {/* Quick Stats */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Why Smart SIP Works</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Average user saves</span>
                <span className="font-semibold text-green-600">₹400/month</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Consistency rate</span>
                <span className="font-semibold text-blue-600">94%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Average returns</span>
                <span className="font-semibold text-purple-600">13.2%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SmartSipHomePage;
