import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/use-page-title";
import { useStudent, useUpdateStudent } from "@/hooks/use-students";
import { useCreateGuardian, useUpdateGuardian, useDeleteGuardian } from "@/hooks/use-guardians";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BeltDisplay } from "@/components/alunos/belt-display";
import type { Guardian } from "@/types";
import { TabEscolar } from "@/components/alunos/tabs/tab-escolar";
import { TabSaude } from "@/components/alunos/tabs/tab-saude";
import { TabEvolucao } from "@/components/alunos/tabs/tab-evolucao";
import { TabDocumentos } from "@/components/alunos/tabs/tab-documentos";
import { TabContribuicao } from "@/components/alunos/tabs/tab-contribuicao";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const statusMap: Record<string, { label: string; variant: "default" | "destructive" | "outline" }> = {
  ativo: { label: "Ativo", variant: "default" },
  inativo: { label: "Inativo", variant: "destructive" },
  pendente: { label: "Pendente", variant: "outline" },
};

function getAge(birthDate: string) {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function getInitials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

const relationshipLabels: Record<string, string> = {
  mae: "Mãe", pai: "Pai", outro: "Outro",
  mother: "Mãe", father: "Pai", other: "Outro",
};

const emptyGuardian: Omit<Guardian, "id"> = {
  name: "", cpf: "", relationshipType: "mae", phone: "", email: "", profession: "", isPrimary: false,
};

export default function PerfilAlunoPage() {
  const { id } = useParams();
  const { setTitle } = usePageTitle();
  const navigate = useNavigate();
  const { data: student, isLoading, isError } = useStudent(id);

  const updateStudent = useUpdateStudent();
  const createGuardian = useCreateGuardian();
  const updateGuardianMutation = useUpdateGuardian();
  const deleteGuardianMutation = useDeleteGuardian();

  // Personal data edit
  const [editPersonal, setEditPersonal] = useState(false);
  const [personalForm, setPersonalForm] = useState({ name: "", cpf: "", phone: "", gender: "masculino" as string });

  // Guardian edit
  const [editGuardian, setEditGuardian] = useState(false);
  const [guardianForm, setGuardianForm] = useState<Omit<Guardian, "id">>(emptyGuardian);
  const [editingGuardianId, setEditingGuardianId] = useState<string | null>(null);


  useEffect(() => {
    setTitle(student ? student.name : isLoading ? "Carregando..." : "Aluno não encontrado");
  }, [setTitle, student, isLoading]);

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Carregando perfil...</div>;

  if (!student || isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Aluno não encontrado</p>
        <Button variant="outline" onClick={() => navigate("/alunos")}>Voltar</Button>
      </div>
    );
  }

  const st = statusMap[student.status ?? ""] ?? { label: student.status ?? "—", variant: "outline" as const };

  const isMinor = student.birthDate
    ? new Date().getFullYear() - new Date(student.birthDate).getFullYear() < 18
    : true;

  const openEditPersonal = () => {
    setPersonalForm({ name: student.name, cpf: student.cpf, phone: student.phone || "", gender: student.gender || "masculino" });
    setEditPersonal(true);
  };

  const savePersonal = async () => {
    try {
      await updateStudent.mutateAsync({ id: student!.id, ...personalForm });
      toast.success("Dados pessoais atualizados!");
      setEditPersonal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Erro ao atualizar dados");
    }
  };

  const openAddGuardian = () => {
    setEditingGuardianId(null);
    setGuardianForm(emptyGuardian);
    setEditGuardian(true);
  };

  const openEditGuardian = (g: Guardian) => {
    setEditingGuardianId(g.id);
    setGuardianForm({ name: g.name, cpf: g.cpf, relationshipType: g.relationshipType, phone: g.phone, email: g.email, profession: g.profession, isPrimary: g.isPrimary });
    setEditGuardian(true);
  };

  const saveGuardian = async () => {
    try {
      if (editingGuardianId) {
        await updateGuardianMutation.mutateAsync({
          studentId: student!.id,
          guardianId: editingGuardianId,
          ...guardianForm,
        });
        toast.success("Responsável atualizado!");
      } else {
        await createGuardian.mutateAsync({
          studentId: student!.id,
          ...guardianForm,
        });
        toast.success("Responsável adicionado!");
      }
      setEditGuardian(false);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Erro ao salvar responsável");
    }
  };

  const deleteGuardian = async (id: string, name: string) => {
    try {
      await deleteGuardianMutation.mutateAsync({ studentId: student!.id, guardianId: id });
      toast.success(`${name} removido dos responsáveis`);
    } catch (error: any) {
      toast.error("Erro ao remover responsável");
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
            <BreadcrumbItem><BreadcrumbPage>{student.name}</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button variant="outline" size="sm" onClick={() => navigate("/alunos")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
      </div>

      {/* Profile header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg bg-primary/10 text-primary">{getInitials(student.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold">{student.name}</h2>
                <Badge variant={st.variant}>{st.label}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Matrícula: {student.matricula}
                {student.birthDate && ` · ${getAge(student.birthDate)} anos`}
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                {student.beltName && <BeltDisplay beltName={student.beltName} degree={student.beltDegree ?? 0} size="md" />}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="visao-geral">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="dados-pessoais">Dados Pessoais</TabsTrigger>
          {isMinor && <TabsTrigger value="responsaveis">Responsáveis</TabsTrigger>}
          <TabsTrigger value="escolar">Escolar</TabsTrigger>
          <TabsTrigger value="saude">Saúde</TabsTrigger>
          <TabsTrigger value="evolucao">Evolução</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="contribuicao">Contribuição</TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Matrícula</span><span>{student.matricula}</span></div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={st.variant}>{st.label}</Badge>
                </div>
                {student.startDate && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Data de início</span><span>{new Date(student.startDate).toLocaleDateString("pt-BR")}</span></div>
                )}
                {student.birthDate && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Idade</span><span>{getAge(student.birthDate)} anos</span></div>
                )}
                {!isMinor && student.profession && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Profissão</span><span>{student.profession}</span></div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Jiu-Jitsu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {student.beltName && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Faixa atual</span>
                    <BeltDisplay beltName={student.beltName} degree={student.beltDegree ?? 0} />
                  </div>
                )}
                {student.beltDegree !== undefined && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Grau</span><span>{student.beltDegree}</span></div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total de graduações</span>
                  <span>{student.promotions?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Contribui?</span>
                  <Badge variant={student.contributes ? "default" : "outline"}>
                    {student.contributes ? "Sim" : "Não"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dados-pessoais">
          <Card>
            <CardHeader className="flex flex-row items-center justify-end">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={openEditPersonal}>
                <Pencil className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Nome</span><span>{student.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">CPF</span><span>{student.cpf}</span></div>
              {student.rg && <div className="flex justify-between"><span className="text-muted-foreground">RG</span><span>{student.rg}</span></div>}
              {student.gender && <div className="flex justify-between"><span className="text-muted-foreground">Gênero</span><span className="capitalize">{student.gender}</span></div>}
              {student.birthDate && <div className="flex justify-between"><span className="text-muted-foreground">Nascimento</span><span>{new Date(student.birthDate).toLocaleDateString("pt-BR")}</span></div>}
              {student.phone && <div className="flex justify-between"><span className="text-muted-foreground">Telefone</span><span>{student.phone}</span></div>}
              {student.email && <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{student.email}</span></div>}
              {student.profession && <div className="flex justify-between"><span className="text-muted-foreground">Profissão</span><span>{student.profession}</span></div>}
            </CardContent>
          </Card>
        </TabsContent>

        {isMinor && <TabsContent value="responsaveis">
          <div className="space-y-3">
            {student.guardians.map((g) => (
              <Card key={g.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{g.name}</span>
                      <Badge variant="secondary">{relationshipLabels[g.relationshipType] ?? g.relationshipType}</Badge>
                      {g.isPrimary && <Badge>Principal</Badge>}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditGuardian(g)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover responsável?</AlertDialogTitle>
                            <AlertDialogDescription>Deseja remover {g.name} dos responsáveis deste aluno?</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteGuardian(g.id, g.name)}>Remover</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    {g.cpf && <div><span className="text-muted-foreground">CPF: </span>{g.cpf}</div>}
                    <div><span className="text-muted-foreground">Telefone: </span>{g.phone}</div>
                    {g.email && <div><span className="text-muted-foreground">E-mail: </span>{g.email}</div>}
                    {g.profession && <div><span className="text-muted-foreground">Profissão: </span>{g.profession}</div>}
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button variant="outline" className="w-full" onClick={openAddGuardian}>
              <Plus className="mr-2 h-4 w-4" /> Adicionar Responsável
            </Button>
          </div>
        </TabsContent>}

        <TabsContent value="escolar">
          <TabEscolar student={student} />
        </TabsContent>

        <TabsContent value="saude">
          <TabSaude healthProfile={student.healthProfile} />
        </TabsContent>

        <TabsContent value="evolucao">
          <TabEvolucao studentId={student.id} />
        </TabsContent>

        <TabsContent value="documentos">
          <TabDocumentos studentId={student.id} />
        </TabsContent>

        <TabsContent value="contribuicao">
          <TabContribuicao student={student} />
        </TabsContent>
      </Tabs>

      {/* Edit Personal Data Dialog */}
      <Dialog open={editPersonal} onOpenChange={setEditPersonal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Dados Pessoais</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input value={personalForm.name} onChange={(e) => setPersonalForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>CPF</Label>
              <Input value={personalForm.cpf} onChange={(e) => setPersonalForm((p) => ({ ...p, cpf: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input value={personalForm.phone} onChange={(e) => setPersonalForm((p) => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Gênero</Label>
              <Select value={personalForm.gender} onValueChange={(v) => setPersonalForm((p) => ({ ...p, gender: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="feminino">Feminino</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPersonal(false)}>Cancelar</Button>
            <Button onClick={savePersonal}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit/Add Guardian Dialog */}
      <Dialog open={editGuardian} onOpenChange={setEditGuardian}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGuardianId ? "Editar Responsável" : "Adicionar Responsável"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input value={guardianForm.name} onChange={(e) => setGuardianForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>CPF</Label>
              <Input value={guardianForm.cpf} onChange={(e) => setGuardianForm((p) => ({ ...p, cpf: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Parentesco</Label>
              <Select value={guardianForm.relationshipType} onValueChange={(v) => setGuardianForm((p) => ({ ...p, relationshipType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mae">Mãe</SelectItem>
                  <SelectItem value="pai">Pai</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input value={guardianForm.phone} onChange={(e) => setGuardianForm((p) => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input value={guardianForm.email ?? ""} onChange={(e) => setGuardianForm((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Profissão</Label>
              <Input value={guardianForm.profession ?? ""} onChange={(e) => setGuardianForm((p) => ({ ...p, profession: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditGuardian(false)}>Cancelar</Button>
            <Button onClick={saveGuardian}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
