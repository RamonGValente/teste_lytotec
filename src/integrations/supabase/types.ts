export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      bd_apontamento_equipe: {
        Row: {
          colaborador_id: string | null
          competencia_tecnica: number | null
          comunicacao: number | null
          created_at: string | null
          data_registro: string
          equipe_id: string
          hora_fim: string | null
          hora_inicio: string | null
          id: string
          lista_entrega_id: string | null
          nome_colaborador: string
          organizacao: number | null
          pontualidade: number | null
          presente: boolean | null
          proatividade: number | null
          registrado_por: string | null
          trabalho_em_equipe: number | null
          updated_at: string | null
        }
        Insert: {
          colaborador_id?: string | null
          competencia_tecnica?: number | null
          comunicacao?: number | null
          created_at?: string | null
          data_registro: string
          equipe_id: string
          hora_fim?: string | null
          hora_inicio?: string | null
          id?: string
          lista_entrega_id?: string | null
          nome_colaborador: string
          organizacao?: number | null
          pontualidade?: number | null
          presente?: boolean | null
          proatividade?: number | null
          registrado_por?: string | null
          trabalho_em_equipe?: number | null
          updated_at?: string | null
        }
        Update: {
          colaborador_id?: string | null
          competencia_tecnica?: number | null
          comunicacao?: number | null
          created_at?: string | null
          data_registro?: string
          equipe_id?: string
          hora_fim?: string | null
          hora_inicio?: string | null
          id?: string
          lista_entrega_id?: string | null
          nome_colaborador?: string
          organizacao?: number | null
          pontualidade?: number | null
          presente?: boolean | null
          proatividade?: number | null
          registrado_por?: string | null
          trabalho_em_equipe?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bd_apontamento_equipe_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "bd_funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bd_apontamento_equipe_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "bd_equipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bd_apontamento_equipe_registrado_por_fkey"
            columns: ["registrado_por"]
            isOneToOne: false
            referencedRelation: "bd_funcionarios"
            referencedColumns: ["id"]
          },
        ]
      }
      bd_auditoria_correcao_volume_formula: {
        Row: {
          area: number
          data_correcao: string | null
          espessura_cm: number
          espessura_metros: number
          id: string
          motivo: string
          rua_requisicao_id: string
          volume_anterior: number
          volume_corrigido: number
        }
        Insert: {
          area: number
          data_correcao?: string | null
          espessura_cm: number
          espessura_metros: number
          id?: string
          motivo?: string
          rua_requisicao_id: string
          volume_anterior: number
          volume_corrigido: number
        }
        Update: {
          area?: number
          data_correcao?: string | null
          espessura_cm?: number
          espessura_metros?: number
          id?: string
          motivo?: string
          rua_requisicao_id?: string
          volume_anterior?: number
          volume_corrigido?: number
        }
        Relationships: []
      }
      bd_auditoria_sync_equipe_funcionario: {
        Row: {
          data_sync: string | null
          equipe_id_anterior: string | null
          equipe_id_novo: string
          funcionario_id: string
          id: string
          motivo: string | null
          nome_equipe: string
          nome_funcionario: string
        }
        Insert: {
          data_sync?: string | null
          equipe_id_anterior?: string | null
          equipe_id_novo: string
          funcionario_id: string
          id?: string
          motivo?: string | null
          nome_equipe: string
          nome_funcionario: string
        }
        Update: {
          data_sync?: string | null
          equipe_id_anterior?: string | null
          equipe_id_novo?: string
          funcionario_id?: string
          id?: string
          motivo?: string | null
          nome_equipe?: string
          nome_funcionario?: string
        }
        Relationships: []
      }
      bd_auditoria_volume_correcao: {
        Row: {
          data_correcao: string | null
          id: string
          motivo: string
          rua_requisicao_id: string
          volume_anterior: number
          volume_corrigido: number
        }
        Insert: {
          data_correcao?: string | null
          id?: string
          motivo: string
          rua_requisicao_id: string
          volume_anterior: number
          volume_corrigido: number
        }
        Update: {
          data_correcao?: string | null
          id?: string
          motivo?: string
          rua_requisicao_id?: string
          volume_anterior?: number
          volume_corrigido?: number
        }
        Relationships: []
      }
      bd_caminhoes_equipamentos: {
        Row: {
          aluguel: string | null
          ano_fabricacao: string | null
          capacidade: string | null
          cor: string | null
          created_at: string | null
          departamento_id: string | null
          empresa_id: string | null
          frota: string | null
          id: string
          imagem_url: string | null
          marca: string | null
          modelo: string | null
          motor: string | null
          numero_frota: string | null
          observacoes: string | null
          placa: string | null
          situacao: string | null
          status_ipva: string | null
          tipo_combustivel: string | null
          tipo_veiculo: string | null
          updated_at: string | null
        }
        Insert: {
          aluguel?: string | null
          ano_fabricacao?: string | null
          capacidade?: string | null
          cor?: string | null
          created_at?: string | null
          departamento_id?: string | null
          empresa_id?: string | null
          frota?: string | null
          id?: string
          imagem_url?: string | null
          marca?: string | null
          modelo?: string | null
          motor?: string | null
          numero_frota?: string | null
          observacoes?: string | null
          placa?: string | null
          situacao?: string | null
          status_ipva?: string | null
          tipo_combustivel?: string | null
          tipo_veiculo?: string | null
          updated_at?: string | null
        }
        Update: {
          aluguel?: string | null
          ano_fabricacao?: string | null
          capacidade?: string | null
          cor?: string | null
          created_at?: string | null
          departamento_id?: string | null
          empresa_id?: string | null
          frota?: string | null
          id?: string
          imagem_url?: string | null
          marca?: string | null
          modelo?: string | null
          motor?: string | null
          numero_frota?: string | null
          observacoes?: string | null
          placa?: string | null
          situacao?: string | null
          status_ipva?: string | null
          tipo_combustivel?: string | null
          tipo_veiculo?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bd_caminhoes_equipamentos_departamento_id_fkey"
            columns: ["departamento_id"]
            isOneToOne: false
            referencedRelation: "bd_departamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bd_caminhoes_equipamentos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "bd_empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      bd_carga_status_historico: {
        Row: {
          alterado_por: string | null
          created_at: string
          data_alteracao: string
          id: string
          lista_entrega_id: string | null
          massa_remanescente: number | null
          observacoes: string | null
          percentual_aplicado: number | null
          registro_carga_id: string | null
          status_anterior: string | null
          status_novo: string
        }
        Insert: {
          alterado_por?: string | null
          created_at?: string
          data_alteracao?: string
          id?: string
          lista_entrega_id?: string | null
          massa_remanescente?: number | null
          observacoes?: string | null
          percentual_aplicado?: number | null
          registro_carga_id?: string | null
          status_anterior?: string | null
          status_novo: string
        }
        Update: {
          alterado_por?: string | null
          created_at?: string
          data_alteracao?: string
          id?: string
          lista_entrega_id?: string | null
          massa_remanescente?: number | null
          observacoes?: string | null
          percentual_aplicado?: number | null
          registro_carga_id?: string | null
          status_anterior?: string | null
          status_novo?: string
        }
        Relationships: [
          {
            foreignKeyName: "bd_carga_status_historico_alterado_por_fkey"
            columns: ["alterado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bd_carga_status_historico_lista_entrega_id_fkey"
            columns: ["lista_entrega_id"]
            isOneToOne: false
            referencedRelation: "bd_lista_programacao_entrega"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bd_carga_status_historico_registro_carga_id_fkey"
            columns: ["registro_carga_id"]
            isOneToOne: false
            referencedRelation: "bd_registro_cargas"
            referencedColumns: ["id"]
          },
        ]
      }
      bd_centros_custo: {
        Row: {
          cnpj_vinculado: string | null
          codigo_centro_custo: string
          created_at: string | null
          id: string
          nome_centro_custo: string
          situacao: string | null
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          cnpj_vinculado?: string | null
          codigo_centro_custo: string
          created_at?: string | null
          id?: string
          nome_centro_custo: string
          situacao?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          cnpj_vinculado?: string | null
          codigo_centro_custo?: string
          created_at?: string | null
          id?: string
          nome_centro_custo?: string
          situacao?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      bd_chamados_os: {
        Row: {
          caminhao_equipamento_id: string | null
          centro_custo_id: string | null
          created_at: string | null
          data_solicitacao: string
          descricao_problema: string | null
          fotos_avarias: string[] | null
          hora_solicitacao: string
          id: string
          numero_chamado: string
          prioridade: string | null
          solicitante_id: string | null
          status: string | null
          tipo_falha: string | null
          updated_at: string | null
        }
        Insert: {
          caminhao_equipamento_id?: string | null
          centro_custo_id?: string | null
          created_at?: string | null
          data_solicitacao?: string
          descricao_problema?: string | null
          fotos_avarias?: string[] | null
          hora_solicitacao?: string
          id?: string
          numero_chamado: string
          prioridade?: string | null
          solicitante_id?: string | null
          status?: string | null
          tipo_falha?: string | null
          updated_at?: string | null
        }
        Update: {
          caminhao_equipamento_id?: string | null
          centro_custo_id?: string | null
          created_at?: string | null
          data_solicitacao?: string
          descricao_problema?: string | null
          fotos_avarias?: string[] | null
          hora_solicitacao?: string
          id?: string
          numero_chamado?: string
          prioridade?: string | null
          solicitante_id?: string | null
          status?: string | null
          tipo_falha?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bd_chamados_os_caminhao_equipamento_id_fkey"
            columns: ["caminhao_equipamento_id"]
            isOneToOne: false
            referencedRelation: "bd_caminhoes_equipamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bd_chamados_os_centro_custo_id_fkey"
            columns: ["centro_custo_id"]
            isOneToOne: false
            referencedRelation: "bd_centros_custo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bd_chamados_os_solicitante_id_fkey"
            columns: ["solicitante_id"]
            isOneToOne: false
            referencedRelation: "bd_funcionarios"
            referencedColumns: ["id"]
          },
        ]
      }
      bd_departamentos: {
        Row: {
          created_at: string | null
          empresa_id: string
          id: string
          nome_departamento: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          empresa_id: string
          id?: string
          nome_departamento?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          empresa_id?: string
          id?: string
          nome_departamento?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_departamento_empresa"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "bd_empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      bd_empresas: {
        Row: {
          cnpj: string
          created_at: string | null
          id: string
          nome_empresa: string
          situacao: string | null
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          cnpj: string
          created_at?: string | null
          id?: string
          nome_empresa: string
          situacao?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          cnpj?: string
          created_at?: string | null
          id?: string
          nome_empresa?: string
          situacao?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      bd_equipes: {
        Row: {
          apontador_id: string | null
          created_at: string | null
          encarregado_id: string | null
          equipe: string[] | null
          id: string
          nome_equipe: string
          updated_at: string | null
        }
        Insert: {
          apontador_id?: string | null
          created_at?: string | null
          encarregado_id?: string | null
          equipe?: string[] | null
          id?: string
          nome_equipe: string
          updated_at?: string | null
        }
        Update: {
          apontador_id?: string | null
          created_at?: string | null
          encarregado_id?: string | null
          equipe?: string[] | null
          id?: string
          nome_equipe?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_equipes_apontador"
            columns: ["apontador_id"]
            isOneToOne: false
            referencedRelation: "bd_funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_equipes_encarregado"
            columns: ["encarregado_id"]
            isOneToOne: false
            referencedRelation: "bd_funcionarios"
            referencedColumns: ["id"]
          },
        ]
      }
      bd_funcionarios: {
        Row: {
          adicional_noturno: number | null
          centro_custo_id: string | null
          cpf: string
          created_at: string | null
          custo_passagem: number | null
          data_admissao: string | null
          data_demissao: string | null
          data_ferias: string | null
          data_nascimento: string | null
          departamento_id: string | null
          diarias: number | null
          email: string | null
          empresa_id: string | null
          endereco_completo: string | null
          equipe_id: string | null
          escolaridade: string | null
          funcao_id: string | null
          genero: string | null
          gratificacao: number | null
          id: string
          imagem: string | null
          insalubridade: number | null
          nome_completo: string
          periculosidade: number | null
          refeicao: number | null
          salario_base: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          adicional_noturno?: number | null
          centro_custo_id?: string | null
          cpf: string
          created_at?: string | null
          custo_passagem?: number | null
          data_admissao?: string | null
          data_demissao?: string | null
          data_ferias?: string | null
          data_nascimento?: string | null
          departamento_id?: string | null
          diarias?: number | null
          email?: string | null
          empresa_id?: string | null
          endereco_completo?: string | null
          equipe_id?: string | null
          escolaridade?: string | null
          funcao_id?: string | null
          genero?: string | null
          gratificacao?: number | null
          id?: string
          imagem?: string | null
          insalubridade?: number | null
          nome_completo: string
          periculosidade?: number | null
          refeicao?: number | null
          salario_base?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          adicional_noturno?: number | null
          centro_custo_id?: string | null
          cpf?: string
          created_at?: string | null
          custo_passagem?: number | null
          data_admissao?: string | null
          data_demissao?: string | null
          data_ferias?: string | null
          data_nascimento?: string | null
          departamento_id?: string | null
          diarias?: number | null
          email?: string | null
          empresa_id?: string | null
          endereco_completo?: string | null
          equipe_id?: string | null
          escolaridade?: string | null
          funcao_id?: string | null
          genero?: string | null
          gratificacao?: number | null
          id?: string
          imagem?: string | null
          insalubridade?: number | null
          nome_completo?: string
          periculosidade?: number | null
          refeicao?: number | null
          salario_base?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bd_funcionarios_centro_custo_id_fkey"
            columns: ["centro_custo_id"]
            isOneToOne: false
            referencedRelation: "bd_centros_custo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bd_funcionarios_departamento_id_fkey"
            columns: ["departamento_id"]
            isOneToOne: false
            referencedRelation: "bd_departamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bd_funcionarios_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "bd_empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bd_funcionarios_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "bd_equipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bd_funcionarios_funcao_id_fkey"
            columns: ["funcao_id"]
            isOneToOne: false
            referencedRelation: "bd_funcoes"
            referencedColumns: ["id"]
          },
        ]
      }
      bd_funcoes: {
        Row: {
          created_at: string | null
          descricao: string | null
          id: string
          nome_funcao: string
          situacao: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome_funcao: string
          situacao?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome_funcao?: string
          situacao?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      bd_funcoes_permissao: {
        Row: {
          created_at: string | null
          descricao: string | null
          id: string
          nome_funcao: string
          permissoes: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome_funcao: string
          permissoes?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome_funcao?: string
          permissoes?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      bd_lista_programacao_entrega: {
        Row: {
          apontador_id: string
          caminhao_id: string
          created_at: string | null
          data_entrega: string
          equipe_id: string
          id: string
          logradouro: string
          programacao_entrega_id: string | null
          programacao_id: string | null
          quantidade_massa: number
          requisicao_id: string
          status: string
          tipo_lancamento: string
          updated_at: string | null
          usina_id: string
        }
        Insert: {
          apontador_id: string
          caminhao_id: string
          created_at?: string | null
          data_entrega?: string
          equipe_id: string
          id?: string
          logradouro: string
          programacao_entrega_id?: string | null
          programacao_id?: string | null
          quantidade_massa: number
          requisicao_id: string
          status?: string
          tipo_lancamento: string
          updated_at?: string | null
          usina_id: string
        }
        Update: {
          apontador_id?: string
          caminhao_id?: string
          created_at?: string | null
          data_entrega?: string
          equipe_id?: string
          id?: string
          logradouro?: string
          programacao_entrega_id?: string | null
          programacao_id?: string | null
          quantidade_massa?: number
          requisicao_id?: string
          status?: string
          tipo_lancamento?: string
          updated_at?: string | null
          usina_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bd_lista_programacao_entrega_apontador_id_fkey"
            columns: ["apontador_id"]
            isOneToOne: false
            referencedRelation: "bd_funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bd_lista_programacao_entrega_caminhao_id_fkey"
            columns: ["caminhao_id"]
            isOneToOne: false
            referencedRelation: "bd_caminhoes_equipamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bd_lista_programacao_entrega_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "bd_equipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bd_lista_programacao_entrega_programacao_entrega_id_fkey"
            columns: ["programacao_entrega_id"]
            isOneToOne: false
            referencedRelation: "bd_programacao_entrega"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bd_lista_programacao_entrega_requisicao_id_fkey"
            columns: ["requisicao_id"]
            isOneToOne: false
            referencedRelation: "bd_requisicoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bd_lista_programacao_entrega_usina_id_fkey"
            columns: ["usina_id"]
            isOneToOne: false
            referencedRelation: "bd_usinas"
            referencedColumns: ["id"]
          },
        ]
      }
      bd_ordens_servico: {
        Row: {
          caminhao_equipamento_id: string | null
          chamado_id: string | null
          created_at: string | null
          data_abertura: string
          data_conclusao: string | null
          data_previsao: string | null
          descricao_servico: string | null
          id: string
          mecanico_id: string | null
          numero_os: string
          observacoes: string | null
          pecas_utilizadas: Json | null
          status: string | null
          tipo_servico: string | null
          updated_at: string | null
          valor_servico: number | null
        }
        Insert: {
          caminhao_equipamento_id?: string | null
          chamado_id?: string | null
          created_at?: string | null
          data_abertura?: string
          data_conclusao?: string | null
          data_previsao?: string | null
          descricao_servico?: string | null
          id?: string
          mecanico_id?: string | null
          numero_os: string
          observacoes?: string | null
          pecas_utilizadas?: Json | null
          status?: string | null
          tipo_servico?: string | null
          updated_at?: string | null
          valor_servico?: number | null
        }
        Update: {
          caminhao_equipamento_id?: string | null
          chamado_id?: string | null
          created_at?: string | null
          data_abertura?: string
          data_conclusao?: string | null
          data_previsao?: string | null
          descricao_servico?: string | null
          id?: string
          mecanico_id?: string | null
          numero_os?: string
          observacoes?: string | null
          pecas_utilizadas?: Json | null
          status?: string | null
          tipo_servico?: string | null
          updated_at?: string | null
          valor_servico?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bd_ordens_servico_caminhao_equipamento_id_fkey"
            columns: ["caminhao_equipamento_id"]
            isOneToOne: false
            referencedRelation: "bd_caminhoes_equipamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bd_ordens_servico_chamado_id_fkey"
            columns: ["chamado_id"]
            isOneToOne: false
            referencedRelation: "bd_chamados_os"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bd_ordens_servico_mecanico_id_fkey"
            columns: ["mecanico_id"]
            isOneToOne: false
            referencedRelation: "bd_funcionarios"
            referencedColumns: ["id"]
          },
        ]
      }
      bd_permissoes: {
        Row: {
          created_at: string | null
          descricao: string | null
          id: string
          nome_permissao: string
          rota: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome_permissao: string
          rota?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome_permissao?: string
          rota?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      bd_programacao_entrega: {
        Row: {
          centro_custo_id: string | null
          created_at: string | null
          data_entrega: string | null
          data_programacao: string
          id: string
          observacoes: string | null
          requisicao_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          centro_custo_id?: string | null
          created_at?: string | null
          data_entrega?: string | null
          data_programacao?: string
          id?: string
          observacoes?: string | null
          requisicao_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          centro_custo_id?: string | null
          created_at?: string | null
          data_entrega?: string | null
          data_programacao?: string
          id?: string
          observacoes?: string | null
          requisicao_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bd_programacao_entrega_centro_custo_id_fkey"
            columns: ["centro_custo_id"]
            isOneToOne: false
            referencedRelation: "bd_centros_custo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bd_programacao_entrega_requisicao_id_fkey"
            columns: ["requisicao_id"]
            isOneToOne: false
            referencedRelation: "bd_requisicoes"
            referencedColumns: ["id"]
          },
        ]
      }
      bd_registro_aplicacao_detalhes: {
        Row: {
          area_aplicada: number
          bordo: string | null
          comprimento: number | null
          condicoes_climaticas: string | null
          created_at: string | null
          created_by: string | null
          data_aplicacao: string
          densidade_compactacao: number | null
          equipamento_compactacao: string | null
          espessura_aplicada: number | null
          espessura_calculada: number | null
          estaca_final: number | null
          estaca_inicial: number | null
          fotos_aplicacao: string[] | null
          hora_fim_aplicacao: string | null
          hora_inicio_aplicacao: string | null
          id: string
          largura_media: number | null
          lista_entrega_id: string
          logradouro_id: string | null
          logradouro_nome: string
          numero_passadas: number | null
          observacoes_aplicacao: string | null
          registro_aplicacao_id: string
          registro_carga_id: string
          sequencia_aplicacao: number
          temperatura_aplicacao: number | null
          tonelada_aplicada: number
          updated_at: string | null
        }
        Insert: {
          area_aplicada: number
          bordo?: string | null
          comprimento?: number | null
          condicoes_climaticas?: string | null
          created_at?: string | null
          created_by?: string | null
          data_aplicacao?: string
          densidade_compactacao?: number | null
          equipamento_compactacao?: string | null
          espessura_aplicada?: number | null
          espessura_calculada?: number | null
          estaca_final?: number | null
          estaca_inicial?: number | null
          fotos_aplicacao?: string[] | null
          hora_fim_aplicacao?: string | null
          hora_inicio_aplicacao?: string | null
          id?: string
          largura_media?: number | null
          lista_entrega_id: string
          logradouro_id?: string | null
          logradouro_nome: string
          numero_passadas?: number | null
          observacoes_aplicacao?: string | null
          registro_aplicacao_id: string
          registro_carga_id: string
          sequencia_aplicacao?: number
          temperatura_aplicacao?: number | null
          tonelada_aplicada: number
          updated_at?: string | null
        }
        Update: {
          area_aplicada?: number
          bordo?: string | null
          comprimento?: number | null
          condicoes_climaticas?: string | null
          created_at?: string | null
          created_by?: string | null
          data_aplicacao?: string
          densidade_compactacao?: number | null
          equipamento_compactacao?: string | null
          espessura_aplicada?: number | null
          espessura_calculada?: number | null
          estaca_final?: number | null
          estaca_inicial?: number | null
          fotos_aplicacao?: string[] | null
          hora_fim_aplicacao?: string | null
          hora_inicio_aplicacao?: string | null
          id?: string
          largura_media?: number | null
          lista_entrega_id?: string
          logradouro_id?: string | null
          logradouro_nome?: string
          numero_passadas?: number | null
          observacoes_aplicacao?: string | null
          registro_aplicacao_id?: string
          registro_carga_id?: string
          sequencia_aplicacao?: number
          temperatura_aplicacao?: number | null
          tonelada_aplicada?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bd_registro_aplicacao_detalhes_lista_entrega_id_fkey"
            columns: ["lista_entrega_id"]
            isOneToOne: false
            referencedRelation: "bd_lista_programacao_entrega"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bd_registro_aplicacao_detalhes_registro_aplicacao_id_fkey"
            columns: ["registro_aplicacao_id"]
            isOneToOne: false
            referencedRelation: "bd_registro_apontamento_aplicacao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bd_registro_aplicacao_detalhes_registro_carga_id_fkey"
            columns: ["registro_carga_id"]
            isOneToOne: false
            referencedRelation: "bd_registro_cargas"
            referencedColumns: ["id"]
          },
        ]
      }
      bd_registro_apontamento_aplicacao: {
        Row: {
          anotacoes_apontador: string | null
          aplicacao_numero: number | null
          aplicacao_sequencia: number | null
          area: number | null
          bordo: string | null
          carga_finalizada: boolean | null
          carga_origem_id: string | null
          carga_total_aplicada: number | null
          comprimento: number | null
          created_at: string | null
          created_by: string | null
          data_aplicacao: string
          espessura: number | null
          espessura_calculada: number | null
          estaca_final: number | null
          estaca_inicial: number | null
          hora_aplicacao: string | null
          hora_chegada_local: string
          hora_saida_caminhao: string | null
          id: string
          largura_media: number | null
          lista_entrega_id: string | null
          logradouro_aplicado: string | null
          logradouro_id: string | null
          observacoes_gerais: string | null
          percentual_aplicado: number | null
          registro_carga_id: string | null
          status_aplicacao: string | null
          temperatura_aplicacao: number | null
          temperatura_chegada: number | null
          tonelada_aplicada: number | null
          updated_at: string | null
        }
        Insert: {
          anotacoes_apontador?: string | null
          aplicacao_numero?: number | null
          aplicacao_sequencia?: number | null
          area?: number | null
          bordo?: string | null
          carga_finalizada?: boolean | null
          carga_origem_id?: string | null
          carga_total_aplicada?: number | null
          comprimento?: number | null
          created_at?: string | null
          created_by?: string | null
          data_aplicacao: string
          espessura?: number | null
          espessura_calculada?: number | null
          estaca_final?: number | null
          estaca_inicial?: number | null
          hora_aplicacao?: string | null
          hora_chegada_local: string
          hora_saida_caminhao?: string | null
          id?: string
          largura_media?: number | null
          lista_entrega_id?: string | null
          logradouro_aplicado?: string | null
          logradouro_id?: string | null
          observacoes_gerais?: string | null
          percentual_aplicado?: number | null
          registro_carga_id?: string | null
          status_aplicacao?: string | null
          temperatura_aplicacao?: number | null
          temperatura_chegada?: number | null
          tonelada_aplicada?: number | null
          updated_at?: string | null
        }
        Update: {
          anotacoes_apontador?: string | null
          aplicacao_numero?: number | null
          aplicacao_sequencia?: number | null
          area?: number | null
          bordo?: string | null
          carga_finalizada?: boolean | null
          carga_origem_id?: string | null
          carga_total_aplicada?: number | null
          comprimento?: number | null
          created_at?: string | null
          created_by?: string | null
          data_aplicacao?: string
          espessura?: number | null
          espessura_calculada?: number | null
          estaca_final?: number | null
          estaca_inicial?: number | null
          hora_aplicacao?: string | null
          hora_chegada_local?: string
          hora_saida_caminhao?: string | null
          id?: string
          largura_media?: number | null
          lista_entrega_id?: string | null
          logradouro_aplicado?: string | null
          logradouro_id?: string | null
          observacoes_gerais?: string | null
          percentual_aplicado?: number | null
          registro_carga_id?: string | null
          status_aplicacao?: string | null
          temperatura_aplicacao?: number | null
          temperatura_chegada?: number | null
          tonelada_aplicada?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bd_registro_apontamento_aplicacao_carga_origem_id_fkey"
            columns: ["carga_origem_id"]
            isOneToOne: false
            referencedRelation: "bd_registro_cargas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bd_registro_apontamento_aplicacao_lista_entrega_id_fkey"
            columns: ["lista_entrega_id"]
            isOneToOne: false
            referencedRelation: "bd_lista_programacao_entrega"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bd_registro_apontamento_aplicacao_registro_carga_id_fkey"
            columns: ["registro_carga_id"]
            isOneToOne: false
            referencedRelation: "bd_registro_cargas"
            referencedColumns: ["id"]
          },
        ]
      }
      bd_registro_apontamento_cam_equipa: {
        Row: {
          abastecimento: number | null
          caminhao_equipamento_id: string | null
          centro_custo_id: string | null
          created_at: string | null
          data: string | null
          hora_final: string | null
          hora_inicial: string | null
          horimetro_final: number | null
          horimetro_inicial: number | null
          id: string
          operador_id: string | null
          situacao: string | null
          updated_at: string | null
        }
        Insert: {
          abastecimento?: number | null
          caminhao_equipamento_id?: string | null
          centro_custo_id?: string | null
          created_at?: string | null
          data?: string | null
          hora_final?: string | null
          hora_inicial?: string | null
          horimetro_final?: number | null
          horimetro_inicial?: number | null
          id?: string
          operador_id?: string | null
          situacao?: string | null
          updated_at?: string | null
        }
        Update: {
          abastecimento?: number | null
          caminhao_equipamento_id?: string | null
          centro_custo_id?: string | null
          created_at?: string | null
          data?: string | null
          hora_final?: string | null
          hora_inicial?: string | null
          horimetro_final?: number | null
          horimetro_inicial?: number | null
          id?: string
          operador_id?: string | null
          situacao?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bd_registro_apontamento_cam_equipa_caminhao_equipamento_id_fkey"
            columns: ["caminhao_equipamento_id"]
            isOneToOne: false
            referencedRelation: "bd_caminhoes_equipamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bd_registro_apontamento_cam_equipa_centro_custo_id_fkey"
            columns: ["centro_custo_id"]
            isOneToOne: false
            referencedRelation: "bd_centros_custo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bd_registro_apontamento_cam_equipa_operador_id_fkey"
            columns: ["operador_id"]
            isOneToOne: false
            referencedRelation: "bd_funcionarios"
            referencedColumns: ["id"]
          },
        ]
      }
      bd_registro_apontamento_inspecao: {
        Row: {
          apontamento_caminhao_equipamento_id: string
          avarias_observadas: string | null
          created_at: string | null
          created_by: string | null
          data_inspecao: string
          direcao_funcionamento: string | null
          equipamentos_seguranca: string | null
          estado_pneus: string | null
          fotos_inspecao: string[] | null
          freios_funcionamento: string | null
          hora_inspecao: string
          id: string
          inspecao_aprovada: boolean | null
          limpeza_veiculo: string | null
          luzes_funcionamento: string | null
          nivel_agua: string | null
          nivel_combustivel: string | null
          nivel_oleo: string | null
          observacoes_gerais: string | null
          pressao_pneus: string | null
          updated_at: string | null
        }
        Insert: {
          apontamento_caminhao_equipamento_id: string
          avarias_observadas?: string | null
          created_at?: string | null
          created_by?: string | null
          data_inspecao?: string
          direcao_funcionamento?: string | null
          equipamentos_seguranca?: string | null
          estado_pneus?: string | null
          fotos_inspecao?: string[] | null
          freios_funcionamento?: string | null
          hora_inspecao?: string
          id?: string
          inspecao_aprovada?: boolean | null
          limpeza_veiculo?: string | null
          luzes_funcionamento?: string | null
          nivel_agua?: string | null
          nivel_combustivel?: string | null
          nivel_oleo?: string | null
          observacoes_gerais?: string | null
          pressao_pneus?: string | null
          updated_at?: string | null
        }
        Update: {
          apontamento_caminhao_equipamento_id?: string
          avarias_observadas?: string | null
          created_at?: string | null
          created_by?: string | null
          data_inspecao?: string
          direcao_funcionamento?: string | null
          equipamentos_seguranca?: string | null
          estado_pneus?: string | null
          fotos_inspecao?: string[] | null
          freios_funcionamento?: string | null
          hora_inspecao?: string
          id?: string
          inspecao_aprovada?: boolean | null
          limpeza_veiculo?: string | null
          luzes_funcionamento?: string | null
          nivel_agua?: string | null
          nivel_combustivel?: string | null
          nivel_oleo?: string | null
          observacoes_gerais?: string | null
          pressao_pneus?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      bd_registro_cargas: {
        Row: {
          created_at: string | null
          data_saida: string
          hora_saida: string
          id: string
          imagem_ticket_retorno: string | null
          imagem_ticket_saida: string
          lista_entrega_id: string
          programacao_id: string
          status_registro: string | null
          temperatura_saida: number | null
          tonelada_real: number | null
          tonelada_retorno: number | null
          tonelada_saida: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_saida: string
          hora_saida: string
          id?: string
          imagem_ticket_retorno?: string | null
          imagem_ticket_saida: string
          lista_entrega_id: string
          programacao_id: string
          status_registro?: string | null
          temperatura_saida?: number | null
          tonelada_real?: number | null
          tonelada_retorno?: number | null
          tonelada_saida: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_saida?: string
          hora_saida?: string
          id?: string
          imagem_ticket_retorno?: string | null
          imagem_ticket_saida?: string
          lista_entrega_id?: string
          programacao_id?: string
          status_registro?: string | null
          temperatura_saida?: number | null
          tonelada_real?: number | null
          tonelada_retorno?: number | null
          tonelada_saida?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bd_registro_cargas_lista_entrega_id_fkey"
            columns: ["lista_entrega_id"]
            isOneToOne: false
            referencedRelation: "bd_lista_programacao_entrega"
            referencedColumns: ["id"]
          },
        ]
      }
      bd_requisicoes: {
        Row: {
          centro_custo_id: string | null
          created_at: string | null
          data_requisicao: string
          diretoria: string | null
          engenheiro_id: string | null
          gerencia: string | null
          id: string
          numero: string
          updated_at: string | null
        }
        Insert: {
          centro_custo_id?: string | null
          created_at?: string | null
          data_requisicao?: string
          diretoria?: string | null
          engenheiro_id?: string | null
          gerencia?: string | null
          id?: string
          numero: string
          updated_at?: string | null
        }
        Update: {
          centro_custo_id?: string | null
          created_at?: string | null
          data_requisicao?: string
          diretoria?: string | null
          engenheiro_id?: string | null
          gerencia?: string | null
          id?: string
          numero?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bd_requisicoes_centro_custo_id_fkey"
            columns: ["centro_custo_id"]
            isOneToOne: false
            referencedRelation: "bd_centros_custo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bd_requisicoes_engenheiro_id_fkey"
            columns: ["engenheiro_id"]
            isOneToOne: false
            referencedRelation: "bd_funcionarios"
            referencedColumns: ["id"]
          },
        ]
      }
      bd_ruas_requisicao: {
        Row: {
          area: number | null
          bairro: string | null
          comprimento: number
          created_at: string | null
          espessura: number
          id: string
          largura: number
          logradouro: string
          pintura_ligacao: string
          requisicao_id: string | null
          traco: string
          updated_at: string | null
          volume: number | null
        }
        Insert: {
          area?: number | null
          bairro?: string | null
          comprimento: number
          created_at?: string | null
          espessura: number
          id?: string
          largura: number
          logradouro: string
          pintura_ligacao: string
          requisicao_id?: string | null
          traco: string
          updated_at?: string | null
          volume?: number | null
        }
        Update: {
          area?: number | null
          bairro?: string | null
          comprimento?: number
          created_at?: string | null
          espessura?: number
          id?: string
          largura?: number
          logradouro?: string
          pintura_ligacao?: string
          requisicao_id?: string | null
          traco?: string
          updated_at?: string | null
          volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bd_ruas_requisicao_requisicao_id_fkey"
            columns: ["requisicao_id"]
            isOneToOne: false
            referencedRelation: "bd_requisicoes"
            referencedColumns: ["id"]
          },
        ]
      }
      bd_usinas: {
        Row: {
          created_at: string | null
          endereco: string | null
          id: string
          nome_usina: string
          producao_total: number | null
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          endereco?: string | null
          id?: string
          nome_usina: string
          producao_total?: number | null
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          endereco?: string | null
          id?: string
          nome_usina?: string
          producao_total?: number | null
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          funcao_permissao: string | null
          funcao_sistema: string | null
          funcionario_id: string | null
          funcoes: string[] | null
          id: string
          imagem_url: string | null
          nome_completo: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          funcao_permissao?: string | null
          funcao_sistema?: string | null
          funcionario_id?: string | null
          funcoes?: string[] | null
          id: string
          imagem_url?: string | null
          nome_completo?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          funcao_permissao?: string | null
          funcao_sistema?: string | null
          funcionario_id?: string | null
          funcoes?: string[] | null
          id?: string
          imagem_url?: string | null
          nome_completo?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_funcao_permissao_fkey"
            columns: ["funcao_permissao"]
            isOneToOne: false
            referencedRelation: "bd_funcoes_permissao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "bd_funcionarios"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      atualizar_status_entrega_automatico: {
        Args: {
          lista_id: string
          novo_status: string
          percentual_aplicado?: number
          massa_remanescente?: number
        }
        Returns: boolean
      }
      calcular_espessura_aplicacao: {
        Args: { tonelada_aplicada: number; area_aplicada: number }
        Returns: {
          espessura_cm: number
          status: string
          descricao: string
        }[]
      }
      calcular_massa_remanescente: {
        Args: { entrega_id: string }
        Returns: number
      }
      calcular_massa_remanescente_aplicacao: {
        Args: { aplicacao_id: string }
        Returns: number
      }
      calcular_massa_remanescente_em_tempo_real: {
        Args: { p_registro_aplicacao_id: string }
        Returns: number
      }
      check_is_super_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
      converter_kg_para_toneladas: {
        Args: { p_valor: number }
        Returns: number
      }
      criar_aplicacao_por_rua: {
        Args: {
          p_lista_entrega_id: string
          p_registro_carga_id: string
          p_logradouro_nome: string
          p_area_aplicada: number
          p_tonelada_aplicada: number
          p_espessura_aplicada?: number
          p_comprimento?: number
          p_largura_media?: number
          p_bordo?: string
          p_temperatura_aplicacao?: number
          p_observacoes_aplicacao?: string
          p_hora_inicio_aplicacao?: string
          p_hora_fim_aplicacao?: string
          p_data_aplicacao?: string
          p_hora_chegada_local?: string
        }
        Returns: Json
      }
      finalizar_carga_aplicacao: {
        Args: { aplicacao_id: string }
        Returns: Json
      }
      finalizar_carga_manual: {
        Args: { carga_id: string }
        Returns: Json
      }
      garantir_registro_aplicacao_principal: {
        Args: {
          p_lista_entrega_id: string
          p_registro_carga_id: string
          p_data_aplicacao: string
          p_hora_chegada_local: string
          p_created_by: string
        }
        Returns: string
      }
      log_aplicacao_debug: {
        Args: { p_funcao: string; p_dados: Json; p_resultado?: Json }
        Returns: undefined
      }
      sincronizar_hora_saida_aplicacao: {
        Args: { p_registro_aplicacao_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
