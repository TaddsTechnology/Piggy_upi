import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Play, 
  Award, 
  Clock, 
  TrendingUp,
  Shield,
  PiggyBank,
  Target,
  Lightbulb,
  Star,
  CheckCircle,
  Lock
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  lessons: number;
  completed: boolean;
  progress: number;
  icon: React.ReactNode;
  color: string;
}

interface Article {
  id: string;
  title: string;
  summary: string;
  readTime: string;
  category: string;
  featured: boolean;
  icon: React.ReactNode;
}

const courses: Course[] = [
  {
    id: 'investing-basics',
    title: 'Investing Basics for Indians',
    description: 'Learn the fundamentals of investing in Indian markets',
    duration: '30 mins',
    difficulty: 'Beginner',
    lessons: 6,
    completed: false,
    progress: 0,
    icon: <BookOpen className="h-6 w-6" />,
    color: 'from-green-400 to-green-600'
  },
  {
    id: 'roundup-mastery',
    title: 'Master Round-up Investing',
    description: 'Maximize your savings with smart round-up strategies',
    duration: '20 mins',
    difficulty: 'Beginner',
    lessons: 4,
    completed: true,
    progress: 100,
    icon: <PiggyBank className="h-6 w-6" />,
    color: 'from-blue-400 to-blue-600'
  },
  {
    id: 'portfolio-building',
    title: 'Building Your First Portfolio',
    description: 'Create a diversified portfolio that matches your goals',
    duration: '45 mins',
    difficulty: 'Intermediate',
    lessons: 8,
    completed: false,
    progress: 25,
    icon: <Target className="h-6 w-6" />,
    color: 'from-purple-400 to-purple-600'
  },
  {
    id: 'risk-management',
    title: 'Understanding Investment Risk',
    description: 'Learn to assess and manage investment risks effectively',
    duration: '35 mins',
    difficulty: 'Intermediate',
    lessons: 7,
    completed: false,
    progress: 0,
    icon: <Shield className="h-6 w-6" />,
    color: 'from-orange-400 to-orange-600'
  }
];

const articles: Article[] = [
  {
    id: 'compound-interest',
    title: 'The Magic of Compound Interest',
    summary: 'Discover how compound interest can turn your small investments into significant wealth over time',
    readTime: '5 min read',
    category: 'Basics',
    featured: true,
    icon: <TrendingUp className="h-5 w-5" />
  },
  {
    id: 'sip-benefits',
    title: '5 Benefits of SIP Investing',
    summary: 'Why systematic investment plans are perfect for Indian investors',
    readTime: '3 min read',
    category: 'SIP',
    featured: false,
    icon: <Target className="h-5 w-5" />
  },
  {
    id: 'emergency-fund',
    title: 'Building Your Emergency Fund',
    summary: 'How to create a safety net for unexpected expenses',
    readTime: '4 min read',
    category: 'Planning',
    featured: true,
    icon: <Shield className="h-5 w-5" />
  },
  {
    id: 'tax-saving',
    title: 'Smart Tax Saving Through ELSS',
    summary: 'Save taxes while building wealth with equity-linked savings schemes',
    readTime: '6 min read',
    category: 'Tax Planning',
    featured: false,
    icon: <Award className="h-5 w-5" />
  }
];

const dailyTips = [
  {
    title: "💡 Today's Tip",
    content: "Start with just ₹50 per month. Small, consistent investments compound into significant wealth over time.",
    action: "Set up SIP"
  },
  {
    title: "📈 Market Insight",
    content: "The Indian stock market has delivered 12-15% returns over the last 20 years. Time in the market beats timing the market.",
    action: "Learn more"
  },
  {
    title: "🎯 Goal Setting",
    content: "Having specific financial goals increases your chances of success by 70%. Set SMART financial goals today.",
    action: "Set a goal"
  }
];

const LearnPage = () => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [currentTip, setCurrentTip] = useState(0);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-700';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'Advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="container-mobile xl:container xl:py-8">
      {/* Header */}
      <div className="text-center xl:text-left mb-8">
        <h1 className="text-2xl xl:text-4xl font-heading font-semibold mb-2">
          Learn & Grow
        </h1>
        <p className="text-muted-foreground xl:text-lg">
          Master the art of investing with our comprehensive learning resources
        </p>
      </div>

      {/* Daily Tip Card */}
      <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-blue-600 text-white p-3 rounded-full">
              <Lightbulb className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">{dailyTips[currentTip].title}</h3>
              <p className="text-gray-700 mb-4">{dailyTips[currentTip].content}</p>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                {dailyTips[currentTip].action}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold mb-2">Investment Courses</h2>
            <p className="text-gray-600">Structured learning paths to build your investment knowledge</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {courses.map((course) => (
              <Card 
                key={course.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-200"
                onClick={() => setSelectedCourse(course)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`bg-gradient-to-r ${course.color} text-white p-3 rounded-lg`}>
                      {course.icon}
                    </div>
                    <Badge className={getDifficultyColor(course.difficulty)}>
                      {course.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <p className="text-gray-600 text-sm">{course.description}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration}</span>
                    </div>
                    <span>{course.lessons} lessons</span>
                  </div>

                  {course.progress > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>
                  )}

                  <Button 
                    className="w-full"
                    variant={course.completed ? "outline" : "default"}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {course.completed ? 'Review' : course.progress > 0 ? 'Continue' : 'Start Course'}
                    {course.completed && <CheckCircle className="h-4 w-4 ml-2" />}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Articles Tab */}
        <TabsContent value="articles" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold mb-2">Investment Articles</h2>
            <p className="text-gray-600">Quick reads on important investment topics</p>
          </div>

          <div className="space-y-4">
            {articles.map((article) => (
              <Card 
                key={article.id}
                className={`cursor-pointer hover:shadow-lg transition-all duration-200 ${
                  article.featured ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                      {article.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{article.title}</h3>
                        {article.featured && (
                          <Badge className="bg-yellow-100 text-yellow-700">Featured</Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{article.summary}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{article.readTime}</span>
                          <Badge variant="outline">{article.category}</Badge>
                        </div>
                        <Button size="sm" variant="outline">
                          Read Article
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold mb-2">Learning Achievements</h2>
            <p className="text-gray-600">Track your progress and unlock rewards</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "First Course", desc: "Complete your first course", unlocked: true, icon: "🎓" },
              { title: "Knowledge Seeker", desc: "Read 5 articles", unlocked: true, icon: "📚" },
              { title: "Investment Guru", desc: "Complete all beginner courses", unlocked: false, icon: "🏆" },
              { title: "Article Master", desc: "Read 25 articles", unlocked: false, icon: "📖" },
              { title: "Continuous Learner", desc: "Learn for 7 days straight", unlocked: false, icon: "🔥" },
              { title: "Expert Investor", desc: "Complete all courses", unlocked: false, icon: "💎" }
            ].map((achievement, index) => (
              <Card key={index} className={`text-center ${achievement.unlocked ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                <CardContent className="p-6">
                  <div className="text-4xl mb-3">{achievement.icon}</div>
                  <h3 className="font-semibold mb-2">{achievement.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{achievement.desc}</p>
                  {achievement.unlocked ? (
                    <Badge className="bg-green-100 text-green-700">Unlocked</Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-500">
                      <Lock className="h-3 w-3 mr-1" />
                      Locked
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LearnPage;
