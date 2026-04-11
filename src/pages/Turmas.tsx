import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/use-page-title";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Plus } from "lucide-react";
import { ClassGroupsTable } from "@/components/turmas/class-groups-table";
import { useClassGroups } from "@/hooks/use-classes";

export default function TurmasPage() {
  const { setTitle } = usePageTitle();
  const navigate = useNavigate();
  useEffect(() => { setTitle("Turmas"); }, [setTitle]);
  
  const { data: classGroups = [], isLoading } = useClassGroups();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink href="/">Dashboard</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>Turmas</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button onClick={() => navigate("/turmas/nova")}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Turma
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <ClassGroupsTable classGroups={classGroups} isLoading={isLoading} />
      </div>
    </div>
  );
}
