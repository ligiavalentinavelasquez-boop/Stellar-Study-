import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { auth, db } from '@/src/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { GraduationCap, Mail, Lock, UserPlus, LogIn, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface LoginProps {
  onStart: () => void;
}

export function Login({ onStart }: LoginProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#bb86fc]/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#03dac6]/10 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm z-10 text-center"
      >
        <motion.div 
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="inline-block p-6 rounded-[2.5rem] bg-[#16161d] border border-[#27272a] shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-10"
        >
          <GraduationCap size={64} className="text-[#bb86fc]" />
        </motion.div>

        <h1 className="text-5xl font-black tracking-tighter text-[#e4e4e7] mb-3 uppercase leading-[0.9]">
          STELLAR<br />
          <span className="text-[#bb86fc]">STUDY</span>
        </h1>
        
        <p className="text-[#a1a1aa] text-[11px] font-black tracking-[0.5em] uppercase opacity-70 mb-12">
          Elite Academic Management
        </p>

        <div className="space-y-4">
          <Button
            onClick={onStart}
            className="w-full h-16 rounded-2xl bg-[#bb86fc] hover:bg-[#bb86fc]/90 text-[#0a0a0c] font-black text-sm tracking-[0.25em] uppercase transition-all shadow-[0_10px_40px_rgba(187,134,252,0.3)] group"
          >
            Empezar
            <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
          </Button>

          <p className="text-[9px] text-[#a1a1aa] font-bold uppercase tracking-widest opacity-40 px-8 leading-relaxed">
            Tu progreso se guardará localmente en este dispositivo.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
