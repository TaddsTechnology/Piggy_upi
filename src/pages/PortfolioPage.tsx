import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PortfolioHoldings from "@/components/PortfolioHoldings";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const PortfolioPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Use current user ID or demo user for portfolios
  const userId = user?.id || 'demo_user';

  const handleInvestMore = () => {
    navigate('/invest');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto pt-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Portfolio</h1>
              <p className="text-gray-600">Track your investment performance</p>
            </div>
          </div>
        </div>
        
        {/* Portfolio Holdings Component */}
        <PortfolioHoldings 
          userId={userId}
          onInvestMore={handleInvestMore}
        />
      </div>
    </div>
  );
};

export default PortfolioPage;