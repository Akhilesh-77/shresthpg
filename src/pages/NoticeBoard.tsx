import React, { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, onSnapshot, query, orderBy } from "firebase/firestore";
import { Notice } from "../types";
import { Bell, Plus, Trash2, X, Megaphone, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn, formatDate } from "../lib/utils";
import { useAuth } from "../lib/AuthContext";

const NoticeBoard: React.FC = () => {
  const { profile } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: "", message: "", priority: "normal" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "notices"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setNotices(snap.docs.map(d => ({ id: d.id, ...d.data() } as Notice)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "notices"), {
        ...formData,
        createdAt: new Date().toISOString()
      });
      setIsModalOpen(false);
      setFormData({ title: "", message: "", priority: "normal" });
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this notice?")) {
      await deleteDoc(doc(db, "notices", id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notice Board</h1>
          <p className="text-gray-500">Official announcements and building alerts.</p>
        </div>
        {profile?.role === "admin" && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
          >
            <Plus className="w-4 h-4" /> Create Notice
          </button>
        )}
      </div>

      <div className="space-y-4">
          {loading ? (
             [1,2].map(i => <div key={i} className="h-32 bg-white rounded-3xl animate-pulse" />)
          ) : notices.length > 0 ? notices.map(notice => (
            <motion.div 
               layout
               key={notice.id} 
               className={cn(
                 "bg-white p-6 rounded-3xl border shadow-sm transition-all group relative overflow-hidden",
                 notice.priority === "urgent" ? "border-red-100 bg-red-50/10" : "border-[#e5e5e5]"
               )}
            >
               {notice.priority === "urgent" && (
                 <div className="absolute top-0 right-0 px-3 py-1 bg-red-600 text-white text-[10px] uppercase font-bold rounded-bl-xl tracking-widest flex items-center gap-1">
                   <Megaphone className="w-3 h-3" /> Urgent
                 </div>
               )}
               
               <div className="flex items-start gap-6">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                    notice.priority === "urgent" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                  )}>
                    <Bell className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                         <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{notice.title}</h3>
                         {profile?.role === "admin" && (
                            <button onClick={() => handleDelete(notice.id)} className="p-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 className="w-4 h-4" />
                            </button>
                         )}
                    </div>
                    <p className="mt-2 text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{notice.message}</p>
                    <div className="mt-4 flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                         <Calendar className="w-3 h-3" />
                         {formatDate(notice.createdAt)}
                    </div>
                  </div>
               </div>
            </motion.div>
          )) : (
            <div className="py-20 text-center space-y-4 bg-white rounded-3xl border border-dashed border-gray-200">
                <Megaphone className="w-12 h-12 text-gray-200 mx-auto" />
                <p className="text-gray-500">No notices currently posted.</p>
            </div>
          )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">New Notice</h2>
                  <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6 text-gray-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Notice Title</label>
                        <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Priority</label>
                        <div className="flex gap-2">
                           {["normal", "urgent"].map(p => (
                             <button 
                                key={p} type="button" 
                                onClick={() => setFormData({...formData, priority: p} as any)}
                                className={cn("flex-1 py-2 rounded-xl border text-sm transition-all capitalize", formData.priority === p ? "bg-blue-600 border-blue-600 text-white font-bold" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300")}
                             >
                               {p}
                             </button>
                           ))}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Message</label>
                        <textarea required rows={5} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none resize-none" />
                    </div>
                    <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all">
                        Post Announcement
                    </button>
                </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NoticeBoard;
