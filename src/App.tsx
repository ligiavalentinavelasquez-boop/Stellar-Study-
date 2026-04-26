import React, { useState, useEffect } from 'react';
import { auth, db } from '@/src/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { ThemeProvider, useTheme } from '@/src/components/theme/ThemeProvider';
import { BottomNav } from '@/src/components/layout/BottomNav';
import { CareerDashboard } from '@/src/components/views/CareerDashboard';
import { MasterCalendar } from '@/src/components/views/MasterCalendar';
import { ProfileSettings } from '@/src/components/views/ProfileSettings';
import { Login } from '@/src/components/auth/Login';
import { UserProfile } from '@/src/types';
import { Toaster } from '@/components/ui/sonner';
import { AnimatePresence, motion } from 'motion/react';
import { handleFirestoreError, OperationType } from '@/src/lib/firestoreErrorHandler';

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('calendario');
  const { setTheme } = useTheme();

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const path = `users/${user.uid}`;
    const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        setProfile({ ...data, uid: user.uid });
        if (data.theme) setTheme(data.theme);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });

    return () => unsubProfile();
  }, [user, setTheme]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c]">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1], 
            rotate: [0, 90, 180, 270, 360],
            borderRadius: ["20%", "50%", "20%"] 
          }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="w-12 h-12 bg-[#bb86fc]/20 border border-[#bb86fc]/40"
        />
      </div>
    );
  }

  if (!user || !profile) {
    return <Login />;
  }

  const renderContent = () => {
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
