import { useEffect, useState, useMemo } from "react";
import { usePageTitle } from "@/hooks/use-page-title";
import { useLessons, useClassGroups } from "@/hooks/use-classes";
import { useLessonAttendance } from "@/hooks/use-attendance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Search, ClipboardCheck, Eye, Users, CheckCircle2, XCircle } from "lucide-react";

function AttendanceDetailTable({ lessonId }: { lessonId: string }) {
  const { data: attendance = [], isLoading } = useLessonAttendance(lessonId);
  if (isLoading) return <p className="text-center py-4 text-muted-foreground">Carregando...</p>;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Aluno</TableHead>
          <TableHead className="text-center">Presente</TableHead>
          <TableHead className="text-center">Check-in</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {attendance.map(record => (
          <TableRow key={record.id}>
            <TableCell className="font-medium">{record.studentName}</TableCell>
            <TableCell className="text-center">
              {record.present ? (
                <CheckCircle2 className="h-5 w-5 text-primary mx-auto" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive mx-auto" />
              )}
            </TableCell>
            <TableCell className="text-center text-sm text-muted-foreground">
              {record.checkedInAt ?? "—"}
            </TableCell>
          </TableRow>
        ))}
        {attendance.length === 0 && (
          <TableRow>
            <TableCell colSpan={3} className="text-center text-muted-foreground py-4">Nenhum registro de presença.</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export default function PresencasPage() {
  const { setTitle } = usePageTitle();
  useEffect(() => { setTitle("Presenças"); }, [setTitle]);

  const { data: lessons = [], isLoading: lessonsLoading } = useLessons();
  const { data: classGroups = [] } = useClassGroups();

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [detailLesson, setDetailLesson] = useState<string | null>(null);

  const pastLessons = useMemo(() => {
    return lessons
      .filter(l => l.status === "realizada")
      .filter(l => {
        const matchClass = classFilter === "all" || l.classGroupId === classFilter;
        const cgName = classGroups.find(cg => cg.id === l.classGroupId)?.name ?? "";
        const matchSearch = !search || cgName.toLowerCase().includes(search.toLowerCase()) || l.instructorName.toLowerCase().includes(search.toLowerCase());
        return matchClass && matchSearch;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [lessons, classGroups, search, classFilter]);

  const selectedLesson = detailLesson ? lessons.find(l => l.id === detailLesson) : null;
  const selectedCgName = selectedLesson ? (classGroups.find(cg => cg.id === selectedLesson.classGroupId)?.name ?? "—") : "";

  // Stats
  const totalLessons = pastLessons.length;

  if (lessonsLoading) return <div className="p-8 text-center text-muted-foreground">Carregando presenças...</div>;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <ClipboardCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalLessons}</p>
                <p className="text-sm text-muted-foreground">Aulas Realizadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{classGroups.length}</p>
                <p className="text-sm text-muted-foreground">Turmas Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/50">
                <CheckCircle2 className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">—</p>
                <p className="text-sm text-muted-foreground">Taxa Média de Presença</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por turma ou instrutor..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Todas as turmas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as turmas</SelectItem>
            {classGroups.map(cg => (
              <SelectItem key={cg.id} value={cg.id}>{cg.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Histórico de Presenças
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Turma</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead>Instrutor</TableHead>
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {pastLessons.map(lesson => {
                const cgName = classGroups.find(cg => cg.id === lesson.classGroupId)?.name ?? "—";
                return (
                  <TableRow key={lesson.id}>
                    <TableCell>
                      {new Date(lesson.date + "T12:00:00").toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="font-medium">{cgName}</TableCell>
                    <TableCell>{lesson.startTime} - {lesson.endTime}</TableCell>
                    <TableCell>{lesson.instructorName}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => setDetailLesson(lesson.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {pastLessons.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                    Nenhuma aula realizada encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!detailLesson} onOpenChange={open => !open && setDetailLesson(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Presença — {selectedCgName} ({selectedLesson ? new Date(selectedLesson.date + "T12:00:00").toLocaleDateString("pt-BR") : ""})
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-1 text-sm text-muted-foreground mb-2">
            <p>Horário: {selectedLesson?.startTime} - {selectedLesson?.endTime}</p>
            <p>Instrutor: {selectedLesson?.instructorName}</p>
          </div>
          {detailLesson && <AttendanceDetailTable lessonId={detailLesson} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
