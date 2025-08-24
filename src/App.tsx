import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import GlobalErrorBoundary from "@/components/error/GlobalErrorBoundary";

// Simple Auth Components
import SimpleAuthGuard from "@/components/routing/SimpleAuthGuard";
import SimplePermissionGuard from "@/components/routing/SimplePermissionGuard";

// Pages
import SimpleLogin from "@/pages/SimpleLogin";
import Dashboard from "@/pages/Dashboard";
import WaitingApproval from "@/pages/WaitingApproval";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";

// Gestão RH - using correct file names
import DashboardRH from "@/pages/DashboardRH";
import GestaoEmpresas from "@/pages/GestaoEmpresas";
import GestaoDepartamentos from "@/pages/GestaoDepartamentos";
import GestaoCentrosCusto from "@/pages/GestaoCentrosCusto";
import GestaoFuncoes from "@/pages/GestaoFuncoes";
import GestaoFuncionarios from "@/pages/GestaoFuncionarios";
import GestaoEquipes from "@/pages/GestaoEquipes";

// Gestão Máquinas - using correct file names
import DashboardMaquinas from "@/pages/DashboardMaquinas";
import GestaoCaminhoes from "@/pages/GestaoCaminhoes";
import GestaoUsinas from "@/pages/GestaoUsinas";
import RelatorioMedicao from "@/pages/RelatorioMedicao";
import Abastecimento from "@/pages/Abastecimento"; // Adicionado novo componente abastecimento

// Dashboard CBUQ
import DashboardRequisicoes from "@/pages/DashboardRequisicoes";

// Requisições - using correct file names
import GestaoRequisicoes from "@/pages/GestaoRequisicoes";
import ProgramacaoEntrega from "@/pages/ProgramacaoEntrega";
import RegistroCargas from "@/pages/RegistroCargas";
import RegistroAplicacao from "@/pages/RegistroAplicacao";
import ApontamentoEquipe from "@/pages/ApontamentoEquipe";
import ApontamentoCaminhoes from "@/pages/ApontamentoCaminhoes";
import ChamadosOS from "@/pages/ChamadosOS";
import GestaoOrdemServico from "@/pages/GestaoOrdemServico";
import RelatorioAplicacaoDiaria from "@/pages/RelatorioAplicacaoDiaria";

// Admin - using correct file names
import GestaoPermissoes from "@/pages/GestaoPermissoes";

// Security Components
import SecureRouteGuard from "@/components/routing/SecureRouteGuard";

// PWA Components
import { PWAUpdateNotification } from "@/components/pwa/PWAUpdateNotification";
import { PWAInstallBanner } from "@/components/pwa/PWAInstallBanner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <TooltipProvider>
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Rotas públicas */}
                <Route path="/login" element={<SimpleLogin />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/waiting-approval" element={<WaitingApproval />} />
                
                {/* Redirect root to dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                {/* Rotas protegidas - Dashboards */}
            <Route path="/dashboard" element={
              <SimpleAuthGuard>
                <SimplePermissionGuard>
                  <Dashboard />
                </SimplePermissionGuard>
              </SimpleAuthGuard>
            } />
            
            <Route path="/dashboard-rh" element={
              <SimpleAuthGuard>
                <SimplePermissionGuard>
                  <DashboardRH />
                </SimplePermissionGuard>
              </SimpleAuthGuard>
            } />
            
            <Route path="/dashboard-maquinas" element={
              <SimpleAuthGuard>
                <SimplePermissionGuard>
                  <DashboardMaquinas />
                </SimplePermissionGuard>
              </SimpleAuthGuard>
            } />
            
            <Route path="/dashboard-cbuq" element={
              <SimpleAuthGuard>
                <SimplePermissionGuard>
                  <DashboardRequisicoes />
                </SimplePermissionGuard>
              </SimpleAuthGuard>
            } />
            
            {/* Gestão RH */}
            <Route path="/gestao-rh/empresas" element={
              <SimpleAuthGuard>
                <SimplePermissionGuard>
                  <GestaoEmpresas />
                </SimplePermissionGuard>
              </SimpleAuthGuard>
            } />
            <Route path="/gestao-rh/departamentos" element={
              <SimpleAuthGuard>
                <SimplePermissionGuard>
                  <GestaoDepartamentos />
                </SimplePermissionGuard>
              </SimpleAuthGuard>
            } />
            <Route path="/gestao-rh/centros-custo" element={
              <SimpleAuthGuard>
                <SimplePermissionGuard>
                  <GestaoCentrosCusto />
                </SimplePermissionGuard>
              </SimpleAuthGuard>
            } />
            <Route path="/gestao-rh/funcoes" element={
              <SimpleAuthGuard>
                <SimplePermissionGuard>
                  <GestaoFuncoes />
                </SimplePermissionGuard>
              </SimpleAuthGuard>
            } />
            <Route path="/gestao-rh/funcionarios" element={
              <SimpleAuthGuard>
                <SimplePermissionGuard>
                  <GestaoFuncionarios />
                </SimplePermissionGuard>
              </SimpleAuthGuard>
            } />
            <Route path="/gestao-rh/equipes" element={
              <SimpleAuthGuard>
                <SimplePermissionGuard>
                  <GestaoEquipes />
                </SimplePermissionGuard>
              </SimpleAuthGuard>
            } />
            
            {/* Gestão Máquinas */}
            <Route path="/gestao-maquinas/caminhoes" element={
              <SimpleAuthGuard>
                <SimplePermissionGuard>
                  <GestaoCaminhoes />
                </SimplePermissionGuard>
              </SimpleAuthGuard>
            } />
            <Route path="/gestao-maquinas/usinas" element={
              <SimpleAuthGuard>
                <SimplePermissionGuard>
                  <GestaoUsinas />
                </SimplePermissionGuard>
              </SimpleAuthGuard>
            } />
            <Route path="/gestao-maquinas/relatorio-medicao" element={
              <SimpleAuthGuard>
                <SimplePermissionGuard>
                  <RelatorioMedicao />
                </SimplePermissionGuard>
              </SimpleAuthGuard>
            } />
            
            {/* NOVA ROTA ADICIONADA */}
            <Route path="/gestao-maquinas/abastecimento" element={
              <SimpleAuthGuard>
                <SimplePermissionGuard>
                  <SecureRouteGuard requiredPermission="gestao_maquinas_abastecimento_view">
                    <Abastecimento />
                  </SecureRouteGuard>
                </SimplePermissionGuard>
              </SimpleAuthGuard>
            } />
            
            {/* Requisições - Rota única de Programação de Entrega */}
            <Route path="/programacao-entrega" element={
              <SimpleAuthGuard>
                <SimplePermissionGuard>
                  <SecureRouteGuard requiredPermission="requisicoes_programacao_entrega_view">
                    <ProgramacaoEntrega />
                  </SecureRouteGuard>
                </SimplePermissionGuard>
              </SimpleAuthGuard>
            } />
            
            <Route path="/registro-aplicacao" element={
              <SimpleAuthGuard>
                <SimplePermissionGuard>
                  <SecureRouteGuard requiredPermission="requisicoes_registro_aplicacao_view">
                    <RegistroAplicacao />
                  </SecureRouteGuard>
                </SimplePermissionGuard>
              </SimpleAuthGuard>
            } />
            
            <Route path="/requisicoes/cadastro" element={
              <SimpleAuthGuard>
                <SimplePermissionGuard>
                  <GestaoRequisicoes />
                </SimplePermissionGuard>
              </SimpleAuthGuard>
            } />
            <Route path="/requisicoes/registro-cargas" element={
              <SimpleAuthGuard>
                <SimplePermissionGuard>
                  <RegistroCargas />
                </SimplePermissionGuard>
              </SimpleAuthGuard>
            } />
            <Route path="/requisicoes/apontamento-equipe" element={
              <SimpleAuthGuard>
                <SimplePermissionGuard>
                  <ApontamentoEquipe />
                </SimplePermissionGuard>
              </SimpleAuthGuard>
            } />
            <Route path="/requisicoes/apontamento-caminhoes" element={
              <SimpleAuthGuard>
                <SimplePermissionGuard>
                  <ApontamentoCaminhoes />
                </SimplePermissionGuard>
              </SimpleAuthGuard>
            } />
            <Route path="/requisicoes/chamados-os" element={
              <SimpleAuthGuard>
                <SimplePermissionGuard>
                  <ChamadosOS />
                </SimplePermissionGuard>
              </SimpleAuthGuard>
            } />
            <Route path="/requisicoes/gestao-os" element={
              <SimpleAuthGuard>
                <SimplePermissionGuard>
                  <GestaoOrdemServico />
                </SimplePermissionGuard>
              </SimpleAuthGuard>
            } />
            
            {/* Relatório de Aplicação Diária */}
            <Route path="/relatorio-aplicacao-diaria" element={
              <SimpleAuthGuard>
                <SimplePermissionGuard>
                  <SecureRouteGuard requiredPermission="relatorio_aplicacao_view">
                    <RelatorioAplicacaoDiaria />
                  </SecureRouteGuard>
                </SimplePermissionGuard>
              </SimpleAuthGuard>
            } />
            
            {/* Admin */}
            <Route path="/admin/permissoes" element={
              <SimpleAuthGuard>
                <SimplePermissionGuard>
                  <SecureRouteGuard requiredPermission="admin_permissoes_view">
                    <GestaoPermissoes />
                  </SecureRouteGuard>
                </SimplePermissionGuard>
              </SimpleAuthGuard>
            } />
              </Routes>
              <PWAUpdateNotification />
              <PWAInstallBanner />
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
};

export default App;