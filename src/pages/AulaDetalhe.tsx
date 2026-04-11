import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/use-page-title";
import { useLesson } from "@/hooks/use-classes";
import { useLessonAttendance, useBatchAttendance } from "@/hooks/use-attendance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BeltDisplay } from "@/components/alunos/belt-display";
import { ArrowLeft, Calendar, Clock, MapPin, Users, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function AulaDetalhePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setTitle } = usePageTitle();

  const { data: lesson, isLoading: lessonLoading } = useLesson(id);
  const { data: attendanceData = [], isLoading: attendanceLoading } = useLessonAttendance(id);
  const batchAttendance = useBatchAttendance();

  const [localAttendance, setLocalAttendance] = useState<{ id: string; studentId: string; studentName: string; present: boolean; checkedInAt?: string; studentBelt?: string; studentDegree?: number }[]>([]);

  useEffect(() => {
    if (attendanceData.length > 0) {
      setLocalAttendance(attendanceData.map(a => ({ ...a })));
    }
  }, [attendanceData]);

  useEffect(() => {
    setTitle(lesson ? `Aula - ${lesson.classGroup?.name ?? ""}` : "Aula");
  }, [setTitle, lesson]);

  const presentCount = useMemo(() => localAttendance.filter(a => a.present).length, [localAttendance]);

  if (lessonLoading || attendanceLoading) return <div className="p-8 text-center text-muted-foreground">Carregando aula...</div>;

  if (!lesson) return <div className="text-center py-12 text-muted-foreground">Aula não encontrada.</div>;

  const togglePresence = (recordId: string) => {
    setLocalAttendance(prev => prev.map(a => a.id === recordId ? { ...a, present: !a.present } : a));
  };

  const markAll = (present: boolean) => {
    setLocalAttendance(prev => prev.map(a => ({ ...a, present })));
  };

  const saveAttendance = async () => {
    if (!id) return;
    try {
      await batchAttendance.mutateAsync({
        lessonId: id,
        records: localAttendance.map(a => ({ studentId: a.studentId, present: a.present })),
      });
      toast({ title: "Presença salva!", description: `${presentCount} de ${localAttendance.length} alunos presentes.` });
    } catch {
      toast({ title: "Erro ao salvar presença", variant: "destructive" });
    }
  };

  const dateStr = new Date(lesson.date + "T12:00:00").toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate("/aulas")}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
      </Button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{lesson.classGroup?.name ?? "Aula"}</h2>
          <p className="text-muted-foreground capitalize">{dateStr}</p>
        </div>
        <Badge variant={lesson.status === "realizada" ? "default" : lesson.status === "cancelada" ? "destructive" : "outline"}>
          {lesson.status === "realizada" ? "Realizada" : lesson.status === "cancelada" ? "Cancelada" : "Agendada"}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="pt-6 flex items-center gap-3">
          <Calendar className="h-5 w-5 text-primary" />
          <div><p className="text-sm text-muted-foreground">Data</p><p className="font-medium capitalize">{new Date(lesson.date + "T12:00:00").toLocaleDateString("pt-BR")}</p></div>
        </CardContent></Card>
        <Card><CardContent className="pt-6 flex items-center gap-3">
          <Clock className="h-5 w-5 text-primary" />
          <div><p className="text-sm text-muted-foreground">Horário</p><p className="font-medium">{lesson.startTime} - {lesson.endTime}</p></div>
        </CardContent></Card>
        <Card><CardContent className="pt-6 flex items-center gap-3">
          <MapPin className="h-5 w-5 text-primary" />
          <div><p className="text-sm text-muted-foreground">Local</p><p className="font-medium">{lesson.location}</p></div>
        </CardContent></Card>
        <Card><CardContent className="pt-6 flex items-center gap-3">
          <Users className="h-5 w-5 text-primary" />
          <div><p className="text-sm text-muted-foreground">Presença</p><p className="font-medium">{presentCount}/{localAttendance.length}</p></div>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Lista de Presença</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => markAll(true)}>
                <CheckCircle2 className="h-4 w-4 mr-1" /> Todos presentes
              </Button>
              <Button variant="outline" size="sm" onClick={() => markAll(false)}>
                <XCircle className="h-4 w-4 mr-1" /> Limpar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {localAttendance.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Nenhum aluno registrado nesta aula.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Presente</TableHead>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Faixa</TableHead>
                  <TableHead>Check-in</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {localAttendance.map(a => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <Checkbox checked={a.present} onCheckedChange={() => togglePresence(a.id)} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {a.studentName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{a.studentName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {a.studentBelt ? (
                        <BeltDisplay beltName={a.studentBelt} degree={a.studentDegree ?? 0} size="sm" />
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{a.checkedInAt ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <div className="flex justify-end mt-4">
            <Button onClick={saveAttendance} disabled={batchAttendance.isPending}>
              {batchAttendance.isPending ? "Salvando..." : "Salvar Presença"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
