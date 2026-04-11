import { useEffect, useState } from "react";
import { usePageTitle } from "@/hooks/use-page-title";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, School, Search } from "lucide-react";
import { useSchools, useCreateSchool, useUpdateSchool, useDeleteSchool } from "@/hooks/use-students";
import type { School as SchoolType } from "@/hooks/use-students";

export default function ConfigEscolasPage() {
  const { setTitle } = usePageTitle();
  useEffect(() => { setTitle("Configurações › Escolas"); }, [setTitle]);

  const { data: escolas = [], isLoading } = useSchools();
  const createSchool = useCreateSchool();
  const updateSchool = useUpdateSchool();
  const deleteSchool = useDeleteSchool();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SchoolType | null>(null);
  const [form, setForm] = useState({ name: "", address: "" });

  const filtered = escolas.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", address: "" });
    setDialogOpen(true);
  };

  const openEdit = (escola: SchoolType) => {
    setEditing(escola);
    setForm({ name: escola.name, address: escola.address || "" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: "Erro", description: "Nome é obrigatório.", variant: "destructive" });
      return;
    }
    try {
      if (editing) {
        await updateSchool.mutateAsync({ id: editing.id, name: form.name, address: form.address });
        toast({ title: "Escola atualizada" });
      } else {
        await createSchool.mutateAsync({ name: form.name, address: form.address });
        toast({ title: "Escola criada" });
      }
      setDialogOpen(false);
    } catch {
      toast({ title: "Erro", description: "Não foi possível salvar a escola.", variant: "destructive" });
    }
  };

  const handleDelete = async (escola: SchoolType) => {
    if (!confirm(`Deseja excluir a escola "${escola.name}"?`)) return;
    try {
      await deleteSchool.mutateAsync(escola.id);
      toast({ title: "Escola excluída" });
    } catch {
      toast({ title: "Erro", description: "Não foi possível excluir a escola.", variant: "destructive" });
    }
  };

  const isSaving = createSchool.isPending || updateSchool.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div />
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" />Nova Escola</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2"><School className="h-5 w-5 text-primary" />Escolas Cadastradas</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar escola..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
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
                  <TableHead>Endereço</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(escola => (
                  <TableRow key={escola.id}>
                    <TableCell className="font-medium">{escola.name}</TableCell>
                    <TableCell>{escola.address || "—"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(escola)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(escola)} disabled={deleteSchool.isPending}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">Nenhuma escola encontrada.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Escola" : "Nova Escola"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Nome *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Endereço</Label><Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
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
