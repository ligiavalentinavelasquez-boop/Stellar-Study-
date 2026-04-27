import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Moon, Sun, Bell, Shield, User as UserIcon, Quote, Trash2, Plus, Settings, MessageSquareQuote, RefreshCw, Pencil, Check, X } from 'lucide-react';
import { auth, db } from '@/src/lib/firebase';
import { signOut } from 'firebase/auth';
import { collection, doc, updateDoc, addDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { useTheme } from '@/src/components/theme/ThemeProvider';
import { UserProfile } from '@/src/types';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { handleFirestoreError, OperationType } from '@/src/lib/firestoreErrorHandler';
import { seedInglesData, seedMedicinaData, seedInglesActivities } from '@/src/lib/seedData';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProfileSettingsProps {
  user: UserProfile;
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const { theme, setTheme } = useTheme();
  const [quotes, setQuotes] = React.useState<{id: string, text: string}[]>([]);
  const [newQuote, setNewQuote] = React.useState('');
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [editingQuote, setEditingQuote] = React.useState<{id: string, text: string} | null>(null);
  const [isQuotesExpanded, setIsQuotesExpanded] = React.useState(false);
  const [tempName, setTempName] = React.useState(user.displayName || '');
  const [isEditingName, setIsEditingName] = React.useState(false);

  React.useEffect(() => {
    setTempName(user.displayName || '');
  }, [user.displayName]);

  React.useEffect(() => {
    if (!user.uid) return;
    const path = `users/${user.uid}/quotes`;
    const unsub = onSnapshot(collection(db, path), (snap) => {
      setQuotes(snap.docs.map(doc => ({ id: doc.id, text: doc.data().text })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
    return () => unsub();
  }, [user.uid]);

  const handleUpdateName = async () => {
    if (!tempName.trim()) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: tempName.trim()
      });
      setIsEditingName(false);
      toast.success('Nombre actualizado');
    } catch (error) {
      toast.error('Error al actualizar nombre');
    }
  };

  const handleAddQuote = async () => {
    if (!newQuote.trim()) return;
    try {
      await addDoc(collection(db, `users/${user.uid}/quotes`), {
        text: newQuote.trim(),
        createdAt: new Date().toISOString()
      });
      setNewQuote('');
      toast.success('Frase agregada');
    } catch (error) {
      console.error(error);
      toast.error('Error al agregar frase');
    }
  };

  const handleUpdateQuote = async () => {
    if (!editingQuote || !editingQuote.text.trim()) return;
    await updateDoc(doc(db, `users/${user.uid}/quotes`, editingQuote.id), {
      text: editingQuote.text.trim()
    });
    setEditingQuote(null);
    toast.success('Frase actualizada');
  };

  const handleDeleteQuote = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta frase?')) return;
    await deleteDoc(doc(db, `users/${user.uid}/quotes`, id));
    toast.success('Frase eliminada');
  };

  const handleLogout = () => signOut(auth);

  const handleSyncExcel = async () => {
    if (!confirm('¿Deseas sincronizar los datos con el Excel maestro? Esto reemplazará tus materias y plan de actividades actuales de Inglés.')) return;
    setIsSyncing(true);
    try {
      await seedInglesData(user.uid);
      await seedInglesActivities(user.uid);
      toast.success('Sincronización de Inglés completada');
    } catch (error) {
      toast.error('Error al sincronizar');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncMedicina = async () => {
    if (!confirm('¿Deseas sincronizar los datos de Medicina con el documento maestro? Esto reemplazará tus materias actuales.')) return;
    setIsSyncing(true);
    try {
      await seedMedicinaData(user.uid);
      toast.success('Sincronización de Medicina completada');
    } catch (error) {
      toast.error('Error al sincronizar Medicina');
    } finally {
      setIsSyncing(false);
    }
  };

  const updateNotificationLevel = (checked: boolean) => {
    const level = checked ? 'notorious' : 'subtle';
    if (user.uid) {
      updateDoc(doc(db, 'users', user.uid), { notificationLevel: level });
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-24 px-6 pt-8 max-w-sm mx-auto">
      <header className="flex flex-col items-center gap-4 py-8">
        <div className="relative">
          <Avatar className="w-28 h-28 border-4 border-[#1f1f27] shadow-2xl">
            <AvatarImage src={user.photoURL} />
            <AvatarFallback className="text-3xl bg-[#16161d] text-[#bb86fc] font-black">
              {user.displayName?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="absolute bottom-2 right-2 w-6 h-6 bg-[#03dac6] border-4 border-[#0a0a0c] rounded-full shadow-[0_0_15px_rgba(3,218,198,0.4)]" />
        </div>
        
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black tracking-tight text-[#e4e4e7] uppercase">
            {user.displayName || 'Estudiante'}
          </h1>
          <p className="text-[#a1a1aa] text-[9px] font-bold uppercase tracking-[0.3em] opacity-40">Configuración de Perfil</p>
        </div>
      </header>

      <div className="flex flex-col gap-10">
        {/* PERSONALIZACIÓN DE NOMBRE - TOP CARD */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-3 px-1">
            <UserIcon size={18} className="text-[#bb86fc]" />
            <span className="text-[10px] font-black tracking-[0.2em] text-[#e4e4e7] uppercase">Identidad</span>
          </div>
          <Card className="border border-white/5 bg-[#16161d] shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4">
                <div className="space-y-2">
                  <Label className="text-[9px] font-black text-[#a1a1aa] uppercase tracking-[0.2em] ml-1">Tu Nombre de Usuario</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      placeholder="Escribe tu nombre..."
                      className="h-12 bg-[#0a0a0c] border-white/5 text-[14px] font-bold rounded-2xl focus:border-[#bb86fc]/50 transition-all"
                    />
                    <Button 
                      onClick={handleUpdateName}
                      disabled={!tempName.trim() || tempName === user.displayName}
                      className="h-12 w-12 rounded-2xl bg-[#bb86fc] text-[#0a0a0c] font-black shadow-lg shadow-[#bb86fc]/20"
                    >
                      <Check size={20} />
                    </Button>
                  </div>
                  <p className="text-[8px] text-[#a1a1aa] font-medium uppercase tracking-widest leading-relaxed ml-1 pt-1 opacity-50">
                    Este nombre se usará en tus saludos diarios.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* FRASES SECTION - MODER ALMA DESIGN */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <MessageSquareQuote size={18} className="text-[#03dac6]" />
              <span className="text-[10px] font-black tracking-[0.2em] text-[#e4e4e7] uppercase">Frases del Alma</span>
            </div>
            <Badge variant="outline" className="text-[8px] border-[#03dac6]/30 text-[#03dac6] font-bold uppercase tracking-widest rounded-full px-2 py-0">
              {quotes.length} Guardadas
            </Badge>
          </div>
          
          <Card className="border border-white/5 bg-[#16161d] shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <div className="relative group">
                  <Input 
                    placeholder="Escribe una frase que te resuene..." 
                    value={newQuote}
                    onChange={(e) => setNewQuote(e.target.value)}
                    className="bg-[#0a0a0c] border-white/5 text-[12px] italic rounded-2xl h-14 pl-12 pr-4 shadow-inner transition-all focus:ring-1 focus:ring-[#03dac6]/30"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddQuote()}
                  />
                  <Quote className="absolute left-4 top-1/2 -translate-y-1/2 text-[#03dac6]/40" size={20} />
                </div>
                <Button 
                  onClick={handleAddQuote} 
                  disabled={!newQuote.trim()}
                  className="h-12 w-full rounded-2xl bg-[#03dac6]/10 hover:bg-[#03dac6]/20 text-[#03dac6] border border-[#03dac6]/20 font-black text-[10px] uppercase tracking-[0.25em] transition-all"
                >
                  <Plus size={16} className="mr-2" />
                  Agregar al Mazo
                </Button>
              </div>
              
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                {quotes.map((q) => (
                  <div key={q.id} className="relative p-5 rounded-2xl bg-[#1f1f27] group border border-white/5 hover:border-[#bb86fc]/20 transition-all duration-300">
                    {editingQuote?.id === q.id ? (
                      <div className="flex flex-col gap-3">
                        <Input 
                          value={editingQuote.text}
                          onChange={(e) => setEditingQuote({ ...editingQuote, text: e.target.value })}
                          className="bg-[#0a0a0c] border-[#bb86fc]/30 text-[12px] italic h-10 rounded-xl"
                          autoFocus
                        />
                        <div className="flex justify-end gap-2">
                          <Button size="sm" onClick={handleUpdateQuote} className="h-8 bg-[#bb86fc] text-[#0a0a0c] font-black uppercase text-[8px] px-4 rounded-lg">
                            Guardar
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingQuote(null)} className="h-8 text-[#a1a1aa] font-black uppercase text-[8px] rounded-lg">
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex gap-4">
                          <Quote size={16} className="text-[#bb86fc]/30 shrink-0 mt-1" />
                          <p className="text-[12px] text-[#e4e4e7] font-medium italic pr-10 leading-relaxed">"{q.text}"</p>
                        </div>
                        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                          <button onClick={() => setEditingQuote(q)} className="p-2 hover:bg-white/5 rounded-xl text-[#bb86fc] transition-colors">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleDeleteQuote(q.id)} className="p-2 hover:bg-white/5 rounded-xl text-destructive/70 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {quotes.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center gap-5 opacity-20">
                    <div className="w-20 h-20 rounded-full border-4 border-dashed border-muted-foreground/30 flex items-center justify-center">
                      <Quote size={32} className="text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-black uppercase tracking-[0.3em]">Mazo Vacío</p>
                      <p className="text-[9px] font-bold uppercase tracking-widest italic">Personaliza tu inspiración matutina</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CONFIGURACIÓN SECTION */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-3 px-1">
            <Settings size={18} className="text-[#bb86fc]" />
            <span className="text-[10px] font-black tracking-[0.2em] text-[#e4e4e7] uppercase">Pantalla</span>
          </div>
          <Card className="border border-white/10 bg-[#16161d] shadow-xl rounded-3xl w-full">
            <CardContent className="p-6 flex flex-col gap-5">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#bb86fc]/10 rounded-2xl flex items-center justify-center">
                    {theme === 'dark' ? <Moon size={18} className="text-[#bb86fc]" /> : <Sun size={18} className="text-[#bb86fc]" />}
                  </div>
                  <Label className="text-[12px] font-bold text-[#e4e4e7] uppercase tracking-wider">Modo Claro</Label>
                </div>
                <Switch 
                  checked={theme === 'light'} 
                  onCheckedChange={(checked) => setTheme(checked ? 'light' : 'dark')} 
                  className="data-[state=checked]:bg-[#bb86fc]"
                />
              </div>

              <div className="flex items-center justify-between w-full pt-5 border-t border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#03dac6]/10 rounded-2xl flex items-center justify-center">
                    <Bell size={18} className="text-[#03dac6]" />
                  </div>
                  <div className="flex flex-col">
                    <Label className="text-[12px] font-bold text-[#e4e4e7] uppercase tracking-wider">Alertas</Label>
                    <p className="text-[8px] text-[#a1a1aa] font-medium uppercase tracking-[0.15em]">Nivel: {user.notificationLevel === 'notorious' ? 'ALTO' : 'NORMAL'}</p>
                  </div>
                </div>
                <Switch 
                  checked={user.notificationLevel === 'notorious'} 
                  onCheckedChange={updateNotificationLevel} 
                  className="data-[state=checked]:bg-[#03dac6]"
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* SINCRONIZACIÓN SECTION */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-3 px-1">
            <RefreshCw size={18} className="text-[#03dac6]" />
            <span className="text-[10px] font-black tracking-[0.2em] text-[#e4e4e7] uppercase">Carga Maestra</span>
          </div>
          <Card className="border border-white/10 bg-[#16161d] shadow-xl rounded-3xl w-full overflow-hidden">
            <CardContent className="p-0 flex flex-col">
              <Button 
                variant="ghost" 
                className="justify-start gap-4 h-16 rounded-none px-6 text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-white/5 border-b border-white/5 w-full group"
                onClick={handleSyncExcel}
                disabled={isSyncing}
              >
                <div className="w-9 h-9 rounded-xl bg-[#bb86fc]/10 flex items-center justify-center group-hover:bg-[#bb86fc]/20 transition-all">
                  <RefreshCw size={16} className={cn("text-[#bb86fc]", isSyncing && "animate-spin")} />
                </div>
                <div className="flex flex-col items-start translate-y-[2px]">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#e4e4e7]">Inglés IUTSO</span>
                  <span className="text-[8px] font-bold uppercase tracking-widest opacity-50 mt-1">Excel Maestro</span>
                </div>
              </Button>
              <Button 
                variant="ghost" 
                className="justify-start gap-4 h-16 rounded-none px-6 text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-white/5 w-full group"
                onClick={handleSyncMedicina}
                disabled={isSyncing}
              >
                <div className="w-9 h-9 rounded-xl bg-[#03dac6]/10 flex items-center justify-center group-hover:bg-[#03dac6]/20 transition-all">
                  <RefreshCw size={16} className={cn("text-[#03dac6]", isSyncing && "animate-spin")} />
                </div>
                <div className="flex flex-col items-start translate-y-[2px]">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#e4e4e7]">Medicina</span>
                  <span className="text-[8px] font-bold uppercase tracking-widest opacity-50 mt-1">Doc. Maestro</span>
                </div>
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* LOGOUT */}
        <div className="pt-8 pb-12 flex justify-center">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 py-3 px-6 rounded-2xl text-destructive/50 hover:text-destructive hover:bg-destructive/5 transition-all group"
          >
            <LogOut size={16} className="opacity-50 group-hover:opacity-100" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] mt-[2px]">Finalizar Sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
}
