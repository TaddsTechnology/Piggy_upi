// Performance monitoring and optimization utilities
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

// Web Vitals monitoring
export const measureWebVitals = () => {
  if (typeof window !== 'undefined') {
    getCLS(console.log);
    getFID(console.log);
    getFCP(console.log);
    getLCP(console.log);
    getTTFB(console.log);
  }
};

// Performance observer for custom metrics
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!this.instance) {
      this.instance = new PerformanceMonitor();
    }
    return this.instance;
  }

  // Measure function execution time
  measureExecutionTime<T>(
    name: string,
    fn: () => T | Promise<T>
  ): T | Promise<T> {
    const start = performance.now();
    
    const result = fn();
    
    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = performance.now() - start;
        this.recordMetric(name, duration);
      });
    } else {
      const duration = performance.now() - start;
      this.recordMetric(name, duration);
      return result;
    }
  }

  // Record custom metric
  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
  }

  // Get metric statistics
  getMetricStats(name: string): {
    count: number;
    avg: number;
    min: number;
    max: number;
    p95: number;
  } | null {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const count = values.length;
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / count;
    const min = sorted[0];
    const max = sorted[count - 1];
    const p95Index = Math.floor(count * 0.95);
    const p95 = sorted[p95Index];

    return { count, avg, min, max, p95 };
  }

  // Get all metrics
  getAllMetrics(): Record<string, ReturnType<typeof this.getMetricStats>> {
    const result: Record<string, ReturnType<typeof this.getMetricStats>> = {};
    for (const [name] of this.metrics) {
      result[name] = this.getMetricStats(name);
    }
    return result;
  }

  // Clear metrics
  clearMetrics(): void {
    this.metrics.clear();
  }
}

// React component performance HOC
export const withPerformanceMonitoring = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) => {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name;
  
  return React.memo<P>((props) => {
    const renderStartTime = React.useRef<number>(0);
    const monitor = PerformanceMonitor.getInstance();

    // Measure render time
    React.useLayoutEffect(() => {
      renderStartTime.current = performance.now();
    });

    React.useEffect(() => {
      const renderTime = performance.now() - renderStartTime.current;
      monitor.recordMetric(`${displayName}.renderTime`, renderTime);
    });

    return <WrappedComponent {...props} />;
  });
};

// Image loading optimization
export const optimizedImageLoader = (src: string, quality = 75): string => {
  // In production, integrate with image CDN like Cloudinary or ImageKit
  if (process.env.NODE_ENV === 'development') {
    return src;
  }

  // Example CDN optimization
  const baseUrl = 'https://res.cloudinary.com/your-cloud/image/fetch';
  const params = `f_auto,q_${quality},w_auto,dpr_auto`;
  return `${baseUrl}/${params}/${encodeURIComponent(src)}`;
};

// Bundle size monitoring
export const getBundleStats = (): Promise<{
  totalSize: number;
  gzippedSize: number;
  chunkSizes: Record<string, number>;
}> => {
  return fetch('/__vite__/bundle-stats')
    .then(res => res.json())
    .catch(() => ({
      totalSize: 0,
      gzippedSize: 0,
      chunkSizes: {}
    }));
};

// Memory usage monitoring
export const getMemoryUsage = (): {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
} | null => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
    };
  }
  return null;
};

// Network performance monitoring
export const measureNetworkTiming = (url: string): Promise<{
  dns: number;
  connect: number;
  request: number;
  response: number;
  total: number;
}> => {
  return new Promise((resolve) => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const networkEntry = entries.find(entry => 
        entry.name === url
      ) as PerformanceNavigationTiming;

      if (networkEntry) {
        resolve({
          dns: networkEntry.domainLookupEnd - networkEntry.domainLookupStart,
          connect: networkEntry.connectEnd - networkEntry.connectStart,
          request: networkEntry.responseStart - networkEntry.requestStart,
          response: networkEntry.responseEnd - networkEntry.responseStart,
          total: networkEntry.responseEnd - networkEntry.fetchStart,
        });
        observer.disconnect();
      }
    });

    observer.observe({ entryTypes: ['navigation', 'resource'] });
  });
};

// React query performance optimization
export const createOptimizedQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Aggressive caching for better performance
        staleTime: 1000 * 60 * 5, // 5 minutes
        cacheTime: 1000 * 60 * 10, // 10 minutes
        
        // Background refetch optimization
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        refetchOnMount: true,
        
        // Error retry with exponential backoff
        retry: (failureCount, error) => {
          if (failureCount < 3) {
            return true;
          }
          return false;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        // Optimistic updates for better UX
        retry: 1,
      },
    },
  });
};

// Resource hints for preloading
export const addResourceHints = () => {
  if (typeof document === 'undefined') return;

  const hints = [
    // Preload critical fonts
    { href: '/fonts/inter.woff2', as: 'font', type: 'font/woff2' },
    
    // DNS prefetch for external services
    { href: 'https://fonts.googleapis.com', rel: 'dns-prefetch' },
    { href: 'https://fonts.gstatic.com', rel: 'dns-prefetch' },
    { href: 'https://api.razorpay.com', rel: 'dns-prefetch' },
    
    // Preconnect for critical third-party resources
    { href: 'https://fonts.googleapis.com', rel: 'preconnect' },
    { href: 'https://your-supabase-url.supabase.co', rel: 'preconnect' },
  ];

  hints.forEach(({ href, rel = 'preload', as, type }) => {
    if (!document.querySelector(`link[href="${href}"]`)) {
      const link = document.createElement('link');
      link.rel = rel;
      link.href = href;
      if (as) link.setAttribute('as', as);
      if (type) link.setAttribute('type', type);
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }
  });
};

// Service Worker registration for caching
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
};

// Critical CSS inlining (development helper)
export const inlineCriticalCSS = () => {
  if (process.env.NODE_ENV === 'development') {
    // Extract and inline critical CSS for above-the-fold content
    const criticalCSS = `
      .loading-spinner { /* inline critical styles */ }
      .header { /* inline critical styles */ }
      .main-content { /* inline critical styles */ }
    `;
    
    const style = document.createElement('style');
    style.innerHTML = criticalCSS;
    document.head.insertBefore(style, document.head.firstChild);
  }
};

// Performance budget monitoring
export const checkPerformanceBudget = (): {
  passed: boolean;
  violations: string[];
} => {
  const violations: string[] = [];
  
  // Bundle size budget (500KB gzipped)
  getBundleStats().then(stats => {
    if (stats.gzippedSize > 500 * 1024) {
      violations.push(`Bundle size (${stats.gzippedSize / 1024}KB) exceeds budget (500KB)`);
    }
  });

  // Memory budget (50MB)
  const memory = getMemoryUsage();
  if (memory && memory.usedJSHeapSize > 50 * 1024 * 1024) {
    violations.push(`Memory usage (${memory.usedJSHeapSize / 1024 / 1024}MB) exceeds budget (50MB)`);
  }

  // LCP budget (2.5s)
  getLCP((metric) => {
    if (metric.value > 2500) {
      violations.push(`LCP (${metric.value}ms) exceeds budget (2500ms)`);
    }
  });

  return {
    passed: violations.length === 0,
    violations,
  };
};

// Initialize performance monitoring
export const initPerformanceMonitoring = () => {
  measureWebVitals();
  addResourceHints();
  registerServiceWorker();
  
  // Log performance metrics every 30 seconds in development
  if (process.env.NODE_ENV === 'development') {
    setInterval(() => {
      const monitor = PerformanceMonitor.getInstance();
      console.table(monitor.getAllMetrics());
    }, 30000);
  }
};
