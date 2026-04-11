import { useEffect } from "react";
import { usePageTitle } from "@/hooks/use-page-title";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";

export default function RelatoriosPage() {
  const { setTitle } = usePageTitle();
  useEffect(() => { setTitle("Relatórios Financeiros"); }, [setTitle]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full text-center">
        <CardContent className="pt-10 pb-10 space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <BarChart3 className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Relatórios Financeiros</h2>
            <Badge variant="secondary" className="text-sm">Em breve</Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Estamos desenvolvendo relatórios detalhados com gráficos, exportação em PDF e análise financeira avançada.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
