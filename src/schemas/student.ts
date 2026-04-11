import { z } from "zod";

export const personalDataSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  cpf: z.string().min(14, "CPF inválido").max(14),
  rg: z.string().optional(),
  birthDate: z.string().min(1, "Data de nascimento obrigatória"),
  gender: z.enum(["masculino", "feminino", "outro"], { required_error: "Selecione o gênero" }),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  cep: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

export const guardianSchema = z.object({
  name: z.string().min(3, "Nome obrigatório"),
  cpf: z.string().min(14, "CPF inválido"),
  relationship: z.enum(["mae", "pai", "outro"], { required_error: "Selecione o vínculo" }),
  phone: z.string().min(1, "Telefone obrigatório"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  profession: z.string().optional(),
  isPrimary: z.boolean().default(false),
});

export const guardiansStepSchema = z.object({
  guardians: z.array(guardianSchema).min(1, "Adicione pelo menos um responsável").max(2),
});

export const schoolStepSchema = z.object({
  schoolId: z.string().min(1, "Selecione uma escola"),
  schoolLevel: z.string().optional(),
  schoolYear: z.string().optional(),
  schoolShift: z.string().optional(),
});

export const jiuJitsuStepSchema = z.object({
  startDate: z.string().min(1, "Data de início obrigatória"),
  classId: z.string().min(1, "Selecione uma turma"),
  beltName: z.string().default("white_belt"),
  beltDegree: z.number().default(0),
});

export type PersonalData = z.infer<typeof personalDataSchema>;
export type GuardianData = z.infer<typeof guardianSchema>;
export type GuardiansStep = z.infer<typeof guardiansStepSchema>;
export type SchoolStep = z.infer<typeof schoolStepSchema>;
export type JiuJitsuStep = z.infer<typeof jiuJitsuStepSchema>;
