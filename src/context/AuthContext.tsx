import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider, testConnection } from '../firebase';
import { UserProfile } from '../types';
import { INITIAL_ADMIN_EMAIL, isUserAdmin } from '../services/adminService';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  effectiveIsAdmin: boolean;
  viewMode: 'admin' | 'user';
  setViewMode: (mode: 'admin' | 'user') => void;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfileData: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userProfile: null,
  isAdmin: false,
  effectiveIsAdmin: false,
  viewMode: 'admin',
  setViewMode: () => {},
  loading: true,
  loginWithGoogle: async () => {},
  logout: async () => {},
  updateProfileData: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'admin' | 'user'>('admin');
  const [loading, setLoading] = useState<boolean>(true);

  // Test connection on boot
  useEffect(() => {
    testConnection();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userDocRef);
          
          // Determine admin status
          const isInitial = user.email?.toLowerCase() === INITIAL_ADMIN_EMAIL.toLowerCase();
          const adminCheck = isInitial || (await isUserAdmin(user.uid, user.email));
          setIsAdmin(adminCheck);

          // If admin, guarantee admin doc exists with UID
          if (adminCheck) {
            try {
              await setDoc(doc(db, 'admins', user.uid), {
                email: user.email?.toLowerCase() || '',
                name: user.displayName || 'ผู้ดูแลระบบ',
                roleLevel: isInitial ? 'super_admin' : 'admin',
                updatedAt: new Date().toISOString()
              }, { merge: true });
            } catch (e) {
              console.warn('Could not sync admin document for uid:', e);
            }
          }

          if (userSnap.exists()) {
            const data = userSnap.data();
            if (adminCheck && data.role !== 'admin') {
              try {
                await updateDoc(userDocRef, { role: 'admin', updatedAt: new Date().toISOString() });
              } catch (e) { /* ignore */ }
            }
            setUserProfile({
              uid: user.uid,
              email: user.email || '',
              displayName: data.displayName || user.displayName || 'ผู้ใช้งาน',
              photoURL: data.photoURL || user.photoURL || '',
              phoneNumber: data.phoneNumber || '',
              studentOrStaffId: data.studentOrStaffId || '',
              department: data.department || 'ภาควิชาเทคโนโลยีการศึกษา',
              role: adminCheck ? 'admin' : (data.role || 'user'),
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
            });
          } else {
            // Auto create profile on first login
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || 'ผู้ใช้งาน',
              photoURL: user.photoURL || '',
              phoneNumber: user.phoneNumber || '',
              studentOrStaffId: '',
              department: 'ภาควิชาเทคโนโลยีการศึกษา',
              role: adminCheck ? 'admin' : 'user',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (error) {
          console.error('Error fetching/creating user profile:', error);
          // Fallback local profile
          const isInitial = user.email?.toLowerCase() === INITIAL_ADMIN_EMAIL.toLowerCase();
          setIsAdmin(isInitial);
          setUserProfile({
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'ผู้ใช้งาน',
            photoURL: user.photoURL || '',
            role: isInitial ? 'admin' : 'user',
            department: 'ภาควิชาเทคโนโลยีการศึกษา',
          });
        }
      } else {
        setUserProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUserProfile(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Sign-Out Error:', error);
      throw error;
    }
  };

  const updateProfileData = async (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const cleanUpdates = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      await updateDoc(userDocRef, cleanUpdates);
      setUserProfile(prev => prev ? { ...prev, ...cleanUpdates } : null);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const effectiveIsAdmin = isAdmin && viewMode === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAdmin,
        effectiveIsAdmin,
        viewMode,
        setViewMode,
        loading,
        loginWithGoogle,
        logout,
        updateProfileData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
