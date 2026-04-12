import { z } from "zod";

export const personalDataSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  cpf: z.string().min(14, "CPF inválido").max(14),
  birthDate: z.string().min(1, "Data de nascimento obrigatória"),
  gender: z.enum(["masculino", "feminino", "outro"], { required_error: "Selecione o gênero" }),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.object({
    cep: z.string().min(1, "CEP obrigatório"),
    street: z.string().min(1, "Rua obrigatória"),
    number: z.string().min(1, "Número obrigatório"),
    complement: z.string().optional(),
    neighborhood: z.string().min(1, "Bairro obrigatório"),
    city: z.string().min(1, "Cidade obrigatória"),
    state: z.string().min(2, "Estado obrigatório"),
  }),
});

export const jiuJitsuStepSchema = z.object({
  startDate: z.string().min(1, "Data de início obrigatória"),
  beltName: z.string().min(1, "Selecione a faixa"),
  beltDegree: z.number().default(0),
  classGroupId: z.string().optional(),
});

export type PersonalData = z.infer<typeof personalDataSchema>;
export type JiuJitsuStep = z.infer<typeof jiuJitsuStepSchema>;
