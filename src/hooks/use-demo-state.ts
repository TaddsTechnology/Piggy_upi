import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface DemoStateOptions {
  onDemoModeExit?: () => void;
  clearStateOnExit?: boolean;
}

/**
 * Hook to handle demo mode state transitions properly
 * This helps ensure components clear their demo data when exiting demo mode
 */
export const useDemoState = (options: DemoStateOptions = {}) => {
  const { demoMode, user } = useAuth();
  const { onDemoModeExit, clearStateOnExit = true } = options;

  const handleDemoModeExit = useCallback(() => {
    if (onDemoModeExit) {
      onDemoModeExit();
    }
  }, [onDemoModeExit]);

  useEffect(() => {
    const handleEvent = (event: CustomEvent) => {
      console.log('Demo mode exit detected in component');
      handleDemoModeExit();
    };

    // Listen for demo mode exit events
    window.addEventListener('demo-mode-exit', handleEvent as EventListener);

    return () => {
      window.removeEventListener('demo-mode-exit', handleEvent as EventListener);
    };
  }, [handleDemoModeExit]);

  return {
    demoMode,
    user,
    isAuthenticated: !!user,
    shouldShowRealData: !demoMode && !!user,
    shouldShowDemoData: demoMode,
    clearDemoState: handleDemoModeExit
  };
};

/**
 * Higher-order hook for components that need to reset state on demo mode exit
 */
export const useStateReset = <T>(
  initialState: T,
  resetState: T,
  dependencies: any[] = []
) => {
  const { demoMode } = useAuth();

  const handleReset = useCallback(() => {
    return resetState;
  }, [resetState]);

  useDemoState({
    onDemoModeExit: handleReset
  });

  return {
    shouldReset: !demoMode,
    resetState: handleReset
  };
};
