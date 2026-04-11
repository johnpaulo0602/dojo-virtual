import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, CheckCircle2, XCircle, TrendingUp, AlertTriangle } from "lucide-react";
import type { StudentDetail } from "@/types";

interface AttendanceMonth {
  month: string;
  total: number;
  present: number;
  absent: number;
  percentage: number;
}

function getMockAttendance(student: StudentDetail): { months: AttendanceMonth[]; totalPresent: number; totalAbsent: number; totalClasses: number; percentage: number; streak: number } {
  const months: AttendanceMonth[] = [
    { month: "Mar/2026", total: 12, present: 10, absent: 2, percentage: 83 },
    { month: "Fev/2026", total: 10, present: 9, absent: 1, percentage: 90 },
    { month: "Jan/2026", total: 8, present: 6, absent: 2, percentage: 75 },
    { month: "Dez/2025", total: 10, present: 8, absent: 2, percentage: 80 },
    { month: "Nov/2025", total: 12, present: 11, absent: 1, percentage: 92 },
    { month: "Out/2025", total: 12, present: 10, absent: 2, percentage: 83 },
  ];
  const totalPresent = months.reduce((s, m) => s + m.present, 0);
  const totalAbsent = months.reduce((s, m) => s + m.absent, 0);
  const totalClasses = months.reduce((s, m) => s + m.total, 0);
  return { months, totalPresent, totalAbsent, totalClasses, percentage: Math.round((totalPresent / totalClasses) * 100), streak: 5 };
}

interface Props {
  student: StudentDetail;
}

export function TabFrequencia({ student }: Props) {
  const data = getMockAttendance(student);
  const isLow = data.percentage < 75;

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4 flex flex-col items-center gap-1">
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
            <span className="text-2xl font-bold">{data.totalClasses}</span>
            <span className="text-xs text-muted-foreground">Total de Aulas</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex flex-col items-center gap-1">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span className="text-2xl font-bold text-green-600">{data.totalPresent}</span>
            <span className="text-xs text-muted-foreground">Presenças</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex flex-col items-center gap-1">
            <XCircle className="h-5 w-5 text-destructive" />
            <span className="text-2xl font-bold text-destructive">{data.totalAbsent}</span>
            <span className="text-xs text-muted-foreground">Faltas</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex flex-col items-center gap-1">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold">{data.streak}</span>
            <span className="text-xs text-muted-foreground">Sequência Atual</span>
          </CardContent>
        </Card>
      </div>

      {/* Overall health */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Saúde da Frequência</CardTitle>
          <Badge variant={isLow ? "destructive" : "default"} className="flex items-center gap-1">
            {isLow && <AlertTriangle className="h-3 w-3" />}
            {data.percentage}% de presença
          </Badge>
        </CardHeader>
        <CardContent>
          <Progress value={data.percentage} className="h-3" />
          {isLow && (
            <p className="text-sm text-destructive mt-2 flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" /> Frequência abaixo do mínimo recomendado (75%)
            </p>
          )}
        </CardContent>
      </Card>

      {/* Monthly breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Frequência por Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.months.map((m) => (
              <div key={m.month} className="flex items-center gap-4">
                <span className="text-sm font-medium w-24">{m.month}</span>
                <div className="flex-1">
                  <Progress value={m.percentage} className="h-2" />
                </div>
                <div className="flex items-center gap-2 w-32 justify-end text-sm">
                  <span className="text-green-600">{m.present}P</span>
                  <span className="text-muted-foreground">/</span>
                  <span className="text-destructive">{m.absent}F</span>
                  <Badge variant={m.percentage < 75 ? "destructive" : "outline"} className="text-xs ml-1">
                    {m.percentage}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
