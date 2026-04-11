import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useStudents } from "@/hooks/use-students";
import { useClassGroups } from "@/hooks/use-classes";
import { useUsers } from "@/hooks/use-users";
import { belts } from "@/config/belts";
import { ArrowRight, Users } from "lucide-react";

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

function getBeltInfo(beltName: string) {
  return belts.find(b => b.name === beltName);
}

const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
  ativo: "default",
  inativo: "destructive",
  pendente: "secondary",
};

export function OverviewTabs() {
  const navigate = useNavigate();
  const { data: students = [], isLoading: studentsLoading } = useStudents();
  const { data: classGroups = [], isLoading: classGroupsLoading } = useClassGroups();
  const { data: users = [], isLoading: usersLoading } = useUsers("instrutor,monitor");

  const recentStudents = students.slice(0, 5);
  const recentClassGroups = classGroups.slice(0, 5);
  const recentUsers = users.slice(0, 5);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Visão Geral</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs defaultValue="alunos">
          <TabsList className="mb-4 w-full justify-start">
            <TabsTrigger value="alunos">Alunos</TabsTrigger>
            <TabsTrigger value="turmas">Turmas</TabsTrigger>
            <TabsTrigger value="instrutores">Instrutores</TabsTrigger>
          </TabsList>

          {/* Alunos Tab */}
          <TabsContent value="alunos">
            {studentsLoading ? (
              <div className="space-y-2">{[1,2,3].map(i=><div key={i} className="h-10 bg-muted rounded animate-pulse"/>)}</div>
            ) : (
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Aluno</TableHead>
                      <TableHead>Faixa</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentStudents.map((s) => {
                      const belt = s.beltName ? getBeltInfo(s.beltName) : null;
                      return (
                        <TableRow key={s.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs bg-muted">{getInitials(s.name)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{s.name}</p>
                                <p className="text-xs text-muted-foreground">{s.matricula}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {belt ? (
                              <div className="flex items-center gap-2">
                                <div className="h-4 w-4 rounded-sm border border-border" style={{ backgroundColor: belt.color }} />
                                <span className="text-sm">{belt.label} {(s.beltDegree ?? 0) > 0 ? `${s.beltDegree}º grau` : ""}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusVariant[s.status ?? ""] ?? "secondary"}>{s.status ?? "—"}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {recentStudents.length === 0 && (
                      <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-4">Nenhum aluno encontrado.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
            <div className="mt-3 flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => navigate("/alunos")}>
                Ver todos <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          {/* Turmas Tab */}
          <TabsContent value="turmas">
            {classGroupsLoading ? (
              <div className="space-y-2">{[1,2,3].map(i=><div key={i} className="h-10 bg-muted rounded animate-pulse"/>)}</div>
            ) : (
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Turma</TableHead>
                      <TableHead>Instrutor</TableHead>
                      <TableHead>Alunos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentClassGroups.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="text-sm font-medium">{c.name}</TableCell>
                        <TableCell className="text-sm">{c.instructorName ?? "—"}</TableCell>
                        <TableCell>
                          <Badge variant={(c.enrolledCount ?? 0) >= c.capacity ? "destructive" : "secondary"}>
                            <Users className="mr-1 h-3 w-3" />{c.enrolledCount ?? 0}/{c.capacity}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {recentClassGroups.length === 0 && (
                      <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-4">Nenhuma turma encontrada.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
            <div className="mt-3 flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => navigate("/turmas")}>
                Ver todas <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          {/* Instrutores Tab */}
          <TabsContent value="instrutores">
            {usersLoading ? (
              <div className="space-y-2">{[1,2,3].map(i=><div key={i} className="h-10 bg-muted rounded animate-pulse"/>)}</div>
            ) : (
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="text-sm font-medium">{u.name}</TableCell>
                        <TableCell>
                          <Badge variant={u.role === "instrutor" ? "default" : "secondary"}>
                            {u.role === "instrutor" ? "Instrutor" : "Monitor"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                      </TableRow>
                    ))}
                    {recentUsers.length === 0 && (
                      <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-4">Nenhum instrutor encontrado.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
            <div className="mt-3 flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => navigate("/equipe-tecnica")}>
                Ver todos <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
