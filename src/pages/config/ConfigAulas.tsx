import { useEffect, useState } from "react";
import { usePageTitle } from "@/hooks/use-page-title";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, BookOpen, Search, X } from "lucide-react";
import { useUsers } from "@/hooks/use-users";
import { cn } from "@/lib/utils";

const WEEKDAYS = [
  { key: 1, label: "Seg" },
  { key: 2, label: "Ter" },
  { key: 3, label: "Qua" },
  { key: 4, label: "Qui" },
  { key: 5, label: "Sex" },
  { key: 6, label: "Sáb" },
  { key: 0, label: "Dom" },
];

const turmaOptions = [
  { id: "t1", name: "Kids Iniciante" },
  { id: "t2", name: "Kids Avançado" },
  { id: "t3", name: "Juvenil" },
  { id: "t4", name: "Competição" },
];

interface Aula {
  id: string;
  turmaId: string;
  turmaName: string;
  weekdays: number[];
  startTime: string;
  endTime: string;
  instructorIds: string[];
  monitorIds: string[];
  description: string;
}

const initialAulas: Aula[] = [
  { id: "a1", turmaId: "t1", turmaName: "Kids Iniciante", weekdays: [1, 3], startTime: "14:00", endTime: "15:00", instructorIds: ["tm1"], monitorIds: ["tm3"], description: "Aula focada em técnicas básicas de solo e fundamentos do Jiu-Jitsu." },
  { id: "a2", turmaId: "t3", turmaName: "Juvenil", weekdays: [2, 4, 6], startTime: "16:00", endTime: "17:30", instructorIds: ["tm2"], monitorIds: ["tm4"], description: "Treino de raspagens e passagens de guarda para nível intermediário." },
  { id: "a3", turmaId: "t2", turmaName: "Kids Avançado", weekdays: [1, 3, 5], startTime: "15:00", endTime: "16:00", instructorIds: ["tm1", "tm2"], monitorIds: [], description: "Passagem de guarda e técnicas avançadas." },
];

function getTeamNames(ids: string[], list: { id: string; name: string }[]) {
  return ids.map(id => list.find(m => m.id === id)?.name).filter(Boolean).join(", ");
}

export default function ConfigAulasPage() {
  const { setTitle } = usePageTitle();
  useEffect(() => { setTitle("Configurações › Aulas"); }, [setTitle]);

  const { data: usersData = [] } = useUsers("instrutor,monitor");
  const instrutores = usersData.filter(u => u.role === "instrutor");
  const monitores = usersData.filter(u => u.role === "monitor");
  const [aulas, setAulas] = useState<Aula[]>(initialAulas);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Aula | null>(null);
  const [form, setForm] = useState({
    turmaId: "",
    weekdays: [] as number[],
    startTime: "14:00",
    endTime: "15:00",
    instructorIds: [] as string[],
    monitorIds: [] as string[],
    description: "",
  });

  const filtered = aulas.filter(a =>
    a.turmaName.toLowerCase().includes(search.toLowerCase()) ||
    a.description.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => {
    setEditing(null);
    setForm({ turmaId: "", weekdays: [], startTime: "14:00", endTime: "15:00", instructorIds: [], monitorIds: [], description: "" });
    setDialogOpen(true);
  };

  const openEdit = (aula: Aula) => {
    setEditing(aula);
    setForm({
      turmaId: aula.turmaId,
      weekdays: aula.weekdays,
      startTime: aula.startTime,
      endTime: aula.endTime,
      instructorIds: aula.instructorIds,
      monitorIds: aula.monitorIds,
      description: aula.description,
    });
    setDialogOpen(true);
  };

  const toggleWeekday = (day: number) => {
    setForm(f => ({
      ...f,
      weekdays: f.weekdays.includes(day) ? f.weekdays.filter(d => d !== day) : [...f.weekdays, day],
    }));
  };

  const toggleMultiSelect = (field: "instructorIds" | "monitorIds", id: string) => {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(id) ? f[field].filter(v => v !== id) : [...f[field], id],
    }));
  };

  const handleSave = () => {
    if (!form.turmaId) { toast({ title: "Erro", description: "Selecione uma turma.", variant: "destructive" }); return; }
    if (form.weekdays.length === 0) { toast({ title: "Erro", description: "Selecione ao menos um dia da semana.", variant: "destructive" }); return; }
    if (form.instructorIds.length === 0) { toast({ title: "Erro", description: "Selecione ao menos um instrutor.", variant: "destructive" }); return; }

    const turma = turmaOptions.find(t => t.id === form.turmaId);
    const data: Omit<Aula, "id"> = {
      turmaId: form.turmaId,
      turmaName: turma?.name || "",
      weekdays: form.weekdays,
      startTime: form.startTime,
      endTime: form.endTime,
      instructorIds: form.instructorIds,
      monitorIds: form.monitorIds,
      description: form.description,
    };

    if (editing) {
      setAulas(prev => prev.map(a => a.id === editing.id ? { ...a, ...data } : a));
      toast({ title: "Aula atualizada" });
    } else {
      setAulas(prev => [...prev, { id: `a${Date.now()}`, ...data }]);
      toast({ title: "Aula criada" });
    }
    setDialogOpen(false);
  };

  const weekdayLabel = (days: number[]) =>
    WEEKDAYS.filter(w => days.includes(w.key)).map(w => w.label).join(", ");

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
              <Input placeholder="Buscar aula..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Turma</TableHead>
                <TableHead>Dias</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead>Instrutores</TableHead>
                <TableHead>Monitores</TableHead>
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(aula => (
                <TableRow key={aula.id}>
                  <TableCell className="font-medium">{aula.turmaName}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {WEEKDAYS.filter(w => aula.weekdays.includes(w.key)).map(w => (
                        <Badge key={w.key} variant="secondary" className="text-xs">{w.label}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{aula.startTime} - {aula.endTime}</TableCell>
                  <TableCell className="text-sm">{getTeamNames(aula.instructorIds, usersData) || "—"}</TableCell>
                  <TableCell className="text-sm">{getTeamNames(aula.monitorIds, usersData) || "—"}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(aula)}><Pencil className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhuma aula encontrada.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Aula" : "Nova Aula"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Turma */}
            <div className="space-y-2">
              <Label>Turma *</Label>
              <Select value={form.turmaId} onValueChange={v => setForm(f => ({ ...f, turmaId: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione a turma" /></SelectTrigger>
                <SelectContent>
                  {turmaOptions.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Dias da semana */}
            <div className="space-y-2">
              <Label>Dias da Semana *</Label>
              <div className="flex gap-2">
                {WEEKDAYS.map(w => (
                  <button
                    key={w.key}
                    type="button"
                    onClick={() => toggleWeekday(w.key)}
                    className={cn(
                      "w-10 h-10 rounded-md border text-sm font-medium transition-colors",
                      form.weekdays.includes(w.key)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:bg-accent"
                    )}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Horário */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Hora Início</Label><Input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Hora Fim</Label><Input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} /></div>
            </div>

            {/* Instrutores multiselect */}
            <div className="space-y-2">
              <Label>Instrutores *</Label>
              <div className="space-y-2">
                {form.instructorIds.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {form.instructorIds.map(id => {
                      const m = instrutores.find(i => i.id === id);
                      return m ? (
                        <Badge key={id} variant="secondary" className="gap-1">
                          {m.name}
                          <button type="button" onClick={() => toggleMultiSelect("instructorIds", id)} className="ml-1 hover:text-destructive"><X className="h-3 w-3" /></button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
                <div className="border rounded-md p-2 max-h-32 overflow-y-auto space-y-1">
                  {instrutores.map(i => (
                    <label key={i.id} className="flex items-center gap-2 cursor-pointer text-sm py-1 px-1 rounded hover:bg-accent">
                      <Checkbox checked={form.instructorIds.includes(i.id)} onCheckedChange={() => toggleMultiSelect("instructorIds", i.id)} />
                      {i.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Monitores multiselect */}
            <div className="space-y-2">
              <Label>Monitores</Label>
              <div className="space-y-2">
                {form.monitorIds.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {form.monitorIds.map(id => {
                      const m = monitores.find(i => i.id === id);
                      return m ? (
                        <Badge key={id} variant="secondary" className="gap-1">
                          {m.name}
                          <button type="button" onClick={() => toggleMultiSelect("monitorIds", id)} className="ml-1 hover:text-destructive"><X className="h-3 w-3" /></button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
                <div className="border rounded-md p-2 max-h-32 overflow-y-auto space-y-1">
                  {monitores.map(m => (
                    <label key={m.id} className="flex items-center gap-2 cursor-pointer text-sm py-1 px-1 rounded hover:bg-accent">
                      <Checkbox checked={form.monitorIds.includes(m.id)} onCheckedChange={() => toggleMultiSelect("monitorIds", m.id)} />
                      {m.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Ex: Aula focada em técnicas de solo e fundamentos para iniciantes no Jiu-Jitsu."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>{editing ? "Salvar" : "Criar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
