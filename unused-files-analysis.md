# Unused Files Analysis for Piggy UPI

Based on codebase analysis, here are files that appear to be unused and can be safely removed:

## ✅ Safe to Remove (Confirmed Unused)

### 1. Documentation/Example Files
- `src/components/examples/InvestmentServiceExample.tsx` - Example component, not imported anywhere
- `src/pages/Index.tsx` - Contains comment "This file is no longer used"
- `suggest.txt` - Suggestion file, not code-related
- `SUGGESTIONS.txt` - Duplicate suggestion file

### 2. Demo/Test Pages (Not in routing)
- `src/pages/NotificationDemoPage.tsx` - Demo page, not referenced in routing
- `src/pages/LearnPage.tsx` - Not referenced in main App.tsx routing

### 3. Potentially Unused Components
These need manual verification as they might be imported dynamically:
- `src/components/WelcomePage.tsx` - May not be in current routing
- `src/components/SimpleDashboard.tsx` - Check if used in SimpleApp
- `src/components/SimpleHelp.tsx` - Check if used in SimpleApp
- `src/components/SimpleOnboarding.tsx` - Check if used in SimpleApp
- `src/components/InvestmentNotifications.tsx` - Check usage
- `src/components/TrustBadge.tsx` - Check usage

### 4. API/Backend Files (if not using real backend)
- `api/market-data.js` - Check if this API endpoint is being used
- `database.sql` - If using Supabase instead

## ❓ Need Manual Verification

### UI Components (Check if imported in other components)
- Many UI components in `src/components/ui/` might be unused
- Check each one individually as they could be imported by other components

### Hooks (Check usage)
- `src/hooks/useRewards.ts` - Verify if rewards system is active
- `src/hooks/useMockDataOrchestrator.ts` - If not using mock data

### Services
- `src/services/investmentService.ts` - Check if investment features are active
- `src/services/notificationService.ts` - Check if notifications are implemented

## 🔍 How to Verify Before Removal

1. **Search for imports**: `grep -r "import.*ComponentName" src/`
2. **Check dynamic imports**: Look for lazy loading or dynamic imports
3. **Check string references**: Some components might be referenced as strings
4. **Test build**: Run build after removal to check for errors

## Recommended Removal Commands

```bash
# Remove confirmed unused files
rm src/pages/Index.tsx
rm src/components/examples/InvestmentServiceExample.tsx
rm suggest.txt
rm SUGGESTIONS.txt
rm src/pages/NotificationDemoPage.tsx

# Optional: Remove documentation files if not needed
rm BACKEND_SETUP.md
rm EMAIL_SETUP.md
rm MARKET_CLEANUP_SUMMARY.md
rm PORTFOLIO_SETTINGS_IMPLEMENTATION.md
rm SECURITY_IMPLEMENTATION.md
rm TESTING_PERFORMANCE_IMPLEMENTATION.md
```
