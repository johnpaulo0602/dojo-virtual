import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Star } from "lucide-react";
import type { GuardiansStep, GuardianData } from "@/schemas/student";

function cpfMask(v: string) {
  return v.replace(/\D/g, "").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})/, "$1-$2").slice(0, 14);
}
function phoneMask(v: string) {
  return v.replace(/\D/g, "").replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2").slice(0, 15);
}

const relationshipLabels: Record<string, string> = { mae: "Mãe", pai: "Pai", outro: "Outro" };

export function StepGuardians() {
  const { watch, setValue, formState: { errors } } = useFormContext<GuardiansStep>();
  const guardians = watch("guardians") || [];
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<Partial<GuardianData>>({});

  const addGuardian = () => {
    if (!form.name || !form.cpf || !form.relationship || !form.phone) return;
    const g: GuardianData = {
      name: form.name, cpf: form.cpf, relationship: form.relationship as GuardianData["relationship"],
      phone: form.phone, email: form.email || "", profession: form.profession || "",
      isPrimary: guardians.length === 0,
    };
    setValue("guardians", [...guardians, g]);
    setForm({});
    setDialogOpen(false);
  };

  const removeGuardian = (idx: number) => {
    const updated = guardians.filter((_, i) => i !== idx);
    if (updated.length === 1) updated[0].isPrimary = true;
    setValue("guardians", updated);
  };

  const makePrimary = (idx: number) => {
    const updated = guardians.map((g, i) => ({ ...g, isPrimary: i === idx }));
    setValue("guardians", updated);
  };

  const hasGuardiansError = errors.guardians && "message" in errors.guardians;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-foreground">Responsáveis</h3>
          <p className="text-sm text-muted-foreground">Mínimo 1, máximo 2 responsáveis</p>
        </div>
        {guardians.length < 2 && (
          <Button type="button" variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar
          </Button>
        )}
      </div>

      {hasGuardiansError && (
        <p className="text-sm text-destructive">{(errors.guardians as any).message}</p>
      )}

      {guardians.length === 0 ? (
        <div className="rounded-md border border-dashed p-8 text-center text-muted-foreground">
          Nenhum responsável adicionado
        </div>
      ) : (
        <div className="space-y-3">
          {guardians.map((g, i) => (
            <div key={i} className="flex items-center justify-between rounded-md border p-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{g.name}</span>
                  <Badge variant="secondary">{relationshipLabels[g.relationship]}</Badge>
                  {g.isPrimary && <Badge variant="default"><Star className="mr-1 h-3 w-3" />Principal</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{g.cpf} · {g.phone}</p>
              </div>
              <div className="flex gap-1">
                {!g.isPrimary && (
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => makePrimary(i)} title="Tornar principal">
                    <Star className="h-4 w-4" />
                  </Button>
                )}
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeGuardian(i)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Adicionar Responsável</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label>CPF *</Label>
              <Input placeholder="000.000.000-00" value={form.cpf || ""}
                onChange={(e) => setForm({ ...form, cpf: cpfMask(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Nome completo *</Label>
              <Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Vínculo *</Label>
              <Select value={form.relationship || ""} onValueChange={(v) => setForm({ ...form, relationship: v as "mae" | "pai" | "outro" })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mae">Mãe</SelectItem>
                  <SelectItem value="pai">Pai</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Telefone *</Label>
              <Input placeholder="(00) 00000-0000" value={form.phone || ""}
                onChange={(e) => setForm({ ...form, phone: phoneMask(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Profissão</Label>
              <Input value={form.profession || ""} onChange={(e) => setForm({ ...form, profession: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button type="button" onClick={addGuardian}
              disabled={!form.name || !form.cpf || !form.relationship || !form.phone}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
