import { useState } from "react";
import { Bell, Check, CheckCheck, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: "info" | "warning" | "success";
}

const initialNotifications: Notification[] = [
  {
    id: "1",
    title: "Nova matrícula",
    description: "João Silva foi matriculado na turma Infantil A.",
    time: "Há 5 minutos",
    read: false,
    type: "success",
  },
  {
    id: "2",
    title: "Pagamento pendente",
    description: "3 alunos com contribuição em atraso este mês.",
    time: "Há 1 hora",
    read: false,
    type: "warning",
  },
  {
    id: "3",
    title: "Graduação agendada",
    description: "Evento de graduação marcado para 20/03/2026.",
    time: "Há 3 horas",
    read: false,
    type: "info",
  },
  {
    id: "4",
    title: "Novo feedback registrado",
    description: "Professor Carlos adicionou feedback para Maria Souza.",
    time: "Ontem",
    read: true,
    type: "info",
  },
  {
    id: "5",
    title: "Aula cancelada",
    description: "Aula de Sábado 08/03 foi cancelada pelo instrutor.",
    time: "2 dias atrás",
    read: true,
    type: "warning",
  },
];

const typeIndicatorColor: Record<Notification["type"], string> = {
  info: "bg-blue-500",
  warning: "bg-amber-500",
  success: "bg-emerald-500",
};

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px] p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-sm font-semibold">Notificações</h3>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={markAllAsRead}>
                      <CheckCheck className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Marcar todas como lidas</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {notifications.length > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={clearAll}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Limpar todas</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
        <Separator />

        {/* Notifications list */}
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <Bell className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-sm">Nenhuma notificação</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[360px]">
            {notifications.map((notification, index) => (
              <div key={notification.id}>
                <div
                  className={cn(
                    "group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50",
                    !notification.read && "bg-muted/30"
                  )}
                >
                  {/* Type indicator */}
                  <div className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", typeIndicatorColor[notification.type])} />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm leading-tight", !notification.read && "font-semibold")}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {notification.description}
                    </p>
                    <p className="text-[11px] text-muted-foreground/70 mt-1">{notification.time}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {!notification.read && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="left">Marcar como lida</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left">Excluir</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                {index < notifications.length - 1 && <Separator />}
              </div>
            ))}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
