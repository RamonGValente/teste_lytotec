-- Add missing email column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Add missing funcao_permissao column to profiles table  
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS funcao_permissao UUID REFERENCES bd_funcoes_permissao(id);

-- Create missing bd_registro_apontamento_inspecao table
CREATE TABLE IF NOT EXISTS bd_registro_apontamento_inspecao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apontamento_caminhao_equipamento_id UUID NOT NULL,
  nivel_oleo TEXT,
  nivel_agua TEXT,
  nivel_combustivel TEXT,
  pressao_pneus TEXT,
  estado_pneus TEXT,
  luzes_funcionamento TEXT,
  freios_funcionamento TEXT,
  direcao_funcionamento TEXT,
  equipamentos_seguranca TEXT,
  limpeza_veiculo TEXT,
  avarias_observadas TEXT,
  observacoes_gerais TEXT,
  fotos_inspecao TEXT[],
  inspecao_aprovada BOOLEAN DEFAULT false,
  data_inspecao DATE NOT NULL DEFAULT CURRENT_DATE,
  hora_inspecao TIME NOT NULL DEFAULT CURRENT_TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID
);

-- Enable RLS on the new table
ALTER TABLE bd_registro_apontamento_inspecao ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for the new table
CREATE POLICY "Users can manage their own inspection records"
ON bd_registro_apontamento_inspecao
FOR ALL
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Create trigger for updated_at
CREATE TRIGGER update_bd_registro_apontamento_inspecao_updated_at
  BEFORE UPDATE ON bd_registro_apontamento_inspecao
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();