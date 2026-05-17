import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { UserProfile } from "../types";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Fetch or create profile
        const docRef = doc(db, "admins", user.uid);
        const residentRef = doc(db, "residents", user.uid);
        
        let profileDoc = await getDoc(docRef);
        let currentProfile: UserProfile | null = null;

        if (profileDoc.exists()) {
          currentProfile = { uid: user.uid, ...profileDoc.data() } as UserProfile;
        } else {
          // Check if it's the bootstrapped admin
          if (user.email === "akhilesh27u@gmail.com") {
             const newProfile: UserProfile = {
                uid: user.uid,
                email: user.email!,
                name: user.displayName || "Admin",
                role: "admin",
                createdAt: new Date().toISOString()
             };
             await setDoc(docRef, newProfile);
             currentProfile = newProfile;
          } else {
            // Check resident
            const resDoc = await getDoc(residentRef);
            if (resDoc.exists()) {
              currentProfile = { uid: user.uid, ...resDoc.data(), role: "resident" } as any;
            } else {
               // Default to resident (unregistered)
               currentProfile = {
                  uid: user.uid,
                  email: user.email!,
                  name: user.displayName || "User",
                  role: "resident",
                  createdAt: new Date().toISOString()
               };
            }
          }
        }
        setProfile(currentProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
