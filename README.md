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

* Los albergues y adopciones utilizan **Soft Deletes**, por lo que los registros eliminados pueden recuperarse desde la base de datos.
* Los albergues poseen un **slug único** para identificación y acceso.
* Actualmente el proyecto no cuenta con autenticación habilitada; para producción se recomienda proteger las rutas mediante Laravel Sanctum.
