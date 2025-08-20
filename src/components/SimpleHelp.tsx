import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PiggyBank,
  HelpCircle,
  CheckCircle,
  ShieldCheck,
  Search,
  ChevronDown,
  ChevronUp,
  LucideIcon,
  Wallet,
  Clock,
  Banknote,
  Landmark,
  Lock,
  BadgeIndianRupee,
  Phone,
  Mail
} from "lucide-react";

// FAQ item type
interface FaqItem {
  question: string;
  answer: string;
}

// Help section type
interface HelpSection {
  icon: LucideIcon;
  title: string;
  description: string;
  faqs: FaqItem[];
}

const SimpleHelp = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Define the help sections
  const helpSections: HelpSection[] = [
    {
      icon: PiggyBank,
      title: "How Piggy Works",
      description: "Learn about the basics of our round-up investment app",
      faqs: [
        {
          question: "What exactly is Piggy UPI?",
          answer: "Piggy UPI is an app that automatically rounds up your everyday UPI transactions and invests the spare change. For example, if you spend ₹127, we round it to ₹130 and invest the ₹3 difference in safe, diversified portfolios."
        },
        {
          question: "How much money can I save with Piggy?",
          answer: "Most users save ₹400-600 per month just from roundups. This can grow to thousands over time with the power of compound returns. Even small amounts like ₹50/week can become significant investments over time."
        },
        {
          question: "Do I need to understand investing to use Piggy?",
          answer: "Not at all! Piggy is designed for people who know nothing about investing. We handle everything automatically in the background. You just spend money normally, and we'll help your spare change grow."
        },
        {
          question: "How often does Piggy invest my money?",
          answer: "We collect your roundups throughout the week, and once they reach ₹50 or more, we automatically invest them according to your chosen portfolio. This typically happens once a week."
        }
      ]
    },
    {
      icon: Wallet,
      title: "Money & Transactions",
      description: "Questions about deposits, withdrawals, and your money",
      faqs: [
        {
          question: "How do I add money to my Piggy account?",
          answer: "You can add money anytime through UPI by going to the 'Add Money' option in the app. The minimum deposit is just ₹1."
        },
        {
          question: "Can I withdraw my money anytime?",
          answer: "Yes! Your money is always yours. You can withdraw part or all of your investments at any time with no penalty or lock-in period. Withdrawals typically take 1-2 business days to reach your bank account."
        },
        {
          question: "Are there any fees to use Piggy?",
          answer: "Piggy is completely free for accounts under ₹5,000. For accounts above ₹5,000, there's a small subscription fee of ₹29/month, which is automatically deducted from your returns (not your principal)."
        },
        {
          question: "What happens if I don't have enough money in my bank account?",
          answer: "Don't worry! Piggy only rounds up transactions that are successfully completed. If you don't have enough money for a purchase, there's no roundup for that transaction."
        }
      ]
    },
    {
      icon: ShieldCheck,
      title: "Safety & Security",
      description: "Information about how we keep your money and data safe",
      faqs: [
        {
          question: "Is my money safe with Piggy?",
          answer: "Absolutely. Your investments are made in government-regulated mutual funds and ETFs through our SEBI-registered partners. Your money is never mixed with our operating funds."
        },
        {
          question: "How is my personal information protected?",
          answer: "We use bank-level 256-bit encryption for all your data. Your personal and financial information is encrypted both in transit and at rest. We never sell your data to third parties."
        },
        {
          question: "Is Piggy regulated?",
          answer: "Yes. Piggy operates through partnerships with SEBI-regulated investment advisors and mutual fund distributors. All our investment products comply with Indian financial regulations."
        },
        {
          question: "What happens if I lose my phone?",
          answer: "Your account is protected by multiple layers of security. If you lose your phone, simply log in on a new device using your registered mobile number/email and password. You can also contact our support team to temporarily freeze your account."
        }
      ]
    },
    {
      icon: BadgeIndianRupee,
      title: "Investment Questions",
      description: "Learn about our investment approach and returns",
      faqs: [
        {
          question: "Where exactly is my money invested?",
          answer: "Depending on your chosen risk profile, your money is invested in a diversified mix of large-cap ETFs, government bonds, and/or gold ETFs. These are all highly regulated, liquid investments managed by India's top asset management companies."
        },
        {
          question: "What kind of returns can I expect?",
          answer: "Based on historical performance, our portfolios typically return between 8-15% annually, depending on your risk profile and market conditions. However, all investments carry risk, and past performance doesn't guarantee future results."
        },
        {
          question: "Can I lose money?",
          answer: "While our portfolios are designed to minimize risk through diversification, all investments carry some risk. In periods of market downturns, your investment value may temporarily decrease. However, investing for the long term historically outperforms keeping money in a savings account."
        },
        {
          question: "Can I change my investment plan later?",
          answer: "Yes! You can change your risk profile and investment plan anytime through the app settings. The changes will apply to future investments."
        }
      ]
    }
  ];

  // Toggle FAQ open/closed state
  const toggleFaq = (index: number) => {
    if (openFaqIndex === index) {
      setOpenFaqIndex(null);
    } else {
      setOpenFaqIndex(index);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto space-y-8 pt-4">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <HelpCircle className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            How Can We Help?
          </h1>
          <p className="text-gray-600 max-w-lg mx-auto">
            Find answers to common questions about Piggy UPI and how it helps you save and invest your spare change automatically.
          </p>
        </div>

        {/* Search Box - Non-functional in this simple version */}
        <div className="relative max-w-md mx-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search for help topics..."
          />
        </div>

        {/* Help Sections Tabs */}
        <Tabs defaultValue={helpSections[0].title.toLowerCase().replace(/\s+/g, '-')}>
          <TabsList className="w-full justify-start overflow-x-auto">
            {helpSections.map((section, index) => {
              const Icon = section.icon;
              return (
                <TabsTrigger
                  key={index}
                  value={section.title.toLowerCase().replace(/\s+/g, '-')}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{section.title}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Tab Contents */}
          {helpSections.map((section, sectionIndex) => {
            const Icon = section.icon;
            return (
              <TabsContent 
                key={sectionIndex} 
                value={section.title.toLowerCase().replace(/\s+/g, '-')}
                className="mt-6"
              >
                {/* Section Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                    <p className="text-gray-600">{section.description}</p>
                  </div>
                </div>

                {/* FAQs */}
                <div className="space-y-3">
                  {section.faqs.map((faq, faqIndex) => {
                    const globalIndex = sectionIndex * 10 + faqIndex;
                    const isOpen = openFaqIndex === globalIndex;
                    
                    return (
                      <Card key={faqIndex} className="overflow-hidden">
                        <div 
                          className="p-4 cursor-pointer flex items-center justify-between hover:bg-gray-50 transition-colors"
                          onClick={() => toggleFaq(globalIndex)}
                        >
                          <h3 className="font-medium text-gray-900">{faq.question}</h3>
                          {isOpen ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                        
                        {isOpen && (
                          <CardContent className="pt-0 pb-4 border-t border-gray-100 bg-gray-50">
                            <p className="text-gray-600">{faq.answer}</p>
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Still Need Help Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="font-semibold text-gray-900">Still have questions?</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Our friendly support team is here to help you with anything you need.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button variant="outline" className="gap-2 w-full sm:w-auto">
                  <Phone className="h-4 w-4" />
                  Call Support
                </Button>
                <Button className="gap-2 w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                  <Mail className="h-4 w-4" />
                  Email Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SimpleHelp;
