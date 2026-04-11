import { useEffect, useState } from "react";
import { usePageTitle } from "@/hooks/use-page-title";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, School, Search } from "lucide-react";

interface Escola {
  id: string;
  name: string;
  address: string;
  phone: string;
  contactPerson: string;
}

const initialEscolas: Escola[] = [
  { id: "e1", name: "EMEF Prof. João da Silva", address: "Rua das Flores, 123 - Centro", phone: "(11) 3000-1111", contactPerson: "Maria Santos" },
  { id: "e2", name: "Escola Estadual São Paulo", address: "Av. Brasil, 456 - Jardim", phone: "(11) 3000-2222", contactPerson: "Carlos Oliveira" },
  { id: "e3", name: "EMEF Criança Feliz", address: "Rua da Paz, 789 - Vila Nova", phone: "(11) 3000-3333", contactPerson: "Ana Costa" },
];

export default function ConfigEscolasPage() {
  const { setTitle } = usePageTitle();
  useEffect(() => { setTitle("Configurações › Escolas"); }, [setTitle]);

  const [escolas, setEscolas] = useState<Escola[]>(initialEscolas);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Escola | null>(null);
  const [form, setForm] = useState({ name: "", address: "", phone: "", contactPerson: "" });

  const filtered = escolas.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", address: "", phone: "", contactPerson: "" });
    setDialogOpen(true);
  };

  const openEdit = (escola: Escola) => {
    setEditing(escola);
    setForm({ name: escola.name, address: escola.address, phone: escola.phone, contactPerson: escola.contactPerson });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) { toast({ title: "Erro", description: "Nome é obrigatório.", variant: "destructive" }); return; }
    if (editing) {
      setEscolas(prev => prev.map(e => e.id === editing.id ? { ...e, ...form } : e));
      toast({ title: "Escola atualizada" });
    } else {
      setEscolas(prev => [...prev, { id: `e${Date.now()}`, ...form }]);
      toast({ title: "Escola criada" });
    }
    setDialogOpen(false);
  };

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(escola => (
                <TableRow key={escola.id}>
                  <TableCell className="font-medium">{escola.name}</TableCell>
                  <TableCell>{escola.address}</TableCell>
                  <TableCell>{escola.phone}</TableCell>
                  <TableCell>{escola.contactPerson}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(escola)}><Pencil className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhuma escola encontrada.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Telefone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Pessoa de Contato</Label><Input value={form.contactPerson} onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))} /></div>
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
