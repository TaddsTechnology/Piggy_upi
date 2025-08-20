import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Home,
  PiggyBank, 
  BarChart3,
  Calendar,
  Settings,
  HelpCircle
} from "lucide-react";

import WelcomePage from "@/components/WelcomePage";
import SimpleOnboarding from "@/components/SimpleOnboarding";
import SimpleDashboard from "@/components/SimpleDashboard";
import SimpleTransactions from "@/components/SimpleTransactions";
import SimpleHelp from "@/components/SimpleHelp";
import InvestmentFlow from "@/components/InvestmentFlow";
import PortfolioHoldings from "@/components/PortfolioHoldings";

// App states
type AppState = 'welcome' | 'onboarding' | 'dashboard' | 'invest' | 'portfolio';

// Mock transactions for demo
const mockTransactions = [
  {
    id: '1',
    date: new Date().toISOString(),
    amount: 127.50,
    merchant: 'Zomato',
    category: 'Food',
    roundup: 2.50
  },
  {
    id: '2',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    amount: 350.75,
    merchant: 'Amazon',
    category: 'Shopping',
    roundup: 4.25
  },
  {
    id: '3',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 78.20,
    merchant: 'Uber',
    category: 'Transport',
    roundup: 1.80
  },
  {
    id: '4',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 249.35,
    merchant: 'Swiggy',
    category: 'Food',
    roundup: 0.65
  },
  {
    id: '5',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 599.45,
    merchant: 'Flipkart',
    category: 'Shopping',
    roundup: 0.55
  }
];

const SimpleApp = () => {
  // App state management
  const [appState, setAppState] = useState<AppState>('welcome');
  const [activeTab, setActiveTab] = useState('home');
  const [availableBalance, setAvailableBalance] = useState(5000); // Mock available balance
  
  // User data
  const [userData, setUserData] = useState({
    name: '',
    weeklyAmount: 200,
    investmentGoal: 'emergency',
    monthsActive: 1
  });
  
  // App stats
  const [appStats, setAppStats] = useState({
    totalSaved: 3500,
    currentValue: 3780,
    profit: 280,
    nextInvestment: 'Sunday',
    goalProgress: 25
  });
  
  // Transactions state
  const [transactions, setTransactions] = useState(mockTransactions);
  
  // Handle onboarding completion
  const handleOnboardingComplete = (data: any) => {
    setUserData({
      ...userData,
      name: data.name,
      weeklyAmount: data.recommendedWeeklyAmount,
      investmentGoal: data.investmentGoal
    });
    setAppState('dashboard');
  };

  // Handle investment completion
  const handleInvestmentComplete = (investment: any) => {
    // Update available balance
    setAvailableBalance(prev => prev - investment.amount);
    
    // Update app stats
    setAppStats(prev => ({
      ...prev,
      totalSaved: prev.totalSaved + investment.amount,
      currentValue: prev.currentValue + investment.amount
    }));
    
    // Go back to dashboard
    setAppState('dashboard');
    setActiveTab('home');
  };
  
  // Generate a new mock transaction
  const addMockTransaction = () => {
    const merchants = ['Zomato', 'Swiggy', 'Amazon', 'Flipkart', 'Uber', 'BigBasket', 'Netflix'];
    const categories = ['Food', 'Shopping', 'Transport', 'Entertainment'];
    
    const randomMerchant = merchants[Math.floor(Math.random() * merchants.length)];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomAmount = Math.floor(Math.random() * 500) + 50 + (Math.random() * 0.99);
    const roundupAmount = Math.ceil(randomAmount) - randomAmount;
    
    const newTransaction = {
      id: `${Date.now()}`,
      date: new Date().toISOString(),
      amount: parseFloat(randomAmount.toFixed(2)),
      merchant: randomMerchant,
      category: randomCategory,
      roundup: parseFloat(roundupAmount.toFixed(2))
    };
    
    // Update transactions and stats
    setTransactions([newTransaction, ...transactions]);
    
    const newTotalSaved = appStats.totalSaved + roundupAmount;
    
    setAppStats({
      ...appStats,
      totalSaved: newTotalSaved,
      currentValue: newTotalSaved + appStats.profit
    });
  };

  // Render based on app state
  const renderContent = () => {
    switch (appState) {
      case 'welcome':
        return <WelcomePage onGetStarted={() => setAppState('onboarding')} />;
        
      case 'onboarding':
        return <SimpleOnboarding onComplete={handleOnboardingComplete} />;
        
      case 'invest':
        return (
          <InvestmentFlow 
            availableBalance={availableBalance}
            onInvestmentComplete={handleInvestmentComplete}
            onBack={() => setAppState('dashboard')}
          />
        );
        
      case 'portfolio':
        return (
          <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
            <div className="max-w-4xl mx-auto pt-4">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">My Investments</h1>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setAppState('dashboard');
                    setActiveTab('home');
                  }}
                >
                  Back to Dashboard
                </Button>
              </div>
              <PortfolioHoldings 
                userId="demo_user"
                onInvestMore={() => setAppState('invest')}
              />
            </div>
          </div>
        );
        
      case 'dashboard':
        return (
          <div className="min-h-screen">
            <Tabs 
              defaultValue="home" 
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsContent value="home" className="mt-0">
                <SimpleDashboard 
                  userProfile={userData} 
                  stats={appStats}
                  onInvestNow={() => setAppState('invest')}
                  onViewPortfolio={() => setAppState('portfolio')}
                />
              </TabsContent>
              
              <TabsContent value="transactions" className="mt-0">
                <SimpleTransactions 
                  transactions={transactions} 
                  totalRoundups={appStats.totalSaved}
                  onSimulateTransaction={addMockTransaction}
                />
              </TabsContent>
              
              <TabsContent value="help" className="mt-0">
                <SimpleHelp />
              </TabsContent>
              
              {/* Bottom Navigation */}
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 flex justify-around items-center z-50">
                <TabsList className="hidden">
                  <TabsTrigger value="home">Home</TabsTrigger>
                  <TabsTrigger value="transactions">Transactions</TabsTrigger>
                  <TabsTrigger value="help">Help</TabsTrigger>
                </TabsList>
                
                <Button 
                  variant={activeTab === 'home' ? 'default' : 'ghost'} 
                  size="sm"
                  className="flex flex-col items-center gap-1 h-auto py-2"
                  onClick={() => setActiveTab('home')}
                >
                  <Home className="h-5 w-5" />
                  <span className="text-xs">Home</span>
                </Button>
                
                <Button 
                  variant={activeTab === 'transactions' ? 'default' : 'ghost'} 
                  size="sm"
                  className="flex flex-col items-center gap-1 h-auto py-2"
                  onClick={() => setActiveTab('transactions')}
                >
                  <Calendar className="h-5 w-5" />
                  <span className="text-xs">History</span>
                </Button>
                
                <Button 
                  variant="outline"
                  size="sm" 
                  className="flex flex-col items-center justify-center rounded-full w-14 h-14 border-2 border-primary bg-primary text-white shadow-lg"
                  onClick={addMockTransaction}
                >
                  <PiggyBank className="h-6 w-6" />
                </Button>
                
                <Button 
                  variant={activeTab === 'stats' ? 'default' : 'ghost'} 
                  size="sm"
                  className="flex flex-col items-center gap-1 h-auto py-2"
                  onClick={() => setActiveTab('stats')}
                >
                  <BarChart3 className="h-5 w-5" />
                  <span className="text-xs">Stats</span>
                </Button>
                
                <Button 
                  variant={activeTab === 'help' ? 'default' : 'ghost'} 
                  size="sm"
                  className="flex flex-col items-center gap-1 h-auto py-2"
                  onClick={() => setActiveTab('help')}
                >
                  <HelpCircle className="h-5 w-5" />
                  <span className="text-xs">Help</span>
                </Button>
              </div>
            </Tabs>
          </div>
        );
        
      default:
        return <WelcomePage onGetStarted={() => setAppState('onboarding')} />;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {renderContent()}
    </div>
  );
};

export default SimpleApp;
