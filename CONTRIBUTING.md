# 🤝 Contributing to UPI Piggy

Thank you for your interest in contributing to UPI Piggy! We welcome contributions from developers of all experience levels.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git
- Supabase account (free tier)
- Basic knowledge of React, TypeScript, and Tailwind CSS

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/piggy-upi.git
   cd piggy-upi
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

5. **Set up the database**:
   - Create a new project on [Supabase](https://supabase.com)
   - Run the SQL in `database.sql` in your Supabase SQL Editor
   - Update your `.env` file with your project URL and anon key

6. **Start the development server**:
   ```bash
   npm run dev
   ```

7. **Run tests** to ensure everything works:
   ```bash
   npm run test
   npm run test:e2e
   ```

## 🎯 How to Contribute

### 🐛 Reporting Bugs
1. Check if the bug has already been reported in [Issues](https://github.com/TaddsTechnology/Piggy_upi/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)
   - Browser/OS information

### 💡 Suggesting Features
1. Check existing [Issues](https://github.com/TaddsTechnology/Piggy_upi/issues) for similar suggestions
2. Create a new issue with:
   - Clear feature description
   - Use case and motivation
   - Proposed implementation (if you have ideas)

### 🔧 Making Code Changes

#### 1. Choose an Issue
- Look for issues labeled `good first issue` for beginners
- Check issues labeled `help wanted` for areas where we need help
- Comment on the issue to let others know you're working on it

#### 2. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

#### 3. Make Your Changes
- Follow our [Development Guidelines](#-development-guidelines)
- Write tests for new functionality
- Update documentation if needed

#### 4. Test Your Changes
```bash
# Run all tests
npm run test:all

# Check code quality
npm run lint
npm run type-check
```

#### 5. Commit Your Changes
We use conventional commits. Examples:
```bash
git commit -m "feat: add portfolio rebalancing feature"
git commit -m "fix: resolve transaction rounding bug"
git commit -m "docs: update contributing guidelines"
```

#### 6. Push and Create PR
```bash
git push origin your-branch-name
```
Then create a Pull Request on GitHub with:
- Clear title and description
- Reference any related issues
- Screenshots/GIFs for UI changes
- Test coverage information

## 📋 Development Guidelines

### Code Style
- **TypeScript**: Use strict mode, provide proper types
- **React**: Use functional components with hooks
- **Tailwind**: Use utility classes, follow mobile-first approach
- **File naming**: Use PascalCase for components, camelCase for utilities

### Component Structure
```typescript
// Good component structure
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <Button onClick={onAction} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Click me'}
      </Button>
    </div>
  );
}
```

### Testing Guidelines
- Write unit tests for utility functions
- Write component tests for user interactions
- Write E2E tests for complete user flows
- Maintain 80%+ test coverage
- Use meaningful test descriptions

### Security Guidelines
- Never commit sensitive data (API keys, passwords)
- Validate all user inputs
- Follow security best practices in `/src/lib/security/`
- Test security features thoroughly

## 🏷️ Issue Labels

- `good first issue` - Great for newcomers
- `help wanted` - We need community help
- `bug` - Something isn't working
- `enhancement` - New feature or improvement
- `documentation` - Documentation improvements
- `security` - Security-related issues
- `performance` - Performance improvements
- `ui/ux` - User interface/experience
- `testing` - Testing related
- `priority-high` - High priority issues

## 🎨 Areas Where We Need Help

### 🎯 Good First Issues
- Add new transaction categories
- Improve error messages
- Add loading states to components
- Write additional unit tests
- Update documentation
- Fix minor UI bugs

### 🚀 Advanced Contributions
- **Security**: Enhance fraud detection algorithms
- **Performance**: Optimize bundle size and load times
- **AI/ML**: Implement smart investment recommendations
- **Analytics**: Add advanced portfolio analytics
- **Mobile**: React Native app development
- **Backend**: API optimizations and new endpoints

### 🎨 UI/UX Improvements
- Design new onboarding flows
- Create better data visualizations
- Improve mobile responsiveness
- Add animations and micro-interactions
- Accessibility improvements

### 📊 Data & Analytics
- Portfolio performance tracking
- Investment recommendation engine
- Risk assessment algorithms
- Market data integrations

## 🔄 Pull Request Process

1. **Pre-PR Checklist**:
   - [ ] Tests pass (`npm run test:all`)
   - [ ] Code follows style guidelines
   - [ ] Documentation updated (if needed)
   - [ ] No security vulnerabilities introduced
   - [ ] Performance impact considered

2. **PR Review Process**:
   - Maintainers will review within 2-3 days
   - Address feedback promptly
   - Keep discussions constructive
   - Be patient with the review process

3. **After Merge**:
   - Your contribution will be deployed to the demo site
   - You'll be added to the contributors list
   - Consider sharing your contribution on social media!

## 🌟 Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes for significant contributions
- Social media shoutouts
- Potential job referrals for outstanding contributors

## 📞 Getting Help

- **General Questions**: Open a [Discussion](https://github.com/TaddsTechnology/Piggy_upi/discussions)
- **Bug Reports**: Create an [Issue](https://github.com/TaddsTechnology/Piggy_upi/issues/issues)
- **Security Concerns**: Email info@taddstechnology privately
- **Chat**: Join our community discussions in GitHub Discussions

## 📖 Resources

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)

---

**Thank you for contributing to UPI Piggy! Together, we're making investing accessible to everyone! 🚀**

*Remember: Every contribution, no matter how small, makes a difference!*
