# Migración de Cambios - Fideicomiso
# Fecha: 2026-08-13
# Sesión de desarrollo: Correcciones de cierre semestral, comprobantes y consultainversiones

---

## 1. ARCHIVOS MODIFICADOS EN ANGULAR

### 1.1 Consulta de Inversiones
| Archivo | Descripción |
|---------|-------------|
| `src/app/pages/principal/inversiones/consultainversiones/consultainversiones.component.ts` | Filtros avanzados, debounce, validaciones |
| `src/app/pages/principal/inversiones/consultainversiones/consultainversiones.component.html` | Panel de filtros, pipe resaltado |
| `src/app/pages/principal/inversiones/consultainversiones/consultainversiones.component.scss` | Estilos para resultados |
| `src/app/pages/principal/inversiones/consultainversiones/resaltar.pipe.ts` | **NUEVO** - Pipe para resaltar texto |

### 1.2 Cierre Semestral
| Archivo | Descripción |
|---------|-------------|
| `src/app/pages/principal/contabilidad/ccierre/ccierre.component.ts` | Corregir fecha fopera para cierre semestral |

### 1.3 Proceso Contables
| Archivo | Descripción |
|---------|-------------|
| `src/app/pages/principal/contabilidad/procesocontables/procesocontables.component.ts` | Fixes de cierre semestral |

### 1.4 Comprobante
| Archivo | Descripción |
|---------|-------------|
| `src/app/pages/principal/contabilidad/comprobante/comprobante.component.ts` | Fix carga de detalle al editar |
| `src/app/pages/principal/contabilidad/comprobante/comprobante.component.html` | Deshabilitar edición de fechas |

### 1.5 Utilidades
| Archivo | Descripción |
|---------|-------------|
| `src/app/services/util/util.service.ts` | Fix ConvertirFechaDB para formato YYYY-MM-DD |

### 1.6 Environment
| Archivo | Descripción |
|---------|-------------|
| `src/environments/environment.ts` | Agregado CONSULTAR_COMPROBANTE_SEMESTRAL |
| `src/environments/environment.prod.ts` | Agregado CONSULTAR_COMPROBANTE_SEMESTRAL |

### 1.7 Módulo
| Archivo | Descripción |
|---------|-------------|
| `src/app/layouts/admin-layout/admin-layout.module.ts` | Import y declaración de ResaltarPipe |

---

## 2. APIs A MODIFICAR/CREAR

### 2.1 Nueva API
| Nombre | Stored Procedure | Parámetros | Descripción |
|--------|------------------|------------|-------------|
| `CONSULTAR_COMPROBANTE_SEMESTRAL` | `FID_CComprobanteSemestral` | `fecha DATE` | Buscar comprobante semestral existente |

### 2.2 API Existentes
| Nombre | Stored Procedure | Cambio |
|--------|------------------|--------|
| `CONSULTAR_MOVIMIENTOS_SEMESTRALES` | `FID_CMovimientosSemestrales` | Ahora recibe 2 parámetros: `fecha,plan` |

---

## 3. CAMBIOS EN LÓGICA

### 3.1 ConvertirFechaDB (util.service.ts)
**Problema:** No manejaba formato YYYY-MM-DD
**Solución:** Agregada detección de formato YYYY-MM-DD

```typescript
// ANTES
ConvertirFechaDB(f: any): string {
    if (typeof f != "object") {
        const fx = f.split("/");  // Fallaba con YYYY-MM-DD
        ...
    }
}

// DESPUÉS
ConvertirFechaDB(f: any): string {
    if (typeof f != "object") {
        if (/^\d{4}-\d{2}-\d{2}$/.test(f)) {
            return f;  // Ya está en formato correcto
        }
        const fx = f.split("/");
        ...
    }
}
```

### 3.2 Fecha Cierre Semestral (ccierre.component.ts)
**Problema:** `fopera` se establecía como la fecha del último cierre diario
**Solución:** Calcular `fopera` restando 1 día a `fechai`

```typescript
// ANTES
if (llave == 'S') {
    fopera = fultimo  // "2026-06-29"
}

// DESPUÉS
if (llave == 'S') {
    let f = new Date(fopera);
    f.setDate(f.getDate() - 1);
    fopera = f.toISOString().split('T')[0]  // "2026-06-30"
}
```

### 3.3 Comprobante Semestral (procesocontables.component.ts)
**Cambios:**
- `Comprobante.haber = debe` (total después del asiento de balanceo)
- `lstData = []` al inicio para evitar acumulación
- Verificar comprobante existente antes de crear nuevo
- Botón deshabilitado durante procesamiento (`procesando`)

### 3.4 Carga de Detalle al Editar (comprobante.component.ts)
**Problema:** `ev.cuenta = ev.detalle` (campo inexistente)
**Solución:** Eliminar swap innecesario de campos

```typescript
// ANTES
this.ELEMENT_DATA = JSON.parse(e.definicion).map((ev) => {
    ev.fecha = e.fecha_operacion;
    ev.codigo = ev.cuenta;
    ev.cuenta = ev.detalle;  // BUG: campo inexistente
    return ev;
});

// DESPUÉS
this.ELEMENT_DATA = JSON.parse(e.definicion).map((ev) => {
    ev.fecha = e.fecha_operacion;
    return ev;
});
```

---

## 4. SQL DE LIMPIEZA (Ejecutar en servidor Banfanb)

### 4.1 Eliminar comprobantes semestrales duplicados (2026-06-30)
```sql
-- Primero eliminar detalle
DELETE FROM fideicomiso.detalle_comprobante 
WHERE id_comprobante IN (
    SELECT id FROM fideicomiso.comprobante 
    WHERE llave = 'S' AND fecha_operacion = '2026-06-30' 
    AND id NOT IN (
        SELECT MAX(id) FROM fideicomiso.comprobante 
        WHERE llave = 'S' AND fecha_operacion = '2026-06-30'
    )
);

-- Luego eliminar comprobantes
DELETE FROM fideicomiso.comprobante 
WHERE llave = 'S' AND fecha_operacion = '2026-06-30' 
AND id NOT IN (
    SELECT MAX(id) FROM fideicomiso.comprobante 
    WHERE llave = 'S' AND fecha_operacion = '2026-06-30'
);
```

### 4.2 Eliminar saldos duplicados
```sql
DELETE s1 FROM fideicomiso.saldos s1
INNER JOIN fideicomiso.saldos s2
WHERE s1.fecha_cierre = s2.fecha_cierre
  AND s1.llave = s2.llave
  AND s1.id_cuenta = s2.id_cuenta
  AND s1.id > s2.id;
```

---

## 5. COMMITS REALIZADOS

```
0417bae Revert "fix(ccierre): no eliminar cierre diario al hacer cierre semestral"
223f1ab Reapply "docs: agregar archivo de migracion con APIs modificadas"
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

## 6. INSTRUCCIONES DE MIGRACIÓN

1. **Ejecutar SQL de limpieza en servidor Banfanb** (sección 4)

2. **Copiar archivos Angular modificados** (sección 1)

3. **Compilar:** `npm run build:prod`

4. **Probar flujo completo:**
   - Consulta de inversiones con filtros
   - Cierre diario
   - Cierre semestral
   - Generación de comprobante semestral
   - Visualización en /generalyresultado
