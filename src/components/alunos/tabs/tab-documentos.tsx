import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Upload, Eye, Trash2, FileText, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useStudentDocuments, useCreateStudentDocument, useDeleteStudentDocument } from "@/hooks/use-student-documents";

const docTypeLabels: Record<string, string> = {
  boletim: "Boletim Escolar",
  comprovante: "Comprovante de Residência",
  cpf: "CPF",
  identidade: "Identidade (RG)",
  declaracao_matricula: "Declaração de Matrícula",
  outro: "Outro",
};

interface Props {
  studentId: string;
}

export function TabDocumentos({ studentId }: Props) {
  const { data: documents = [], isLoading } = useStudentDocuments(studentId);
  const createDoc = useCreateStudentDocument();
  const deleteDoc = useDeleteStudentDocument();

  const [uploadModal, setUploadModal] = useState(false);
  const [docForm, setDocForm] = useState({ type: "", fileUrl: "" });

  const handleUpload = async () => {
    if (!docForm.type || !docForm.fileUrl) {
      toast.error("Selecione o tipo e informe a URL do arquivo");
      return;
    }
    try {
      await createDoc.mutateAsync({
        studentId,
        type: docForm.type,
        fileUrl: docForm.fileUrl,
      });
      toast.success("Documento adicionado!");
      setUploadModal(false);
      setDocForm({ type: "", fileUrl: "" });
    } catch {
      toast.error("Erro ao adicionar documento");
    }
  };

  const handleDelete = async (docId: string) => {
    try {
      await deleteDoc.mutateAsync({ studentId, docId });
      toast.success("Documento removido");
    } catch {
      toast.error("Erro ao remover documento");
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Documentos</CardTitle>
          <Button size="sm" onClick={() => setUploadModal(true)}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar Documento
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <FileText className="h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground text-sm">Nenhum documento adicionado.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between border rounded-lg p-3"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{docTypeLabels[doc.type] ?? doc.type}</p>
                      <p className="text-xs text-muted-foreground">
                        Enviado em {new Date(doc.uploadedAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs mr-2">{doc.type}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Visualizar"
                      onClick={() => window.open(doc.fileUrl, "_blank")}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" title="Excluir">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover documento?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(doc.id)}>
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add document modal */}
      <Dialog open={uploadModal} onOpenChange={setUploadModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Documento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Tipo de Documento *</Label>
              <Select value={docForm.type} onValueChange={(v) => setDocForm((f) => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="boletim">Boletim Escolar</SelectItem>
                  <SelectItem value="comprovante">Comprovante de Residência</SelectItem>
                  <SelectItem value="cpf">CPF</SelectItem>
                  <SelectItem value="identidade">Identidade (RG)</SelectItem>
                  <SelectItem value="declaracao_matricula">Declaração de Matrícula</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>URL do Arquivo *</Label>
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input
                  placeholder="https://..."
                  value={docForm.fileUrl}
                  onChange={(e) => setDocForm((f) => ({ ...f, fileUrl: e.target.value }))}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Upload real de arquivos será suportado em breve. Por ora, informe a URL do documento.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadModal(false)}>Cancelar</Button>
            <Button onClick={handleUpload} disabled={createDoc.isPending}>
              {createDoc.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
