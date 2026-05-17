import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { motion } from "motion/react";
import { Building2, ShieldCheck, CreditCard, ClipboardCheck } from "lucide-react";

const LandingPage: React.FC = () => {
  const { user, login, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/dashboard" />;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full text-center space-y-8"
      >
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Building2 className="text-white w-8 h-8" />
          </div>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
          Next-Gen <span className="text-blue-600">PG Management</span> System
        </h1>
        
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Manage residents, payments, and maintenance request with ease. A modern solution for residential buildings and PG facilities.
        </p>

        <div className="flex justify-center pt-4">
          <button
            onClick={login}
            className="group relative px-8 py-4 bg-gray-900 text-white rounded-2xl font-semibold text-lg hover:bg-gray-800 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 overflow-hidden"
          >
            <div className="relative z-10 flex items-center">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6 mr-3" />
              Continue with Google
            </div>
            <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-10 transition-opacity" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
          <FeatureCard 
            icon={<ShieldCheck className="w-6 h-6 text-blue-600" />}
            title="Secure Login"
            description="Role-based access control for Admins and Residents."
          />
          <FeatureCard 
            icon={<CreditCard className="w-6 h-6 text-blue-600" />}
            title="Payment Tracking"
            description="Automatic invoices, overdue alerts, and digital receipts."
          />
          <FeatureCard 
            icon={<ClipboardCheck className="w-6 h-6 text-blue-600" />}
            title="Maintenance"
            description="Quick complaint filing and status updates for residents."
          />
        </div>
      </motion.div>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string, description: string }> = ({ icon, title, description }) => (
  <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 text-left hover:shadow-md transition-shadow">
    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
  </div>
);

export default LandingPage;
