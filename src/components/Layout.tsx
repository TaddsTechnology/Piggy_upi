import { Outlet } from "react-router-dom";
import BottomNavigation from "./BottomNavigation";
import TrustBadge from "./TrustBadge";

const Layout = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col xl:flex-row">
      {/* Mobile Header */}
      <header className="xl:hidden bg-card border-b border-border sticky top-0 z-40 backdrop-blur-sm bg-card/95">
        <div className="container-mobile !py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-heading font-bold text-primary">UPI Piggy</h2>
              <p className="text-xs text-muted-foreground">Smart Investment App</p>
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
            <h2 className="text-2xl font-heading font-bold text-primary mb-1">UPI Piggy</h2>
            <p className="text-sm text-muted-foreground">Smart Investment App</p>
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
      <main className="flex-1 xl:pl-72 pb-20 xl:pb-6">
        <div className="max-w-7xl mx-auto min-h-screen">
          <Outlet />
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