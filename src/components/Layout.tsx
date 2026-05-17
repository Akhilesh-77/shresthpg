import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
  BarChart3, 
  Users, 
  Layers, 
  DoorClosed, 
  CreditCard, 
  MessageSquare, 
  Bell, 
  LogOut, 
  User, 
  FileText,
  BadgeInfo,
  Building2
} from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { cn } from "../lib/utils";
import { motion } from "motion/react";

const Layout: React.FC = () => {
  const { profile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const adminNav = [
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Rooms", href: "/rooms", icon: DoorClosed },
    { name: "Payments", href: "/payments", icon: CreditCard },
    { name: "Support", href: "/complaints", icon: MessageSquare },
    { name: "Profile", href: "/profile", icon: User },
  ];

  const residentNav = [
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Status", href: "/dashboard", icon: BadgeInfo },
    { name: "Payment", href: "/payments", icon: CreditCard },
    { name: "Issue", href: "/complaints", icon: MessageSquare },
    { name: "Me", href: "/profile", icon: User },
  ];

  const adminSidebarNav = [
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Residents", href: "/residents", icon: Users },
    { name: "Floors", href: "/floors", icon: Layers },
    { name: "Rooms", href: "/rooms", icon: DoorClosed },
    { name: "Payments", href: "/payments", icon: CreditCard },
    { name: "Complaints", href: "/complaints", icon: MessageSquare },
    { name: "Notices", href: "/notices", icon: Bell },
    { name: "Reports", href: "/reports", icon: FileText },
  ];

  const navItems = profile?.role === "admin" ? adminNav : residentNav;
  const sidebarItems = profile?.role === "admin" ? adminSidebarNav : residentNav;

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-[#1a1a1a] flex flex-col md:flex-row h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-gray-100 h-screen sticky top-0 shrink-0">
        <div className="p-8">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                <Building2 className="w-6 h-6" />
             </div>
             <div>
                <h1 className="text-lg font-black tracking-tight leading-tight">Shresth</h1>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Signature PG</p>
             </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {sidebarItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-4 py-3.5 text-sm font-semibold rounded-2xl transition-all active:scale-[0.98]",
                location.pathname === item.href
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-gray-50 space-y-2">
          <Link
            to="/profile"
            className={cn(
                "flex items-center px-4 py-3 text-sm font-semibold rounded-2xl transition-all",
                location.pathname === "/profile" ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:bg-gray-50"
            )}
          >
            <User className="w-5 h-5 mr-3" />
            My Profile
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-semibold text-red-500 rounded-2xl hover:bg-red-50 transition-all font-sans"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden bg-white/80 backdrop-blur-xl border-b border-gray-100 py-4 px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                <Building2 className="w-5 h-5" />
             </div>
             <h1 className="text-sm font-black tracking-tight">SHRESTH SIGNATURE PG</h1>
          </div>
          <div className="flex items-center gap-3">
             <button className="p-2 bg-gray-50 rounded-full text-gray-400 focus:bg-blue-50 transition-colors"><Bell className="w-5 h-5" /></button>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <main className="flex-1 overflow-y-auto pb-24 md:pb-0 pt-2 md:pt-0 scrolling-touch">
          <div className="max-w-6xl mx-auto p-4 md:p-10">
            <Outlet />
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-2xl border-t border-gray-100 px-4 pt-2 pb-safe-area z-40 h-[72px] flex items-center justify-around">
            {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                    <Link
                        key={item.name}
                        to={item.href}
                        className={cn(
                            "flex flex-col items-center justify-center px-3 py-1 gap-1 relative min-w-[64px] transition-colors",
                            isActive ? "text-blue-600" : "text-gray-400"
                        )}
                    >
                        <motion.div
                            animate={isActive ? { y: -2, scale: 1.1 } : { y: 0, scale: 1 }}
                            className={cn(
                                "flex items-center justify-center",
                                isActive && "after:absolute after:-bottom-1 after:w-1 after:h-1 after:bg-blue-600 after:rounded-full"
                            )}
                        >
                            <item.icon className={cn("w-6 h-6", isActive ? "stroke-[2.5px]" : "stroke-2")} />
                        </motion.div>
                        <span className={cn("text-[10px] font-bold uppercase tracking-wider", isActive ? "opacity-100" : "opacity-60")}>
                            {item.name}
                        </span>
                    </Link>
                );
            })}
        </nav>
      </div>

      <style>{`
        .pb-safe-area {
            padding-bottom: calc(max(1rem, var(--sab)));
        }
        .scrolling-touch {
            -webkit-overflow-scrolling: touch;
        }
      `}</style>
    </div>
  );
};

export default Layout;
