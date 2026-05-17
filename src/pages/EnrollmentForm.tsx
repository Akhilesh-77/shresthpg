import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "../lib/AuthContext";
import { db, storage } from "../lib/firebase";
import { doc, getDocs, collection, setDoc, query, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { User, Phone, Mail, Home, CreditCard, Calendar, Upload, CheckCircle2 } from "lucide-react";
import { cn } from "../lib/utils";
import { Floor, Room } from "../types";

const enrollmentSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  fatherName: z.string().min(3, "Father's name is required"),
  gender: z.enum(["Male", "Female", "Other"]),
  dob: z.string().min(1, "Date of birth is required"),
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
  whatsapp: z.string().regex(/^\d{10}$/, "WhatsApp must be 10 digits"),
  email: z.string().email("Invalid email"),
  permanentAddress: z.string().min(10, "Address is too short"),
  currentAddress: z.string().min(10, "Address is too short"),
  aadhaarNumber: z.string().regex(/^\d{12}$/, "Aadhaar must be 12 digits"),
  panNumber: z.string().optional(),
  emergencyContactName: z.string().min(3, "Emergency contact name is required"),
  emergencyContactNumber: z.string().regex(/^\d{10}$/, "Emergency contact number must be 10 digits"),
  joiningDate: z.string().min(1, "Joining date is required"),
  joiningTime: z.string().min(1, "Joining time is required"),
  preferredRoomType: z.enum(["AC", "Non-AC"]),
  foodPreference: z.string().optional(),
  medicalNotes: z.string().optional(),
  agreement: z.boolean().refine(v => v === true, "You must accept the agreement"),
});

type EnrollmentData = z.infer<typeof enrollmentSchema>;

const EnrollmentForm: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  
  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm<EnrollmentData>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      email: user?.email || "",
      fullName: user?.displayName || "",
      agreement: false,
    }
  });

  useEffect(() => {
    // Fetch available rooms/floors for the form
    const fetchData = async () => {
        const floorSnap = await getDocs(collection(db, "floors"));
        const roomSnap = await getDocs(query(collection(db, "rooms"), where("status", "==", "vacant")));
        setFloors(floorSnap.docs.map(d => ({ id: d.id, ...d.data() } as Floor)));
        setRooms(roomSnap.docs.map(d => ({ id: d.id, ...d.data() } as Room)));
    };
    fetchData();
  }, []);

  const onSubmit = async (data: EnrollmentData) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
        const residentData = {
          ...data,
          uid: user.uid,
          id: `RES-${Math.floor(1000 + Math.random() * 9000)}`,
          status: "active",
          idVerificationStatus: "pending",
          createdAt: new Date().toISOString()
        };
        
        await setDoc(doc(db, "residents", user.uid), residentData);
        // Refresh profile via AuthContext (re-render triggered by state change)
        window.location.href = "/dashboard";
    } catch (err) {
        console.error(err);
        alert("Error saving data. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight">Resident Enrollment</h1>
        <p className="text-gray-500 mt-2">Please provide accurate details for registration.</p>
        
        <div className="flex items-center justify-center mt-8 gap-4">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all",
                step === s ? "bg-blue-600 text-white" : step > s ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400"
              )}>
                {step > s ? <CheckCircle2 className="w-6 h-6" /> : s}
              </div>
              {s < 3 && <div className={cn("w-12 h-0.5 mx-2", step > s ? "bg-green-500" : "bg-gray-100")} />}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-8 rounded-3xl border border-gray-100 shadow-xl overflow-hidden relative">
        {step === 1 && (
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2"><User className="text-blue-600 w-5 h-5"/> Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Full Name" {...register("fullName")} error={errors.fullName?.message} />
              <Input label="Father's / Guardian's Name" {...register("fatherName")} error={errors.fatherName?.message} />
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Gender</label>
                <select {...register("gender")} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <Input label="Date of Birth" type="date" {...register("dob")} error={errors.dob?.message} />
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={nextStep} className="px-8 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors">Next</button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2"><Phone className="text-blue-600 w-5 h-5"/> Contact & Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Mobile Number" {...register("phone")} error={errors.phone?.message} />
              <Input label="WhatsApp Number" {...register("whatsapp")} error={errors.whatsapp?.message} />
              <Input label="Email Address" {...register("email")} error={errors.email?.message} disabled />
            </div>
            <div className="space-y-4">
              <Input label="Permanent Address" {...register("permanentAddress")} error={errors.permanentAddress?.message} />
              <Input label="Current Address" {...register("currentAddress")} error={errors.currentAddress?.message} />
            </div>
            <div className="flex justify-between">
              <button type="button" onClick={prevStep} className="px-8 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors">Back</button>
              <button type="button" onClick={nextStep} className="px-8 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors">Next</button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2"><CreditCard className="text-blue-600 w-5 h-5"/> Documents & Preferred Stay</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Aadhaar Number" {...register("aadhaarNumber")} error={errors.aadhaarNumber?.message} />
              <Input label="PAN Number (Optional)" {...register("panNumber")} error={errors.panNumber?.message} />
              <Input label="Joining Date" type="date" {...register("joiningDate")} error={errors.joiningDate?.message} />
              <Input label="Joining Time" type="time" {...register("joiningTime")} error={errors.joiningTime?.message} />
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Room Type</label>
                <select {...register("preferredRoomType")} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                  <option value="AC">AC</option>
                  <option value="Non-AC">Non-AC</option>
                </select>
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-6">
               <h3 className="font-bold text-gray-900 mb-4">Emergency Contact</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <Input label="Contact Name" {...register("emergencyContactName")} error={errors.emergencyContactName?.message} />
                 <Input label="Contact Number" {...register("emergencyContactNumber")} error={errors.emergencyContactNumber?.message} />
               </div>
            </div>

            <div className="flex items-start gap-3 pt-4">
              <input type="checkbox" {...register("agreement")} className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              <span className="text-sm text-gray-600">I agree to the terms and conditions of the PG management and confirm that all information provided is accurate.</span>
            </div>
            {errors.agreement && <p className="text-xs text-red-500">{errors.agreement.message}</p>}

            <div className="flex justify-between pt-6">
              <button type="button" onClick={prevStep} className="px-8 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors">Back</button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={cn(
                  "px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200",
                  isSubmitting && "opacity-50 cursor-not-allowed"
                )}
              >
                {isSubmitting ? "Submitting..." : "Submit Enrollment"}
              </button>
            </div>
          </motion.div>
        )}
      </form>
    </div>
  );
};

const Input = React.forwardRef<HTMLInputElement, any>(({ label, error, ...props }, ref) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <input
      ref={ref}
      className={cn(
        "w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all",
        error ? "border-red-500 bg-red-50" : "hover:border-gray-300"
      )}
      {...props}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
));

export default EnrollmentForm;
