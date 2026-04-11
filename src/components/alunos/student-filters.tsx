import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldGroup } from "@/components/ui/field";
import { Search } from "lucide-react";
import { belts } from "@/config/belts";

interface StudentFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  belt: string;
  onBeltChange: (v: string) => void;
}

export function StudentFilters({ search, onSearchChange, status, onStatusChange, belt, onBeltChange }: StudentFiltersProps) {
  return (
    <FieldGroup className="flex-row items-end gap-3">
      <Field className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou CPF..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-10 rounded-xl"
          />
        </div>
      </Field>
      
      <Field className="w-full sm:w-[160px]">
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="h-10 rounded-xl">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="inativo">Inativo</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <Field className="w-full sm:w-[180px]">
        <Select value={belt} onValueChange={onBeltChange}>
          <SelectTrigger className="h-10 rounded-xl">
            <SelectValue placeholder="Faixa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as faixas</SelectItem>
            {belts.map((b) => (
              <SelectItem key={b.name} value={b.name}>{b.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </FieldGroup>
  );
}
