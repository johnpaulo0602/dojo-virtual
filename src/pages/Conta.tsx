import { useEffect, useState } from "react";
import { usePageTitle } from "@/hooks/use-page-title";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { User, KeyRound, ShieldCheck, Bell } from "lucide-react";
import type { UserRole } from "@/types";

const roleLabels: Record<UserRole, string> = {
  admin: "Administrador",
  instrutor: "Instrutor",
  monitor: "Monitor",
  responsavel: "Responsável",
};

export default function ContaPage() {
  const { setTitle } = usePageTitle();
  useEffect(() => { setTitle("Minha Conta"); }, [setTitle]);

  const { user, setRole } = useAuth();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState("(11) 99999-0000");

  const [notifyNewStudent, setNotifyNewStudent] = useState(true);
  const [notifyAttendance, setNotifyAttendance] = useState(true);
  const [notifyFinancial, setNotifyFinancial] = useState(false);
  const [notifyBeltPromotion, setNotifyBeltPromotion] = useState(true);

  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
  }, [user]);

  const initials = user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  const handleSave = () => {
    toast({ title: "Perfil atualizado", description: "Seus dados foram salvos com sucesso." });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle>Meu Perfil</CardTitle>
          </div>
          <CardDescription>Gerencie suas informações pessoais</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg bg-primary/10 text-primary">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">{user.name}</p>
              <Badge variant="secondary">{roleLabels[user.role]}</Badge>
            </div>
          </div>
          <Separator />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave}>Salvar Perfil</Button>
          </div>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            <CardTitle>Alterar Senha</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Senha atual</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div />
            <div className="space-y-2">
              <Label>Nova senha</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label>Confirmar nova senha</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => toast({ title: "Senha alterada", description: "Sua senha foi atualizada." })}>
              Alterar Senha
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle>Notificações</CardTitle>
          </div>
          <CardDescription>Configure quais notificações deseja receber</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Novo aluno cadastrado", desc: "Receber notificação quando um novo aluno for matriculado", value: notifyNewStudent, set: setNotifyNewStudent },
            { label: "Relatório de presença", desc: "Alerta diário de presença das aulas", value: notifyAttendance, set: setNotifyAttendance },
            { label: "Movimentações financeiras", desc: "Alertas de receitas e despesas registradas", value: notifyFinancial, set: setNotifyFinancial },
            { label: "Promoção de faixa", desc: "Notificar quando um aluno for graduado", value: notifyBeltPromotion, set: setNotifyBeltPromotion },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch checked={item.value} onCheckedChange={item.set} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Role Switcher (dev tool) */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <CardTitle>Trocar Perfil</CardTitle>
          </div>
          <CardDescription>Ferramenta de desenvolvimento — simular diferentes papéis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select value={user.role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="instrutor">Instrutor</SelectItem>
                <SelectItem value="monitor">Monitor</SelectItem>
                <SelectItem value="responsavel">Responsável</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">Troque para visualizar o sistema como outro perfil</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
