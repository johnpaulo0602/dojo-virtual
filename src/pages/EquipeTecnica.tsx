import { useEffect, useState } from "react";
import { usePageTitle } from "@/hooks/use-page-title";
import { useUsers } from "@/hooks/use-users";
import type { User } from "@/types";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Mail, GraduationCap, Shield } from "lucide-react";

export default function EquipeTecnicaPage() {
  const { setTitle } = usePageTitle();
  useEffect(() => { setTitle("Equipe Técnica"); }, [setTitle]);

  const { data: users = [], isLoading } = useUsers("instrutor,monitor");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const filtered = users.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || m.role === roleFilter;
    return matchSearch && matchRole;
  });

  const instrutores = users.filter(m => m.role === "instrutor").length;
  const monitores = users.filter(m => m.role === "monitor").length;

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Carregando equipe técnica...</div>;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{instrutores}</p>
                <p className="text-sm text-muted-foreground">Instrutores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/50">
                <Shield className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{monitores}</p>
                <p className="text-sm text-muted-foreground">Monitores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <GraduationCap className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{instrutores + monitores}</p>
                <p className="text-sm text-muted-foreground">Total da Equipe</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Função" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as funções</SelectItem>
            <SelectItem value="instrutor">Instrutor</SelectItem>
            <SelectItem value="monitor">Monitor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(member => (
          <TeamMemberCard key={member.id} member={member} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full flex items-center justify-center h-32">
            <p className="text-muted-foreground">Nenhum membro encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TeamMemberCard({ member }: { member: User }) {
  const initials = member.name.split(" ").map(n => n[0]).join("").slice(0, 2);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">{member.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={member.role === "instrutor" ? "default" : "secondary"} className="text-xs">
                {member.role === "instrutor" ? "Instrutor" : "Monitor"}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" />{member.email}</div>
        </div>
      </CardContent>
    </Card>
  );
}
