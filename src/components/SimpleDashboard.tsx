import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  PiggyBank,
  TrendingUp,
  Target,
  Star,
  Gift,
  ChevronRight,
  IndianRupee,
  Calendar,
  Lightbulb,
  Trophy,
  Zap,
  Heart,
  Sparkles,
  HelpCircle
} from "lucide-react";

interface DashboardProps {
  userProfile: {
    name: string;
    weeklyAmount: number;
    investmentGoal: string;
    monthsActive: number;
  };
  stats: {
    totalSaved: number;
    currentValue: number;
    profit: number;
    nextInvestment: string;
    goalProgress: number;
  };
  onInvestNow?: () => void;
  onViewPortfolio?: () => void;
}

const SimpleDashboard = ({ userProfile, stats, onInvestNow, onViewPortfolio }: DashboardProps) => {
  const [showHelp, setShowHelp] = useState(false);

  // Calculate some friendly stats
  const profitPercentage = ((stats.profit / stats.totalSaved) * 100) || 0;
  const monthlyAverage = stats.totalSaved / Math.max(userProfile.monthsActive, 1);
  const isGoodMonth = monthlyAverage > userProfile.weeklyAmount * 4;

  // Goal-specific data
  const goalData = {
    emergency: { target: 50000, emoji: "🛡️", description: "Emergency fund for peace of mind" },
    vacation: { target: 80000, emoji: "🏝️", description: "Your dream vacation awaits" },
    gadget: { target: 40000, emoji: "📱", description: "Latest tech gadget fund" },
    future: { target: 100000, emoji: "🚀", description: "Long-term wealth building" }
  };

  const currentGoal = goalData[userProfile.investmentGoal as keyof typeof goalData] || goalData.future;
  const goalProgress = (stats.currentValue / currentGoal.target) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6 pt-4">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Hi {userProfile.name}! 👋
          </h1>
          <p className="text-gray-600">
            Your money is growing automatically. Here's how you're doing:
          </p>
        </div>

        {/* Main Stats Card */}
        <Card className="bg-gradient-to-br from-green-600 to-blue-600 text-white shadow-xl border-0">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                  <PiggyBank className="h-8 w-8" />
                </div>
              </div>
              
              <div>
                <p className="text-white/80 text-sm mb-1">Your money is now worth</p>
                <div className="flex items-center justify-center gap-2">
                  <IndianRupee className="h-8 w-8" />
                  <span className="text-4xl font-bold">
                    {stats.currentValue.toLocaleString('en-IN')}
                  </span>
                </div>
                
                {stats.profit > 0 && (
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <TrendingUp className="h-5 w-5 text-green-300" />
                    <span className="text-green-300 font-semibold">
                      +₹{stats.profit.toLocaleString('en-IN')} profit ({profitPercentage.toFixed(1)}%)
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-white/20 rounded-lg p-3">
                  <p className="text-white/80 text-xs mb-1">You've saved</p>
                  <p className="text-lg font-semibold">₹{stats.totalSaved.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3">
                  <p className="text-white/80 text-xs mb-1">Next investment</p>
                  <p className="text-lg font-semibold">{stats.nextInvestment}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Goal Progress */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{currentGoal.emoji}</div>
                  <div>
                    <h3 className="font-semibold">Your Goal Progress</h3>
                    <p className="text-sm text-gray-600">{currentGoal.description}</p>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-700">
                  {goalProgress.toFixed(0)}% done
                </Badge>
              </div>
              
              <Progress value={Math.min(goalProgress, 100)} className="h-3" />
              
              <div className="flex justify-between text-sm text-gray-600">
                <span>₹{stats.currentValue.toLocaleString('en-IN')}</span>
                <span>Goal: ₹{currentGoal.target.toLocaleString('en-IN')}</span>
              </div>
              
              {goalProgress >= 100 ? (
                <div className="bg-green-100 border border-green-200 rounded-lg p-4 text-center">
                  <Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="font-semibold text-green-800">
                    🎉 Congratulations! You've reached your goal!
                  </p>
                  <Button className="mt-3 bg-green-600 hover:bg-green-700">
                    Set New Goal
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Keep going! Just ₹{(currentGoal.target - stats.currentValue).toLocaleString('en-IN')} more to reach your goal
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          
          {/* This Month Performance */}
          <Card className={isGoodMonth ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}>
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className={`${isGoodMonth ? 'bg-green-500' : 'bg-yellow-500'} text-white p-2 rounded-full`}>
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">This Month's Saving</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{monthlyAverage.toFixed(0)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {isGoodMonth 
                      ? "🎉 Above your weekly target! Great job!"
                      : "💪 You're doing good! Try to save a bit more this week."
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Investment Strategy */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="bg-purple-500 text-white p-2 rounded-full">
                  <Zap className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Your Strategy</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Investing ₹{userProfile.weeklyAmount} every week automatically
                  </p>
                  <Badge variant="outline" className="text-xs">
                    Balanced Growth Portfolio
                  </Badge>
                  <p className="text-xs text-gray-500 mt-2">
                    Expected returns: 10-12% annually
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tips & Encouragement */}
        <Card className="bg-gradient-to-r from-purple-100 to-pink-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="bg-purple-500 text-white p-2 rounded-full">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">💡 Smart Tip</h3>
                <p className="text-gray-700 mb-3">
                  {stats.profit > 0 
                    ? `Your spare change has earned you ₹${stats.profit}! That's like getting ${Math.floor(stats.profit / 100)} free coffee/tea. Keep it up!`
                    : "Your investments need time to grow. Even small amounts can become substantial over time with compound growth!"
                  }
                </p>
                <Button variant="outline" size="sm" className="gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Learn More About Investing
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievement Section */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="font-semibold text-lg">Your Achievements 🏆</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="bg-yellow-100 text-yellow-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Star className="h-6 w-6" />
                  </div>
                  <p className="text-xs font-medium">First ₹1000</p>
                  <p className="text-xs text-gray-500">Saved</p>
                </div>
                
                {userProfile.monthsActive >= 3 && (
                  <div className="text-center">
                    <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Heart className="h-6 w-6" />
                    </div>
                    <p className="text-xs font-medium">Consistent</p>
                    <p className="text-xs text-gray-500">3 months</p>
                  </div>
                )}
                
                {stats.profit > 0 && (
                  <div className="text-center">
                    <div className="bg-green-100 text-green-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <p className="text-xs font-medium">First Profit</p>
                    <p className="text-xs text-gray-500">Earned</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button 
                onClick={onInvestNow}
                className="w-full justify-between bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
              >
                <span>💰 Invest Now</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button 
                onClick={onViewPortfolio}
                variant="outline" 
                className="w-full justify-between"
              >
                <span>📊 View My Portfolio</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between">
                <span>⚙️ Change Settings</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-500">
            Have questions? Our support team is here 24/7
          </p>
          <Button variant="outline" size="sm" className="gap-2">
            <HelpCircle className="h-4 w-4" />
            Get Help
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboard;
