import { useEffect, useState } from "react";
import { usePageTitle } from "@/hooks/use-page-title";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, BookOpen, Search } from "lucide-react";
import { useClassGroups, useUpdateClassGroup } from "@/hooks/use-classes";
import type { ClassGroup, ClassSchedule } from "@/types";

const WEEKDAYS = [
  { key: 1, label: "Seg" },
  { key: 2, label: "Ter" },
  { key: 3, label: "Qua" },
  { key: 4, label: "Qui" },
  { key: 5, label: "Sex" },
  { key: 6, label: "Sáb" },
  { key: 0, label: "Dom" },
];

interface FlatSchedule {
  groupId: string;
  groupName: string;
  scheduleIndex: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

function flattenSchedules(classGroups: ClassGroup[]): FlatSchedule[] {
  const result: FlatSchedule[] = [];
  for (const group of classGroups) {
    const schedules = group.schedules || [];
    schedules.forEach((s, idx) => {
      result.push({
        groupId: group.id,
        groupName: group.name,
        scheduleIndex: idx,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
      });
    });
  }
  return result;
}

export default function ConfigAulasPage() {
  const { setTitle } = usePageTitle();
  useEffect(() => { setTitle("Configurações › Aulas"); }, [setTitle]);

  const { data: classGroups = [], isLoading } = useClassGroups();
  const updateClassGroup = useUpdateClassGroup();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FlatSchedule | null>(null);
  const [form, setForm] = useState({
    turmaId: "",
    dayOfWeek: "1",
    startTime: "14:00",
    endTime: "15:00",
  });

  const allSchedules = flattenSchedules(classGroups);
  const filtered = allSchedules.filter(s =>
    s.groupName.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => {
    setEditing(null);
    setForm({ turmaId: "", dayOfWeek: "1", startTime: "14:00", endTime: "15:00" });
    setDialogOpen(true);
  };

  const openEdit = (s: FlatSchedule) => {
    setEditing(s);
    setForm({
      turmaId: s.groupId,
      dayOfWeek: String(s.dayOfWeek),
      startTime: s.startTime,
      endTime: s.endTime,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.turmaId) {
      toast({ title: "Erro", description: "Selecione uma turma.", variant: "destructive" });
      return;
    }
    const group = classGroups.find(g => g.id === form.turmaId);
    if (!group) return;

    const newSchedule: ClassSchedule = {
      dayOfWeek: Number(form.dayOfWeek),
      startTime: form.startTime,
      endTime: form.endTime,
    };

    let updatedSchedules: ClassSchedule[];
    if (editing && editing.groupId === form.turmaId) {
      // Edit in-place on the same group
      updatedSchedules = (group.schedules || []).map((s, idx) =>
        idx === editing.scheduleIndex ? newSchedule : s
      );
    } else {
      // New schedule (or turma changed — add to target group)
      updatedSchedules = [...(group.schedules || []), newSchedule];
      // If turma changed during edit, also remove from old group
      if (editing && editing.groupId !== form.turmaId) {
        const oldGroup = classGroups.find(g => g.id === editing.groupId);
        if (oldGroup) {
          const oldSchedules = (oldGroup.schedules || []).filter((_, idx) => idx !== editing.scheduleIndex);
          try {
            await updateClassGroup.mutateAsync({ id: oldGroup.id, schedules: oldSchedules });
          } catch {
            toast({ title: "Erro", description: "Não foi possível remover da turma anterior.", variant: "destructive" });
            return;
          }
        }
      }
    }

    try {
      await updateClassGroup.mutateAsync({ id: form.turmaId, schedules: updatedSchedules });
      toast({ title: editing ? "Aula atualizada" : "Aula criada" });
      setDialogOpen(false);
    } catch {
      toast({ title: "Erro", description: "Não foi possível salvar a aula.", variant: "destructive" });
    }
  };

  const handleDelete = async (s: FlatSchedule) => {
    const dayLabel = WEEKDAYS.find(w => w.key === s.dayOfWeek)?.label || String(s.dayOfWeek);
    if (!confirm(`Deseja excluir a aula de ${s.groupName} na ${dayLabel}?`)) return;
    const group = classGroups.find(g => g.id === s.groupId);
    if (!group) return;
    const updatedSchedules = (group.schedules || []).filter((_, idx) => idx !== s.scheduleIndex);
    try {
      await updateClassGroup.mutateAsync({ id: s.groupId, schedules: updatedSchedules });
      toast({ title: "Aula excluída" });
    } catch {
      toast({ title: "Erro", description: "Não foi possível excluir a aula.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div />
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" />Nova Aula</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" />Aulas Cadastradas</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar turma..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Carregando...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Turma</TableHead>
                  <TableHead>Dia</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s, idx) => {
                  const dayLabel = WEEKDAYS.find(w => w.key === s.dayOfWeek)?.label || String(s.dayOfWeek);
                  return (
                    <TableRow key={`${s.groupId}-${s.scheduleIndex}-${idx}`}>
                      <TableCell className="font-medium">{s.groupName}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">{dayLabel}</Badge>
                      </TableCell>
                      <TableCell>{s.startTime} - {s.endTime}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(s)} disabled={updateClassGroup.isPending}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Nenhuma aula encontrada.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Aula" : "Nova Aula"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Turma *</Label>
              <Select value={form.turmaId} onValueChange={v => setForm(f => ({ ...f, turmaId: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione a turma" /></SelectTrigger>
                <SelectContent>
                  {classGroups.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Dia da Semana *</Label>
              <Select value={form.dayOfWeek} onValueChange={v => setForm(f => ({ ...f, dayOfWeek: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {WEEKDAYS.map(w => (
                    <SelectItem key={w.key} value={String(w.key)}>{w.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Hora Início</Label><Input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Hora Fim</Label><Input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={updateClassGroup.isPending}>
              {updateClassGroup.isPending ? "Salvando..." : editing ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
