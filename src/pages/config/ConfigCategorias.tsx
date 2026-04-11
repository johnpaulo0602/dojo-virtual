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
import { Plus, Pencil, Tag, Search } from "lucide-react";

interface Categoria {
  id: string;
  name: string;
  type: "receita" | "despesa";
  description: string;
}

const initialCategorias: Categoria[] = [
  { id: "c1", name: "Doações", type: "receita", description: "Doações de pessoas físicas e jurídicas" },
  { id: "c2", name: "Patrocínio", type: "receita", description: "Patrocínios de empresas parceiras" },
  { id: "c3", name: "Eventos", type: "receita", description: "Receita de eventos e competições" },
  { id: "c4", name: "Venda de Materiais", type: "receita", description: "Venda de kimonos e equipamentos" },
  { id: "c5", name: "Material Esportivo", type: "despesa", description: "Compra de kimonos, faixas e equipamentos" },
  { id: "c6", name: "Transporte", type: "despesa", description: "Transporte para competições e eventos" },
  { id: "c7", name: "Alimentação", type: "despesa", description: "Lanches e refeições para alunos" },
  { id: "c8", name: "Infraestrutura", type: "despesa", description: "Manutenção do espaço e equipamentos" },
  { id: "c9", name: "Salários", type: "despesa", description: "Pagamento de instrutores e monitores" },
];

export default function ConfigCategoriasPage() {
  const { setTitle } = usePageTitle();
  useEffect(() => { setTitle("Configurações › Categorias"); }, [setTitle]);

  const [categorias, setCategorias] = useState<Categoria[]>(initialCategorias);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "receita" | "despesa">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Categoria | null>(null);
  const [form, setForm] = useState({ name: "", type: "receita" as "receita" | "despesa", description: "" });

  const filtered = categorias
    .filter(c => filterType === "all" || c.type === filterType)
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", type: "receita", description: "" });
    setDialogOpen(true);
  };

  const openEdit = (cat: Categoria) => {
    setEditing(cat);
    setForm({ name: cat.name, type: cat.type, description: cat.description });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) { toast({ title: "Erro", description: "Nome é obrigatório.", variant: "destructive" }); return; }
    if (editing) {
      setCategorias(prev => prev.map(c => c.id === editing.id ? { ...c, ...form } : c));
      toast({ title: "Categoria atualizada" });
    } else {
      setCategorias(prev => [...prev, { id: `c${Date.now()}`, ...form }]);
      toast({ title: "Categoria criada" });
    }
    setDialogOpen(false);
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="w-16" />
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
                    <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}><Pencil className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Nenhuma categoria encontrada.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
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
            <Button onClick={handleSave}>{editing ? "Salvar" : "Criar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
