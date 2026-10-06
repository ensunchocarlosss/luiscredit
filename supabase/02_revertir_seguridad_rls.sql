-- Retira las políticas agregadas por 01_activar_seguridad_rls.sql y desactiva RLS
-- en las tablas de la app para permitir volver al comportamiento anterior.
-- Este archivo no vuelve a crear políticas previas que el primer archivo haya borrado.
BEGIN;

DROP POLICY IF EXISTS luiscredit_prestamos_authenticated_all ON public.prestamos;
DROP POLICY IF EXISTS luiscredit_pagos_authenticated_all ON public.pagos;
DROP POLICY IF EXISTS luiscredit_fotos_authenticated_all ON public.fotos;

DROP POLICY IF EXISTS luiscredit_fotos_prestamos_select ON storage.objects;
DROP POLICY IF EXISTS luiscredit_fotos_prestamos_insert ON storage.objects;
DROP POLICY IF EXISTS luiscredit_fotos_prestamos_update ON storage.objects;
DROP POLICY IF EXISTS luiscredit_fotos_prestamos_delete ON storage.objects;

ALTER TABLE public.prestamos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.fotos DISABLE ROW LEVEL SECURITY;

COMMIT;
