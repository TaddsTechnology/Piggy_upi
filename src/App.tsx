import { Suspense, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Layout from "./components/Layout";
import {
  HomePage,
  HistoryPage,
  PortfolioPage,
  GamificationPage,
  SettingsPage,
  InsightsPage,
  MarketsPage,
  InvestmentPage,
  AuthPage,
  KYCPage,
  NotFound,
  LoadingFallback,
  preloadCriticalComponents
} from "./components/LazyComponents";

const queryClient = new QueryClient();

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
  // Preload critical components when app starts
  useEffect(() => {
    preloadCriticalComponents();
  }, []);

  return (
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
                
                {/* Protected routes */}
                <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                  <Route index element={
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
                  <Route path="settings" element={
                    <Suspense fallback={<LoadingFallback message="Loading settings..." />}>
                      <SettingsPage />
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
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
