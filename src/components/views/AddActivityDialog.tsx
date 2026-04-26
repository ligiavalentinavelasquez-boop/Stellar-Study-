import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus } from 'lucide-react';
import { db } from '@/src/lib/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { format } from 'date-fns';
import { Subject, Priority, Career } from '@/src/types';

interface AddActivityDialogProps {
  userId: string;
  careerId?: string;
  subjects?: Subject[];
  trigger?: React.ReactNode;
  defaultDate?: string;
  key?: string;
  nativeButton?: boolean;
}

export function AddActivityDialog({ userId, careerId: initialCareerId, subjects: initialSubjects, trigger, defaultDate, nativeButton }: AddActivityDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [activityType, setActivityType] = useState<string>('actividad');
  const [subjectId, setSubjectId] = useState('');
  const [careerId, setCareerId] = useState(initialCareerId || '');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [careers, setCareers] = useState<Career[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects || []);

  useEffect(() => {
    if (open) {
      if (defaultDate) {
        setDueDate(defaultDate);
      } else {
        const now = new Date();
        setDueDate(format(now, "yyyy-MM-dd'T'HH:mm"));
      }
    }
  }, [open, defaultDate]);

  useEffect(() => {
    if (open && !initialCareerId) {
      const fetchCareers = async () => {
        const snap = await getDocs(collection(db, `users/${userId}/careers`));
        setCareers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Career)));
      };
      fetchCareers();
    }
  }, [open, userId, initialCareerId]);

  useEffect(() => {
    if (careerId && !initialSubjects) {
      const fetchSubjects = async () => {
        const snap = await getDocs(collection(db, `users/${userId}/careers/${careerId}/subjects`));
        setSubjects(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject)));
      };
      fetchSubjects();
    }
  }, [careerId, userId, initialSubjects]);

  const filteredSubjects = selectedPeriod 
    ? subjects.filter(s => s.period.toString() === selectedPeriod)
    : subjects;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = activityType === 'personalizada' ? customTitle : (activityType === 'actividad' ? title : activityType);
    if (!finalTitle || !dueDate || !subjectId || !careerId) return;

    await addDoc(collection(db, `users/${userId}/careers/${careerId}/activities`), {
      title: finalTitle,
      dueDate: new Date(dueDate).toISOString(),
      priority,
      isExam: activityType === 'Examen',
      subjectId,
      careerId,
      userId
    });

    setOpen(false);
    setTitle('');
    setCustomTitle('');
    setDueDate('');
    setPriority('medium');
    setActivityType('actividad');
    setSubjectId('');
    setSelectedPeriod('');
    if (!initialCareerId) setCareerId('');
  };

  const maxPeriods = careerId === 'medicina' ? 14 : 8;
  const periods = Array.from({ length: maxPeriods }, (_, i) => i + 1);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild nativeButton={nativeButton}>
        {trigger || (
          <Button size="sm" className="rounded-full gap-2 bg-[#bb86fc] hover:bg-[#bb86fc]/90 text-[#0a0a0c] font-black text-[10px] uppercase tracking-widest shadow-[0_4px_12px_rgba(187,134,252,0.3)]">
            <Plus size={16} /> Actividad
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem] bg-[#16161d] border-[#27272a] shadow-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-[#e4e4e7] font-black tracking-tight uppercase text-sm">Nueva Actividad</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          {!initialCareerId && (
            <div className="grid gap-2">
              <Label htmlFor="career" className="text-[10px] font-black uppercase tracking-widest text-[#a1a1aa]">Carrera</Label>
              <Select value={careerId} onValueChange={setCareerId}>
                <SelectTrigger className="rounded-xl bg-[#1f1f27] border-[#27272a] text-[#e4e4e7]">
                  <SelectValue placeholder="Selecciona carrera" />
                </SelectTrigger>
                <SelectContent className="bg-[#1f1f27] border-[#27272a]">
                  {careers.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-[#e4e4e7] focus:bg-[#bb86fc] focus:text-[#0a0a0c]">{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="period" className="text-[10px] font-black uppercase tracking-widest text-[#a1a1aa]">Semestre / Trimestre</Label>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod} disabled={!careerId}>
              <SelectTrigger className="rounded-xl bg-[#1f1f27] border-[#27272a] text-[#e4e4e7]">
                <SelectValue placeholder="Selecciona periodo" />
              </SelectTrigger>
              <SelectContent className="bg-[#1f1f27] border-[#27272a]">
                {periods.map((p) => (
                  <SelectItem key={p} value={p.toString()} className="text-[#e4e4e7] focus:bg-[#bb86fc] focus:text-[#0a0a0c]">Periodo {p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="subject" className="text-[10px] font-black uppercase tracking-widest text-[#a1a1aa]">Materia</Label>
            <Select value={subjectId} onValueChange={setSubjectId} disabled={!selectedPeriod}>
              <SelectTrigger className="rounded-xl bg-[#1f1f27] border-[#27272a] text-[#e4e4e7]">
                <SelectValue placeholder={selectedPeriod ? "Selecciona materia" : "Primero elige periodo"} />
              </SelectTrigger>
              <SelectContent className="bg-[#1f1f27] border-[#27272a]">
                {filteredSubjects.map((s) => (
                  <SelectItem key={s.id} value={s.id} className="text-[#e4e4e7] focus:bg-[#bb86fc] focus:text-[#0a0a0c]">{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-[#a1a1aa]">Tipo de Actividad</Label>
            <Select value={activityType} onValueChange={setActivityType}>
              <SelectTrigger className="rounded-xl bg-[#1f1f27] border-[#27272a] text-[#e4e4e7]">
                <SelectValue placeholder="Selecciona tipo" />
              </SelectTrigger>
              <SelectContent className="bg-[#1f1f27] border-[#27272a]">
                <SelectItem value="actividad" className="text-[#e4e4e7] focus:bg-[#bb86fc] focus:text-[#0a0a0c]">Actividad General</SelectItem>
                <SelectItem value="Examen" className="text-[#e4e4e7] focus:bg-[#bb86fc] focus:text-[#0a0a0c]">Examen</SelectItem>
                <SelectItem value="Exposición" className="text-[#e4e4e7] focus:bg-[#bb86fc] focus:text-[#0a0a0c]">Exposición</SelectItem>
                <SelectItem value="personalizada" className="text-[#e4e4e7] focus:bg-[#bb86fc] focus:text-[#0a0a0c]">Respuesta Personalizada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {activityType === 'actividad' && (
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest text-[#a1a1aa]">Título de la Actividad</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Tarea de Gramática" className="rounded-xl bg-[#1f1f27] border-[#27272a] text-[#e4e4e7]" />
            </div>
          )}

          {activityType === 'personalizada' && (
            <div className="grid gap-2">
              <Label htmlFor="customTitle" className="text-[10px] font-black uppercase tracking-widest text-[#a1a1aa]">Escribe tu respuesta</Label>
              <Input id="customTitle" value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} placeholder="Ej: Proyecto de Investigación" className="rounded-xl bg-[#1f1f27] border-[#27272a] text-[#e4e4e7]" />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="date" className="text-[10px] font-black uppercase tracking-widest text-[#a1a1aa]">Fecha de Entrega</Label>
            <Input id="date" type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="rounded-xl bg-[#1f1f27] border-[#27272a] text-[#e4e4e7]" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="priority" className="text-[10px] font-black uppercase tracking-widest text-[#a1a1aa]">Prioridad</Label>
            <Select value={priority} onValueChange={(v: Priority) => setPriority(v)}>
              <SelectTrigger className="rounded-xl bg-[#1f1f27] border-[#27272a] text-[#e4e4e7]">
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent className="bg-[#1f1f27] border-[#27272a]">
                <SelectItem value="low" className="text-[#e4e4e7] focus:bg-[#bb86fc] focus:text-[#0a0a0c]">Baja</SelectItem>
                <SelectItem value="medium" className="text-[#e4e4e7] focus:bg-[#bb86fc] focus:text-[#0a0a0c]">Media</SelectItem>
                <SelectItem value="high" className="text-[#e4e4e7] focus:bg-[#bb86fc] focus:text-[#0a0a0c]">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="submit" className="w-full h-12 rounded-2xl bg-[#bb86fc] hover:bg-[#bb86fc]/90 text-[#0a0a0c] font-black text-xs tracking-widest uppercase shadow-[0_8px_20px_rgba(187,134,252,0.3)]">Guardar Actividad</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
