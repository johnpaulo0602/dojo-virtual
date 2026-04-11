import { useEffect, useState, useMemo } from "react";
import { usePageTitle } from "@/hooks/use-page-title";
import { useLessons, useClassGroups } from "@/hooks/use-classes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  agendada: { label: "Agendada", variant: "outline" },
  realizada: { label: "Realizada", variant: "default" },
  cancelada: { label: "Cancelada", variant: "destructive" },
};

export default function AulasPage() {
  const { setTitle } = usePageTitle();
  const navigate = useNavigate();
  useEffect(() => { setTitle("Aulas"); }, [setTitle]);

  const { data: lessons = [], isLoading } = useLessons();
  const { data: classGroups = [] } = useClassGroups();

  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [classFilter, setClassFilter] = useState("all");
  const [view, setView] = useState<"calendar" | "list">("calendar");

  const classGroupNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    classGroups.forEach(cg => { map[cg.id] = cg.name; });
    return map;
  }, [classGroups]);

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const filtered = useMemo(() => {
    return lessons.filter(l => {
      const d = new Date(l.date + "T12:00:00");
      const matchMonth = d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
      const matchClass = classFilter === "all" || l.classGroupId === classFilter;
      return matchMonth && matchClass;
    });
  }, [lessons, currentMonth, classFilter]);

  // Calendar grid
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: { day: number | null; lessons: typeof filtered }[] = [];

    for (let i = 0; i < firstDay; i++) days.push({ day: null, lessons: [] });
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({ day: d, lessons: filtered.filter(l => l.date === dateStr) });
    }
    return days;
  }, [currentMonth, filtered]);

  const monthLabel = currentMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Carregando aulas...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="font-semibold capitalize min-w-[180px] text-center">{monthLabel}</span>
          <Button variant="outline" size="icon" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
        </div>
        <div className="flex gap-2">
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todas as turmas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as turmas</SelectItem>
              {classGroups.map(cg => (
                <SelectItem key={cg.id} value={cg.id}>{cg.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant={view === "calendar" ? "default" : "outline"} size="sm" onClick={() => setView("calendar")}>
            <CalendarIcon className="h-4 w-4" />
          </Button>
          <Button variant={view === "list" ? "default" : "outline"} size="sm" onClick={() => setView("list")}>
            Lista
          </Button>
        </div>
      </div>

      {view === "calendar" ? (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-px">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(d => (
                <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
              ))}
              {calendarDays.map((cell, i) => (
                <div key={i} className={`min-h-[80px] p-1 border rounded-md ${cell.day ? "bg-card" : "bg-transparent border-transparent"}`}>
                  {cell.day && (
                    <>
                      <span className="text-xs font-medium text-muted-foreground">{cell.day}</span>
                      <div className="space-y-1 mt-1">
                        {cell.lessons.slice(0, 3).map(l => (
                          <button
                            key={l.id}
                            onClick={() => navigate(`/aulas/${l.id}`)}
                            className={`w-full text-left text-[10px] leading-tight px-1 py-0.5 rounded truncate ${
                              l.status === "realizada" ? "bg-primary/20 text-primary" :
                              l.status === "cancelada" ? "bg-destructive/20 text-destructive" :
                              "bg-secondary text-secondary-foreground"
                            }`}
                          >
                            {l.startTime} {classGroupNameMap[l.classGroupId] ?? "—"}
                          </button>
                        ))}
                        {cell.lessons.length > 3 && (
                          <span className="text-[10px] text-muted-foreground">+{cell.lessons.length - 3}</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.length === 0 && <p className="text-center py-8 text-muted-foreground">Nenhuma aula neste período.</p>}
          {filtered.map(l => {
            const s = statusMap[l.status] ?? { label: l.status, variant: "outline" as const };
            return (
              <Card key={l.id} className="cursor-pointer hover:border-primary/40 transition-colors" onClick={() => navigate(`/aulas/${l.id}`)}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[50px]">
                      <p className="text-lg font-bold">{new Date(l.date + "T12:00:00").getDate()}</p>
                      <p className="text-xs text-muted-foreground capitalize">{new Date(l.date + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "short" })}</p>
                    </div>
                    <div>
                      <p className="font-medium">{classGroupNameMap[l.classGroupId] ?? "—"}</p>
                      <p className="text-sm text-muted-foreground">{l.startTime} - {l.endTime} · {l.instructorName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={s.variant}>{s.label}</Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
