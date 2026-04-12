import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/use-page-title";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { UserPlus } from "lucide-react";
import { StudentFilters } from "@/components/alunos/student-filters";
import { StudentsTable } from "@/components/alunos/students-table";
import { useStudents } from "@/hooks/use-students";
import { useAuth } from "@/contexts/AuthContext";

export default function AlunosPage() {
  const { setTitle } = usePageTitle();
  const navigate = useNavigate();
  useEffect(() => { setTitle("Alunos"); }, [setTitle]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [belt, setBelt] = useState("all");
  
  const { data: students = [], isLoading } = useStudents();
  const { user } = useAuth();
  const canCreate = user?.role === "admin" || user?.role === "instrutor";

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.cpf.includes(search);
      const matchStatus = status === "all" || s.status === status;
      // Provide fallback for beltName if backend doesn't return it yet
      const matchBelt = belt === "all" || (s.beltName || 'white_belt') === belt;
      return matchSearch && matchStatus && matchBelt;
    });
  }, [students, search, status, belt]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink href="/">Dashboard</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>Alunos</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        {canCreate && (
          <Button onClick={() => navigate("/alunos/novo")}>
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Aluno
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <StudentFilters 
          search={search} onSearchChange={setSearch}
          status={status} onStatusChange={setStatus}
          belt={belt} onBeltChange={setBelt}
        />
        <StudentsTable students={filtered} isLoading={isLoading} />
      </div>
    </div>
  );
}
