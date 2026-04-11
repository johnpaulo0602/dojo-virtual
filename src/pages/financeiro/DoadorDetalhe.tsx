import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/use-page-title";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft, Pencil, MessageCircle, Download, Heart, DollarSign, Calendar, Mail, Phone, MapPin, FileText,
} from "lucide-react";
import { useDonor, useUpdateDonor, useDeleteDonor } from "@/hooks/use-donors";
import { DonationFormDialog } from "@/components/financeiro/donation-form-dialog";

const methodLabel: Record<string, string> = { pix: "PIX", transferencia: "Transferência", dinheiro: "Dinheiro", cartao: "Cartão" };

export default function DoadorDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setTitle } = usePageTitle();

  const { data: donor, isLoading, isError } = useDonor(id);
  const updateDonor = useUpdateDonor();
  const deleteDonor = useDeleteDonor();

  useEffect(() => {
    setTitle(donor ? donor.name : isLoading ? "Carregando..." : "Doador não encontrado");
  }, [setTitle, donor, isLoading]);

  const [editOpen, setEditOpen] = useState(false);
  const [donationOpen, setDonationOpen] = useState(false);
  const [editData, setEditData] = useState({
    name: "", email: "", phone: "", whatsapp: "", document: "", address: "", notes: "",
  });

  useEffect(() => {
    if (donor) {
      setEditData({
        name: donor.name, email: donor.email, phone: donor.phone,
        whatsapp: donor.whatsapp ?? "", document: donor.document,
        address: donor.address ?? "", notes: donor.notes ?? "",
      });
    }
  }, [donor]);

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Carregando doador...</div>;

  if (!donor || isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-muted-foreground">Doador não encontrado</p>
        <Button variant="outline" onClick={() => navigate("/financeiro/doadores")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
      </div>
    );
  }

  const totalDonated = parseFloat(donor.totalDonated ?? "0");
  const donations = donor.donations ?? [];
  const avgDonation = totalDonated / Math.max(donations.length, 1);
  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handleSaveEdit = async () => {
    if (!id) return;
    try {
      await updateDonor.mutateAsync({ id, ...editData });
      toast({ title: "Dados atualizados", description: editData.name });
      setEditOpen(false);
    } catch {
      toast({ title: "Erro ao atualizar doador", variant: "destructive" });
    }
  };

  const handleWhatsApp = () => {
    const num = donor.whatsapp || donor.phone.replace(/\D/g, "");
    window.open(`https://wa.me/${num}`, "_blank");
  };

  const handleDownloadReport = () => {
    toast({ title: "Download iniciado", description: "Relatório de doações em PDF" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/financeiro/doadores")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3 flex-1">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {donor.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold">{donor.name}</h1>
            <Badge variant="outline">{donor.type === "pessoa_fisica" ? "Pessoa Física" : "Pessoa Jurídica"}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleWhatsApp} className="gap-2">
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </Button>
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="gap-2">
            <Pencil className="h-4 w-4" /> Editar
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Doado</CardTitle>
            <Heart className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-success">{fmt(totalDonated)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Nº de Doações</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{donations.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Média por Doação</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{fmt(avgDonation)}</p></CardContent>
        </Card>
      </div>

      {/* Info + Donations */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Contact Info */}
        <Card>
          <CardHeader><CardTitle className="text-base">Informações</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{donor.type === "pessoa_fisica" ? "CPF:" : "CNPJ:"}</span>
              <span className="font-medium">{donor.document}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{donor.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{donor.phone}</span>
            </div>
            {donor.address && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{donor.address}</span>
              </div>
            )}
            {donor.notes && (
              <>
                <Separator />
                <p className="text-muted-foreground">{donor.notes}</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Donations Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Histórico de Doações</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDownloadReport} className="gap-2">
                  <Download className="h-4 w-4" /> Relatório
                </Button>
                <Button size="sm" onClick={() => setDonationOpen(true)} className="gap-2">
                  <Heart className="h-4 w-4" /> Nova Doação
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donations.map(don => (
                  <TableRow key={don.id}>
                    <TableCell>{new Date(don.date).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>{don.description}</TableCell>
                    <TableCell><Badge variant="outline">{methodLabel[don.method] ?? don.method}</Badge></TableCell>
                    <TableCell className="text-right font-semibold text-success">{fmt(parseFloat(don.amount))}</TableCell>
                  </TableRow>
                ))}
                {donations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">Nenhuma doação registrada.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Editar Doador</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Nome</Label>
                <Input value={editData.name} onChange={e => setEditData(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>{donor.type === "pessoa_fisica" ? "CPF" : "CNPJ"}</Label>
                <Input value={editData.document} onChange={e => setEditData(p => ({ ...p, document: e.target.value }))} />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Email</Label>
                <Input type="email" value={editData.email} onChange={e => setEditData(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Telefone</Label>
                <Input value={editData.phone} onChange={e => setEditData(p => ({ ...p, phone: e.target.value }))} />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>WhatsApp</Label>
                <Input value={editData.whatsapp} onChange={e => setEditData(p => ({ ...p, whatsapp: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Endereço</Label>
                <Input value={editData.address} onChange={e => setEditData(p => ({ ...p, address: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Observações</Label>
              <Textarea value={editData.notes} onChange={e => setEditData(p => ({ ...p, notes: e.target.value }))} rows={2} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
              <Button onClick={handleSaveEdit} disabled={updateDonor.isPending}>
                {updateDonor.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DonationFormDialog open={donationOpen} onOpenChange={setDonationOpen} preselectedDonorId={id} />
    </div>
  );
}
