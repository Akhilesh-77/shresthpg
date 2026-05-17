import React, { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, addDoc, getDocs, doc, updateDoc, onSnapshot, query, orderBy, where, writeBatch } from "firebase/firestore";
import { Payment, Resident } from "../types";
import { CreditCard, Plus, Filter, Search, Download, CheckCircle2, Clock, AlertCircle, FileText, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn, formatCurrency } from "../lib/utils";
import { useAuth } from "../lib/AuthContext";

const PaymentManagement: React.FC = () => {
  const { profile } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterMonth, setFilterMonth] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    getDocs(collection(db, "residents")).then(snap => setResidents(snap.docs.map(d => ({ id: d.id, ...d.data() } as Resident))));

    const q = profile?.role === "admin" 
        ? query(collection(db, "payments"), orderBy("dueDate", "desc"))
        : query(collection(db, "payments"), where("residentId", "==", profile?.uid), orderBy("dueDate", "desc"));

    const unsubscribe = onSnapshot(q, (snap) => {
      setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Payment)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [profile]);

  const markAsPaid = async (id: string) => {
    if (!window.confirm("Mark this payment as paid?")) return;
    try {
      await updateDoc(doc(db, "payments", id), { 
        status: "paid", 
        paymentDate: new Date().toISOString(),
        paymentMode: "UPI"
      });
    } catch (err) { console.error(err); }
  };

  const handleBulkGenerate = async () => {
    const month = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!window.confirm(`Generate invoices for ${month} for all active residents?`)) return;
    
    setIsGenerating(true);
    try {
        const batch = writeBatch(db);
        const activeResidents = residents.filter(r => r.status === "active");
        
        for (const res of activeResidents) {
            const newPaymentRef = doc(collection(db, "payments"));
            batch.set(newPaymentRef, {
                residentId: res.id,
                month: month,
                amount: res.rentAmount || 8000,
                status: "pending",
                dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 10).toISOString().split('T')[0],
                invoiceNumber: `INV-${Date.now()}-${res.id}`
            });
        }
        await batch.commit();
        alert("Invoices generated successfully!");
    } catch (err) {
        console.error(err);
        alert("Error generating invoices.");
    } finally { setIsGenerating(false); }
  };

  const filteredPayments = payments.filter(p => {
    if (filterMonth && !p.month.includes(filterMonth)) return false;
    if (filterStatus && p.status !== filterStatus) return false;
    return true;
  });

  const exportReport = async () => {
    const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            data: filteredPayments,
            type: "csv",
            filename: `payments_${new Date().toISOString()}.csv`
        })
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments_${new Date().toISOString()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments & Invoices</h1>
          <p className="text-gray-500">Track rent collections and payment history.</p>
        </div>
        {profile?.role === "admin" && (
            <div className="flex items-center gap-2">
                <button 
                  onClick={exportReport} 
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-4 h-4" /> Export
                </button>
                <button 
                  disabled={isGenerating}
                  onClick={handleBulkGenerate}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" /> {isGenerating ? "Generating..." : "Generate Monthlies"}
                </button>
            </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
          <select 
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
              <option value="">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
          </select>
          <input 
            type="text" 
            placeholder="Filter month (e.g. May)..." 
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-48"
          />
      </div>

      <div className="grid grid-cols-1 gap-4">
          {loading ? (
             [1,2,3].map(i => <div key={i} className="h-24 bg-white rounded-3xl animate-pulse" />)
          ) : filteredPayments.length > 0 ? filteredPayments.map(payment => (
            <motion.div 
               layout
               key={payment.id} 
               className="bg-white p-6 rounded-3xl border border-[#e5e5e5] shadow-sm flex flex-col md:flex-row md:items-center gap-6 group hover:shadow-md transition-shadow"
            >
               <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                  <FileText className="w-6 h-6" />
               </div>
               
               <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900">{payment.month}</h3>
                    <span className={cn(
                        "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full",
                        payment.status === "paid" ? "bg-green-100 text-green-700" :
                        payment.status === "pending" ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                    )}>
                        {payment.status}
                    </span>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                     <span>Resident: <span className="font-medium text-gray-700">{residents.find(r => r.id === payment.residentId)?.fullName || "Unknown"}</span></span>
                     <span>Due Date: <span className="font-medium text-gray-700">{payment.dueDate}</span></span>
                     <span className="text-xs font-mono text-gray-400">{payment.invoiceNumber}</span>
                  </div>
               </div>

               <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2 border-t md:border-t-0 border-gray-50 pt-4 md:pt-0">
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(payment.amount)}</p>
                  <div className="flex items-center gap-2">
                    {profile?.role === "admin" && payment.status !== "paid" && (
                        <button onClick={() => markAsPaid(payment.id)} className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-colors">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Mark Paid
                        </button>
                    )}
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Download className="w-5 h-5" />
                    </button>
                  </div>
               </div>
            </motion.div>
          )) : (
            <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-center space-y-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                    <CreditCard className="text-gray-300 w-8 h-8" />
                </div>
                <div>
                    <h3 className="text-lg font-bold">No payments found</h3>
                    <p className="text-gray-500">Change your filters or generate new invoices to see records.</p>
                </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default PaymentManagement;
