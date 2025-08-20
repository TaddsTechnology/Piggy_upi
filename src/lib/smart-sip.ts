// Smart SIP Algorithm - Intelligent investment recommendations based on spending patterns
// Implements the strategy from SUGGESTIONS.txt for better user engagement

export interface SpendingAnalysis {
  totalSpending: number;
  averageTransaction: number;
  transactionCount: number;
  spendingCategories: Record<string, number>;
  recommendedSipAmount: number;
  confidenceScore: number; // 0-100
}

export interface SipRecommendation {
  weeklyAmount: number;
  monthlyAmount: number;
  reasoningText: string;
  riskLevel: 'low' | 'medium' | 'high';
  expectedReturns: {
    oneYear: number;
    threeYear: number;
    fiveYear: number;
  };
}

/**
 * Smart SIP Algorithm - Analyzes spending patterns and suggests optimal investment amounts
 * Based on user psychology insights from SUGGESTIONS.txt
 */
export class SmartSipEngine {
  
  /**
   * Analyze user's spending pattern and generate SIP recommendation
   */
  static analyzeSpendingAndRecommendSip(
    transactions: Array<{
      amount: number;
      date: Date;
      category?: string;
      merchant?: string;
    }>,
    userProfile: {
      age: number;
      monthlyIncome?: number;
      riskTolerance?: 'low' | 'medium' | 'high';
      investmentExperience?: 'beginner' | 'intermediate' | 'advanced';
    }
  ): SipRecommendation {
    
    const analysis = this.analyzeSpending(transactions);
    
    // Base SIP calculation: 3-8% of monthly spending
    let sipPercentage = this.calculateOptimalSipPercentage(analysis, userProfile);
    
    // Apply user profile adjustments
    sipPercentage = this.adjustForUserProfile(sipPercentage, userProfile);
    
    const monthlySipAmount = Math.round(analysis.totalSpending * sipPercentage / 100);
    const weeklySipAmount = Math.round(monthlySipAmount / 4);
    
    // Ensure minimum viable amount (₹50/week)
    const finalWeeklyAmount = Math.max(50, weeklySipAmount);
    const finalMonthlyAmount = finalWeeklyAmount * 4;
    
    return {
      weeklyAmount: finalWeeklyAmount,
      monthlyAmount: finalMonthlyAmount,
      reasoningText: this.generateReasoningText(analysis, finalMonthlyAmount, userProfile),
      riskLevel: this.determineRiskLevel(userProfile, finalMonthlyAmount),
      expectedReturns: this.calculateExpectedReturns(finalMonthlyAmount, userProfile.riskTolerance || 'medium')
    };
  }
  
  private static analyzeSpending(transactions: Array<{
    amount: number;
    date: Date;
    category?: string;
  }>): SpendingAnalysis {
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Filter to last 30 days
    const recentTransactions = transactions.filter(t => t.date >= thirtyDaysAgo);
    
    const totalSpending = recentTransactions.reduce((sum, t) => sum + t.amount, 0);
    const transactionCount = recentTransactions.length;
    const averageTransaction = transactionCount > 0 ? totalSpending / transactionCount : 0;
    
    // Categorize spending
    const spendingCategories = recentTransactions.reduce((categories, transaction) => {
      const category = transaction.category || 'others';
      categories[category] = (categories[category] || 0) + transaction.amount;
      return categories;
    }, {} as Record<string, number>);
    
    // Basic SIP recommendation (5% of monthly spending)
    const recommendedSipAmount = Math.round(totalSpending * 0.05);
    
    // Confidence score based on transaction volume and consistency
    const confidenceScore = this.calculateConfidenceScore(recentTransactions);
    
    return {
      totalSpending,
      averageTransaction,
      transactionCount,
      spendingCategories,
      recommendedSipAmount,
      confidenceScore
    };
  }
  
  private static calculateOptimalSipPercentage(
    analysis: SpendingAnalysis, 
    userProfile: any
  ): number {
    // Base percentage: 5%
    let percentage = 5;
    
    // Adjust based on spending volume
    if (analysis.totalSpending > 20000) {
      percentage = 4; // Lower percentage for high spenders
    } else if (analysis.totalSpending < 5000) {
      percentage = 6; // Higher percentage for low spenders
    }
    
    // Adjust based on transaction frequency (higher frequency = more predictable)
    if (analysis.transactionCount > 50) {
      percentage += 1;
    }
    
    // Confidence-based adjustment
    if (analysis.confidenceScore > 80) {
      percentage += 0.5;
    }
    
    return Math.min(8, Math.max(3, percentage));
  }
  
  private static adjustForUserProfile(
    basePercentage: number, 
    userProfile: any
  ): number {
    let adjustedPercentage = basePercentage;
    
    // Age-based adjustment (younger = more aggressive)
    if (userProfile.age < 25) {
      adjustedPercentage += 1;
    } else if (userProfile.age > 40) {
      adjustedPercentage -= 0.5;
    }
    
    // Risk tolerance adjustment
    switch (userProfile.riskTolerance) {
      case 'high':
        adjustedPercentage += 1;
        break;
      case 'low':
        adjustedPercentage -= 1;
        break;
    }
    
    // Experience-based adjustment
    if (userProfile.investmentExperience === 'beginner') {
      adjustedPercentage -= 0.5; // Start conservative
    }
    
    return Math.min(8, Math.max(3, adjustedPercentage));
  }
  
  private static calculateConfidenceScore(transactions: any[]): number {
    // Factors: consistency, volume, recency
    const dayCount = new Set(transactions.map(t => t.date.toDateString())).size;
    const consistencyScore = Math.min(100, (dayCount / 30) * 100);
    
    const volumeScore = Math.min(100, (transactions.length / 50) * 100);
    
    return Math.round((consistencyScore + volumeScore) / 2);
  }
  
  private static generateReasoningText(
    analysis: SpendingAnalysis,
    recommendedAmount: number,
    userProfile: any
  ): string {
    const spendingText = `Based on your ₹${analysis.totalSpending.toLocaleString()} monthly spending`;
    const percentageText = `we recommend investing ₹${recommendedAmount} (${((recommendedAmount / analysis.totalSpending) * 100).toFixed(1)}%)`;
    const benefitText = `This amount won't impact your lifestyle but will build significant wealth over time`;
    
    const experienceText = userProfile.investmentExperience === 'beginner' 
      ? "Perfect for beginners - start small and grow gradually"
      : "Optimized based on your investment experience";
    
    return `${spendingText}, ${percentageText}. ${benefitText}. ${experienceText}.`;
  }
  
  private static determineRiskLevel(
    userProfile: any, 
    monthlyAmount: number
  ): 'low' | 'medium' | 'high' {
    if (userProfile.riskTolerance === 'low' || monthlyAmount < 500) {
      return 'low';
    } else if (userProfile.riskTolerance === 'high' && monthlyAmount > 2000) {
      return 'high';
    }
    return 'medium';
  }
  
  private static calculateExpectedReturns(
    monthlyAmount: number,
    riskLevel: string
  ): { oneYear: number; threeYear: number; fiveYear: number } {
    const returnRates = {
      low: { annual: 8 },      // Conservative debt funds
      medium: { annual: 12 },  // Balanced/Equity funds  
      high: { annual: 15 }     // High growth equity funds
    };
    
    const rate = returnRates[riskLevel as keyof typeof returnRates]?.annual || 12;
    
    // Calculate compound returns
    const oneYear = monthlyAmount * 12 * (1 + rate / 100);
    const threeYear = this.calculateSipReturns(monthlyAmount, rate, 3);
    const fiveYear = this.calculateSipReturns(monthlyAmount, rate, 5);
    
    return {
      oneYear: Math.round(oneYear),
      threeYear: Math.round(threeYear),
      fiveYear: Math.round(fiveYear)
    };
  }
  
  private static calculateSipReturns(
    monthlyAmount: number,
    annualRate: number,
    years: number
  ): number {
    const monthlyRate = annualRate / 100 / 12;
    const months = years * 12;
    
    // SIP future value formula
    const futureValue = monthlyAmount * 
      (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
    
    return futureValue;
  }
}

/**
 * Gamification engine for Smart SIP
 */
export class SipGamification {
  static calculateUserLevel(totalInvested: number, monthsActive: number): {
    level: number;
    title: string;
    nextLevelTarget: number;
    progress: number;
  } {
    const levels = [
      { min: 0, title: "Investment Rookie", target: 1000 },
      { min: 1000, title: "Smart Saver", target: 5000 },
      { min: 5000, title: "Wealth Builder", target: 15000 },
      { min: 15000, title: "Portfolio Pro", target: 50000 },
      { min: 50000, title: "Investment Expert", target: 100000 },
      { min: 100000, title: "Wealth Master", target: 250000 },
    ];
    
    const currentLevel = levels.findIndex(level => totalInvested < level.target);
    const levelIndex = currentLevel === -1 ? levels.length - 1 : Math.max(0, currentLevel - 1);
    
    const level = levels[levelIndex];
    const nextLevel = levels[Math.min(levelIndex + 1, levels.length - 1)];
    
    const progress = Math.min(100, (totalInvested / nextLevel.target) * 100);
    
    return {
      level: levelIndex + 1,
      title: level.title,
      nextLevelTarget: nextLevel.target,
      progress: Math.round(progress)
    };
  }
  
  static generateAchievements(userStats: {
    totalInvested: number;
    monthsActive: number;
    consecutiveWeeks: number;
    maxWeeklyInvestment: number;
  }): Array<{
    id: string;
    title: string;
    description: string;
    achieved: boolean;
    reward: string;
  }> {
    return [
      {
        id: 'first_sip',
        title: 'First Step',
        description: 'Complete your first automatic investment',
        achieved: userStats.totalInvested > 0,
        reward: '🎉 Welcome bonus!'
      },
      {
        id: 'consistent_month',
        title: 'Consistency Champion',
        description: 'Invest for 4 consecutive weeks',
        achieved: userStats.consecutiveWeeks >= 4,
        reward: '⭐ Consistency badge'
      },
      {
        id: 'ten_k_milestone',
        title: 'Ten Thousand Club',
        description: 'Reach ₹10,000 in investments',
        achieved: userStats.totalInvested >= 10000,
        reward: '💎 Diamond investor status'
      },
      {
        id: 'year_long',
        title: 'Annual Investor',
        description: 'Invest consistently for 12 months',
        achieved: userStats.monthsActive >= 12,
        reward: '🏆 Annual achievement trophy'
      }
    ];
  }
}

/**
 * Social comparison features
 */
export class SipSocial {
  static generateLeaderboardPosition(
    userInvestment: number,
    userAge: number,
    allUsers: Array<{ investment: number; age: number }>
  ): {
    percentile: number;
    comparison: string;
    encouragement: string;
  } {
    // Compare with similar age group (±3 years)
    const similarAgeUsers = allUsers.filter(user => 
      Math.abs(user.age - userAge) <= 3
    );
    
    const betterThan = similarAgeUsers.filter(user => 
      user.investment < userInvestment
    ).length;
    
    const percentile = Math.round((betterThan / similarAgeUsers.length) * 100);
    
    let comparison = '';
    let encouragement = '';
    
    if (percentile >= 80) {
      comparison = `You're in the top ${100 - percentile}% of investors in your age group! 🏆`;
      encouragement = "Keep up the excellent work!";
    } else if (percentile >= 60) {
      comparison = `You're doing better than ${percentile}% of your peers! 👏`;
      encouragement = "You're on the right track to wealth building.";
    } else {
      comparison = `There's room to grow! You're ahead of ${percentile}% of your peers.`;
      encouragement = "Small increases can make a big difference over time.";
    }
    
    return { percentile, comparison, encouragement };
  }
}

// Export utility functions
export const sipUtils = {
  formatCurrency: (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  },
  
  calculateWeeklyFromMonthly: (monthlyAmount: number): number => {
    return Math.round(monthlyAmount / 4.33); // More accurate weekly calculation
  },
  
  projectedPortfolioValue: (monthlyAmount: number, years: number, rate = 12): number => {
    return SmartSipEngine['calculateSipReturns'](monthlyAmount, rate, years);
  }
};
