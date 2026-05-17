import React, { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { Floor } from "../types";
import { Layers, Plus, Trash2, Edit2, X, Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

const FloorManagement: React.FC = () => {
  const [floors, setFloors] = useState<Floor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFloor, setEditingFloor] = useState<Floor | null>(null);
  const [formData, setFormData] = useState({ name: "", number: 0, totalRooms: 0, notes: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "floors"), orderBy("number", "asc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setFloors(snap.docs.map(d => ({ id: d.id, ...d.data() } as Floor)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFloor) {
        await updateDoc(doc(db, "floors", editingFloor.id), formData);
      } else {
        await addDoc(collection(db, "floors"), formData);
      }
      setIsModalOpen(false);
      setEditingFloor(null);
      setFormData({ name: "", number: 0, totalRooms: 0, notes: "" });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this floor?")) {
      await deleteDoc(doc(db, "floors", id));
    }
  };

  const openEdit = (f: Floor) => {
    setEditingFloor(f);
    setFormData({ name: f.name, number: f.number, totalRooms: f.totalRooms, notes: f.notes || "" });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Floor Management</h1>
          <p className="text-gray-500">Manage all floors in your building.</p>
        </div>
        <button 
          onClick={() => { setIsModalOpen(true); setEditingFloor(null); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
        >
          <Plus className="w-4 h-4" /> Add Floor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
           [1,2,3].map(i => <div key={i} className="h-48 bg-white rounded-3xl animate-pulse" />)
        ) : floors.map(floor => (
          <motion.div 
            layout
            key={floor.id} 
            className="bg-white p-6 rounded-3xl border border-[#e5e5e5] shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                <Layers className="w-6 h-6" />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(floor)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(floor.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900">{floor.name}</h3>
            <p className="text-sm text-gray-500 font-medium">Floor #{floor.number}</p>
            
            <div className="mt-6 flex items-center justify-between py-3 border-t border-gray-50">
               <div>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Rooms</p>
                  <p className="text-lg font-bold text-gray-900">{floor.totalRooms}</p>
               </div>
               <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Capacity</p>
                  <p className="text-lg font-bold text-gray-900">100%</p>
               </div>
            </div>
            {floor.notes && <p className="mt-4 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg italic">"{floor.notes}"</p>}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold">{editingFloor ? "Edit Floor" : "Add New Floor"}</h2>
                <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6 text-gray-400" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Floor Name</label>
                  <input 
                    required 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Ground Floor, 1st Floor" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Floor Number</label>
                    <input 
                      type="number" 
                      required 
                      value={formData.number} 
                      onChange={e => setFormData({...formData, number: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Total Rooms</label>
                    <input 
                      type="number" 
                      required 
                      value={formData.totalRooms} 
                      onChange={e => setFormData({...formData, totalRooms: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Notes (Optional)</label>
                  <textarea 
                    value={formData.notes} 
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                    rows={3} 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
                  />
                </div>
                <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100">
                  {editingFloor ? "Update Floor" : "Create Floor"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloorManagement;
