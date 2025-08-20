import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Target, 
  Trophy, 
  Star, 
  Users, 
  Calendar,
  PiggyBank,
  ArrowUpRight,
  Award,
  Flame,
  Gift
} from 'lucide-react';
import { SipGamification, SipSocial, sipUtils } from '@/lib/smart-sip';

interface UserStats {
  totalInvested: number;
  monthsActive: number;
  consecutiveWeeks: number;
  maxWeeklyInvestment: number;
  currentPortfolioValue: number;
  totalReturns: number;
  weeklyAmount: number;
  age: number;
}

interface SmartSipDashboardProps {
  userStats: UserStats;
  allUsers?: Array<{ investment: number; age: number }>; // For social comparison
  className?: string;
}

export const SmartSipDashboard: React.FC<SmartSipDashboardProps> = ({
  userStats,
  allUsers = [],
  className = ""
}) => {
  const userLevel = SipGamification.calculateUserLevel(
    userStats.totalInvested, 
    userStats.monthsActive
  );
  
  const achievements = SipGamification.generateAchievements(userStats);
  const unlockedAchievements = achievements.filter(a => a.achieved);
  const nextAchievement = achievements.find(a => !a.achieved);
  
  const socialComparison = allUsers.length > 0 
    ? SipSocial.generateLeaderboardPosition(userStats.totalInvested, userStats.age, allUsers)
    : null;

  const returnPercentage = userStats.totalInvested > 0 
    ? ((userStats.totalReturns / userStats.totalInvested) * 100)
    : 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Level & Progress Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">{userLevel.title}</h1>
              <p className="text-blue-100">Level {userLevel.level} Investor</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {sipUtils.formatCurrency(userStats.totalInvested)}
              </div>
              <p className="text-blue-100">Total Invested</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to {userLevel.nextLevelTarget > userStats.totalInvested ? 'next level' : 'max level'}</span>
              <span>{userLevel.progress}%</span>
            </div>
            <Progress 
              value={userLevel.progress} 
              className="h-3 bg-blue-700"
            />
            {userLevel.nextLevelTarget > userStats.totalInvested && (
              <p className="text-xs text-blue-200">
                {sipUtils.formatCurrency(userLevel.nextLevelTarget - userStats.totalInvested)} more to next level
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-2">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">
              {returnPercentage > 0 ? '+' : ''}{returnPercentage.toFixed(1)}%
            </div>
            <p className="text-sm text-gray-500">Total Returns</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-2">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{userStats.consecutiveWeeks}</div>
            <p className="text-sm text-gray-500">Week Streak</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-2">
              <PiggyBank className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {sipUtils.formatCurrency(userStats.currentPortfolioValue)}
            </div>
            <p className="text-sm text-gray-500">Portfolio Value</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mx-auto mb-2">
              <Target className="h-6 w-6 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {sipUtils.formatCurrency(userStats.weeklyAmount)}
            </div>
            <p className="text-sm text-gray-500">Weekly SIP</p>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Achievements ({unlockedAchievements.length}/{achievements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Next Achievement */}
            {nextAchievement && (
              <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <Award className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-700">{nextAchievement.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{nextAchievement.description}</p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        Next Milestone
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Achievement */}
            {unlockedAchievements.slice(-1).map((achievement) => (
              <Card key={achievement.id} className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Trophy className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-yellow-800">{achievement.title}</h3>
                      <p className="text-sm text-yellow-600 mt-1">{achievement.description}</p>
                      <Badge className="mt-2 text-xs bg-yellow-200 text-yellow-800">
                        {achievement.reward}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* All Achievements Grid */}
          <div className="mt-6">
            <h4 className="font-medium text-gray-700 mb-3">All Achievements</h4>
            <div className="flex flex-wrap gap-3">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm ${
                    achievement.achieved
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-gray-100 text-gray-500 border border-gray-200'
                  }`}
                >
                  <Award className="h-4 w-4" />
                  <span>{achievement.title}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Comparison */}
      {socialComparison && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Community Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="text-4xl font-bold text-blue-600">
                  {socialComparison.percentile}%
                </div>
                <p className="text-sm text-gray-500">Percentile rank in your age group</p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="font-medium text-blue-900 mb-2">
                  {socialComparison.comparison}
                </p>
                <p className="text-sm text-blue-600">
                  {socialComparison.encouragement}
                </p>
              </div>

              <Button variant="outline" className="w-full">
                <Users className="mr-2 h-4 w-4" />
                View Full Leaderboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Investment Streak */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Investment Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="text-6xl font-bold text-orange-500">
              {userStats.consecutiveWeeks}
            </div>
            <p className="text-gray-600">Consecutive weeks of investing</p>
            
            <div className="flex justify-center items-center gap-1">
              {Array.from({ length: Math.min(userStats.consecutiveWeeks, 20) }).map((_, i) => (
                <Flame key={i} className="h-6 w-6 text-orange-500" />
              ))}
              {userStats.consecutiveWeeks > 20 && (
                <span className="text-orange-500 font-bold ml-2">
                  +{userStats.consecutiveWeeks - 20}
                </span>
              )}
            </div>

            {userStats.consecutiveWeeks >= 4 && (
              <Badge className="bg-orange-100 text-orange-800">
                <Star className="mr-1 h-3 w-3" />
                Consistency Master
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button className="h-16 flex flex-col space-y-1">
          <ArrowUpRight className="h-5 w-5" />
          <span>Increase SIP</span>
        </Button>
        <Button variant="outline" className="h-16 flex flex-col space-y-1">
          <Gift className="h-5 w-5" />
          <span>Refer Friends</span>
        </Button>
      </div>

      {/* Motivational Quote */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6 text-center">
          <blockquote className="text-lg font-medium text-gray-700 mb-2">
            "The best time to plant a tree was 20 years ago. The second best time is now."
          </blockquote>
          <p className="text-sm text-gray-500">- Chinese Proverb</p>
          <p className="text-sm text-green-600 mt-2 font-medium">
            You've already started your wealth journey! 🌱
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartSipDashboard;
