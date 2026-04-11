import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/use-page-title";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  Search, Plus, Heart, Users, TrendingUp, ArrowUpDown,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { useDonors, useCreateDonor } from "@/hooks/use-donors";

const PAGE_SIZE = 10;

export default function DoadoresPage() {
  const { setTitle } = usePageTitle();
  const navigate = useNavigate();
  useEffect(() => { setTitle("Doadores"); }, [setTitle]);

  const { data: donors = [], isLoading } = useDonors();
  const createDonor = useCreateDonor();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "pessoa_fisica" | "pessoa_juridica">("all");
  const [sortField, setSortField] = useState<"name">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [newDonorOpen, setNewDonorOpen] = useState(false);

  // New donor form state
  const [newDonor, setNewDonor] = useState({
    name: "", email: "", phone: "", whatsapp: "",
    type: "pessoa_fisica" as "pessoa_fisica" | "pessoa_juridica",
    document: "", address: "", notes: "",
  });

  const filtered = useMemo(() => {
    let result = donors.filter(d => {
      if (typeFilter !== "all" && d.type !== typeFilter) return false;
      if (search && !d.name.toLowerCase().includes(search.toLowerCase()) && !d.email.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    result.sort((a, b) => {
      const mul = sortDir === "asc" ? 1 : -1;
      return mul * a.name.localeCompare(b.name);
    });
    return result;
  }, [donors, search, typeFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalDoadores = donors.length;

  const toggleSort = () => {
    setSortDir(d => d === "asc" ? "desc" : "asc");
  };

  useEffect(() => { setPage(1); }, [search, typeFilter]);

  const handleSaveNewDonor = async () => {
    if (!newDonor.name.trim() || !newDonor.document.trim()) {
      toast({ title: "Preencha nome e documento", variant: "destructive" });
      return;
    }
    try {
      await createDonor.mutateAsync(newDonor);
      toast({ title: "Doador cadastrado", description: newDonor.name });
      setNewDonorOpen(false);
      setNewDonor({ name: "", email: "", phone: "", whatsapp: "", type: "pessoa_fisica", document: "", address: "", notes: "" });
    } catch {
      toast({ title: "Erro ao cadastrar doador", variant: "destructive" });
    }
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Carregando doadores...</div>;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Doadores</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{totalDoadores}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pessoa Física</CardTitle>
            <Heart className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{donors.filter(d => d.type === "pessoa_fisica").length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pessoa Jurídica</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{donors.filter(d => d.type === "pessoa_juridica").length}</p></CardContent>
        </Card>
      </div>

      {/* DataTable */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Doadores</CardTitle>
            <Button onClick={() => setNewDonorOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Novo Doador
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar doador..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={typeFilter} onValueChange={v => setTypeFilter(v as any)}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="pessoa_fisica">Pessoa Física</SelectItem>
                <SelectItem value="pessoa_juridica">Pessoa Jurídica</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer select-none" onClick={toggleSort}>
                  <span className="inline-flex items-center gap-1">Doador <ArrowUpDown className="h-3 w-3" /></span>
                </TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Telefone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map(d => (
                <TableRow
                  key={d.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/financeiro/doadores/${d.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {d.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{d.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{d.type === "pessoa_fisica" ? "PF" : "PJ"}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{d.document}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{d.email}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{d.phone}</TableCell>
                </TableRow>
              ))}
              {paginated.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhum doador encontrado</TableCell></TableRow>
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">{filtered.length} resultado(s)</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">{page} / {totalPages}</span>
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Donor Dialog */}
      <Dialog open={newDonorOpen} onOpenChange={setNewDonorOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Novo Doador</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <RadioGroup value={newDonor.type} onValueChange={v => setNewDonor(prev => ({ ...prev, type: v as any, document: "" }))} className="flex gap-4">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="pessoa_fisica" id="ndt-pf" />
                  <Label htmlFor="ndt-pf" className="font-normal">Pessoa Física</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="pessoa_juridica" id="ndt-pj" />
                  <Label htmlFor="ndt-pj" className="font-normal">Pessoa Jurídica</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Nome *</Label>
                <Input value={newDonor.name} onChange={e => setNewDonor(p => ({ ...p, name: e.target.value }))} placeholder="Nome completo" />
              </div>
              <div className="space-y-1">
                <Label>{newDonor.type === "pessoa_fisica" ? "CPF *" : "CNPJ *"}</Label>
                <Input value={newDonor.document} onChange={e => setNewDonor(p => ({ ...p, document: e.target.value }))} placeholder={newDonor.type === "pessoa_fisica" ? "000.000.000-00" : "00.000.000/0001-00"} />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Email</Label>
                <Input type="email" value={newDonor.email} onChange={e => setNewDonor(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Telefone</Label>
                <Input value={newDonor.phone} onChange={e => setNewDonor(p => ({ ...p, phone: e.target.value }))} />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>WhatsApp</Label>
                <Input value={newDonor.whatsapp} onChange={e => setNewDonor(p => ({ ...p, whatsapp: e.target.value }))} placeholder="5511999999999" />
              </div>
              <div className="space-y-1">
                <Label>Endereço</Label>
                <Input value={newDonor.address} onChange={e => setNewDonor(p => ({ ...p, address: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Observações</Label>
              <Textarea value={newDonor.notes} onChange={e => setNewDonor(p => ({ ...p, notes: e.target.value }))} rows={2} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setNewDonorOpen(false)}>Cancelar</Button>
              <Button onClick={handleSaveNewDonor} disabled={createDonor.isPending}>
                {createDonor.isPending ? "Cadastrando..." : "Cadastrar Doador"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
