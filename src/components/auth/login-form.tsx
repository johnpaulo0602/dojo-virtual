import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);
      
      const response = await api.post('/api/v1/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      const { accessToken, refreshToken } = response.data;
      await login(accessToken, refreshToken);
      
      toast.success("Login realizado com sucesso!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Erro ao fazer login. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="rounded-2xl border-border/50 shadow-xl shadow-foreground/5 overflow-hidden">
        <CardHeader className="text-center bg-muted/20 border-b border-border/50 pb-6">
          <CardTitle className="text-xl font-bold tracking-tight">Acesse sua conta</CardTitle>
          <CardDescription className="text-sm font-medium">
            Entre com suas credenciais para gerenciar o projeto
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <form onSubmit={handleLogin}>
            <FieldGroup className="gap-5">
              <Field>
                <FieldLabel htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">E-mail</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemplo@projeto.com"
                  required
                  className="h-11 rounded-xl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Senha</FieldLabel>
                  <a
                    href="#"
                    className="text-xs font-semibold text-primary hover:underline hover:text-primary/80 transition-colors"
                  >
                    Esqueceu a senha?
                  </a>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  className="h-11 rounded-xl"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
              <Button type="submit" className="w-full h-11 rounded-xl font-bold mt-2" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Entrar"}
              </Button>
            </FieldGroup>
          </form>
          <div className="mt-8 text-center text-sm font-medium text-muted-foreground">
            Ainda não tem conta?{" "}
            <Link to="/register" className="text-primary hover:underline hover:text-primary/80 transition-colors font-bold">
              Cadastre-se
            </Link>
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        Ao clicar em entrar, você concorda com nossos <a href="#">Termos de Serviço</a>{" "}
        e <a href="#">Política de Privacidade</a>.
      </div>
    </div>
  )
}
