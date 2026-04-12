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
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { User, KeyRound, Bell } from "lucide-react";
import type { UserRole } from "@/types";
import { useUpdateProfile, useChangePassword } from "@/hooks/use-account";
import { usePreferences, useSavePreferences } from "@/hooks/use-preferences";

const roleLabels: Record<UserRole, string> = {
  admin: "Administrador",
  instrutor: "Instrutor",
  monitor: "Monitor",
  responsavel: "Responsável",
};

export default function ContaPage() {
  const { setTitle } = usePageTitle();
  useEffect(() => { setTitle("Minha Conta"); }, [setTitle]);

  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const { data: prefs } = usePreferences();
  const savePrefs = useSavePreferences();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [notifyNewStudent, setNotifyNewStudent] = useState(true);
  const [notifyAttendance, setNotifyAttendance] = useState(true);
  const [notifyFinancial, setNotifyFinancial] = useState(false);
  const [notifyBeltPromotion, setNotifyBeltPromotion] = useState(true);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone ?? "");
  }, [user]);

  // Sync notification toggles from server prefs
  useEffect(() => {
    if (!prefs) return;
    setNotifyNewStudent(prefs.notifyNewStudent);
    setNotifyAttendance(prefs.notifyAttendance);
    setNotifyFinancial(prefs.notifyFinancial);
    setNotifyBeltPromotion(prefs.notifyBeltPromotion);
  }, [prefs]);

  const initials = (user?.name ?? "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  const handleSaveProfile = async () => {
    try {
      await updateProfile.mutateAsync({ name, email, phone });
      toast({ title: "Perfil atualizado", description: "Seus dados foram salvos com sucesso." });
    } catch {
      toast({ title: "Erro ao salvar", description: "Não foi possível salvar o perfil.", variant: "destructive" });
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "Senhas não coincidem", description: "A nova senha e a confirmação devem ser iguais.", variant: "destructive" });
      return;
    }
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      toast({ title: "Senha alterada", description: "Sua senha foi atualizada." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast({ title: "Erro ao alterar senha", description: "Verifique a senha atual e tente novamente.", variant: "destructive" });
    }
  };

  const handleNotifyToggle = async (
    field: "notifyNewStudent" | "notifyAttendance" | "notifyFinancial" | "notifyBeltPromotion",
    value: boolean
  ) => {
    const currentPrefs = {
      notifyNewStudent,
      notifyAttendance,
      notifyFinancial,
      notifyBeltPromotion,
    };
    // Optimistically update local state
    switch (field) {
      case "notifyNewStudent": setNotifyNewStudent(value); break;
      case "notifyAttendance": setNotifyAttendance(value); break;
      case "notifyFinancial": setNotifyFinancial(value); break;
      case "notifyBeltPromotion": setNotifyBeltPromotion(value); break;
    }
    try {
      await savePrefs.mutateAsync({ ...currentPrefs, [field]: value });
    } catch {
      // Revert on failure
      switch (field) {
        case "notifyNewStudent": setNotifyNewStudent(currentPrefs.notifyNewStudent); break;
        case "notifyAttendance": setNotifyAttendance(currentPrefs.notifyAttendance); break;
        case "notifyFinancial": setNotifyFinancial(currentPrefs.notifyFinancial); break;
        case "notifyBeltPromotion": setNotifyBeltPromotion(currentPrefs.notifyBeltPromotion); break;
      }
      toast({ title: "Erro", description: "Não foi possível salvar a preferência.", variant: "destructive" });
    }
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
              <p className="text-lg font-semibold">{user?.name}</p>
              {user && <Badge variant="secondary">{roleLabels[user.role]}</Badge>}
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
            <Button onClick={handleSaveProfile} disabled={updateProfile.isPending}>
              {updateProfile.isPending ? "Salvando..." : "Salvar Perfil"}
            </Button>
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
              <Input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
              />
            </div>
            <div />
            <div className="space-y-2">
              <Label>Nova senha</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Confirmar nova senha</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={handleChangePassword}
              disabled={changePassword.isPending || !currentPassword || !newPassword || !confirmPassword}
            >
              {changePassword.isPending ? "Alterando..." : "Alterar Senha"}
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
            {
              label: "Novo aluno cadastrado",
              desc: "Receber notificação quando um novo aluno for matriculado",
              value: notifyNewStudent,
              field: "notifyNewStudent" as const,
            },
            {
              label: "Relatório de presença",
              desc: "Alerta diário de presença das aulas",
              value: notifyAttendance,
              field: "notifyAttendance" as const,
            },
            {
              label: "Movimentações financeiras",
              desc: "Alertas de receitas e despesas registradas",
              value: notifyFinancial,
              field: "notifyFinancial" as const,
            },
            {
              label: "Promoção de faixa",
              desc: "Notificar quando um aluno for graduado",
              value: notifyBeltPromotion,
              field: "notifyBeltPromotion" as const,
            },
          ].map((item) => (
            <div key={item.field} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch
                checked={item.value}
                onCheckedChange={(v) => handleNotifyToggle(item.field, v)}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
