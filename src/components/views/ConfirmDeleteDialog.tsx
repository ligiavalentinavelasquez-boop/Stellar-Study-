import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  isLoading?: boolean;
}

export function ConfirmDeleteDialog({ 
  open, 
  onOpenChange, 
  onConfirm, 
  title = "¿Estás seguro que deseas eliminar esta materia?",
  description = "Esta acción no se puede deshacer y eliminará todo el contenido relacionado.",
  isLoading = false
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#16161d] border-white/10 rounded-[2rem] max-w-sm">
        <DialogHeader className="flex flex-col items-center text-center gap-4">
          <div className="p-4 bg-destructive/10 rounded-full">
            <AlertTriangle size={32} className="text-destructive" />
          </div>
          <div className="space-y-2">
            <DialogTitle className="text-xl font-black text-[#e4e4e7] leading-tight">
              {title}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-medium">
              {description}
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="flex-1 h-12 rounded-2xl font-bold text-muted-foreground hover:bg-white/5"
          >
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-destructive/20"
          >
            {isLoading ? 'Eliminando...' : 'Sí, Eliminar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
