import { useEffect, useMemo, useState } from "react";
import { usePageTitle } from "@/hooks/use-page-title";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Plus, TrendingDown, ArrowUpDown, MoreHorizontal, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useFinancialTransactions } from "@/hooks/use-finance";
import { TransactionFormDialog } from "@/components/financeiro/transaction-form-dialog";

const categoryLabels: Record<string, string> = {
  mensalidade: "Mensalidade", evento: "Evento", patrocinio: "Patrocínio", doacao: "Doação",
  contribuicao: "Contribuição Aluno", outros_receita: "Outros",
  aluguel: "Aluguel", material: "Material Esportivo", salario: "Salário",
  transporte: "Transporte", alimentacao: "Alimentação", outros_despesa: "Outros",
};

const recurrenceLabels: Record<string, string> = {
  unico: "Único", mensal: "Mensal", semanal: "Semanal",
  quinzenal: "Quinzenal", anual: "Anual", parcelado: "Parcelado",
};

const getCategoryLabel = (cat: string) => categoryLabels[cat] ?? cat;

const PAGE_SIZE = 10;

export default function DespesasPage() {
  const { setTitle } = usePageTitle();
  useEffect(() => { setTitle("Despesas"); }, [setTitle]);

  const { data: transactions = [], isLoading } = useFinancialTransactions();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pago" | "pendente" | "cancelado">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortField, setSortField] = useState<"date" | "amount">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);

  const despesas = useMemo(() => transactions.filter(t => t.type === "despesa"), [transactions]);

  const categories = useMemo(() => {
    const cats = [...new Set(despesas.map(t => t.category))];
    return cats.map(c => ({ value: c, label: getCategoryLabel(c) }));
  }, [despesas]);

  const filtered = useMemo(() => {
    let result = despesas.filter(t => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
      if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    result.sort((a, b) => {
      const mul = sortDir === "asc" ? 1 : -1;
      if (sortField === "date") return mul * a.date.localeCompare(b.date);
      return mul * (parseFloat(a.amount) - parseFloat(b.amount));
    });
    return result;
  }, [despesas, search, statusFilter, categoryFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalDespesas = useMemo(() => despesas.filter(t => t.status === "pago").reduce((s, t) => s + parseFloat(t.amount), 0), [despesas]);
  const totalPendente = useMemo(() => despesas.filter(t => t.status === "pendente").reduce((s, t) => s + parseFloat(t.amount), 0), [despesas]);

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const toggleSort = (field: "date" | "amount") => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  useEffect(() => { setPage(1); }, [search, statusFilter, categoryFilter]);

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Carregando despesas...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-4">
          <Card className="flex-1 min-w-[180px]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Pago</CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent><p className="text-2xl font-bold text-destructive">{fmt(totalDespesas)}</p></CardContent>
          </Card>
          <Card className="flex-1 min-w-[180px]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pendente</CardTitle>
              <TrendingDown className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent><p className="text-2xl font-bold text-warning">{fmt(totalPendente)}</p></CardContent>
          </Card>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Nova Despesa
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Despesas</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar despesa..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={categoryFilter} onValueChange={v => setCategoryFilter(v)}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Categoria" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas categorias</SelectItem>
                {categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={v => setStatusFilter(v as any)}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos status</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("date")}>
                  <span className="inline-flex items-center gap-1">Data <ArrowUpDown className="h-3 w-3" /></span>
                </TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Recorrência</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="cursor-pointer select-none text-right" onClick={() => toggleSort("amount")}>
                  <span className="inline-flex items-center gap-1 justify-end">Valor <ArrowUpDown className="h-3 w-3" /></span>
                </TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="whitespace-nowrap">{new Date(t.date).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>
                    <div>
                      <span className="font-medium">{t.description}</span>
                      {t.recurrence === "parcelado" && t.installments && (
                        <span className="text-xs text-muted-foreground ml-1">({t.currentInstallment}/{t.installments})</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{getCategoryLabel(t.category)}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={t.recurrence === "unico" ? "secondary" : "default"} className="text-xs">
                      {recurrenceLabels[t.recurrence] ?? t.recurrence}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={t.status === "pago" ? "default" : t.status === "pendente" ? "secondary" : "destructive"}>
                      {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium text-destructive">-{fmt(parseFloat(t.amount))}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Pencil className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Excluir</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {paginated.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Nenhuma despesa encontrada</TableCell></TableRow>
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

      <TransactionFormDialog open={dialogOpen} onOpenChange={setDialogOpen} defaultType="despesa" />
    </div>
  );
}
