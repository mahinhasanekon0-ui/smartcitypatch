import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, ROOT_ADMIN_EMAIL } from '../lib/firebase';
import type { UserProfile } from '../lib/types';

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      unsubscribeProfile?.();
      setUser(firebaseUser);

      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const ref = doc(db, 'users', firebaseUser.uid);
      try {
        const snapshot = await getDoc(ref);
        if (!snapshot.exists()) {
          const email = firebaseUser.email ?? '';
          const newProfile: UserProfile = {
            name: firebaseUser.displayName || email.split('@')[0] || 'Citizen',
            email,
            role: 'receiver',
            phone: null,
            profileImage: firebaseUser.photoURL && firebaseUser.photoURL.length < 1000 ? firebaseUser.photoURL : null,
            createdAt: new Date().toISOString(),
          };
          await setDoc(ref, newProfile);
        }
      } catch (error) {
        console.error('Failed to load or create user profile', error);
      }

      unsubscribeProfile = onSnapshot(
        ref,
        (snap) => {
          setProfile(snap.exists() ? (snap.data() as UserProfile) : null);
          setLoading(false);
        },
        () => setLoading(false),
      );
    });

    return () => {
      unsubscribeProfile?.();
      unsubscribeAuth();
    };
  }, []);

  const isAdmin = user?.email === ROOT_ADMIN_EMAIL || profile?.role === 'admin';

  const value: AuthContextValue = {
    user,
    profile,
    loading,
    isAdmin,
    signIn: async () => {
      await signInWithPopup(auth, googleProvider);
    },
    logOut: () => signOut(auth),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
