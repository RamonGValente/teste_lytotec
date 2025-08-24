-- Forçar exclusão do registro duplicado usando SuperAdmin bypass
SELECT delete_funcionario_with_admin_bypass('f8f77d09-b5e6-4dbd-9c62-73348d8db7e1'::uuid) as resultado;