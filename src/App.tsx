import React, { useState, useEffect } from 'react';
import { auth, db } from '@/src/lib/firebase';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { ThemeProvider, useTheme } from '@/src/components/theme/ThemeProvider';
import { BottomNav } from '@/src/components/layout/BottomNav';
import { CareerDashboard } from '@/src/components/views/CareerDashboard';
import { MasterCalendar } from '@/src/components/views/MasterCalendar';
import { ProfileSettings } from '@/src/components/views/ProfileSettings';
import { Login } from '@/src/components/auth/Login';
import { UserProfile } from '@/src/types';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'motion/react';
import { handleFirestoreError, OperationType } from '@/src/lib/firestoreErrorHandler';

function AppContent() {
  const [hasStarted, setHasStarted] = useState(() => {
    return localStorage.getItem('stellar_started') === 'true';
  });
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('calendario');
  const [loading, setLoading] = useState(true);
  const { setTheme } = useTheme();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u && hasStarted) {
        signInAnonymously(auth).catch((err) => {
          console.warn("Auth anónima desactivada, usando ID local persistente:", err);
          // Si falla la auth, simulamos un usuario con un ID guardado en localStorage
          let localId = localStorage.getItem('stellar_guest_id');
          if (!localId) {
            localId = 'guest_' + Math.random().toString(36).substring(2, 11);
            localStorage.setItem('stellar_guest_id', localId);
          }
          setUser({ uid: localId } as User);
        });
      }
      if (!u && !hasStarted) {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [hasStarted]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const path = `users/${user.uid}`;
    const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        setProfile({ ...data, uid: user.uid });
        if (data.theme) setTheme(data.theme);
        setLoading(false);
      } else {
        // Initialize default profile transparently
        const defaultProfile = {
          uid: user.uid,
          displayName: 'Estudiante Stellar',
          email: 'invitado@stellar.app',
          career: 'Ingeniería',
          period: 1,
          theme: 'dark'
        };
        
        // We do the write outside of this callback if possible, or handle it as a fire-and-forget
        setDoc(doc(db, 'users', user.uid), defaultProfile).catch(e => {
           console.warn("No se pudo guardar el perfil en Firestore (posible falta de permisos):", e);
        });
        setProfile(defaultProfile as UserProfile);
        setLoading(false);
      }
    }, (error) => {
      // For guest users, permission errors are expected if they aren't fully initialized
      // We log them but don't re-throw to allow the fallback profile to work.
      if (user.uid.startsWith('guest_')) {
        console.warn("Guest profile error (expected if new):", error.message);
      } else {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      }
      
      // Fallback for safety - prevents white screen
      if (!profile) {
        const fallbackProfile: UserProfile = {
          uid: user.uid,
          displayName: user.displayName || 'Estudiante (Invitado)',
          email: user.email || 'guest@stellar.app',
          career: 'Ingeniería',
          period: 1,
          theme: 'dark'
        };
        setProfile(fallbackProfile);
      }
      setLoading(false);
    });

    return () => unsubProfile();
  }, [user, setTheme]);

  const handleStart = async () => {
    setLoading(true);
    try {
      await signInAnonymously(auth);
      localStorage.setItem('stellar_started', 'true');
      setHasStarted(true);
    } catch (error: any) {
      console.error("Error signing in:", error);
      if (error.code === 'auth/admin-restricted-operation') {
        toast.error("El inicio anónimo está desactivado en Firebase Console. Por favor, actívalo en Authentication > Sign-in method.");
        // Even if auth fails, we let them enter so they can see the UI, 
        // though Firestore might block writes depending on rules.
        localStorage.setItem('stellar_started', 'true');
        setHasStarted(true);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!hasStarted) {
    return <Login onStart={handleStart} />;
  }

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c]">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1], 
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="w-12 h-12 bg-[#bb86fc]/20 border border-[#bb86fc]/40 rounded-xl"
        />
      </div>
    );
  }

  const renderContent = () => {
    if (!user) return null;
    switch (activeTab) {
      case 'ingles':
        return <CareerDashboard key="ingles" careerId="ingles" userId={user.uid} careerName="Inglés IUTSO" careerType="trimester" />;
      case 'medicina':
        return <CareerDashboard key="medicina" careerId="medicina" userId={user.uid} careerName="Medicina" careerType="semester" />;
      case 'calendario':
        return <MasterCalendar userId={user.uid} />;
      case 'perfil':
        return <ProfileSettings user={profile} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#e4e4e7] max-w-md mx-auto relative overflow-x-hidden selection:bg-[#bb86fc]/30">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
      
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      <Toaster position="top-center" />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
