import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Upload, Eye, Download, Trash2, FileText, Pencil } from "lucide-react";
import { toast } from "sonner";
import type { StudentDetail } from "@/types";

interface ReportCard {
  id: string;
  month: string;
  monthLabel: string;
  year: number;
  belowAverage: boolean;
  fileName: string;
  uploadedAt: string;
}

const months = [
  { value: "01", label: "Janeiro" },
  { value: "02", label: "Fevereiro" },
  { value: "03", label: "Março" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Maio" },
  { value: "06", label: "Junho" },
  { value: "07", label: "Julho" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

interface Props {
  student: StudentDetail;
}

function calcIsMinor(birthDate?: string) {
  if (!birthDate) return true;
  const age = new Date().getFullYear() - new Date(birthDate).getFullYear();
  return age < 18;
}

export function TabEscolar({ student }: Props) {
  const schoolInfo = student.schoolInfo;
  const defaultIsStudent = schoolInfo?.isStudent ?? calcIsMinor(student.birthDate);
  const [isStudent, setIsStudent] = useState(defaultIsStudent);
  const [reports, setReports] = useState<ReportCard[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [belowAverage, setBelowAverage] = useState(false);

  // School info edit
  const [editSchool, setEditSchool] = useState(false);
  const [schoolForm, setSchoolForm] = useState({
    schoolName: "",
    schoolLevel: schoolInfo?.schoolLevel || "",
    schoolYear: schoolInfo?.schoolYear || "",
    schoolShift: schoolInfo?.schoolShift || "",
  });

  const handleUpload = () => {
    if (!selectedMonth) {
      toast.error("Selecione o mês de referência");
      return;
    }
    const ml = months.find((m) => m.value === selectedMonth);
    const newReport: ReportCard = {
      id: `r${Date.now()}`,
      month: selectedMonth,
      monthLabel: ml?.label || "",
      year: 2025,
      belowAverage,
      fileName: `boletim_${ml?.label.toLowerCase()}_2025.pdf`,
      uploadedAt: new Date().toISOString().split("T")[0],
    };
    setReports((prev) => [...prev, newReport]);
    setOpen(false);
    setSelectedMonth("");
    setBelowAverage(false);
    toast.success("Boletim enviado com sucesso!");
  };

  const handleDelete = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    toast.success("Boletim removido");
  };

  const openEditSchool = () => {
    setSchoolForm({
      schoolName: "",
      schoolLevel: schoolInfo?.schoolLevel || "",
      schoolYear: schoolInfo?.schoolYear || "",
      schoolShift: schoolInfo?.schoolShift || "",
    });
    setEditSchool(true);
  };

  const saveSchool = () => {
    toast.success("Informações escolares atualizadas!");
    setEditSchool(false);
  };

  return (
    <div className="space-y-4">
      {/* Is student toggle */}
      <Card>
        <CardContent className="pt-4 pb-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">É estudante?</p>
            <p className="text-xs text-muted-foreground">Ativa as informações escolares do aluno</p>
          </div>
          <Switch checked={isStudent} onCheckedChange={setIsStudent} />
        </CardContent>
      </Card>

      {/* School info — only shown when student */}
      {isStudent && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Informações Escolares</CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={openEditSchool}>
              <Pencil className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {schoolInfo?.schoolLevel && <div className="flex justify-between"><span className="text-muted-foreground">Nível</span><span>{schoolInfo.schoolLevel}</span></div>}
            {schoolInfo?.schoolYear && <div className="flex justify-between"><span className="text-muted-foreground">Ano/Série</span><span>{schoolInfo.schoolYear}</span></div>}
            {schoolInfo?.schoolShift && <div className="flex justify-between"><span className="text-muted-foreground">Turno</span><span>{schoolInfo.schoolShift}</span></div>}
            {!schoolInfo && <p className="text-muted-foreground">Sem informações escolares cadastradas.</p>}
          </CardContent>
        </Card>
      )}

      {/* Report cards — only shown when student */}
      {isStudent && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Boletins</CardTitle>
            <Button size="sm" onClick={() => setOpen(true)}>
              <Upload className="mr-2 h-4 w-4" /> Enviar Boletim
            </Button>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <p className="text-muted-foreground text-center py-6">Nenhum boletim enviado ainda.</p>
            ) : (
              <div className="space-y-3">
                {reports.map((r) => (
                  <div key={r.id} className="flex items-center justify-between border rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{r.monthLabel} / {r.year}</p>
                        <p className="text-xs text-muted-foreground">{r.fileName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={r.belowAverage ? "destructive" : "default"}>
                        {r.belowAverage ? "Abaixo da média" : "Acima da média"}
                      </Badge>
                      <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upload modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Boletim</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Arquivo</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Clique ou arraste o arquivo aqui</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, JPG ou PNG até 10MB</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Mês de Referência</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger><SelectValue placeholder="Selecione o mês" /></SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Abaixo da média estabelecida?</Label>
              <Switch checked={belowAverage} onCheckedChange={setBelowAverage} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleUpload}>Enviar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit school info modal */}
      <Dialog open={editSchool} onOpenChange={setEditSchool}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Informações Escolares</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Escola</Label>
              <Input value={schoolForm.schoolName} onChange={(e) => setSchoolForm((p) => ({ ...p, schoolName: e.target.value }))} placeholder="Nome da escola" />
            </div>
            <div className="space-y-2">
              <Label>Nível</Label>
              <Select value={schoolForm.schoolLevel} onValueChange={(v) => setSchoolForm((p) => ({ ...p, schoolLevel: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fundamental I">Fundamental I</SelectItem>
                  <SelectItem value="Fundamental II">Fundamental II</SelectItem>
                  <SelectItem value="Ensino Médio">Ensino Médio</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ano/Série</Label>
              <Input value={schoolForm.schoolYear} onChange={(e) => setSchoolForm((p) => ({ ...p, schoolYear: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Turno</Label>
              <Select value={schoolForm.schoolShift} onValueChange={(v) => setSchoolForm((p) => ({ ...p, schoolShift: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Manhã">Manhã</SelectItem>
                  <SelectItem value="Tarde">Tarde</SelectItem>
                  <SelectItem value="Noite">Noite</SelectItem>
                  <SelectItem value="Integral">Integral</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSchool(false)}>Cancelar</Button>
            <Button onClick={saveSchool}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
