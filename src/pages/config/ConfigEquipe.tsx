import { useEffect, useState } from "react";
import { usePageTitle } from "@/hooks/use-page-title";
import { useUsers } from "@/hooks/use-users";
import { useStudents } from "@/hooks/use-students";
import type { User } from "@/types";

type TeamMember = User & {
  phone?: string;
  beltName?: string;
  beltDegree?: number;
  specialties: string[];
  classes: string[];
  startDate?: string;
  status: "ativo" | "inativo";
};
import { BeltDisplay } from "@/components/alunos/belt-display";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search, Plus, MoreHorizontal, Pencil, Trash2, ArrowUpCircle, ChevronLeft, ChevronRight,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const PAGE_SIZE = 10;

export default function ConfigEquipePage() {
  const { setTitle } = usePageTitle();
  useEffect(() => { setTitle("Configurações · Equipe Técnica"); }, [setTitle]);

  const { data: fetchedUsers = [] } = useUsers("instrutor,monitor");
  const { data: fetchedStudents = [] } = useStudents();
  const [localMembers, setLocalMembers] = useState<TeamMember[]>([]);
  const members: TeamMember[] = localMembers.length > 0
    ? localMembers
    : fetchedUsers.map(u => ({ ...u, specialties: [], classes: [], status: "ativo" as const }));
  const setMembers = (fn: (prev: TeamMember[]) => TeamMember[]) => {
    setLocalMembers(fn(members));
  };
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addType, setAddType] = useState<"monitor" | "instrutor">("monitor");

  // Monitor form (promote student)
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [monitorPhone, setMonitorPhone] = useState("");
  const [monitorEmail, setMonitorEmail] = useState("");

  // Instructor form (fresh registration)
  const [instrName, setInstrName] = useState("");
  const [instrEmail, setInstrEmail] = useState("");
  const [instrPhone, setInstrPhone] = useState("");
  const [instrBelt, setInstrBelt] = useState("black_belt");
  const [instrDegree, setInstrDegree] = useState("1");
  const [instrSpecialties, setInstrSpecialties] = useState("");

  // Promote monitor to instructor
  const [promoteDialogOpen, setPromoteDialogOpen] = useState(false);
  const [promoteTarget, setPromoteTarget] = useState<TeamMember | null>(null);

  const eligibleStudents = fetchedStudents.filter(
    (s) =>
      s.status === "ativo" &&
      !members.some((m) => m.name === s.name)
  );

  // Filtering & pagination
  const filtered = members.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || m.role === roleFilter;
    const matchStatus = statusFilter === "all" || m.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetMonitorForm = () => {
    setSelectedStudentId("");
    setMonitorPhone("");
    setMonitorEmail("");
    
  };

  const resetInstructorForm = () => {
    setInstrName("");
    setInstrEmail("");
    setInstrPhone("");
    setInstrBelt("black_belt");
    setInstrDegree("1");
    setInstrSpecialties("");
  };

  const handleAddMonitor = () => {
    const student = fetchedStudents.find((s) => s.id === selectedStudentId);
    if (!student) return;
    const newMember: TeamMember = {
      id: `tm${Date.now()}`,
      name: student.name,
      email: monitorEmail,
      phone: monitorPhone || student.phone || "",
      role: "monitor",
      beltName: student.beltName,
      beltDegree: student.beltDegree,
      specialties: [],
      classes: [],
      startDate: new Date().toISOString().split("T")[0],
      status: "ativo",
    };
    setMembers((prev) => [...prev, newMember]);
    toast({ title: "Monitor adicionado", description: `${student.name} foi promovido a Monitor.` });
    resetMonitorForm();
    setAddDialogOpen(false);
  };

  const handleAddInstructor = () => {
    if (!instrName.trim()) return;
    const newMember: TeamMember = {
      id: `tm${Date.now()}`,
      name: instrName,
      email: instrEmail,
      phone: instrPhone,
      role: "instrutor",
      beltName: instrBelt,
      beltDegree: Number(instrDegree),
      specialties: instrSpecialties.split(",").map((s) => s.trim()).filter(Boolean),
      classes: [],
      startDate: new Date().toISOString().split("T")[0],
      status: "ativo",
    };
    setMembers((prev) => [...prev, newMember]);
    toast({ title: "Instrutor adicionado", description: `${instrName} foi cadastrado como Instrutor.` });
    resetInstructorForm();
    setAddDialogOpen(false);
  };

  const handlePromoteToInstructor = () => {
    if (!promoteTarget) return;
    setMembers((prev) =>
      prev.map((m) => (m.id === promoteTarget.id ? { ...m, role: "instrutor" as const } : m))
    );
    toast({ title: "Promoção realizada", description: `${promoteTarget.name} agora é Instrutor.` });
    setPromoteDialogOpen(false);
    setPromoteTarget(null);
  };

  const handleToggleStatus = (member: TeamMember) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === member.id ? { ...m, status: m.status === "ativo" ? "inativo" as const : "ativo" as const } : m
      )
    );
    toast({
      title: member.status === "ativo" ? "Membro desativado" : "Membro reativado",
      description: `${member.name} foi ${member.status === "ativo" ? "desativado" : "reativado"}.`,
    });
  };

  const handleRemove = (member: TeamMember) => {
    setMembers((prev) => prev.filter((m) => m.id !== member.id));
    toast({ title: "Membro removido", description: `${member.name} foi removido da equipe.` });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Função" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas funções</SelectItem>
            <SelectItem value="instrutor">Instrutor</SelectItem>
            <SelectItem value="monitor">Monitor</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="inativo">Inativo</SelectItem>
          </SelectContent>
        </Select>

        {/* Add new member */}
        <Dialog open={addDialogOpen} onOpenChange={(open) => { setAddDialogOpen(open); if (!open) { resetMonitorForm(); resetInstructorForm(); } }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Novo Membro</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Adicionar Membro à Equipe</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={addType} onValueChange={(v) => setAddType(v as "monitor" | "instrutor")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monitor">Monitor (promover aluno)</SelectItem>
                    <SelectItem value="instrutor">Instrutor (novo cadastro)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {addType === "monitor" ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Selecione um aluno ativo para promover a Monitor.
                  </p>
                  <div className="space-y-2">
                    <Label>Aluno</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between font-normal"
                        >
                          {selectedStudentId
                            ? (() => {
                                const s = fetchedStudents.find((s) => s.id === selectedStudentId);
                                return s ? s.name : "Selecione um aluno";
                              })()
                            : "Selecione um aluno"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Buscar aluno pelo nome..." />
                          <CommandList>
                            <CommandEmpty>Nenhum aluno encontrado.</CommandEmpty>
                            <CommandGroup>
                              {eligibleStudents.map((s) => (
                                <CommandItem
                                  key={s.id}
                                  value={s.name}
                                  onSelect={() => setSelectedStudentId(s.id)}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedStudentId === s.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {s.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={monitorEmail} onChange={(e) => setMonitorEmail(e.target.value)} placeholder="email@exemplo.com" />
                    </div>
                    <div className="space-y-2">
                      <Label>Telefone</Label>
                      <Input value={monitorPhone} onChange={(e) => setMonitorPhone(e.target.value)} placeholder="(00) 00000-0000" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddMonitor} disabled={!selectedStudentId}>Promover a Monitor</Button>
                  </DialogFooter>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Cadastro direto de um novo Instrutor (não precisa ser aluno).
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Nome completo</Label>
                      <Input value={instrName} onChange={(e) => setInstrName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={instrEmail} onChange={(e) => setInstrEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Telefone</Label>
                      <Input value={instrPhone} onChange={(e) => setInstrPhone(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Faixa</Label>
                      <Select value={instrBelt} onValueChange={setInstrBelt}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="black_belt">Preta</SelectItem>
                          <SelectItem value="brown_belt">Marrom</SelectItem>
                          <SelectItem value="purple_belt">Roxa</SelectItem>
                          <SelectItem value="blue_belt">Azul</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Grau</Label>
                      <Input type="number" min="0" max="6" value={instrDegree} onChange={(e) => setInstrDegree(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Especialidades</Label>
                      <Input value={instrSpecialties} onChange={(e) => setInstrSpecialties(e.target.value)} placeholder="Kids, Juvenil, Competição" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddInstructor} disabled={!instrName.trim()}>Cadastrar Instrutor</Button>
                  </DialogFooter>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* DataTable */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Faixa</TableHead>
              <TableHead className="hidden md:table-cell">Especialidades</TableHead>
              <TableHead className="hidden md:table-cell">Turmas</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Nenhum membro encontrado.
                </TableCell>
              </TableRow>
            )}
            {paginated.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.name}</TableCell>
                <TableCell>
                  <Badge variant={m.role === "instrutor" ? "default" : "secondary"}>
                    {m.role === "instrutor" ? "Instrutor" : "Monitor"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <BeltDisplay beltName={m.beltName} degree={m.beltDegree} size="sm" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {m.specialties.map((s) => (
                      <Badge key={s} variant="outline" className="text-xs font-normal">{s}</Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                  {m.classes.join(", ") || "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={m.status === "ativo" ? "outline" : "destructive"}>
                    {m.status === "ativo" ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {m.role === "monitor" && (
                        <DropdownMenuItem onClick={() => { setPromoteTarget(m); setPromoteDialogOpen(true); }}>
                          <ArrowUpCircle className="mr-2 h-4 w-4" />Promover a Instrutor
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleToggleStatus(m)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        {m.status === "ativo" ? "Desativar" : "Reativar"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRemove(m)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />Remover
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filtered.length} membro(s) encontrado(s)
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">{page} / {totalPages}</span>
            <Button variant="outline" size="icon" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Promote dialog */}
      <Dialog open={promoteDialogOpen} onOpenChange={setPromoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Promover a Instrutor</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja promover <strong>{promoteTarget?.name}</strong> de Monitor para Instrutor?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPromoteDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handlePromoteToInstructor}>Confirmar Promoção</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
