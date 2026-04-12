import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BeltDisplay } from "@/components/alunos/belt-display";
import { Award, MessageSquare, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usePromotions, useCreatePromotion } from "@/hooks/use-promotions";
import { useFeedbacks, useCreateFeedback } from "@/hooks/use-feedbacks";
import { belts } from "@/config/belts";

interface Props {
  studentId: string;
  currentBelt?: string;
  currentDegree?: number;
  promotedByName?: string;
}

export function TabEvolucao({ studentId, currentBelt = "branca", currentDegree = 0, promotedByName = "" }: Props) {
  const { data: promotions = [], isLoading: loadingPromotions } = usePromotions(studentId);
  const { data: feedbacks = [], isLoading: loadingFeedbacks } = useFeedbacks(studentId);
  const createPromotion = useCreatePromotion();
  const createFeedback = useCreateFeedback();

  // Promotion dialog
  const [gradOpen, setGradOpen] = useState(false);
  const [gradForm, setGradForm] = useState({
    beltName: "",
    beltDegree: 0,
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  // Feedback dialog
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    text: "",
    date: new Date().toISOString().split("T")[0],
  });

  const selectedBelt = belts.find((b) => b.name === gradForm.beltName);
  const degreeOptions = selectedBelt
    ? Array.from({ length: selectedBelt.degrees.quantity + 1 }, (_, i) => i)
    : [];

  const handleSaveGraduation = async () => {
    if (!gradForm.beltName) {
      toast.error("Selecione a faixa");
      return;
    }
    try {
      await createPromotion.mutateAsync({
        studentId,
        previousBelt: currentBelt,
        previousDegree: currentDegree,
        newBelt: gradForm.beltName,
        newDegree: gradForm.beltDegree,
        promotedBy: promotedByName,
        date: gradForm.date,
        notes: gradForm.notes || undefined,
      });
      toast.success("Graduação registrada!");
      setGradOpen(false);
      setGradForm({ beltName: "", beltDegree: 0, date: new Date().toISOString().split("T")[0], notes: "" });
    } catch {
      toast.error("Erro ao registrar graduação");
    }
  };

  const handleSaveFeedback = async () => {
    if (!feedbackForm.text.trim()) {
      toast.error("Informe o texto do feedback");
      return;
    }
    try {
      await createFeedback.mutateAsync({
        studentId,
        text: feedbackForm.text,
        date: feedbackForm.date,
      });
      toast.success("Feedback adicionado!");
      setFeedbackOpen(false);
      setFeedbackForm({ text: "", date: new Date().toISOString().split("T")[0] });
    } catch {
      toast.error("Erro ao registrar feedback");
    }
  };

  const isLoading = loadingPromotions || loadingFeedbacks;

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex gap-2 justify-end">
        <Button size="sm" variant="outline" onClick={() => setGradOpen(true)}>
          <Award className="mr-2 h-4 w-4" /> Registrar Graduação
        </Button>
        <Button size="sm" onClick={() => setFeedbackOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo Feedback
        </Button>
      </div>

      {/* Promotions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Histórico de Graduações</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : promotions.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">Nenhuma graduação registrada.</p>
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
              <div className="space-y-6">
                {promotions.map((p) => (
                  <div key={p.id} className="relative flex gap-4 pl-10">
                    <div className="absolute left-2 top-1 flex items-center justify-center w-5 h-5 rounded-full bg-background border-2 border-border">
                      <Award className="h-3 w-3 text-yellow-500" />
                    </div>
                    <div className="flex-1 border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">Graduação</Badge>
                          <span className="font-medium text-sm">
                            {belts.find((b) => b.name === p.newBelt)?.label ?? p.newBelt} — {p.newDegree}º grau
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(p.date).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      {p.notes && <p className="text-sm text-muted-foreground">{p.notes}</p>}
                      <BeltDisplay beltName={p.newBelt} degree={p.newDegree} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feedbacks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Feedbacks do Instrutor</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : feedbacks.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">Nenhum feedback registrado.</p>
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
              <div className="space-y-6">
                {feedbacks.map((f) => (
                  <div key={f.id} className="relative flex gap-4 pl-10">
                    <div className="absolute left-2 top-1 flex items-center justify-center w-5 h-5 rounded-full bg-background border-2 border-border">
                      <MessageSquare className="h-3 w-3 text-blue-500" />
                    </div>
                    <div className="flex-1 border rounded-lg p-4 space-y-1">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">Feedback</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(f.date).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      <p className="text-sm">{f.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Graduation Dialog */}
      <Dialog open={gradOpen} onOpenChange={setGradOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Registrar Graduação</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Faixa</Label>
              <Select
                value={gradForm.beltName}
                onValueChange={(v) => setGradForm((p) => ({ ...p, beltName: v, beltDegree: 0 }))}
              >
                <SelectTrigger><SelectValue placeholder="Selecione a faixa" /></SelectTrigger>
                <SelectContent>
                  {belts.map((b) => (
                    <SelectItem key={b.name} value={b.name}>{b.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {gradForm.beltName && (
              <div className="space-y-2">
                <Label>Grau</Label>
                <Select
                  value={String(gradForm.beltDegree)}
                  onValueChange={(v) => setGradForm((p) => ({ ...p, beltDegree: Number(v) }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {degreeOptions.map((d) => (
                      <SelectItem key={d} value={String(d)}>{d}º grau</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {gradForm.beltName && (
              <div className="flex items-center gap-2">
                <Label className="text-muted-foreground">Preview:</Label>
                <BeltDisplay beltName={gradForm.beltName} degree={gradForm.beltDegree} size="md" />
              </div>
            )}
            <div className="space-y-2">
              <Label>Data da Graduação</Label>
              <Input
                type="date"
                value={gradForm.date}
                onChange={(e) => setGradForm((p) => ({ ...p, date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                value={gradForm.notes}
                onChange={(e) => setGradForm((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Observações sobre a graduação..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGradOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveGraduation} disabled={createPromotion.isPending}>
              {createPromotion.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Registrar Graduação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Feedback</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                type="date"
                value={feedbackForm.date}
                onChange={(e) => setFeedbackForm((p) => ({ ...p, date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Feedback</Label>
              <Textarea
                value={feedbackForm.text}
                onChange={(e) => setFeedbackForm((p) => ({ ...p, text: e.target.value }))}
                placeholder="Observações sobre o aluno..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveFeedback} disabled={createFeedback.isPending}>
              {createFeedback.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
