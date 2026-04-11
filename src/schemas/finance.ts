import { z } from "zod";

const receitaCategories = ["mensalidade", "evento", "patrocinio", "doacao", "contribuicao", "outros_receita"] as const;
const despesaCategories = ["aluguel", "material", "salario", "transporte", "alimentacao", "outros_despesa"] as const;

export const transactionSchema = z.object({
  type: z.enum(["receita", "despesa"], { required_error: "Selecione o tipo" }),
  category: z.string().min(1, "Selecione a categoria"),
  description: z.string().trim().min(3, "Mínimo 3 caracteres").max(200, "Máximo 200 caracteres"),
  amount: z.string().min(1, "Informe o valor").refine(
    (v) => { const n = parseFloat(v.replace(/\./g, "").replace(",", ".")); return !isNaN(n) && n > 0; },
    { message: "Valor deve ser maior que zero" }
  ),
  date: z.string().min(1, "Informe a data"),
  status: z.enum(["pago", "pendente"], { required_error: "Selecione o status" }),
  recurrence: z.enum(["unico", "mensal", "semanal", "quinzenal", "anual", "parcelado"]).default("unico"),
  installments: z.string().optional(),
}).refine(
  (data) => {
    if (data.recurrence === "parcelado") {
      const n = parseInt(data.installments || "");
      return !isNaN(n) && n >= 2;
    }
    return true;
  },
  { message: "Informe o número de parcelas (mínimo 2)", path: ["installments"] }
);

export type TransactionFormData = z.infer<typeof transactionSchema>;

export const receitaCategoryOptions = receitaCategories.map(c => ({
  value: c,
  label: { mensalidade: "Mensalidade", evento: "Evento", patrocinio: "Patrocínio", doacao: "Doação", contribuicao: "Contribuição Aluno", outros_receita: "Outros" }[c],
}));

export const despesaCategoryOptions = despesaCategories.map(c => ({
  value: c,
  label: { aluguel: "Aluguel", material: "Material Esportivo", salario: "Salário", transporte: "Transporte", alimentacao: "Alimentação", outros_despesa: "Outros" }[c],
}));

export const donationSchema = z.object({
  donorType: z.enum(["existing", "new"], { required_error: "Selecione" }),
  donorId: z.string().optional(),
  donorName: z.string().trim().max(100).optional(),
  donorEmail: z.string().trim().email("Email inválido").max(255).optional(),
  donorPhone: z.string().trim().max(20).optional(),
  donorEntityType: z.enum(["pessoa_fisica", "pessoa_juridica"]).optional(),
  amount: z.string().min(1, "Informe o valor").refine(
    (v) => { const n = parseFloat(v.replace(/\./g, "").replace(",", ".")); return !isNaN(n) && n > 0; },
    { message: "Valor deve ser maior que zero" }
  ),
  date: z.string().min(1, "Informe a data"),
  method: z.enum(["pix", "transferencia", "dinheiro", "cartao"], { required_error: "Selecione o método" }),
  description: z.string().trim().min(3, "Mínimo 3 caracteres").max(200, "Máximo 200 caracteres"),
}).refine(
  (data) => {
    if (data.donorType === "existing") return !!data.donorId;
    return !!data.donorName && data.donorName.length >= 2;
  },
  { message: "Selecione ou cadastre um doador", path: ["donorId"] }
);

export type DonationFormData = z.infer<typeof donationSchema>;
