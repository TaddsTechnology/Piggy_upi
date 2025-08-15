import { NavLink } from "react-router-dom";
import { Home, BarChart3, PieChart, Trophy, Settings, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/markets", icon: TrendingUp, label: "Markets" },
  { path: "/portfolio", icon: PieChart, label: "Portfolio" },
  { path: "/rewards", icon: Trophy, label: "Rewards" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

const BottomNavigation = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-50 xl:relative xl:bg-transparent xl:border-0 xl:backdrop-blur-none">
      <div className="container-mobile !py-3 xl:p-0">
        <div className="flex justify-between items-center xl:flex-col xl:items-stretch xl:space-y-2">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 xl:flex-row xl:gap-3 xl:px-4 xl:py-3 group relative",
                  isActive
                    ? "text-primary bg-primary-light shadow-sm scale-105 xl:scale-100"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:scale-105 xl:hover:scale-100"
                )
              }
            >
              <div className={cn(
                "flex items-center justify-center transition-all duration-300",
                "xl:w-8 xl:h-8 xl:rounded-lg"
              )}>
                <Icon size={20} className="transition-transform duration-300 group-hover:scale-110 xl:group-hover:scale-100" />
              </div>
              <span className="text-xs font-medium xl:text-sm xl:font-normal transition-all duration-300">
                {label}
              </span>
              {/* Active indicator for mobile */}
              <div className={cn(
                "absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full transition-all duration-300 xl:hidden",
                "opacity-0 bg-primary"
              )} />
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;