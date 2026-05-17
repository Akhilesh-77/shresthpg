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
        
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-gray-900 leading-[0.9]">
          SHRESTH <br/><span className="text-blue-600">SIGNATURE PG</span>
        </h1>
        
        <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium">
          Premium residency experience with digital management. <br className="hidden md:block" /> Smart tracking, WhatsApp support, and seamless payments.
        </p>

        <div className="flex flex-col items-center gap-4 pt-4">
          <button
            onClick={login}
            className="group relative w-full max-w-sm px-8 py-5 bg-blue-600 text-white rounded-3xl font-bold text-lg hover:bg-blue-700 transition-all duration-300 shadow-xl shadow-blue-100 flex items-center justify-center active:scale-95"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6 mr-3 bg-white p-1 rounded-full text-black" />
            Continue with Google
          </button>
          <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Enterprise PG Solutions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
          <FeatureCard 
            icon={<ShieldCheck className="w-6 h-6 text-blue-600" />}
            title="Mobile First"
            description="Installable PWA that feels like a native app on your home screen."
          />
          <FeatureCard 
            icon={<CreditCard className="w-6 h-6 text-blue-600" />}
            title="WhatsApp Alerts"
            description="Instant issue reporting to admin via WhatsApp Business API."
          />
          <FeatureCard 
            icon={<Building2 className="w-6 h-6 text-blue-600" />}
            title="Premium Stay"
            description="Modern room management and resolution tracking for residents."
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
