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

export function Login() {
  const [isRegistering, setIsRegistering] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const initializeProfile = async (user: any) => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        email: user.email || 'Invitado',
        displayName: user.displayName || 'Estudiante',
        photoURL: user.photoURL || '',
        theme: 'dark',
        notificationLevel: 'subtle'
      });

      // Initialize default careers
      const careersRef = doc(db, `users/${user.uid}/careers/ingles`);
      await setDoc(careersRef, { name: 'Inglés', type: 'trimester' });
      
      const medRef = doc(db, `users/${user.uid}/careers/medicina`);
      await setDoc(medRef, { name: 'Medicina', type: 'semester' });
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await initializeProfile(result.user);
    } catch (error) {
      console.error("Error logging in:", error);
      toast.error("Error al iniciar sesión con Google");
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Intentando autenticación...', { email, isRegistering });
    
    if (!email || !password) {
      toast.error("Completa todos los campos para continuar");
      return;
    }
    
    setLoading(true);
    try {
      if (isRegistering) {
        const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await initializeProfile(result.user);
        toast.success("Cuenta creada con éxito");
      } else {
        const result = await signInWithEmailAndPassword(auth, email.trim(), password);
        console.log('Login exitoso:', result.user.uid);
        await initializeProfile(result.user);
        toast.success("Sesión iniciada");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      let msg = "Error en la autenticación";
      if (error.code === 'auth/invalid-credential') msg = "Credenciales inválidas";
      if (error.code === 'auth/wrong-password') msg = "Contraseña incorrecta";
      if (error.code === 'auth/user-not-found') msg = "Usuario no encontrado";
      if (error.code === 'auth/email-already-in-use') msg = "El correo ya está en uso";
      if (error.code === 'auth/weak-password') msg = "La contraseña es muy débil";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      const result = await signInAnonymously(auth);
      await initializeProfile(result.user);
      toast.success("Entrando como invitado");
    } catch (error) {
      console.error("Skip error:", error);
      toast.error("Error al omitir el inicio de sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#bb86fc]/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#03dac6]/10 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-block p-4 rounded-3xl bg-[#16161d] border border-[#27272a] shadow-2xl mb-6"
          >
            <GraduationCap size={48} className="text-[#bb86fc]" />
          </motion.div>
          <h1 className="text-4xl font-black tracking-tighter text-[#e4e4e7] mb-2 uppercase">
            STELLAR<span className="text-[#bb86fc]"> STUDY</span>
          </h1>
          <p className="text-[#a1a1aa] text-[9px] font-black tracking-[0.4em] uppercase opacity-70">
            Elite Academic Management
          </p>
        </div>

        <Card className="bg-[#16161d] border-[#27272a] shadow-2xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="pt-10 pb-4 text-center">
            <CardTitle className="text-2xl font-black uppercase tracking-tighter text-[#e4e4e7]">
              {isRegistering ? 'CREAR CUENTA' : 'BIENVENIDO'}
            </CardTitle>
            <CardDescription className="text-[#a1a1aa] text-[10px] font-bold uppercase tracking-widest">
              {isRegistering ? 'Regístrate para guardar tu progreso' : 'Inicia sesión para continuar'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4 flex flex-col gap-6">
            <form onSubmit={handleEmailAuth} className="flex flex-col gap-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a1a1aa]" size={18} />
                <Input 
                  type="email" 
                  placeholder="CORREO ELECTRÓNICO" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-14 h-14 bg-[#0a0a0c] border-[#27272a] rounded-2xl text-xs font-bold tracking-widest focus:ring-[#bb86fc] focus:border-[#bb86fc]/50 uppercase"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a1a1aa]" size={18} />
                <Input 
                  type="password" 
                  placeholder="CONTRASEÑA" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-14 h-14 bg-[#0a0a0c] border-[#27272a] rounded-2xl text-xs font-bold tracking-widest focus:ring-[#bb86fc] focus:border-[#bb86fc]/50 uppercase"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-2xl bg-[#bb86fc] hover:bg-[#bb86fc]/90 text-[#0a0a0c] font-black text-xs tracking-[0.2em] uppercase transition-all mt-2 shadow-[0_8px_30px_rgb(187,134,252,0.2)]"
              >
                {loading ? 'PROCESANDO...' : (isRegistering ? 'REGISTRARSE' : 'ENTRAR')}
              </Button>
            </form>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#27272a]" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
                <span className="bg-[#16161d] px-2 text-[#a1a1aa]">O continuar con</span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleGoogleLogin}
              className="w-full h-12 rounded-xl border-[#27272a] bg-transparent text-[#e4e4e7] font-bold text-xs tracking-widest uppercase hover:bg-[#27272a]"
            >
              Google
            </Button>

            <div className="flex flex-col gap-3 mt-2">
              <button 
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-[10px] text-[#bb86fc] font-black uppercase tracking-widest hover:underline"
              >
                {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
              </button>
              
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="w-full h-10 text-[#a1a1aa] hover:text-[#e4e4e7] font-black text-[10px] uppercase tracking-widest group"
              >
                Omitir por ahora <ArrowRight size={14} className="ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
