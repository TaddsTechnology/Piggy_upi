import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Trash2, RefreshCw, Bug, User, Database, Settings } from 'lucide-react';

const DebugPanel: React.FC = () => {
  const { user, demoMode, exitDemoMode } = useAuth();
  const [expanded, setExpanded] = useState(false);

  const clearAllStorage = () => {
    // Clear all localStorage items related to demo/mock data
    const keysToRemove = [
      'demo_user_id',
      'demo_mode', 
      'mock_data_initialized',
      'piggy_state',
      'user_preferences',
      'sb-localhost-auth-token' // Supabase token
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    // Also clear any IndexedDB data if present
    if (window.indexedDB) {
      indexedDB.deleteDatabase('piggy-upi-cache');
    }
    
    alert('All storage cleared! Please refresh the page.');
  };

  const forceExitDemo = () => {
    exitDemoMode();
    clearAllStorage();
    window.location.reload();
  };

  const getStorageData = () => {
    const storage = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        storage[key] = localStorage.getItem(key);
      }
    }
    return storage;
  };

  if (!expanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setExpanded(true)}
          variant="outline"
          size="sm"
          className="bg-red-100 border-red-300 text-red-700 hover:bg-red-200"
        >
          <Bug className="h-4 w-4 mr-1" />
          Debug
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-96 overflow-y-auto">
      <Card className="border-red-300 bg-red-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-red-700 flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Debug Panel
            </CardTitle>
            <Button
              onClick={() => setExpanded(false)}
              variant="ghost"
              size="sm"
              className="text-red-700 hover:bg-red-200"
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Auth Status */}
          <div className="space-y-2">
            <h4 className="font-medium text-red-900 flex items-center gap-2">
              <User className="h-4 w-4" />
              Authentication Status
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">User:</span>
                <Badge variant={user ? "default" : "destructive"} className="ml-2">
                  {user ? "Logged In" : "Not Logged"}
                </Badge>
              </div>
              <div>
                <span className="font-medium">Demo Mode:</span>
                <Badge variant={demoMode ? "destructive" : "default"} className="ml-2">
                  {demoMode ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
            {user && (
              <div className="text-xs text-gray-600 bg-white p-2 rounded">
                <strong>Email:</strong> {user.email}
              </div>
            )}
          </div>

          {/* Storage Info */}
          <div className="space-y-2">
            <h4 className="font-medium text-red-900 flex items-center gap-2">
              <Database className="h-4 w-4" />
              Storage Data
            </h4>
            <div className="text-xs bg-white p-2 rounded max-h-32 overflow-y-auto">
              {Object.keys(localStorage).filter(key => 
                key.includes('demo') || 
                key.includes('mock') || 
                key.includes('piggy') ||
                key.includes('sb-')
              ).map(key => (
                <div key={key} className="mb-1">
                  <strong>{key}:</strong> {localStorage.getItem(key)?.slice(0, 50)}...
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <h4 className="font-medium text-red-900 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Quick Fixes
            </h4>
            <div className="grid gap-2">
              {demoMode && (
                <Button
                  onClick={forceExitDemo}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                  size="sm"
                >
                  <RefreshCw className="h-3 w-3 mr-2" />
                  Exit Demo Mode
                </Button>
              )}
              <Button
                onClick={clearAllStorage}
                variant="destructive"
                size="sm"
              >
                <Trash2 className="h-3 w-3 mr-2" />
                Clear All Storage
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-3 w-3 mr-2" />
                Refresh Page
              </Button>
            </div>
          </div>

          {/* Recommendations */}
          {demoMode && (
            <div className="bg-orange-100 border border-orange-300 p-3 rounded text-sm">
              <strong className="text-orange-700">⚠️ Demo Mode Active!</strong>
              <p className="text-orange-600 mt-1">
                You're seeing demo data instead of your real data. Click "Exit Demo Mode" above to switch to your real account data.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugPanel;
