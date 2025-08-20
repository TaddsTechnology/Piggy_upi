import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight,
  PiggyBank,
  Shield,
  TrendingUp,
  Users,
  Zap,
  Star,
  CheckCircle,
  Play,
  Smartphone,
  Calculator,
  Lightbulb,
  Award,
  Globe,
  Lock,
  BarChart3,
  Wallet,
  Target,
  Clock
} from 'lucide-react';

const ModernLandingPage = ({ onGetStarted }: { onGetStarted: () => void }) => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [animatedStats, setAnimatedStats] = useState({ users: 0, invested: 0, returns: 0 });

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Software Engineer, Bangalore",
      content: "I never thought I could invest with just spare change. In 6 months, I've saved ₹3,200 without even noticing!",
      rating: 5
    },
    {
      name: "Rohit Kumar",
      role: "Marketing Manager, Delhi",
      content: "Perfect for beginners like me. The app explains everything in simple language. My portfolio is up 14%!",
      rating: 5
    },
    {
      name: "Anjali Patel",
      role: "Teacher, Mumbai",
      content: "Started with ₹50 roundups, now I'm investing ₹1,000 monthly. Best financial decision I ever made!",
      rating: 5
    }
  ];

  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Instant Round-ups",
      description: "Every transaction automatically rounded to nearest ₹10 and invested",
      color: "from-yellow-400 to-orange-500"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Bank-Grade Security",
      description: "256-bit encryption, SEBI regulated, RBI compliant",
      color: "from-green-400 to-emerald-500"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Smart Portfolios",
      description: "AI-optimized diversified portfolios with 10-15% historical returns",
      color: "from-blue-400 to-indigo-500"
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: "Mobile First",
      description: "Designed for India - works perfectly on any smartphone",
      color: "from-purple-400 to-pink-500"
    }
  ];

  const stats = [
    { label: "Active Users", value: 75000, icon: <Users className="h-5 w-5" />, suffix: "+" },
    { label: "Total Invested", value: 12.5, icon: <Wallet className="h-5 w-5" />, prefix: "₹", suffix: "Cr" },
    { label: "Avg Returns", value: 13.2, icon: <TrendingUp className="h-5 w-5" />, suffix: "%" },
    { label: "App Rating", value: 4.8, icon: <Star className="h-5 w-5" />, suffix: "/5" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const animateStats = () => {
      stats.forEach((stat, index) => {
        let current = 0;
        const increment = stat.value / 50;
        const timer = setInterval(() => {
          current += increment;
          if (current >= stat.value) {
            current = stat.value;
            clearInterval(timer);
          }
          setAnimatedStats(prev => ({
            ...prev,
            [index]: current
          }));
        }, 50);
      });
    };
    
    animateStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-2 rounded-xl">
              <PiggyBank className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold text-gray-900">UPI Piggy</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Button variant="ghost">How it Works</Button>
            <Button variant="ghost">Pricing</Button>
            <Button variant="ghost">Security</Button>
            <Button variant="outline">Login</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200">
          🎉 Join 75,000+ Smart Investors
        </Badge>
        
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Turn Your 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Spare Change</span>
          <br />
          Into Real Wealth
        </h1>
        
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          India's first UPI round-up investing app. Automatically invest your spare change 
          from daily transactions. Start with just ₹1, grow your wealth effortlessly.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button 
            onClick={onGetStarted}
            size="lg" 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Play className="mr-2 h-5 w-5" />
            Start Investing Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <Button variant="outline" size="lg" className="px-8 py-4 rounded-full">
            <Calculator className="mr-2 h-5 w-5" />
            Calculate Returns
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="flex justify-center mb-2 text-blue-600">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {stat.prefix}{Math.round(animatedStats[index] || 0)}{stat.suffix}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How UPI Piggy Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Simple 3-step process that turns your everyday spending into long-term wealth
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Spend Normally",
                description: "Shop anywhere - Zomato, Amazon, local stores. Use any UPI app like GPay, PhonePe, Paytm.",
                icon: <Smartphone className="h-8 w-8" />,
                example: "Buy coffee for ₹127"
              },
              {
                step: "02", 
                title: "Auto Round-up",
                description: "We automatically round up your transaction to the nearest ₹10 and save the difference.",
                icon: <Zap className="h-8 w-8" />,
                example: "₹127 → ₹130, Save ₹3"
              },
              {
                step: "03",
                title: "Smart Investment",
                description: "Your saved money is automatically invested in diversified, SEBI-regulated mutual funds.",
                icon: <TrendingUp className="h-8 w-8" />,
                example: "₹3 grows to ₹3.40 in a year"
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        {item.icon}
                      </div>
                      <div className="text-3xl font-bold text-blue-600 mb-2">{item.step}</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                      <p className="text-gray-600 mb-4">{item.description}</p>
                      <div className="bg-white p-3 rounded-lg border-2 border-blue-200">
                        <p className="text-sm font-medium text-blue-700">{item.example}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {index < 2 && (
                  <ArrowRight className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-blue-400 h-8 w-8" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose UPI Piggy?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Built specifically for Indian investors with features that matter most
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className={`bg-gradient-to-r ${feature.color} text-white p-3 rounded-xl w-12 h-12 flex items-center justify-center mb-4`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-gray-600">Real stories from real investors</p>
          </div>

          <Card className="max-w-4xl mx-auto bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-xl text-gray-700 mb-6 leading-relaxed">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>
                <div className="font-semibold text-gray-900">
                  {testimonials[currentTestimonial].name}
                </div>
                <div className="text-gray-600 text-sm">
                  {testimonials[currentTestimonial].role}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center mt-6 gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentTestimonial ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Building Wealth?
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of Indians who are already growing their wealth with spare change. 
            Get started in under 2 minutes.
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
              <Clock className="h-6 w-6 mx-auto mb-2" />
              <p className="text-sm">2-minute setup</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
              <Target className="h-6 w-6 mx-auto mb-2" />
              <p className="text-sm">Start with ₹1</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
              <Shield className="h-6 w-6 mx-auto mb-2" />
              <p className="text-sm">100% secure</p>
            </div>
          </div>

          <Button 
            onClick={onGetStarted}
            size="lg" 
            className="bg-white text-blue-600 hover:bg-gray-100 font-bold text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Award className="mr-2 h-5 w-5" />
            Start Your Wealth Journey
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          <p className="text-blue-200 text-sm mt-4">
            No credit card required • No minimum balance • Cancel anytime
          </p>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Trusted by 75,000+ Indians</p>
            <div className="flex flex-wrap justify-center items-center gap-6">
              {[
                { icon: <Shield className="h-4 w-4" />, text: "SEBI Registered" },
                { icon: <Lock className="h-4 w-4" />, text: "256-bit SSL" },
                { icon: <CheckCircle className="h-4 w-4" />, text: "RBI Compliant" },
                { icon: <Globe className="h-4 w-4" />, text: "ISO 27001 Certified" }
              ].map((item, index) => (
                <Badge key={index} variant="outline" className="gap-2 py-2 px-4">
                  {item.icon}
                  {item.text}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ModernLandingPage;
