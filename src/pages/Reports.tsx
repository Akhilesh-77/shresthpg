import React, { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Resident, Room, Payment, Complaint } from "../types";
import { FileText, Download, TrendingUp, Users, DoorOpen, BadgeAlert, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { formatCurrency, formatDate, cn } from "../lib/utils";

const Reports: React.FC = () => {
    const [data, setData] = useState<{
        residents: Resident[],
        rooms: Room[],
        payments: Payment[],
        complaints: Complaint[]
    }>({ residents: [], rooms: [], payments: [], complaints: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            const [resSnap, roomSnap, paySnap, compSnap] = await Promise.all([
                getDocs(collection(db, "residents")),
                getDocs(collection(db, "rooms")),
                getDocs(collection(db, "payments")),
                getDocs(collection(db, "complaints"))
            ]);

            setData({
                residents: resSnap.docs.map(d => d.data() as Resident),
                rooms: roomSnap.docs.map(d => d.data() as Room),
                payments: paySnap.docs.map(d => d.data() as Payment),
                complaints: compSnap.docs.map(d => d.data() as Complaint)
            });
            setLoading(false);
        };
        fetchAll();
    }, []);

    const exportToCSV = async (type: string) => {
        let exportData: any[] = [];
        let filename = `report_${type}.csv`;

        if (type === "residents") exportData = data.residents;
        if (type === "payments") exportData = data.payments;
        if (type === "rooms") exportData = data.rooms;
        if (type === "complaints") exportData = data.complaints;

        const response = await fetch("/api/export", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: exportData, type: "csv", filename })
        });
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
    };

    if (loading) return <div>Loading reports...</div>;

    const stats = [
        { label: "Occupancy Rate", value: `${Math.round((data.rooms.filter(r => r.status === "occupied").length / (data.rooms.length || 1)) * 100)}%`, icon: <DoorOpen />, color: "text-blue-600 bg-blue-50" },
        { label: "Collection (MTD)", value: formatCurrency(data.payments.filter(p => p.status === "paid").reduce((acc, p) => acc + p.amount, 0)), icon: <TrendingUp />, color: "text-green-600 bg-green-50" },
        { label: "Pending Dues", value: formatCurrency(data.payments.filter(p => p.status === "pending").reduce((acc, p) => acc + p.amount, 0)), icon: <BadgeAlert />, color: "text-amber-600 bg-amber-50" },
        { label: "Resolution Rate", value: `${Math.round((data.complaints.filter(c => c.status === "resolved").length / (data.complaints.length || 1)) * 100)}%`, icon: <CheckCircle2 />, color: "text-purple-600 bg-purple-50" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Reports & Analytics</h1>
                <p className="text-gray-500">Analyze performance and export data for your records.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-[#e5e5e5] shadow-sm flex items-center gap-4">
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", stat.color)}>
                            {React.cloneElement(stat.icon as any, { className: "w-6 h-6" })}
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ReportEntry 
                    title="Resident Ledger" 
                    description="Full list of all residents with status and verification info."
                    onExport={() => exportToCSV("residents")}
                />
                <ReportEntry 
                    title="Payment Collections" 
                    description="Detailed history of all rent, deposit and maintenance payments."
                    onExport={() => exportToCSV("payments")}
                />
                <ReportEntry 
                    title="Room Occupancy" 
                    description="Status of every room, its current occupants and availability."
                    onExport={() => exportToCSV("rooms")}
                />
                <ReportEntry 
                    title="Complaint History" 
                    description="Log of all maintenance requests, categories and resolution notes."
                    onExport={() => exportToCSV("complaints")}
                />
            </div>
        </div>
    );
};

const ReportEntry: React.FC<{ title: string, description: string, onExport: () => void }> = ({ title, description, onExport }) => (
    <div className="bg-white p-8 rounded-3xl border border-[#e5e5e5] shadow-sm hover:shadow-md transition-shadow flex items-start justify-between gap-6">
        <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
        </div>
        <button 
           onClick={onExport}
           className="p-4 bg-gray-50 text-gray-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all group shrink-0"
        >
            <Download className="w-6 h-6" />
        </button>
    </div>
);

export default Reports;
