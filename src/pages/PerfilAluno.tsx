import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/use-page-title";
import { useStudent } from "@/hooks/use-students";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BeltDisplay } from "@/components/alunos/belt-display";
import type { Guardian } from "@/types";
import { TabEscolar } from "@/components/alunos/tabs/tab-escolar";
import { TabSaude } from "@/components/alunos/tabs/tab-saude";
import { TabEvolucao } from "@/components/alunos/tabs/tab-evolucao";
import { TabFrequencia } from "@/components/alunos/tabs/tab-frequencia";
import { TabDocumentos } from "@/components/alunos/tabs/tab-documentos";
import { TabContribuicao } from "@/components/alunos/tabs/tab-contribuicao";
import { belts } from "@/config/belts";
import { ArrowLeft, Pencil, Plus, Award, MessageSquare, Trash2 } from "lucide-react";
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

  // Personal data edit
  const [editPersonal, setEditPersonal] = useState(false);
  const [personalForm, setPersonalForm] = useState({ name: "", cpf: "", phone: "", gender: "masculino" as string });

  // Guardian edit
  const [editGuardian, setEditGuardian] = useState(false);
  const [guardianForm, setGuardianForm] = useState<Omit<Guardian, "id">>(emptyGuardian);
  const [editingGuardianId, setEditingGuardianId] = useState<string | null>(null);

  // Graduation dialog
  const [gradOpen, setGradOpen] = useState(false);
  const [gradForm, setGradForm] = useState({ beltName: "", beltDegree: 0, date: new Date().toISOString().split("T")[0], notes: "" });

  // Feedback dialog
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ title: "", description: "", date: new Date().toISOString().split("T")[0] });

  const selectedBelt = belts.find((b) => b.name === gradForm.beltName);
  const degreeOptions = selectedBelt ? Array.from({ length: selectedBelt.degrees.quantity + 1 }, (_, i) => i) : [];

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

  const openEditPersonal = () => {
    setPersonalForm({ name: student.name, cpf: student.cpf, phone: student.phone || "", gender: student.gender || "masculino" });
    setEditPersonal(true);
  };

  const savePersonal = () => {
    toast.success("Dados pessoais atualizados!");
    setEditPersonal(false);
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

  const saveGuardian = () => {
    toast.success(editingGuardianId ? "Responsável atualizado!" : "Responsável adicionado!");
    setEditGuardian(false);
  };

  const deleteGuardian = (name: string) => {
    toast.success(`${name} removido dos responsáveis`);
  };

  const openGraduation = () => {
    setGradForm({ beltName: student.beltName || "", beltDegree: student.beltDegree || 0, date: new Date().toISOString().split("T")[0], notes: "" });
    setGradOpen(true);
  };

  const saveGraduation = () => {
    if (!gradForm.beltName) { toast.error("Selecione a faixa"); return; }
    toast.success(`Graduação registrada: ${belts.find((b) => b.name === gradForm.beltName)?.label} ${gradForm.beltDegree}º grau`);
    setGradOpen(false);
  };

  const openFeedback = () => {
    setFeedbackForm({ title: "", description: "", date: new Date().toISOString().split("T")[0] });
    setFeedbackOpen(true);
  };

  const saveFeedback = () => {
    if (!feedbackForm.title.trim()) { toast.error("Informe o título do feedback"); return; }
    toast.success("Feedback registrado na timeline!");
    setFeedbackOpen(false);
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
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/alunos")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          <Button size="sm" onClick={openGraduation}>
            <Award className="mr-2 h-4 w-4" /> Nova Graduação
          </Button>
          <Button size="sm" onClick={openFeedback}>
            <MessageSquare className="mr-2 h-4 w-4" /> Novo Feedback
          </Button>
        </div>
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
          <TabsTrigger value="responsaveis">Responsáveis</TabsTrigger>
          <TabsTrigger value="escolar">Escolar</TabsTrigger>
          <TabsTrigger value="saude">Saúde</TabsTrigger>
          <TabsTrigger value="evolucao">Evolução</TabsTrigger>
          <TabsTrigger value="frequencia">Frequência</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="contribuicao">Contribuição</TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Dados Pessoais</CardTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={openEditPersonal}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">CPF</span><span>{student.cpf}</span></div>
                {student.gender && <div className="flex justify-between"><span className="text-muted-foreground">Gênero</span><span className="capitalize">{student.gender}</span></div>}
                {student.birthDate && <div className="flex justify-between"><span className="text-muted-foreground">Nascimento</span><span>{new Date(student.birthDate).toLocaleDateString("pt-BR")}</span></div>}
                {student.phone && <div className="flex justify-between"><span className="text-muted-foreground">Telefone</span><span>{student.phone}</span></div>}
                {student.email && <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{student.email}</span></div>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Jiu-Jitsu</CardTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.info("Edição de dados Jiu-Jitsu em breve")}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {student.beltName && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Faixa atual</span>
                    <BeltDisplay beltName={student.beltName} degree={student.beltDegree ?? 0} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="responsaveis">
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
                            <AlertDialogAction onClick={() => deleteGuardian(g.name)}>Remover</AlertDialogAction>
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
        </TabsContent>

        <TabsContent value="escolar">
          <TabEscolar student={student} />
        </TabsContent>

        <TabsContent value="saude">
          <TabSaude />
        </TabsContent>

        <TabsContent value="evolucao">
          <TabEvolucao student={student} />
        </TabsContent>

        <TabsContent value="frequencia">
          <TabFrequencia student={student} />
        </TabsContent>

        <TabsContent value="documentos">
          <TabDocumentos />
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

      {/* Graduation Dialog */}
      <Dialog open={gradOpen} onOpenChange={setGradOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova Graduação</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Faixa</Label>
              <Select value={gradForm.beltName} onValueChange={(v) => setGradForm((p) => ({ ...p, beltName: v, beltDegree: 0 }))}>
                <SelectTrigger><SelectValue placeholder="Selecione a faixa" /></SelectTrigger>
                <SelectContent>
                  {belts.map((b) => (
                    <SelectItem key={b.name} value={b.name}>{b.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {gradForm.beltName && (
              <div className="space-y-2">
                <Label>Grau</Label>
                <Select value={String(gradForm.beltDegree)} onValueChange={(v) => setGradForm((p) => ({ ...p, beltDegree: Number(v) }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {degreeOptions.map((d) => (
                      <SelectItem key={d} value={String(d)}>{d}º grau</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {gradForm.beltName && (
              <div className="flex items-center gap-2">
                <Label className="text-muted-foreground">Preview:</Label>
                <BeltDisplay beltName={gradForm.beltName} degree={gradForm.beltDegree} size="md" />
              </div>
            )}
            <div className="space-y-2">
              <Label>Data da Graduação</Label>
              <Input type="date" value={gradForm.date} onChange={(e) => setGradForm((p) => ({ ...p, date: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea value={gradForm.notes} onChange={(e) => setGradForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Observações sobre a graduação..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGradOpen(false)}>Cancelar</Button>
            <Button onClick={saveGraduation}>Registrar Graduação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Feedback</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input value={feedbackForm.title} onChange={(e) => setFeedbackForm((p) => ({ ...p, title: e.target.value }))} placeholder="Ex: Avaliação Trimestral" />
            </div>
            <div className="space-y-2">
              <Label>Data</Label>
              <Input type="date" value={feedbackForm.date} onChange={(e) => setFeedbackForm((p) => ({ ...p, date: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={feedbackForm.description} onChange={(e) => setFeedbackForm((p) => ({ ...p, description: e.target.value }))} placeholder="Observações sobre o aluno..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackOpen(false)}>Cancelar</Button>
            <Button onClick={saveFeedback}>Registrar Feedback</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
