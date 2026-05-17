import React, { useState } from "react";
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
  Menu, 
  X, 
  User, 
  FileText,
  BadgeInfo
} from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";

const Layout: React.FC = () => {
  const { profile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const adminNav = [
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Residents", href: "/residents", icon: Users },
    { name: "Floors", href: "/floors", icon: Layers },
    { name: "Rooms", href: "/rooms", icon: DoorClosed },
    { name: "Payments", href: "/payments", icon: CreditCard },
    { name: "Complaints", href: "/complaints", icon: MessageSquare },
    { name: "Notices", href: "/notices", icon: Bell },
    { name: "Reports", href: "/reports", icon: FileText },
  ];

  const residentNav = [
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Payments", href: "/payments", icon: CreditCard },
    { name: "Complaints", href: "/complaints", icon: MessageSquare },
    { name: "Notices", href: "/notices", icon: Bell },
  ];

  const navItems = profile?.role === "admin" ? adminNav : residentNav;

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#1a1a1a] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#e5e5e5] h-screen sticky top-0">
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-tight text-blue-600">PG Manager</h1>
          <p className="text-xs text-gray-500 font-mono mt-1 uppercase tracking-widest">{profile?.role}</p>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors",
                location.pathname === item.href
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-[#e5e5e5]">
          <Link
            to="/profile"
            className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-50 mb-2"
          >
            <User className="w-5 h-5 mr-3" />
            Profile
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Top Nav */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="md:hidden bg-white border-b border-[#e5e5e5] py-4 px-6 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-lg font-bold text-blue-600">PG Manager</h1>
          <button onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
        </header>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/50 z-20 md:hidden"
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 w-72 bg-white z-30 md:hidden flex flex-col"
              >
                <div className="p-6 flex items-center justify-between border-b border-[#e5e5e5]">
                  <div>
                    <h1 className="text-xl font-bold text-blue-600">PG Manager</h1>
                    <p className="text-xs text-gray-500 font-mono mt-1 uppercase tracking-widest">{profile?.role}</p>
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(false)}>
                    <X className="w-6 h-6 text-gray-600" />
                  </button>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors",
                        location.pathname === item.href
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </Link>
                  ))}
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-50"
                  >
                    <User className="w-5 h-5 mr-3" />
                    Profile
                  </Link>
                </nav>
                <div className="p-6 border-t border-[#e5e5e5]">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Logout
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
