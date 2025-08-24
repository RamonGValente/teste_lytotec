import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Bell,
  Maximize,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Menu,
  ChevronRight,
  ChevronDown as ChevronDownIcon,
  Eye,
  Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import UserProfileModal from "@/components/user/UserProfileModal";
import UserImageUploadModal from "@/components/user/UserImageUploadModal";
import { PWAInstallButton } from "@/components/pwa/PWAInstallButton";
import { useIsMobile } from "@/hooks/use-mobile";
import { RealtimeChannel } from "@supabase/supabase-js";

// --- CONSTANTES ---
const operadorField: Record<string, string | null> = {
  bd_caminhoes_equipamentos: null,
  bd_registro_apontamento_cam_equipa: "operador_id",
  bd_chamados_os: "solicitante_id",
  bd_apontamento_equipe: "registrado_por",
  bd_requisicoes: "engenheiro_id",
  bd_registro_apontamento_aplicacao: "created_by",
  bd_registro_aplicacao_detalhes: "created_by",
};

const notificacoesPorUsuario: Record<string, string[]> = {
  SuperAdm: ["*"],
  AdmEquipamentos: [
    "bd_caminhoes_equipamentos",
    "bd_registro_apontamento_cam_equipa",
    "bd_equipes",
    "bd_usinas",
    "bd_relatorio_medicao",
  ],
  AdmLogistica: [
    "bd_registro_apontamento_cam_equipa",
    "bd_chamados_os",
    "bd_lista_programacao_entrega",
    "bd_registro_apontamento_aplicacao",
    "bd_registro_cargas",
    "bd_apontamento_equipe",
    "bd_requisicoes",
  ],
  AdmRequisicoes: [
    "bd_requisicoes",
    "bd_lista_programacao_entrega",
    "bd_registro_apontamento_aplicacao",
    "bd_registro_cargas",
  ],
  AdmRH: [
    "bd_centros_custo",
    "bd_departamentos",
    "bd_empresas",
    "bd_equipes",
    "bd_funcionarios",
    "bd_funcoes",
  ],
  Apontador: [
    "bd_registro_apontamento_cam_equipa",
    "bd_apontamento_equipe",
    "bd_lista_programacao_entrega",
    "bd_registro_apontamento_aplicacao",
  ],
  Encarregado: [
    "bd_equipes",
    "bd_relatorio_medicao",
    "bd_apontamento_equipe",
    "bd_lista_programacao_entrega",
    "bd_registro_apontamento_aplicacao",
  ],
  EngenheiroCivil: [
    "bd_requisicoes",
    "bd_lista_programacao_entrega",
    "bd_registro_apontamento_aplicacao",
    "bd_registro_cargas",
  ],
  MestreObra: [
    "bd_equipes",
    "bd_registro_apontamento_cam_equipa",
    "bd_apontamento_equipe",
    "bd_lista_programacao_entrega",
    "bd_registro_apontamento_aplicacao",
    "bd_registro_cargas",
  ],
  Operador: [
    "bd_registro_apontamento_cam_equipa",
  ],
};

const descricaoTabela: Record<string, string> = {
  bd_funcionarios: "Funcionários",
  bd_caminhoes_equipamentos: "Caminhões/Equipamentos",
  bd_registro_apontamento_cam_equipa: "Apontamento de Caminhões",
  bd_requisicoes: "Requisições",
  bd_equipes: "Equipes",
  bd_lista_programacao_entrega: "Programação de Entrega",
  bd_registro_apontamento_aplicacao: "Registro de Aplicação",
  bd_registro_cargas: "Registro de Cargas",
  bd_chamados_os: "Chamado OS",
  bd_departamentos: "Departamentos",
  bd_empresas: "Empresas",
  bd_apontamento_equipe: "Apontamento de Equipe",
  bd_usinas: "Usinas",
  bd_funcoes: "Funções",
  bd_relatorio_medicao: "Relatório de Medição",
};

interface AppHeaderProps {
  user: any;
  updateUserImage: (file: File) => Promise<string>;
}

interface OnlineUser {
  id: string;
  nome_completo: string;
  imagem_url?: string;
  presence_ref: string;
  current_page?: string;
  timestamp?: number; // Propriedade timestamp
}

const AppHeader: React.FC<AppHeaderProps> = ({
  user,
  updateUserImage,
}) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isImageUploadModalOpen, setIsImageUploadModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificacoes, setNotificacoes] = useState<any[]>([]);
  const [loadingNotificacoes, setLoadingNotificacoes] = useState(true);
  const [grupoAberto, setGrupoAberto] = useState<Record<string, boolean>>({});
  const [detalheAberto, setDetalheAberto] = useState<{ id: string, tabela: string } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [isLoadingOnline, setIsLoadingOnline] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const displayUser = user || {
    nome_completo: "Usuário",
    email: "usuario@email.com",
    funcoes: [],
  };

  const userKey = displayUser.email || "default";
  const [notificacoesLidas, setNotificacoesLidas] = useState<string[]>([]);

  useEffect(() => {
    const lidas = localStorage.getItem(`notificacoes_lidas_${userKey}`);
    setNotificacoesLidas(lidas ? JSON.parse(lidas) : []);
  }, [userKey]);

  // Lógica para buscar e ouvir usuários online em tempo real
  useEffect(() => {
    if (!user) return;
    
    const channel: RealtimeChannel = supabase.channel('online_users');

    const formatPageName = (pathname: string) => {
      if (pathname === "/") return "Início";
      if (pathname.includes("/dashboard")) return "Dashboard";
      if (pathname.includes("/apontamento-caminhoes")) return "Apontamento Caminhões";
      if (pathname.includes("/chamados-os")) return "Chamados OS";
      if (pathname.includes("/cadastro/")) {
        const parts = pathname.split('/');
        const lastPart = parts[parts.length - 1];
        if (!isNaN(Number(lastPart))) {
          return "Cadastro " + (parts[parts.length - 2] || '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
        return "Cadastro " + lastPart.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }
      const cleanPath = pathname.replace(/^\//, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      return cleanPath || "Página Desconhecida";
    };

    channel.on('presence', { event: 'sync' }, () => {
        const presences = channel.presenceState();
        const users: OnlineUser[] = Object.values(presences).flat() as any[];
        setOnlineUsers(users);
        setIsLoadingOnline(false);
    });

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        const currentPage = formatPageName(location.pathname);
        let currentSessionTimestamp = sessionStorage.getItem(`login_timestamp_${user.id}`);
        let timestampToTrack: number;

        if (currentSessionTimestamp) {
          // Se já existe um timestamp na sessionStorage, use-o
          timestampToTrack = parseInt(currentSessionTimestamp, 10);
        } else {
          // Se não existe, é o primeiro login da sessão, crie e armazene
          timestampToTrack = Date.now();
          sessionStorage.setItem(`login_timestamp_${user.id}`, timestampToTrack.toString());
        }

        channel.track({
          id: user.id,
          nome_completo: user.nome_completo,
          imagem_url: user.imagem_url,
          current_page: currentPage,
          timestamp: timestampToTrack, // Usa o timestamp inicial da sessão
        });
      }
    });

    return () => {
      // Quando o componente for desmontado (por exemplo, logout ou fechamento da aba),
      // o timestamp será automaticamente limpo pelo sessionStorage, mas apenas se a aba for fechada.
      // Para garantir que o usuário é removido da presença ao fazer logout, o signOut já cuida disso.
      supabase.removeChannel(channel);
    };
  }, [user, location.pathname]); // Mantenha location.pathname para atualizar a página atual

  useEffect(() => {
    async function buscarNotificacoes(tipoUsuario: string) {
      setLoadingNotificacoes(true);
      if (!tipoUsuario) {
        setNotificacoes([]);
        setLoadingNotificacoes(false);
        return;
      }
      const permissoes = notificacoesPorUsuario[tipoUsuario] || [];
      const tabelas =
        permissoes.includes("*") ? Object.keys(descricaoTabela) : permissoes;
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - 2);
      let notificacoesTotais: any[] = [];
      let operadoresParaBuscar = new Set<string>();

      for (const tabela of tabelas) {
        if (tabela === "bd_relatorio_medicao") continue;
        let campos = ["id", "updated_at", "created_at"];
        if (operadorField[tabela]) campos.push(operadorField[tabela]!);
        const { data, error } = await supabase
          .from(tabela)
          .select(campos.join(","))
          .or(
            `created_at.gte.${dateFrom.toISOString()},updated_at.gte.${dateFrom.toISOString()}`
          )
          .order("updated_at", { ascending: false });
        if (!error && data && data.length > 0) {
          data.forEach((registro: any) => {
            let operadorId = operadorField[tabela] ? registro[operadorField[tabela]!] : null;
            if (operadorId) operadoresParaBuscar.add(operadorId);
            notificacoesTotais.push({
              tabela,
              id: registro.id,
              data: registro.updated_at || registro.created_at,
              tipo: "alteracao_ou_novo",
              created_at: registro.created_at,
              updated_at: registro.updated_at,
              operadorId,
            });
          });
        }
      }

      let operadorMap: Record<string, string> = {};
      if (operadoresParaBuscar.size > 0) {
        const { data: operadores } = await supabase
          .from("bd_funcionarios")
          .select("id, nome_completo")
          .in("id", Array.from(operadoresParaBuscar));
        if (operadores) {
          operadorMap = operadores.reduce((acc: any, cur: any) => {
            acc[cur.id] = cur.nome_completo;
            return acc;
          }, {});
        }
      }

      notificacoesTotais = notificacoesTotais.map((noti) => ({
        ...noti,
        operador: noti.operadorId ? operadorMap[noti.operadorId] : null,
      }));
      notificacoesTotais.sort(
        (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
      );
      setNotificacoes(notificacoesTotais);
      setLoadingNotificacoes(false);
    }

    const tipoUsuario =
      displayUser.funcoes && displayUser.funcoes.length > 0
        ? displayUser.funcoes[0]
        : "Operador";
    buscarNotificacoes(tipoUsuario);
  }, [user, userKey]);

  function agruparPorTabela(notificacoes: any[]) {
    return notificacoes.reduce((groups: any, noti: any) => {
      const key = descricaoTabela[noti.tabela] || noti.tabela;
      if (!groups[key]) groups[key] = [];
      groups[key].push(noti);
      return groups;
    }, {});
  }

  const notificacoesNaoLidas = React.useMemo(() => {
    return notificacoes.filter(
      n => !notificacoesLidas.includes(`${n.tabela}_${n.id}`)
    );
  }, [notificacoes, notificacoesLidas]);

  function marcarComoLida(noti: any) {
    const key = `${noti.tabela}_${noti.id}`;
    const novasLidas = [...notificacoesLidas, key];
    setNotificacoesLidas(novasLidas);
    localStorage.setItem(
      `notificacoes_lidas_${userKey}`,
      JSON.stringify(novasLidas)
    );
  }

  function marcarTodasComoLidas() {
    const todas = notificacoesNaoLidas.map(noti => `${noti.tabela}_${noti.id}`);
    const novasLidas = [...notificacoesLidas, ...todas];
    setNotificacoesLidas(novasLidas);
    localStorage.setItem(
      `notificacoes_lidas_${userKey}`,
      JSON.stringify(novasLidas)
    );
  }

  const [confirmarMarcarTodas, setConfirmarMarcarTodas] = useState(false);

  function abrirCadastroCompleto(noti: any) {
    if (noti.tabela === "bd_registro_apontamento_cam_equipa") {
      navigate(`/apontamento-caminhoes/${noti.id}`);
    } else if (noti.tabela === "bd_chamados_os") {
      navigate(`/chamados-os/${noti.id}`);
    } else {
      window.open(
        `/cadastro/${noti.tabela.replace("bd_", "")}/${noti.id}`,
        "_blank"
      );
    }
  }
  
  const OnlineUsersDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Users className="h-4 w-4 sm:h-5 sm:w-5" />
          {onlineUsers.length > 0 && (
            <span className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-green-500 text-[8px] sm:text-[10px] font-medium flex items-center justify-center text-primary-foreground">
              {onlineUsers.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 sm:w-80">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <span className="font-medium text-sm">Funcionários Online</span>
        </div>
        <div className="max-h-60 sm:max-h-80 overflow-auto py-1">
          {isLoadingOnline && (
            <div className="p-3 text-sm text-muted-foreground">Carregando...</div>
          )}
          {!isLoadingOnline && onlineUsers.length === 0 && (
              <div className="p-3 text-sm text-muted-foreground">Nenhum usuário online.</div>
          )}
          {!isLoadingOnline && onlineUsers.map((onlineUser) => (
            <div key={onlineUser.presence_ref} className="p-2 flex flex-col items-start gap-1 hover:bg-muted/50">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  {onlineUser.imagem_url ? (
                    <AvatarImage src={onlineUser.imagem_url} />
                  ) : (
                    <>
                        <AvatarImage
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(onlineUser.nome_completo)}&background=random`}
                        />
                        <AvatarFallback>
                          {onlineUser.nome_completo?.[0] || 'U'}
                        </AvatarFallback>
                    </>
                  )}
                </Avatar>
                <span className="text-sm font-medium">{onlineUser.nome_completo}</span>
              </div>
              {onlineUser.current_page && (
                <div className="pl-11 text-xs text-blue-600">
                  Atualmente em: {onlineUser.current_page}
                </div>
              )}
              {/* Exibe a hora, minuto e segundo do timestamp inicial */}
              {onlineUser.timestamp && (
                <div className="pl-11 text-xs text-muted-foreground">
                  Online desde: {new Date(onlineUser.timestamp).toLocaleTimeString('pt-BR')}
                </div>
              )}
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const NotificationDropdown = () => {
    const tipoUsuario =
      displayUser.funcoes && displayUser.funcoes.length > 0
        ? displayUser.funcoes[0]
        : "Operador";
    const usarAgrupamento = tipoUsuario === "SuperAdm";
    const notificacoesAgrupadas = agruparPorTabela(notificacoesNaoLidas);
    const handlePointerDown = (e: any) => {
      e.preventDefault();
      e.stopPropagation();
    };

    function handleOpenChange(open: boolean) {
      setDropdownOpen(open);
      if (!open) setDetalheAberto(null);
      setConfirmarMarcarTodas(false);
    }

    return (
      <DropdownMenu open={dropdownOpen} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
            {notificacoesNaoLidas.length > 0 && (
              <span className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-primary text-[8px] sm:text-[10px] font-medium flex items-center justify-center text-primary-foreground">
                {notificacoesNaoLidas.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72 sm:w-80">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <span className="font-medium text-sm">Notificações</span>
            {notificacoesNaoLidas.length > 0 && (
              <Button
                variant="outline"
                size="xs"
                className="text-xs"
                onClick={() => setConfirmarMarcarTodas(true)}
              >
                Marcar todas como lidas
              </Button>
            )}
          </div>
          {confirmarMarcarTodas && (
            <div className="px-3 py-2 border-b bg-muted">
              <span className="text-xs font-medium block mb-2">
                Tem certeza que deseja marcar todas como lidas?
              </span>
              <div className="flex gap-2">
                <Button
                  size="xs"
                  variant="default"
                  onClick={() => {
                    marcarTodasComoLidas();
                    setConfirmarMarcarTodas(false);
                  }}
                >
                  Sim
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => setConfirmarMarcarTodas(false)}
                >
                  Não
                </Button>
              </div>
            </div>
          )}
          <div className="max-h-60 sm:max-h-80 overflow-auto py-1">
            {loadingNotificacoes && (
              <div className="p-3">Carregando notificações...</div>
            )}
            {!loadingNotificacoes && usarAgrupamento && Object.keys(notificacoesAgrupadas).length === 0 && (
              <div className="p-3 text-muted-foreground">
                Nenhuma notificação recente.
              </div>
            )}
            {!loadingNotificacoes && usarAgrupamento && Object.entries(notificacoesAgrupadas).map(([categoria, notis]) => (
              <div key={categoria}>
                <div
                  className="w-full flex justify-between items-center px-3 py-2 bg-muted hover:bg-primary/10 rounded mt-1 font-semibold text-sm cursor-pointer select-none"
                  tabIndex={0}
                  onClick={() => {
                    setGrupoAberto(prev => ({ ...prev, [categoria]: !prev[categoria] }));
                  }}
                  onPointerDown={handlePointerDown}
                >
                  <span>{categoria}</span>
                  <div className="flex items-center gap-2">
                    {notis.length > 0 && (
                      <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-primary text-primary-foreground">
                        {notis.length}
                      </span>
                    )}
                    <span>
                      {grupoAberto[categoria] ? (
                        <ChevronDownIcon className="inline w-4 h-4" />
                      ) : (
                        <ChevronRight className="inline w-4 h-4" />
                      )}
                    </span>
                  </div>
                </div>
                {grupoAberto[categoria] &&
                  notis.map((noti: any, idx: number) => (
                    <div
                      key={noti.id + noti.tabela + idx}
                      className="p-3 border-b border-muted last:border-b-0 flex flex-col bg-background hover:bg-muted transition cursor-pointer group"
                      style={{
                        background:
                          detalheAberto &&
                          detalheAberto.id === noti.id &&
                          detalheAberto.tabela === noti.tabela
                            ? "#f4f4f4"
                            : "transparent",
                      }}
                      tabIndex={0}
                      onClick={e => {
                        setDetalheAberto((detalheAberto &&
                          detalheAberto.id === noti.id &&
                          detalheAberto.tabela === noti.tabela)
                          ? null
                          : { id: noti.id, tabela: noti.tabela });
                      }}
                      onPointerDown={handlePointerDown}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="text-xs text-muted-foreground">
                          {new Date(noti.data).toLocaleString("pt-BR")}
                        </span>
                        <button
                          className="ml-2 text-muted-foreground hover:text-primary p-1"
                          title="Marcar como lida"
                          onClick={e => {
                            e.stopPropagation();
                            marcarComoLida(noti);
                          }}
                        >
                          <Eye size={17} />
                        </button>
                      </div>
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        Alteração ou novo registro em {categoria}
                        {noti.operador && (
                          <> por <b>{noti.operador}</b></>
                        )}
                      </span>
                      {detalheAberto &&
                        detalheAberto.id === noti.id &&
                        detalheAberto.tabela === noti.tabela && (
                          <div className="px-2 pb-2 pt-2 text-xs text-muted-foreground bg-muted rounded-b border-b border-muted -mt-2">
                            <div>
                              <b>ID:</b> {noti.id}
                            </div>
                            <div>
                              <b>Data:</b> {new Date(noti.data).toLocaleString("pt-BR")}
                            </div>
                            {noti.operador && (
                              <div>
                                <b>Operador:</b> {noti.operador}
                              </div>
                            )}
                          </div>
                        )}
                    </div>
                  ))}
              </div>
            ))}
            {!loadingNotificacoes && !usarAgrupamento && notificacoesNaoLidas.map((noti, idx) => (
              <div key={noti.id + noti.tabela + idx} className="p-3 flex flex-col cursor-pointer group" tabIndex={0} style={{ background: detalheAberto && detalheAberto.id === noti.id && detalheAberto.tabela === noti.tabela ? "#f4f4f4" : "transparent", }} onClick={() => setDetalheAberto((detalheAberto && detalheAberto.id === noti.id && detalheAberto.tabela === noti.tabela) ?
              null : { id: noti.id, tabela: noti.tabela }) } onPointerDown={handlePointerDown} >
                <div className="flex justify-between items-center w-full">
                  <span className="font-medium text-sm">
                    {descricaoTabela[noti.tabela] ||
                      noti.tabela.replace("bd_", "").toUpperCase()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(noti.data).toLocaleString("pt-BR")}
                  </span>
                  <button
                    className="ml-2 text-muted-foreground hover:text-primary p-1"
                    title="Marcar como lida"
                    onClick={e => {
                      e.stopPropagation();
                      marcarComoLida(noti);
                    }}
                  >
                    <Eye size={17} />
                  </button>
                </div>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  Alteração ou novo registro em{" "}
                  {descricaoTabela[noti.tabela] ||
                    noti.tabela.replace("bd_", "").toUpperCase()}
                  {noti.operador && (
                    <> por <b>{noti.operador}</b></>
                  )}
                </span>
                {detalheAberto && detalheAberto.id === noti.id && detalheAberto.tabela === noti.tabela && (
                  <div className="px-2 pb-2 pt-2 text-xs text-muted-foreground bg-muted rounded-b border-b border-muted -mt-2">
                    <div>
                      <b>ID:</b> {noti.id}
                    </div>
                    <div>
                      <b>Data:</b> {new Date(noti.data).toLocaleString("pt-BR")}
                    </div>
                    {noti.operador && (
                      <div>
                        <b>Operador:</b> {noti.operador}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {!loadingNotificacoes && !usarAgrupamento && notificacoesNaoLidas.length === 0 && (
              <div className="p-3 text-muted-foreground">
                Nenhuma notificação recente.
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // Limpa o timestamp da sessão ao fazer logout
      if (user && user.id) {
        sessionStorage.removeItem(`login_timestamp_${user.id}`);
      }
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado do sistema",
      });
      navigate("/login", { replace: true });
    } catch (error) {
      toast({
        title: "Erro ao realizar logout",
        description: "Ocorreu um erro ao tentar desconectar",
        variant: "destructive",
      });
    }
  };

  const UserDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 px-2 sm:px-3">
          <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
            {displayUser.imagem_url ? (
              <AvatarImage src={displayUser.imagem_url} />
            ) : (
              <>
                <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  displayUser.nome_completo || displayUser.email
                )}&background=random`} />
                <AvatarFallback>
                  {displayUser.nome_completo?.[0] || displayUser.email?.[0] || "U"}
                </AvatarFallback>
              </>
            )}
          </Avatar>
          {!isMobile && (
            <>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium truncate max-w-24 lg:max-w-32">
                  {displayUser.nome_completo || displayUser.email}
                </span>
                <span className="text-xs text-muted-foreground">
                  {displayUser.funcoes?.includes("SuperAdm") ? "Administrador" : "Usuário"}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="p-2 cursor-pointer flex items-center" onClick={() => setIsProfileModalOpen(true)} >
          <User className="mr-2 h-4 w-4" /> <span>Perfil</span>
        </div>
        <div className="p-2 cursor-pointer flex items-center" onClick={() => setIsImageUploadModal(true)} >
          <Settings className="mr-2 h-4 w-4" /> <span>Configurações</span>
        </div>
        <div className="border-t my-1" />
        <div className="p-2 cursor-pointer flex items-center" onClick={handleLogout} >
          <LogOut className="mr-2 h-4 w-4" /> <span>Sair</span>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const MobileMenu = () => (
    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="sm:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <div className="flex flex-col gap-4 pt-4">
          {user && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
              <Avatar className="h-10 w-10">
                {user.imagem_url ? (
                  <AvatarImage src={user.imagem_url} />
                ) : (
                  <>
                    <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user.nome_completo || user.email
                    )}&background=random`} />
                    <AvatarFallback>
                      {user.nome_completo?.[0] || user.email?.[0] || "U"}
                    </AvatarFallback>
                  </>
                )}
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium">
                  {user.nome_completo || user.email}
                </span>
                <span className="text-sm text-muted-foreground">
                  {user.funcoes?.includes("admin") ? "Administrador" : "Usuário"}
                </span>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <PWAInstallButton variant="button" className="justify-start" />
            <Button
              variant="ghost"
              className="justify-start"
              onClick={() => {
                setIsProfileModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
            >
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </Button>
            <Button
              variant="ghost"
              className="justify-start"
              onClick={() => {
                setIsImageUploadModal(true);
                setIsMobileMenuOpen(false);
              }}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </Button>
            <Button variant="ghost" className="justify-start" onClick={() => {
                toggleFullScreen();
                setIsMobileMenuOpen(false);
              }}>
              <Maximize className="mr-2 h-4 w-4" />
              <span>Tela Cheia</span>
            </Button>
            <Button
              variant="ghost"
              className="justify-start text-red-600"
              onClick={() => {
                handleLogout();
                setIsMobileMenuOpen(false);
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  function toggleFullScreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(
          `Error attempting to enable full-screen mode: ${err.message}`
        );
      });
    } else {
      document.exitFullscreen();
    }
  }

  return (
    <header className="border-b h-14 sm:h-16 px-3 sm:px-6 sticky top-0 z-10 bg-background flex items-center justify-between rounded-xl sm:rounded-2xl my-1 sm:my-[6px]">
      <div className="flex items-center h-full gap-2">
        <div className="sm:hidden">
          <SidebarTrigger />
        </div>
        <h1 className="text-lg sm:text-xl font-bold hidden sm:block">
          LYTOTEC ERP
        </h1>
        <h1 className="text-base font-bold sm:hidden">LYTOTEC</h1>
      </div>
      <div className="flex items-center gap-1 sm:gap-3">
        <PWAInstallButton />
        {!isMobile && (
          <Button variant="ghost" size="icon" onClick={toggleFullScreen}>
            <Maximize className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        )}
        
        {/* Renderização condicional apenas para SuperAdmin */}
        {displayUser.funcoes?.includes("SuperAdm") && <OnlineUsersDropdown />}
        
        <NotificationDropdown />
        {isMobile ? <MobileMenu /> : <UserDropdown />}
      </div>
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={displayUser}
      />
      <UserImageUploadModal
        isOpen={isImageUploadModalOpen}
        onClose={() => setIsImageUploadModal(false)}
        userId={displayUser.id}
        updateUserImage={updateUserImage}
      />
    </header>
  );
};

export default AppHeader;