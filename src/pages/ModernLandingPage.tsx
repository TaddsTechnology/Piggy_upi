import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  Shield, 
  Users, 
  Star,
  IndianRupee,
  Smartphone,
  Target,
  Award,
  Zap,
  Globe,
  CheckCircle,
  Play,
  Download,
  ChevronDown,
  BarChart3,
  PiggyBank
} from 'lucide-react';

interface CounterProps {
  end: number;
  duration: number;
  prefix?: string;
  suffix?: string;
}

const AnimatedCounter: React.FC<CounterProps> = ({ end, duration, prefix = "", suffix = "" }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [end, duration]);

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

const ModernLandingPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      title: "Smart Round-Up Technology",
      description: "AI-powered algorithms that automatically invest your spare change in optimal portfolios",
      icon: <Zap className="h-8 w-8" />,
      color: "from-blue-500 to-cyan-500",
      stats: "₹50 avg/month"
    },
    {
      title: "Goal-Based Investing", 
      description: "Set financial goals and let our smart system automatically allocate your investments",
      icon: <Target className="h-8 w-8" />,
      color: "from-green-500 to-emerald-500",
      stats: "87% goal success rate"
    },
    {
      title: "Bank-Grade Security",
      description: "256-bit encryption, fraud detection, and regulatory compliance keep your money safe",
      icon: <Shield className="h-8 w-8" />,
      color: "from-purple-500 to-violet-500", 
      stats: "100% secure transactions"
    },
    {
      title: "Social Investing",
      description: "Learn from friends, compete in challenges, and earn rewards for referrals",
      icon: <Users className="h-8 w-8" />,
      color: "from-pink-500 to-rose-500",
      stats: "2.3x higher returns"
    }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Software Engineer",
      image: "👩‍💻",
      text: "I've saved ₹50,000 in just 8 months without even realizing it! UPI Piggy is amazing.",
      rating: 5
    },
    {
      name: "Rahul Patel", 
      role: "Marketing Manager",
      image: "👨‍💼",
      text: "My emergency fund is finally complete thanks to automatic round-ups. Best decision ever!",
      rating: 5
    },
    {
      name: "Sneha Gupta",
      role: "Teacher",
      image: "👩‍🏫", 
      text: "The goal-based investing helped me save for my dream vacation to Europe. Highly recommend!",
      rating: 5
    }
  ];

  const stats = [
    { label: "Active Users", value: 150000, prefix: "", suffix: "+" },
    { label: "Money Invested", value: 50, prefix: "₹", suffix: " Cr+" },
    { label: "Average Returns", value: 14, prefix: "", suffix: "%" },
    { label: "User Rating", value: 4.9, prefix: "", suffix: "/5" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-xl">
                <PiggyBank className="h-8 w-8 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                UPI Piggy
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="hover:text-blue-300 transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-blue-300 transition-colors">How it Works</a>
              <a href="#testimonials" className="hover:text-blue-300 transition-colors">Reviews</a>
              <a href="#pricing" className="hover:text-blue-300 transition-colors">Pricing</a>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-white hover:bg-white/20">
                Sign In
              </Button>
              <Button 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                onClick={() => navigate('/signup')}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-40 pt-20 pb-32">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className={`space-y-8 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <div className="space-y-6">
                <Badge className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-200 border-blue-400/30 px-4 py-2">
                  <Sparkles className="h-4 w-4 mr-2" />
                  India's #1 Micro-Investment Platform
                </Badge>
                
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                    Turn Spare Change Into
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Serious Wealth
                  </span>
                </h1>
                
                <p className="text-xl text-gray-300 max-w-2xl">
                  India's smartest UPI round-up investing app. Automatically invest your spare change, 
                  set financial goals, and build wealth without thinking about it.
                </p>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>No hidden fees</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>Bank-grade security</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>SEBI regulated</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4 shadow-2xl hover:shadow-blue-500/25 transition-all"
                  onClick={() => navigate('/signup')}
                >
                  <Smartphone className="h-5 w-5 mr-2" />
                  Start Investing Today
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-4"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center space-x-8 pt-8">
                <div>
                  <div className="text-3xl font-bold text-white">
                    <AnimatedCounter end={150000} duration={2000} suffix="+" />
                  </div>
                  <div className="text-gray-400 text-sm">Happy Users</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">
                    ₹<AnimatedCounter end={50} duration={2000} suffix=" Cr+" />
                  </div>
                  <div className="text-gray-400 text-sm">Invested</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">
                    <AnimatedCounter end={14} duration={2000} suffix="%" />
                  </div>
                  <div className="text-gray-400 text-sm">Avg. Returns</div>
                </div>
              </div>
            </div>

            {/* Mobile Mockup */}
            <div className={`relative ${isVisible ? 'animate-fade-in-right delay-500' : 'opacity-0'}`}>
              <div className="relative mx-auto w-80 h-[640px]">
                {/* Phone Frame */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 rounded-[3rem] shadow-2xl">
                  <div className="absolute inset-2 bg-gradient-to-br from-slate-900 to-blue-900 rounded-[2.5rem] overflow-hidden">
                    {/* Screen Content */}
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-semibold">Good Morning! 👋</div>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      </div>
                      
                      {/* Portfolio Card */}
                      <Card className="bg-gradient-to-br from-blue-600 to-purple-600 border-0 text-white">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="text-sm opacity-80">Portfolio Value</div>
                            <div className="text-2xl font-bold">₹12,485</div>
                            <div className="flex items-center text-green-300 text-sm">
                              <TrendingUp className="h-4 w-4 mr-1" />
                              +₹485 (8.2%)
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Goals */}
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Your Goals</div>
                        <div className="space-y-2">
                          {[
                            { name: "Emergency Fund", progress: 65, color: "bg-green-500" },
                            { name: "Vacation", progress: 40, color: "bg-blue-500" },
                            { name: "New Laptop", progress: 25, color: "bg-purple-500" }
                          ].map((goal, i) => (
                            <div key={i} className="bg-white/10 rounded-lg p-3">
                              <div className="flex justify-between text-sm mb-2">
                                <span>{goal.name}</span>
                                <span>{goal.progress}%</span>
                              </div>
                              <div className="bg-white/20 rounded-full h-2">
                                <div 
                                  className={`${goal.color} h-2 rounded-full transition-all duration-1000`}
                                  style={{ width: `${goal.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 bg-green-500 text-white p-3 rounded-xl shadow-lg animate-bounce">
                  <div className="text-xs">+₹7 saved!</div>
                </div>
                <div className="absolute -bottom-4 -left-4 bg-blue-500 text-white p-3 rounded-xl shadow-lg animate-pulse">
                  <div className="text-xs">Goal achieved!</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-8 w-8 text-white/60" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-40 py-20 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Why Choose UPI Piggy?
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We've reimagined investing for the smartphone generation with cutting-edge technology and user-friendly design.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Feature Display */}
            <div className="relative">
              <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 overflow-hidden">
                <CardContent className="p-8">
                  <div className={`bg-gradient-to-r ${features[activeFeature].color} p-4 rounded-2xl w-fit mb-6`}>
                    {features[activeFeature].icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">
                    {features[activeFeature].title}
                  </h3>
                  <p className="text-gray-300 text-lg mb-6">
                    {features[activeFeature].description}
                  </p>
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="text-2xl font-bold text-white mb-1">
                      {features[activeFeature].stats}
                    </div>
                    <div className="text-gray-400 text-sm">Average user benefit</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Feature List */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                    index === activeFeature
                      ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-400/30'
                      : 'bg-white/5 hover:bg-white/10 border border-white/10'
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`bg-gradient-to-r ${feature.color} p-3 rounded-xl`}>
                      {React.cloneElement(feature.icon as React.ReactElement, { className: "h-6 w-6" })}
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-white mb-2">{feature.title}</h4>
                      <p className="text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-40 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                How It Works
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Get started in just 3 simple steps and watch your wealth grow automatically.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Link Your UPI",
                description: "Connect your UPI accounts securely. We use bank-grade encryption to keep your data safe.",
                icon: <Smartphone className="h-12 w-12" />,
                color: "from-blue-500 to-cyan-500"
              },
              {
                step: "02", 
                title: "Set Your Goals",
                description: "Choose what you're saving for - vacation, emergency fund, or anything else you want.",
                icon: <Target className="h-12 w-12" />,
                color: "from-green-500 to-emerald-500"
              },
              {
                step: "03",
                title: "Watch It Grow",
                description: "Every transaction gets rounded up and invested automatically. Sit back and watch your money grow!",
                icon: <TrendingUp className="h-12 w-12" />,
                color: "from-purple-500 to-violet-500"
              }
            ].map((step, index) => (
              <Card key={index} className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 hover:border-white/40 transition-all duration-300 group">
                <CardContent className="p-8 text-center">
                  <div className="relative mb-6">
                    <div className={`bg-gradient-to-r ${step.color} p-4 rounded-2xl mx-auto w-fit group-hover:scale-110 transition-transform`}>
                      {step.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 bg-white text-gray-900 text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                  <p className="text-gray-300">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="relative z-40 py-20 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                What Our Users Say
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-6">"{testimonial.text}"</p>
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{testimonial.image}</div>
                    <div>
                      <div className="font-semibold text-white">{testimonial.name}</div>
                      <div className="text-gray-400 text-sm">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-40 py-20">
        <div className="container mx-auto px-6">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 overflow-hidden">
            <CardContent className="p-12 text-center">
              <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
                Ready to Start Building Wealth?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join over 150,000 Indians who are already building their financial future with UPI Piggy.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto mb-8">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                />
                <Button 
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 whitespace-nowrap"
                  onClick={() => navigate('/signup')}
                >
                  Get Started Free
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>

              <div className="text-blue-200 text-sm">
                ✅ No credit card required • ✅ Start with just ₹10 • ✅ Cancel anytime
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-40 bg-white/5 backdrop-blur-sm py-12 border-t border-white/20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-xl">
                  <PiggyBank className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">UPI Piggy</span>
              </div>
              <p className="text-gray-400">
                India's smartest micro-investment platform. Start building wealth with your spare change.
              </p>
            </div>
            
            {[
              {
                title: "Product",
                links: ["Features", "How it Works", "Pricing", "Security", "API"]
              },
              {
                title: "Company", 
                links: ["About", "Careers", "Blog", "Press", "Contact"]
              },
              {
                title: "Support",
                links: ["Help Center", "Community", "Privacy", "Terms", "Status"]
              }
            ].map((column, index) => (
              <div key={index}>
                <h4 className="font-semibold text-white mb-4">{column.title}</h4>
                <ul className="space-y-2">
                  {column.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400">
              © 2024 UPI Piggy. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <div className="text-gray-400 text-sm">SEBI Registered</div>
              <div className="text-gray-400 text-sm">SSL Secured</div>
              <div className="text-gray-400 text-sm">ISO 27001</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ModernLandingPage;
