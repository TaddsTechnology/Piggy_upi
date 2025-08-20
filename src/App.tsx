import { Suspense, useEffect, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Layout from "./components/Layout";
import ErrorBoundary from "@/lib/error-boundary";
import { createOptimizedQueryClient, initPerformanceMonitoring } from "@/lib/performance";
import {
  HomePage,
  SmartSipHomePage,
  HistoryPage,
  PortfolioPage,
  GamificationPage,
  SettingsPage,
  InsightsPage,
  MarketsPage,
  InvestmentPage,
  AuthPage,
  KYCPage,
  RealTimeDemo,
  MockDataDemo,
  NotFound,
  LoadingFallback,
  preloadCriticalComponents
} from "./components/LazyComponents";
import SimpleApp from "./pages/SimpleApp";

const ModernLandingPage = lazy(() => import('@/components/enhanced/ModernLandingPage'));
const ModernDashboard = lazy(() => import('@/components/enhanced/ModernDashboard'));
const ModernInvestmentFlow = lazy(() => import('@/components/enhanced/ModernInvestmentFlow'));

const queryClient = createOptimizedQueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, demoMode } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  // Allow access if user is authenticated OR in demo mode
  return (user || demoMode) ? <>{children}</> : <Navigate to="/auth" replace />;
};

const App = () => {
  // Preload critical components and initialize performance monitoring
  useEffect(() => {
    preloadCriticalComponents();
    initPerformanceMonitoring();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<LoadingFallback message="Loading application..." />}>
                <Routes>
                {/* Public routes */}
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/simple" element={<SimpleApp />} />
                <Route path="/welcome" element={
                  <Suspense fallback={<LoadingFallback message="Launching modern experience..." />}>
                    <ModernLandingPage onGetStarted={() => {}} />
                  </Suspense>
                } />
                
                {/* Protected routes */}
                <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                  <Route index element={
                    <Suspense fallback={<LoadingFallback message="Loading Smart SIP dashboard..." />}>
                      <SmartSipHomePage />
                    </Suspense>
                  } />
                  <Route path="dashboard" element={
                    <Suspense fallback={<LoadingFallback message="Loading dashboard..." />}>
                      <HomePage />
                    </Suspense>
                  } />
                  <Route path="home" element={
                    <Suspense fallback={<LoadingFallback message="Loading dashboard..." />}>
                      <HomePage />
                    </Suspense>
                  } />
                  <Route path="history" element={
                    <Suspense fallback={<LoadingFallback message="Loading transaction history..." />}>
                      <HistoryPage />
                    </Suspense>
                  } />
                  <Route path="portfolio" element={
                    <Suspense fallback={<LoadingFallback message="Loading portfolio..." />}>
                      <PortfolioPage />
                    </Suspense>
                  } />
                  <Route path="insights" element={
                    <Suspense fallback={<LoadingFallback message="Loading insights..." />}>
                      <InsightsPage />
                    </Suspense>
                  } />
                  <Route path="markets" element={
                    <Suspense fallback={<LoadingFallback message="Loading markets..." />}>
                      <MarketsPage />
                    </Suspense>
                  } />
                  <Route path="rewards" element={
                    <Suspense fallback={<LoadingFallback message="Loading rewards..." />}>
                      <GamificationPage />
                    </Suspense>
                  } />
                  <Route path="invest" element={
                    <Suspense fallback={<LoadingFallback message="Loading investment..." />}>
                      <InvestmentPage />
                    </Suspense>
                  } />
                  <Route path="kyc" element={
                    <Suspense fallback={<LoadingFallback message="Loading KYC form..." />}>
                      <KYCPage />
                    </Suspense>
                  } />
                  <Route path="settings" element={
                    <Suspense fallback={<LoadingFallback message="Loading settings..." />}>
                      <SettingsPage />
                    </Suspense>
                  } />
                  <Route path="realtime-demo" element={
                    <Suspense fallback={<LoadingFallback message="Loading real-time demo..." />}>
                      <RealTimeDemo />
                    </Suspense>
                  } />
                  <Route path="mock-demo" element={
                    <Suspense fallback={<LoadingFallback message="Loading mock data demo..." />}>
                      <MockDataDemo />
                    </Suspense>
                  } />
                  <Route path="pro/dashboard" element={
                    <Suspense fallback={<LoadingFallback message="Loading pro dashboard..." />}>
                      <ModernDashboard />
                    </Suspense>
                  } />
                  <Route path="pro/invest" element={
                    <Suspense fallback={<LoadingFallback message="Loading pro investment flow..." />}>
                      <ModernInvestmentFlow />
                    </Suspense>
                  } />
                </Route>
                
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
