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

const HomePage = () => {
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good morning! 🌅" : currentHour < 17 ? "Good afternoon! ☀️" : "Good evening! 🌙";
  
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
            <h1 className="text-2xl xl:text-4xl font-heading font-semibold text-foreground mb-2">
              {greeting}
            </h1>
            <p className="text-muted-foreground xl:text-lg">Let's grow your wealth today</p>
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
          <Card className="mb-6 bg-gradient-growth text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white/80 text-sm mb-1">Portfolio Value</p>
                  <div className="flex items-center gap-2">
                    <IndianRupee size={20} />
                    <span className="balance-text text-white">{formatCurrency(piggyState.portfolioValue)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="growth-indicator !bg-white/20 !text-white">
                    <TrendingUp size={12} className="mr-1" />
                    {formatPercentage(piggyState.gainsPercent)}
                  </div>
                </div>
              </div>
              <p className="text-white/80 text-sm">
                Invested: {formatCurrency(piggyState.totalInvested)} • Gains: {formatCurrency(piggyState.totalGains)}
              </p>
              <p className="text-white/80 text-xs mt-2">
                Piggy Balance: {formatCurrency(piggyState.piggyBalance)} ready to invest
              </p>
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
            className="w-full bg-gradient-growth hover:opacity-90 font-heading font-medium"
            onClick={() => {
              if (piggyState.piggyBalance >= 50) {
                piggyActions.manualInvest(piggyState.piggyBalance);
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
            {piggyState.piggyBalance >= 50 ? 'Invest Now' : 'Build Balance First'}
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

        {/* Quick Stats */}
        {!isNewUser && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-medium">Quick Stats</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => piggyActions.refreshPrices()}
                >
                  Refresh
                </Button>
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