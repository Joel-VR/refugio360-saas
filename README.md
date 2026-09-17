# Refugio360 SaaS

Refugio360 es una plataforma web SaaS multi-albergue para gestionar refugios de animales, adopciones, donaciones, gastos, transparencia economica y publicaciones de mascotas perdidas o encontradas.

El proyecto esta dividido en dos aplicaciones:

- `backend-laravel`: API REST en Laravel.
- `frontend-next`: aplicacion web publica y paneles administrativos en Next.js.

## Stack principal

- Backend: Laravel 13, Laravel Sanctum, PHP 8.3+
- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- Base de datos: PostgreSQL
- Mapas: Leaflet y React Leaflet
- Documentos: jsPDF para reportes/formularios en frontend
- Arquitectura: multi-albergue mediante `shelter_id`

## Modulos

- Autenticacion y perfiles de usuario.
- Registro de personas naturales y albergues.
- Revision de albergues por super administrador.
- Gestion de animales por albergue.
- Solicitudes de adopcion y cambio de estados.
- Donaciones con metodos de pago, vouchers y exportacion CSV.
- Gastos y documentos de sustento.
- Paginas publicas de refugios, animales y transparencia.
- Publicaciones de mascotas perdidas y encontradas con revision administrativa.
- Panel de super administrador para albergues, usuarios y publicaciones.
- Panel de administrador de albergue para dashboard, animales, adopciones, donaciones, gastos y configuracion.

## Roles

- `super_admin`: revisa albergues, usuarios y publicaciones globales.
- `shelter_admin`: administra la informacion de su albergue, animales, adopciones, donaciones, gastos y configuracion.
- `natural_person`: adopta, dona y publica mascotas perdidas o encontradas.

## Estructura del repositorio

```text
.
├── backend-laravel/     # API REST, modelos, migraciones, seeders y tests
├── frontend-next/       # Aplicacion Next.js
└── README.md            # Guia general del proyecto
```

## Requisitos

- PHP 8.3 o superior
- Composer 2.x
- Node.js 20 o superior
- npm 10 o superior
- PostgreSQL 14 o superior

## Configuracion del backend

Desde la raiz del repositorio:

```bash
cd backend-laravel
composer install
copy .env.example .env
php artisan key:generate
```

Edita `.env` con los datos de PostgreSQL:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=refugio360_saas
DB_USERNAME=postgres
DB_PASSWORD=

APP_URL=http://127.0.0.1:8000
FRONTEND_URL=http://localhost:3000
```

Ejecuta migraciones:

```bash
php artisan migrate
```

Opcionalmente carga datos de prueba:

```bash
php artisan db:seed
```

El `DatabaseSeeder` ejecuta `StressTestSeeder`. Tambien existen seeders especificos que puedes correr manualmente:

```bash
php artisan db:seed --class=SuperAdminSeeder
php artisan db:seed --class=TestDataSeeder
```

Credenciales de prueba incluidas en los seeders:

| Rol | Email | Password |
| --- | --- | --- |
| Super admin | `admin@tuapp.com` | `ClaveSegura123!` |
| Admin albergue | `admin@huellitasfelices.com` | `ClaveSegura123!` |
| Admin albergue | `admin@patitasalrescate.com` | `ClaveSegura123!` |
| Persona natural | `usuario.prueba@test.com` | `ClaveSegura123!` |

Inicia el backend:

```bash
php artisan serve
```

La API quedara disponible en `http://127.0.0.1:8000/api/v1`.

## Configuracion del frontend

En otra terminal:

```bash
cd frontend-next
npm install
copy .env.local.example .env.local
npm run dev
```

El archivo `.env.local` debe apuntar al backend local:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
NEXT_PUBLIC_STORAGE_URL=http://127.0.0.1:8000/storage
```

El frontend quedara disponible en `http://localhost:3000`.

## Rutas web principales

### Publicas

- `/`: pagina inicial.
- `/adoptar`: catalogo publico de animales.
- `/adoptar/[id]`: detalle de animal y postulacion.
- `/refugios`: listado publico de refugios.
- `/refugios/[slug]`: perfil publico de un refugio.
- `/refugios/[slug]/animales`: animales de un refugio.
- `/refugios/[slug]/animales/[animalId]`: detalle de animal dentro de un refugio.
- `/refugios/[slug]/transparencia`: donaciones, gastos y transparencia del refugio.
- `/donar`: flujo publico de donacion.
- `/transparencia`: vista general de transparencia.
- `/mascotas/perdidas`: publicaciones de mascotas perdidas.
- `/mascotas/encontradas`: publicaciones de mascotas encontradas.
- `/login`: inicio de sesion.
- `/registro`: seleccion de tipo de registro.
- `/registro/persona`: registro de persona natural.
- `/registro/albergue`: registro de albergue.
- `/terminos-condiciones`: terminos y condiciones.
- `/espera-aprobacion`: estado para albergues pendientes.

### Cuenta de usuario

- `/cuenta`: resumen de cuenta.
- `/cuenta/adopciones`: solicitudes de adopcion del usuario.
- `/cuenta/donaciones`: donaciones del usuario.
- `/cuenta/mascotas-perdidas`: publicaciones propias de mascotas perdidas.
- `/cuenta/mascotas-perdidas/nueva`: nueva publicacion de mascota perdida.
- `/cuenta/mascotas-encontradas`: publicaciones propias de mascotas encontradas.
- `/cuenta/mascotas-encontradas/nueva`: nueva publicacion de mascota encontrada.
- `/perfil`: perfil personal.

### Administracion de albergue

- `/admin/dashboard`: metricas y actividad del albergue.
- `/admin/animales`: gestion de animales.
- `/admin/animales/nuevo`: registro de animal.
- `/admin/animales/[id]`: edicion de animal.
- `/admin/adopciones`: solicitudes de adopcion.
- `/admin/donaciones`: donaciones recibidas.
- `/admin/gastos`: gastos registrados.
- `/admin/configuracion`: perfil, ubicacion, sponsors y metodos de pago.
- `/admin/documentacion`: documentacion administrativa.

### Super administrador

- `/superadmin`: panel base.
- `/superadmin/dashboard`: metricas globales.
- `/superadmin/albergues`: gestion de albergues.
- `/superadmin/albergues/pendientes`: revision de solicitudes de albergue.
- `/superadmin/usuarios`: gestion de usuarios.
- `/superadmin/publicaciones`: revision de publicaciones.
- `/superadmin/publicaciones/perdidas`: publicaciones de mascotas perdidas.
- `/superadmin/publicaciones/encontradas`: publicaciones de mascotas encontradas.

## Endpoints principales de la API

La API usa el prefijo `/api/v1`.

- `POST /auth/register/persona`
- `POST /auth/register/albergue`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/logout`
- `GET /animals`
- `POST /animals`
- `GET /adoptions/mine`
- `POST /adoptions`
- `GET /donations/mine`
- `POST /donations`
- `GET /lost-found-posts`
- `POST /lost-found-posts`
- `GET /public/shelters`
- `GET /public/shelters/{slug}`
- `GET /public/shelters/{slug}/animals`
- `GET /public/shelters/{slug}/transparency`
- `GET /admin/dashboard/stats`
- `GET /admin/donations/export.csv`
- `GET /superadmin/dashboard`
- `GET /superadmin/shelters`
- `GET /superadmin/users`

Las rutas privadas usan Laravel Sanctum y validan roles con middleware.

## Comandos utiles

Backend:

```bash
cd backend-laravel
php artisan test
php artisan migrate:fresh --seed
php artisan route:list
```

Frontend:

```bash
cd frontend-next
npm run lint
npm run build
```

## Notas operativas

- Los datos estan segmentados por albergue mediante `shelter_id`.
- Algunos modelos usan soft deletes para permitir recuperacion desde base de datos.
- Los albergues tienen `slug` unico para sus paginas publicas.
- Los albergues registrados por la web quedan pendientes hasta aprobacion del `super_admin`.
- Las publicaciones de mascotas perdidas/encontradas pueden requerir revision antes de mostrarse publicamente.
- Para servir archivos subidos desde Laravel, puede ser necesario ejecutar `php artisan storage:link`.
