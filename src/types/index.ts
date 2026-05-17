export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: "admin" | "resident";
  createdAt: any;
}

export interface Resident {
  id: string;
  uid: string;
  fullName: string;
  fatherName: string;
  email: string;
  phone: string;
  whatsapp: string;
  aadhaarNumber: string;
  panNumber?: string;
  photoUrl?: string;
  aadhaarUrl?: string;
  panUrl?: string;
  joiningDate: string;
  joiningTime: string;
  floorId: string;
  roomId: string;
  rentAmount: number;
  depositAmount: number;
  status: "active" | "inactive";
  idVerificationStatus: "pending" | "verified" | "rejected";
  emergencyContactName: string;
  emergencyContactNumber: string;
  foodPreference?: string;
  medicalNotes?: string;
}

export interface Floor {
  id: string;
  number: number;
  name: string;
  totalRooms: number;
  notes?: string;
}

export interface Room {
  id: string;
  roomNumber: string;
  floorId: string;
  capacity: number;
  currentOccupancy: number;
  rent: number;
  deposit: number;
  type: "AC" | "Non-AC";
  bathroom: "Attached" | "Shared";
  furnished: "Furnished" | "Semi-Furnished" | "Unfurnished";
  status: "vacant" | "occupied" | "reserved" | "maintenance";
}

export interface Payment {
  id: string;
  residentId: string;
  month: string;
  amount: number;
  status: "paid" | "pending" | "overdue" | "partial";
  dueDate: string;
  paymentDate?: string;
  paymentMode?: string;
  receiptUrl?: string;
  invoiceNumber: string;
  notes?: string;
}

export interface Complaint {
  id: string;
  residentId: string;
  title: string;
  category: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in-progress" | "resolved" | "closed";
  photoUrl?: string;
  createdAt: any;
  resolvedAt?: any;
  resolutionNotes?: string;
  assignedTo?: string;
}

export interface Notice {
  id: string;
  title: string;
  message: string;
  priority: "normal" | "urgent";
  createdAt: any;
  attachments?: string[];
}

export interface Facility {
  id: string;
  name: string;
  description?: string;
  status: "available" | "maintenance" | "unavailable";
  charge?: number;
  includedInRent: boolean;
}

export interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: any;
}
