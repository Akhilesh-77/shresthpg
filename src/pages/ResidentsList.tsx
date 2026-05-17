import React, { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, getDocs, doc, updateDoc, onSnapshot, query, orderBy, where } from "firebase/firestore";
import { Resident, Room, Floor } from "../types";
import { Users, Search, Filter, MoreVertical, Eye, Phone, MapPin, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn, formatDate } from "../lib/utils";

const ResidentsList: React.FC = () => {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRoom, setFilterRoom] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);

  useEffect(() => {
    // Fetch related data
    getDocs(collection(db, "rooms")).then(snap => setRooms(snap.docs.map(d => ({ id: d.id, ...d.data() } as Room))));
    getDocs(collection(db, "floors")).then(snap => setFloors(snap.docs.map(d => ({ id: d.id, ...d.data() } as Floor))));

    const q = query(collection(db, "residents"), orderBy("fullName", "asc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setResidents(snap.docs.map(d => ({ id: d.id, ...d.data() } as Resident)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleVerify = async (id: string, status: "verified" | "rejected") => {
    try {
      await updateDoc(doc(db, "residents", id), { idVerificationStatus: status });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredResidents = residents.filter(res => {
    const matchesSearch = res.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          res.phone.includes(searchTerm) || 
                          res.aadhaarNumber.includes(searchTerm);
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Residents Information</h1>
          <p className="text-gray-500">View and manage resident profiles and verification.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    type="text"
                    placeholder="Search name, phone or aadhaar..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
                />
            </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[#e5e5e5] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-400 uppercase font-bold tracking-wider">
                <th className="px-6 py-4">Resident</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Room / Floor</th>
                <th className="px-6 py-4">Verification</th>
                <th className="px-6 py-4">Joining Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [1,2,3,4,5].map(i => <tr key={i} className="animate-pulse"><td colSpan={6} className="h-16 bg-gray-50/50" /></tr>)
              ) : filteredResidents.map(res => (
                <tr key={res.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 overflow-hidden">
                        {res.photoUrl ? <img src={res.photoUrl} alt="" className="w-full h-full object-cover" /> : <Users className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{res.fullName}</p>
                        <p className="text-xs text-gray-400">{res.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="flex items-center text-gray-600 gap-1"><Phone className="w-3 h-3" /> {res.phone}</div>
                      <div className="text-xs text-gray-400 truncate w-32">{res.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                       <p className="font-medium text-gray-900">Room: {rooms.find(r => r.id === res.roomId)?.roomNumber || "Unassigned"}</p>
                       <p className="text-xs text-gray-500">{floors.find(f => f.id === res.floorId)?.name || ""}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <span className={cn(
                         "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full",
                         res.idVerificationStatus === "verified" ? "bg-green-100 text-green-700" :
                         res.idVerificationStatus === "pending" ? "bg-amber-100 text-amber-700" :
                         "bg-red-100 text-red-700"
                       )}>
                         {res.idVerificationStatus}
                       </span>
                       {res.idVerificationStatus === "pending" && (
                         <div className="flex gap-1">
                           <button onClick={() => handleVerify(res.id, "verified")} className="text-green-600 hover:bg-green-50 p-1 rounded-md"><CheckCircle className="w-4 h-4" /></button>
                           <button onClick={() => handleVerify(res.id, "rejected")} className="text-red-600 hover:bg-red-50 p-1 rounded-md"><XCircle className="w-4 h-4" /></button>
                         </div>
                       )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(res.joiningDate)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                         onClick={() => setSelectedResident(res)}
                         className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedResident && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setSelectedResident(null)}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh]"
                >
                    <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex items-center justify-between z-10">
                        <h2 className="text-xl font-bold">Resident Details</h2>
                        <button onClick={() => setSelectedResident(null)}><XCircle className="w-6 h-6 text-gray-400" /></button>
                    </div>
                    <div className="p-8 space-y-8">
                        <div className="flex items-center gap-6">
                             <div className="w-24 h-24 bg-gray-100 rounded-3xl overflow-hidden flex items-center justify-center shrink-0">
                                {selectedResident.photoUrl ? <img src={selectedResident.photoUrl} className="w-full h-full object-cover" /> : <Users className="w-10 h-10 text-gray-300" />}
                             </div>
                             <div>
                                <h3 className="text-2xl font-bold text-gray-900">{selectedResident.fullName}</h3>
                                <p className="text-gray-500">{selectedResident.email}</p>
                                <div className="mt-2 flex gap-2">
                                    <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">{selectedResident.id}</span>
                                    <span className="bg-green-50 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">{selectedResident.status}</span>
                                </div>
                             </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="space-y-4">
                                <DetailItem label="Father's Name" value={selectedResident.fatherName} />
                                <DetailItem label="Aadhaar Number" value={selectedResident.aadhaarNumber} />
                                <DetailItem label="PAN Number" value={selectedResident.panNumber || "N/A"} />
                                <DetailItem label="Joining Date" value={formatDate(selectedResident.joiningDate)} />
                             </div>
                             <div className="space-y-4">
                                <DetailItem label="Phone" value={selectedResident.phone} icon={<Phone className="w-4 h-4" />} />
                                <DetailItem label="WhatsApp" value={selectedResident.whatsapp} />
                                <DetailItem label="Permanent Address" value={selectedResident.permanentAddress} icon={<MapPin className="w-4 h-4" />} />
                                <DetailItem label="Emergency Contact" value={`${selectedResident.emergencyContactName} (${selectedResident.emergencyContactNumber})`} />
                             </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex items-center justify-between">
                             <div>
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Stay Information</p>
                                <p className="text-lg font-bold">Room {rooms.find(r => r.id === selectedResident.roomId)?.roomNumber || "Unassigned"}</p>
                             </div>
                             <div className="text-right">
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Rent / Deposit</p>
                                <p className="text-lg font-bold text-blue-600">{selectedResident.rentAmount ? `${selectedResident.rentAmount} / ${selectedResident.depositAmount}` : "Not set"}</p>
                             </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DetailItem: React.FC<{ label: string, value: string, icon?: any }> = ({ label, value, icon }) => (
    <div>
        <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">{label}</label>
        <div className="flex items-center gap-2 mt-1">
            {icon && <span className="text-gray-400">{icon}</span>}
            <p className="text-gray-900 font-medium">{value}</p>
        </div>
    </div>
);

export default ResidentsList;
