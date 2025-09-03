import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, TrendingUp, Smartphone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PasswordInputWithStrength } from '@/components/PasswordStrengthIndicator';
import { validatePassword, isCommonPassword } from '@/lib/password-validation';

const AuthPage = () => {
  const navigate = useNavigate();
  const { signIn, signUp, loading, enterDemoMode } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  });
  const [activeTab, setActiveTab] = useState('signin');
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;
    
    setError('');
    try {
      const { error } = await signIn(formData.email, formData.password);
      if (error) {
        setError(error.message);
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.fullName) return;
    
    // Validate password requirements
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors[0]); // Show first error
      return;
    }
    
    // Check for common passwords
    if (isCommonPassword(formData.password)) {
      setError('This password is too common. Please choose a more secure password.');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setError('');
    try {
      const { error } = await signUp(formData.email, formData.password);
      if (error) {
        setError(error.message);
      } else {
        setError('');
        // Show success message or redirect
        alert('Check your email for confirmation link!');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  const handleDemoMode = () => {
    enterDemoMode();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Marketing */}
        <div className="hidden lg:block space-y-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-growth rounded-full flex items-center justify-center mx-auto mb-4 p-2">
              <img 
                src="/piggy.png" 
                alt="Piggy UPI" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  console.error('Failed to load Piggy UPI logo on auth page');
                  // Fallback to text if image fails
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<div class="text-white font-bold text-lg">P</div>';
                }}
              />
            </div>
            <h1 className="text-4xl font-heading font-bold text-primary mb-2">Piggy UPI</h1>
            <p className="text-xl text-muted-foreground">Smart Investment, Spare Change</p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center flex-shrink-0">
                <Smartphone className="text-primary" size={24} />
              </div>
              <div>
                <h3 className="font-heading font-semibold mb-2">Automatic Round-ups</h3>
                <p className="text-muted-foreground">Every UPI transaction gets rounded up. Spare change automatically invested in ETFs.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-secondary-light rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="text-secondary" size={24} />
              </div>
              <div>
                <h3 className="font-heading font-semibold mb-2">Smart Portfolios</h3>
                <p className="text-muted-foreground">Choose from Safe, Balanced, or Growth portfolios. We handle the rest.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-accent-light rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="text-accent-foreground" size={24} />
              </div>
              <div>
                <h3 className="font-heading font-semibold mb-2">SEBI Regulated</h3>
                <p className="text-muted-foreground">Your investments are safe, regulated, and transparent. RBI approved partner banks.</p>
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-xl p-6">
            <div className="text-center space-y-2">
              <div className="text-2xl font-heading font-bold text-primary">₹12,485</div>
              <div className="text-sm text-muted-foreground">Average user portfolio value</div>
              <div className="flex items-center justify-center gap-1 text-success">
                <TrendingUp size={16} />
                <span className="font-medium">+12.5% returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Forms */}
        <div className="w-full max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              {/* Small logo in the card header */}
              <div className="flex justify-center mb-4">
                <img 
                  src="/piggy.png" 
                  alt="Piggy UPI" 
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    console.error('Failed to load Piggy UPI logo in auth card');
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              <CardTitle className="text-2xl font-heading">
                {activeTab === 'signin' ? 'Welcome back to Piggy UPI' : 'Join Piggy UPI today'}
              </CardTitle>
              <p className="text-muted-foreground">
                {activeTab === 'signin' 
                  ? 'Sign in to your account' 
                  : 'Create your account in 30 seconds'
                }
              </p>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert className="mb-4" variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="space-y-4">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input
                        id="signin-password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-growth" 
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input
                        id="signup-name"
                        name="fullName"
                        type="text"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <PasswordInputWithStrength
                        id="signup-password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Create a strong password"
                        required
                        showStrengthIndicator={true}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        name="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-growth"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground text-center mb-2">
                  Want to explore without signing up?
                </p>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleDemoMode}
                  disabled={loading}
                >
                  Continue with Demo Data
                </Button>
              </div>

              <div className="mt-4 text-center">
                <p className="text-xs text-muted-foreground">
                  By continuing, you agree to our{' '}
                  <a href="#" className="text-primary hover:underline">Terms</a>{' '}
                  and{' '}
                  <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
