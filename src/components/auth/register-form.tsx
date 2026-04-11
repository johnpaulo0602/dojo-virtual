import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
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
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.post('/api/v1/auth/register', {
        email,
        password,
        name,
        role: "admin"
      });
      
      toast.success("Conta criada com sucesso! Faça login para continuar.");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="rounded-2xl border-border/50 shadow-xl shadow-foreground/5 overflow-hidden">
        <CardHeader className="text-center bg-muted/20 border-b border-border/50 pb-6">
          <CardTitle className="text-xl font-bold tracking-tight">Crie sua conta</CardTitle>
          <CardDescription className="text-sm font-medium">
            Preencha os dados abaixo para começar
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <form onSubmit={handleRegister}>
            <FieldGroup className="gap-5">
              <Field>
                <FieldLabel htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Nome Completo</FieldLabel>
                <Input 
                  id="name" 
                  type="text" 
                  placeholder="Seu nome" 
                  required 
                  className="h-11 rounded-xl" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>
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
                <FieldLabel htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Senha</FieldLabel>
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
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Criar Conta"}
              </Button>
            </FieldGroup>
          </form>
          <div className="mt-8 text-center text-sm font-medium text-muted-foreground">
            Já tem uma conta?{" "}
            <Link to="/login" className="text-primary hover:underline hover:text-primary/80 transition-colors font-bold">
              Faça login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
