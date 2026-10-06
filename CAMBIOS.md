# Cambios en LuisCrédit

Este cambio agrega inicio de sesión con correo de Supabase, organiza la configuración del proyecto y muestra recordatorios de cobro. No agrega columnas ni tablas. Los archivos SQL incluidos son instrucciones para revisar y ejecutar manualmente en Supabase; durante este trabajo no se conectó a Supabase ni se ejecutó SQL.

## Orden para publicar los cambios

1. **Haz una copia de seguridad de los datos.** En Supabase, abre **Table Editor** y exporta como CSV las tablas `prestamos`, `pagos` y `fotos`.
2. **Crea el usuario del dueño.** En Supabase, abre **Authentication → Users → Add user**, crea su usuario con correo y contraseña y activa la confirmación automática. Luego desactiva **Allow new users to sign up** para que nadie pueda registrarse por su cuenta.
3. **Integra y publica el PR.** Revisa y haz merge del Pull Request hacia `main`. Vercel publicará la nueva versión. Después, prueba el inicio de sesión en la página real con el usuario creado.
4. **Activa RLS cuando el login ya funcione.** Solo entonces abre **SQL Editor** en Supabase, ejecuta `supabase/01_activar_seguridad_rls.sql` y vuelve a probar la app. Si algo falla, ejecuta `supabase/02_revertir_seguridad_rls.sql`.
5. **Revisa las políticas de fotos.** En Supabase, abre **Storage → Policies** del bucket `fotos-prestamos` y elimina las políticas antiguas que permitan escribir a cualquier persona.

## Configuración para desarrollo

Copia `.env.example` como `.env.local` y completa `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con los valores de la configuración del proyecto de Supabase. El archivo `.env.local` está ignorado por Git y no debe compartirse. En desarrollo, la aplicación se detiene con un mensaje claro si estos valores faltan. En producción, se conservan los valores públicos actuales como respaldo para que el despliegue existente en Vercel siga funcionando.

## Qué incluye el cambio

- El login valida correo y contraseña con Supabase Auth y muestra un mensaje genérico si los datos no coinciden.
- La aplicación restaura y observa la sesión de Supabase; solo carga préstamos y pagos mientras haya una sesión activa. Al cerrar sesión, limpia los datos en memoria.
- Se añaden dos guías SQL: una para activar RLS y otra para retirar las políticas nuevas y desactivar RLS.
- La vista de alertas agrega cobros de hoy, atrasados y próximos a tres días, con acceso al detalle y un enlace de WhatsApp cuando el cliente tiene teléfono.
- Las vistas Inicio y Clientes muestran correctamente “1 mes”.

## Nota sobre la reversión de RLS

El archivo de activación elimina las políticas que ya existan en las tres tablas públicas, como se pidió. La reversión desactiva RLS y elimina las políticas nuevas, pero no puede reconstruir las políticas anteriores porque sus nombres y definiciones no se conocen de antemano. Si necesitas conservarlas para una restauración exacta, guarda primero sus definiciones desde Supabase antes de ejecutar el archivo de activación.
