-- Activa RLS para las tablas de préstamos y permite su uso a usuarios autenticados.
BEGIN;

ALTER TABLE public.prestamos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fotos ENABLE ROW LEVEL SECURITY;

-- Elimina las políticas actuales de estas tres tablas, sin depender de sus nombres.
DO $$
DECLARE
  politica RECORD;
BEGIN
  FOR politica IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('prestamos', 'pagos', 'fotos')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', politica.policyname, politica.schemaname, politica.tablename);
  END LOOP;
END;
$$;

-- Cada usuario autenticado puede consultar y modificar los registros de la app.
CREATE POLICY luiscredit_prestamos_authenticated_all
  ON public.prestamos FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY luiscredit_pagos_authenticated_all
  ON public.pagos FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY luiscredit_fotos_authenticated_all
  ON public.fotos FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Permisos del bucket de fotos, limitados a fotos-prestamos y usuarios autenticados.
DROP POLICY IF EXISTS luiscredit_fotos_prestamos_select ON storage.objects;
DROP POLICY IF EXISTS luiscredit_fotos_prestamos_insert ON storage.objects;
DROP POLICY IF EXISTS luiscredit_fotos_prestamos_update ON storage.objects;
DROP POLICY IF EXISTS luiscredit_fotos_prestamos_delete ON storage.objects;

CREATE POLICY luiscredit_fotos_prestamos_select
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'fotos-prestamos');

CREATE POLICY luiscredit_fotos_prestamos_insert
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'fotos-prestamos');

CREATE POLICY luiscredit_fotos_prestamos_update
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'fotos-prestamos')
  WITH CHECK (bucket_id = 'fotos-prestamos');

CREATE POLICY luiscredit_fotos_prestamos_delete
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'fotos-prestamos');

COMMIT;
