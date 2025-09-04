import { NavLink } from "react-router-dom";
import { Home, BarChart3, PieChart, Trophy, Settings, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", icon: Home, label: "Smart SIP", shortLabel: "Smart" },
  { path: "/dashboard", icon: BarChart3, label: "Dashboard", shortLabel: "Home" },
  { path: "/markets", icon: TrendingUp, label: "Markets", shortLabel: "Markets" },
  { path: "/portfolio", icon: PieChart, label: "Portfolio", shortLabel: "Portfolio" },
  { path: "/rewards", icon: Trophy, label: "Rewards", shortLabel: "Rewards" },
];

const BottomNavigation = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-50 safe-area-padding-bottom xl:relative xl:bg-transparent xl:border-0 xl:backdrop-blur-none mobile-no-scroll">
      <div className="px-2 sm:px-4 py-2 xl:p-0">
        <div className="flex justify-around items-center xl:flex-col xl:items-stretch xl:space-y-2 xl:justify-start">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
            >
              {({ isActive }) => (
                <div
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 px-1 sm:px-2 py-2 rounded-lg transition-all duration-200 min-w-0 flex-1 max-w-[70px] sm:max-w-[80px] xl:max-w-none xl:flex-1-0 xl:flex-row xl:gap-3 xl:px-4 xl:py-3 xl:justify-start group relative tap-target",
                    isActive
                      ? "text-primary bg-primary/10 shadow-sm xl:bg-primary-light"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30 xl:hover:bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center transition-all duration-200",
                    "w-6 h-6 xl:w-8 xl:h-8 xl:rounded-lg"
                  )}>
                    <Icon 
                      size={18} 
                      className={cn(
                        "transition-all duration-200 xl:scale-110",
                        "group-hover:scale-110 xl:group-hover:scale-100"
                      )} 
                    />
                  </div>
                  <span className={cn(
                    "text-xs font-medium leading-tight text-center xl:text-sm xl:font-normal xl:text-left transition-all duration-200",
                    "truncate max-w-full text-mobile-responsive"
                  )}>
                    {label}
                  </span>
                  {/* Active indicator for mobile */}
                  <div className={cn(
                    "absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full transition-all duration-300 xl:hidden",
                    isActive ? "opacity-100 bg-primary" : "opacity-0"
                  )} />
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;