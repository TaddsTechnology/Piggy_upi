// UPI Piggy Service Worker - Production Ready
// Implements advanced caching strategies for optimal performance

const CACHE_NAME = 'piggy-upi-v1.0.0';
const STATIC_CACHE = 'piggy-static-v1.0.0';
const DYNAMIC_CACHE = 'piggy-dynamic-v1.0.0';
const API_CACHE = 'piggy-api-v1.0.0';
const IMAGE_CACHE = 'piggy-images-v1.0.0';

// Critical assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/static/js/main.js',
  '/static/css/main.css',
  '/fonts/Inter-Regular.woff2',
  '/fonts/Inter-Medium.woff2',
  '/fonts/Inter-SemiBold.woff2',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

// API endpoints to cache with different strategies
const API_CACHE_PATTERNS = [
  /\/api\/prices/,
  /\/api\/user\/settings/,
  /\/api\/user\/profile/,
  /\/api\/portfolio/,
  /\/api\/holdings/
];

// Assets that can be cached for longer periods
const LONG_CACHE_PATTERNS = [
  /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
  /\.(?:woff|woff2|ttf|eot)$/,
  /\.(?:js|css)$/
];

// Network-first patterns (always try network first)
const NETWORK_FIRST_PATTERNS = [
  /\/api\/transactions/,
  /\/api\/orders/,
  /\/api\/notifications/,
  /\/api\/auth/
];

// Install event - Cache static assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('📦 Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== STATIC_CACHE && 
                     cacheName !== DYNAMIC_CACHE && 
                     cacheName !== API_CACHE &&
                     cacheName !== IMAGE_CACHE;
            })
            .map((cacheName) => {
              console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - Implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and blob requests
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }
  
  event.respondWith(
    handleRequest(request)
  );
});

// Main request handler with different caching strategies
async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // 1. Network-first strategy for critical real-time data
    if (NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(url.pathname))) {
      return await networkFirst(request);
    }
    
    // 2. Cache-first strategy for static assets
    if (STATIC_ASSETS.includes(url.pathname) || 
        LONG_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
      return await cacheFirst(request);
    }
    
    // 3. Stale-while-revalidate for API data
    if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
      return await staleWhileRevalidate(request);
    }
    
    // 4. Cache-first for images with fallback
    if (url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp)$/)) {
      return await imageCacheStrategy(request);
    }
    
    // 5. Network-first with cache fallback for everything else
    return await networkWithCacheFallback(request);
    
  } catch (error) {
    console.error('Service Worker: Fetch error:', error);
    return await handleOfflineRequest(request);
  }
}

// Strategy 1: Network-first (for real-time data)
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Strategy 2: Cache-first (for static assets)
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // If not in cache, fetch from network and cache
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Return offline fallback if available
    return await getOfflineFallback(request);
  }
}

// Strategy 3: Stale-while-revalidate (for API data that can be slightly stale)
async function staleWhileRevalidate(request) {
  const cache = await caches.open(API_CACHE);
  const cachedResponse = await cache.match(request);
  
  // Fetch from network in background
  const networkResponsePromise = fetch(request).then(async (response) => {
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  }).catch(() => {
    // Network failed, but we might have cached response
    return null;
  });
  
  // Return cached response immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Otherwise wait for network
  return await networkResponsePromise || getOfflineFallback(request);
}

// Strategy 4: Image caching with optimization
async function imageCacheStrategy(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Only cache successfully loaded images
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Return placeholder image for failed image loads
    return new Response(
      `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="#f3f4f6"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af">Image unavailable</text>
      </svg>`,
      {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'no-cache'
        }
      }
    );
  }
}

// Strategy 5: Network with cache fallback
async function networkWithCacheFallback(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses in dynamic cache
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Fallback to any cached version
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return await getOfflinePage();
    }
    
    throw error;
  }
}

// Offline request handler
async function handleOfflineRequest(request) {
  const url = new URL(request.url);
  
  // For navigation requests, return offline page
  if (request.mode === 'navigate') {
    return await getOfflinePage();
  }
  
  // For API requests, return cached version or offline response
  if (url.pathname.startsWith('/api/')) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline API response
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'This feature requires an internet connection',
        cached: false
      }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
  
  // For other requests, try to find any cached version
  return await caches.match(request) || getOfflineFallback(request);
}

// Get offline page
async function getOfflinePage() {
  const offlineHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>UPI Piggy - Offline</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        .container {
          text-align: center;
          max-width: 400px;
          padding: 40px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
        }
        .pig-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }
        h1 {
          margin: 0 0 20px 0;
          font-size: 28px;
          font-weight: 600;
        }
        p {
          margin: 0 0 30px 0;
          font-size: 16px;
          opacity: 0.9;
          line-height: 1.5;
        }
        .retry-btn {
          background: white;
          color: #667eea;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .retry-btn:hover {
          transform: translateY(-2px);
        }
        .features {
          margin-top: 30px;
          text-align: left;
          font-size: 14px;
        }
        .feature {
          margin: 10px 0;
          display: flex;
          align-items: center;
        }
        .check {
          color: #4ade80;
          margin-right: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="pig-icon">🐷</div>
        <h1>You're Offline</h1>
        <p>UPI Piggy is currently offline, but your savings journey continues!</p>
        
        <div class="features">
          <div class="feature">
            <span class="check">✓</span>
            Your data is safe and secure
          </div>
          <div class="feature">
            <span class="check">✓</span>
            Cached portfolio data available
          </div>
          <div class="feature">
            <span class="check">✓</span>
            Automatic sync when online
          </div>
        </div>
        
        <button class="retry-btn" onclick="window.location.reload()">
          Try Again
        </button>
      </div>
      
      <script>
        // Auto-retry when connection is restored
        window.addEventListener('online', () => {
          window.location.reload();
        });
        
        // Show connection status
        if (navigator.onLine) {
          document.body.innerHTML = '<div style="text-align: center; padding: 50px;">Reconnecting...</div>';
          setTimeout(() => window.location.reload(), 1000);
        }
      </script>
    </body>
    </html>
  `;
  
  return new Response(offlineHtml, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache'
    }
  });
}

// Get offline fallback for other resources
async function getOfflineFallback(request) {
  // Try to find the request in any cache
  const response = await caches.match(request);
  if (response) {
    return response;
  }
  
  // Return a generic offline response
  return new Response('Offline - Content not available', {
    status: 503,
    headers: {
      'Content-Type': 'text/plain'
    }
  });
}

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

async function handleBackgroundSync() {
  console.log('🔄 Service Worker: Background sync triggered');
  
  try {
    // Retry failed API requests stored in IndexedDB
    const failedRequests = await getFailedRequests();
    
    for (const request of failedRequests) {
      try {
        await fetch(request);
        await removeFailedRequest(request);
        console.log('✅ Service Worker: Retried failed request successfully');
      } catch (error) {
        console.log('❌ Service Worker: Failed request still failing:', error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Background sync error:', error);
  }
}

// Push notification handler - Enhanced
self.addEventListener('push', (event) => {
  console.log('📱 Service Worker: Push notification received');
  
  let notificationData = {
    title: 'UPI Piggy',
    body: 'Your piggy bank has new updates!',
    icon: '/piggy.png',
    badge: '/piggy.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: Date.now()
    },
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/piggy.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    requireInteraction: false,
    silent: false
  };
  
  try {
    if (event.data) {
      const payload = event.data.json();
      notificationData = {
        ...notificationData,
        ...payload,
        title: payload.title || notificationData.title,
        body: payload.message || payload.body || notificationData.body,
        requireInteraction: payload.priority === 'urgent'
      };
    }
  } catch (error) {
    console.error('Service Worker: Error parsing push data:', error);
  }
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handler for communication with the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(clearAllCaches());
  }
});

// Clear all caches
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
  console.log('🗑️ Service Worker: All caches cleared');
}

// Helper functions for IndexedDB operations (simplified for demo)
async function getFailedRequests() {
  // In a real implementation, this would use IndexedDB
  // For now, return empty array
  return [];
}

async function removeFailedRequest(request) {
  // In a real implementation, this would remove from IndexedDB
  console.log('Removed failed request:', request.url);
}

// Periodic cache cleanup
setInterval(async () => {
  try {
    // Clean up old dynamic cache entries
    const cache = await caches.open(DYNAMIC_CACHE);
    const requests = await cache.keys();
    
    // Keep only the 50 most recent entries
    if (requests.length > 50) {
      const requestsToDelete = requests.slice(0, requests.length - 50);
      await Promise.all(
        requestsToDelete.map(request => cache.delete(request))
      );
      console.log(`🧹 Service Worker: Cleaned up ${requestsToDelete.length} old cache entries`);
    }
  } catch (error) {
    console.error('Service Worker: Cache cleanup error:', error);
  }
}, 30 * 60 * 1000); // Run every 30 minutes

console.log('🚀 Service Worker: Loaded successfully');
