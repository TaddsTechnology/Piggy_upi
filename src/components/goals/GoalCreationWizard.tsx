import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Car, 
  Plane, 
  Home, 
  GraduationCap,
  Shield,
  Heart,
  Smartphone,
  Calendar,
  IndianRupee
} from 'lucide-react';

interface Goal {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  suggestedAmount: number;
  timeFrame: string;
  category: 'short' | 'medium' | 'long';
}

const goalTemplates: Goal[] = [
  {
    id: 'emergency',
    name: 'Emergency Fund',
    description: '6 months of expenses for financial security',
    icon: <Shield className="h-6 w-6" />,
    color: 'bg-red-500',
    suggestedAmount: 100000,
    timeFrame: '12-18 months',
    category: 'short'
  },
  {
    id: 'vacation',
    name: 'Dream Vacation',
    description: 'Save for your next big adventure',
    icon: <Plane className="h-6 w-6" />,
    color: 'bg-blue-500',
    suggestedAmount: 50000,
    timeFrame: '6-12 months',
    category: 'short'
  },
  {
    id: 'gadget',
    name: 'New Gadget',
    description: 'Latest smartphone, laptop, or electronics',
    icon: <Smartphone className="h-6 w-6" />,
    color: 'bg-purple-500',
    suggestedAmount: 30000,
    timeFrame: '3-6 months',
    category: 'short'
  },
  {
    id: 'car',
    name: 'Car Down Payment',
    description: 'Save for your dream car',
    icon: <Car className="h-6 w-6" />,
    color: 'bg-green-500',
    suggestedAmount: 200000,
    timeFrame: '2-3 years',
    category: 'medium'
  },
  {
    id: 'house',
    name: 'Home Down Payment',
    description: 'Save for your first home',
    icon: <Home className="h-6 w-6" />,
    color: 'bg-orange-500',
    suggestedAmount: 500000,
    timeFrame: '3-5 years',
    category: 'long'
  },
  {
    id: 'education',
    name: 'Higher Education',
    description: 'Fund your or your child\'s education',
    icon: <GraduationCap className="h-6 w-6" />,
    color: 'bg-indigo-500',
    suggestedAmount: 300000,
    timeFrame: '2-4 years',
    category: 'medium'
  }
];

interface GoalCreationWizardProps {
  onGoalCreated: (goal: any) => void;
  onClose: () => void;
}

export const GoalCreationWizard: React.FC<GoalCreationWizardProps> = ({ 
  onGoalCreated, 
  onClose 
}) => {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<Goal | null>(null);
  const [customGoal, setCustomGoal] = useState({
    name: '',
    targetAmount: '',
    targetDate: ''
  });

  const handleTemplateSelect = (template: Goal) => {
    setSelectedTemplate(template);
    setStep(2);
  };

  const handleCustomGoal = () => {
    setSelectedTemplate(null);
    setStep(2);
  };

  const handleGoalSubmit = () => {
    const newGoal = {
      id: Date.now().toString(),
      name: selectedTemplate?.name || customGoal.name,
      targetAmount: selectedTemplate?.suggestedAmount || parseInt(customGoal.targetAmount),
      targetDate: customGoal.targetDate,
      currentAmount: 0,
      category: selectedTemplate?.category || 'medium',
      icon: selectedTemplate?.icon || <Target className="h-6 w-6" />,
      color: selectedTemplate?.color || 'bg-blue-500',
      createdAt: new Date().toISOString()
    };
    
    onGoalCreated(newGoal);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Set Your Financial Goal</CardTitle>
              <p className="text-gray-600 mt-1">
                Step {step} of 2 - Choose what you're saving for
              </p>
            </div>
            <Button variant="ghost" onClick={onClose}>×</Button>
          </div>
          <Progress value={(step / 2) * 100} className="mt-4" />
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">What are you saving for?</h3>
                <p className="text-gray-600">Choose a goal template or create your own</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {goalTemplates.map((template) => (
                  <Card 
                    key={template.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-blue-300"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`${template.color} text-white p-2 rounded-lg`}>
                          {template.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{template.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <IndianRupee className="h-3 w-3" />
                            <span>{template.suggestedAmount.toLocaleString()}</span>
                            <span>•</span>
                            <Calendar className="h-3 w-3" />
                            <span>{template.timeFrame}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center">
                <Button variant="outline" onClick={handleCustomGoal} className="gap-2">
                  <Target className="h-4 w-4" />
                  Create Custom Goal
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {selectedTemplate ? (
                <div className="text-center">
                  <div className={`${selectedTemplate.color} text-white p-4 rounded-lg inline-flex mb-4`}>
                    {selectedTemplate.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{selectedTemplate.name}</h3>
                  <p className="text-gray-600">{selectedTemplate.description}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="goalName">Goal Name</Label>
                    <Input
                      id="goalName"
                      value={customGoal.name}
                      onChange={(e) => setCustomGoal({...customGoal, name: e.target.value})}
                      placeholder="Enter your goal name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="targetAmount">Target Amount</Label>
                    <Input
                      id="targetAmount"
                      type="number"
                      value={customGoal.targetAmount}
                      onChange={(e) => setCustomGoal({...customGoal, targetAmount: e.target.value})}
                      placeholder="₹ 50,000"
                    />
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="targetDate">Target Date</Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={customGoal.targetDate}
                  onChange={(e) => setCustomGoal({...customGoal, targetDate: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Smart Recommendations</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• We'll automatically allocate your round-ups to this goal</p>
                  <p>• You can set up additional monthly contributions</p>
                  <p>• We'll send progress updates and tips to stay on track</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button 
                  onClick={handleGoalSubmit}
                  disabled={!customGoal.targetDate || (!selectedTemplate && (!customGoal.name || !customGoal.targetAmount))}
                  className="flex-1"
                >
                  Create Goal
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
