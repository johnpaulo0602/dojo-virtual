import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Calendar,
  School,
  Award,
  DollarSign,
  Heart,
  UserPlus,
  BookOpen,
  ClipboardCheck,
  Settings,
  Tag,
  TrendingUp,
  TrendingDown,
  BarChart3,
  UserCog,
  type LucideIcon,
} from "lucide-react";
import type { UserRole, QuickCreateAction } from "@/types";

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  roles: UserRole[];
  children?: NavItem[];
  badge?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navigationGroups: NavGroup[] = [
  {
    label: "Principal",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, roles: ["admin", "instrutor", "monitor", "aluno"] },
    ],
  },
  {
    label: "Gestão",
    items: [
      {
        title: "Alunos",
        url: "/alunos",
        icon: Users,
        roles: ["admin", "instrutor", "monitor"],
      },
      {
        title: "Turmas e Aulas",
        url: "/turmas",
        icon: Calendar,
        roles: ["admin", "instrutor", "monitor"],
        children: [
          { title: "Turmas", url: "/turmas", icon: Calendar, roles: ["admin", "instrutor", "monitor"] },
          { title: "Aulas", url: "/aulas", icon: BookOpen, roles: ["admin", "instrutor", "monitor"] },
          { title: "Presenças", url: "/presencas", icon: ClipboardCheck, roles: ["admin", "instrutor", "monitor"] },
        ],
      },
      {
        title: "Equipe Técnica",
        url: "/equipe-tecnica",
        icon: GraduationCap,
        roles: ["admin"],
      },
      {
        title: "Escolas",
        url: "/escolas",
        icon: School,
        roles: ["admin", "instrutor"],
      },
      {
        title: "Graduações",
        url: "/jiu-jitsu/faixas-graus",
        icon: Award,
        roles: ["admin"],
      },
    ],
  },
  {
    label: "Financeiro",
    items: [
      {
        title: "Finanças",
        url: "/financeiro",
        icon: DollarSign,
        roles: ["admin"],
        children: [
          { title: "Overview", url: "/financeiro", icon: BarChart3, roles: ["admin"] },
          { title: "Despesas", url: "/financeiro/despesas", icon: TrendingDown, roles: ["admin"] },
          { title: "Receitas", url: "/financeiro/receitas", icon: TrendingUp, roles: ["admin"] },
          { title: "Relatórios", url: "/financeiro/relatorios", icon: BarChart3, roles: ["admin"], badge: "Em breve" },
        ],
      },
      { title: "Doadores", url: "/financeiro/doadores", icon: Heart, roles: ["admin"] },
    ],
  },
  {
    label: "Configurações",
    items: [
      {
        title: "Configurações",
        url: "/configuracoes/escolas",
        icon: Settings,
        roles: ["admin"],
        children: [
          { title: "Projeto", url: "/configuracoes", icon: Settings, roles: ["admin"] },
          { title: "Escolas", url: "/configuracoes/escolas", icon: School, roles: ["admin"] },
          { title: "Turmas", url: "/configuracoes/turmas", icon: Calendar, roles: ["admin"] },
          { title: "Aulas", url: "/configuracoes/aulas", icon: BookOpen, roles: ["admin"] },
          { title: "Categorias", url: "/configuracoes/categorias", icon: Tag, roles: ["admin"] },
          { title: "Equipe Técnica", url: "/configuracoes/equipe", icon: GraduationCap, roles: ["admin"] },
          { title: "Usuários", url: "/configuracoes/usuarios", icon: UserCog, roles: ["admin"] },
        ],
      },
    ],
  },
  {
    label: "Meu Perfil",
    items: [
      { title: "Meu Perfil", url: "/meu-perfil", icon: Users, roles: ["aluno"] },
    ],
  },
];

export const quickCreateActions: Record<UserRole, QuickCreateAction[]> = {
  admin: [
    { id: "nova_receita", label: "Nova Receita", icon: "DollarSign", route: "/financeiro/receitas" },
    { id: "nova_despesa", label: "Nova Despesa", icon: "DollarSign", route: "/financeiro/despesas" },
    { id: "nova_doacao", label: "Nova Doação", icon: "Heart", route: "/financeiro/doadores" },
    { id: "novo_aluno", label: "Novo Aluno", icon: "UserPlus", route: "/alunos/novo" },
  ],
  instrutor: [
    { id: "novo_aluno", label: "Novo Aluno", icon: "UserPlus", route: "/alunos/novo" },
    { id: "nova_aula", label: "Nova Aula", icon: "Calendar", route: "/aulas" },
  ],
  monitor: [],
  aluno: [],
};

export const routePermissions: Record<string, UserRole[]> = {
  "/dashboard": ["admin", "instrutor", "monitor", "aluno"],
  "/alunos": ["admin", "instrutor", "monitor"],
  "/alunos/novo": ["admin", "instrutor"],
  "/turmas": ["admin", "instrutor", "monitor"],
  "/aulas": ["admin", "instrutor", "monitor"],
  "/presencas": ["admin", "instrutor", "monitor"],
  "/equipe-tecnica": ["admin"],
  "/escolas": ["admin", "instrutor"],
  "/jiu-jitsu/faixas-graus": ["admin"],
  "/financeiro": ["admin"],
  "/financeiro/despesas": ["admin"],
  "/financeiro/receitas": ["admin"],
  "/financeiro/relatorios": ["admin"],
  "/financeiro/doadores": ["admin"],
  "/configuracoes": ["admin"],
  "/configuracoes/escolas": ["admin"],
  "/configuracoes/turmas": ["admin"],
  "/configuracoes/aulas": ["admin"],
  "/configuracoes/categorias": ["admin"],
  "/configuracoes/equipe": ["admin"],
  "/configuracoes/usuarios": ["admin"],
  "/meu-perfil": ["aluno"],
};
