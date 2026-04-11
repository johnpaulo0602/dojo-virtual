import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Clock, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ClassGroup } from "@/types";

function getDayName(day: number): string {
  return ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][day] ?? String(day);
}

interface ClassGroupCardProps {
  classGroup: ClassGroup;
}

export function ClassGroupCard({ classGroup: cg }: ClassGroupCardProps) {
  const navigate = useNavigate();
  const occupancy = Math.round(((cg.enrolledCount ?? 0) / cg.capacity) * 100);

  return (
    <Card className="hover:border-primary/40 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{cg.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{cg.description}</p>
          </div>
          <Badge variant={cg.status === "ativa" ? "default" : "secondary"}>
            {cg.status === "ativa" ? "Ativa" : "Inativa"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>Instrutor Principal: {cg.instructorName}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4 shrink-0" />
          <span>
            {(cg.schedules ?? []).map(s => `${getDayName(s.dayOfWeek)} ${s.startTime}-${s.endTime}`).join(" · ")}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Faixa etária:</span>
          <span>{cg.ageRange}</span>
          <span className="text-muted-foreground ml-2">Faixas:</span>
          <span>{cg.beltRange}</span>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Ocupação</span>
            <span className="font-medium">{cg.enrolledCount ?? 0}/{cg.capacity} ({occupancy}%)</span>
          </div>
          <div className="h-2 rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.min(occupancy, 100)}%` }}
            />
          </div>
        </div>

        <Button variant="outline" size="sm" className="w-full" onClick={() => navigate(`/turmas/${cg.id}`)}>
          <Eye className="h-4 w-4 mr-2" />
          Ver Detalhes
        </Button>
      </CardContent>
    </Card>
  );
}
