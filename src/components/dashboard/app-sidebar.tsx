import { useLocation, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Plus,
  ChevronDown,
  LogOut,
  Settings,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { navigationGroups, quickCreateActions } from "@/config/navigation";
import { NavLink } from "@/components/NavLink";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { UserRole } from "@/types";
import { useState } from "react";
import { TransactionFormDialog } from "@/components/financeiro/transaction-form-dialog";
import { DonationFormDialog } from "@/components/financeiro/donation-form-dialog";
type TransactionType = "receita" | "despesa";

const roleLabels: Record<UserRole, string> = {
  admin: "Administrador",
  instrutor: "Instrutor",
  monitor: "Monitor",
  responsavel: "Responsável",
};

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();

  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<TransactionType>("receita");
  const [donationDialogOpen, setDonationDialogOpen] = useState(false);

  const quickActions = quickCreateActions[user.role];

  const handleQuickAction = (actionId: string, route?: string) => {
    if (actionId === "nova_receita") {
      setTransactionType("receita");
      setTransactionDialogOpen(true);
    } else if (actionId === "nova_despesa") {
      setTransactionType("despesa");
      setTransactionDialogOpen(true);
    } else if (actionId === "nova_doacao") {
      setDonationDialogOpen(true);
    } else if (route) {
      navigate(route);
    }
  };

  return (
    <>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border/50">
        <SidebarHeader className="border-b border-sidebar-border/50 py-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center gap-3 px-2 py-0.5">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-xl overflow-hidden shadow-sm">
                <img src="/logo.png" alt="Logo Dojo Virtual" className="size-full object-contain" />
              </div>
                {!collapsed && (
                  <div className="flex flex-col">
                    <span className="text-sm font-bold tracking-tight uppercase">Dojo Virtual</span>
                    <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 leading-none">Jiu-Jitsu</span>
                  </div>
                )}
              </div>
            </SidebarMenuItem>
          </SidebarMenu>

          {quickActions.length > 0 && !collapsed && (
            <SidebarMenu className="mt-4 px-2">
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2 h-9 rounded-xl border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5">
                      <Plus className="size-4" data-icon="inline-start" />
                      <span className="font-medium">Criar Novo</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48 rounded-xl">
                    {quickActions.map((action) => (
                      <DropdownMenuItem
                        key={action.id}
                        onClick={() => handleQuickAction(action.id, action.route)}
                        className="rounded-lg"
                      >
                        {action.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          )}
        </SidebarHeader>

        <SidebarContent className="py-2">
          {navigationGroups.map((group) => {
            const visibleItems = group.items.filter((item) =>
              item.roles.includes(user.role)
            );
            if (visibleItems.length === 0) return null;

            return (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 px-4 mb-1">
                  {group.label}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {visibleItems.map((item) => {
                      const visibleChildren = item.children?.filter((c) =>
                        c.roles.includes(user.role)
                      );

                      if (visibleChildren && visibleChildren.length > 0) {
                        const isGroupActive = visibleChildren.some(
                          (c) => location.pathname === c.url
                        );
                        return (
                          <Collapsible
                            key={item.title}
                            defaultOpen={isGroupActive}
                            className="group/collapsible"
                          >
                            <SidebarMenuItem>
                              <CollapsibleTrigger asChild>
                                <SidebarMenuButton className="h-10 px-4 hover:bg-sidebar-accent/50 rounded-lg group-data-[state=open]/collapsible:bg-sidebar-accent/30">
                                  <item.icon className="size-4 opacity-70 group-data-[state=open]/collapsible:opacity-100 group-data-[state=open]/collapsible:text-primary" />
                                  {!collapsed && <span className="font-medium text-[13px]">{item.title}</span>}
                                  {!collapsed && (
                                    <ChevronDown className="ml-auto size-3.5 transition-transform group-data-[state=open]/collapsible:rotate-180 opacity-50" />
                                  )}
                                </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                <SidebarMenuSub className="ml-4 border-l border-sidebar-border/50 pl-2">
                                  {visibleChildren.map((child) => (
                                    <SidebarMenuSubItem key={child.url}>
                                      <SidebarMenuSubButton asChild>
                                        <NavLink
                                          to={child.badge ? "#" : child.url}
                                          end
                                          className={`h-9 px-3 rounded-md hover:bg-sidebar-accent/50 ${child.badge ? "opacity-60 pointer-events-none" : ""}`}
                                          activeClassName="bg-sidebar-accent text-foreground font-bold"
                                          onClick={child.badge ? (e: React.MouseEvent) => e.preventDefault() : undefined}
                                        >
                                          <span className="flex items-center gap-2 text-[13px]">
                                            {child.title}
                                            {child.badge && <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-bold uppercase tracking-tighter">{child.badge}</Badge>}
                                          </span>
                                        </NavLink>
                                      </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>                                  ))}
                                </SidebarMenuSub>
                                </CollapsibleContent>
                                </SidebarMenuItem>
                                </Collapsible>
                                );
                                }

                                return (
                                  <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild className="h-10 px-4 hover:bg-sidebar-accent/50 rounded-lg relative overflow-hidden group">
                                      <NavLink
                                        to={item.url}
                                        end
                                        className="w-full flex items-center gap-3"
                                        activeClassName="bg-sidebar-accent text-foreground font-bold shadow-sm"
                                      >
                                        {({ isActive }) => (
                                          <>
                                            {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />}
                                            <item.icon className={cn("size-4 opacity-70 transition-colors", isActive && "opacity-100 text-primary")} />
                                            {!collapsed && <span className="text-[13px]">{item.title}</span>}
                                          </>
                                        )}
                                      </NavLink>
                                    </SidebarMenuButton>
                                  </SidebarMenuItem>
                                );
                                })}                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          })}
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border/50 p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="h-12 px-2 hover:bg-sidebar-accent/50 rounded-xl transition-all">
                    <Avatar className="size-8 border border-border/50">
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-black uppercase">
                        {(user.name || user.email).split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {!collapsed && (
                      <div className="flex flex-col items-start text-left ml-1">
                        <span className="text-sm font-bold tracking-tight">{user.name || user.email}</span>
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                          {roleLabels[user.role]}
                        </span>
                      </div>
                    )}
                    {!collapsed && <ChevronDown className="ml-auto size-3.5 opacity-50" />}
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="top" className="w-56 rounded-xl shadow-xl border-border/50">
                  <DropdownMenuLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground/50">Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/conta")} className="rounded-lg">
                    <UserIcon className="mr-2 size-4 opacity-70" /> Perfil
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="rounded-lg text-destructive focus:text-destructive focus:bg-destructive/10">
                    <LogOut className="mr-2 size-4" /> Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <TransactionFormDialog 
        open={transactionDialogOpen} 
        onOpenChange={setTransactionDialogOpen} 
        defaultType={transactionType} 
      />
      <DonationFormDialog 
        open={donationDialogOpen} 
        onOpenChange={setDonationDialogOpen} 
      />
    </>
  );
}
