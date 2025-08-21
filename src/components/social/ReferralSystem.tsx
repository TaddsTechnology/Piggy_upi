import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Share, 
  Gift, 
  Users, 
  Trophy,
  Copy,
  Twitter,
  MessageCircle,
  Mail,
  IndianRupee,
  Star,
  Crown,
  Target,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';

interface Referral {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'signed_up' | 'invested';
  reward: number;
  joinedDate: string;
  investedAmount?: number;
}

interface ReferralTier {
  level: number;
  name: string;
  minReferrals: number;
  rewardMultiplier: number;
  perks: string[];
  icon: React.ReactNode;
  color: string;
}

const ReferralSystem = () => {
  const [referralCode] = useState('SAVE2024');
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);

  // Mock data
  const referrals: Referral[] = [
    {
      id: '1',
      name: 'Priya Sharma',
      email: 'priya@email.com',
      status: 'invested',
      reward: 100,
      joinedDate: '2024-01-15',
      investedAmount: 1000
    },
    {
      id: '2', 
      name: 'Rahul Kumar',
      email: 'rahul@email.com',
      status: 'signed_up',
      reward: 50,
      joinedDate: '2024-01-10'
    },
    {
      id: '3',
      name: 'Neha Gupta',
      email: 'neha@email.com', 
      status: 'pending',
      reward: 0,
      joinedDate: '2024-01-08'
    }
  ];

  const referralTiers: ReferralTier[] = [
    {
      level: 1,
      name: 'Starter',
      minReferrals: 0,
      rewardMultiplier: 1.0,
      perks: ['₹50 per referral', 'Basic rewards'],
      icon: <Star className="h-5 w-5" />,
      color: 'from-gray-400 to-gray-600'
    },
    {
      level: 2,
      name: 'Champion',
      minReferrals: 5,
      rewardMultiplier: 1.2,
      perks: ['₹60 per referral', '20% bonus', 'Priority support'],
      icon: <Trophy className="h-5 w-5" />,
      color: 'from-yellow-400 to-yellow-600'
    },
    {
      level: 3,
      name: 'Ambassador',
      minReferrals: 15,
      rewardMultiplier: 1.5,
      perks: ['₹75 per referral', '50% bonus', 'Exclusive events'],
      icon: <Crown className="h-5 w-5" />,
      color: 'from-purple-400 to-purple-600'
    }
  ];

  const stats = {
    totalReferrals: referrals.length,
    successfulReferrals: referrals.filter(r => r.status === 'invested').length,
    totalEarned: referrals.reduce((sum, r) => sum + r.reward, 0),
    currentTier: referralTiers[0]
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = {
    whatsapp: `https://wa.me/?text=Join me on UPI Piggy and start investing your spare change! Use my code ${referralCode} and get ₹50 bonus. Download: https://piggy-upi.com`,
    twitter: `https://twitter.com/intent/tweet?text=Start investing with just spare change! 💰 Join @UPIPiggy with my code ${referralCode} and get ₹50 bonus! %23investing %23fintech`,
    email: `mailto:?subject=Join UPI Piggy with my referral!&body=Hi! I've been using UPI Piggy to invest my spare change and it's amazing! Use my code ${referralCode} to get ₹50 bonus when you sign up. Download: https://piggy-upi.com`
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'invested': return 'bg-green-100 text-green-700';
      case 'signed_up': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'invested': return 'Invested';
      case 'signed_up': return 'Signed Up';
      case 'pending': return 'Pending';
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.totalReferrals}</div>
            <p className="text-sm text-gray-600">Total Referrals</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.successfulReferrals}</div>
            <p className="text-sm text-gray-600">Invested</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center text-2xl font-bold text-purple-600">
              <IndianRupee className="h-5 w-5" />
              {stats.totalEarned}
            </div>
            <p className="text-sm text-gray-600">Total Earned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-lg font-bold text-gray-900">
              {stats.currentTier.icon}
              {stats.currentTier.name}
            </div>
            <p className="text-sm text-gray-600">Current Tier</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="share" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="share">Share & Earn</TabsTrigger>
          <TabsTrigger value="referrals">My Referrals</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        {/* Share & Earn Tab */}
        <TabsContent value="share" className="space-y-6">
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <Gift className="h-6 w-6 text-green-600" />
                Earn ₹100 for Every Friend!
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Share UPI Piggy with friends and earn rewards when they start investing
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Referral Code */}
              <div className="text-center space-y-4">
                <h3 className="font-semibold text-lg">Your Referral Code</h3>
                <div className="flex items-center justify-center gap-3 max-w-md mx-auto">
                  <div className="bg-white border-2 border-dashed border-green-300 rounded-lg px-6 py-3 text-center flex-1">
                    <div className="text-2xl font-bold text-green-600 tracking-wider">{referralCode}</div>
                  </div>
                  <Button onClick={handleCopyCode} variant="outline" size="sm">
                    {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                {copied && <p className="text-sm text-green-600">Code copied to clipboard!</p>}
              </div>

              {/* How it Works */}
              <div className="bg-white rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-lg text-center mb-4">How it Works</h3>
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div className="space-y-2">
                    <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                      <Share className="h-6 w-6" />
                    </div>
                    <h4 className="font-medium">1. Share</h4>
                    <p className="text-sm text-gray-600">Share your code with friends</p>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-green-100 text-green-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                      <Users className="h-6 w-6" />
                    </div>
                    <h4 className="font-medium">2. They Join</h4>
                    <p className="text-sm text-gray-600">Friend signs up & invests ₹100+</p>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-purple-100 text-purple-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                      <Gift className="h-6 w-6" />
                    </div>
                    <h4 className="font-medium">3. You Earn</h4>
                    <p className="text-sm text-gray-600">Get ₹50 bonus instantly</p>
                  </div>
                </div>
              </div>

              {/* Share Options */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-center">Share via</h3>
                <div className="grid grid-cols-3 gap-4">
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => window.open(shareLinks.whatsapp, '_blank')}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                  <Button 
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => window.open(shareLinks.twitter, '_blank')}
                  >
                    <Twitter className="h-4 w-4 mr-2" />
                    Twitter
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => window.open(shareLinks.email, '_blank')}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                </div>
              </div>

              {/* Direct Invite */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-3">Send Direct Invite</h4>
                <div className="flex gap-3">
                  <Input 
                    placeholder="Enter friend's email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button disabled={!email}>
                    Send Invite
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Referrals Tab */}
        <TabsContent value="referrals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Your Referrals ({referrals.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {referrals.map((referral) => (
                  <div key={referral.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="font-medium text-blue-600">
                          {referral.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{referral.name}</p>
                        <p className="text-sm text-gray-600">{referral.email}</p>
                        <p className="text-xs text-gray-500">Joined {referral.joinedDate}</p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge className={getStatusColor(referral.status)}>
                        {getStatusText(referral.status)}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <IndianRupee className="h-3 w-3" />
                        {referral.reward}
                      </div>
                      {referral.investedAmount && (
                        <p className="text-xs text-gray-500">
                          Invested ₹{referral.investedAmount}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                
                {referrals.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No referrals yet. Start sharing to earn rewards!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Referral Tiers & Rewards
              </CardTitle>
              <p className="text-gray-600">Unlock higher tiers to earn more per referral</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {referralTiers.map((tier, index) => (
                  <div key={tier.level} className="relative">
                    <div className={`p-6 rounded-lg border-2 ${
                      stats.totalReferrals >= tier.minReferrals 
                        ? 'bg-gradient-to-r ' + tier.color + ' text-white border-transparent' 
                        : 'border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            stats.totalReferrals >= tier.minReferrals 
                              ? 'bg-white/20' 
                              : 'bg-gray-100'
                          }`}>
                            {tier.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{tier.name}</h3>
                            <p className={`text-sm ${
                              stats.totalReferrals >= tier.minReferrals 
                                ? 'text-white/80' 
                                : 'text-gray-600'
                            }`}>
                              {tier.minReferrals} referrals required
                            </p>
                          </div>
                        </div>
                        {stats.totalReferrals >= tier.minReferrals && (
                          <Badge className="bg-white/20 text-white border-white/30">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Unlocked
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        {tier.perks.map((perk, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4" />
                            <span>{perk}</span>
                          </div>
                        ))}
                      </div>
                      
                      {stats.totalReferrals < tier.minReferrals && index > 0 && (
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress to {tier.name}</span>
                            <span>{stats.totalReferrals}/{tier.minReferrals}</span>
                          </div>
                          <Progress 
                            value={(stats.totalReferrals / tier.minReferrals) * 100} 
                            className="h-2" 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Referrers This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { rank: 1, name: 'Amit Patel', referrals: 24, earned: 2400, badge: '👑' },
                  { rank: 2, name: 'Sneha Singh', referrals: 18, earned: 1800, badge: '🥈' },
                  { rank: 3, name: 'Rohit Kumar', referrals: 15, earned: 1500, badge: '🥉' },
                  { rank: 4, name: 'You', referrals: stats.totalReferrals, earned: stats.totalEarned, badge: '🎯' },
                  { rank: 5, name: 'Priya Sharma', referrals: 8, earned: 800, badge: '⭐' },
                ].map((user, index) => (
                  <div key={index} className={`flex items-center justify-between p-4 rounded-lg ${
                    user.name === 'You' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{user.badge}</span>
                        <span className="font-medium">#{user.rank}</span>
                      </div>
                      <div>
                        <p className={`font-medium ${user.name === 'You' ? 'text-blue-600' : ''}`}>
                          {user.name}
                        </p>
                        <p className="text-sm text-gray-600">{user.referrals} referrals</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 font-semibold">
                        <IndianRupee className="h-4 w-4" />
                        {user.earned}
                      </div>
                      <p className="text-xs text-gray-500">earned</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReferralSystem;
