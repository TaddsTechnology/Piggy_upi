import { useCallback, useRef, useEffect } from 'react';

/**
 * Hook to safely handle async operations and avoid memory leaks
 * This prevents state updates on unmounted components
 */
export const useSafeAsync = () => {
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const safeAsync = useCallback(async <T>(
    asyncFn: () => Promise<T>
  ): Promise<T | null> => {
    try {
      const result = await asyncFn();
      return isMountedRef.current ? result : null;
    } catch (error) {
      if (isMountedRef.current) {
        throw error;
      }
      return null;
    }
  }, []);

  return { safeAsync, isMounted: isMountedRef.current };
};
