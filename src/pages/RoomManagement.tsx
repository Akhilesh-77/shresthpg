import React, { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, onSnapshot, query, orderBy, where } from "firebase/firestore";
import { Room, Floor } from "../types";
import { DoorClosed, Plus, Trash2, Edit2, X, Search, Filter } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn, formatCurrency } from "../lib/utils";

const RoomManagement: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    roomNumber: "",
    floorId: "",
    capacity: 2,
    rent: 8000,
    deposit: 10000,
    type: "Non-AC",
    bathroom: "Attached",
    furnished: "Semi-Furnished",
    status: "vacant"
  });
  const [loading, setLoading] = useState(true);
  const [filterFloor, setFilterFloor] = useState("");

  useEffect(() => {
    // Fetch floors for selection
    getDocs(collection(db, "floors")).then(snap => {
      setFloors(snap.docs.map(d => ({ id: d.id, ...d.data() } as Floor)));
    });

    const q = query(collection(db, "rooms"), orderBy("roomNumber", "asc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setRooms(snap.docs.map(d => ({ id: d.id, ...d.data() } as Room)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...formData, currentOccupancy: editingRoom?.currentOccupancy || 0 };
      if (editingRoom) {
        await updateDoc(doc(db, "rooms", editingRoom.id), data);
      } else {
        await addDoc(collection(db, "rooms"), data);
      }
      setIsModalOpen(false);
      setEditingRoom(null);
      setFormData({ 
        roomNumber: "", floorId: "", capacity: 2, rent: 8000, deposit: 10000, 
        type: "Non-AC", bathroom: "Attached", furnished: "Semi-Furnished", status: "vacant" 
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      await deleteDoc(doc(db, "rooms", id));
    }
  };

  const openEdit = (r: Room) => {
    setEditingRoom(r);
    setFormData({
      roomNumber: r.roomNumber,
      floorId: r.floorId,
      capacity: r.capacity,
      rent: r.rent,
      deposit: r.deposit,
      type: r.type,
      bathroom: r.bathroom,
      furnished: r.furnished,
      status: r.status
    });
    setIsModalOpen(true);
  };

  const filteredRooms = filterFloor ? rooms.filter(r => r.floorId === filterFloor) : rooms;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Room Management</h1>
          <p className="text-gray-500">Add, edit and monitor room capacity.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select 
                    value={filterFloor} 
                    onChange={e => setFilterFloor(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    <option value="">All Floors</option>
                    {floors.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
            </div>
            <button 
                onClick={() => { setIsModalOpen(true); setEditingRoom(null); }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
            >
                <Plus className="w-4 h-4" /> Add Room
            </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[#e5e5e5] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-400 uppercase font-bold tracking-wider">
                <th className="px-6 py-4">Room #</th>
                <th className="px-6 py-4">Floor</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Occupancy</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">Rent</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [1,2,3,4,5].map(i => <tr key={i} className="animate-pulse"><td colSpan={7} className="h-16 bg-gray-50/50" /></tr>)
              ) : filteredRooms.map(room => (
                <tr key={room.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        <DoorClosed className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-gray-900">{room.roomNumber}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {floors.find(f => f.id === room.floorId)?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full",
                      room.status === "vacant" ? "bg-green-100 text-green-700" :
                      room.status === "occupied" ? "bg-blue-100 text-blue-700" :
                      "bg-amber-100 text-amber-700"
                    )}>
                      {room.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden w-24">
                          <div 
                            className={cn("h-full", room.currentOccupancy >= room.capacity ? "bg-red-500" : "bg-blue-600")}
                            style={{ width: `${(room.currentOccupancy / room.capacity) * 100}%` }}
                          />
                       </div>
                       <span className="text-xs font-bold text-gray-600">{room.currentOccupancy}/{room.capacity}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {room.type} • {room.bathroom}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">
                    {formatCurrency(room.rent)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(room)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(room.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold">{editingRoom ? "Edit Room" : "Add New Room"}</h2>
                <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6 text-gray-400" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Room Number" required value={formData.roomNumber} onChange={e => setFormData({...formData, roomNumber: e.target.value})} />
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Floor</label>
                    <select required value={formData.floorId} onChange={e => setFormData({...formData, floorId: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none">
                      <option value="">Select Floor</option>
                      {floors.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                  </div>
                  <Input label="Capacity" type="number" required value={formData.capacity} onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})} />
                  <Input label="Rent Amount" type="number" required value={formData.rent} onChange={e => setFormData({...formData, rent: parseInt(e.target.value)})} />
                  <Input label="Security Deposit" type="number" required value={formData.deposit} onChange={e => setFormData({...formData, deposit: parseInt(e.target.value)})} />
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Room Type</label>
                    <div className="flex gap-2">
                       {["AC", "Non-AC"].map(type => (
                         <button 
                            key={type} type="button" 
                            onClick={() => setFormData({...formData, type} as any)}
                            className={cn("px-4 py-2 rounded-xl border text-sm transition-all", formData.type === type ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300")}
                         >
                           {type}
                         </button>
                       ))}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Bathroom</label>
                    <div className="flex gap-2">
                       {["Attached", "Shared"].map(b => (
                         <button 
                            key={b} type="button" 
                            onClick={() => setFormData({...formData, bathroom: b} as any)}
                            className={cn("px-4 py-2 rounded-xl border text-sm transition-all", formData.bathroom === b ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300")}
                         >
                           {b}
                         </button>
                       ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Furnishing</label>
                    <select value={formData.furnished} onChange={e => setFormData({...formData, furnished: e.target.value} as any)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none">
                      <option value="Furnished">Furnished</option>
                      <option value="Semi-Furnished">Semi-Furnished</option>
                      <option value="Unfurnished">Unfurnished</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value} as any)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none">
                      <option value="vacant">Vacant</option>
                      <option value="occupied">Occupied</option>
                      <option value="reserved">Reserved</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full mt-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100">
                  {editingRoom ? "Update Room" : "Create Room"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Input: React.FC<any> = ({ label, ...props }) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <input
      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none hover:border-gray-300 transition-all"
      {...props}
    />
  </div>
);

export default RoomManagement;
