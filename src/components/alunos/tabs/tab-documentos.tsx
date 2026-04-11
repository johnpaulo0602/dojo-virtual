import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Upload, Eye, Download, RefreshCw, CheckCircle2, AlertTriangle, FileText } from "lucide-react";
import { toast } from "sonner";

interface RequiredDoc {
  key: string;
  label: string;
}

interface UploadedDoc {
  key: string;
  fileName: string;
  uploadedAt: string;
}

const requiredDocs: RequiredDoc[] = [
  { key: "cpf", label: "CPF" },
  { key: "identidade", label: "Identidade (RG)" },
  { key: "comprovante_residencia", label: "Comprovante de Residência" },
  { key: "declaracao_matricula", label: "Declaração de Matrícula Escolar" },
];

export function TabDocumentos() {
  const [uploaded, setUploaded] = useState<UploadedDoc[]>([
    { key: "cpf", fileName: "cpf_lucas.pdf", uploadedAt: "2025-01-15" },
    { key: "identidade", fileName: "rg_lucas.pdf", uploadedAt: "2025-01-15" },
  ]);
  const [uploadModal, setUploadModal] = useState(false);
  const [selectedDocKey, setSelectedDocKey] = useState<string | null>(null);

  const missingCount = requiredDocs.filter((d) => !uploaded.find((u) => u.key === d.key)).length;

  const openUpload = (key: string) => {
    setSelectedDocKey(key);
    setUploadModal(true);
  };

  const handleUpload = () => {
    if (!selectedDocKey) return;
    const doc = requiredDocs.find((d) => d.key === selectedDocKey);
    const existing = uploaded.find((u) => u.key === selectedDocKey);
    if (existing) {
      setUploaded((prev) => prev.map((u) => u.key === selectedDocKey ? { ...u, fileName: `${selectedDocKey}_atualizado.pdf`, uploadedAt: new Date().toISOString().split("T")[0] } : u));
      toast.success(`${doc?.label} atualizado!`);
    } else {
      setUploaded((prev) => [...prev, { key: selectedDocKey, fileName: `${selectedDocKey}_aluno.pdf`, uploadedAt: new Date().toISOString().split("T")[0] }]);
      toast.success(`${doc?.label} enviado!`);
    }
    setUploadModal(false);
    setSelectedDocKey(null);
  };

  return (
    <div className="space-y-4">
      {missingCount > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />
            <p className="text-sm">
              <span className="font-medium">{missingCount} documento(s) pendente(s).</span>{" "}
              Envie os documentos obrigatórios para completar o cadastro do aluno.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Documentos Obrigatórios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {requiredDocs.map((doc) => {
              const file = uploaded.find((u) => u.key === doc.key);
              const isUploaded = !!file;

              return (
                <div key={doc.key} className={`flex items-center justify-between border rounded-lg p-3 ${isUploaded ? "border-green-500/30 bg-green-500/5" : "border-yellow-500/30 bg-yellow-500/5"}`}>
                  <div className="flex items-center gap-3">
                    {isUploaded ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{doc.label}</p>
                      {file ? (
                        <p className="text-xs text-muted-foreground">{file.fileName} · Enviado em {new Date(file.uploadedAt).toLocaleDateString("pt-BR")}</p>
                      ) : (
                        <p className="text-xs text-yellow-600">Documento pendente</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {isUploaded ? (
                      <>
                        <Button variant="ghost" size="icon" title="Visualizar"><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" title="Baixar"><Download className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" title="Alterar" onClick={() => openUpload(doc.key)}><RefreshCw className="h-4 w-4" /></Button>
                      </>
                    ) : (
                      <Button size="sm" onClick={() => openUpload(doc.key)}>
                        <Upload className="mr-2 h-4 w-4" /> Enviar
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upload modal */}
      <Dialog open={uploadModal} onOpenChange={setUploadModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDocKey && uploaded.find((u) => u.key === selectedDocKey) ? "Alterar" : "Enviar"}{" "}
              {requiredDocs.find((d) => d.key === selectedDocKey)?.label}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Arquivo</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Clique ou arraste o arquivo aqui</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, JPG ou PNG até 10MB</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadModal(false)}>Cancelar</Button>
            <Button onClick={handleUpload}>Enviar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
