import { useEffect } from "react";
import { usePageTitle } from "@/hooks/use-page-title";
import { belts } from "@/config/belts";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award } from "lucide-react";

export default function FaixasGrausPage() {
  const { setTitle } = usePageTitle();
  useEffect(() => { setTitle("Faixas e Graus"); }, [setTitle]);

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/50 pb-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Award className="size-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold tracking-tight">Sistema de Graduação</CardTitle>
              <CardDescription className="text-sm">Regras de faixas e graus oficiais do projeto</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-3">
            {belts.map((belt) => (
              <div
                key={belt.name}
                className="flex items-center gap-4 p-3 rounded-xl border border-border/40 bg-card hover:bg-muted/30 transition-all group"
              >
                {/* Belt visual */}
                <div className="shrink-0">
                  <div
                    className={cn(
                      "w-32 h-8 rounded-md relative flex items-center justify-center overflow-hidden border border-border/30 shadow-sm transition-transform group-hover:scale-[1.02]",
                      belt.color
                    )}
                  >
                    {/* Degree markers */}
                    <div className="flex gap-1">
                      {Array.from({ length: belt.degrees.quantity }).map((_, i) => (
                        <div
                          key={i}
                          className={cn("w-3 h-5 rounded-[1px]", belt.degrees.bg)}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Belt info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[15px] tracking-tight">{belt.label}</h3>
                    <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest px-1.5 py-0 rounded-md">
                      {belt.degrees.quantity} {belt.degrees.quantity === 1 ? "grau" : "graus"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {getBeltDescription(belt.name)}
                  </p>
                </div>

                {/* Degree indicators */}
                <div className="hidden sm:flex gap-1.5 pr-2">
                  {Array.from({ length: Math.min(belt.degrees.quantity, 4) }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "size-6 rounded-lg border flex items-center justify-center text-[10px] font-black tracking-tighter transition-all",
                        belt.name === "white_belt" 
                          ? "border-border text-muted-foreground bg-muted/50" 
                          : "border-primary/20 bg-primary/5 text-primary"
                      )}
                    >
                      {i + 1}º
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="rounded-2xl border-border/40 bg-muted/20 border-dashed shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Legenda e Regras</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px] font-medium text-muted-foreground/80">
            <div className="flex items-start gap-3">
              <div className="size-2 rounded-full bg-primary mt-1.5 shrink-0" />
              <p>Cada grau é representado por uma fita na ponta da faixa, indicando evolução técnica.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="size-2 rounded-full bg-primary mt-1.5 shrink-0" />
              <p>A graduação de 0 graus indica o início daquela faixa e o domínio dos requisitos anteriores.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="size-2 rounded-full bg-primary mt-1.5 shrink-0" />
              <p>Promoções são exclusivas do instrutor responsável, após avaliação de tempo e técnica.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="size-2 rounded-full bg-primary mt-1.5 shrink-0" />
              <p>Faixas coral e vermelha são graduações de mestre e grã-mestre, por tempo de dedicação.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getBeltDescription(name: string): string {
  const descriptions: Record<string, string> = {
    white_belt: "Faixa inicial para todos os praticantes. Foco nos fundamentos básicos.",
    blue_belt: "Primeiro avanço significativo. Domínio de posições e transições básicas.",
    purple_belt: "Nível intermediário avançado. Desenvolvimento de jogo próprio.",
    brown_belt: "Pré-graduação máxima. Refinamento técnico e preparação para faixa preta.",
    black_belt: "Graduação máxima regular. Maestria técnica e capacidade de ensino.",
    red_black_belt: "Coral (7º grau). Reconhecimento por contribuição ao Jiu-Jitsu.",
    red_white_belt: "Coral vermelho e branca (8º grau). Distinção honorária.",
    red_belt: "Grã-mestre (9º e 10º grau). Maior honraria do Jiu-Jitsu.",
  };
  return descriptions[name] || "";
}
