import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, HeartPulse } from "lucide-react";
import { toast } from "sonner";

interface HealthRecord {
  id: string;
  allergies: string;
  medications: string;
  conditions: string;
  bloodType: string;
  emergencyContact: string;
  emergencyPhone: string;
  observations: string;
}

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const emptyRecord: Omit<HealthRecord, "id"> = {
  allergies: "", medications: "", conditions: "", bloodType: "", emergencyContact: "", emergencyPhone: "", observations: "",
};

export function TabSaude() {
  const [record, setRecord] = useState<HealthRecord | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<HealthRecord, "id">>(emptyRecord);

  const openAdd = () => {
    setForm(emptyRecord);
    setOpen(true);
  };

  const openEdit = () => {
    if (record) setForm({ allergies: record.allergies, medications: record.medications, conditions: record.conditions, bloodType: record.bloodType, emergencyContact: record.emergencyContact, emergencyPhone: record.emergencyPhone, observations: record.observations });
    setOpen(true);
  };

  const handleSave = () => {
    if (record) {
      setRecord({ ...record, ...form });
      toast.success("Ficha de saúde atualizada!");
    } else {
      setRecord({ id: `h${Date.now()}`, ...form });
      toast.success("Ficha de saúde adicionada!");
    }
    setOpen(false);
  };

  const handleDelete = () => {
    setRecord(null);
    toast.success("Ficha de saúde removida");
  };

  const update = (field: keyof Omit<HealthRecord, "id">, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  if (!record) {
    return (
      <Card>
        <CardContent className="pt-6 flex flex-col items-center justify-center py-12 gap-4">
          <HeartPulse className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">Nenhuma ficha de saúde cadastrada.</p>
          <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" /> Adicionar Ficha de Saúde</Button>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Ficha de Saúde</DialogTitle></DialogHeader>
              <HealthForm form={form} update={update} />
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button onClick={handleSave}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Ficha de Saúde</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={openEdit}><Pencil className="mr-2 h-4 w-4" /> Editar</Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4" /> Excluir</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir ficha de saúde?</AlertDialogTitle>
                  <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {record.bloodType && <div className="flex justify-between"><span className="text-muted-foreground">Tipo Sanguíneo</span><span>{record.bloodType}</span></div>}
          {record.allergies && <div className="flex justify-between"><span className="text-muted-foreground">Alergias</span><span>{record.allergies}</span></div>}
          {record.medications && <div className="flex justify-between"><span className="text-muted-foreground">Medicamentos</span><span>{record.medications}</span></div>}
          {record.conditions && <div className="flex justify-between"><span className="text-muted-foreground">Condições de Saúde</span><span>{record.conditions}</span></div>}
          {record.emergencyContact && <div className="flex justify-between"><span className="text-muted-foreground">Contato de Emergência</span><span>{record.emergencyContact}</span></div>}
          {record.emergencyPhone && <div className="flex justify-between"><span className="text-muted-foreground">Telefone de Emergência</span><span>{record.emergencyPhone}</span></div>}
          {record.observations && <div className="flex justify-between"><span className="text-muted-foreground">Observações</span><span className="text-right max-w-xs">{record.observations}</span></div>}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Editar Ficha de Saúde</DialogTitle></DialogHeader>
          <HealthForm form={form} update={update} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function HealthForm({ form, update }: { form: Omit<HealthRecord, "id">; update: (field: keyof Omit<HealthRecord, "id">, value: string) => void }) {
  return (
    <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
      <div className="space-y-2">
        <Label>Tipo Sanguíneo</Label>
        <Select value={form.bloodType} onValueChange={(v) => update("bloodType", v)}>
          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
          <SelectContent>{bloodTypes.map((bt) => <SelectItem key={bt} value={bt}>{bt}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Alergias</Label>
        <Input value={form.allergies} onChange={(e) => update("allergies", e.target.value)} placeholder="Ex: Poeira, amendoim" />
      </div>
      <div className="space-y-2">
        <Label>Medicamentos em Uso</Label>
        <Input value={form.medications} onChange={(e) => update("medications", e.target.value)} placeholder="Ex: Ritalina 10mg" />
      </div>
      <div className="space-y-2">
        <Label>Condições de Saúde</Label>
        <Input value={form.conditions} onChange={(e) => update("conditions", e.target.value)} placeholder="Ex: Asma, TDAH" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Contato de Emergência</Label>
          <Input value={form.emergencyContact} onChange={(e) => update("emergencyContact", e.target.value)} placeholder="Nome" />
        </div>
        <div className="space-y-2">
          <Label>Telefone de Emergência</Label>
          <Input value={form.emergencyPhone} onChange={(e) => update("emergencyPhone", e.target.value)} placeholder="(11) 99999-0000" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Observações</Label>
        <Textarea value={form.observations} onChange={(e) => update("observations", e.target.value)} placeholder="Informações adicionais sobre a saúde do aluno" rows={3} />
      </div>
    </div>
  );
}
