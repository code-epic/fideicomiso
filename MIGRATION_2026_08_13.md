# Migración de Cambios - Fideicomiso
# Fecha: 2026-08-13
# Sesión de desarrollo: Correcciones de cierre semestral, comprobantes y consultainversiones

---

## 1. ARCHIVOS MODIFICADOS

### 1.1 Consulta de Inversiones (consultainversiones)
| Archivo | Cambio |
|---------|--------|
| `src/app/pages/principal/inversiones/consultainversiones/consultainversiones.component.ts` | Filtros avanzados, debounce, validaciones |
| `src/app/pages/principal/inversiones/consultainversiones/consultainversiones.component.html` | Panel de filtros, pipe resaltado |
| `src/app/pages/principal/inversiones/consultainversiones/consultainversiones.component.scss` | Estilos para resultados y resaltado |
| `src/app/pages/principal/inversiones/consultainversiones/resaltar.pipe.ts` | **NUEVO** - Pipe para resaltar texto |

### 1.2 Cierre Semestral (ccierre)
| Archivo | Cambio |
|---------|--------|
| `src/app/pages/principal/contabilidad/ccierre/ccierre.component.ts` | Corregir fecha fopera, no eliminar cierre diario |

### 1.3 Proceso Contables (procesocontables)
| Archivo | Cambio |
|---------|--------|
| `src/app/pages/principal/contabilidad/procesocontables/procesocontables.component.ts` | Múltiples fixes de cierre semestral |

### 1.4 Comprobante
| Archivo | Cambio |
|---------|--------|
| `src/app/pages/principal/contabilidad/comprobante/comprobante.component.ts` | Fix carga de detalle al editar |
| `src/app/pages/principal/contabilidad/comprobante/comprobante.component.html` | Deshabilitar edición de fechas |

### 1.5 Utilidades
| Archivo | Cambio |
|---------|--------|
| `src/app/services/util/util.service.ts` | Fix ConvertirFechaDB para formato YYYY-MM-DD |

### 1.6 Environment
| Archivo | Cambio |
|---------|--------|
| `src/environments/environment.ts` | Agregado CONSULTAR_COMPROBANTE_SEMESTRAL |
| `src/environments/environment.prod.ts` | Agregado CONSULTAR_COMPROBANTE_SEMESTRAL |

### 1.7 Módulo
| Archivo | Cambio |
|---------|--------|
| `src/app/layouts/admin-layout/admin-layout.module.ts` | Import y declaración de ResaltarPipe |

---

## 2. APIs MODIFICADAS

### 2.1 APIs Nuevas
| API | Función | Descripción |
|-----|---------|-------------|
| `CONSULTAR_COMPROBANTE_SEMESTRAL` | `FID_CComprobanteSemestral` | Buscar comprobante semestral existente por fecha |

### 2.2 APIs Existentes con Cambios de Parámetros
| API | Función | Cambio |
|-----|---------|--------|
| `CONSULTAR_MOVIMIENTOS_SEMESTRALES` | `FID_CMovimientosSemestrales` | Ahora recibe 2 parámetros: `fecha,1` |

---

## 3. STORED PROCEDURES REQUERIDOS

### 3.1 FID_CComprobanteSemestral (NUEVO)
```sql
CREATE PROCEDURE FID_CComprobanteSemestral(IN p_fecha DATE)
BEGIN
    SELECT id, descripcion, debe, haber, llave, fecha_operacion
    FROM fideicomiso.comprobante
    WHERE llave = 'S' AND fecha_operacion = p_fecha
    ORDER BY id DESC
    LIMIT 1;
END
```

### 3.2 FID_DCierreSemestral (PROBLEMA IDENTIFICADO)
**Problema:** Este stored procedure elimina TODOS los saldos para una fecha, no solo los semestrales.

**Solución temporal:** Se eliminó la llamada a este stored procedure en el código Angular.

**Solución permanente (requiere modificar en servidor):**
```sql
-- Modificar para que solo elimine saldos con llave='S'
CREATE PROCEDURE FID_DCierreSemestral(IN p_fecha DATE)
BEGIN
    DELETE FROM fideicomiso.saldos 
    WHERE fecha_cierre = p_fecha AND llave = 'S';
END
```

---

## 4. CAMBIOS EN LÓGICA DE NEGOCIO

### 4.1 Cierre Semestral
**ANTES:**
1. `FID_DCierreSemestral` eliminaba TODOS los saldos de la fecha
2. `FID_ISaldosCierzal` creaba nuevos saldos
3. Resultado: Se perdía el cierre diario

**DESPUÉS:**
1. `FID_ISaldosCierzal` crea saldos semestrales sin eliminar el diario
2. Resultado: Se mantienen ambos cierres

### 4.2 Fecha del Cierre Semestral
**ANTES:**
```typescript
fopera = fultimo  // "2026-06-29" (incorrecto)
```

**DESPUÉS:**
```typescript
let f = new Date(fopera);
f.setDate(f.getDate() - 1);
fopera = f.toISOString().split('T')[0]  // "2026-06-30" (correcto)
```

### 4.3 Generación de Comprobante Semestral
**ANTES:**
- Se creaban múltiples comprobantes duplicados
- `Comprobante.haber` no reflejaba el total real

**DESPUÉS:**
- Se verifica si ya existe comprobante y se elimina antes de crear uno nuevo
- `Comprobante.haber = debe` (total después del asiento de balanceo)
- Botón deshabilitado durante procesamiento

### 4.4 ConvertirFechaDB
**ANTES:**
- Solo manejaba formato DD/MM/YYYY
- Fallaba con formato YYYY-MM-DD

**DESPUÉS:**
- Detecta formato YYYY-MM-DD y retorna directamente
- Continúa manejando DD/MM/YYYY

---

## 5. COMMITRES REALIZADOS

```
7a89918 fix(ccierre): no eliminar cierre diario al hacer cierre semestral
2be1ff5 fix(ccierre): corregir fecha fopera en cierre semestral
c0db35b fix(cierre-semestral): normalizar fecha en ValidarPreCierreSemestral
8d34dc3 fix(cierre-semestral): buscar comprobante existente con FID_CComprobantes
709ce04 fix(cierre-semestral): eliminar comprobante existente antes de crear nuevo
ad23e08 fix(cierre-semestral): haber correcto y evitar duplicados
eefd598 fix(cierre-semestral): agregar segundo parametro a FID_CMovimientosSemestrales
8b37cda fix(cierre-semestral): lstData reset y haber correcto
2aa90cf fix: ConvertirFechaDB y cierre semestral
ee3ac7c fix(comprobante): convertir cuenta a string antes de trim en eliminar
2aecd02 fix(comprobante): deshabilitar edicion de fechas y sincronizar saldos
1c1bcb6 fix(comprobante): corregir carga de detalle al editar
4eeb3dd feat(consultainversiones): agregar filtros avanzados y pipe resaltar
```

---

## 6. SQL DE LIMPIEZA (Ejecutar en servidor Banfanb)

### 6.1 Eliminar comprobantes semestrales duplicados
```sql
-- Eliminar detalle de comprobantes duplicados
DELETE FROM fideicomiso.detalle_comprobante 
WHERE id_comprobante IN (
    SELECT id FROM fideicomiso.comprobante 
    WHERE llave = 'S' AND fecha_operacion = '2026-06-30' 
    AND id NOT IN (
        SELECT MAX(id) FROM fideicomiso.comprobante 
        WHERE llave = 'S' AND fecha_operacion = '2026-06-30'
    )
);

-- Eliminar comprobantes duplicados
DELETE FROM fideicomiso.comprobante 
WHERE llave = 'S' AND fecha_operacion = '2026-06-30' 
AND id NOT IN (
    SELECT MAX(id) FROM fideicomiso.comprobante 
    WHERE llave = 'S' AND fecha_operacion = '2026-06-30'
);
```

### 6.2 Eliminar saldos duplicados
```sql
-- Eliminar saldos duplicados manteniendo solo el primero por fecha, llave y cuenta
DELETE s1 FROM fideicomiso.saldos s1
INNER JOIN fideicomiso.saldos s2
WHERE s1.fecha_cierre = s2.fecha_cierre
  AND s1.llave = s2.llave
  AND s1.id_cuenta = s2.id_cuenta
  AND s1.id > s2.id;
```

---

## 7. NOTAS PARA MIGRACIÓN

1. **Servidor de Banfanb:** Crear o modificar stored procedures según la sección 3
2. **Ejecutar SQL de limpieza:** Sección 6
3. **Compilar Angular:** `npm run build:prod`
4. **Probar flujo completo:**
   - Cierre diario
   - Cierre semestral
   - Generación de comprobante semestral
   - Visualización en /generalyresultado
