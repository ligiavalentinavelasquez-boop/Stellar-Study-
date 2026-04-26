import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2, Edit2, Image as ImageIcon, CheckCircle2, Circle, ChevronRight, GraduationCap, ListTodo, Table, Upload, Loader2, Maximize2 } from 'lucide-react';
import { Career, Subject, Activity } from '@/src/types';
import { db } from '@/src/lib/firebase';
import { collection, onSnapshot, query, where, addDoc, updateDoc, doc, deleteDoc, orderBy, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { AddActivityDialog } from './AddActivityDialog';
import { AddSubjectDialog } from './AddSubjectDialog';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';
import { handleFirestoreError, OperationType } from '@/src/lib/firestoreErrorHandler';
import { toast } from 'sonner';

import { SubjectDetailView } from './SubjectDetailView';

interface CareerDashboardProps {
  careerId: string;
  userId: string;
  careerName: string;
  careerType: 'trimester' | 'semester';
  key?: string;
}

import { seedInglesData, seedMedicinaData } from '@/src/lib/seedData';

export function CareerDashboard({ careerId, userId, careerName, careerType }: CareerDashboardProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [scheduleUrl, setScheduleUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('notas');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1);
  const [extraPeriods, setExtraPeriods] = useState<number>(0);
  const [longPressedSubjectId, setLongPressedSubjectId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isActivityConfirmOpen, setIsActivityConfirmOpen] = useState(false);
  const [isScheduleConfirmOpen, setIsScheduleConfirmOpen] = useState(false);
  const [isPeriodConfirmOpen, setIsPeriodConfirmOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const longPressTimer = React.useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(careerName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  const handleSeed = async () => {
    if (!confirm('¿Deseas sincronizar los datos con el Excel? Esto reemplazará tus materias actuales de Inglés.')) return;
    setIsSeeding(true);
    try {
      await seedInglesData(userId);
      toast.success('Sincronización con Excel completada');
    } catch (error) {
      toast.error('Error al sincronizar');
    } finally {
      setIsSeeding(false);
    }
  };

  const deleteSubject = async (id: string) => {
    setIsDeleting(true);
    try {
      // Delete associated activities first
      const activitiesPath = `users/${userId}/careers/${careerId}/activities`;
      const activitiesRef = collection(db, activitiesPath);
      const q = query(activitiesRef, where('subjectId', '==', id));
      const activitySnap = await getDocs(q);
      const deletePromises = activitySnap.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Delete the subject
      await deleteDoc(doc(db, `users/${userId}/careers/${careerId}/subjects`, id));
      
      toast.success('Materia y su contenido eliminados');
      setLongPressedSubjectId(null);
      setIsConfirmOpen(false);
    } catch (error) {
      console.error(error);
      toast.error('Error al eliminar la materia');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRemovePeriod = async () => {
    setIsDeleting(true);
    try {
      const subjectsInPeriod = subjectsByPeriod[selectedPeriod] || [];
      
      // Delete all subjects and their activities in the selected period
      const deletePromises = subjectsInPeriod.map(async (subject) => {
        // Delete activities for this subject
        const activitiesPath = `users/${userId}/careers/${careerId}/activities`;
        const activitiesRef = collection(db, activitiesPath);
        const q = query(activitiesRef, where('subjectId', '==', subject.id));
        const activitySnap = await getDocs(q);
        const activityDeletePromises = activitySnap.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(activityDeletePromises);

        // Delete the subject
        return deleteDoc(doc(db, `users/${userId}/careers/${careerId}/subjects`, subject.id));
      });

      await Promise.all(deletePromises);
      
      // If it was an extra period, decrement the count
      if (selectedPeriod > (careerType === 'trimester' ? 12 : 10)) {
        setExtraPeriods(prev => Math.max(0, prev - 1));
      }
      
      // Move to previous period
      setSelectedPeriod(prev => Math.max(1, prev - 1));
      
      toast.success(`${careerType === 'trimester' ? 'Trimestre' : 'Semestre'} eliminado con éxito`);
      setIsPeriodConfirmOpen(false);
    } catch (error) {
      console.error(error);
      toast.error('Error al eliminar el periodo');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (Firestore limit is 1MB per doc, but let's be safe with 800KB for base64)
    if (file.size > 800 * 1024) {
      toast.error('La imagen es muy pesada. Intenta con una menor a 800KB.');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      try {
        await updateDoc(doc(db, `users/${userId}/careers/${careerId}`), {
          scheduleImageUrl: base64
        });
        toast.success('Horario actualizado');
      } catch (error) {
        toast.error('Error al guardar el horario');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleActivityCompletion = async (activityId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, `users/${userId}/careers/${careerId}/activities`, activityId), {
        completed: !currentStatus
      });
    } catch (error) {
      toast.error('Error al actualizar actividad');
    }
  };

  const deleteActivity = async (id: string) => {
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, `users/${userId}/careers/${careerId}/activities`, id));
      toast.success('Actividad eliminada');
      setIsActivityConfirmOpen(false);
      setActivityToDelete(null);
    } catch (error) {
      toast.error('Error al eliminar actividad');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTouchStart = (id: string) => {
    longPressTimer.current = setTimeout(() => {
      setLongPressedSubjectId(id);
    }, 600);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  useEffect(() => {
    if (!userId || !careerId) return;

    const subjectsPath = `users/${userId}/careers/${careerId}/subjects`;
    const subjectsRef = collection(db, subjectsPath);
    const qSubjects = query(subjectsRef, orderBy('period', 'asc'));
    const unsubSubjects = onSnapshot(qSubjects, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject));
      setSubjects(docs);
      
      // Auto-seed if empty and is Ingles
      if (docs.length === 0 && careerId === 'ingles' && !isSeeding) {
        seedInglesData(userId).catch(console.error);
      }
      
      // Auto-seed if empty and is Medicina
      if (docs.length === 0 && careerId === 'medicina' && !isSeeding) {
        seedMedicinaData(userId).catch(console.error);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, subjectsPath);
    });

    const activitiesPath = `users/${userId}/careers/${careerId}/activities`;
    const activitiesRef = collection(db, activitiesPath);
    const qActivities = query(activitiesRef, orderBy('dueDate', 'asc'));
    const unsubActivities = onSnapshot(qActivities, (snapshot) => {
      setActivities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, activitiesPath);
    });

    const careerPath = `users/${userId}/careers/${careerId}`;
    const careerRef = doc(db, careerPath);
    const unsubCareer = onSnapshot(careerRef, (snapshot) => {
      if (snapshot.exists()) {
        setScheduleUrl(snapshot.data().scheduleImageUrl || null);
        if (snapshot.data().name) {
          setDisplayName(snapshot.data().name);
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, careerPath);
    });

    return () => {
      unsubSubjects();
      unsubActivities();
      unsubCareer();
    };
  }, [userId, careerId]);

  const handleUpdateName = async () => {
    if (!tempName.trim()) return setIsEditingName(false);
    try {
      await updateDoc(doc(db, `users/${userId}/careers/${careerId}`), {
        name: tempName
      });
      setIsEditingName(false);
      toast.success('Nombre actualizado');
    } catch (error) {
      toast.error('Error al actualizar nombre');
    }
  };

  const subjectsByPeriod = subjects.reduce((acc, subject) => {
    const period = subject.period;
    if (!acc[period]) acc[period] = [];
    acc[period].push(subject);
    return acc;
  }, {} as Record<number, Subject[]>);

  const defaultMaxPeriod = careerId === 'medicina' ? 14 : 8;
  const currentMaxPeriod = Math.max(...subjects.map(s => s.period), 0);
  const displayMaxPeriod = Math.max(defaultMaxPeriod, currentMaxPeriod) + extraPeriods;
  const availablePeriods = Array.from({ length: displayMaxPeriod }, (_, i) => i + 1);

  const isIngles = careerId === 'ingles';

  return (
    <div className="flex flex-col gap-4 pb-24">
      <AnimatePresence>
        {selectedSubject && (
          <SubjectDetailView 
            userId={userId}
            careerId={careerId}
            subject={selectedSubject}
            onBack={() => setSelectedSubject(null)}
          />
        )}
      </AnimatePresence>

      <header className="px-6 pt-8 pb-4 bg-muted/30 border-bottom border-border">
        <div className="flex justify-between items-center mb-2">
          {isEditingName ? (
            <div className="flex items-center gap-2 flex-1 mr-4">
              <Input 
                value={tempName} 
                onChange={(e) => setTempName(e.target.value)}
                onBlur={handleUpdateName}
                onKeyDown={(e) => e.key === 'Enter' && handleUpdateName()}
                autoFocus
                className="h-8 bg-[#0a0a0c] border-[#27272a] text-sm font-bold uppercase text-primary px-3 rounded-lg"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => {
              setTempName(displayName);
              setIsEditingName(true);
            }}>
              <h1 className="text-sm font-bold tracking-[0.1em] uppercase text-primary">
                {displayName}
              </h1>
              <Edit2 size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground font-medium">Sincronizado</span>
            <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(187,134,252,0.5)]" />
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase opacity-60">
          {careerType === 'trimester' ? 'TRIMESTRE' : 'SEMESTRE'} {selectedPeriod}
        </p>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col px-6">
        <TabsList className="grid grid-cols-3 gap-2 bg-[#16161d] border border-white/5 p-1 h-auto w-full max-w-xs mx-auto rounded-xl mb-6">
          <TabsTrigger 
            value="notas" 
            className="flex items-center justify-center gap-2 rounded-lg data-[state=active]:bg-[#bb86fc] data-[state=active]:text-[#0a0a0c] transition-all py-1.5"
          >
            <GraduationCap size={14} />
            <span className="text-[9px] font-black uppercase tracking-tighter">Notas</span>
          </TabsTrigger>
          <TabsTrigger 
            value="actividades" 
            className="flex items-center justify-center gap-2 rounded-lg data-[state=active]:bg-[#bb86fc] data-[state=active]:text-[#0a0a0c] transition-all py-1.5"
          >
            <ListTodo size={14} />
            <span className="text-[9px] font-black uppercase tracking-tighter">Plan</span>
          </TabsTrigger>
          <TabsTrigger 
            value="horario" 
            className="flex items-center justify-center gap-2 rounded-lg data-[state=active]:bg-[#bb86fc] data-[state=active]:text-[#0a0a0c] transition-all py-1.5"
          >
            <Table size={14} />
            <span className="text-[9px] font-black uppercase tracking-tighter">Horario</span>
          </TabsTrigger>
        </TabsList>

        <div className="w-full max-w-md mx-auto">
          <TabsContent value="notas" className="mt-0 outline-none">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[11px] font-black tracking-[0.1em] text-muted-foreground uppercase">Materias</h2>
            <AddSubjectDialog
              userId={userId}
              careerId={careerId}
              defaultPeriod={selectedPeriod}
              careerType={careerType}
            />
          </div>
          
          <div className="mb-6">
            <Select 
              value={selectedPeriod.toString()} 
              onValueChange={(v) => setSelectedPeriod(parseInt(v))}
            >
              <SelectTrigger className="w-full h-14 bg-[#16161d] border-white/5 rounded-2xl text-lg font-black text-[#e4e4e7] px-6">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-[#bb86fc] rounded-full" />
                  <SelectValue placeholder="Seleccionar Periodo" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-[#16161d] border-white/10 rounded-2xl">
                {availablePeriods.map((p) => (
                  <SelectItem 
                    key={p} 
                    value={p.toString()}
                    className="text-[#e4e4e7] focus:bg-[#bb86fc] focus:text-[#0a0a0c] py-3 px-6 font-bold"
                  >
                    {careerType === 'trimester' ? 'Trimestre' : 'Semestre'} {p}
                  </SelectItem>
                ))}
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-2 h-12 px-6 text-[#bb86fc] hover:bg-[#bb86fc]/10 rounded-none font-black uppercase tracking-widest text-[10px]"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setExtraPeriods(prev => prev + 1);
                  }}
                >
                  <Plus size={14} /> Agregar {careerType === 'trimester' ? 'Trimestre' : 'Semestre'}
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-2 h-12 px-6 text-destructive hover:bg-destructive/10 rounded-none font-black uppercase tracking-widest text-[10px] border-t border-white/5"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsPeriodConfirmOpen(true);
                  }}
                >
                  <Trash2 size={14} /> Eliminar {careerType === 'trimester' ? 'Trimestre' : 'Semestre'} Actual
                </Button>
              </SelectContent>
            </Select>
          </div>
          
          <ScrollArea className="h-[calc(100vh-420px)]">
            <div className="flex flex-col gap-2">
              {subjectsByPeriod[selectedPeriod]?.map((subject) => (
                <div 
                  key={subject.id} 
                  className="relative group"
                  onTouchStart={() => handleTouchStart(subject.id)}
                  onTouchEnd={handleTouchEnd}
                  onMouseDown={() => handleTouchStart(subject.id)}
                  onMouseUp={handleTouchEnd}
                  onMouseLeave={handleTouchEnd}
                >
                  <div 
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl bg-[#16161d] border border-white/5 active:bg-white/5 transition-all cursor-pointer",
                      longPressedSubjectId === subject.id && "scale-[0.98] border-destructive/50 bg-destructive/5"
                    )}
                    onClick={() => {
                      if (longPressedSubjectId === subject.id) {
                        setLongPressedSubjectId(null);
                      } else {
                        setSelectedSubject(subject);
                      }
                    }}
                  >
                    <div className="flex flex-col gap-1">
                      <h3 className="text-sm font-bold text-[#e4e4e7] leading-tight">{subject.name}</h3>
                      <p className="text-[8px] text-muted-foreground uppercase font-black tracking-widest">
                        {subject.modality}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {subject.finalGrade !== undefined && (
                        <span className="text-[11px] font-black text-[#bb86fc] bg-[#bb86fc]/10 px-1.5 py-0.5 rounded-md">
                          {subject.finalGrade}
                        </span>
                      )}
                      <span className={cn(
                        "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                        subject.status === 'aprobada' ? "bg-green-500/10 text-green-400" : 
                        subject.status === 'en curso' ? "bg-blue-500/10 text-blue-400" :
                        "bg-yellow-500/10 text-yellow-400"
                      )}>
                        {subject.status === 'aprobada' ? 'APROBADO' : 
                          subject.status === 'en curso' ? 'EN CURSO' : 'POR VER'}
                      </span>
                      <ChevronRight size={14} className="text-muted-foreground" />
                    </div>
                  </div>

                  <AnimatePresence>
                    {longPressedSubjectId === subject.id && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute inset-0 flex items-center justify-center bg-[#0a0a0c]/80 backdrop-blur-sm rounded-2xl z-10"
                      >
                        <div className="flex gap-4">
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="rounded-full font-black uppercase tracking-widest text-[10px] px-6 h-10 shadow-lg shadow-destructive/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsConfirmOpen(true);
                            }}
                          >
                            <Trash2 size={14} className="mr-2" /> Eliminar
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="rounded-full font-black uppercase tracking-widest text-[10px] px-6 h-10 text-white hover:bg-white/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLongPressedSubjectId(null);
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
              {(!subjectsByPeriod[selectedPeriod] || subjectsByPeriod[selectedPeriod].length === 0) && (
                <div className="text-center py-12 text-muted-foreground italic">
                  No hay materias registradas para este periodo.
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="actividades" className="px-0 mt-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[11px] font-black tracking-[0.1em] text-muted-foreground uppercase">
              {isIngles ? 'PLANIFICACIÓN' : 'ENTREGAS'}
            </h2>
            <AddActivityDialog userId={userId} careerId={careerId} subjects={subjects} />
          </div>
          
          <ScrollArea className="h-[calc(100vh-420px)]">
            <div className="flex flex-col gap-2">
              {activities.map((activity) => (
                <Card key={activity.id} className={cn(
                  "border-none bg-card/50 backdrop-blur-sm transition-opacity",
                  activity.completed && "opacity-60"
                )}>
                  <CardContent className="p-3 flex justify-between items-center">
                    <div className="flex items-center gap-3 flex-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 rounded-full shrink-0"
                        onClick={() => toggleActivityCompletion(activity.id, !!activity.completed)}
                      >
                        {activity.completed ? (
                          <CheckCircle2 className="text-secondary" size={18} />
                        ) : (
                          <Circle className="text-muted-foreground" size={18} />
                        )}
                      </Button>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <h3 className={cn("text-[13px] font-bold", activity.completed && "line-through")}>{activity.title}</h3>
                          {activity.isExam && <Badge variant="destructive" className="text-[8px] h-3.5 px-1 uppercase leading-none">Exam</Badge>}
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          {format(new Date(activity.dueDate), "d MMM, HH:mm", { locale: es })}
                        </p>
                        <p className="text-[9px] font-black text-[#bb86fc]/70 uppercase tracking-widest">
                          {subjects.find(s => s.id === activity.subjectId)?.name || 'Materia'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={cn(
                        "text-[8px] uppercase tracking-tighter h-4 px-1.5",
                        activity.priority === 'high' ? "bg-red-500/20 text-red-400 border-none" :
                        activity.priority === 'medium' ? "bg-orange-500/20 text-orange-400 border-none" :
                        "bg-blue-500/20 text-blue-400 border-none"
                      )}>
                        {activity.priority}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-muted-foreground hover:text-destructive p-0"
                        onClick={() => {
                          setActivityToDelete(activity.id);
                          setIsActivityConfirmOpen(true);
                        }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {activities.length === 0 && (
                <div className="text-center py-12 text-muted-foreground italic">
                  No hay actividades registradas.
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="horario" className="px-0 mt-0 outline-none">
          <Card className="border-dashed border-2 border-border/30 bg-muted/20 min-h-[250px] flex flex-col items-center justify-center p-5 text-center gap-3 rounded-3xl">
            {scheduleUrl ? (
              <div className="w-full flex flex-col items-center gap-4">
                <div className="relative group cursor-pointer w-full max-w-xs" onClick={() => setIsZoomed(true)}>
                  <img src={scheduleUrl} alt="Horario" className="w-full rounded-2xl shadow-xl transition-transform group-hover:scale-[1.02] border border-white/5" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                    <Maximize2 className="text-white" size={24} />
                  </div>
                </div>
                
                <Dialog open={isZoomed} onOpenChange={setIsZoomed}>
                  <DialogContent className="max-w-[95vw] w-full p-0 bg-transparent border-none shadow-none outline-none">
                    <img src={scheduleUrl} alt="Horario Ampliado" className="w-full h-auto rounded-xl" />
                  </DialogContent>
                </Dialog>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 rounded-full gap-2 border-[#27272a] text-[#a1a1aa] hover:text-[#e4e4e7] text-[10px] uppercase font-black"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                    Cambiar
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-destructive font-black text-[10px] uppercase tracking-widest hover:bg-destructive/10 rounded-full"
                    onClick={() => setIsScheduleConfirmOpen(true)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="p-3 bg-card rounded-2xl shadow-inner border border-white/5">
                  <ImageIcon size={32} className="text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Tu Horario</h3>
                  <p className="text-[10px] text-muted-foreground max-w-[200px] mx-auto">Sube una imagen para verla aquí de forma rápida</p>
                </div>
                <div className="flex flex-col gap-2 w-full max-w-[200px]">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />
                  <Button 
                    variant="secondary"
                    className="w-full h-10 rounded-xl bg-[#bb86fc] hover:bg-[#bb86fc]/90 text-[#0a0a0c] font-black text-[10px] tracking-widest uppercase shadow-lg shadow-[#bb86fc]/20 gap-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                    Subir Imagen
                  </Button>
                </div>
              </>
            )}
          </Card>
        </TabsContent>
      </div>
    </Tabs>
      <ConfirmDeleteDialog 
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirm={() => longPressedSubjectId && deleteSubject(longPressedSubjectId)}
        isLoading={isDeleting}
      />

      <ConfirmDeleteDialog 
        open={isActivityConfirmOpen}
        onOpenChange={setIsActivityConfirmOpen}
        onConfirm={() => activityToDelete && deleteActivity(activityToDelete)}
        title="¿Estás seguro que deseas eliminar esta actividad?"
        isLoading={isDeleting}
      />

      <ConfirmDeleteDialog 
        open={isScheduleConfirmOpen}
        onOpenChange={setIsScheduleConfirmOpen}
        onConfirm={async () => {
          setIsDeleting(true);
          try {
            await updateDoc(doc(db, `users/${userId}/careers/${careerId}`), { scheduleImageUrl: null });
            setIsScheduleConfirmOpen(false);
            toast.success('Horario eliminado');
          } catch (error) {
            toast.error('Error al eliminar horario');
          } finally {
            setIsDeleting(false);
          }
        }}
        title="¿Estás seguro que deseas eliminar tu horario?"
        isLoading={isDeleting}
      />

      <ConfirmDeleteDialog 
        open={isPeriodConfirmOpen}
        onOpenChange={setIsPeriodConfirmOpen}
        onConfirm={handleRemovePeriod}
        title={`¿Estás seguro que deseas eliminar este ${careerType === 'trimester' ? 'trimestre' : 'semestre'}?`}
        description="Se eliminarán permanentemente todas las materias y actividades asociadas a este periodo."
        isLoading={isDeleting}
      />
    </div>
  );
}
