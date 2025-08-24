-- Correção do sistema de permissões - Limpar duplicações
-- Problema: Função "Mestre de Obrar" está duplicada na tabela bd_funcoes_permissao

-- FASE 1: Remover registro duplicado mais recente, mantendo o mais antigo
DELETE FROM bd_funcoes_permissao 
WHERE id = '2751b1be-96c3-41b7-86aa-c4e0eec5908c' 
AND nome_funcao = 'Mestre de Obrar';