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
import { Plus, Pencil, Trash2, Calendar, Search } from "lucide-react";
import { useUsers } from "@/hooks/use-users";
import { useClassGroups, useCreateClassGroup, useUpdateClassGroup, useDeleteClassGroup } from "@/hooks/use-classes";
import type { ClassGroup } from "@/types";

function parseAgeRange(ageRange: string | undefined): [number, number] {
  if (!ageRange) return [6, 12];
  const parts = ageRange.split("-");
  if (parts.length === 2) {
    const min = parseInt(parts[0], 10);
    const max = parseInt(parts[1], 10);
    if (!isNaN(min) && !isNaN(max)) return [min, max];
  }
  return [6, 12];
}

export default function ConfigTurmasPage() {
  const { setTitle } = usePageTitle();
  useEffect(() => { setTitle("Configurações › Turmas"); }, [setTitle]);

  const { data: usersData = [] } = useUsers("instrutor");
  const instrutores = usersData;
  const { data: classGroups = [], isLoading } = useClassGroups();
  const createClassGroup = useCreateClassGroup();
  const updateClassGroup = useUpdateClassGroup();
  const deleteClassGroup = useDeleteClassGroup();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ClassGroup | null>(null);
  const [form, setForm] = useState({
    name: "",
    instructorId: "",
    ageRange: [6, 12] as [number, number],
    capacity: "20",
    status: "ativa" as "ativa" | "inativa",
  });

  const filtered = classGroups.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", instructorId: "", ageRange: [6, 12], capacity: "20", status: "ativa" });
    setDialogOpen(true);
  };

  const openEdit = (group: ClassGroup) => {
    setEditing(group);
    setForm({
      name: group.name,
      instructorId: group.instructorId,
      ageRange: parseAgeRange(group.ageRange),
      capacity: String(group.capacity),
      status: group.status,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: "Erro", description: "Nome é obrigatório.", variant: "destructive" });
      return;
    }
    if (!form.instructorId) {
      toast({ title: "Erro", description: "Selecione um instrutor principal.", variant: "destructive" });
      return;
    }
    const instructor = instrutores.find(i => i.id === form.instructorId);
    const payload = {
      name: form.name,
      instructorId: form.instructorId,
      instructorName: instructor?.name || "",
      location: "—",
      capacity: Number(form.capacity),
      status: form.status,
      ageRange: `${form.ageRange[0]}-${form.ageRange[1]}`,
    };
    try {
      if (editing) {
        await updateClassGroup.mutateAsync({ id: editing.id, ...payload });
        toast({ title: "Turma atualizada" });
      } else {
        await createClassGroup.mutateAsync(payload);
        toast({ title: "Turma criada" });
      }
      setDialogOpen(false);
    } catch {
      toast({ title: "Erro", description: "Não foi possível salvar a turma.", variant: "destructive" });
    }
  };

  const handleDelete = async (group: ClassGroup) => {
    if (!confirm(`Deseja excluir a turma "${group.name}"?`)) return;
    try {
      await deleteClassGroup.mutateAsync(group.id);
      toast({ title: "Turma excluída" });
    } catch {
      toast({ title: "Erro", description: "Não foi possível excluir a turma.", variant: "destructive" });
    }
  };

  const isSaving = createClassGroup.isPending || updateClassGroup.isPending;

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
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Carregando...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Instrutor Principal</TableHead>
                  <TableHead>Faixa Etária</TableHead>
                  <TableHead>Capacidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(group => (
                  <TableRow key={group.id}>
                    <TableCell className="font-medium">{group.name}</TableCell>
                    <TableCell>{group.instructorName || "—"}</TableCell>
                    <TableCell>{group.ageRange ? `${group.ageRange} anos` : "—"}</TableCell>
                    <TableCell>{group.capacity}</TableCell>
                    <TableCell>
                      <Badge variant={group.status === "ativa" ? "default" : "secondary"}>
                        {group.status === "ativa" ? "Ativa" : "Inativa"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(group)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(group)} disabled={deleteClassGroup.isPending}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhuma turma encontrada.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
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
            <Button onClick={handleSave} disabled={isSaving}>{isSaving ? "Salvando..." : editing ? "Salvar" : "Criar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
