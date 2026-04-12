import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { usePageTitle } from "@/hooks/use-page-title";
import { useCreateStudent } from "@/hooks/use-students";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { WizardStepper } from "@/components/alunos/wizard/wizard-stepper";
import { StepPersonal } from "@/components/alunos/wizard/step-personal";
import { StepJiuJitsu } from "@/components/alunos/wizard/step-jiujitsu";
import { personalDataSchema, jiuJitsuStepSchema } from "@/schemas/student";
import { toast } from "sonner";

const schemas = [personalDataSchema, jiuJitsuStepSchema];

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
      name: "", cpf: "", birthDate: "", gender: "" as any,
      email: "", phone: "",
      address: {
        cep: "", street: "", number: "",
        complement: "", neighborhood: "", city: "", state: "",
      },
      // Jiu-Jitsu
      startDate: "", beltName: "white_belt", beltDegree: 0, classGroupId: "",
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
    if (valid) setStep((s) => Math.min(s + 1, 2));
  };

  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const onSubmit = async () => {
    const valid = await validateStep();
    if (!valid) return;
    try {
      const formData = methods.getValues();
      const payload = {
        name: formData.name,
        cpf: formData.cpf,
        birthDate: formData.birthDate,
        gender: formData.gender,
        phone: formData.phone || undefined,
        email: formData.email,
        address: {
          cep: formData.address.cep,
          street: formData.address.street,
          number: formData.address.number,
          complement: formData.address.complement || undefined,
          neighborhood: formData.address.neighborhood,
          city: formData.address.city,
          state: formData.address.state,
        },
        beltName: formData.beltName,
        beltDegree: formData.beltDegree,
        startDate: formData.startDate,
        classGroupId: formData.classGroupId || undefined,
      };
      const result = await createStudent.mutateAsync(payload as Record<string, unknown>);
      toast.success("Aluno cadastrado com sucesso!", { description: "Redirecionando para a listagem..." });
      if (result?.id) {
        navigate(`/alunos/${result.id}`);
      } else {
        navigate("/alunos");
      }
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      const msg = Array.isArray(detail) ? detail.map((d: any) => d.msg).join("; ") : detail || "Erro ao cadastrar aluno.";
      toast.error(msg);
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
            {step === 2 && <StepJiuJitsu />}
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={prev} disabled={step === 1}>Voltar</Button>
          {step < 2 ? (
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
