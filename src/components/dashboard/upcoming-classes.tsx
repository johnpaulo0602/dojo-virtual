import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLessons, useClassGroups } from "@/hooks/use-classes";
import { Clock } from "lucide-react";
import { useMemo } from "react";

export function UpcomingClasses() {
  const { data: lessons = [], isLoading } = useLessons();
  const { data: classGroups = [] } = useClassGroups();

  const cgNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    classGroups.forEach(cg => { map[cg.id] = cg.name; });
    return map;
  }, [classGroups]);

  const upcoming = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return lessons
      .filter(l => l.status === "agendada" && l.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
      .slice(0, 5);
  }, [lessons]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Próximas Aulas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {isLoading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-14 bg-muted rounded animate-pulse" />)}
          </div>
        ) : upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhuma aula agendada.</p>
        ) : (
          upcoming.map((lesson) => (
            <div key={lesson.id} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">{cgNameMap[lesson.classGroupId] ?? "—"}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(lesson.date + "T12:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}, {lesson.startTime}
                  </span>
                  <span>{lesson.instructorName}</span>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">Agendada</Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
