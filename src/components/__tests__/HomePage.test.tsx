import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../../pages/HomePage';

// Mock the piggy core hook
const mockPiggyActions = {
  manualInvest: vi.fn(),
  simulateTransaction: vi.fn(),
  refreshPrices: vi.fn(),
  updateRoundupRule: vi.fn(),
  setPortfolioPreset: vi.fn(),
  toggleAutoInvest: vi.fn()
};

const mockPiggyState = {
  portfolioValue: 15000,
  totalInvested: 12000,
  totalGains: 3000,
  gainsPercent: 25,
  piggyBalance: 250,
  weeklyTarget: 200,
  weeklyProgress: 150,
  weeklyRoundups: 75,
  transactions: [
    {
      id: 'txn1',
      amount: 125,
      direction: 'debit' as const,
      merchant: 'Zomato',
      timestamp: new Date(),
      category: 'Food'
    },
    {
      id: 'txn2',
      amount: 87,
      direction: 'debit' as const,
      merchant: 'Uber',
      timestamp: new Date(),
      category: 'Transport'
    }
  ],
  ledger: [
    {
      id: 'roundup1',
      userId: 'user1',
      amount: 5,
      type: 'roundup_credit' as const,
      reference: 'txn1',
      timestamp: new Date()
    },
    {
      id: 'roundup2',
      userId: 'user1',
      amount: 3,
      type: 'roundup_credit' as const,
      reference: 'txn2',
      timestamp: new Date()
    }
  ],
  holdings: [],
  roundupRule: { roundToNearest: 10, minRoundup: 1, maxRoundup: 50 },
  portfolioPreset: 'balanced' as const,
  autoInvestEnabled: true
};

vi.mock('../../hooks/use-piggy-core', () => ({
  usePiggyCore: () => [mockPiggyState, mockPiggyActions]
}));

const renderHomePage = () => {
  return render(
    <BrowserRouter>
      <HomePage />
    </BrowserRouter>
  );
};

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock current time to ensure consistent greeting
    vi.setSystemTime(new Date('2023-07-15T10:00:00Z')); // 10 AM
  });

  describe('Greeting Display', () => {
    it('should display morning greeting before 12 PM', () => {
      vi.setSystemTime(new Date('2023-07-15T10:00:00Z'));
      renderHomePage();
      
      expect(screen.getByText(/Good morning! 🌅/)).toBeInTheDocument();
    });

    it('should display afternoon greeting between 12-5 PM', () => {
      vi.setSystemTime(new Date('2023-07-15T14:00:00Z'));
      renderHomePage();
      
      expect(screen.getByText(/Good afternoon! ☀️/)).toBeInTheDocument();
    });

    it('should display evening greeting after 5 PM', () => {
      vi.setSystemTime(new Date('2023-07-15T19:00:00Z'));
      renderHomePage();
      
      expect(screen.getByText(/Good evening! 🌙/)).toBeInTheDocument();
    });
  });

  describe('Portfolio Value Display', () => {
    it('should display formatted portfolio value', () => {
      renderHomePage();
      
      expect(screen.getByText('₹15,000')).toBeInTheDocument();
    });

    it('should display gains percentage', () => {
      renderHomePage();
      
      expect(screen.getByText('+25.00%')).toBeInTheDocument();
    });

    it('should display invested and gains amounts', () => {
      renderHomePage();
      
      expect(screen.getByText(/Invested: ₹12,000/)).toBeInTheDocument();
      expect(screen.getByText(/Gains: ₹3,000/)).toBeInTheDocument();
    });

    it('should display piggy balance', () => {
      renderHomePage();
      
      expect(screen.getByText(/Piggy Balance: ₹250/)).toBeInTheDocument();
    });
  });

  describe('Weekly Progress', () => {
    it('should display weekly target and progress', () => {
      renderHomePage();
      
      expect(screen.getByText(/₹150 \/ ₹200/)).toBeInTheDocument();
    });

    it('should show progress bar with correct value', () => {
      renderHomePage();
      
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });

    it('should display appropriate message when target not reached', () => {
      renderHomePage();
      
      expect(screen.getByText(/Only ₹50 more to reach/)).toBeInTheDocument();
    });

    it('should display achievement message when target reached', () => {
      const achievedState = {
        ...mockPiggyState,
        weeklyProgress: 250, // More than target
        weeklyTarget: 200
      };

      vi.mocked(require('../../hooks/use-piggy-core').usePiggyCore).mockReturnValue([
        achievedState,
        mockPiggyActions
      ]);

      renderHomePage();
      
      expect(screen.getByText(/🎉 Weekly goal achieved!/)).toBeInTheDocument();
    });
  });

  describe('Investment Button', () => {
    it('should show "Invest Now" when piggy balance is sufficient', () => {
      renderHomePage();
      
      const investButton = screen.getByRole('button', { name: /invest now/i });
      expect(investButton).toBeInTheDocument();
      expect(investButton).not.toBeDisabled();
    });

    it('should show "Build Balance First" when balance is insufficient', () => {
      const lowBalanceState = {
        ...mockPiggyState,
        piggyBalance: 30 // Less than 50
      };

      vi.mocked(require('../../hooks/use-piggy-core').usePiggyCore).mockReturnValue([
        lowBalanceState,
        mockPiggyActions
      ]);

      renderHomePage();
      
      const buildButton = screen.getByRole('button', { name: /build balance first/i });
      expect(buildButton).toBeInTheDocument();
    });

    it('should be disabled when balance is too low', () => {
      const veryLowBalanceState = {
        ...mockPiggyState,
        piggyBalance: 0.5 // Less than 1
      };

      vi.mocked(require('../../hooks/use-piggy-core').usePiggyCore).mockReturnValue([
        veryLowBalanceState,
        mockPiggyActions
      ]);

      renderHomePage();
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should call manualInvest when clicked with sufficient balance', () => {
      renderHomePage();
      
      const investButton = screen.getByRole('button', { name: /invest now/i });
      fireEvent.click(investButton);
      
      expect(mockPiggyActions.manualInvest).toHaveBeenCalledWith(250);
    });

    it('should simulate transactions when balance is insufficient', async () => {
      const lowBalanceState = {
        ...mockPiggyState,
        piggyBalance: 30
      };

      vi.mocked(require('../../hooks/use-piggy-core').usePiggyCore).mockReturnValue([
        lowBalanceState,
        mockPiggyActions
      ]);

      renderHomePage();
      
      const buildButton = screen.getByRole('button', { name: /build balance first/i });
      fireEvent.click(buildButton);
      
      // Should call simulateTransaction multiple times
      await waitFor(() => {
        expect(mockPiggyActions.simulateTransaction).toHaveBeenCalled();
      }, { timeout: 2000 });
    });
  });

  describe('Recent Transactions', () => {
    it('should display recent transactions', () => {
      renderHomePage();
      
      expect(screen.getByText('Zomato')).toBeInTheDocument();
      expect(screen.getByText('Uber')).toBeInTheDocument();
    });

    it('should display transaction amounts', () => {
      renderHomePage();
      
      expect(screen.getByText('₹125')).toBeInTheDocument();
      expect(screen.getByText('₹87')).toBeInTheDocument();
    });

    it('should display roundup amounts', () => {
      renderHomePage();
      
      expect(screen.getByText('+₹5')).toBeInTheDocument();
      expect(screen.getByText('+₹3')).toBeInTheDocument();
    });

    it('should have simulate transaction button', () => {
      renderHomePage();
      
      const simulateButton = screen.getByRole('button', { name: /simulate/i });
      expect(simulateButton).toBeInTheDocument();
    });

    it('should call simulateTransaction when simulate button clicked', () => {
      renderHomePage();
      
      const simulateButton = screen.getByRole('button', { name: /simulate/i });
      fireEvent.click(simulateButton);
      
      expect(mockPiggyActions.simulateTransaction).toHaveBeenCalled();
    });
  });

  describe('Quick Stats', () => {
    it('should display piggy balance stat', () => {
      renderHomePage();
      
      expect(screen.getByText('Piggy Balance')).toBeInTheDocument();
      expect(screen.getByText('₹250')).toBeInTheDocument();
    });

    it('should display total invested stat', () => {
      renderHomePage();
      
      expect(screen.getByText('Total Invested')).toBeInTheDocument();
      expect(screen.getByText('₹12,000')).toBeInTheDocument();
    });

    it('should display growth rate stat', () => {
      renderHomePage();
      
      expect(screen.getByText('Growth Rate')).toBeInTheDocument();
      expect(screen.getByText('+25.00%')).toBeInTheDocument();
    });

    it('should show positive growth in green', () => {
      renderHomePage();
      
      const growthElement = screen.getByText('+25.00%');
      expect(growthElement).toHaveClass('text-success');
    });

    it('should show negative growth in red', () => {
      const negativeGrowthState = {
        ...mockPiggyState,
        gainsPercent: -5.5
      };

      vi.mocked(require('../../hooks/use-piggy-core').usePiggyCore).mockReturnValue([
        negativeGrowthState,
        mockPiggyActions
      ]);

      renderHomePage();
      
      const growthElement = screen.getByText('-5.50%');
      expect(growthElement).toHaveClass('text-destructive');
    });

    it('should have refresh button in quick stats', () => {
      renderHomePage();
      
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      expect(refreshButton).toBeInTheDocument();
    });

    it('should call refreshPrices when refresh button clicked', () => {
      renderHomePage();
      
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);
      
      expect(mockPiggyActions.refreshPrices).toHaveBeenCalled();
    });
  });

  describe('Responsive Layout', () => {
    it('should render container with responsive classes', () => {
      renderHomePage();
      
      const container = screen.getByText(/Good morning!/i).closest('div');
      expect(container).toHaveClass('container-mobile');
    });

    it('should render grid layout for desktop', () => {
      renderHomePage();
      
      const gridContainer = screen.getByText(/Good morning!/i).closest('.xl\\:grid');
      expect(gridContainer).toBeTruthy();
    });
  });

  describe('Loading States', () => {
    it('should handle empty transactions gracefully', () => {
      const emptyTransactionsState = {
        ...mockPiggyState,
        transactions: []
      };

      vi.mocked(require('../../hooks/use-piggy-core').usePiggyCore).mockReturnValue([
        emptyTransactionsState,
        mockPiggyActions
      ]);

      renderHomePage();
      
      // Should still render the page structure
      expect(screen.getByText(/Recent Round-Ups/)).toBeInTheDocument();
    });

    it('should handle zero values gracefully', () => {
      const zeroValuesState = {
        ...mockPiggyState,
        portfolioValue: 0,
        totalInvested: 0,
        totalGains: 0,
        gainsPercent: 0,
        piggyBalance: 0
      };

      vi.mocked(require('../../hooks/use-piggy-core').usePiggyCore).mockReturnValue([
        zeroValuesState,
        mockPiggyActions
      ]);

      renderHomePage();
      
      expect(screen.getByText('₹0')).toBeInTheDocument();
      expect(screen.getByText('+0.00%')).toBeInTheDocument();
    });
  });
});
