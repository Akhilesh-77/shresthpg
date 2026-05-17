import React, { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, addDoc, getDocs, doc, updateDoc, onSnapshot, query, orderBy, where } from "firebase/firestore";
import { Complaint, Resident } from "../types";
import { MessageSquare, Plus, CheckCircle2, Clock, AlertCircle, X, Camera, Send } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn, formatDate } from "../lib/utils";
import { useAuth } from "../lib/AuthContext";

const ComplaintManagement: React.FC = () => {
  const { profile } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: "", category: "Maintenance", description: "", priority: "medium" });
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");

  useEffect(() => {
    getDocs(collection(db, "residents")).then(snap => setResidents(snap.docs.map(d => ({ id: d.id, ...d.data() } as Resident))));

    const q = profile?.role === "admin" 
        ? query(collection(db, "complaints"), orderBy("createdAt", "desc"))
        : query(collection(db, "complaints"), where("residentId", "==", profile?.uid), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snap) => {
      setComplaints(snap.docs.map(d => ({ id: d.id, ...d.data() } as Complaint)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      await addDoc(collection(db, "complaints"), {
        ...formData,
        residentId: profile.role === "admin" ? "ADMIN_RAISED" : profile.uid,
        status: "open",
        createdAt: new Date().toISOString()
      });
      setIsModalOpen(false);
      setFormData({ title: "", category: "Maintenance", description: "", priority: "medium" });
    } catch (err) { console.error(err); }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "complaints", id), { 
        status, 
        resolutionNotes: resolutionNote,
        resolvedAt: status === "resolved" ? new Date().toISOString() : null
      });
      setSelectedComplaint(null);
      setResolutionNote("");
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Maintenance & Complaints</h1>
          <p className="text-gray-500">Raise requests and track resolution progress.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
        >
          <Plus className="w-4 h-4" /> New Request
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
             [1,2,3].map(i => <div key={i} className="h-48 bg-white rounded-3xl animate-pulse" />)
          ) : complaints.length > 0 ? complaints.map(complaint => (
            <motion.div 
               layout
               key={complaint.id} 
               onClick={() => setSelectedComplaint(complaint)}
               className="bg-white p-6 rounded-3xl border border-[#e5e5e5] shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col"
            >
               <div className="flex items-start justify-between mb-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    complaint.status === "open" ? "bg-red-50 text-red-600" :
                    complaint.status === "in-progress" ? "bg-blue-50 text-blue-600" :
                    "bg-green-50 text-green-600"
                  )}>
                    {complaint.status === "open" ? <AlertCircle className="w-5 h-5" /> : 
                     complaint.status === "in-progress" ? <Clock className="w-5 h-5" /> : 
                     <CheckCircle2 className="w-5 h-5" />}
                  </div>
                  <span className={cn(
                    "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full",
                    complaint.priority === "urgent" ? "bg-red-100 text-red-700" :
                    complaint.priority === "high" ? "bg-orange-100 text-orange-700" :
                    "bg-gray-100 text-gray-700"
                  )}>
                    {complaint.priority}
                  </span>
               </div>
               
               <h3 className="font-bold text-gray-900 mb-1 truncate">{complaint.title}</h3>
               <p className="text-xs text-gray-500 mb-4 line-clamp-2">{complaint.description}</p>
               
               <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                  <span className="font-medium text-gray-500">{complaint.category}</span>
                  <span>{formatDate(complaint.createdAt)}</span>
               </div>
               
               <div className="mt-2 flex items-center justify-between">
                  <p className="text-[10px] font-mono text-gray-400">
                    {profile?.role === "admin" ? residents.find(r => r.uid === complaint.residentId)?.fullName || "Unknown" : "My Request"}
                  </p>
                  <span className="text-[10px] uppercase font-bold text-blue-600">{complaint.status}</span>
               </div>
            </motion.div>
          )) : (
            <div className="col-span-full py-12 text-center text-gray-400">No complaints filed yet.</div>
          )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">New Complaint</h2>
                  <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6 text-gray-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Complaint Title</label>
                        <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Category</label>
                            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none">
                                <option>Maintenance</option>
                                <option>Cleanliness</option>
                                <option>Noise</option>
                                <option>Food</option>
                                <option>Internet</option>
                                <option>Security</option>
                                <option>Others</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Priority</label>
                            <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none">
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Description</label>
                        <textarea required rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none resize-none" />
                    </div>
                    <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 flex items-center justify-center gap-2">
                        <Send className="w-4 h-4" /> Submit Request
                    </button>
                </form>
            </motion.div>
          </div>
        )}

        {selectedComplaint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedComplaint(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedComplaint.title}</h2>
                    <p className="text-gray-500 text-sm">{selectedComplaint.category} • {formatDate(selectedComplaint.createdAt)}</p>
                  </div>
                  <button onClick={() => setSelectedComplaint(null)}><X className="w-6 h-6 text-gray-400" /></button>
                </div>
                
                <div className="space-y-6">
                    <p className="text-gray-700 leading-relaxed">{selectedComplaint.description}</p>
                    
                    {selectedComplaint.resolutionNotes && (
                        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                            <h4 className="text-xs font-bold text-blue-600 uppercase mb-1">Resolution Update</h4>
                            <p className="text-sm text-blue-800">{selectedComplaint.resolutionNotes}</p>
                            {selectedComplaint.resolvedAt && <p className="text-[10px] text-blue-400 mt-2">Resolved on {formatDate(selectedComplaint.resolvedAt)}</p>}
                        </div>
                    )}

                    {profile?.role === "admin" && (
                        <div className="space-y-4 pt-4 border-t border-gray-50">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Update Resolution Notes</label>
                                <textarea 
                                    value={resolutionNote} 
                                    onChange={e => setResolutionNote(e.target.value)} 
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none resize-none" 
                                    placeholder="Add notes for the resident..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => updateStatus(selectedComplaint.id, "in-progress")} className="py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200">Set In-Progress</button>
                                <button onClick={() => updateStatus(selectedComplaint.id, "resolved")} className="py-3 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700">Mark Resolved</button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ComplaintManagement;
