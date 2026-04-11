import { useEffect, useMemo, useState } from "react";
import { usePageTitle } from "@/hooks/use-page-title";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, Users, TrendingUp, Search, Plus } from "lucide-react";
import { useDonors } from "@/hooks/use-donors";
import { DonationFormDialog } from "@/components/financeiro/donation-form-dialog";

export default function DoacoesPage() {
  const { setTitle } = usePageTitle();
  useEffect(() => { setTitle("Doações"); }, [setTitle]);

  const { data: donors = [], isLoading } = useDonors();

  const [search, setSearch] = useState("");
  const [donationDialogOpen, setDonationDialogOpen] = useState(false);

  const totalDoadores = donors.length;
  const pfCount = donors.filter(d => d.type === "pessoa_fisica").length;
  const pjCount = donors.filter(d => d.type === "pessoa_juridica").length;

  const filtered = useMemo(() => {
    if (!search) return donors;
    return donors.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));
  }, [donors, search]);

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Carregando doações...</div>;

  return (
    <div className="space-y-6">
      {/* Action button */}
      <div className="flex justify-end">
        <Button onClick={() => setDonationDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Nova Doação
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Doadores</CardTitle>
            <Heart className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{totalDoadores}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pessoa Física</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{pfCount}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pessoa Jurídica</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{pjCount}</p></CardContent>
        </Card>
      </div>

      {/* Donors table */}
      <Card>
        <CardHeader>
          <CardTitle>Doadores</CardTitle>
          <div className="relative max-w-sm pt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 mt-1 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar doador..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doador</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Documento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(d => (
                <TableRow key={d.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">{d.name.split(" ").map(n=>n[0]).join("").slice(0,2)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{d.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{d.type === "pessoa_fisica" ? "Pessoa Física" : "Pessoa Jurídica"}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{d.email}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{d.phone}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{d.document}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhum doador encontrado</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <DonationFormDialog open={donationDialogOpen} onOpenChange={setDonationDialogOpen} />
    </div>
  );
}
