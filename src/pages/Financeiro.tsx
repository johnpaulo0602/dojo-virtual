import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/use-page-title";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownIcon, ArrowUpIcon, DollarSign, Plus, ArrowRightLeft, FileText, Users, Search } from "lucide-react";
import { TransactionFormDialog } from "@/components/financeiro/transaction-form-dialog";
import { useFinancialTransactions } from "@/hooks/use-finance";
import type { FinancialTransaction } from "@/types";

type TransactionType = "receita" | "despesa";
type Transaction = FinancialTransaction;

const categoryLabels: Record<string, string> = {
  mensalidade: "Mensalidade",
  evento: "Evento",
  patrocinio: "Patrocínio",
  doacao: "Doação",
  contribuicao: "Contribuição",
  outros_receita: "Outros (Receita)",
  aluguel: "Aluguel",
  material: "Material",
  salario: "Salário",
  transporte: "Transporte",
  alimentacao: "Alimentação",
  outros_despesa: "Outros (Despesa)",
};

function getCategoryLabel(cat: string) {
  return categoryLabels[cat] ?? cat;
}
import { Skeleton } from "@/components/ui/skeleton";

export default function FinanceiroPage() {
  const { setTitle } = usePageTitle();
  const navigate = useNavigate();
  useEffect(() => { setTitle("Financeiro"); }, [setTitle]);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | TransactionType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "pago" | "pendente" | "cancelado">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<TransactionType>("receita");

  const openDialog = (type: TransactionType) => {
    setDialogType(type);
    setDialogOpen(true);
  };

  const { data: transactions = [], isLoading } = useFinancialTransactions();

  const summary = useMemo(() => {
    return transactions.reduce((acc: { receitas: number; despesas: number }, t: Transaction) => {
      const amount = Number(t.amount);
      if (t.type === "receita") acc.receitas += amount;
      if (t.type === "despesa") acc.despesas += amount;
      return acc;
    }, { receitas: 0, despesas: 0 });
  }, [transactions]);

  const saldo = summary.receitas - summary.despesas;
  
  const filtered = useMemo(() => {
    return transactions.filter((t: Transaction) => {
      if (typeFilter !== "all" && t.type !== typeFilter) return false;
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    }).sort((a: Transaction, b: Transaction) => b.date.localeCompare(a.date));
  }, [transactions, search, typeFilter, statusFilter]);

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Financeiro</h2>
          <p className="text-muted-foreground">Visão geral do fluxo de caixa da academia.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <ArrowUpIcon className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-[120px]" /> : (
              <div className="text-2xl font-bold text-emerald-600">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(summary.receitas)}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Total recebido</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <ArrowDownIcon className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-[120px]" /> : (
              <div className="text-2xl font-bold text-rose-600">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(summary.despesas)}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Total pago</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Líquido</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-[120px]" /> : (
              <div className={`text-2xl font-bold ${saldo >= 0 ? 'text-primary' : 'text-rose-600'}`}>
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(saldo)}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Receitas - Despesas</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => openDialog("receita")}>
          <CardContent className="flex flex-col items-center justify-center p-6 gap-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-full">
              <ArrowUpIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-500" />
            </div>
            <div className="space-y-1 text-center">
              <h3 className="font-medium leading-none">Nova Receita</h3>
              <p className="text-sm text-muted-foreground">Registrar entrada</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => openDialog("despesa")}>
          <CardContent className="flex flex-col items-center justify-center p-6 gap-4">
            <div className="p-3 bg-rose-100 dark:bg-rose-900/20 rounded-full">
              <ArrowDownIcon className="h-6 w-6 text-rose-600 dark:text-rose-500" />
            </div>
            <div className="space-y-1 text-center">
              <h3 className="font-medium leading-none">Nova Despesa</h3>
              <p className="text-sm text-muted-foreground">Registrar saída</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent transition-colors">
          <CardContent className="flex flex-col items-center justify-center p-6 gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-500" />
            </div>
            <div className="space-y-1 text-center">
              <h3 className="font-medium leading-none">Relatórios</h3>
              <p className="text-sm text-muted-foreground">Ver balancete</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => navigate("/membros")}>
          <CardContent className="flex flex-col items-center justify-center p-6 gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-500" />
            </div>
            <div className="space-y-1 text-center">
              <h3 className="font-medium leading-none">Mensalidades</h3>
              <p className="text-sm text-muted-foreground">Gerenciar pagamentos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart placeholder */}
      <Card>
        <CardHeader><CardTitle>Receitas vs Despesas</CardTitle></CardHeader>
        <CardContent>
          <div className="h-72 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <ArrowRightLeft className="h-8 w-8 opacity-30" />
            <p className="text-sm">Gráfico de evolução mensal em desenvolvimento.</p>
          </div>
        </CardContent>
      </Card>

      {/* Transactions table */}
      <Card>
        <CardHeader>
          <CardTitle>Transações</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar transação..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={typeFilter} onValueChange={v => setTypeFilter(v as "all" | TransactionType)}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="receita">Receitas</SelectItem>
                <SelectItem value="despesa">Despesas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={v => setStatusFilter(v as "all" | "pago" | "pendente" | "cancelado")}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
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
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[80px] rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[60px] rounded-full" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-[80px] ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhuma transação encontrada</TableCell></TableRow>
              ) : (
                filtered.map((t: Transaction) => (
                  <TableRow key={t.id}>
                    <TableCell className="whitespace-nowrap">{new Date(t.date).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>{t.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getCategoryLabel(t.category)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={t.status === "pago" ? "default" : t.status === "pendente" ? "secondary" : "destructive"}>
                        {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-medium ${t.type === "receita" ? "text-success" : "text-destructive"}`}>
                      {t.type === "receita" ? "+" : "-"}{fmt(parseFloat(t.amount))}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <TransactionFormDialog open={dialogOpen} onOpenChange={setDialogOpen} defaultType={dialogType} />
    </div>
  );
}
