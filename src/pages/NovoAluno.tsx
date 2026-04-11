import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePageTitle } from "@/hooks/use-page-title";
import { useCreateStudent } from "@/hooks/use-students";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { WizardStepper } from "@/components/alunos/wizard/wizard-stepper";
import { StepPersonal } from "@/components/alunos/wizard/step-personal";
import { StepGuardians } from "@/components/alunos/wizard/step-guardians";
import { StepSchool } from "@/components/alunos/wizard/step-school";
import { StepJiuJitsu } from "@/components/alunos/wizard/step-jiujitsu";
import { personalDataSchema, guardiansStepSchema, schoolStepSchema, jiuJitsuStepSchema } from "@/schemas/student";
import { toast } from "sonner";

const schemas = [personalDataSchema, guardiansStepSchema, schoolStepSchema, jiuJitsuStepSchema];

export default function NovoAlunoPage() {
  const { setTitle } = usePageTitle();
  const navigate = useNavigate();
  useEffect(() => { setTitle("Novo Aluno"); }, [setTitle]);

  const createStudent = useCreateStudent();
  const [step, setStep] = useState(1);

  const methods = useForm({
    mode: "onTouched",
    defaultValues: {
      // Personal
      name: "", cpf: "", rg: "", birthDate: "", gender: "" as any,
      email: "", phone: "", cep: "", street: "", number: "",
      complement: "", neighborhood: "", city: "", state: "",
      // Guardians
      guardians: [],
      // School
      schoolId: "", schoolLevel: "", schoolYear: "", schoolShift: "",
      // Jiu-Jitsu
      startDate: "", classId: "", beltName: "white_belt", beltDegree: 0,
    },
  });

  const validateStep = async () => {
    const schema = schemas[step - 1];
    const values = methods.getValues();
    const result = schema.safeParse(values);
    if (!result.success) {
      result.error.errors.forEach((e) => {
        methods.setError(e.path.join(".") as any, { message: e.message });
      });
      return false;
    }
    return true;
  };

  const next = async () => {
    const valid = await validateStep();
    if (valid) setStep((s) => Math.min(s + 1, 4));
  };

  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const onSubmit = async () => {
    const valid = await validateStep();
    if (!valid) return;
    try {
      const formData = methods.getValues();
      await createStudent.mutateAsync(formData as Record<string, unknown>);
      toast.success("Aluno cadastrado com sucesso!", { description: "Redirecionando para a listagem..." });
      navigate("/alunos");
    } catch {
      toast.error("Erro ao cadastrar aluno. Verifique os dados e tente novamente.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink href="/alunos">Alunos</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>Novo Aluno</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button variant="outline" onClick={() => navigate("/alunos")}>Cancelar</Button>
      </div>

      <WizardStepper currentStep={step} />

      <FormProvider {...methods}>
        <Card>
          <CardContent className="pt-6">
            {step === 1 && <StepPersonal />}
            {step === 2 && <StepGuardians />}
            {step === 3 && <StepSchool />}
            {step === 4 && <StepJiuJitsu />}
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={prev} disabled={step === 1}>Voltar</Button>
          {step < 4 ? (
            <Button type="button" onClick={next}>Próximo</Button>
          ) : (
            <Button type="button" onClick={onSubmit} disabled={createStudent.isPending}>
              {createStudent.isPending ? "Cadastrando..." : "Finalizar Cadastro"}
            </Button>
          )}
        </div>
      </FormProvider>
    </div>
  );
}
