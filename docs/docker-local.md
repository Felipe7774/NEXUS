# NEXUS con Docker Desktop

Este entorno ejecuta la aplicación en un contenedor Node y PostgreSQL, Auth y
PostgREST en contenedores de Supabase. No requiere conectar Supabase Cloud ni
ejecuta `db push`, `link`, `login` o migraciones remotas.

## Requisitos y arranque

- Docker Desktop iniciado, con motor Linux y WSL 2 en Windows.
- Node.js 22.12 o superior y npm 11. La imagen usa Node 22.
- Puertos 3000, 54321 y 54322 disponibles para desarrollo; 55321/55322 para pruebas.

Desde la raíz del repositorio:

```bash
npm ci
npm run docker:up
```

Abre [NEXUS local](http://localhost:3000). El comando levanta Supabase con las
migraciones versionadas, genera `.docker/app.env` con las claves del stack local
y construye la imagen de desarrollo. La primera ejecución descarga las imágenes
y tarda más. El contenedor aparece en Docker Desktop bajo `nexus-local`.
Además de la página de acceso, comprueba desde el contenedor la conexión con
Auth y la API de empresas. Registra esa comprobación en `artifacts/docker/app-smoke.json`.

El navegador accede a Supabase por `127.0.0.1:54321`; el código de servidor usa
`host.docker.internal:54321`. La clave de servicio solo se configura como variable
de servidor. `.docker/` y `.env*` se excluyen de Git y del contexto de construcción.
Los archivos `.env` de otros entornos no se copian a la imagen ni se sobrescriben.

La imagen ejecuta Vite en modo desarrollo. Al cambiar código, vuelve a ejecutar
`npm run docker:up` para reconstruirla. No es una imagen de despliegue productivo.

```bash
npm run docker:down
```

Detiene la app y el Supabase de desarrollo, conservando sus datos locales. No
detiene otros proyectos de Docker. El entorno de desarrollo no carga las RPC
experimentales del módulo 5.

## Pruebas reales dentro de Docker

```bash
npm run docker:test
```

El comando crea el proyecto local **`nexus-docker-tests`**, reservado para pruebas,
en `.docker/test-stack/`. Copia las migraciones y usa puertos distintos del entorno
de desarrollo. Carga el fixture del módulo 5 únicamente en ese PostgreSQL.

La imagen de pruebas se construye con `npm ci` en Linux, sin montar `node_modules`
de Windows ni el socket de Docker. Los contenedores de pruebas comparten la red
del gateway desechable, de modo que Auth/PostgREST siguen en loopback
(`127.0.0.1:8000`). Se ejecutan:

1. Toda la suite Vitest, incluidas las dos pruebas reales de aislamiento RLS.
2. Los controles de cálculo, contratos y destino local del spike.
3. El spike síncrono/asíncrono: 48 mediciones y cinco verificaciones funcionales.
4. La compilación completa de la aplicación con Vite/Nitro.

Las pruebas RLS y el spike eliminan sus datos sintéticos. Al terminar, incluso
ante un fallo, se detiene y elimina exclusivamente el stack y los volúmenes de
`nexus-docker-tests`. No guardes datos de trabajo en ese proyecto reservado.

Los resultados quedan en `artifacts/docker/`, fuera de Git: `summary.json`,
`vitest.json`, `spike.json` y logs de las etapas. No se escribe el estado de
Supabase con claves al directorio de resultados. El resumen registra SHA,
indicador de cambios sin commit, versiones, imagen, recuentos y limpieza.

La evidencia revisada se publica por separado en
[`dossier/experimentos/spike-01-integracion/resultados/`](../dossier/experimentos/spike-01-integracion/resultados/).
Las latencias locales corresponden a este laboratorio y su receptor artificial;
no son cifras del despliegue cloud ni de capacidad máxima.

## Repetición en GitHub

El workflow [Docker local](../.github/workflows/docker-local.yml) ejecuta el mismo
comando al subir cambios de Docker, código, migraciones o pruebas a `main` o a
ramas `codex/**`. También comprueba la página de acceso de la app en el contenedor.
Publica resultados de pruebas como artefactos sin requerir un Pull Request.

Referencias: [Supabase local](https://supabase.com/docs/guides/local-development)
y [Docker para desarrollo Node](https://docs.docker.com/guides/nodejs/develop/).
