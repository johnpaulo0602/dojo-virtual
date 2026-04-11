import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import { donationSchema, type DonationFormData } from "@/schemas/finance";
import { useDonors, useCreateDonor, useCreateDonation } from "@/hooks/use-donors";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedDonorId?: string;
}

export function DonationFormDialog({ open, onOpenChange, preselectedDonorId }: Props) {
  const { data: donors = [] } = useDonors();
  const createDonor = useCreateDonor();
  const createDonation = useCreateDonation();

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<DonationFormData>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      donorType: preselectedDonorId ? "existing" : "existing",
      donorId: preselectedDonorId ?? "",
      donorName: "", donorEmail: "", donorPhone: "",
      donorEntityType: "pessoa_fisica", amount: "", date: new Date().toISOString().split("T")[0],
      method: "pix", description: "",
    },
  });

  const donorType = watch("donorType");

  const onSubmit = async (data: DonationFormData) => {
    const amount = parseFloat(data.amount.replace(/\./g, "").replace(",", "."));
    try {
      let donorId = data.donorId;

      if (data.donorType === "new") {
        const newDonor = await createDonor.mutateAsync({
          name: data.donorName,
          email: data.donorEmail,
          phone: data.donorPhone,
          type: data.donorEntityType,
        });
        donorId = (newDonor as { id: string }).id;
      }

      if (!donorId) {
        toast({ title: "Selecione ou informe o doador", variant: "destructive" });
        return;
      }

      await createDonation.mutateAsync({
        donorId,
        amount: String(amount),
        date: data.date,
        method: data.method,
        description: data.description,
      });

      const donorName = data.donorType === "existing"
        ? donors.find(d => d.id === donorId)?.name ?? "Doador"
        : data.donorName;

      toast({
        title: "Doação registrada",
        description: `${donorName} — R$ ${amount.toFixed(2)}`,
      });
      reset();
      onOpenChange(false);
    } catch {
      toast({ title: "Erro ao registrar doação", variant: "destructive" });
    }
  };

  const isPending = createDonor.isPending || createDonation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Doação</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Donor type toggle */}
          {!preselectedDonorId && (
            <div className="space-y-2">
              <Label>Doador</Label>
              <RadioGroup
                value={donorType}
                onValueChange={(v) => setValue("donorType", v as "existing" | "new")}
                className="flex gap-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="existing" id="dt-existing" />
                  <Label htmlFor="dt-existing" className="font-normal">Existente</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="new" id="dt-new" />
                  <Label htmlFor="dt-new" className="font-normal">Novo doador</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {donorType === "existing" ? (
            <div className="space-y-2">
              <Select value={watch("donorId") ?? ""} onValueChange={(v) => setValue("donorId", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione o doador..." /></SelectTrigger>
                <SelectContent>
                  {donors.map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.donorId && <p className="text-xs text-destructive">{errors.donorId.message}</p>}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Nome</Label>
                  <Input {...register("donorName")} placeholder="Nome do doador" />
                </div>
                <div className="space-y-1">
                  <Label>Tipo</Label>
                  <Select value={watch("donorEntityType")} onValueChange={(v) => setValue("donorEntityType", v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pessoa_fisica">Pessoa Física</SelectItem>
                      <SelectItem value="pessoa_juridica">Pessoa Jurídica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input {...register("donorEmail")} type="email" placeholder="email@exemplo.com" />
                  {errors.donorEmail && <p className="text-xs text-destructive">{errors.donorEmail.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label>Telefone</Label>
                  <Input {...register("donorPhone")} placeholder="(11) 99999-0000" />
                </div>
              </div>
            </div>
          )}

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
              <Label>Método</Label>
              <Select value={watch("method")} onValueChange={(v) => setValue("method", v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="transferencia">Transferência</SelectItem>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="cartao">Cartão</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea {...register("description")} placeholder="Descreva a doação..." rows={2} />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Registrando..." : "Registrar Doação"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
