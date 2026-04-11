import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { transactionSchema, receitaCategoryOptions, despesaCategoryOptions, type TransactionFormData } from "@/schemas/finance";
import { useCreateTransaction } from "@/hooks/use-finance";

type TransactionType = "receita" | "despesa";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType: TransactionType;
}

export function TransactionFormDialog({ open, onOpenChange, defaultType }: Props) {
  const createTransaction = useCreateTransaction();
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: { type: defaultType, category: "", description: "", amount: "", date: new Date().toISOString().split("T")[0], status: "pendente", recurrence: "unico", installments: "" },
  });

  const selectedType = watch("type");
  const recurrence = watch("recurrence");
  const categories = selectedType === "receita" ? receitaCategoryOptions : despesaCategoryOptions;

  const onSubmit = async (data: TransactionFormData) => {
    const amount = parseFloat(data.amount.replace(/\./g, "").replace(",", "."));
    try {
      await createTransaction.mutateAsync({
        type: data.type,
        category: data.category,
        description: data.description,
        amount: String(amount),
        date: data.date,
        status: data.status,
        recurrence: data.recurrence,
        installments: data.installments ? parseInt(data.installments) : undefined,
      });
      toast({
        title: data.type === "receita" ? "Receita registrada" : "Despesa registrada",
        description: `${data.description} — R$ ${amount.toFixed(2)}`,
      });
      reset({ type: defaultType, category: "", description: "", amount: "", date: new Date().toISOString().split("T")[0], status: "pendente", recurrence: "unico", installments: "" });
      onOpenChange(false);
    } catch {
      toast({ title: "Erro ao registrar transação", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{defaultType === "receita" ? "Nova Receita" : "Nova Despesa"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={selectedType} onValueChange={(v) => { setValue("type", v as TransactionType); setValue("category", ""); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={watch("category")} onValueChange={(v) => setValue("category", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea {...register("description")} placeholder="Descreva a transação..." rows={2} />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input {...register("amount")} placeholder="0,00" />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Data</Label>
              <Input type="date" {...register("date")} />
              {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={watch("status")} onValueChange={(v) => setValue("status", v as "pago" | "pendente")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Recurrence */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Recorrência</Label>
              <Select value={recurrence} onValueChange={(v) => setValue("recurrence", v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unico">Único</SelectItem>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="quinzenal">Quinzenal</SelectItem>
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                  <SelectItem value="parcelado">Parcelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {recurrence === "parcelado" && (
              <div className="space-y-2">
                <Label>Nº de Parcelas</Label>
                <Input {...register("installments")} type="number" min={2} max={48} placeholder="Ex: 3" />
                {errors.installments && <p className="text-xs text-destructive">{errors.installments.message}</p>}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={createTransaction.isPending}>
              {createTransaction.isPending ? "Registrando..." : defaultType === "receita" ? "Registrar Receita" : "Registrar Despesa"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
