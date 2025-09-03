import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Shield, 
  Globe, 
  Target, 
  Car, 
  Home, 
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  IndianRupee,
  TrendingUp,
  CheckCircle,
  Clock,
  Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/algorithms';
import { usePiggyCore } from '@/hooks/use-piggy-core';

interface Goal {
  id: string;
  name: string;
  description?: string;
  target: number;
  current: number;
  progress: number;
  targetDate?: string;
  category: string;
  color: string;
  icon: React.ReactNode;
  priority: 'low' | 'medium' | 'high';
  autoInvest: boolean;
  monthlyContribution?: number;
}

const GOAL_CATEGORIES = [
  { id: 'emergency', name: 'Emergency Fund', icon: Shield, color: 'from-red-500 to-pink-500' },
  { id: 'travel', name: 'Travel & Vacation', icon: Globe, color: 'from-blue-500 to-cyan-500' },
  { id: 'tech', name: 'Technology', icon: Target, color: 'from-purple-500 to-indigo-500' },
  { id: 'vehicle', name: 'Vehicle', icon: Car, color: 'from-green-500 to-emerald-500' },
  { id: 'property', name: 'Property', icon: Home, color: 'from-orange-500 to-red-500' },
  { id: 'education', name: 'Education', icon: GraduationCap, color: 'from-teal-500 to-blue-500' },
  { id: 'other', name: 'Other', icon: Target, color: 'from-gray-500 to-slate-500' },
];

const GoalsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, demoMode } = useAuth();
  const [piggyState] = usePiggyCore();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [newGoal, setNewGoal] = useState({
    name: '',
    description: '',
    target: '',
    targetDate: '',
    category: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    autoInvest: false,
    monthlyContribution: ''
  });

  // Initialize with demo goals or user's goals
  useEffect(() => {
    if (demoMode) {
      setGoals([
        {
          id: '1',
          name: 'Emergency Fund',
          description: '6 months of expenses for financial security',
          target: 100000,
          current: 45000,
          progress: 45,
          targetDate: '2024-12-31',
          category: 'emergency',
          color: 'from-red-500 to-pink-500',
          icon: <Shield className="h-5 w-5" />,
          priority: 'high',
          autoInvest: true,
          monthlyContribution: 8000
        },
        {
          id: '2',
          name: 'Vacation Fund',
          description: 'Europe trip with family',
          target: 50000,
          current: 28000,
          progress: 56,
          targetDate: '2024-08-15',
          category: 'travel',
          color: 'from-blue-500 to-cyan-500',
          icon: <Globe className="h-5 w-5" />,
          priority: 'medium',
          autoInvest: false,
          monthlyContribution: 5000
        },
        {
          id: '3',
          name: 'New Laptop',
          description: 'High-performance laptop for work',
          target: 80000,
          current: 12485,
          progress: 16,
          targetDate: '2025-03-31',
          category: 'tech',
          color: 'from-purple-500 to-indigo-500',
          icon: <Target className="h-5 w-5" />,
          priority: 'low',
          autoInvest: true,
          monthlyContribution: 3000
        }
      ]);
    } else {
      // For real users, start with a basic emergency fund goal
      setGoals([
        {
          id: 'default',
          name: 'Emergency Fund',
          description: 'Build your financial safety net',
          target: 100000,
          current: Math.min(piggyState.portfolioValue, 100000),
          progress: Math.min((piggyState.portfolioValue / 100000) * 100, 100),
          targetDate: '',
          category: 'emergency',
          color: 'from-red-500 to-pink-500',
          icon: <Shield className="h-5 w-5" />,
          priority: 'high',
          autoInvest: false
        }
      ]);
    }
  }, [demoMode, piggyState.portfolioValue]);

  const handleCreateGoal = () => {
    if (!newGoal.name || !newGoal.target || !newGoal.category) return;

    const category = GOAL_CATEGORIES.find(cat => cat.id === newGoal.category);
    const IconComponent = category?.icon || Target;

    const goal: Goal = {
      id: Date.now().toString(),
      name: newGoal.name,
      description: newGoal.description,
      target: parseInt(newGoal.target),
      current: 0,
      progress: 0,
      targetDate: newGoal.targetDate,
      category: newGoal.category,
      color: category?.color || 'from-gray-500 to-slate-500',
      icon: <IconComponent className="h-5 w-5" />,
      priority: newGoal.priority,
      autoInvest: newGoal.autoInvest,
      monthlyContribution: newGoal.monthlyContribution ? parseInt(newGoal.monthlyContribution) : undefined
    };

    setGoals([...goals, goal]);
    setShowCreateDialog(false);
    setNewGoal({
      name: '',
      description: '',
      target: '',
      targetDate: '',
      category: '',
      priority: 'medium',
      autoInvest: false,
      monthlyContribution: ''
    });
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setNewGoal({
      name: goal.name,
      description: goal.description || '',
      target: goal.target.toString(),
      targetDate: goal.targetDate || '',
      category: goal.category,
      priority: goal.priority,
      autoInvest: goal.autoInvest,
      monthlyContribution: goal.monthlyContribution?.toString() || ''
    });
  };

  const handleUpdateGoal = () => {
    if (!editingGoal || !newGoal.name || !newGoal.target) return;

    const category = GOAL_CATEGORIES.find(cat => cat.id === newGoal.category);
    const IconComponent = category?.icon || Target;

    const updatedGoal: Goal = {
      ...editingGoal,
      name: newGoal.name,
      description: newGoal.description,
      target: parseInt(newGoal.target),
      progress: Math.min((editingGoal.current / parseInt(newGoal.target)) * 100, 100),
      targetDate: newGoal.targetDate,
      category: newGoal.category,
      color: category?.color || editingGoal.color,
      icon: <IconComponent className="h-5 w-5" />,
      priority: newGoal.priority,
      autoInvest: newGoal.autoInvest,
      monthlyContribution: newGoal.monthlyContribution ? parseInt(newGoal.monthlyContribution) : undefined
    };

    setGoals(goals.map(g => g.id === editingGoal.id ? updatedGoal : g));
    setEditingGoal(null);
    setNewGoal({
      name: '',
      description: '',
      target: '',
      targetDate: '',
      category: '',
      priority: 'medium',
      autoInvest: false,
      monthlyContribution: ''
    });
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(goals.filter(g => g.id !== goalId));
  };

  const addMoneyToGoal = (goalId: string, amount: number) => {
    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        const newCurrent = goal.current + amount;
        return {
          ...goal,
          current: newCurrent,
          progress: Math.min((newCurrent / goal.target) * 100, 100)
        };
      }
      return goal;
    }));
  };

  const getTimeRemaining = (targetDate?: string) => {
    if (!targetDate) return 'No deadline set';
    
    const target = new Date(targetDate);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return '1 day left';
    if (diffDays < 30) return `${diffDays} days left`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months left`;
    return `${Math.ceil(diffDays / 365)} years left`;
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-700 border-red-300',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      low: 'bg-green-100 text-green-700 border-green-300'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const totalGoalValue = goals.reduce((sum, goal) => sum + goal.target, 0);
  const totalCurrentValue = goals.reduce((sum, goal) => sum + goal.current, 0);
  const overallProgress = totalGoalValue > 0 ? (totalCurrentValue / totalGoalValue) * 100 : 0;
  const completedGoals = goals.filter(goal => goal.progress >= 100).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financial Goals</h1>
            <p className="text-gray-600 mt-2">Track and achieve your financial objectives</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              ← Back to Dashboard
            </Button>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Goal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Goal</DialogTitle>
                  <DialogDescription>
                    Set up a new financial goal to track your progress.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="goal-name">Goal Name</Label>
                    <Input
                      id="goal-name"
                      placeholder="e.g., Emergency Fund"
                      value={newGoal.name}
                      onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="goal-description">Description (Optional)</Label>
                    <Textarea
                      id="goal-description"
                      placeholder="Brief description of your goal"
                      value={newGoal.description}
                      onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="goal-target">Target Amount (₹)</Label>
                    <Input
                      id="goal-target"
                      type="number"
                      placeholder="100000"
                      value={newGoal.target}
                      onChange={(e) => setNewGoal({...newGoal, target: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="goal-category">Category</Label>
                    <Select onValueChange={(value) => setNewGoal({...newGoal, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {GOAL_CATEGORIES.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="goal-date">Target Date (Optional)</Label>
                    <Input
                      id="goal-date"
                      type="date"
                      value={newGoal.targetDate}
                      onChange={(e) => setNewGoal({...newGoal, targetDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="goal-priority">Priority</Label>
                    <Select onValueChange={(value: 'low' | 'medium' | 'high') => setNewGoal({...newGoal, priority: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Medium" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateGoal}>
                    Create Goal
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Goals</p>
                  <p className="text-2xl font-bold">{goals.length}</p>
                </div>
                <Target className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{completedGoals}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Target</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalGoalValue)}</p>
                </div>
                <IndianRupee className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Overall Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{overallProgress.toFixed(0)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Goals List */}
        <div className="grid gap-6">
          {goals.map((goal) => (
            <Card key={goal.id} className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-4">
                    <div className={`bg-gradient-to-r ${goal.color} p-3 rounded-xl text-white`}>
                      {goal.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{goal.name}</h3>
                        <Badge className={getPriorityBadge(goal.priority)}>
                          {goal.priority}
                        </Badge>
                        {goal.autoInvest && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                            Auto-invest
                          </Badge>
                        )}
                      </div>
                      {goal.description && (
                        <p className="text-gray-600 text-sm mb-2">{goal.description}</p>
                      )}
                      <p className="text-gray-700">
                        {formatCurrency(goal.current)} / {formatCurrency(goal.target)}
                      </p>
                      {goal.monthlyContribution && (
                        <p className="text-sm text-blue-600">
                          Monthly contribution: {formatCurrency(goal.monthlyContribution)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right mr-4">
                      <div className="text-2xl font-bold text-gray-900">
                        {Math.round(goal.progress)}%
                      </div>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {getTimeRemaining(goal.targetDate)}
                      </p>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => handleEditGoal(goal)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Edit Goal</DialogTitle>
                          <DialogDescription>
                            Update your goal details and settings.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="edit-goal-name">Goal Name</Label>
                            <Input
                              id="edit-goal-name"
                              value={newGoal.name}
                              onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-goal-target">Target Amount (₹)</Label>
                            <Input
                              id="edit-goal-target"
                              type="number"
                              value={newGoal.target}
                              onChange={(e) => setNewGoal({...newGoal, target: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-goal-date">Target Date</Label>
                            <Input
                              id="edit-goal-date"
                              type="date"
                              value={newGoal.targetDate}
                              onChange={(e) => setNewGoal({...newGoal, targetDate: e.target.value})}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setEditingGoal(null)}>
                            Cancel
                          </Button>
                          <Button onClick={handleUpdateGoal}>
                            Update Goal
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Progress value={goal.progress} className="h-3" />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>₹{goal.current.toLocaleString()}</span>
                    <span>₹{(goal.target - goal.current).toLocaleString()} to go</span>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" className="flex-1">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Money
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm">
                      <DialogHeader>
                        <DialogTitle>Add Money to {goal.name}</DialogTitle>
                        <DialogDescription>
                          Add money to reach your goal faster.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="add-amount">Amount (₹)</Label>
                          <Input
                            id="add-amount"
                            type="number"
                            placeholder="1000"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const amount = parseInt((e.target as HTMLInputElement).value);
                                if (amount > 0) {
                                  addMoneyToGoal(goal.id, amount);
                                  (e.target as HTMLInputElement).value = '';
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={(e) => {
                          const input = e.currentTarget.parentElement?.parentElement?.querySelector('input');
                          const amount = parseInt(input?.value || '0');
                          if (amount > 0) {
                            addMoneyToGoal(goal.id, amount);
                            if (input) input.value = '';
                          }
                        }}>
                          Add Money
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {goals.length === 0 && (
          <Card className="text-center p-12">
            <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Goals Yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first financial goal to start tracking your progress.
            </p>
            <Button onClick={() => setShowCreateDialog(true)} className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Goal
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GoalsPage;
