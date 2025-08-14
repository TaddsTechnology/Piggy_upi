import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  PiggyBank, 
  TrendingUp, 
  Coins, 
  ArrowRight,
  Wallet,
  BarChart3,
  Target,
  Gift
} from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState = ({ title, description, icon, action, className = "" }: EmptyStateProps) => {
  return (
    <div className={`text-center py-12 px-6 ${className}`}>
      <div className="mb-6 flex justify-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-heading font-semibold text-foreground mb-3">
        {title}
      </h3>
      <p className="text-muted-foreground max-w-md mx-auto leading-relaxed mb-6">
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick} className="bg-gradient-growth">
          {action.label} <ArrowRight size={16} className="ml-2" />
        </Button>
      )}
    </div>
  );
};

// Specific empty state components for different sections
export const EmptyPortfolioState = ({ onGetStarted }: { onGetStarted: () => void }) => (
  <EmptyState
    icon={<TrendingUp size={32} className="text-primary" />}
    title="Start Your Investment Journey"
    description="Your portfolio is empty, but that's about to change! Start by making some UPI transactions, and we'll automatically round up your spare change for investment."
    action={{
      label: "Learn How It Works",
      onClick: onGetStarted
    }}
  />
);

export const EmptyTransactionsState = ({ onSimulate }: { onSimulate: () => void }) => (
  <EmptyState
    icon={<Wallet size={32} className="text-primary" />}
    title="No Transactions Yet"
    description="Once you start making UPI payments, we'll automatically track them here and round up your spare change. Try the demo to see how it works!"
    action={{
      label: "Try Demo Transaction",
      onClick: onSimulate
    }}
  />
);

export const EmptyPiggyBalanceState = ({ onAddFunds }: { onAddFunds: () => void }) => (
  <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-dashed border-2">
    <CardContent className="p-8">
      <EmptyState
        icon={<PiggyBank size={32} className="text-primary" />}
        title="Your Piggy is Empty"
        description="Start making UPI transactions to build your spare change balance. Every ₹127 payment becomes ₹130, and the ₹3 goes into your piggy!"
        action={{
          label: "Add Funds Manually",
          onClick: onAddFunds
        }}
        className="py-6"
      />
    </CardContent>
  </Card>
);

export const EmptyRewardsState = () => (
  <EmptyState
    icon={<Gift size={32} className="text-primary" />}
    title="No Rewards Yet"
    description="Complete your first investment to start earning rewards and unlocking achievements. Every investment brings you closer to your financial goals!"
  />
);

export const EmptyInsightsState = () => (
  <EmptyState
    icon={<BarChart3 size={32} className="text-primary" />}
    title="Building Your Analytics"
    description="Once you have some transactions and investments, we'll show you personalized insights about your spending patterns and investment growth."
  />
);

// Welcome component for new users
export const WelcomeNewUser = ({ userName, onStartTour }: { userName?: string; onStartTour: () => void }) => (
  <Card className="mb-6 bg-gradient-growth text-white">
    <CardContent className="p-8 text-center">
      <div className="mb-4">
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <PiggyBank size={32} className="text-white" />
        </div>
        <h2 className="text-2xl font-heading font-semibold mb-2">
          Welcome to UPI Piggy{userName ? `, ${userName}` : ''}! 🎉
        </h2>
        <p className="text-white/90 text-lg mb-6">
          You're now part of a community that turns spare change into wealth. 
          Let's get you started on your investment journey!
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-left">
        <div className="bg-white/10 rounded-lg p-4">
          <Coins size={24} className="text-white mb-2" />
          <h4 className="font-semibold mb-1">Auto Round-ups</h4>
          <p className="text-sm text-white/80">Every UPI payment gets rounded up automatically</p>
        </div>
        <div className="bg-white/10 rounded-lg p-4">
          <TrendingUp size={24} className="text-white mb-2" />
          <h4 className="font-semibold mb-1">Smart Investing</h4>
          <p className="text-sm text-white/80">Your spare change goes into diversified ETFs</p>
        </div>
        <div className="bg-white/10 rounded-lg p-4">
          <Target size={24} className="text-white mb-2" />
          <h4 className="font-semibold mb-1">Wealth Building</h4>
          <p className="text-sm text-white/80">Watch your investments grow over time</p>
        </div>
      </div>
      
      <Button 
        variant="secondary" 
        size="lg" 
        onClick={onStartTour}
        className="bg-white text-primary hover:bg-white/90"
      >
        Take a Quick Tour <ArrowRight size={16} className="ml-2" />
      </Button>
    </CardContent>
  </Card>
);

// Onboarding steps component
export const OnboardingSteps = ({ currentStep = 0, onStepClick }: { 
  currentStep?: number; 
  onStepClick: (step: number) => void;
}) => {
  const steps = [
    {
      title: "Set Up Round-ups",
      description: "Configure how you want to round up your transactions",
      icon: <Coins size={20} />
    },
    {
      title: "Choose Portfolio",
      description: "Pick your investment style: Safe, Balanced, or Growth",
      icon: <TrendingUp size={20} />
    },
    {
      title: "Make First Transaction",
      description: "Try a demo transaction or wait for real UPI payments",
      icon: <Wallet size={20} />
    },
    {
      title: "Watch It Grow",
      description: "Monitor your investments and see your wealth build up",
      icon: <BarChart3 size={20} />
    }
  ];

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <h3 className="font-heading font-semibold text-lg mb-4">Get Started in 4 Easy Steps</h3>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div 
              key={index}
              className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                index === currentStep 
                  ? 'bg-primary/10 border border-primary/20' 
                  : index < currentStep 
                    ? 'bg-success/10 border border-success/20' 
                    : 'bg-muted/50'
              }`}
              onClick={() => onStepClick(index)}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                index === currentStep 
                  ? 'bg-primary text-white' 
                  : index < currentStep 
                    ? 'bg-success text-white' 
                    : 'bg-muted'
              }`}>
                {index < currentStep ? '✓' : step.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{step.title}</h4>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
              {index === currentStep && (
                <ArrowRight size={16} className="text-primary" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
