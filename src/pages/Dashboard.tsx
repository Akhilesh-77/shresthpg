import React, { useEffect, useState } from "react";
import { useAuth } from "../lib/AuthContext";
import { collection, query, getDocs, where, limit, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import { 
  Users, 
  DoorOpen, 
  DoorClosed, 
  CreditCard, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  TrendingUp,
  MessageSquare
} from "lucide-react";
import { motion } from "motion/react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { formatCurrency, cn } from "../lib/utils";
import { Navigate, useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    
    // If resident and no profile data beyond basic auth, redirect to enroll
    if (profile.role === "resident" && !profile.id) {
       // navigate("/enroll"); // We'll handle this in the component body
    }

    const fetchStats = async () => {
      try {
        if (profile.role === "admin") {
          const [resSnap, roomSnap, paySnap, compSnap] = await Promise.all([
            getDocs(collection(db, "residents")),
            getDocs(collection(db, "rooms")),
            getDocs(collection(db, "payments")),
            getDocs(collection(db, "complaints"))
          ]);

          const residents = resSnap.docs.map(d => d.data());
          const rooms = roomSnap.docs.map(d => d.data());
          const payments = paySnap.docs.map(d => d.data());
          const complaints = compSnap.docs.map(d => d.data());

          setStats({
            totalResidents: residents.length,
            occupiedRooms: rooms.filter(r => r.status === "occupied").length,
            vacantRooms: rooms.filter(r => r.status === "vacant").length,
            pendingPayments: payments.filter(p => p.status === "pending").length,
            overduePayments: payments.filter(p => p.status === "overdue").length,
            openComplaints: complaints.filter(c => c.status === "open").length,
            totalRevenue: payments.filter(p => p.status === "paid").reduce((acc, p) => acc + (p.amount || 0), 0),
            occupancyRate: rooms.length > 0 ? Math.round((rooms.filter(r => r.status === "occupied").length / rooms.length) * 100) : 0,
            chartData: [
              { name: "Paid", value: payments.filter(p => p.status === "paid").length },
              { name: "Pending", value: payments.filter(p => p.status === "pending").length },
              { name: "Overdue", value: payments.filter(p => p.status === "overdue").length }
            ]
          });
        } else {
          // Resident stats
          const [paySnap, compSnap] = await Promise.all([
            getDocs(query(collection(db, "payments"), where("residentId", "==", profile.uid))),
            getDocs(query(collection(db, "complaints"), where("residentId", "==", profile.uid)))
          ]);
          
          setStats({
            payments: paySnap.docs.map(d => ({ id: d.id, ...d.data() })),
            complaints: compSnap.docs.map(d => ({ id: d.id, ...d.data() })),
            id: (profile as any).id
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [profile]);

  if (loading) return <div>Loading...</div>;
  
  if (profile?.role === "resident" && !stats?.id) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-3xl border border-gray-100 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
            <BadgeInfo className="text-blue-600 w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold">Welcome!</h2>
        <p className="text-gray-600 max-w-md">You haven't completed your enrollment yet. Please provide your details to access all features.</p>
        <button 
          onClick={() => navigate("/enroll")}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          Complete Enrollment
        </button>
      </div>
    );
  }

  if (profile?.role === "admin") {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase">Dashboard</h1>
            <p className="text-gray-500 text-sm">Welcome back, {profile.name} • Shresth Signature PG</p>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
            <TrendingUp className="w-4 h-4" />
            System Live
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<Users />} label="Total Residents" value={stats.totalResidents} color="blue" />
          <StatCard icon={<DoorOpen />} label="Occupied Rooms" value={stats.occupiedRooms} color="green" />
          <StatCard icon={<DoorClosed />} label="Vacant Rooms" value={stats.vacantRooms} color="amber" />
          <StatCard icon={<AlertCircle />} label="Open Complaints" value={stats.openComplaints} color="red" />
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
           <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Actions</h2>
           <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <QuickActionBtn label="Add Resident" onClick={() => navigate("/residents")} bg="bg-blue-600" />
              <QuickActionBtn label="Generate Dues" onClick={() => navigate("/payments")} bg="bg-indigo-600" />
              <QuickActionBtn label="Post Notice" onClick={() => navigate("/notices")} bg="bg-purple-600" />
              <QuickActionBtn label="View Reports" onClick={() => navigate("/reports")} bg="bg-emerald-600" />
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-[#e5e5e5] shadow-sm">
            <h2 className="font-bold text-lg mb-6">Revenue Summary</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: "Jan", revenue: 45000 },
                  { name: "Feb", revenue: 52000 },
                  { name: "Mar", revenue: 48000 },
                  { name: "Apr", revenue: 61000 },
                  { name: "May", revenue: stats.totalRevenue }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip 
                    cursor={{ fill: '#f9fafb' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#e5e5e5] shadow-sm">
            <h2 className="font-bold text-lg mb-6">Payment Status</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#f59e0b" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
               <LegendItem color="bg-green-500" label="Paid" value={stats.chartData[0].value} />
               <LegendItem color="bg-amber-500" label="Pending" value={stats.chartData[1].value} />
               <LegendItem color="bg-red-500" label="Overdue" value={stats.chartData[2].value} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Resident Dashboard
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase">My Residency</h1>
        <p className="text-gray-500 text-sm">Welcome back, {profile?.name} • Shresth Signature PG</p>
      </div>

      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
           <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Actions</h2>
           <div className="grid grid-cols-2 gap-3">
              <QuickActionBtn label="Pay Rent" onClick={() => navigate("/payments")} bg="bg-blue-600" icon={<CreditCard className="w-5 h-5"/>} />
              <QuickActionBtn label="Raise Issue" onClick={() => navigate("/complaints")} bg="bg-red-500" icon={<AlertCircle className="w-5 h-5"/>} />
           </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-[#e5e5e5] shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-lg">My Payments</h2>
            <CreditCard className="text-gray-400 w-5 h-5" />
          </div>
          <div className="space-y-4">
            {stats.payments.length > 0 ? stats.payments.slice(0, 3).map((p: any) => (
              <div key={p.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div>
                  <p className="font-semibold text-gray-900">{p.month}</p>
                  <p className="text-xs text-gray-500">Due: {p.dueDate}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatCurrency(p.amount)}</p>
                  <span className={cn(
                    "text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full",
                    p.status === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                  )}>
                    {p.status}
                  </span>
                </div>
              </div>
            )) : <p className="text-gray-500 text-sm text-center py-4">No payment records found.</p>}
          </div>
          <button onClick={() => navigate("/payments")} className="w-full mt-6 py-3 text-sm font-semibold text-blue-600 border border-blue-100 rounded-xl hover:bg-blue-50 transition-colors">
            View All Payments
          </button>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#e5e5e5] shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-lg">Active Complaints</h2>
            <MessageSquare className="text-gray-400 w-5 h-5" />
          </div>
          <div className="space-y-4">
            {stats.complaints.length > 0 ? stats.complaints.slice(0, 3).map((c: any) => (
              <div key={c.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  c.status === "open" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                )}>
                  {c.status === "open" ? <Clock className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{c.title}</p>
                  <p className="text-xs text-gray-500">{c.category} • {c.priority}</p>
                </div>
                <span className="text-[10px] uppercase font-bold text-gray-400">{c.status}</span>
              </div>
            )) : <p className="text-gray-500 text-sm text-center py-4">No active complaints.</p>}
          </div>
          <button onClick={() => navigate("/complaints")} className="w-full mt-6 py-3 text-sm font-semibold text-blue-600 border border-blue-100 rounded-xl hover:bg-blue-50 transition-colors">
            Raise A Complaint
          </button>
        </div>
      </div>
    </div>
  );
};

const QuickActionBtn: React.FC<{ label: string, onClick: () => void, bg: string, icon?: any }> = ({ label, onClick, bg, icon }) => (
    <button 
        onClick={onClick}
        className={cn("p-6 rounded-3xl text-white flex flex-col items-center justify-center gap-2 transition-all active:scale-95 shadow-lg", bg)}
    >
        {icon && <div className="mb-1">{icon}</div>}
        <span className="text-sm font-bold tracking-tight">{label}</span>
    </button>
);

const StatCard: React.FC<{ icon: any, label: string, value: any, color: "blue" | "green" | "amber" | "red" }> = ({ icon, label, value, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    red: "bg-red-50 text-red-600 border-red-100"
  };
  
  return (
    <div className="bg-white p-6 rounded-3xl border border-[#e5e5e5] shadow-sm flex items-center gap-4">
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border", colors[color])}>
        {React.cloneElement(icon, { className: "w-6 h-6" })}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

const LegendItem: React.FC<{ color: string, label: string, value: number }> = ({ color, label, value }) => (
  <div className="flex items-center justify-between text-sm">
    <div className="flex items-center">
      <div className={cn("w-3 h-3 rounded-full mr-2", color)} />
      <span className="text-gray-600">{label}</span>
    </div>
    <span className="font-bold text-gray-900">{value}</span>
  </div>
);

const BadgeInfo: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
);

export default Dashboard;
