import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Users } from "lucide-react";
import type { ClassGroup } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

interface ClassGroupsTableProps {
  classGroups: ClassGroup[];
  isLoading?: boolean;
}

const dayMap = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export function ClassGroupsTable({ classGroups, isLoading }: ClassGroupsTableProps) {
  const navigate = useNavigate();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Turma</TableHead>
            <TableHead>Instrutor</TableHead>
            <TableHead>Horários</TableHead>
            <TableHead>Vagas</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-[150px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                <TableCell><Skeleton className="h-8 w-[180px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                <TableCell><Skeleton className="h-5 w-[60px] rounded-full" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-md ml-auto" /></TableCell>
              </TableRow>
            ))
          ) : classGroups.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">Nenhuma turma encontrada.</TableCell>
            </TableRow>
          ) : (
            classGroups.map((cg) => (
              <TableRow key={cg.id}>
                <TableCell className="font-medium">{cg.name}</TableCell>
                <TableCell>{cg.instructorName || cg.instructorId}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {(cg.schedules || cg.schedule || []).map((s: any, i: number) => (
                      <Badge key={i} variant="secondary" className="font-normal text-xs">
                        {dayMap[s.dayOfWeek ?? s.day_of_week]}: {s.startTime || s.start_time} - {s.endTime || s.end_time}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{cg.enrolledCount || 0}/{cg.capacity}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={cg.status === "ativa" ? "default" : "secondary"}>
                    {cg.status === "ativa" ? "Ativa" : "Inativa"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Abrir menu</span><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/turmas/${cg.id}`)}><Eye className="mr-2 h-4 w-4" />Ver detalhes</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
