import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Field, FieldGroup, FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function PrimeiroAcessoPage() {
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não conferem.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/api/v1/auth/first-access", {
        email,
        cpf,
        newPassword,
        confirmPassword,
      });
      toast.success("Senha criada com sucesso! Faça login.");
      navigate("/login");
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      const msg = Array.isArray(detail)
        ? detail.map((d: any) => d.msg).join("; ")
        : detail || "Erro ao criar senha.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/30 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-4 self-center">
          <div className="flex size-14 items-center justify-center rounded-2xl overflow-hidden shadow-lg shadow-primary/10 ring-1 ring-border/50">
            <img src="/logo-2x.png" alt="Logo Dojo Virtual" className="size-full object-cover" />
          </div>
          <div className="flex flex-col items-center">
            <h1 className="text-xl font-black tracking-tight uppercase">Dojo Virtual</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 leading-none mt-1">Jiu-Jitsu</p>
          </div>
        </div>

        <Card className="rounded-2xl border-border/50 shadow-xl shadow-foreground/5 overflow-hidden">
          <CardHeader className="text-center bg-muted/20 border-b border-border/50 pb-6">
            <CardTitle className="text-xl font-bold tracking-tight">Primeiro Acesso</CardTitle>
            <CardDescription className="text-sm font-medium">
              Informe seus dados para criar sua senha de acesso
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit}>
              <FieldGroup className="gap-5">
                <Field>
                  <FieldLabel htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">E-mail</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    className="h-11 rounded-xl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="cpf" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">CPF</FieldLabel>
                  <Input
                    id="cpf"
                    type="text"
                    placeholder="000.000.000-00"
                    required
                    className="h-11 rounded-xl"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="new-password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Nova Senha</FieldLabel>
                  <Input
                    id="new-password"
                    type="password"
                    required
                    className="h-11 rounded-xl"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="confirm-password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Confirmar Senha</FieldLabel>
                  <Input
                    id="confirm-password"
                    type="password"
                    required
                    className="h-11 rounded-xl"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </Field>
                <Button type="submit" className="w-full h-11 rounded-xl font-bold mt-2" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Criar Senha"}
                </Button>
              </FieldGroup>
            </form>
            <div className="mt-8 text-center text-sm font-medium text-muted-foreground">
              Já tem senha?{" "}
              <Link to="/login" className="text-primary hover:underline hover:text-primary/80 transition-colors font-bold">
                Faça login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
