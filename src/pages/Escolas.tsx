import { useEffect, useState } from "react";
import { usePageTitle } from "@/hooks/use-page-title";
import { useSchools } from "@/hooks/use-students";
import { useStudents } from "@/hooks/use-students";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, School, MapPin, Users } from "lucide-react";

export default function EscolasPage() {
  const { setTitle } = usePageTitle();
  useEffect(() => { setTitle("Escolas"); }, [setTitle]);

  const [search, setSearch] = useState("");
  const { data: schools = [], isLoading: schoolsLoading } = useSchools();
  const { data: students = [] } = useStudents();

  const schoolsWithCount = schools.map(school => ({
    ...school,
    studentCount: students.filter((s: { status?: string; schoolId?: string }) => (s as { status?: string; schoolId?: string }).schoolId === school.id && s.status === "ativo").length,
    totalStudents: students.filter((s: { schoolId?: string }) => (s as { schoolId?: string }).schoolId === school.id).length,
  }));

  const filtered = schoolsWithCount.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.address ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const totalSchools = schools.length;
  const totalStudentsInSchools = students.filter(s => s.status === "ativo").length;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <School className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalSchools}</p>
                <p className="text-sm text-muted-foreground">Escolas Parceiras</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/50">
                <Users className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStudentsInSchools}</p>
                <p className="text-sm text-muted-foreground">Alunos Ativos nas Escolas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar escola por nome ou endereço..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Escolas Parceiras</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead className="text-center">Alunos Ativos</TableHead>
                <TableHead className="text-center">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(school => (
                <TableRow key={school.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <School className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{school.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="text-sm">{school.address}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="default">{school.studentCount}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{school.totalStudents}</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                    Nenhuma escola encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
