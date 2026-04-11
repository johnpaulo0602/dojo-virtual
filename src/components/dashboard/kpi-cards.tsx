import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardSummary } from "@/hooks/use-dashboard";
import { Users, GraduationCap, CalendarCheck, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiItem {
  label: string;
  value: string | number;
  icon: React.ElementType;
  change?: number;
  changeLabel?: string;
}

export function KpiCards() {
  const { data: summary, isLoading } = useDashboardSummary();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1,2,3,4].map(i => (
          <Card key={i} className="border border-border/50 bg-card/50 animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2 mb-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const kpis: KpiItem[] = [
    {
      label: "Total de Alunos",
      value: summary?.totalStudents ?? "—",
      icon: Users,
    },
    {
      label: "Alunos Ativos",
      value: summary?.activeStudents ?? "—",
      icon: Users,
    },
    {
      label: "Aulas no Mês",
      value: summary?.totalLessonsMonth ?? "—",
      icon: CalendarCheck,
    },
    {
      label: "Turmas Ativas",
      value: summary?.activeClassGroups ?? "—",
      icon: GraduationCap,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        const change = kpi.change ?? 0;
        const isPositive = change > 0;
        const isNeutral = change === 0;

        return (
          <Card key={kpi.label} className="border border-border/50 bg-card/50 shadow-sm transition-all hover:bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground tracking-tight">
                {kpi.label}
              </CardTitle>
              <div className="rounded-md bg-primary/5 p-1.5 border border-primary/10">
                <Icon className="size-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-1">
                <p className="text-2xl font-bold tracking-tight">{kpi.value}</p>
                {kpi.changeLabel && (
                  <div className="flex items-center gap-1.5">
                    <div className={cn(
                      "flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase",
                      isNeutral ? "bg-muted text-muted-foreground" : isPositive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                    )}>
                      {isNeutral ? (
                        <Minus className="size-2.5" />
                      ) : isPositive ? (
                        <TrendingUp className="size-2.5" />
                      ) : (
                        <TrendingDown className="size-2.5" />
                      )}
                      <span>
                        {isNeutral ? "0%" : `${isPositive ? "+" : ""}${change}%`}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground font-medium">
                      {kpi.changeLabel}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
