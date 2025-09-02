import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Zap,
  PiggyBank,
  TrendingUp,
  Calendar,
  Settings,
  ArrowUpCircle,
  Shield,
  CheckCircle2,
  Clock,
  IndianRupee,
  BarChart3,
  Activity,
  Target
} from 'lucide-react';

import AutopaySetup from '@/components/AutopaySetup';
import razorpayService, { AutopaySetup as AutopayConfig, RazorpayTransaction } from '@/lib/razorpay-service';
import { formatDistanceToNow } from 'date-fns';

const AutoPayPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [autopaySetup, setAutopaySetup] = useState<AutopayConfig | null>(null);
  const [transactions, setTransactions] = useState<RazorpayTransaction[]>([]);
  const [totalRoundOffInvested, setTotalRoundOffInvested] = useState<number>(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const setup = razorpayService.getAutopaySetup();
    const txns = razorpayService.getTransactions();
    const roundOffTotal = razorpayService.getTotalRoundOffInvested();

    setAutopaySetup(setup);
    setTransactions(txns);
    setTotalRoundOffInvested(roundOffTotal);
  };

  const handleAutopaySetupComplete = (setup: AutopayConfig) => {
    setAutopaySetup(setup);
    setActiveTab('overview');
  };

  const formatNextPaymentDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'created':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const mockStats = {
    totalInvested: transactions
      .filter(t => t.status === 'paid')
      .reduce((sum, t) => sum + t.originalAmount, 0),
    successRate: transactions.length > 0 
      ? (transactions.filter(t => t.status === 'paid').length / transactions.length) * 100 
      : 0,
    averageInvestment: transactions.length > 0 
      ? transactions
          .filter(t => t.status === 'paid')
          .reduce((sum, t) => sum + t.originalAmount, 0) / transactions.filter(t => t.status === 'paid').length
      : 0,
  };

  if (activeTab === 'setup') {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <AutopaySetup
            onSetupComplete={handleAutopaySetupComplete}
            onCancel={() => setActiveTab('overview')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Zap className="h-8 w-8 text-blue-600" />
                AutoPay & Spare Change
              </h1>
              <p className="text-gray-600 mt-2">
                Automate your investments and grow wealth with spare change
              </p>
            </div>
            
            {!autopaySetup && (
              <Button 
                onClick={() => setActiveTab('setup')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Zap className="h-4 w-4 mr-2" />
                Setup AutoPay
              </Button>
            )}
          </div>

          {/* Status Banner */}
          {autopaySetup ? (
            <Card className="border-2 border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-full">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-800">AutoPay Active</h3>
                      <p className="text-sm text-green-600">
                        Next investment: {formatNextPaymentDate(autopaySetup.nextPaymentDate)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-800">₹{autopaySetup.maxAmount}</div>
                    <div className="text-sm text-green-600 capitalize">{autopaySetup.frequency}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <PiggyBank className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-800">Get Started with AutoPay</h3>
                    <p className="text-sm text-blue-600">
                      Automate your investments and never miss an opportunity
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="roundoff">Spare Change</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
                  <IndianRupee className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{mockStats.totalInvested.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    {transactions.filter(t => t.status === 'paid').length} successful transactions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Spare Change Invested</CardTitle>
                  <PiggyBank className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{totalRoundOffInvested.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    From {transactions.filter(t => t.roundOffAmount > 0).length} round-offs
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockStats.successRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    {transactions.filter(t => t.status === 'paid').length} of {transactions.length} attempts
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-600" />
                    AutoPay Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">Automated recurring investments</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">Flexible frequency (daily, weekly, monthly)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">Customizable investment amount limits</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">Automatic portfolio diversification</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PiggyBank className="h-5 w-5 text-green-600" />
                    Spare Change Magic
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <ArrowUpCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">Round up every transaction</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ArrowUpCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">Automatic investment of spare change</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ArrowUpCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">Configurable round-off thresholds</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ArrowUpCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">Track total spare change invested</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Cards */}
            {!autopaySetup && (
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="p-6 text-center">
                  <div className="space-y-4">
                    <div className="bg-blue-100 p-4 rounded-full mx-auto w-fit">
                      <Target className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold">Ready to Automate Your Wealth?</h3>
                    <p className="text-gray-600">
                      Set up AutoPay in just 2 minutes and watch your investments grow automatically
                    </p>
                    <Button 
                      onClick={() => setActiveTab('setup')}
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Zap className="h-5 w-5 mr-2" />
                      Setup AutoPay Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Transaction History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No transactions yet</p>
                    <p className="text-sm text-gray-500">Your payment history will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                          </div>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-gray-600">
                              {formatDistanceToNow(transaction.timestamp, { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">₹{transaction.roundedAmount.toFixed(2)}</div>
                          {transaction.roundOffAmount > 0 && (
                            <div className="text-xs text-green-600">
                              +₹{transaction.roundOffAmount.toFixed(2)} spare
                            </div>
                          )}
                          <Badge className={getStatusColor(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Round-off Tab */}
          <TabsContent value="roundoff" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PiggyBank className="h-5 w-5 text-green-600" />
                    Spare Change Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        ₹{totalRoundOffInvested.toFixed(2)}
                      </div>
                      <p className="text-sm text-gray-600">Total Spare Change Invested</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Round-offs This Month:</span>
                      <span className="font-medium">
                        {transactions.filter(t => 
                          t.roundOffAmount > 0 && 
                          t.timestamp.getMonth() === new Date().getMonth()
                        ).length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average Round-off:</span>
                      <span className="font-medium">
                        ₹{transactions.filter(t => t.roundOffAmount > 0).length > 0 
                          ? (transactions
                              .filter(t => t.roundOffAmount > 0)
                              .reduce((sum, t) => sum + t.roundOffAmount, 0) / 
                             transactions.filter(t => t.roundOffAmount > 0).length
                            ).toFixed(2)
                          : '0.00'
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Round-off Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h4 className="font-medium mb-2">How it Works</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>• When you pay ₹123.67, we round it to ₹124</p>
                        <p>• The ₹0.33 spare change gets invested automatically</p>
                        <p>• Over time, small amounts add up to significant savings!</p>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => setActiveTab('settings')}
                      variant="outline" 
                      className="w-full"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Configure Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    AutoPay Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {autopaySetup ? (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        <Badge className="bg-green-100 text-green-800">
                          {autopaySetup.isActive ? 'Active' : 'Paused'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Max Amount:</span>
                        <span className="font-medium">₹{autopaySetup.maxAmount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Frequency:</span>
                        <span className="font-medium capitalize">{autopaySetup.frequency}</span>
                      </div>
                      <Button onClick={() => setActiveTab('setup')} className="w-full">
                        Update Settings
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">AutoPay not set up</p>
                      <Button 
                        onClick={() => setActiveTab('setup')}
                        className="mt-4"
                      >
                        Setup AutoPay
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security & Support
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="text-sm">Bank-grade security</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="text-sm">Razorpay powered payments</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="text-sm">24/7 transaction monitoring</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="text-sm">Cancel anytime</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AutoPayPage;
