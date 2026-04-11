import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { PageTitleProvider } from "@/hooks/use-page-title";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Loader2 } from "lucide-react";

const NotFound = lazy(() => import("./pages/NotFound"));
const LoginPage = lazy(() => import("./pages/auth/Login"));
const RegisterPage = lazy(() => import("./pages/auth/Register"));
const DashboardPage = lazy(() => import("./pages/Dashboard"));
const AlunosPage = lazy(() => import("./pages/Alunos"));
const NovoAlunoPage = lazy(() => import("./pages/NovoAluno"));
const PerfilAlunoPage = lazy(() => import("./pages/PerfilAluno"));
const TurmasPage = lazy(() => import("./pages/Turmas"));
const AulasPage = lazy(() => import("./pages/Aulas"));
const PresencasPage = lazy(() => import("./pages/Presencas"));
const TurmaDetalhePage = lazy(() => import("./pages/TurmaDetalhe"));
const AulaDetalhePage = lazy(() => import("./pages/AulaDetalhe"));
const EquipeTecnicaPage = lazy(() => import("./pages/EquipeTecnica"));
const EscolasPage = lazy(() => import("./pages/Escolas"));
const FaixasGrausPage = lazy(() => import("./pages/FaixasGraus"));
const FinanceiroPage = lazy(() => import("./pages/Financeiro"));
const DespesasPage = lazy(() => import("./pages/financeiro/Despesas"));
const ReceitasPage = lazy(() => import("./pages/financeiro/Receitas"));
const RelatoriosPage = lazy(() => import("./pages/financeiro/Relatorios"));
const DoadoresPage = lazy(() => import("./pages/financeiro/Doadores"));
const DoadorDetalhePage = lazy(() => import("./pages/financeiro/DoadorDetalhe"));
const ConfiguracoesPage = lazy(() => import("./pages/Configuracoes"));
const MeusAlunosPage = lazy(() => import("./pages/MeusAlunos"));
const ContaPage = lazy(() => import("./pages/Conta"));
const ConfigEscolasPage = lazy(() => import("./pages/config/ConfigEscolas"));
const ConfigTurmasPage = lazy(() => import("./pages/config/ConfigTurmas"));
const ConfigAulasPage = lazy(() => import("./pages/config/ConfigAulas"));
const ConfigCategoriasPage = lazy(() => import("./pages/config/ConfigCategorias"));
const ConfigEquipePage = lazy(() => import("./pages/config/ConfigEquipe"));

const queryClient = new QueryClient();

const RouteFallback = () => <div className="min-h-[50vh] bg-background" aria-hidden="true" />;

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="h-screen w-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <PageTitleProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route
                    path="/*"
                    element={
                      <ProtectedRoute>
                        <DashboardLayout>
                          <Routes>
                            <Route path="dashboard" element={<DashboardPage />} />
                          <Route path="alunos" element={<AlunosPage />} />
                          <Route path="alunos/novo" element={<NovoAlunoPage />} />
                          <Route path="alunos/:id" element={<PerfilAlunoPage />} />
                          <Route path="turmas" element={<TurmasPage />} />
                          <Route path="turmas/:id" element={<TurmaDetalhePage />} />
                          <Route path="aulas" element={<AulasPage />} />
                          <Route path="aulas/:id" element={<AulaDetalhePage />} />
                          <Route path="presencas" element={<PresencasPage />} />
                          <Route path="equipe-tecnica" element={<EquipeTecnicaPage />} />
                          <Route path="escolas" element={<EscolasPage />} />
                          <Route path="jiu-jitsu/faixas-graus" element={<FaixasGrausPage />} />
                          <Route path="financeiro" element={<FinanceiroPage />} />
                          <Route path="financeiro/despesas" element={<DespesasPage />} />
                          <Route path="financeiro/receitas" element={<ReceitasPage />} />
                          <Route path="financeiro/relatorios" element={<RelatoriosPage />} />
                          <Route path="financeiro/doadores" element={<DoadoresPage />} />
                          <Route path="financeiro/doadores/:id" element={<DoadorDetalhePage />} />
                          <Route path="configuracoes" element={<ConfiguracoesPage />} />
                          <Route path="configuracoes/escolas" element={<ConfigEscolasPage />} />
                          <Route path="configuracoes/turmas" element={<ConfigTurmasPage />} />
                          <Route path="configuracoes/aulas" element={<ConfigAulasPage />} />
                          <Route path="configuracoes/categorias" element={<ConfigCategoriasPage />} />
                          <Route path="configuracoes/equipe" element={<ConfigEquipePage />} />
                          <Route path="meus-alunos" element={<MeusAlunosPage />} />
                          <Route path="conta" element={<ContaPage />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </DashboardLayout>
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </PageTitleProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
