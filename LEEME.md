# Agenda: pasos para ponerla online (todo gratis)

## 1. Supabase (cuentas, datos y archivos)
1. Creá una cuenta en supabase.com y un proyecto nuevo.
2. Authentication > Providers > Email: desactivá "Confirm email" (así se entra directo al crear la cuenta).
3. SQL Editor: pegá todo `supabase.sql` y tocá Run.
4. Settings > API: copiá "Project URL" y la clave "anon public" dentro de `config.js`. (No uses nunca la service_role.)

## 2. GitHub Pages (hosting gratis)
1. Creá un repositorio público en github.com y subí todos estos archivos (incluida la carpeta `.github`).
2. Settings > Pages > Branch: main / root. En un minuto tenés tu link.
3. Para el aviso anti-pausa: Settings > Secrets and variables > Actions, creá `SUPABASE_URL` y `SUPABASE_KEY` con los mismos valores de config.js.

## 3. Instalar en el teléfono
Abrí el link, tocá Compartir > "Agregar a pantalla de inicio" (iPhone) o el menú > "Instalar app" (Android).

## Actualizar
Reemplazá el archivo en GitHub. Al recargar la app, ya aparece el cambio.
