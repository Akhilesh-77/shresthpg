import React from "react";
import { useAuth } from "../lib/AuthContext";
import { User, Mail, Shield, Calendar, MapPin, Phone, Building2, CreditCard } from "lucide-react";
import { formatDate, cn } from "../lib/utils";

const Profile: React.FC = () => {
    const { profile, user } = useAuth();

    if (!profile) return null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex gap-6 items-center">
                    <div className="w-24 h-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-xl shadow-blue-100 shrink-0">
                        {user?.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover rounded-[2.5rem]" /> : <User className="w-10 h-10" />}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{profile.name}</h1>
                        <p className="text-gray-500">{profile.email}</p>
                        <div className="mt-3 flex gap-2">
                             <span className="bg-blue-50 text-blue-600 text-[10px] uppercase font-bold px-3 py-1 rounded-full border border-blue-100">{profile.role}</span>
                             {profile.role === "resident" && (
                                <span className={cn(
                                    "text-[10px] uppercase font-bold px-3 py-1 rounded-full border",
                                    (profile as any).status === "active" ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100"
                                )}>
                                    {(profile as any).status}
                                </span>
                             )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-3xl border border-[#e5e5e5] shadow-sm">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><User className="w-5 h-5 text-blue-600" /> Basic Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                            <InfoField label="Phone Number" value={(profile as any).phone || user?.phoneNumber || "N/A"} icon={<Phone className="w-4 h-4" />} />
                            <InfoField label="WhatsApp" value={(profile as any).whatsapp || "N/A"} />
                            <InfoField label="Father's Name" value={(profile as any).fatherName || "N/A"} />
                            <InfoField label="Aadhaar ID" value={(profile as any).aadhaarNumber || "N/A"} />
                            <InfoField label="Joining Date" value={formatDate(profile.createdAt)} icon={<Calendar className="w-4 h-4" />} />
                            <InfoField label="Email" value={profile.email} icon={<Mail className="w-4 h-4" />} />
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-[#e5e5e5] shadow-sm">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><MapPin className="w-5 h-5 text-blue-600" /> Address Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Permanent Address</label>
                                <p className="text-gray-700 leading-relaxed">{(profile as any).permanentAddress || "N/A"}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Current Address</label>
                                <p className="text-gray-700 leading-relaxed">{(profile as any).currentAddress || "N/A"}</p>
                            </div>
                        </div>
                    </div>
                 </div>

                 <div className="space-y-6">
                    {profile.role === "resident" && (
                        <div className="bg-blue-600 p-8 rounded-3xl text-white shadow-xl shadow-blue-100">
                            <div className="flex items-center justify-between mb-8">
                                <Building2 className="w-8 h-8 opacity-50" />
                                <span className="bg-white/20 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-widest">Stay Info</span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-blue-100 text-sm">Room Assignment</p>
                                <p className="text-3xl font-bold">{(profile as any).roomId ? `Room ${(profile as any).roomId}` : "Unassigned"}</p>
                            </div>
                            <div className="mt-8 pt-8 border-t border-white/10 flex justify-between">
                                 <div>
                                    <p className="text-blue-100 text-[10px] uppercase font-bold tracking-wider">Month Rent</p>
                                    <p className="text-xl font-bold">{(profile as any).rentAmount || "--"}</p>
                                 </div>
                                 <div className="text-right">
                                    <p className="text-blue-100 text-[10px] uppercase font-bold tracking-wider">Security Deposit</p>
                                    <p className="text-xl font-bold">{(profile as any).depositAmount || "--"}</p>
                                 </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white p-8 rounded-3xl border border-[#e5e5e5] shadow-sm">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><Shield className="w-5 h-5 text-blue-600" /> Account Security</h2>
                        <div className="space-y-4 text-sm">
                            <p className="text-gray-600">Your account is secured with Google OAuth.</p>
                            <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-500 uppercase">Verification</span>
                                <span className={cn(
                                    "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                                    (profile as any).idVerificationStatus === "verified" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                                )}>
                                    {(profile as any).idVerificationStatus || "N/A"}
                                </span>
                            </div>
                        </div>
                    </div>
                 </div>
            </div>
        </div>
    );
};

const InfoField: React.FC<{ label: string, value: string, icon?: any }> = ({ label, value, icon }) => (
    <div className="space-y-1">
        <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">{label}</label>
        <div className="flex items-center gap-2">
            {icon && <span className="text-gray-300 shrink-0">{icon}</span>}
            <p className="text-gray-900 font-medium truncate">{value}</p>
        </div>
    </div>
);

export default Profile;
