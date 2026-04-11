import { useEffect } from "react";
import { usePageTitle } from "@/hooks/use-page-title";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BeltDisplay } from "@/components/alunos/belt-display";
import { Award, Clock } from "lucide-react";
import { useStudents } from "@/hooks/use-students";
import type { Student } from "@/types";

export default function MeusAlunosPage() {
  const { setTitle } = usePageTitle();
  useEffect(() => { setTitle("Meus Alunos"); }, [setTitle]);

  const { user } = useAuth();
  // In the future, filter by guardian's linked students from the API
  const { data: allStudents = [] } = useStudents();
  // Show the first 2 students as a placeholder for guardian's linked students
  const students: Student[] = allStudents.slice(0, 2);

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Olá, <span className="font-medium text-foreground">{user.name}</span>! Acompanhe aqui o progresso dos seus filhos no projeto.
      </p>

      {students.map(student => {
        const initials = student.name.split(" ").map(n => n[0]).join("").slice(0, 2);
        const attendanceRate = 0; // Attendance data not available in list endpoint

        return (
          <Card key={student.id}>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">{student.name}</CardTitle>
                  <CardDescription>Matrícula: {student.matricula}</CardDescription>
                </div>
                <Badge variant={student.status === "ativo" ? "default" : student.status === "pendente" ? "secondary" : "destructive"}>
                  {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="resumo">
                <TabsList className="mb-4">
                  <TabsTrigger value="resumo">Resumo</TabsTrigger>
                  <TabsTrigger value="frequencia">Frequência</TabsTrigger>
                  <TabsTrigger value="evolucao">Evolução</TabsTrigger>
                </TabsList>

                <TabsContent value="resumo">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center gap-3 rounded-lg border p-3">
                      <Award className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Graduação</p>
                        <BeltDisplay beltName={student.beltName} degree={student.beltDegree} size="sm" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border p-3">
                      <Clock className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Data de Nasc.</p>
                        <p className="text-sm font-medium">{student.birthDate ? new Date(student.birthDate + "T12:00:00").toLocaleDateString("pt-BR") : "—"}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="frequencia">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Taxa de presença</span>
                        <span className="font-semibold">{attendanceRate}%</span>
                      </div>
                      <Progress value={attendanceRate} className="h-3" />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-lg border p-3 text-center">
                        <p className="text-2xl font-bold text-primary">—</p>
                        <p className="text-xs text-muted-foreground">Aulas frequentadas</p>
                      </div>
                      <div className="rounded-lg border p-3 text-center">
                        <p className="text-2xl font-bold text-muted-foreground">5</p>
                        <p className="text-xs text-muted-foreground">Faltas</p>
                      </div>
                      <div className="rounded-lg border p-3 text-center">
                        <p className="text-2xl font-bold text-success">{attendanceRate}%</p>
                        <p className="text-xs text-muted-foreground">Frequência</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="evolucao">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 rounded-lg border p-3">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Graduação atual</p>
                        <p className="text-xs text-muted-foreground">Faixa e grau</p>
                      </div>
                      <BeltDisplay beltName={student.beltName ?? "white_belt"} degree={student.beltDegree ?? 0} size="sm" />
                    </div>
                    {(student.beltDegree ?? 0) > 0 && (
                      <div className="flex items-center gap-3 rounded-lg border p-3">
                        <div className="h-2 w-2 rounded-full bg-success" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Graduação — {student.beltDegree}º grau</p>
                          <p className="text-xs text-muted-foreground">Grau atual</p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        );
      })}

      {students.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum aluno vinculado à sua conta.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
