
import {
  Home,
  Fuel,
  FileText,
  Truck,
  Users,
  CalendarDays,
  Wrench,
  ClipboardList,
  Building2,
  UserCheck,
  Settings,
  BarChart3,
  Package,
  Map
} from "lucide-react";

export const menuStructure = [
  {
    title: "Dashboard",
    items: [
      {
        name: "Dashboard Geral",
        href: "/dashboard",
        icon: Home,
        // Sem permissão requerida - todos podem acessar
      },
      {
        name: "Dashboard RH",
        href: "/dashboard-rh",
        icon: BarChart3,
        requiredPermission: "dashboard_rh_view"
      },
      {
        name: "Dashboard Máquinas",
        href: "/dashboard-maquinas",
        icon: Truck,
        requiredPermission: "dashboard_maquinas_view"
      },
      {
        name: "Dashboard CBUQ",
        href: "/dashboard-cbuq",
        icon: BarChart3,
        requiredPermission: "dashboard_cbuq_view"
      }
    ]
  },
  {
    title: "Gestão de RH",
    items: [
      {
        name: "Empresas",
        href: "/gestao-rh/empresas",
        icon: Building2,
        requiredPermission: "gestao_rh_empresas_view"
      },
      {
        name: "Departamentos",
        href: "/gestao-rh/departamentos",
        icon: Building2,
        requiredPermission: "gestao_rh_departamentos_view"
      },
      {
        name: "Centros de Custo",
        href: "/gestao-rh/centros-custo",
        icon: Package,
        requiredPermission: "gestao_rh_centros_custo_view"
      },
      {
        name: "Funções",
        href: "/gestao-rh/funcoes",
        icon: UserCheck,
        requiredPermission: "gestao_rh_funcoes_view"
      },
      {
        name: "Funcionários",
        href: "/gestao-rh/funcionarios",
        icon: Users,
        requiredPermission: "gestao_rh_funcionarios_view"
      },
      {
        name: "Equipes",
        href: "/gestao-rh/equipes",
        icon: Users,
        requiredPermission: "gestao_rh_equipes_view"
      }
    ]
  },
  {
    title: "Gestão de Máquinas",
    items: [
      {
        name: "Caminhões e Equipamentos",
        href: "/gestao-maquinas/caminhoes",
        icon: Truck,
        requiredPermission: "gestao_maquinas_caminhoes_view"
      },
      {
        name: "Usinas",
        href: "/gestao-maquinas/usinas",
        icon: Building2,
        requiredPermission: "gestao_maquinas_usinas_view"
      },
      {
        name: "Relatório de Medição",
        href: "/gestao-maquinas/relatorio-medicao",
        icon: BarChart3,
        requiredPermission: "gestao_maquinas_relatorio_medicao_view"
        
      }
      ,
      {
        name: "Relatório de Abastecimento",
        href: "/gestao-maquinas/abastecimento",
        icon: Fuel,
        requiredPermission: "gestao_maquinas_relatorio_medicao_view"
        
      }
    ]
  },
  {
    title: "Requisições",
    items: [
      {
        name: "Cadastro de Requisições",
        href: "/requisicoes/cadastro",
        icon: FileText,
        requiredPermission: "requisicoes_cadastro_view"
      },
      {
        name: "Programação de Entrega",
        href: "/programacao-entrega",
        icon: CalendarDays,
        requiredPermission: "requisicoes_programacao_entrega_view"
      },
      {
        name: "Registro de Aplicação",
        href: "/registro-aplicacao",
        icon: FileText,
        requiredPermission: "requisicoes_registro_aplicacao_view"
      },
      {
        name: "Registro de Cargas",
        href: "/requisicoes/registro-cargas",
        icon: Package,
        requiredPermission: "requisicoes_registro_cargas_view"
      },
      {
        name: "Apontamento de Equipe",
        href: "/requisicoes/apontamento-equipe",
        icon: Users,
        requiredPermission: "requisicoes_apontamento_equipe_view"
      },
      {
        name: "Apontamento de Caminhões",
        href: "/requisicoes/apontamento-caminhoes",
        icon: Truck,
        requiredPermission: "requisicoes_apontamento_caminhoes_view"
      },
      {
        name: "Chamados e OS",
        href: "/requisicoes/chamados-os",
        icon: Wrench,
        requiredPermission: "requisicoes_chamados_os_view"
      },
      {
        name: "Gestão de OS",
        href: "/requisicoes/gestao-os",
        icon: ClipboardList,
        requiredPermission: "requisicoes_gestao_os_view"
      },
      {
        name: "Relatório de Aplicação Diária",
        href: "/relatorio-aplicacao-diaria",
        icon: BarChart3,
        requiredPermission: "relatorio_aplicacao_view"
      }
    ]
  },
  {
    title: "Administração",
    items: [
      {
        name: "Gestão de Permissões",
        href: "/admin/permissoes",
        icon: Settings,
        requiredPermission: "admin_permissoes_view"
      }
    ]
  }
];
