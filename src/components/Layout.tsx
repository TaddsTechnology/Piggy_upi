import { Outlet } from "react-router-dom";
import BottomNavigation from "./BottomNavigation";
import TrustBadge from "./TrustBadge";

const Layout = () => {
  return (
    <div className="min-h-screen-mobile bg-background flex flex-col xl:flex-row">
      {/* Mobile Header */}
      <header className="xl:hidden bg-card border-b border-border sticky top-0 z-40 backdrop-blur-sm bg-card/95 safe-area-padding-top">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/piggy.png" 
                alt="Piggy UPI" 
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  console.error('Failed to load Piggy UPI logo in mobile header');
                  e.target.style.display = 'none';
                }}
              />
              <div>
                <h2 className="text-lg font-heading font-bold text-primary">Piggy UPI</h2>
                <p className="text-xs text-muted-foreground">Smart Investment App</p>
              </div>
            </div>
            <div className="trust-badge !px-2 !py-1">
              <span className="text-xs">🔒 Secured</span>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden xl:flex xl:w-72 xl:flex-col xl:fixed xl:inset-y-0 xl:z-50 xl:bg-card xl:border-r xl:border-border xl:shadow-sm">
        <div className="flex flex-col flex-1 p-6">
          <div className="mb-8">
            <div className="flex justify-center mb-2">
              <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-3 rounded-full shadow-lg">
                <img 
                  src="/piggy.png" 
                  alt="Piggy UPI" 
                  className="w-16 h-16 object-contain filter drop-shadow-md"
                />
              </div>
            </div>
            <div className="mt-3">
              <TrustBadge />
            </div>
          </div>
          <BottomNavigation />
        </div>
        <div className="p-6 border-t border-border">
          <div className="text-center text-xs text-muted-foreground">
            <p className="mb-1">Regulated by SEBI • Powered by RBI</p>
            <p>Your investments are protected</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 xl:pl-72 pb-nav-mobile xl:pb-6 mobile-no-scroll">
        <div className="max-w-7xl mx-auto min-h-screen-mobile px-2 sm:px-4 xl:px-6">
          <div className="w-full overflow-hidden">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Mobile Navigation */}
      <div className="xl:hidden">
        <BottomNavigation />
      </div>
    </div>
  );
};

export default Layout;