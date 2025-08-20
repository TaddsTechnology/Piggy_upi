import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePiggyCore } from "@/hooks/use-piggy-core";
import InvestmentFlow from "@/components/InvestmentFlow";
import { MockInvestmentAPI, Investment } from "@/lib/mock-investment-api";
import { InvestmentToastContainer, InvestmentToast } from "@/components/InvestmentNotifications";

const InvestmentPage = () => {
  const navigate = useNavigate();
  const [piggyState, piggyActions] = usePiggyCore();
  
  // Use piggy balance as available balance for investment
  const availableBalance = piggyState.piggyBalance;

  // Handle investment completion
  const handleInvestmentComplete = async (investment: Investment) => {
    try {
      // Update piggy state to reflect the investment
      // In a real app, this would sync with your backend
      piggyActions.manualInvest(investment.amount);
      
      // Show success notification
      InvestmentToast.success(
        'Investment Successful! 🎉',
        'Your money is now working for you',
        {
          amount: investment.amount,
          portfolio: await getPortfolioName(investment.portfolioId)
        }
      );
      
      // Navigate back to home after a short delay
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      InvestmentToast.error(
        'Investment Failed',
        'Please try again or contact support'
      );
    }
  };
  
  const getPortfolioName = async (portfolioId: string) => {
    const portfolio = await MockInvestmentAPI.getPortfolio(portfolioId);
    return portfolio?.name || 'Unknown Portfolio';
  };


  // Check if user has enough balance
  if (availableBalance < 10) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Insufficient Balance</h2>
          <p className="text-gray-600 mb-6">
            You need at least ₹10 to start investing. Keep using your Piggy account to accumulate more spare change!
          </p>
          <Button onClick={() => navigate('/')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <InvestmentFlow 
        availableBalance={availableBalance}
        onInvestmentComplete={handleInvestmentComplete}
        onBack={() => navigate('/')}
      />
      <InvestmentToastContainer />
    </div>
  );
};

export default InvestmentPage;
