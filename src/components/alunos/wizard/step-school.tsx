import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useSchools, type School } from "@/hooks/use-students";
import type { SchoolStep } from "@/schemas/student";

export function StepSchool() {
  const { watch, setValue, formState: { errors } } = useFormContext<SchoolStep>();
  const schoolId = watch("schoolId");
  const schoolLevel = watch("schoolLevel");
  const schoolShift = watch("schoolShift");
  const { data: fetchedSchools = [] } = useSchools();
  const [extraSchools, setExtraSchools] = useState<School[]>([]);
  const schools = [...fetchedSchools, ...extraSchools];
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newSchool, setNewSchool] = useState({ name: "", address: "" });

  const addSchool = () => {
    if (!newSchool.name) return;
    const s: School = { id: `sc-new-${Date.now()}`, name: newSchool.name, address: newSchool.address };
    setExtraSchools(prev => [...prev, s]);
    setValue("schoolId", s.id);
    setNewSchool({ name: "", address: "" });
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Informações Escolares</h3>
        <Button type="button" variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nova Escola
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2 space-y-2">
          <Label>Escola *</Label>
          <Select value={schoolId} onValueChange={(v) => setValue("schoolId", v)}>
            <SelectTrigger><SelectValue placeholder="Selecione a escola" /></SelectTrigger>
            <SelectContent>
              {schools.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.schoolId && <p className="text-sm text-destructive">{errors.schoolId.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Nível de Ensino</Label>
          <Select value={schoolLevel || ""} onValueChange={(v) => setValue("schoolLevel", v)}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Educação Infantil">Educação Infantil</SelectItem>
              <SelectItem value="Fundamental I">Fundamental I</SelectItem>
              <SelectItem value="Fundamental II">Fundamental II</SelectItem>
              <SelectItem value="Ensino Médio">Ensino Médio</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="schoolYear">Ano / Série</Label>
          <Input id="schoolYear" {...({ ...{} })} placeholder="Ex: 5º ano"
            value={watch("schoolYear") || ""} onChange={(e) => setValue("schoolYear", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Turno</Label>
          <Select value={schoolShift || ""} onValueChange={(v) => setValue("schoolShift", v)}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Manhã">Manhã</SelectItem>
              <SelectItem value="Tarde">Tarde</SelectItem>
              <SelectItem value="Integral">Integral</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova Escola</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome da Escola *</Label>
              <Input value={newSchool.name} onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Endereço</Label>
              <Input value={newSchool.address} onChange={(e) => setNewSchool({ ...newSchool, address: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button type="button" onClick={addSchool} disabled={!newSchool.name}>Cadastrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
