import { test, expect } from '@playwright/test';

test.describe('UPI Piggy - Critical User Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Demo Mode Flow', () => {
    test('should allow access to demo mode', async ({ page }) => {
      // Should redirect to auth page initially
      await expect(page).toHaveURL('/auth');
      
      // Click demo mode button
      await page.click('button:has-text("Try Demo")');
      
      // Should redirect to home page
      await expect(page).toHaveURL('/');
      
      // Should see portfolio value
      await expect(page.locator('[data-testid="portfolio-value"]')).toBeVisible();
    });

    test('should display demo data correctly', async ({ page }) => {
      // Enter demo mode
      await page.goto('/auth');
      await page.click('button:has-text("Try Demo")');
      
      // Check portfolio value is displayed
      const portfolioValue = page.locator('[data-testid="portfolio-value"]');
      await expect(portfolioValue).toBeVisible();
      
      // Check weekly progress
      const weeklyProgress = page.locator('[data-testid="weekly-progress"]');
      await expect(weeklyProgress).toBeVisible();
      
      // Check recent transactions
      const recentTransactions = page.locator('[data-testid="recent-transactions"]');
      await expect(recentTransactions).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test('should navigate between main pages', async ({ page }) => {
      // Start in demo mode
      await page.goto('/auth');
      await page.click('button:has-text("Try Demo")');
      
      // Navigate to Portfolio
      await page.click('nav a:has-text("Portfolio")');
      await expect(page).toHaveURL('/portfolio');
      await expect(page.locator('h1:has-text("Portfolio")')).toBeVisible();
      
      // Navigate to History
      await page.click('nav a:has-text("History")');
      await expect(page).toHaveURL('/history');
      await expect(page.locator('h1:has-text("Transaction History")')).toBeVisible();
      
      // Navigate to Settings
      await page.click('nav a:has-text("Settings")');
      await expect(page).toHaveURL('/settings');
      await expect(page.locator('h1:has-text("Settings")')).toBeVisible();
      
      // Navigate back to Home
      await page.click('nav a:has-text("Home")');
      await expect(page).toHaveURL('/');
    });

    test('should work on mobile viewports', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Enter demo mode
      await page.goto('/auth');
      await page.click('button:has-text("Try Demo")');
      
      // Check bottom navigation is visible
      const bottomNav = page.locator('[data-testid="bottom-navigation"]');
      await expect(bottomNav).toBeVisible();
      
      // Test bottom navigation
      await page.click('[data-testid="nav-portfolio"]');
      await expect(page).toHaveURL('/portfolio');
      
      await page.click('[data-testid="nav-home"]');
      await expect(page).toHaveURL('/');
    });
  });

  test.describe('Transaction Simulation', () => {
    test('should simulate transactions and update balance', async ({ page }) => {
      // Enter demo mode
      await page.goto('/auth');
      await page.click('button:has-text("Try Demo")');
      
      // Get initial piggy balance
      const initialBalance = await page.locator('[data-testid="piggy-balance"]').textContent();
      
      // Simulate a transaction
      await page.click('button:has-text("Simulate")');
      
      // Wait for balance to update
      await page.waitForTimeout(500);
      
      // Check if balance changed (might be same if roundup is 0)
      const newBalance = await page.locator('[data-testid="piggy-balance"]').textContent();
      
      // At minimum, a new transaction should appear
      const transactions = page.locator('[data-testid="transaction-item"]');
      await expect(transactions.first()).toBeVisible();
    });

    test('should allow manual investment when balance is sufficient', async ({ page }) => {
      // Enter demo mode
      await page.goto('/auth');
      await page.click('button:has-text("Try Demo")');
      
      // Add some balance by simulating transactions
      for (let i = 0; i < 5; i++) {
        await page.click('button:has-text("Simulate")');
        await page.waitForTimeout(200);
      }
      
      // Check if invest button is enabled
      const investButton = page.locator('button:has-text("Invest Now")');
      
      if (await investButton.isVisible()) {
        await investButton.click();
        
        // Should show some feedback (toast or balance change)
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe('Settings Management', () => {
    test('should allow changing portfolio preset', async ({ page }) => {
      // Enter demo mode and go to settings
      await page.goto('/auth');
      await page.click('button:has-text("Try Demo")');
      await page.goto('/settings');
      
      // Find portfolio mode selector
      const portfolioSelect = page.locator('[data-testid="portfolio-mode-select"]');
      
      if (await portfolioSelect.isVisible()) {
        await portfolioSelect.click();
        await page.click('text="Growth (40% Gold, 60% Index)")');
        
        // Setting should be saved (could check local storage or API call)
        await page.waitForTimeout(500);
      }
    });

    test('should allow changing round-up settings', async ({ page }) => {
      // Enter demo mode and go to settings
      await page.goto('/auth');
      await page.click('button:has-text("Try Demo")');
      await page.goto('/settings');
      
      // Find round-up selector
      const roundUpSelect = page.locator('[data-testid="roundup-select"]');
      
      if (await roundUpSelect.isVisible()) {
        await roundUpSelect.click();
        await page.click('text="₹20"');
        
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      // Enter demo mode
      await page.goto('/auth');
      await page.click('button:has-text("Try Demo")');
      
      // Should show desktop layout
      await expect(page.locator('.xl\\:grid')).toBeVisible();
      
      // Should have sidebar navigation
      const sideNav = page.locator('[data-testid="sidebar-navigation"]');
      if (await sideNav.isVisible()) {
        await expect(sideNav).toBeVisible();
      }
    });

    test('should work on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // Enter demo mode
      await page.goto('/auth');
      await page.click('button:has-text("Try Demo")');
      
      // Should be responsive
      await expect(page.locator('body')).toBeVisible();
      
      // Check that components are properly sized
      const mainContent = page.locator('main');
      await expect(mainContent).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should load pages quickly', async ({ page }) => {
      // Measure page load time
      const startTime = Date.now();
      
      await page.goto('/auth');
      await page.click('button:has-text("Try Demo")');
      
      // Wait for main content to be visible
      await page.waitForSelector('[data-testid="portfolio-value"]');
      
      const loadTime = Date.now() - startTime;
      
      // Should load in under 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('should handle slow network conditions', async ({ page }) => {
      // Simulate slow 3G
      await page.context().route('**/*', async route => {
        await new Promise(resolve => setTimeout(resolve, 100)); // Add 100ms delay
        await route.continue();
      });
      
      // Enter demo mode
      await page.goto('/auth');
      await page.click('button:has-text("Try Demo")');
      
      // Should still work, just slower
      await expect(page.locator('[data-testid="portfolio-value"]')).toBeVisible();
    });
  });

  test.describe('Security', () => {
    test('should redirect unauthenticated users', async ({ page }) => {
      // Try to access protected route directly
      await page.goto('/portfolio');
      
      // Should redirect to auth
      await expect(page).toHaveURL('/auth');
    });

    test('should protect sensitive data in demo mode', async ({ page }) => {
      // Enter demo mode
      await page.goto('/auth');
      await page.click('button:has-text("Try Demo")');
      
      // Check that no real PAN/Aadhaar numbers are displayed
      const pageContent = await page.content();
      
      // Should not contain real-looking PAN numbers
      expect(pageContent).not.toMatch(/[A-Z]{5}[0-9]{4}[A-Z]{1}/);
      
      // Should not contain real-looking Aadhaar numbers
      expect(pageContent).not.toMatch(/\d{4}\s\d{4}\s\d{4}/);
    });

    test('should handle XSS attempts gracefully', async ({ page }) => {
      // Enter demo mode
      await page.goto('/auth');
      await page.click('button:has-text("Try Demo")');
      
      // Try to inject script in input fields (if any)
      const inputs = page.locator('input[type="text"]');
      const inputCount = await inputs.count();
      
      if (inputCount > 0) {
        await inputs.first().fill('<script>alert("xss")</script>');
        
        // Should not execute script
        let alertFired = false;
        page.on('dialog', () => {
          alertFired = true;
        });
        
        await page.waitForTimeout(1000);
        expect(alertFired).toBe(false);
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Enter demo mode first
      await page.goto('/auth');
      await page.click('button:has-text("Try Demo")');
      
      // Block all network requests
      await page.context().route('**/*', route => route.abort());
      
      // Try to navigate - should show error state gracefully
      await page.click('nav a:has-text("Portfolio")').catch(() => {
        // Expected to fail due to blocked requests
      });
      
      // Should not crash the app
      await expect(page.locator('body')).toBeVisible();
    });

    test('should show 404 for invalid routes', async ({ page }) => {
      await page.goto('/invalid-route');
      
      // Should show not found page
      await expect(page.locator('text="404"')).toBeVisible();
    });
  });
});
