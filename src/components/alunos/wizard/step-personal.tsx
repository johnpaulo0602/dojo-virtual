import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PersonalData } from "@/schemas/student";

function cpfMask(v: string) {
  return v.replace(/\D/g, "").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})/, "$1-$2").slice(0, 14);
}
function phoneMask(v: string) {
  return v.replace(/\D/g, "").replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2").slice(0, 15);
}
function cepMask(v: string) {
  return v.replace(/\D/g, "").replace(/(\d{5})(\d)/, "$1-$2").slice(0, 9);
}

export function StepPersonal() {
  const { register, formState: { errors }, setValue, watch } = useFormContext<PersonalData>();
  const gender = watch("gender");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="name">Nome completo *</Label>
          <Input id="name" {...register("name")} placeholder="Nome completo do aluno" />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="cpf">CPF *</Label>
          <Input id="cpf" {...register("cpf")} placeholder="000.000.000-00"
            onChange={(e) => setValue("cpf", cpfMask(e.target.value))} />
          {errors.cpf && <p className="text-sm text-destructive">{errors.cpf.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="rg">RG</Label>
          <Input id="rg" {...register("rg")} placeholder="RG do aluno" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="birthDate">Data de nascimento *</Label>
          <Input id="birthDate" type="date" {...register("birthDate")} />
          {errors.birthDate && <p className="text-sm text-destructive">{errors.birthDate.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Gênero *</Label>
          <Select value={gender} onValueChange={(v) => setValue("gender", v as PersonalData["gender"])}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="masculino">Masculino</SelectItem>
              <SelectItem value="feminino">Feminino</SelectItem>
              <SelectItem value="outro">Outro</SelectItem>
            </SelectContent>
          </Select>
          {errors.gender && <p className="text-sm text-destructive">{errors.gender.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" {...register("email")} placeholder="email@exemplo.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone / WhatsApp</Label>
          <Input id="phone" {...register("phone")} placeholder="(00) 00000-0000"
            onChange={(e) => setValue("phone", phoneMask(e.target.value))} />
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-sm font-medium text-foreground mb-4">Endereço</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cep">CEP</Label>
            <Input id="cep" {...register("cep")} placeholder="00000-000"
              onChange={(e) => setValue("cep", cepMask(e.target.value))} />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="street">Rua</Label>
            <Input id="street" {...register("street")} placeholder="Nome da rua" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="number">Número</Label>
            <Input id="number" {...register("number")} placeholder="Nº" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="complement">Complemento</Label>
            <Input id="complement" {...register("complement")} placeholder="Apto, bloco..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="neighborhood">Bairro</Label>
            <Input id="neighborhood" {...register("neighborhood")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Cidade</Label>
            <Input id="city" {...register("city")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">Estado</Label>
            <Input id="state" {...register("state")} placeholder="SP" />
          </div>
        </div>
      </div>
    </div>
  );
}
