import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { db } from '@/src/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { toast } from 'sonner';

interface AddSubjectDialogProps {
  userId: string;
  careerId: string;
  defaultPeriod: number;
  careerType: 'trimester' | 'semester';
  trigger?: React.ReactNode;
}

export function AddSubjectDialog({ userId, careerId, defaultPeriod, careerType, trigger }: AddSubjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [modality, setModality] = useState<'presencial' | 'virtual'>('presencial');
  const [period, setPeriod] = useState(defaultPeriod);
  const [isLoading, setIsLoading] = useState(false);

  // Update period when defaultPeriod changes (e.g. user switches trimesters)
  React.useEffect(() => {
    if (open) {
      setPeriod(defaultPeriod);
    }
  }, [open, defaultPeriod]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      await addDoc(collection(db, `users/${userId}/careers/${careerId}/subjects`), {
        name: name.trim(),
        period,
        modality,
        grades: Array(7).fill(0),
        status: 'por ver',
        createdAt: new Date().toISOString()
      });
      toast.success('Materia agregada');
      setName('');
      setOpen(false);
    } catch (error) {
      toast.error('Error al agregar materia');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10">
            <Plus size={20} />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-[#16161d] border-white/10 rounded-[2rem] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-[#e4e4e7] flex items-center gap-2">
            <div className="p-2 bg-[#bb86fc]/20 rounded-xl">
              <Plus size={20} className="text-[#bb86fc]" />
            </div>
            Nueva Materia
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nombre de la Materia</Label>
            <Input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Inglés Avanzado"
              className="bg-[#1f1f27] border-none h-14 rounded-2xl text-sm font-bold placeholder:text-muted-foreground/30"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                {careerType === 'trimester' ? 'Trimestre' : 'Semestre'}
              </Label>
              <Select value={period.toString()} onValueChange={(v) => setPeriod(parseInt(v))}>
                <SelectTrigger className="bg-[#1f1f27] border-none h-14 rounded-2xl text-sm font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1f1f27] border-none">
                  {Array.from({ length: Math.max(period + 2, careerId === 'medicina' ? 14 : 8) }, (_, i) => i + 1).map((p) => (
                    <SelectItem key={p} value={p.toString()}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Modalidad</Label>
              <Select value={modality} onValueChange={(v: any) => setModality(v)}>
                <SelectTrigger className="bg-[#1f1f27] border-none h-14 rounded-2xl text-sm font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1f1f27] border-none">
                  <SelectItem value="presencial">Presencial</SelectItem>
                  <SelectItem value="virtual">Virtual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-14 rounded-2xl bg-[#bb86fc] text-[#0a0a0c] font-black uppercase tracking-widest shadow-lg shadow-[#bb86fc]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {isLoading ? 'Agregando...' : 'Agregar Materia'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
