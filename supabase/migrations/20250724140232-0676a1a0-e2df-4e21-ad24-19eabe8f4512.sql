-- Correção de segurança: Adicionar search_path para todas as funções existentes

-- Corrigir função validar_volume_rua
CREATE OR REPLACE FUNCTION public.validar_volume_rua()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Validar se o volume está em uma faixa razoável (1t a 1000t em kg)
    IF NEW.volume IS NOT NULL AND (NEW.volume < 1000 OR NEW.volume > 1000000) THEN
        RAISE WARNING 'Volume suspeito detectado: % kg para rua %. Verificar se está na unidade correta.', 
                     NEW.volume, NEW.logradouro;
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Corrigir função calculate_rua_values
CREATE OR REPLACE FUNCTION public.calculate_rua_values()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Calcular área
    NEW.area = NEW.comprimento * NEW.largura;
    
    -- Calcular volume usando fórmula correta
    -- Volume (kg) = Área (m²) × Espessura (m) × Densidade (2400 kg/m³)
    NEW.volume = NEW.area * (NEW.espessura / 100) * 2400;
    
    RETURN NEW;
END;
$function$;

-- Corrigir função sync_funcionario_equipe_on_equipe_change
CREATE OR REPLACE FUNCTION public.sync_funcionario_equipe_on_equipe_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Limpar equipe_id dos funcionários que não estão mais na lista
  UPDATE bd_funcionarios 
  SET equipe_id = NULL, updated_at = now()
  WHERE equipe_id = OLD.id 
    AND NOT (id = ANY(NEW.equipe));
    
  -- Definir equipe_id para funcionários que estão na nova lista
  UPDATE bd_funcionarios 
  SET equipe_id = NEW.id, updated_at = now()
  WHERE id = ANY(NEW.equipe) 
    AND (equipe_id IS NULL OR equipe_id != NEW.id);
    
  RETURN NEW;
END;
$function$;

-- Corrigir função handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, nome_completo, funcao_permissao)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'nome_completo', NEW.email),
    NULL -- Usuário precisa ser aprovado por SuperAdmin
  );
  RETURN NEW;
END;
$function$;

-- Corrigir função update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Corrigir função calculate_tonelada_real
CREATE OR REPLACE FUNCTION public.calculate_tonelada_real()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    IF NEW.tonelada_retorno IS NOT NULL THEN
        NEW.tonelada_real = NEW.tonelada_saida - NEW.tonelada_retorno;
    ELSE
        NEW.tonelada_real = NEW.tonelada_saida;
    END IF;
    RETURN NEW;
END;
$function$;

-- Corrigir função check_is_super_admin
CREATE OR REPLACE FUNCTION public.check_is_super_admin(user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    JOIN bd_funcoes_permissao fp ON p.funcao_permissao = fp.id
    WHERE p.id = user_id 
    AND fp.nome_funcao = 'SuperAdm'
  ) OR EXISTS (
    -- Fallback para emails SuperAdmin mesmo sem funcao_permissao
    SELECT 1 FROM profiles p
    WHERE p.id = user_id 
    AND p.email IN ('julianohcampos@yahoo.com.br', 'ramonvalentevalente@gmail.com')
  );
$function$;