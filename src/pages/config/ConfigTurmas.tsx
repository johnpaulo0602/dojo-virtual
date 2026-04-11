import { useEffect, useState } from "react";
import { usePageTitle } from "@/hooks/use-page-title";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Calendar, Search } from "lucide-react";
import { useUsers } from "@/hooks/use-users";

interface Turma {
  id: string;
  name: string;
  instructorId: string;
  instructorName: string;
  ageMin: number;
  ageMax: number;
  capacity: number;
  status: "ativa" | "inativa";
}

const initialTurmas: Turma[] = [
  { id: "t1", name: "Kids Iniciante", instructorId: "tm1", instructorName: "Rafael Silva", ageMin: 6, ageMax: 9, capacity: 25, status: "ativa" },
  { id: "t2", name: "Kids Avançado", instructorId: "tm2", instructorName: "Camila Souza", ageMin: 8, ageMax: 12, capacity: 20, status: "ativa" },
  { id: "t3", name: "Juvenil", instructorId: "tm1", instructorName: "Rafael Silva", ageMin: 12, ageMax: 16, capacity: 30, status: "ativa" },
  { id: "t4", name: "Competição", instructorId: "tm2", instructorName: "Camila Souza", ageMin: 10, ageMax: 16, capacity: 15, status: "inativa" },
];

export default function ConfigTurmasPage() {
  const { setTitle } = usePageTitle();
  useEffect(() => { setTitle("Configurações › Turmas"); }, [setTitle]);

  const { data: usersData = [] } = useUsers("instrutor");
  const instrutores = usersData;
  const [turmas, setTurmas] = useState<Turma[]>(initialTurmas);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Turma | null>(null);
  const [form, setForm] = useState({
    name: "",
    instructorId: "",
    ageRange: [6, 12] as [number, number],
    capacity: "20",
    status: "ativa" as "ativa" | "inativa",
  });

  const filtered = turmas.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", instructorId: "", ageRange: [6, 12], capacity: "20", status: "ativa" });
    setDialogOpen(true);
  };

  const openEdit = (turma: Turma) => {
    setEditing(turma);
    setForm({
      name: turma.name,
      instructorId: turma.instructorId,
      ageRange: [turma.ageMin, turma.ageMax],
      capacity: String(turma.capacity),
      status: turma.status,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) { toast({ title: "Erro", description: "Nome é obrigatório.", variant: "destructive" }); return; }
    if (!form.instructorId) { toast({ title: "Erro", description: "Selecione um instrutor principal.", variant: "destructive" }); return; }
    const instructor = instrutores.find(i => i.id === form.instructorId);
    const data = {
      name: form.name,
      instructorId: form.instructorId,
      instructorName: instructor?.name || "",
      ageMin: form.ageRange[0],
      ageMax: form.ageRange[1],
      capacity: Number(form.capacity),
      status: form.status,
    };
    if (editing) {
      setTurmas(prev => prev.map(t => t.id === editing.id ? { ...t, ...data } : t));
      toast({ title: "Turma atualizada" });
    } else {
      setTurmas(prev => [...prev, { id: `t${Date.now()}`, ...data }]);
      toast({ title: "Turma criada" });
    }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div />
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" />Nova Turma</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" />Turmas Cadastradas</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar turma..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Instrutor Principal</TableHead>
                <TableHead>Faixa Etária</TableHead>
                <TableHead>Capacidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(turma => (
                <TableRow key={turma.id}>
                  <TableCell className="font-medium">{turma.name}</TableCell>
                  <TableCell>{turma.instructorName}</TableCell>
                  <TableCell>{turma.ageMin}-{turma.ageMax} anos</TableCell>
                  <TableCell>{turma.capacity}</TableCell>
                  <TableCell>
                    <Badge variant={turma.status === "ativa" ? "default" : "secondary"}>
                      {turma.status === "ativa" ? "Ativa" : "Inativa"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(turma)}><Pencil className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhuma turma encontrada.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Turma" : "Nova Turma"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Instrutor Principal *</Label>
              <Select value={form.instructorId} onValueChange={v => setForm(f => ({ ...f, instructorId: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione o instrutor" /></SelectTrigger>
                <SelectContent>
                  {instrutores.map(i => (
                    <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label>Faixa Etária: {form.ageRange[0]} - {form.ageRange[1]} anos</Label>
              <Slider
                min={3}
                max={18}
                step={1}
                value={form.ageRange}
                onValueChange={(v) => setForm(f => ({ ...f, ageRange: v as [number, number] }))}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>3 anos</span>
                <span>18 anos</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Capacidade</Label>
                <Input type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as "ativa" | "inativa" }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativa">Ativa</SelectItem>
                    <SelectItem value="inativa">Inativa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
