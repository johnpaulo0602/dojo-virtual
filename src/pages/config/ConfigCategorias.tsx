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
import { Plus, Pencil, Trash2, Tag, Search } from "lucide-react";
import { useCategories, useSaveCategories } from "@/hooks/use-categories";
import type { FinancialCategory } from "@/hooks/use-categories";

export default function ConfigCategoriasPage() {
  const { setTitle } = usePageTitle();
  useEffect(() => { setTitle("Configurações › Categorias"); }, [setTitle]);

  const { data: serverCategories = [], isLoading } = useCategories();
  const saveCategories = useSaveCategories();

  const [categorias, setCategorias] = useState<FinancialCategory[]>([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "receita" | "despesa">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FinancialCategory | null>(null);
  const [form, setForm] = useState({ name: "", type: "receita" as "receita" | "despesa", description: "" });

  useEffect(() => {
    setCategorias(serverCategories);
  }, [serverCategories]);

  const filtered = categorias
    .filter(c => filterType === "all" || c.type === filterType)
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", type: "receita", description: "" });
    setDialogOpen(true);
  };

  const openEdit = (cat: FinancialCategory) => {
    setEditing(cat);
    setForm({ name: cat.name, type: cat.type, description: cat.description });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: "Erro", description: "Nome é obrigatório.", variant: "destructive" });
      return;
    }
    let updated: FinancialCategory[];
    if (editing) {
      updated = categorias.map(c => c.id === editing.id ? { ...c, ...form } : c);
    } else {
      updated = [...categorias, { id: `c${Date.now()}`, ...form }];
    }
    setCategorias(updated);
    try {
      await saveCategories.mutateAsync(updated);
      toast({ title: editing ? "Categoria atualizada" : "Categoria criada" });
    } catch {
      toast({ title: "Erro", description: "Não foi possível salvar as categorias.", variant: "destructive" });
    }
    setDialogOpen(false);
  };

  const handleDelete = async (cat: FinancialCategory) => {
    if (!confirm(`Deseja excluir a categoria "${cat.name}"?`)) return;
    const updated = categorias.filter(c => c.id !== cat.id);
    setCategorias(updated);
    try {
      await saveCategories.mutateAsync(updated);
      toast({ title: "Categoria excluída" });
    } catch {
      toast({ title: "Erro", description: "Não foi possível excluir a categoria.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select value={filterType} onValueChange={v => setFilterType(v as typeof filterType)}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="receita">Receitas</SelectItem>
              <SelectItem value="despesa">Despesas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" />Nova Categoria</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Tag className="h-5 w-5 text-primary" />Categorias Financeiras</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar categoria..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
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
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(cat => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell>
                      <Badge variant={cat.type === "receita" ? "default" : "secondary"}>
                        {cat.type === "receita" ? "Receita" : "Despesa"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{cat.description}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(cat)} disabled={saveCategories.isPending}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Nenhuma categoria encontrada.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Nome *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as "receita" | "despesa" }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Descrição</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saveCategories.isPending}>
              {saveCategories.isPending ? "Salvando..." : editing ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
