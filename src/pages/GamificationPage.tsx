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
      <Card className="mb-6 bg-gradient-accent">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Flame className="text-warning-foreground" size={24} />
                <span className="text-2xl font-heading font-semibold text-warning-foreground">
                  22 Days
                </span>
              </div>
              <p className="text-warning-foreground/80">Current Streak</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-warning-foreground/80 mb-1">Next Milestone</p>
              <p className="font-medium text-warning-foreground">30 Days</p>
              <Progress value={73} className="w-20 mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="text-accent" size={20} />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {leaderboardData.map((user, index) => (
            <div 
              key={user.rank} 
              className={`flex items-center justify-between p-3 rounded-lg ${
                user.name === "You" ? "bg-primary-light border border-primary/20" : "bg-muted/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {user.rank === 1 && <Crown className="text-accent" size={16} />}
                  {user.rank === 2 && <Medal className="text-muted-foreground" size={16} />}
                  {user.rank === 3 && <Star className="text-primary" size={16} />}
                  <span className="font-medium text-sm">#{user.rank}</span>
                </div>
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs">{user.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.streak} day streak
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-sm">{user.saved}</p>
                <p className="text-xs text-muted-foreground">Total Saved</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="text-primary" size={20} />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {achievements.map((achievement) => (
            <div key={achievement.id} className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${achievement.color}`}>
                <achievement.icon 
                  size={20} 
                  className={achievement.earned ? "text-white" : "text-muted-foreground"} 
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm">{achievement.name}</h4>
                  {achievement.earned && (
                    <Badge variant="secondary" className="text-xs bg-success text-success-foreground">
                      Earned
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{achievement.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default GamificationPage;