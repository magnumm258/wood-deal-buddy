import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export default function LostReasonDialog({ open, onClose, onConfirm }: Props) {
  const [reason, setReason] = useState('');

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Motivo da Perda</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">Informe o motivo pelo qual este lead foi perdido:</p>
        <Input placeholder="Ex: Preço, concorrência, desistiu..." value={reason} onChange={e => setReason(e.target.value)} />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button variant="destructive" onClick={() => { onConfirm(reason); setReason(''); }} disabled={!reason.trim()}>Confirmar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
