import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";

export function RecentActivity() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col items-center justify-center gap-3 py-8">
          <div className="p-3 rounded-full bg-muted">
            <Activity className="h-6 w-6 text-muted-foreground" />
          </div>
          <Badge variant="secondary">Em breve</Badge>
          <p className="text-sm text-muted-foreground text-center max-w-[200px]">
            Feed de atividades recentes em desenvolvimento.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
