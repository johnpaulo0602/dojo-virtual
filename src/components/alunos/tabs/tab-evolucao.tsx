import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BeltDisplay } from "@/components/alunos/belt-display";
import { Award, MessageSquare, Calendar, Star, Plus } from "lucide-react";
import { toast } from "sonner";
import type { StudentDetail } from "@/types";

interface TimelineEvent {
  id: string;
  type: "graduacao" | "feedback" | "evento" | "marco";
  date: string;
  title: string;
  description?: string;
  beltName?: string;
  beltDegree?: number;
}

const iconMap = {
  graduacao: Award,
  feedback: MessageSquare,
  evento: Calendar,
  marco: Star,
};

const colorMap = {
  graduacao: "text-yellow-500",
  feedback: "text-blue-500",
  evento: "text-green-500",
  marco: "text-purple-500",
};

const labelMap = {
  graduacao: "Graduação",
  feedback: "Feedback",
  evento: "Evento",
  marco: "Marco",
};

function getInitialTimeline(): TimelineEvent[] {
  return [
    { id: "e1", type: "graduacao", date: "2026-02-15", title: "Graduação para Faixa Branca 1º Grau", beltName: "white_belt", beltDegree: 1 },
    { id: "e2", type: "feedback", date: "2026-01-20", title: "Avaliação Trimestral", description: "Aluno demonstra boa evolução técnica e comprometimento nos treinos." },
    { id: "e3", type: "evento", date: "2025-11-10", title: "Participação no Campeonato Interno", description: "Medalha de ouro na categoria iniciante." },
    { id: "e4", type: "marco", date: "2025-09-05", title: "100 Treinos Completados", description: "Aluno atingiu a marca de 100 treinos registrados." },
    { id: "e5", type: "graduacao", date: "2025-06-20", title: "Início — Faixa Branca", beltName: "white_belt", beltDegree: 0 },
    { id: "e6", type: "feedback", date: "2025-04-15", title: "Primeiro Feedback", description: "Bom comportamento em aula, precisa melhorar a base." },
  ];
}

interface Props {
  student: StudentDetail;
}

export function TabEvolucao({ student }: Props) {
  const [timeline, setTimeline] = useState<TimelineEvent[]>(getInitialTimeline);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", date: new Date().toISOString().split("T")[0] });

  const handleAddFeedback = () => {
    if (!form.title.trim()) {
      toast.error("Informe o título do feedback");
      return;
    }
    const newEvent: TimelineEvent = {
      id: `e${Date.now()}`,
      type: "feedback",
      date: form.date,
      title: form.title,
      description: form.description || undefined,
    };
    setTimeline((prev) => [newEvent, ...prev].sort((a, b) => b.date.localeCompare(a.date)));
    setOpen(false);
    setForm({ title: "", description: "", date: new Date().toISOString().split("T")[0] });
    toast.success("Feedback adicionado à timeline!");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Linha do Tempo de Evolução</CardTitle>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo Feedback
        </Button>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-6">
            {timeline.map((event) => {
              const Icon = iconMap[event.type];
              return (
                <div key={event.id} className="relative flex gap-4 pl-10">
                  {/* Dot */}
                  <div className="absolute left-2 top-1 flex items-center justify-center w-5 h-5 rounded-full bg-background border-2 border-border">
                    <Icon className={`h-3 w-3 ${colorMap[event.type]}`} />
                  </div>

                  <div className="flex-1 border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{labelMap[event.type]}</Badge>
                        <span className="font-medium text-sm">{event.title}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.date).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    )}
                    {event.beltName && (
                      <BeltDisplay beltName={event.beltName} degree={event.beltDegree || 0} size="sm" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>

      {/* Add feedback dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Feedback</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Ex: Avaliação Trimestral" />
            </div>
            <div className="space-y-2">
              <Label>Data</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Observações sobre o aluno..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddFeedback}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
