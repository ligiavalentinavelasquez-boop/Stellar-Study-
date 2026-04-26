import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Edit2, CheckCircle2, Circle, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Subject } from '@/src/types';
import { db } from '@/src/lib/firebase';
import { doc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';

interface SubjectDetailViewProps {
  userId: string;
  careerId: string;
  subject: Subject;
  onBack: () => void;
}

export function SubjectDetailView({ userId, careerId, subject, onBack }: SubjectDetailViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSubject, setEditedSubject] = useState(subject);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, `users/${userId}/careers/${careerId}/subjects`, subject.id), {
        ...editedSubject
      });
      setIsEditing(false);
      toast.success('Materia actualizada');
    } catch (error) {
      toast.error('Error al guardar');
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Delete associated activities first
      const activitiesPath = `users/${userId}/careers/${careerId}/activities`;
      const activitiesRef = collection(db, activitiesPath);
      const q = query(activitiesRef, where('subjectId', '==', subject.id));
      const activitySnap = await getDocs(q);
      const deletePromises = activitySnap.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Delete the subject
      await deleteDoc(doc(db, `users/${userId}/careers/${careerId}/subjects`, subject.id));
      toast.success('Materia y su contenido eliminados');
      setIsConfirmOpen(false);
      onBack();
    } catch (error) {
      toast.error('Error al eliminar la materia');
    } finally {
      setIsDeleting(false);
    }
  };

  const updateGrade = (index: number, value: string) => {
    const newGrades = [...editedSubject.grades];
    newGrades[index] = parseFloat(value) || 0;
    setEditedSubject({ ...editedSubject, grades: newGrades });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="fixed inset-0 z-50 bg-[#0a0a0c] p-6 overflow-y-auto"
    >
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
            <ChevronLeft size={24} />
          </Button>
          <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Detalle de Materia</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsConfirmOpen(true)}
            className="rounded-full text-destructive hover:bg-destructive/10"
          >
            <Trash2 size={20} />
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className="rounded-full px-6 bg-[#bb86fc]/20 text-[#bb86fc] hover:bg-[#bb86fc]/30 font-bold"
          >
            {isEditing ? 'Guardar' : 'Editar'}
          </Button>
        </div>
      </header>

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-[#e4e4e7]">Trimestre {subject.period}</h2>
          <h3 className="text-lg font-medium text-[#bb86fc] mt-1">{subject.name}</h3>
        </div>

        <div className="space-y-0 bg-[#16161d] rounded-[2rem] border border-white/5 overflow-hidden">
          <div className="flex justify-between items-center p-5 border-b border-white/5">
            <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Modalidad</span>
            {isEditing ? (
              <Select 
                value={editedSubject.modality} 
                onValueChange={(v: any) => setEditedSubject({ ...editedSubject, modality: v })}
              >
                <SelectTrigger className="w-[140px] h-9 text-xs bg-[#1f1f27] border-none rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1f1f27] border-none">
                  <SelectItem value="presencial">Presencial</SelectItem>
                  <SelectItem value="virtual">Virtual</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <span className="text-sm font-bold text-[#e4e4e7] capitalize">{subject.modality}</span>
            )}
          </div>

          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex justify-between items-center p-5 border-b border-white/5">
              <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Nota {i + 1}</span>
              {isEditing ? (
                <Input 
                  type="number" 
                  value={editedSubject.grades[i] || ''} 
                  onChange={(e) => updateGrade(i, e.target.value)}
                  className="w-16 h-9 text-right bg-[#1f1f27] border-none text-sm font-bold rounded-xl"
                />
              ) : (
                <span className="text-sm font-bold text-[#e4e4e7]">{subject.grades[i] || '--'}</span>
              )}
            </div>
          ))}

          <div className="flex justify-between items-center p-5 border-b border-white/10 bg-[#bb86fc]/5">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#bb86fc]">Definitiva</span>
            {isEditing ? (
              <Input 
                type="number" 
                value={editedSubject.finalGrade || ''} 
                onChange={(e) => setEditedSubject({ ...editedSubject, finalGrade: parseFloat(e.target.value) || 0 })}
                className="w-16 h-9 text-right bg-[#1f1f27] border-none text-sm font-bold rounded-xl"
              />
            ) : (
              <span className="text-xl font-black text-[#bb86fc]">
                {subject.finalGrade?.toFixed(1) || '--'}
              </span>
            )}
          </div>

          <div className="flex justify-between items-center p-5">
            <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Estado</span>
            {isEditing ? (
              <Select 
                value={editedSubject.status} 
                onValueChange={(v: any) => setEditedSubject({ ...editedSubject, status: v })}
              >
                <SelectTrigger className="w-[140px] h-9 text-xs bg-[#1f1f27] border-none rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1f1f27] border-none">
                  <SelectItem value="aprobada">Aprobado</SelectItem>
                  <SelectItem value="en curso">En Curso</SelectItem>
                  <SelectItem value="por ver">Por Ver</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <span className={cn(
                "text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                subject.status === 'aprobada' ? "bg-green-500/10 text-green-400" : 
                subject.status === 'en curso' ? "bg-blue-500/10 text-blue-400" :
                "bg-yellow-500/10 text-yellow-400"
              )}>
                {subject.status === 'aprobada' ? 'APROBADO' : 
                 subject.status === 'en curso' ? 'EN CURSO' : 'POR VER'}
              </span>
            )}
          </div>
        </div>
      </div>

      <ConfirmDeleteDialog 
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </motion.div>
  );
}
