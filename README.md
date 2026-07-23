# Refugio360 SaaS

Plataforma web SaaS multi-albergue para la gestión de animales rescatados, adopciones, donaciones y transparencia económica.

## Tecnologías

- Frontend: Next.js + Tailwind CSS
- Backend: Laravel API REST
- Base de datos: PostgreSQL
- Arquitectura: SaaS multi-albergue mediante shelter_id

## Estructura

- backend-laravel: API del sistema
- frontend-next: interfaz web pública y panel administrativo
- database: scripts y documentación de base de datos
- docs: documentación del proyecto

## Módulos principales

- Autenticación
- Gestión de albergues
- Gestión de animales
- Solicitudes de adopción
- Donaciones con voucher
- Dashboard de transparencia

## Requisitos y versiones recomendadas

Para evitar errores de compatibilidad, se recomienda usar:

- PHP: 8.5.7 o superior (este proyecto se probó con PHP 8.5.7)
- Laravel: 13.x
- Node.js: 20.x o superior
- Composer: 2.x
- npm: 10.x o superior

Si tu entorno usa una versión anterior de PHP, Laravel puede fallar al iniciar porque requiere una versión compatible con las dependencias del proyecto.

## Ejecutar el proyecto

Si ya ejecutaste `composer install` en la carpeta incorrecta, ten en cuenta que ese comando corresponde al backend, no al frontend.

### 1) Backend (Laravel)

Abre una terminal y ejecuta:

```bash
cd backend-laravel
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

El backend quedará disponible en `http://127.0.0.1:8000`.

### 2) Frontend (Next.js)

Abre otra terminal y ejecuta:

```bash
cd frontend-next
copy .env.local.example .env.local
npm install
npm run dev
```

El frontend quedará disponible en `http://localhost:3000`.

El archivo `.env.local` configura la URL del backend para que el frontend pueda consumir la API en `http://127.0.0.1:8000/api/v1`.

## Rutas para ver las vistas

El frontend está construido con Next.js y las vistas se acceden desde `http://localhost:3000`.

### Vistas públicas

- `/` - página inicial del frontend
- `/adoptar` - catálogo público de animales disponibles y en proceso
- `/adoptar/:id` - detalle de un animal y formulario de postulación a adopción

### Vistas administrativas

- `/admin/dashboard` - panel principal con métricas y actividad reciente
- `/admin/animales` - listado de animales registrados
- `/admin/animales?status=apto_adopcion` - filtro del listado de animales por estado
- `/admin/animales/nuevo` - formulario para registrar un animal
- `/admin/animales/:id` - edición de un animal existente
- `/admin/albergues` - listado de albergues
- `/admin/albergues/nuevo` - formulario para crear un albergue
- `/admin/albergues/:id/editar` - edición de un albergue existente
- `/admin/adopciones` - listado de solicitudes de adopción
- `/admin/adopciones?status=pendiente` - filtro de solicitudes por estado

### Ejemplos rápidos

- Ver catálogo público: `http://localhost:3000/adoptar`
- Ver dashboard: `http://localhost:3000/admin/dashboard`
- Ver solicitudes: `http://localhost:3000/admin/adopciones`
- Ver formulario de nuevo animal: `http://localhost:3000/admin/animales/nuevo`

# Funcionamiento del Sistema

**Refugio360** es una plataforma web para la gestión de albergues de animales y procesos de adopción. El sistema está compuesto por un **backend en Laravel** que expone una API REST y un **frontend en Next.js** que consume dicha API para administrar la información.

## Módulos principales

### Gestión de Albergues

Permite registrar, consultar, editar, activar/desactivar y eliminar albergues. Cada albergue puede tener múltiples animales y solicitudes de adopción asociadas.

### Gestión de Adopciones

Permite visualizar y administrar las solicitudes de adopción. Las solicitudes pasan por distintos estados (Pendiente, Evaluación, Aprobado, Rechazado y Adoptado). Cuando una adopción es marcada como **Adoptada**, el estado del animal se actualiza automáticamente.

### Dashboard Administrativo

Proporciona estadísticas generales del sistema, incluyendo cantidad de animales por estado, solicitudes de adopción, albergues registrados y adopciones recientes, facilitando el monitoreo de la operación.

## Flujo general

```text
Albergue
    ↓
Registro de animales
    ↓
Solicitud de adopción
    ↓
Evaluación
    ↓
Aprobado / Rechazado
    ↓
Adoptado
```

## Arquitectura

```text
Frontend (Next.js)
        ↓
    API REST
     (Laravel)
        ↓
 Base de Datos
```

## Consideraciones

- Los albergues y adopciones utilizan **Soft Deletes**, por lo que los registros eliminados pueden recuperarse desde la base de datos.
- Los albergues poseen un **slug único** para identificación y acceso.
- Actualmente el proyecto no cuenta con autenticación habilitada; para producción se recomienda proteger las rutas mediante Laravel Sanctum.
