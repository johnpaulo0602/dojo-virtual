import { useEffect, useState } from "react";
import { usePageTitle } from "@/hooks/use-page-title";
import { useMyStudent, useUpdateMyProfile } from "@/hooks/use-students";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { BeltDisplay } from "@/components/alunos/belt-display";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function MeuPerfilPage() {
  const { setTitle } = usePageTitle();
  useEffect(() => { setTitle("Meu Perfil"); }, [setTitle]);

  const { data: student, isLoading } = useMyStudent();
  const updateProfile = useUpdateMyProfile();

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ phone: "", email: "" });

  const openEdit = () => {
    if (!student) return;
    setEditForm({ phone: student.phone || "", email: student.email || "" });
    setEditOpen(true);
  };

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync(editForm);
      toast.success("Dados atualizados com sucesso!");
      setEditOpen(false);
    } catch {
      toast.error("Erro ao atualizar dados.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center text-muted-foreground py-16">
        Perfil não encontrado.
      </div>
    );
  }

  const initials = student.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold">{student.name}</h2>
                <Badge variant="default">
                  {student.status === "ativo" ? "Ativo" : student.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Matrícula: {student.matricula}</p>
              <div className="mt-2">
                <BeltDisplay beltName={student.beltName} degree={student.beltDegree} size="sm" />
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={openEdit}>
              <Pencil className="mr-2 h-4 w-4" />Editar Dados
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="dados">
        <TabsList>
          <TabsTrigger value="dados">Dados Pessoais</TabsTrigger>
          <TabsTrigger value="evolucao">Evolução</TabsTrigger>
        </TabsList>

        <TabsContent value="dados" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Contato</CardTitle></CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <div><span className="text-muted-foreground">Email:</span> {student.email || "—"}</div>
              <div><span className="text-muted-foreground">Telefone:</span> {student.phone || "—"}</div>
            </CardContent>
          </Card>
          {student.address && (
            <Card>
              <CardHeader><CardTitle>Endereço</CardTitle></CardHeader>
              <CardContent className="text-sm">
                {student.address.street}, {student.address.number}
                {student.address.complement ? ` - ${student.address.complement}` : ""}
                <br />{student.address.neighborhood} — {student.address.city}/{student.address.state}
                <br />CEP: {student.address.cep}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="evolucao" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Graduações</CardTitle></CardHeader>
            <CardContent>
              {student.promotions && student.promotions.length > 0 ? (
                <div className="space-y-2">
                  {student.promotions.map((p) => (
                    <div key={p.id} className="flex items-center gap-2 text-sm">
                      <BeltDisplay beltName={p.newBelt} degree={p.newDegree} size="sm" />
                      <span className="text-muted-foreground">{p.date}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma graduação registrada.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Feedbacks</CardTitle></CardHeader>
            <CardContent>
              {student.feedbacks && student.feedbacks.length > 0 ? (
                <div className="space-y-3">
                  {student.feedbacks.map((f) => (
                    <div key={f.id} className="border-l-2 border-primary pl-3">
                      <p className="text-sm">{f.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">{f.date}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum feedback registrado.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar Dados Pessoais</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input value={editForm.phone} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={updateProfile.isPending}>
              {updateProfile.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
