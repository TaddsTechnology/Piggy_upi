# Development Setup Guide

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Fix common issues**
   ```bash
   npm run lint:fix
   npm run type-check
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

## Common Issues & Solutions

### ESLint Errors
- Run `npm run lint:fix` to auto-fix most issues
- For TypeScript `any` types, gradually replace with proper types from `src/types/common.ts`

### React Hook Dependencies
- Use the `useSafeAsync` hook for async operations
- Add missing dependencies to useEffect hooks

### Performance Issues
- Use the utilities in `src/utils/performance.ts` for optimization
- Monitor bundle size with `npm run build:analyze`

## Code Quality Standards

### TypeScript
- Avoid `any` types - use proper interfaces from `src/types/`
- Enable strict mode gradually
- Use type assertions sparingly

### React Hooks
- Always include dependencies in useEffect
- Use useCallback for functions passed to children
- Use useMemo for expensive calculations

### Error Handling
- Use the error boundary for component-level errors
- Handle async errors with try-catch blocks
- Provide meaningful error messages to users

## Testing

### Unit Tests
```bash
npm run test
npm run test:watch
```

### E2E Tests
```bash
npm run test:e2e
npm run test:e2e:ui
```

## Deployment

### Production Build
```bash
npm run build
npm run preview
```

### Performance Check
```bash
npm run perf:analyze
npm run perf:lighthouse
```

## Architecture Overview

### Key Components
- **AuthContext**: User authentication and demo mode management
- **usePiggyCore**: Main business logic hook for transactions and investments
- **useMarketData**: Real-time market data fetching with caching
- **AutoPayPage**: UPI autopay setup and management

### Data Flow
1. User authentication via Supabase or demo mode
2. Market data fetching from Yahoo Finance API (cached)
3. Transaction processing and roundup calculations
4. Investment allocation based on portfolio presets
5. Real-time portfolio valuation

### Security Features
- Input validation with zod schemas
- Secure file upload handling
- Fraud detection mechanisms
- Rate limiting and CSRF protection

## Best Practices

### Component Structure
```
src/
├── components/           # Reusable UI components
├── pages/               # Page-level components
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
├── types/               # TypeScript type definitions
└── utils/               # Helper functions
```

### State Management
- Use React Context for global state
- Local state with useState for component-specific data
- useMemo and useCallback for performance optimization

### API Integration
- Service layer pattern for API calls
- Error boundaries for graceful error handling
- Loading states for better UX
