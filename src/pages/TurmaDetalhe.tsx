import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/use-page-title";
import { useClassGroup } from "@/hooks/use-classes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, MapPin, Clock, Calendar } from "lucide-react";

const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const getDayName = (d: number) => dayNames[d] ?? "";

export default function TurmaDetalhePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setTitle } = usePageTitle();

  const { data: cg, isLoading, isError } = useClassGroup(id);

  useEffect(() => { setTitle(cg?.name ?? "Turma"); }, [setTitle, cg]);

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Carregando turma...</div>;

  if (!cg || isError) return <div className="text-center py-12 text-muted-foreground">Turma não encontrada.</div>;

  const schedules = cg.schedules ?? [];

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate("/turmas")}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
      </Button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{cg.name}</h2>
          {cg.description && <p className="text-muted-foreground">{cg.description}</p>}
        </div>
        <Badge variant={cg.status === "ativa" ? "default" : "secondary"} className="self-start">
          {cg.status === "ativa" ? "Ativa" : "Inativa"}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="pt-6 flex items-center gap-3">
          <Users className="h-5 w-5 text-primary" />
          <div><p className="text-sm text-muted-foreground">Instrutor</p><p className="font-medium">{cg.instructorName ?? "—"}</p></div>
        </CardContent></Card>
        <Card><CardContent className="pt-6 flex items-center gap-3">
          <MapPin className="h-5 w-5 text-primary" />
          <div><p className="text-sm text-muted-foreground">Local</p><p className="font-medium">{cg.location ?? "—"}</p></div>
        </CardContent></Card>
        <Card><CardContent className="pt-6 flex items-center gap-3">
          <Clock className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Horários</p>
            <p className="font-medium text-sm">
              {schedules.length > 0
                ? schedules.map(s => `${getDayName(s.dayOfWeek)} ${s.startTime}`).join(", ")
                : "—"}
            </p>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-6 flex items-center gap-3">
          <Calendar className="h-5 w-5 text-primary" />
          <div><p className="text-sm text-muted-foreground">Ocupação</p><p className="font-medium">{cg.enrolledCount ?? "—"}/{cg.capacity}</p></div>
        </CardContent></Card>
      </div>

      {cg.ageRange && (
        <Card>
          <CardContent className="pt-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Faixa etária</span>
              <span>{cg.ageRange}</span>
            </div>
            {cg.beltRange && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Faixas</span>
                <span>{cg.beltRange}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
