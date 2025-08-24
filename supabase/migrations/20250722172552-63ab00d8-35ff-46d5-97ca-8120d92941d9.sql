
-- ==========================================
-- ESTRUTURA COMPLETA DOS BUCKETS DE STORAGE
-- ==========================================

-- 1. BUCKET: Imagens de Perfil (avatars)
-- Finalidade: Armazenar fotos de perfil de usuários
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas RLS para avatars
DROP POLICY IF EXISTS "Allow public read access on avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload their avatar" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own avatar" ON storage.objects;

CREATE POLICY "Allow public read access on avatars" ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Allow authenticated users to upload their avatar" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Allow users to update their own avatar" ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid() = owner);

CREATE POLICY "Allow users to delete their own avatar" ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid() = owner);

-- 2. BUCKET: Funcionários
-- Finalidade: Armazenar fotos e documentos de funcionários
INSERT INTO storage.buckets (id, name, public)
VALUES ('funcionarios', 'funcionarios', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas RLS para funcionarios
DROP POLICY IF EXISTS "Allow public read access on funcionarios" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload funcionario files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update funcionario files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete funcionario files" ON storage.objects;

CREATE POLICY "Allow public read access on funcionarios" ON storage.objects
FOR SELECT
USING (bucket_id = 'funcionarios');

CREATE POLICY "Allow authenticated users to upload funcionario files" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'funcionarios');

CREATE POLICY "Allow users to update funcionario files" ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'funcionarios' AND auth.uid() = owner);

CREATE POLICY "Allow users to delete funcionario files" ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'funcionarios' AND auth.uid() = owner);

-- 3. BUCKET: Veículos
-- Finalidade: Armazenar fotos de veículos, equipamentos e documentação
INSERT INTO storage.buckets (id, name, public)
VALUES ('veiculos', 'veiculos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas RLS para veiculos
DROP POLICY IF EXISTS "Allow public read access on veiculos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload veiculo files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update veiculo files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete veiculo files" ON storage.objects;

CREATE POLICY "Allow public read access on veiculos" ON storage.objects
FOR SELECT
USING (bucket_id = 'veiculos');

CREATE POLICY "Allow authenticated users to upload veiculo files" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'veiculos');

CREATE POLICY "Allow users to update veiculo files" ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'veiculos' AND auth.uid() = owner);

CREATE POLICY "Allow users to delete veiculo files" ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'veiculos' AND auth.uid() = owner);

-- 4. BUCKET: Tickets
-- Finalidade: Armazenar tickets de pesagem e documentos de carga
INSERT INTO storage.buckets (id, name, public)
VALUES ('tickets', 'tickets', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas RLS para tickets
DROP POLICY IF EXISTS "Allow public read access on tickets" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload ticket files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update ticket files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete ticket files" ON storage.objects;

CREATE POLICY "Allow public read access on tickets" ON storage.objects
FOR SELECT
USING (bucket_id = 'tickets');

CREATE POLICY "Allow authenticated users to upload ticket files" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tickets');

CREATE POLICY "Allow users to update ticket files" ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'tickets' AND auth.uid() = owner);

CREATE POLICY "Allow users to delete ticket files" ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'tickets' AND auth.uid() = owner);

-- 5. BUCKET: Inspeção Fotos
-- Finalidade: Armazenar fotos de inspeção de veículos e equipamentos
INSERT INTO storage.buckets (id, name, public)
VALUES ('inspecao-fotos', 'inspecao-fotos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas RLS para inspecao-fotos
DROP POLICY IF EXISTS "Allow public read access on inspecao-fotos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload inspecao files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update inspecao files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete inspecao files" ON storage.objects;

CREATE POLICY "Allow public read access on inspecao-fotos" ON storage.objects
FOR SELECT
USING (bucket_id = 'inspecao-fotos');

CREATE POLICY "Allow authenticated users to upload inspecao files" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'inspecao-fotos');

CREATE POLICY "Allow users to update inspecao files" ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'inspecao-fotos' AND auth.uid() = owner);

CREATE POLICY "Allow users to delete inspecao files" ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'inspecao-fotos' AND auth.uid() = owner);

-- 6. BUCKET: OS Photos
-- Finalidade: Armazenar fotos relacionadas a ordens de serviço
INSERT INTO storage.buckets (id, name, public)
VALUES ('os_photos', 'os_photos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas RLS para os_photos
DROP POLICY IF EXISTS "Allow public read access on os_photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload os photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update os photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete os photos" ON storage.objects;

CREATE POLICY "Allow public read access on os_photos" ON storage.objects
FOR SELECT
USING (bucket_id = 'os_photos');

CREATE POLICY "Allow authenticated users to upload os photos" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'os_photos');

CREATE POLICY "Allow users to update os photos" ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'os_photos' AND auth.uid() = owner);

CREATE POLICY "Allow users to delete os photos" ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'os_photos' AND auth.uid() = owner);

-- 7. BUCKET: Apontamentos
-- Finalidade: Armazenar imagens de apontamentos e aplicações de massa
INSERT INTO storage.buckets (id, name, public)
VALUES ('apontamentos', 'apontamentos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas RLS para apontamentos (atualizando as existentes)
DROP POLICY IF EXISTS "Allow users to upload files to apontamentos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view files in apontamentos" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own files in apontamentos" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own files in apontamentos" ON storage.objects;

CREATE POLICY "Allow public read access on apontamentos" ON storage.objects
FOR SELECT
USING (bucket_id = 'apontamentos');

CREATE POLICY "Allow authenticated users to upload apontamento files" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'apontamentos');

CREATE POLICY "Allow users to update apontamento files" ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'apontamentos' AND auth.uid() = owner);

CREATE POLICY "Allow users to delete apontamento files" ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'apontamentos' AND auth.uid() = owner);

-- ==========================================
-- VERIFICAÇÃO DA ESTRUTURA CRIADA
-- ==========================================

-- Verificar todos os buckets criados
SELECT 
  id,
  name,
  public,
  created_at
FROM storage.buckets
ORDER BY name;
