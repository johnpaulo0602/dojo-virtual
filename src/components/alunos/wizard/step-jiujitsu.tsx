import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Link } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { BeltDisplay } from "@/components/alunos/belt-display";
import { belts } from "@/config/belts";
import { useClassGroups } from "@/hooks/use-classes";
import type { JiuJitsuStep } from "@/schemas/student";
import { cn } from "@/lib/utils";

export function StepJiuJitsu() {
  const { watch, setValue, formState: { errors } } = useFormContext<JiuJitsuStep>();
  const beltName = watch("beltName") || "white_belt";
  const beltDegree = watch("beltDegree") || 0;
  const classGroupId = watch("classGroupId");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBelt, setSelectedBelt] = useState(beltName);
  const [selectedDegree, setSelectedDegree] = useState(beltDegree);

  const { data: classGroups = [] } = useClassGroups();
  const currentBelt = belts.find((b) => b.name === selectedBelt);

  const confirmBelt = () => {
    setValue("beltName", selectedBelt);
    setValue("beltDegree", selectedDegree);
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/50">Jiu-Jitsu</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Data de Início *</Label>
          <Input id="startDate" type="date" value={watch("startDate") || ""}
            className="h-10 rounded-xl"
            onChange={(e) => setValue("startDate", e.target.value)} />
          {errors.startDate && <p className="text-xs font-medium text-destructive">{errors.startDate.message}</p>}
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Turma</Label>
          {classGroups.length === 0 ? (
            <p className="text-sm text-muted-foreground pt-2">
              Nenhuma turma cadastrada.{" "}
              <Link to="/configuracoes/turmas" className="underline text-primary hover:text-primary/80">
                Cadastrar turma
              </Link>
            </p>
          ) : (
            <Select value={classGroupId || ""} onValueChange={(v) => setValue("classGroupId", v)}>
              <SelectTrigger className="h-10 rounded-xl">
                <SelectValue placeholder="Selecione a turma (opcional)" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {classGroups.map((c) => {
                  const scheduleStr = (c.schedules ?? []).map(s => {
                    const days = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
                    return `${days[s.dayOfWeek] ?? s.dayOfWeek} ${s.startTime}`;
                  }).join(", ");
                  return (
                    <SelectItem key={c.id} value={c.id} className="rounded-lg">{c.name}{scheduleStr ? ` — ${scheduleStr}` : ""}</SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Faixa Inicial</Label>
        <div className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-border/60 bg-muted/5">
          <BeltDisplay beltName={beltName} degree={beltDegree} size="md" />
          <Button type="button" variant="outline" size="sm" className="ml-auto h-8 rounded-lg" onClick={() => {
            setSelectedBelt(beltName);
            setSelectedDegree(beltDegree);
            setDialogOpen(true);
          }}>
            Alterar Faixa
          </Button>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight">Selecionar Faixa</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4">
            {belts.map((b) => (
              <button
                key={b.name}
                type="button"
                onClick={() => { setSelectedBelt(b.name); setSelectedDegree(0); }}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3 text-left transition-all",
                  selectedBelt === b.name ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border hover:border-primary/50 hover:bg-muted/30"
                )}
              >
                <div
                  className={cn("size-6 w-10 rounded-sm border border-border/30 shadow-sm", b.color)}
                />
                <span className="text-sm font-bold tracking-tight">{b.label}</span>
              </button>
            ))}
          </div>

          {currentBelt && (
            <div className="space-y-4 pt-2 border-t border-border/50">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Grau na Faixa</Label>
                <Select value={String(selectedDegree)} onValueChange={(v) => setSelectedDegree(Number(v))}>
                  <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {Array.from({ length: currentBelt.degrees.quantity + 1 }).map((_, i) => (
                      <SelectItem key={i} value={String(i)} className="rounded-lg">{i === 0 ? "Sem grau" : `${i}º grau`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-center p-6 bg-muted/30 rounded-2xl border border-border/30">
                <BeltDisplay beltName={selectedBelt} degree={selectedDegree} size="md" />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)} className="rounded-xl">Cancelar</Button>
            <Button type="button" onClick={confirmBelt} className="rounded-xl px-8 font-bold">Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
