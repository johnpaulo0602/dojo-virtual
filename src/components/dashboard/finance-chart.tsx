import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";

export function FinanceChart() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Movimentação Financeira</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[280px] flex flex-col items-center justify-center gap-3">
          <div className="p-3 rounded-full bg-muted">
            <BarChart3 className="h-8 w-8 text-muted-foreground" />
          </div>
          <Badge variant="secondary">Em breve</Badge>
          <p className="text-sm text-muted-foreground text-center max-w-[200px]">
            Gráfico de movimentação financeira em desenvolvimento.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
