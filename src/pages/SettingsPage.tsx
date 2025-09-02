import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/hooks/use-settings";
import UserService from "@/lib/user-service";
import { 
  Settings, 
  IndianRupee, 
  PieChart, 
  Globe, 
  Bell, 
  Shield, 
  User,
  LogOut,
  HelpCircle,
  TestTube,
  Loader2,
  Zap,
  X,
  Sparkles,
  TrendingUp,
  ArrowRight
} from "lucide-react";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, signOut, demoMode, exitDemoMode } = useAuth();
  const { settings, loading, saving, updateSettingLocal, saveAllSettings } = useSettings();
  const [showAutopayBanner, setShowAutopayBanner] = useState(false);
  const [checkingAutopay, setCheckingAutopay] = useState(true);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleExitDemoMode = () => {
    exitDemoMode();
    navigate('/auth');
  };

  // Check if user has autopay setup
  useEffect(() => {
    const checkAutopayStatus = async () => {
      if (!user || demoMode) {
        setCheckingAutopay(false);
        return;
      }

      try {
        const currentUser = await UserService.getCurrentUser();
        const autopaySettings = await UserService.getAutopaySettings(UserService.getCurrentUserId());
        
        // Show banner if user has completed onboarding but hasn't set up autopay and hasn't explicitly skipped
        const shouldShowBanner = currentUser?.preferences?.hasCompletedOnboarding && 
                                !currentUser?.preferences?.hasSkippedAutopaySetup && 
                                !autopaySettings;
        
        setShowAutopayBanner(shouldShowBanner || false);
      } catch (error) {
        console.error('Error checking autopay status:', error);
        setShowAutopayBanner(false);
      } finally {
        setCheckingAutopay(false);
      }
    };

    checkAutopayStatus();
  }, [user, demoMode]);

  const handleDismissAutopayBanner = async () => {
    setShowAutopayBanner(false);
    try {
      const userId = UserService.getCurrentUserId();
      await UserService.updatePreferences(userId, {
        hasSkippedAutopaySetup: true
      });
    } catch (error) {
      console.error('Error updating autopay skip preference:', error);
    }
  };

  if (loading) {
    return (
      <div className="container-mobile xl:container xl:py-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading your settings...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="container-mobile xl:container xl:py-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Unable to load settings. Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-mobile xl:container xl:py-8">
      {/* Header */}
      <div className="text-center xl:text-left mb-8">
        <h1 className="text-2xl xl:text-4xl font-heading font-semibold mb-2">Settings</h1>
        <p className="text-muted-foreground xl:text-lg">Customize your UPI Piggy experience</p>
      </div>

      {/* AutoPay Onboarding Banner */}
      {showAutopayBanner && !checkingAutopay && (
        <Alert className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 dark:from-purple-950 dark:to-blue-950 dark:border-purple-800">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <Sparkles className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
                  Maximize Your Returns with AutoPay! 🚀
                </h4>
                <AlertDescription className="text-purple-800 dark:text-purple-200 mb-4">
                  Set up automatic investments and earn up to <strong>15% higher returns</strong> with consistent investing. Never miss market opportunities!
                </AlertDescription>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    onClick={() => navigate('/autopay')}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                    size="sm"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Setup AutoPay Now
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <Button 
                    onClick={handleDismissAutopayBanner}
                    variant="outline"
                    size="sm"
                    className="border-purple-300 text-purple-700 hover:bg-purple-100 dark:border-purple-700 dark:text-purple-300"
                  >
                    Maybe Later
                  </Button>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismissAutopayBanner}
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-100 dark:text-purple-400"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Alert>
      )}

      <div className="xl:grid xl:grid-cols-2 xl:gap-8">
        <div className="space-y-6">
          {/* Investment Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="text-primary" size={20} />
                Round-Up Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Round up to nearest</label>
                <Select 
                  value={settings.round_to_nearest.toString()} 
                  onValueChange={(value) => updateSettingLocal('round_to_nearest', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">₹10</SelectItem>
                    <SelectItem value="20">₹20</SelectItem>
                    <SelectItem value="50">₹50</SelectItem>
                    <SelectItem value="100">₹100</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Higher amounts = faster savings but larger round-ups
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Min round-up</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₹</span>
                      <Input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={settings.min_roundup}
                        onChange={(e) => updateSettingLocal('min_roundup', parseFloat(e.target.value))}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Max round-up</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₹</span>
                      <Input
                        type="number"
                        min="1"
                        value={settings.max_roundup}
                        onChange={(e) => updateSettingLocal('max_roundup', parseFloat(e.target.value))}
                        className="pl-8"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Weekly investment target</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₹</span>
                    <Input
                      type="number"
                      min="10"
                      value={settings.weekly_target}
                      onChange={(e) => updateSettingLocal('weekly_target', parseFloat(e.target.value))}
                      className="pl-8"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Target amount to save per week through round-ups
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-invest weekly</p>
                  <p className="text-sm text-muted-foreground">Automatically invest accumulated round-ups</p>
                </div>
                <Switch 
                  checked={settings.auto_invest_enabled}
                  onCheckedChange={(checked) => updateSettingLocal('auto_invest_enabled', checked)}
                  disabled={saving}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Portfolio Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="text-secondary" size={20} />
                Portfolio Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Investment strategy</label>
                <Select 
                  value={settings.portfolio_preset} 
                  onValueChange={(value) => updateSettingLocal('portfolio_preset', value as 'safe' | 'balanced' | 'growth')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="safe">Safe (70% Gold, 30% Index)</SelectItem>
                    <SelectItem value="balanced">Balanced (50% Gold, 50% Index)</SelectItem>
                    <SelectItem value="growth">Growth (30% Gold, 70% Index)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Your selected strategy determines how your investments are allocated
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-3">
                <h4 className="text-sm font-medium mb-2">Current Allocation</h4>
                <div className="space-y-1 text-xs">
                  {settings.portfolio_preset === 'safe' && (
                    <>
                      <div className="flex justify-between">
                        <span>Gold ETF (GOLDBEES)</span>
                        <span>70%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Nifty ETF (NIFTYBEES)</span>
                        <span>30%</span>
                      </div>
                    </>
                  )}
                  {settings.portfolio_preset === 'balanced' && (
                    <>
                      <div className="flex justify-between">
                        <span>Gold ETF (GOLDBEES)</span>
                        <span>50%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Nifty ETF (NIFTYBEES)</span>
                        <span>50%</span>
                      </div>
                    </>
                  )}
                  {settings.portfolio_preset === 'growth' && (
                    <>
                      <div className="flex justify-between">
                        <span>Gold ETF (GOLDBEES)</span>
                        <span>30%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Nifty ETF (NIFTYBEES)</span>
                        <span>70%</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 mt-6 xl:mt-0">
          {/* Demo Mode Card - only show if in demo mode */}
          {demoMode && (
            <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                  <TestTube size={20} />
                  Demo Mode Active
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  You're currently using UPI Piggy with demo data. Settings are saved locally and will not persist across sessions.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900"
                  onClick={handleExitDemoMode}
                >
                  Exit Demo Mode & Sign Up
                </Button>
              </CardContent>
            </Card>
          )}
          
          {/* App Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="text-foreground" size={20} />
                App Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Globe size={16} />
                  Language
                </label>
                <Select defaultValue="english">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="hindi">हिंदी (Hindi)</SelectItem>
                    <SelectItem value="hinglish">Hinglish</SelectItem>
                    <SelectItem value="tamil">தமிழ் (Tamil)</SelectItem>
                    <SelectItem value="bengali">বাংলা (Bengali)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell size={16} />
                  <div>
                    <p className="font-medium">Push notifications</p>
                    <p className="text-sm text-muted-foreground">Investment updates & milestones</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield size={16} />
                  <div>
                    <p className="font-medium">Biometric login</p>
                    <p className="text-sm text-muted-foreground">Use fingerprint or face ID</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account & Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <User size={16} className="mr-2" />
                Profile & KYC
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 hover:from-purple-100 hover:to-blue-100" 
                onClick={() => navigate('/autopay')}
              >
                <Zap size={16} className="mr-2 text-purple-600" />
                <div className="flex flex-col items-start">
                  <span>AutoPay & Spare Change</span>
                  <span className="text-xs text-muted-foreground">Setup automatic investments</span>
                </div>
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <HelpCircle size={16} className="mr-2" />
                Help & Support
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={handleSignOut}
              >
                <LogOut size={16} className="mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Save Settings Button */}
      <div className="mt-8 flex justify-center">
        <Button 
          onClick={saveAllSettings}
          disabled={saving}
          size="lg"
          className="min-w-[200px]"
        >
          {saving && <Loader2 size={16} className="mr-2 animate-spin" />}
          Save Settings
        </Button>
      </div>

      {/* Version Info */}
      <div className="text-center mt-8 pb-4">
        <p className="text-xs text-muted-foreground">
          UPI Piggy v1.2.0 • Made with ❤️ in India
        </p>
      </div>
    </div>
  );
};

export default SettingsPage;