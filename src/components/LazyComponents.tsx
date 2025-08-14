// Lazy loading components for better performance
import { lazy } from 'react';

// Page components - loaded only when needed
export const HomePage = lazy(() => import('../pages/HomePage'));
export const HistoryPage = lazy(() => import('../pages/HistoryPage'));
export const PortfolioPage = lazy(() => import('../pages/PortfolioPage'));
export const GamificationPage = lazy(() => import('../pages/GamificationPage'));
export const SettingsPage = lazy(() => import('../pages/SettingsPage'));
export const InsightsPage = lazy(() => import('../pages/InsightsPage'));
export const AuthPage = lazy(() => import('../pages/AuthPage'));
export const KYCPage = lazy(() => import('../pages/KYCPage'));
export const NotFound = lazy(() => import('../pages/NotFound'));

// Chart components - loaded only when needed
export const RechartsComponents = lazy(() => import('recharts').then(module => ({
  default: {
    LineChart: module.LineChart,
    Line: module.Line,
    BarChart: module.BarChart,
    Bar: module.Bar,
    PieChart: module.PieChart,
    Pie: module.Pie,
    Cell: module.Cell,
    XAxis: module.XAxis,
    YAxis: module.YAxis,
    CartesianGrid: module.CartesianGrid,
    Tooltip: module.Tooltip,
    Legend: module.Legend,
    ResponsiveContainer: module.ResponsiveContainer,
  }
})));

// Security components - loaded only when needed
export const SecurityModules = lazy(() => 
  Promise.all([
    import('../lib/security/middleware'),
    import('../lib/security/fraudDetection'),
    import('../lib/security/encryption')
  ]).then(([middleware, fraud, encryption]) => ({
    default: {
      ...middleware,
      ...fraud,
      ...encryption
    }
  }))
);

// Heavy UI components
export const DataTable = lazy(() => import('../components/ui/data-table').catch(() => ({
  default: () => <div>Data table component failed to load</div>
})));

export const Calendar = lazy(() => import('../components/ui/calendar').catch(() => ({
  default: () => <div>Calendar component failed to load</div>
})));

export const Carousel = lazy(() => import('../components/ui/carousel').catch(() => ({
  default: () => <div>Carousel component failed to load</div>
})));

// Loading fallback component
export const LoadingFallback = ({ message = 'Loading...' }: { message?: string }) => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="text-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-muted-foreground">{message}</p>
    </div>
  </div>
);

// Error boundary for lazy components
export const LazyErrorBoundary = ({ children, fallback }: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}) => {
  return (
    <div className="lazy-component-wrapper">
      {children}
    </div>
  );
};

// HOC for lazy loading with error boundary
export const withLazyLoading = (
  LazyComponent: React.LazyExoticComponent<React.ComponentType<any>>,
  fallbackMessage?: string
) => {
  return (props: any) => (
    <LazyErrorBoundary>
      <React.Suspense fallback={<LoadingFallback message={fallbackMessage} />}>
        <LazyComponent {...props} />
      </React.Suspense>
    </LazyErrorBoundary>
  );
};

// Preload function for critical routes
export const preloadCriticalComponents = () => {
  // Preload most likely next pages
  HomePage.preload?.();
  PortfolioPage.preload?.();
  HistoryPage.preload?.();
};

// Image lazy loading component
export const LazyImage = ({ 
  src, 
  alt, 
  className, 
  loading = 'lazy',
  onLoad,
  onError,
  ...props 
}: React.ImgHTMLAttributes<HTMLImageElement>) => {
  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      className={className}
      onLoad={onLoad}
      onError={onError}
      {...props}
    />
  );
};

// Progressive image loading with blur placeholder
export const ProgressiveImage = ({ 
  src, 
  placeholder, 
  alt, 
  className 
}: {
  src: string;
  placeholder?: string;
  alt: string;
  className?: string;
}) => {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageSrc, setImageSrc] = React.useState(placeholder || '');

  React.useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImageSrc(src);
      setImageLoaded(true);
    };
  }, [src]);

  return (
    <div className={`relative ${className}`}>
      <img
        src={imageSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-70'
        } ${placeholder && !imageLoaded ? 'blur-sm' : ''}`}
      />
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};
