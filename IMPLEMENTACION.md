# Refugio360 — Nuevos Módulos: Guía de Implementación

## Resumen de cambios

| Módulo | Tipo | Archivos |
|---|---|---|
| Gestión de albergues | Backend + Frontend | `ShelterController.php`, `app/admin/albergues/**` |
| Listado de adopciones | Frontend | `app/admin/adopciones/**` |
| Panel administrativo | Frontend | `app/admin/dashboard/page.tsx`, `app/admin/layout.tsx` |
| Visualización de estados | Frontend | Badges + Progress bars en dashboard y adopciones |
| API extendida | Backend | `routes/api.php`, `DashboardController.php` |

---

## 1. Archivos Backend a copiar

```
app/Http/Controllers/Api/ShelterController.php   ← nuevo
app/Http/Controllers/Api/DashboardController.php  ← nuevo
routes/api.php                                    ← reemplazar
```

### Verificar que el modelo Shelter tenga `withCount` disponible
El modelo ya usa `HasFactory` y `SoftDeletes`. No requiere cambios.

---

## 2. Archivos Frontend a copiar

```
src/lib/api.ts                                        ← reemplazar
src/types/shelter.ts                                  ← reemplazar (agrega campos)
src/types/dashboard.ts                                ← nuevo
src/app/admin/layout.tsx                              ← nuevo (sidebar)
src/app/admin/dashboard/page.tsx                      ← nuevo
src/app/admin/albergues/page.tsx                      ← nuevo
src/app/admin/albergues/ShelterActions.tsx            ← nuevo
src/app/admin/albergues/nuevo/page.tsx                ← nuevo
src/app/admin/albergues/[id]/editar/page.tsx          ← nuevo
src/app/admin/albergues/[id]/editar/EditShelterForm.tsx ← nuevo
src/app/admin/adopciones/page.tsx                     ← nuevo
src/app/admin/adopciones/AdoptionStatusUpdater.tsx    ← nuevo
```

---

## 3. API Reference — Endpoints nuevos

### Albergues

| Método | URL | Descripción |
|---|---|---|
| `GET` | `/api/v1/shelters` | Listar albergues (con `?only_active=true`) |
| `POST` | `/api/v1/shelters` | Crear albergue |
| `GET` | `/api/v1/shelters/{id}` | Ver albergue con stats |
| `PUT` | `/api/v1/shelters/{id}` | Actualizar albergue |
| `DELETE` | `/api/v1/shelters/{id}` | Eliminar (soft delete) |
| `PATCH` | `/api/v1/shelters/{id}/toggle` | Activar/desactivar |

#### Payload POST/PUT albergue
```json
{
  "name": "Refugio Los Andes",
  "slug": "refugio-los-andes",
  "description": "Albergue municipal de Huánuco",
  "email": "contacto@refugio.pe",
  "phone": "987654321",
  "is_active": true
}
```

### Dashboard

| Método | URL | Descripción |
|---|---|---|
| `GET` | `/api/v1/dashboard/stats` | Estadísticas globales |

#### Respuesta `dashboard/stats`
```json
{
  "animals": {
    "total": 12,
    "apto": 5,
    "cuarentena": 3,
    "tratamiento": 2,
    "adoptado": 2
  },
  "adoptions": {
    "total": 8,
    "pendiente": 3,
    "evaluacion": 1,
    "aprobado": 2,
    "rechazado": 1,
    "adoptado": 1
  },
  "shelters": { "total": 2, "active": 2 },
  "recent_adoptions": [...]
}
```

---

## 4. Rutas Frontend

| URL | Descripción |
|---|---|
| `/admin/dashboard` | Panel principal con KPIs |
| `/admin/albergues` | Listado de albergues |
| `/admin/albergues/nuevo` | Formulario crear albergue |
| `/admin/albergues/{id}/editar` | Formulario editar albergue |
| `/admin/adopciones` | Listado con filtros de estado |
| `/admin/adopciones?status=pendiente` | Filtrar por estado |

---

## 5. Lista de pruebas funcionales

### 5.1 Backend — Albergues

- [ ] `POST /api/v1/shelters` con datos válidos → responde `201` con el albergue creado
- [ ] `POST /api/v1/shelters` con slug duplicado → responde `422`
- [ ] `GET /api/v1/shelters` → lista todos con `animals_count` y `adoptions_count`
- [ ] `GET /api/v1/shelters?only_active=true` → solo los activos
- [ ] `GET /api/v1/shelters/{id}` → incluye `stats` con breakdown por estado
- [ ] `PUT /api/v1/shelters/{id}` → actualiza campos, responde `200`
- [ ] `PATCH /api/v1/shelters/{id}/toggle` → invierte `is_active`
- [ ] `DELETE /api/v1/shelters/{id}` → soft delete, responde `204`
- [ ] El albergue eliminado no aparece en `GET /api/v1/shelters`

### 5.2 Backend — Dashboard

- [ ] `GET /api/v1/dashboard/stats` → responde `200` con estructura esperada
- [ ] Los conteos de `animals` suman `total`
- [ ] `recent_adoptions` tiene máx. 5 elementos
- [ ] Con BD vacía, todos los conteos son `0` y `recent_adoptions` es `[]`

### 5.3 Backend — Adopciones (existentes)

- [ ] `PATCH /api/v1/adoptions/{id}/status` con `{"status":"aprobado"}` → actualiza estado
- [ ] `PATCH /api/v1/adoptions/{id}/status` con `{"status":"adoptado"}` → también marca el animal como `adoptado`
- [ ] `GET /api/v1/adoptions?status=pendiente` → filtra correctamente

### 5.4 Frontend — Dashboard

- [ ] `/admin/dashboard` carga y muestra las 4 tarjetas KPI
- [ ] Las barras de progreso reflejan los porcentajes reales
- [ ] La sección "Adopciones recientes" muestra el nombre del animal
- [ ] Los enlaces rápidos navegan a sus páginas correctas
- [ ] Si el backend no responde, muestra mensaje de error en lugar de pantalla en blanco

### 5.5 Frontend — Albergues

- [ ] `/admin/albergues` muestra la tabla con `animals_count` y `adoptions_count`
- [ ] El badge "Activo / Inactivo" refleja `is_active`
- [ ] Botón "Desactivar/Activar" llama a `/toggle` y refresca la página
- [ ] Botón "Eliminar" pide confirmación (segundo clic) antes de borrar
- [ ] `/admin/albergues/nuevo` genera el slug automáticamente al escribir el nombre
- [ ] Enviar el formulario de nuevo albergue redirige a `/admin/albergues`
- [ ] `/admin/albergues/{id}/editar` precarga los datos del albergue
- [ ] Guardar cambios actualiza el albergue y redirige

### 5.6 Frontend — Adopciones

- [ ] `/admin/adopciones` lista todas las solicitudes
- [ ] Filtros cambian la URL y filtran las tarjetas
- [ ] Cada tarjeta muestra nombre del animal (si está disponible con `animal.name`)
- [ ] El selector de estado refleja el estado actual
- [ ] Cambiar estado + clic "Actualizar estado" muestra confirmación verde
- [ ] Actualizar a `adoptado` marcará el animal como adoptado (verificar en BD)
- [ ] Botón "✕" pide confirmación antes de eliminar la solicitud

---

## 6. Comandos de prueba rápida con curl

```bash
BASE="http://localhost:8000/api/v1"

# Crear albergue
curl -s -X POST $BASE/shelters \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"name":"Refugio Test","slug":"refugio-test","is_active":true}' | jq

# Listar albergues
curl -s $BASE/shelters | jq '.[].name'

# Dashboard stats
curl -s $BASE/dashboard/stats | jq '.animals'

# Cambiar estado adopción (id=1)
curl -s -X PATCH $BASE/adoptions/1/status \
  -H "Content-Type: application/json" \
  -d '{"status":"aprobado","notes":"Documentación verificada"}' | jq '.status'
```

---

## 7. Decisiones de diseño

**Sin autenticación en esta fase.** El sistema no tiene guards de auth activos. Para producción se recomienda añadir middleware `auth:sanctum` a las rutas `/v1/shelters` y `/v1/dashboard`.

**Multi-tenant desactivado para albergues.** El `AdoptionController` tiene un global scope que filtra por `shelter_id` del usuario autenticado. Como no hay auth activa, el scope no aplica y se ven todas las adopciones.

**Soft deletes.** `Shelter` y `Adoption` usan `SoftDeletes`. Los registros eliminados se pueden recuperar desde la BD si es necesario.

**Slug único.** El campo `slug` en albergues es único a nivel de BD. El frontend genera el slug automáticamente desde el nombre, pero el usuario puede editarlo.
