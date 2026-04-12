import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, HeartPulse } from "lucide-react";
import { toast } from "sonner";
import type { HealthProfile } from "@/types";

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

interface Props {
  healthProfile?: HealthProfile;
}

type HealthForm = {
  allergies: string;
  medications: string;
  conditions: string;
  bloodType: string;
  observations: string;
};

const emptyForm: HealthForm = {
  allergies: "", medications: "", conditions: "", bloodType: "", observations: "",
};

export function TabSaude({ healthProfile }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<HealthForm>(
    healthProfile
      ? {
          allergies: healthProfile.allergies || "",
          medications: healthProfile.medications || "",
          conditions: healthProfile.conditions || "",
          bloodType: healthProfile.bloodType || "",
          observations: healthProfile.observations || "",
        }
      : emptyForm
  );

  const update = (field: keyof HealthForm, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = () => {
    toast.success(healthProfile ? "Ficha de saúde atualizada!" : "Ficha de saúde adicionada!");
    setOpen(false);
  };

  if (!healthProfile) {
    return (
      <Card>
        <CardContent className="pt-6 flex flex-col items-center justify-center py-12 gap-4">
          <HeartPulse className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">Nenhuma ficha de saúde cadastrada.</p>
          <Button onClick={() => setOpen(true)}>Adicionar Ficha de Saúde</Button>

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
          <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" /> Editar
          </Button>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {healthProfile.bloodType && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tipo Sanguíneo</span>
              <span>{healthProfile.bloodType}</span>
            </div>
          )}
          {healthProfile.allergies && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Alergias</span>
              <span>{healthProfile.allergies}</span>
            </div>
          )}
          {healthProfile.medications && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Medicamentos</span>
              <span>{healthProfile.medications}</span>
            </div>
          )}
          {healthProfile.conditions && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Condições de Saúde</span>
              <span>{healthProfile.conditions}</span>
            </div>
          )}
          {healthProfile.observations && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Observações</span>
              <span className="text-right max-w-xs">{healthProfile.observations}</span>
            </div>
          )}
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

function HealthForm({ form, update }: { form: HealthForm; update: (field: keyof HealthForm, value: string) => void }) {
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
      <div className="space-y-2">
        <Label>Observações</Label>
        <Textarea value={form.observations} onChange={(e) => update("observations", e.target.value)} placeholder="Informações adicionais sobre a saúde do aluno" rows={3} />
      </div>
    </div>
  );
}
