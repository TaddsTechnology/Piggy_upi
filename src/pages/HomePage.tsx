import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, IndianRupee, Target, Plus } from "lucide-react";
import { usePiggyCore } from "@/hooks/use-piggy-core";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency, formatPercentage } from "@/lib/algorithms";
import { 
  WelcomeNewUser, 
  OnboardingSteps, 
  EmptyPiggyBalanceState, 
  EmptyTransactionsState 
} from "@/components/EmptyStates";
import { MarketStatus, MarketIndicator } from "@/components/MarketStatus";

const HomePage = () => {
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good morning! 🌅" : currentHour < 17 ? "Good afternoon! ☀️" : "Good evening! 🌙";
  
  const navigate = useNavigate();
  const { user, demoMode } = useAuth();
  const [piggyState, piggyActions] = usePiggyCore();
  
  // Check if user is new (no transactions and no holdings)
  const isNewUser = !demoMode && user && piggyState.transactions.length === 0 && piggyState.holdings.length === 0;
  const hasEmptyPiggy = piggyState.piggyBalance === 0;
  const hasNoTransactions = piggyState.transactions.length === 0;

  return (
    <div className="container-mobile xl:container xl:grid xl:grid-cols-12 xl:gap-8 xl:py-8">
      {/* Left Column - Main Content */}
      <div className="xl:col-span-8 space-y-6">
        {/* Welcome message for new users */}
        {isNewUser && (
          <WelcomeNewUser 
            userName={user?.user_metadata?.full_name || user?.email?.split('@')[0]} 
            onStartTour={() => {
              // You can implement a tour feature here
              console.log('Starting user tour...');
            }} 
          />
        )}
        
        {/* Onboarding steps for new users */}
        {isNewUser && (
          <OnboardingSteps 
            currentStep={0}
            onStepClick={(step) => {
              // Navigate to relevant settings based on step
              console.log(`Clicked step: ${step}`);
            }}
          />
        )}
        
        {/* Header */}
        {!isNewUser && (
          <div className="text-center xl:text-left">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl xl:text-4xl font-heading font-semibold text-foreground mb-2">
                  {greeting}
                </h1>
                <p className="text-muted-foreground xl:text-lg">Let's grow your wealth today</p>
              </div>
              <MarketIndicator className="hidden xl:block" />
            </div>
          </div>
        )}

        {/* Wallet Balance or Empty Piggy State */}
        {hasEmptyPiggy && !isNewUser ? (
          <EmptyPiggyBalanceState 
            onAddFunds={() => {
              // Simulate adding funds
              for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                  piggyActions.simulateTransaction(
                    Math.floor(Math.random() * 300) + 100,
                    ['Zomato', 'Swiggy', 'Amazon'][i]
                  );
                }, i * 500);
              }
            }}
          />
        ) : !isNewUser ? (
          <Card className="mb-6 bg-gradient-to-br from-primary via-primary/90 to-secondary text-white shadow-2xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="text-yellow-300" size={20} />
                    <p className="text-white/90 text-sm font-medium">Portfolio Value</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <IndianRupee size={28} />
                    <span className="text-4xl xl:text-5xl font-heading font-bold tracking-tight">
                      {piggyState.portfolioValue.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-white/70 text-sm mt-1 flex items-center gap-1">
                    📈 Your wealth is growing! 
                    {piggyState.piggyBalance >= 10 && (
                      <span className="bg-white/20 px-2 py-1 rounded text-xs ml-2">
                        Ready to invest
                      </span>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <div className="bg-white/20 text-white border border-white/30 px-3 py-2 rounded-full text-sm font-semibold">
                    <TrendingUp size={12} className="mr-1 inline" />
                    {formatPercentage(piggyState.gainsPercent)}
                  </div>
                  <p className="text-white/70 text-xs mt-1">Total Returns</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4 text-white/80 text-sm">
                <div>
                  <p className="text-white/60 text-xs">Invested</p>
                  <p className="font-semibold">{formatCurrency(piggyState.totalInvested)}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs">Gains</p>
                  <p className="font-semibold text-yellow-200">{formatCurrency(piggyState.totalGains)}</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-white/20">
                <p className="text-white/70 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Piggy Balance: <span className="font-semibold text-green-200">{formatCurrency(piggyState.piggyBalance)}</span> ready to invest
                </p>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* This Week's Round-Up */}
        {!isNewUser && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="text-primary" size={20} />
                <h3 className="font-heading font-medium">This Week's Round-Up</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{formatCurrency(piggyState.weeklyProgress)} / {formatCurrency(piggyState.weeklyTarget)}</span>
                </div>
                <Progress value={Math.min(piggyState.weeklyRoundups, 100)} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  {piggyState.weeklyProgress >= piggyState.weeklyTarget 
                    ? "🎉 Weekly goal achieved! Keep it up!"
                    : `Only ${formatCurrency(piggyState.weeklyTarget - piggyState.weeklyProgress)} more to reach your weekly investment goal!`
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* CTA Button */}
        {!isNewUser && (
          <Button 
            size="lg" 
            className="w-full h-14 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-heading font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
            onClick={() => {
              if (piggyState.piggyBalance >= 10) {
                navigate('/invest');
              } else {
                // Simulate adding some transactions to build balance
                for (let i = 0; i < 5; i++) {
                  setTimeout(() => {
                    piggyActions.simulateTransaction(
                      Math.floor(Math.random() * 300) + 100,
                      ['Zomato', 'Swiggy', 'Amazon', 'Uber', 'BigBasket'][Math.floor(Math.random() * 5)]
                    );
                  }, i * 200);
                }
              }
            }}
            disabled={piggyState.piggyBalance < 1}
          >
            <div className="flex items-center gap-2">
              <TrendingUp size={18} />
              {piggyState.piggyBalance >= 10 ? '💰 Invest Now' : '🔄 Build Balance First'}
            </div>
          </Button>
        )}
      </div>

      {/* Right Column - Sidebar */}
      <div className="xl:col-span-4 xl:space-y-6 mt-6 xl:mt-0">
        {/* Recent Transactions or Empty State */}
        <Card>
          <CardContent className="p-6">
            {hasNoTransactions ? (
              <EmptyTransactionsState 
                onSimulate={() => {
                  piggyActions.simulateTransaction(
                    Math.floor(Math.random() * 500) + 100, 
                    "Demo Transaction"
                  );
                }}
              />
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading font-medium">Recent Round-Ups</h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => piggyActions.simulateTransaction(Math.floor(Math.random() * 500) + 100, "Test Transaction")}
                  >
                    <Plus size={16} className="mr-1" />
                    Simulate
                  </Button>
                </div>
                <div className="space-y-3">
                  {piggyState.transactions.slice(0, 3).map((transaction) => {
                    const roundupEntry = piggyState.ledger.find(entry => 
                      entry.reference === transaction.id && entry.type === 'roundup_credit'
                    );
                    
                    return (
                      <div key={transaction.id} className="flex items-center justify-between py-2">
                        <div>
                          <p className="font-medium">{transaction.merchant}</p>
                          <p className="text-sm text-muted-foreground">{formatCurrency(transaction.amount)}</p>
                        </div>
                        {roundupEntry && (
                          <div className="round-up-badge">+{formatCurrency(roundupEntry.amount)}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Market Status */}
        {!isNewUser && (
          <MarketStatus showDetailedView={false} />
        )}
        
        {/* Quick Stats */}
        {!isNewUser && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-medium">Quick Stats</h3>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate('/portfolio')}
                    className="text-xs"
                  >
                    📊 Portfolio
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => piggyActions.refreshPrices()}
                  >
                    Refresh
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Piggy Balance</span>
                  <span className="font-medium text-primary">{formatCurrency(piggyState.piggyBalance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Invested</span>
                  <span className="font-medium text-success">{formatCurrency(piggyState.totalInvested)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Growth Rate</span>
                  <span className={`font-medium ${piggyState.gainsPercent >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {formatPercentage(piggyState.gainsPercent)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default HomePage;