import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Pencil, Receipt, ShieldOff, DollarSign, FileText, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useStudentContributions, useCreateStudentContribution } from "@/hooks/use-student-contributions";
import { useUpdateStudent } from "@/hooks/use-students";
import type { StudentDetail } from "@/types";

const DEFAULT_CONTRIBUTION = 50;

const methodLabels: Record<string, string> = {
  pix: "PIX",
  dinheiro: "Dinheiro",
  transferencia: "Transferência",
  cartao: "Cartão",
};

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

interface Props {
  student: StudentDetail;
}

export function TabContribuicao({ student }: Props) {
  const studentId = student.id;
  const { data: contributions = [], isLoading } = useStudentContributions(studentId);
  const createContribution = useCreateStudentContribution();
  const updateStudent = useUpdateStudent();

  const isExempt = student.contributes === false;
  const savedAmount = student.contributionAmount ? parseFloat(student.contributionAmount) : DEFAULT_CONTRIBUTION;

  const [customValue, setCustomValue] = useState<string>("");
  const [editingValue, setEditingValue] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    method: "pix" as string,
    reference: "",
  });

  const currentValue = customValue ? parseFloat(customValue) : savedAmount;

  const paidContributions = contributions.filter((c) => c.status === "pago" || c.status === "paid");
  const totalPaid = paidContributions.reduce((s, c) => s + parseFloat(c.amount), 0);
  const lastPayment = paidContributions[0];

  const handleExemptToggle = async (checked: boolean) => {
    try {
      await updateStudent.mutateAsync({ id: studentId, contributes: !checked });
      toast.success(checked ? "Aluno marcado como isento" : "Isenção removida");
    } catch {
      toast.error("Erro ao atualizar status de contribuição");
    }
  };

  const handleSaveValue = async () => {
    const parsed = parseFloat(customValue);
    if (isNaN(parsed) || parsed <= 0) {
      toast.error("Informe um valor válido");
      return;
    }
    try {
      await updateStudent.mutateAsync({ id: studentId, contributionAmount: customValue });
      toast.success("Valor da contribuição atualizado");
      setEditingValue(false);
      setCustomValue("");
    } catch {
      toast.error("Erro ao atualizar valor");
    }
  };

  const handleSavePayment = async () => {
    if (!paymentForm.amount || !paymentForm.reference) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    try {
      await createContribution.mutateAsync({
        studentId,
        amount: paymentForm.amount,
        date: paymentForm.date,
        method: paymentForm.method,
        reference: paymentForm.reference,
      });
      toast.success("Pagamento registrado com sucesso!");
      setDialogOpen(false);
      setPaymentForm({
        amount: "",
        date: new Date().toISOString().split("T")[0],
        method: "pix",
        reference: "",
      });
    } catch {
      toast.error("Erro ao registrar pagamento");
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Status cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              {isExempt ? <ShieldOff className="h-4 w-4 text-muted-foreground" /> : <DollarSign className="h-4 w-4 text-primary" />}
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <Badge variant={isExempt ? "secondary" : "default"} className="text-sm">
                {isExempt ? "Isento" : "Contribuinte"}
              </Badge>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={isExempt}
                      onCheckedChange={handleExemptToggle}
                      disabled={updateStudent.isPending}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {isExempt ? "Desmarcar isenção" : "Marcar como isento"}
                </TooltipContent>
              </Tooltip>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Valor Mensal</CardTitle>
              <div className="flex items-center gap-1">
                {!isExempt && !editingValue && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingValue(true)}>
                        <Pencil className="h-3 w-3 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Editar valor personalizado</TooltipContent>
                  </Tooltip>
                )}
                <Receipt className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              {editingValue ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    className="w-28 h-8"
                    placeholder={String(savedAmount)}
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    autoFocus
                  />
                  <Button size="sm" className="h-8" onClick={handleSaveValue} disabled={updateStudent.isPending}>
                    {updateStudent.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Salvar"}
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8" onClick={() => { setEditingValue(false); setCustomValue(""); }}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <>
                  <p className={`text-2xl font-bold ${isExempt ? "text-muted-foreground line-through" : ""}`}>{fmt(currentValue)}</p>
                  <p className="text-xs text-muted-foreground">Padrão: {fmt(DEFAULT_CONTRIBUTION)}</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Contribuído</CardTitle>
              <DollarSign className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-success">{fmt(totalPaid)}</p>
              {lastPayment && (
                <p className="text-xs text-muted-foreground">
                  Último: {new Date(lastPayment.date).toLocaleDateString("pt-BR")}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment history */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Histórico de Pagamentos</CardTitle>
            {isExempt ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0}>
                    <Button size="sm" disabled>
                      <Plus className="mr-2 h-4 w-4" /> Novo Pagamento
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>Desmarque a isenção para registrar pagamentos</TooltipContent>
              </Tooltip>
            ) : (
              <Button size="sm" onClick={() => {
                setPaymentForm((f) => ({ ...f, amount: String(currentValue) }));
                setDialogOpen(true);
              }}>
                <Plus className="mr-2 h-4 w-4" /> Novo Pagamento
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Referência</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contributions.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.reference}</TableCell>
                      <TableCell>{new Date(c.date).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>{methodLabels[c.method] ?? c.method}</TableCell>
                      <TableCell>
                        <Badge variant={c.status === "pago" || c.status === "paid" ? "default" : "secondary"}>
                          {c.status === "pago" || c.status === "paid" ? "Pago" : "Pendente"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">{fmt(parseFloat(c.amount))}</TableCell>
                      <TableCell>
                        {c.receiptUrl && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Ver comprovante">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {contributions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        Nenhum pagamento registrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* New Payment Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Pagamento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Referência *</Label>
                <Input
                  placeholder="Ex: Mar/2026"
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm((f) => ({ ...f, reference: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor (R$) *</Label>
                  <Input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm((f) => ({ ...f, amount: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data *</Label>
                  <Input
                    type="date"
                    value={paymentForm.date}
                    onChange={(e) => setPaymentForm((f) => ({ ...f, date: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Método de pagamento</Label>
                <Select value={paymentForm.method} onValueChange={(v) => setPaymentForm((f) => ({ ...f, method: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
                    <SelectItem value="cartao">Cartão</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSavePayment} disabled={createContribution.isPending}>
                {createContribution.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
