import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Trophy, Flame, Target, Star, Medal, Crown } from "lucide-react";

const leaderboardData = [
  { rank: 1, name: "Priya S.", avatar: "PS", saved: "₹25,480", streak: 45 },
  { rank: 2, name: "Rahul K.", avatar: "RK", saved: "₹23,650", streak: 38 },
  { rank: 3, name: "You", avatar: "YU", saved: "₹12,485", streak: 22 },
  { rank: 4, name: "Anjali M.", avatar: "AM", saved: "₹11,200", streak: 19 },
  { rank: 5, name: "Vikram T.", avatar: "VT", saved: "₹9,850", streak: 15 },
];

const achievements = [
  { 
    id: 1, 
    name: "First Investment", 
    description: "Complete your first round-up investment", 
    earned: true,
    icon: Target,
    color: "bg-accent"
  },
  { 
    id: 2, 
    name: "Week Warrior", 
    description: "Save for 7 consecutive days", 
    earned: true,
    icon: Flame,
    color: "bg-primary"
  },
  { 
    id: 3, 
    name: "Gold Digger", 
    description: "Invest ₹5,000 in Gold ETF", 
    earned: true,
    icon: Crown,
    color: "bg-accent"
  },
  { 
    id: 4, 
    name: "Milestone Master", 
    description: "Reach ₹15,000 total savings", 
    earned: false,
    icon: Medal,
    color: "bg-muted"
  },
];

const GamificationPage = () => {
  return (
    <div className="container-mobile">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-heading font-semibold mb-2">Rewards & Achievements</h1>
        <p className="text-muted-foreground">Compete with friends and earn badges</p>
      </div>

      {/* Current Streak */}
      <Card className="mb-6 relative overflow-hidden bg-gradient-to-br from-orange-400 via-red-400 to-pink-500 text-white shadow-2xl">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-2 right-4 w-16 h-16 bg-white/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-4 left-6 w-12 h-12 bg-white/5 rounded-full blur-lg animate-bounce"></div>
        </div>
        
        <CardContent className="relative p-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <Flame className="text-white animate-pulse" size={28} />
                  <div className="absolute inset-0 bg-white/30 blur-lg rounded-full animate-ping"></div>
                </div>
                <span className="text-4xl xl:text-5xl font-heading font-bold tracking-tight bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">
                  22 Days
                </span>
              </div>
              <p className="text-white/90 text-lg font-medium">🔥 Current Streak</p>
            </div>
            <div className="text-right bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/20">
              <p className="text-sm text-white/80 mb-2">Next Milestone</p>
              <p className="font-bold text-2xl text-white mb-3">30 Days</p>
              <div className="relative">
                <Progress value={73} className="w-24 h-3 bg-white/20" />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full shadow-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card className="mb-6 shadow-lg bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-l-4 border-l-yellow-400">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-lg font-bold">
            <div className="relative">
              <Trophy className="text-yellow-500 animate-pulse" size={24} />
              <div className="absolute inset-0 bg-yellow-400/30 blur-md rounded-full animate-ping"></div>
            </div>
            🏆 Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {leaderboardData.map((user, index) => (
            <div 
              key={user.rank} 
              className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                user.name === "You" 
                  ? "bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white shadow-xl border-2 border-white/30" 
                  : user.rank === 1
                  ? "bg-gradient-to-r from-yellow-200 to-yellow-100 dark:from-yellow-800/50 dark:to-yellow-700/50 border-2 border-yellow-300/50"
                  : user.rank === 2
                  ? "bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 border-2 border-gray-300/50"
                  : user.rank === 3
                  ? "bg-gradient-to-r from-orange-200 to-orange-100 dark:from-orange-800/50 dark:to-orange-700/50 border-2 border-orange-300/50"
                  : "bg-gradient-to-r from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-800/30 hover:from-white/80 hover:to-white/50 border border-white/30 dark:border-gray-700/30"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {user.rank === 1 && (
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-2 rounded-full animate-pulse">
                      <Crown className="text-white" size={16} />
                    </div>
                  )}
                  {user.rank === 2 && (
                    <div className="bg-gradient-to-r from-gray-400 to-gray-600 p-2 rounded-full">
                      <Medal className="text-white" size={16} />
                    </div>
                  )}
                  {user.rank === 3 && (
                    <div className="bg-gradient-to-r from-orange-400 to-orange-600 p-2 rounded-full">
                      <Star className="text-white" size={16} />
                    </div>
                  )}
                  {user.rank > 3 && (
                    <div className="bg-gradient-to-r from-blue-400 to-purple-500 p-2 rounded-full">
                      <span className="text-white text-xs font-bold">#{user.rank}</span>
                    </div>
                  )}
                </div>
                <Avatar className={`w-10 h-10 ring-2 ${
                  user.name === "You" ? "ring-white/50" : "ring-primary/30"
                }`}>
                  <AvatarFallback className={`text-sm font-semibold ${
                    user.name === "You" ? "bg-white/20 text-white" : ""
                  }`}>{user.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <p className={`font-bold text-sm ${
                    user.name === "You" ? "text-white" : ""
                  }`}>{user.name}</p>
                  <div className="flex items-center gap-1">
                    <Flame size={12} className={user.name === "You" ? "text-orange-200" : "text-orange-500"} />
                    <p className={`text-xs ${
                      user.name === "You" ? "text-white/80" : "text-muted-foreground"
                    }`}>
                      {user.streak} day streak
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold text-lg ${
                  user.name === "You" ? "text-white" : ""
                }`}>{user.saved}</p>
                <p className={`text-xs ${
                  user.name === "You" ? "text-white/80" : "text-muted-foreground"
                }`}>Total Saved</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="shadow-lg bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-emerald-950/30 dark:to-cyan-950/30 border-l-4 border-l-emerald-400">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-lg font-bold">
            <div className="relative">
              <Star className="text-emerald-500 animate-pulse" size={24} />
              <div className="absolute inset-0 bg-emerald-400/30 blur-md rounded-full animate-ping"></div>
            </div>
            ⭐ Achievements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {achievements.map((achievement) => (
            <div 
              key={achievement.id} 
              className={`flex items-center gap-5 p-4 rounded-2xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                achievement.earned 
                  ? "bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 border-2 border-green-200/50 dark:border-green-700/50" 
                  : "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-700/30 border-2 border-gray-200/50 dark:border-gray-600/50"
              }`}
            >
              {/* Achievement Icon with Gradient Background and Effects */}
              <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center ${
                achievement.earned
                  ? achievement.name === "First Investment"
                    ? "bg-gradient-to-br from-purple-400 to-pink-500 shadow-lg shadow-purple-200 dark:shadow-purple-900/30"
                    : achievement.name === "Week Warrior"
                    ? "bg-gradient-to-br from-orange-400 to-red-500 shadow-lg shadow-orange-200 dark:shadow-orange-900/30"
                    : achievement.name === "Gold Digger"
                    ? "bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-yellow-200 dark:shadow-yellow-900/30"
                    : "bg-gradient-to-br from-green-400 to-blue-500 shadow-lg shadow-green-200 dark:shadow-green-900/30"
                  : "bg-gradient-to-br from-gray-300 to-gray-400 shadow-lg shadow-gray-200 dark:shadow-gray-900/30"
              }`}>
                {achievement.earned && (
                  <>
                    <div className="absolute inset-0 bg-white/20 rounded-2xl animate-pulse"></div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <span className="text-green-500 text-xs font-bold">✓</span>
                    </div>
                  </>
                )}
                <achievement.icon 
                  size={24} 
                  className={achievement.earned ? "text-white relative z-10" : "text-muted-foreground"} 
                />
              </div>
              
              {/* Achievement Details */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className={`font-bold text-base ${
                    achievement.earned ? "text-gray-800 dark:text-gray-200" : "text-muted-foreground"
                  }`}>{achievement.name}</h4>
                  {achievement.earned && (
                    <Badge className="text-xs bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 shadow-sm hover:shadow-md transition-all">
                      ✨ Earned
                    </Badge>
                  )}
                </div>
                <p className={`text-sm ${
                  achievement.earned ? "text-gray-600 dark:text-gray-400" : "text-muted-foreground"
                }`}>{achievement.description}</p>
              </div>
              
              {/* Completion Status Indicator */}
              <div className="flex flex-col items-center">
                {achievement.earned ? (
                  <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-lg"></div>
                ) : (
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default GamificationPage;