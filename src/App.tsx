/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import ResidentsList from "./pages/ResidentsList";
import FloorManagement from "./pages/FloorManagement";
import RoomManagement from "./pages/RoomManagement";
import PaymentManagement from "./pages/PaymentManagement";
import ComplaintManagement from "./pages/ComplaintManagement";
import NoticeBoard from "./pages/NoticeBoard";
import Profile from "./pages/Profile";
import EnrollmentForm from "./pages/EnrollmentForm";
import Reports from "./pages/Reports";
import Layout from "./components/Layout";

const ProtectedRoute: React.FC<{ children: React.ReactNode; role?: "admin" | "resident" }> = ({ children, role }) => {
  const { user, profile, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/" />;
  if (role && profile?.role !== role) return <Navigate to="/dashboard" />;

  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notices" element={<NoticeBoard />} />
            <Route path="/complaints" element={<ComplaintManagement />} />
            <Route path="/payments" element={<PaymentManagement />} />
            
            {/* Admin only */}
            <Route path="/residents" element={<ProtectedRoute role="admin"><ResidentsList /></ProtectedRoute>} />
            <Route path="/floors" element={<ProtectedRoute role="admin"><FloorManagement /></ProtectedRoute>} />
            <Route path="/rooms" element={<ProtectedRoute role="admin"><RoomManagement /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute role="admin"><Reports /></ProtectedRoute>} />
          </Route>

          <Route path="/enroll" element={<ProtectedRoute><EnrollmentForm /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
