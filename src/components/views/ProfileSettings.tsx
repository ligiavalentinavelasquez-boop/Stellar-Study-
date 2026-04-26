import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  React.useEffect(() => {
    if (!user.uid) return;
    const path = `users/${user.uid}/quotes`;
    const unsub = onSnapshot(collection(db, path), (snap) => {
      setQuotes(snap.docs.map(doc => ({ id: doc.id, text: doc.data().text })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
    return () => unsub();
  }, [user.uid]);

  const handleAddQuote = async () => {
    if (!newQuote.trim()) return;
    await addDoc(collection(db, `users/${user.uid}/quotes`), {
      text: newQuote.trim(),
      createdAt: new Date().toISOString()
    });
    setNewQuote('');
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
      <header className="flex flex-col items-center gap-4 py-4">
        <div className="relative">
          <Avatar className="w-24 h-24 border-4 border-[#27272a] shadow-2xl">
            <AvatarImage src={user.photoURL} />
            <AvatarFallback className="text-2xl bg-[#1f1f27] text-[#bb86fc] font-black">
              {user.displayName?.charAt(0) || user.email.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="absolute bottom-1 right-1 w-5 h-5 bg-[#03dac6] border-4 border-[#0a0a0c] rounded-full shadow-[0_0_10px_rgba(3,218,198,0.5)]" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-tight text-[#e4e4e7]">{user.displayName || 'Estudiante'}</h1>
          <p className="text-[#a1a1aa] text-[10px] font-bold uppercase tracking-widest mt-1">{user.email}</p>
        </div>
      </header>

      <div className="flex flex-col gap-6">
        <div className="text-center mb-2">
          <h2 className="text-xl font-black tracking-tighter text-[#bb86fc] uppercase">Ajustes</h2>
        </div>

        {/* FRASES SECTION - COLLAPSIBLE */}
        <section className="flex flex-col items-center w-full">
          <Button 
            variant="ghost" 
            className="w-full flex justify-between items-center py-6 px-4 hover:bg-[#16161d] group transition-all"
            onClick={() => setIsQuotesExpanded(!isQuotesExpanded)}
          >
            <div className="flex items-center gap-3">
              <MessageSquareQuote size={20} className="text-[#bb86fc]" />
              <span className="text-[11px] font-black tracking-[0.1em] text-[#e4e4e7] uppercase">Frases</span>
            </div>
            <div className={cn("transition-transform duration-300", isQuotesExpanded ? "rotate-180" : "")}>
              <Plus size={18} className="text-muted-foreground" />
            </div>
          </Button>

          {isQuotesExpanded && (
            <Card className="border border-[#27272a] bg-[#16161d] shadow-xl rounded-2xl w-full mt-2 animate-in fade-in slide-in-from-top-4 duration-300">
              <CardContent className="p-4 flex flex-col gap-6">
                <div className="flex flex-col gap-3 items-center">
                  <Input 
                    placeholder="Escribe una frase inspiradora..." 
                    value={newQuote}
                    onChange={(e) => setNewQuote(e.target.value)}
                    className="bg-[#1f1f27] border-none text-xs rounded-xl h-12 text-center"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddQuote()}
                  />
                  <Button onClick={handleAddQuote} className="h-10 px-6 rounded-xl bg-[#bb86fc] text-[#0a0a0c] shadow-lg shadow-[#bb86fc]/20 font-black text-[10px] uppercase tracking-widest">
                    <Plus size={16} className="mr-2" />
                    Agregar Frase
                  </Button>
                </div>
                
                <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
                  {quotes.map((q) => (
                    <div key={q.id} className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-[#1f1f27] group border border-white/5 text-center">
                      {editingQuote?.id === q.id ? (
                        <div className="flex flex-col gap-2 w-full">
                          <Input 
                            value={editingQuote.text}
                            onChange={(e) => setEditingQuote({ ...editingQuote, text: e.target.value })}
                            className="bg-[#0a0a0c] border-[#bb86fc]/30 text-xs text-center h-10"
                            autoFocus
                          />
                          <div className="flex justify-center gap-2">
                            <Button size="sm" onClick={handleUpdateQuote} className="h-8 bg-[#03dac6] text-[#0a0a0c] font-black uppercase text-[9px] px-4">
                              <Check size={14} className="mr-1" /> Guardar
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingQuote(null)} className="h-8 text-[#a1a1aa] font-black uppercase text-[9px] px-4">
                              <X size={14} className="mr-1" /> Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-xs text-[#e4e4e7] font-medium leading-relaxed italic">"{q.text}"</p>
                          <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setEditingQuote(q)}
                              className="h-7 px-3 text-[#bb86fc] hover:text-[#bb86fc] hover:bg-[#bb86fc]/10 text-[9px] font-black uppercase tracking-widest"
                            >
                              <Pencil size={14} className="mr-1" />
                              Editar
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDeleteQuote(q.id)}
                              className="h-7 px-3 text-destructive hover:text-destructive hover:bg-destructive/10 text-[9px] font-black uppercase tracking-widest"
                            >
                              <Trash2 size={14} className="mr-1" />
                              Eliminar
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  {quotes.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
                      <Quote size={32} className="text-muted-foreground opacity-20" />
                      <p className="text-[10px] text-muted-foreground italic uppercase tracking-widest">No has agregado frases personalizadas.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </section>

        {/* CUENTA Y SEGURIDAD SECTION - CENTERED */}
        <section className="flex flex-col items-center w-full">
          <div className="w-full flex items-center gap-3 py-4 px-4">
            <Shield size={20} className="text-[#03dac6]" />
            <span className="text-[11px] font-black tracking-[0.1em] text-[#e4e4e7] uppercase">CUENTA Y SEGURIDAD</span>
          </div>
          <Card className="border border-[#27272a] bg-[#16161d] shadow-xl rounded-2xl overflow-hidden w-full">
            <CardContent className="p-0 flex flex-col">
              <Button 
                variant="ghost" 
                className="justify-center gap-3 h-14 rounded-none text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-[#1f1f27] border-b border-[#27272a]/50 w-full"
                onClick={handleSyncExcel}
                disabled={isSyncing}
              >
                <RefreshCw size={18} className={cn("text-[#bb86fc]", isSyncing && "animate-spin")} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {isSyncing ? 'Sincronizando...' : 'Sincronizar Inglés Maestro'}
                </span>
              </Button>
              <Button 
                variant="ghost" 
                className="justify-center gap-3 h-14 rounded-none text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-[#1f1f27] border-b border-[#27272a]/50 w-full"
                onClick={handleSyncMedicina}
                disabled={isSyncing}
              >
                <RefreshCw size={18} className={cn("text-[#03dac6]", isSyncing && "animate-spin")} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {isSyncing ? 'Sincronizando...' : 'Sincronizar Medicina Maestro'}
                </span>
              </Button>
              <Button 
                variant="ghost" 
                className="justify-center gap-3 h-14 rounded-none text-[#ff5252] hover:text-[#ff5252] hover:bg-[#ff5252]/10 w-full"
                onClick={handleLogout}
              >
                <LogOut size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">Cerrar Sesión</span>
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* PREFERENCIAS SECTION - AT THE BOTTOM */}
        <section className="flex flex-col items-center w-full">
          <div className="w-full flex items-center gap-3 py-4 px-4">
            <Settings size={20} className="text-[#bb86fc]" />
            <span className="text-[11px] font-black tracking-[0.1em] text-[#e4e4e7] uppercase">PREFERENCIAS</span>
          </div>
          <Card className="border border-[#27272a] bg-[#16161d] shadow-xl rounded-2xl w-full">
            <CardContent className="p-4 flex flex-col gap-4">
              {/* Notificaciones Compact */}
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#03dac6]/10 rounded-xl">
                    <Bell size={18} className="text-[#03dac6]" />
                  </div>
                  <div className="flex flex-col">
                    <Label className="text-[11px] font-bold text-[#e4e4e7]">Notificaciones</Label>
                    <p className="text-[9px] text-[#a1a1aa] font-medium uppercase tracking-widest">{user.notificationLevel}</p>
                  </div>
                </div>
                <Switch 
                  checked={user.notificationLevel === 'notorious'} 
                  onCheckedChange={updateNotificationLevel} 
                  className="scale-75"
                />
              </div>

              {/* Tema Compact */}
              <div className="flex items-center justify-between w-full pt-4 border-t border-[#27272a]/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#bb86fc]/10 rounded-xl">
                    {theme === 'dark' ? <Moon size={18} className="text-[#bb86fc]" /> : <Sun size={18} className="text-[#bb86fc]" />}
                  </div>
                  <Label className="text-[11px] font-bold text-[#e4e4e7]">Modo Claro</Label>
                </div>
                <Switch 
                  checked={theme === 'light'} 
                  onCheckedChange={(checked) => setTheme(checked ? 'light' : 'dark')} 
                  className="scale-75"
                />
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
