# Pendientes — Cierre Semestral 2026-06-30

Diagnóstico de preparación para el cierre semestral (verificado el 2026-08-04).
Estado: **NO listo**. El flujo semestral no se activaría para 2026-06-30.

## 1. Fechas semestrales hardcodeadas (crítico)

### `src/app/pages/principal/contabilidad/procesocontables/procesocontables.component.ts`
- Líneas ~395 y ~438: `ValidarPreCierre` solo reconoce
  `'2024-12-31' || '2024-06-30' || '2025-12-31'`.
- Faltan: `'2025-06-30'`, `'2026-06-30'`, `'2026-12-31'`.
- Recomendación: reemplazar la lista fija por detección dinámica usando
  `this.cierre.getSemestral(fecha)` en vez de comparar strings literales.

### `src/app/pages/principal/contabilidad/ccierre/ccierre.component.ts`
- Línea ~196: `CrearSemestral()` llama `FID_DCierreSemestral` con parámetro
  fijo `'2025-12-31'`. Esto borraría el cierre anterior, no el cierre objetivo.
- Corregir para que use la fecha real del cierre semestral (p. ej. `2026-06-30`).

## 2. APIs desactivadas en MongoDB (colección `apicore`)

- `FID_IComprobante` → `estatus: false` (debe ser `true`).
- `FID_IDetalleComprobante` → `estatus: false` (debe ser `true`).
- Son las APIs que usan `Acepar()` / `GuardarDetalle()` para insertar el asiento
  del cierre semestral (74/75 → 734).
- Nota adicional: `FID_IMovimientosComprobantes` tiene `metodo: CONSULTAR` pero
  ejecuta `INSERT`. Cambiar a `INSERTAR` por consistencia.

## 3. Menú/Ruta del cierre apunta a un stub

- El menú "Cierre Contable" (en `sys-schema` de la app `fideicomiso`) apunta a `/cierre`.
- `/cierre` → `CierreComponent` = stub (solo muestra "cierre works!").
- La lógica real está en:
  - `CcierreComponent` en `/ccierre` (cierre contable).
  - `ProcesocontablesComponent` en `/procesocontable` (pre-cierre).
- Corregir: apuntar la ruta/menú al componente real o eliminar el stub.

## 4. Brecha de datos (precondición)

- Último cierre en `saldos`: `2026-05-18`.
- Último movimiento en `movimientos`: `2026-05-19`.
- Último comprobante: `2026-05-19`.
- Para cerrar el semestre al 2026-06-30 faltan los precierres diarios del
  **20-may → 30-jun** (~41 días).
- Sin esos datos, `FID_CUltimoPrecierre` devolverá una fecha anterior y
  `ValidarPreCierre` bloqueará con "Tiene pendiente el cierre del anterior".

## 5. Soporte multi-plan (diferido)

- Se desarrolló soporte para múltiples planes (`ccierre.component.ts`,
  `procesocontables.component.ts` y `environment.ts` / `environment.prod.ts`).
- **Decisión 2026-08-07**: se revirtió; el cierre semestral vuelve a usar el
  plan fijo `1`. Implementar el soporte multi-plan real queda como tarea
  pendiente (ver Actualización 2026-08-07).

## Checklist para dejar listo el sistema

1. [x] Definir la fecha objetivo del cierre semestral (2026-06-30).
2. [x] Actualizar las fechas hardcodeadas en `procesocontables.component.ts` y `ccierre.component.ts`.
3. [x] Activar `FID_IComprobante` y `FID_IDetalleComprobante` en `apicore` (`estatus: true`).
4. [ ] Corregir el menú/ruta para que "Cierre Contable" apunte a `CcierreComponent`.
5. [x] Verificar que existan movimientos y precierres hasta el 2026-06-30.
6. [x] Revertir el soporte multi-plan (queda como tarea pendiente; cierre a plan fijo `1`).
7. [ ] Probar el flujo completo en un ambiente de pruebas antes de producción.
8. [ ] Implementar soporte multi-plan (diferido por decisión del usuario).

## Actualización 2026-08-05

Ejecutados los puntos 1, 2, 3, 5 y 6 del checklist (el 4 queda fuera de alcance).

### Punto 3 — APIs del cierre activadas

Actualizadas en `apicore` (MongoDB local, colección `apicore`):

| Funcion | Cambio |
|---------|--------|
| `FID_IComprobante` | `estatus: false` → `true` |
| `FID_IDetalleComprobante` | `estatus: false` → `true` |
| `FID_IMovimientosComprobantes` | `metodo: CONSULTAR` → `INSERTAR` (consistencia: ejecuta INSERT) |

Esto desbloquea `Acepar()` / `GuardarDetalle()` para insertar el asiento del
cierre semestral.

### Punto 2 — detección dinámica de fechas semestrales

- `procesocontables.component.ts` (`ValidarPreCierre`, líneas 395 y 438): se
  reemplazó la lista fija `'2024-12-31' || '2024-06-30' || '2025-12-31'` por
  `this.cierre.getSemestral(this.util.ConvertirFechaHumana(fechaAPrecerrar))`.
  Detecta automáticamente 30/06 y 31/12 de cualquier año (incluye `2026-06-30`).
- `ccierre.component.ts` (`CrearSemestral`): `FID_DCierreSemestral` ahora recibe
  la fecha real del cierre semestral derivada de `this.fechaultimo` en vez del
  valor fijo `2025-12-31`.

### Punto 5 — verificación de datos (brecha)

Verificación sobre la BD local `fideicomiso` (read-only, 2026-08-05):

| Dato | Resultado |
|------|-----------|
| Último cierre en `saldos` | `2026-05-18` |
| Movimientos 2026-05-19 → 2026-06-30 | 34 (todos el `2026-05-19`) |
| Comprobantes 2026-05-19 → 2026-06-30 | 12 (todos el `2026-05-19`) |
| Cierres en `saldos` (20-may → 30-jun) | 0 |

**Conclusión**: existe una brecha del **20-may → 30-jun (~41 días)** sin
precierres ni cierres. Por decisión del usuario no se reprocesan los datos en
esta tarea; el cierre semestral real al 2026-06-30 queda pendiente hasta
completar esos precierres diarios. Además, el asiento del cierre semestral
(`Acepar` → `FID_IComprobante`, `GuardarDetalle` → `FID_IDetalleComprobante`)
no podrá completarse mientras esas APIs estén `estatus: false` (punto 3).

### Punto 6 — trabajo multi-plan (REVERTIDO)

Por decisión del usuario se elimina el soporte multi-plan (no se agrega);
queda como tarea pendiente. Ver Actualización 2026-08-07.

## Actualización 2026-08-07

### Punto 6 — soporte multi-plan revertido

Por decisión del usuario se elimina el soporte multi-plan; queda como tarea
pendiente (checklist ítem 8). Revertido a plan fijo `1`:

- `ccierre.component.ts` `CrearSaldos`: vuelve al plan fijo `1` (llamada directa
  a `FID_ISaldosCierre`, sin `ConsultarDatos` ni recorrido de planes).
- `procesocontables.component.ts`: `iniciarComprobante(fecha)` a plan `1`,
  `consultarValoresSemestrales` en un solo plan (sin `procesarCierreSemestral`);
  `GuardarDetalle` escribe plan `1`.
- `environment.ts` / `environment.prod.ts`: eliminado `CONSULTAR_PLANES`.

Se mantiene la detección dinámica de fechas semestrales (`getSemestral`,
`CrearSemestral` con fecha derivada de `fechaultimo`). Compilado de `dist/`
actualizado. `data/01AGO2026.sql` (dump de 97MB) sigue excluido vía `.gitignore`
(`/data`).
