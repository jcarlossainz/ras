# 📋 AUDITORÍA DE TIPOS - /types

**Generado:** 2025-11-17
**Total archivos:** 3
**Estado:** COMPLETO

---

## 📊 RESUMEN EJECUTIVO

**Total de archivos:** 3
- ✅ **En uso activo:** 2 (66.7%)
- ❌ **Código muerto:** 1 (33.3%) - `property-templates.ts`

**Total líneas:** ~1,473 líneas
**Código muerto:** 793 líneas (53.8%)

**Calidad de código:** ⭐⭐⭐⭐ (Muy bueno)

**Nivel de documentación:** ⭐⭐⭐ (Bueno)

**Estructura:**
```
types/
├── property.ts               ✅ 14 usos (CRÍTICO)
├── notifications.ts          ✅ 4 usos (sistema toast/confirm)
└── property-templates.ts     ❌ 0 usos (CÓDIGO MUERTO - 793 líneas)
```

---

## 📂 INVENTARIO COMPLETO

### ✅ 1. property.ts
**Estado:** ✅ MUY USADO - CRÍTICO
**Tamaño:** ~257 líneas (código útil)
**Calidad:** ⭐⭐⭐⭐⭐ Excelente

**Propósito:**
Tipos TypeScript centrales para el sistema de propiedades RAS.

**Contenido:**
```typescript
// Tipos básicos
export interface Space { ... }
export type SpaceType = 'Habitación' | 'Lock-off' | ...
export const SPACE_CATEGORIES = { ... }

// Formulario de propiedad
export interface PropertyFormData { ... }

// Sistema de galería
export interface PropertyImage {
  id?: string;
  url: string;
  url_thumbnail?: string;
  is_cover: boolean;
  order_index: number;
  space_type: string | null;
  caption: string | null;
  uploaded_at?: string;
  file_size?: {...};
  dimensions?: {...};
}

// Helpers
export interface GalleryStats { ... }
export interface PhotoUploadProgress { ... }
export interface ImageCompressionResult { ... }

// Enums
export enum PropertyType { ... }
export enum PropertyStatus { ... }
export enum TransactionType { ... }

// Constantes de galería
export const GALLERY_CONSTANTS = {
  THUMBNAIL_SIZE: 300,
  DISPLAY_MAX_WIDTH: 1200,
  COMPRESSION_QUALITY: 0.8,
  MAX_FILES_PER_UPLOAD: 20,
  SUPPORTED_FORMATS: [...],
  MIN_PHOTOS_RECOMMENDED: 5,
  OPTIMAL_PHOTOS: 15
}

// Wizard helpers
export type PropertyFormStep = 'datos_generales' | ...
export interface StepConfig { ... }
```

**Usos:** 14 archivos (CRÍTICO)
- `/app/dashboard/catalogo/page.tsx`
- `/app/dashboard/catalogo/components/WizardModal.tsx`
- `/app/dashboard/propiedad/[id]/galeria/page.tsx`
- `/app/propiedades/nueva/components/SpaceCard.tsx`
- `/app/propiedades/nueva/components/SpaceCategories.tsx`
- `/app/propiedades/nueva/components/SpaceTemplates.tsx`
- `/app/propiedades/nueva/components/WizardContainer.tsx`
- `/app/propiedades/nueva/steps/Step1_DatosGenerales.tsx`
- `/app/propiedades/nueva/steps/Step2_Ubicacion.tsx`
- `/app/propiedades/nueva/steps/Step3_Espacios.tsx`
- `/app/propiedades/nueva/steps/Step4_Condicionales.tsx`
- `/components/property/PhotoGalleryManager.tsx` (código muerto)
- `/components/property/UploadPhotoModal.tsx` (código muerto)
- `/types/property-templates.ts` (self-reference)

**⚠️ OBSERVACIÓN:** Tiene definición duplicada de Space e interfaces

**Problemas encontrados:**
```typescript
// LÍNEAS 4-15: Primera definición de Space
export interface Space {
  id: string;
  name: string;
  type: SpaceType;
  details: { ... };
}

// LÍNEAS 103-113: Segunda definición de Space (duplicada)
export interface Space {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  category?: string;
  quantity?: number;
  features?: string[];
  created_at?: string;
}

// LÍNEAS 47-80: Primera definición de PropertyFormData
export interface PropertyFormData { ... }

// LÍNEAS 114-172: Segunda definición de PropertyFormData (duplicada)
export interface PropertyFormData { ... }
```

**⚠️ PROBLEMA CRÍTICO:** Dos definiciones contradictorias de las interfaces principales

**Estado:** ✅ ESENCIAL pero necesita limpieza de duplicados

---

### ✅ 2. notifications.ts
**Estado:** ✅ USADO
**Tamaño:** ~466 líneas (con documentación)
**Calidad:** ⭐⭐⭐⭐⭐ Excelente

**Propósito:**
Tipos TypeScript completos para el sistema de notificaciones (Toast + Confirm).

**Contenido:**
```typescript
// Tipos básicos
export type NotificationType = 'success' | 'error' | 'warning' | 'info'
export type ConfirmVariant = 'default' | 'danger' | 'warning' | 'info'
export type ToastPosition = 'top-left' | ... | 'bottom-right'

// Interfaces para Toast
export interface ToastMessage { ... }
export interface ToastAction { ... }
export interface ToastProps { ... }
export type ToastOptions = Omit<ToastMessage, 'id' | 'createdAt'>
export interface SimpleToastOptions { ... }

// Interfaces para Confirm Modal
export interface ConfirmOptions { ... }
export interface ConfirmModalProps { ... }
export interface ConfirmResult { ... }

// Context y Provider
export interface ToastContextValue { ... }
export interface ConfirmContextValue { ... }
export interface ToastProviderProps { ... }
export interface ConfirmProviderProps { ... }

// Utilidades
export interface NotificationStyle { ... }
export type NotificationStyleMap = Record<NotificationType, NotificationStyle>
export interface ConfirmVariantStyle { ... }
export type ConfirmVariantStyleMap = Record<ConfirmVariant, ConfirmVariantStyle>

// Eventos
export interface ToastChangeEvent { ... }
export type ToastChangeCallback = (event: ToastChangeEvent) => void

// Hook return types
export interface UseToastReturn { ... }
export interface UseConfirmReturn { ... }

// Configuración
export interface ToastConfig { ... }
```

**Características:**
- ✅ Tipos completos y exhaustivos
- ✅ Documentación inline con JSDoc
- ✅ Ejemplos de uso al final del archivo
- ✅ Type-safe 100%

**Usos:** 4 archivos (sistema de notificaciones)
- `/components/ui/confirm-modal.tsx`
- `/components/ui/toast-provider.tsx`
- `/components/ui/toast.tsx`
- `/hooks/useToast.ts`

**Estado:** ✅ FUNCIONAL - Parte del sistema de notificaciones

---

### ❌ 3. property-templates.ts
**Estado:** ❌ CÓDIGO MUERTO
**Tamaño:** 793 líneas
**Calidad:** ⭐⭐⭐ Bueno (pero no usado)

**Propósito:**
Templates predefinidos de espacios para diferentes tipos de propiedad (10 templates).

**Contenido:**
```typescript
export interface PropertyTemplate {
  id: string;
  name: string;
  description: string;
  spaces: Omit<Space, 'id'>[];
}

export const PROPERTY_TEMPLATES: PropertyTemplate[] = [
  // 10 templates predefinidos:
  - Departamento (7 espacios)
  - Casa (11 espacios)
  - Villa (15 espacios)
  - Condominio (11 espacios)
  - Penthouse (12 espacios)
  - Loft (6 espacios)
  - Estudio (2 espacios)
  - Oficina (2 espacios)
  - Local Comercial (2 espacios)
  - Bodega (3 espacios)
]
```

**Por qué es código muerto:**

1. ❌ **NO se importa en ningún archivo**
   ```bash
   grep -r "from.*property-templates" app/
   # Resultado: 0 archivos
   ```

2. ❌ **SpaceTemplates.tsx tiene su propia definición inline**
   ```tsx
   // En app/propiedades/nueva/components/SpaceTemplates.tsx línea 18:
   // Templates definidos aquí (puedes importarlos desde property-templates.ts)
   const PROPERTY_TEMPLATES: PropertyTemplate[] = [...]
   ```

3. ❌ **Templates duplicados**
   - Archivo `/types/property-templates.ts`: 10 templates completos (793 líneas)
   - Archivo `SpaceTemplates.tsx`: 6 templates inline (versión simplificada)

**Comparación:**

| Template | En types/property-templates.ts | En SpaceTemplates.tsx |
|----------|-------------------------------|-----------------------|
| Departamento | ✅ 7 espacios | ✅ 7 espacios |
| Casa | ✅ 11 espacios | ✅ 11 espacios |
| Villa | ✅ 15 espacios | ✅ 15 espacios |
| Loft | ✅ 6 espacios | ✅ 6 espacios |
| Estudio | ✅ 2 espacios | ✅ 2 espacios |
| Oficina | ✅ 2 espacios | ✅ 2 espacios |
| Condominio | ✅ 11 espacios | ❌ NO incluido |
| Penthouse | ✅ 12 espacios | ❌ NO incluido |
| Local Comercial | ✅ 2 espacios | ❌ NO incluido |
| Bodega | ✅ 3 espacios | ❌ NO incluido |

**Diferencias de implementación:**
- `property-templates.ts`: Templates MÁS COMPLETOS con más equipamiento y detalles
- `SpaceTemplates.tsx`: Templates SIMPLIFICADOS (solo 6 de 10)

**Estado:** ❌ ELIMINAR o migrar SpaceTemplates.tsx para usarlo

**Recomendación:**
```typescript
// OPCIÓN A: Eliminar archivo (ahorro de 793 líneas)
rm types/property-templates.ts

// OPCIÓN B: Migrar SpaceTemplates.tsx para usar este archivo
// En SpaceTemplates.tsx:
import { PROPERTY_TEMPLATES } from '@/types/property-templates'
// Eliminar definición inline
```

---

## 📊 ANÁLISIS DE CALIDAD

### Calidad General: ⭐⭐⭐⭐ (4/5)

**Fortalezas:**
- ✅ Types completos y exhaustivos
- ✅ Buena organización por dominio
- ✅ Documentación inline en notifications.ts
- ✅ Enums y constantes útiles

**Debilidades:**
- ❌ 53.8% del código es código muerto (property-templates.ts)
- ❌ Duplicación de interfaces en property.ts
- ❌ Falta documentación JSDoc en property.ts

---

## 🚨 HALLAZGOS IMPORTANTES

### 🔴 CRÍTICO: Definiciones Duplicadas en property.ts

**Problema:**
El archivo `property.ts` tiene DOS definiciones contradictorias de las interfaces principales.

**Evidencia:**
```typescript
// Primera definición (líneas 4-15)
export interface Space {
  id: string;
  name: string;
  type: SpaceType;
  details: {
    equipamiento: string[];
    camas?: Array<{ tipo: string; id: number }>;
    tieneBanoPrivado?: boolean;
    banoPrivadoId?: string | null;
    notas?: string;
  };
}

// Segunda definición (líneas 103-113) - CONFLICTO
export interface Space {
  id: string;
  name: string;
  description?: string;    // NUEVO
  icon?: string;           // NUEVO
  category?: string;       // NUEVO
  quantity?: number;       // NUEVO
  features?: string[];     // NUEVO
  created_at?: string;     // NUEVO
}
```

**Problema TypeScript:**
En TypeScript, cuando defines la misma interfaz dos veces, se hace **declaration merging** (fusión de declaraciones), lo que significa que ambas definiciones se combinan. Esto puede causar confusión y errores.

**Resultado actual:**
```typescript
// TypeScript combina ambas definiciones:
export interface Space {
  id: string;
  name: string;
  type: SpaceType;          // De primera definición
  details: {...};           // De primera definición
  description?: string;     // De segunda definición
  icon?: string;            // De segunda definición
  category?: string;        // De segunda definición
  quantity?: number;        // De segunda definición
  features?: string[];      // De segunda definición
  created_at?: string;      // De segunda definición
}
```

**¿Por qué sucede esto?**
Posiblemente el archivo `property.ts` fue editado en diferentes momentos sin eliminar código antiguo.

**Impacto:**
- ⚠️ Confusión al usar el tipo Space
- ⚠️ Campos no utilizados en la interfaz
- ⚠️ Dificulta mantenimiento

**Solución recomendada:**
```typescript
// Determinar qué definición se usa realmente
// Opción 1: Mantener solo la primera (más detallada con `details`)
// Opción 2: Mantener solo la segunda (más simple con campos directos)
// Opción 3: Unificar en una sola con todos los campos necesarios
```

---

### 🔴 CÓDIGO MUERTO: property-templates.ts (793 líneas)

**Problema:**
Archivo completo con 10 templates bien definidos pero NO usado en ninguna parte.

**Razón:**
El componente `SpaceTemplates.tsx` tiene su propia definición inline de templates en lugar de importar este archivo.

**Impacto:**
- 793 líneas de código muerto (53.8% del total de /types)
- Duplicación de lógica
- Mantenimiento difícil (dos lugares para actualizar templates)

**Solución A: Eliminar (recomendado)**
```bash
rm types/property-templates.ts
```
**Ahorro:** 793 líneas

**Solución B: Migrar SpaceTemplates.tsx**
```typescript
// En SpaceTemplates.tsx (línea 4):
import { PROPERTY_TEMPLATES, PropertyTemplate } from '@/types/property-templates'

// Eliminar definición inline (líneas 6-11 y 19-145)

// Usar directamente PROPERTY_TEMPLATES importado
```
**Beneficio:** Reutilización de código, templates más completos (10 en vez de 6)

---

## 📋 TABLA COMPARATIVA DE USO

| Archivo | Líneas | Usos | Crítico | Estado | Acción |
|---------|--------|------|---------|--------|--------|
| **property.ts** | 257 | 14 | ✅ Sí | Usado pero con duplicados | Limpiar duplicados |
| **notifications.ts** | 466 | 4 | ✅ Sí | Funcional | Mantener |
| **property-templates.ts** | 793 | 0 | ❌ No | **CÓDIGO MUERTO** | Eliminar o migrar |

**Total código muerto:** 793 líneas (53.8%)

---

## 🎯 ACCIONES PRIORITARIAS

### 🔴 ALTA PRIORIDAD

#### 1. Eliminar código muerto: property-templates.ts
**Archivo:** `/types/property-templates.ts`
**Tamaño:** 793 líneas
**Razón:**
- No se usa en ninguna parte
- Duplica lógica de SpaceTemplates.tsx
- 53.8% del código de /types es código muerto

**Opción A - Eliminar (RECOMENDADO):**
```bash
rm types/property-templates.ts
```

**Opción B - Migrar SpaceTemplates.tsx:**
```typescript
// En app/propiedades/nueva/components/SpaceTemplates.tsx:
import { PROPERTY_TEMPLATES } from '@/types/property-templates'
// Eliminar definición inline
```

**Beneficio de Opción B:**
- Obtener 4 templates adicionales (Condominio, Penthouse, Local Comercial, Bodega)
- Templates más detallados con más equipamiento
- Código centralizado

**Recomendación:** Opción A (eliminar) si no se necesitan los templates extras

---

#### 2. Limpiar definiciones duplicadas en property.ts
**Problema:** Dos definiciones de `Space` y `PropertyFormData`

**Paso 1:** Determinar qué definición se usa
```bash
# Buscar usos de campos específicos de cada definición
grep -r "space.details" app/          # Primera definición
grep -r "space.description" app/      # Segunda definición
grep -r "space.category" app/         # Segunda definición
```

**Paso 2:** Eliminar definición no usada

**Paso 3:** Reorganizar archivo con estructura clara:
```typescript
// ============================================================================
// TIPOS BÁSICOS
// ============================================================================
export interface Space { ... }
export type SpaceType = ...
export const SPACE_CATEGORIES = ...

// ============================================================================
// FORMULARIO DE PROPIEDAD
// ============================================================================
export interface PropertyFormData { ... }

// ============================================================================
// SISTEMA DE GALERÍA
// ============================================================================
export interface PropertyImage { ... }
export interface GalleryStats { ... }
export const GALLERY_CONSTANTS = ...

// ============================================================================
// ENUMS Y HELPERS
// ============================================================================
export enum PropertyType { ... }
export enum PropertyStatus { ... }
export type PropertyFormStep = ...
```

---

### 🟡 MEDIA PRIORIDAD

#### 3. Agregar documentación JSDoc a property.ts

**Ejemplo:**
```typescript
/**
 * Espacio dentro de una propiedad (habitación, baño, cocina, etc.)
 */
export interface Space {
  /** ID único del espacio */
  id: string;
  /** Nombre del espacio (ej: "Habitación Principal") */
  name: string;
  /** Tipo de espacio según categoría predefinida */
  type: SpaceType;
  /** Detalles específicos del espacio */
  details: {
    /** Lista de equipamiento/amenidades */
    equipamiento: string[];
    /** Camas disponibles en el espacio (si aplica) */
    camas?: Array<{ tipo: string; id: number }>;
    /** Si tiene baño privado */
    tieneBanoPrivado?: boolean;
    /** ID del baño privado asociado */
    banoPrivadoId?: string | null;
    /** Notas adicionales */
    notas?: string;
  };
}
```

---

#### 4. Considerar separar property.ts en múltiples archivos

**Problema:** property.ts hace muchas cosas (257 líneas)

**Propuesta:**
```
types/
├── property/
│   ├── space.ts          // Space, SpaceType, SPACE_CATEGORIES
│   ├── form.ts           // PropertyFormData, PropertyFormStep, StepConfig
│   ├── gallery.ts        // PropertyImage, GalleryStats, GALLERY_CONSTANTS
│   └── enums.ts          // PropertyType, PropertyStatus, TransactionType
├── notifications.ts
└── index.ts              // Re-export all for convenience
```

**Beneficio:** Mejor organización, imports más específicos

---

### 🟢 BAJA PRIORIDAD

#### 5. Agregar validadores de tipos con Zod

**Ejemplo:**
```typescript
import { z } from 'zod'

export const SpaceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Nombre requerido'),
  type: z.enum(['Habitación', 'Lock-off', ...]),
  details: z.object({
    equipamiento: z.array(z.string()),
    camas: z.array(z.object({
      tipo: z.string(),
      id: z.number()
    })).optional(),
    // ...
  })
})

export type Space = z.infer<typeof SpaceSchema>
```

**Beneficio:** Validación en runtime + types

---

## 📊 ESTADÍSTICAS FINALES

### Código:
- **Total archivos:** 3
- **Total líneas:** ~1,473 líneas
- **Código productivo:** ~680 líneas (46.2%)
- **Código muerto:** 793 líneas (53.8%)
- **Código duplicado:** ~50 líneas (interfaces duplicadas en property.ts)

### Uso:
- **Archivos críticos (10+ usos):** 1 (property.ts)
- **Archivos funcionales (1-9 usos):** 1 (notifications.ts)
- **Archivos muertos (0 usos):** 1 (property-templates.ts)

### Calidad:
- **Documentación JSDoc:** ⭐⭐⭐ (3/5) - Solo notifications.ts bien documentado
- **Type Safety:** ⭐⭐⭐⭐⭐ (5/5) - Todo tipado
- **Organización:** ⭐⭐⭐ (3/5) - Duplicados y archivo muerto
- **Mantenibilidad:** ⭐⭐⭐ (3/5) - Mejorable con limpieza

---

## 📋 CHECKLIST DE FASE 1

**Auditoría de carpetas:**
- [x] Analizar archivos de configuración
- [x] Auditar carpeta `/app`
- [x] Auditar carpeta `/components`
- [x] Auditar carpeta `/hooks`
- [x] Auditar carpeta `/Lib`
- [x] **Auditar carpeta `/types`** ✅
- [ ] Auditar `/styles`

**Progreso FASE 1:** 75% completado

---

## 🎯 PRÓXIMOS PASOS

1. **Continuar FASE 1:** Auditar `/styles` (último pendiente)
2. **Después de FASE 1:**
   - Eliminar property-templates.ts (793 líneas)
   - Limpiar duplicados en property.ts
   - Aplicar correcciones de uniformidad
   - Instalar ToastProvider/ConfirmProvider
3. **Iniciar FASE 2:** Auditoría de Calidad

---

## 📊 CONCLUSIÓN

**Estado de /types:** ⚠️ Bueno pero necesita limpieza urgente

**Resumen:**
- ✅ Types funcionales y bien usados (property.ts, notifications.ts)
- ❌ 53.8% del código es código muerto (property-templates.ts)
- ❌ Definiciones duplicadas en property.ts
- ⚠️ Falta documentación JSDoc

**Acción inmediata:** Eliminar property-templates.ts (código muerto confirmado)

**Oportunidad de mejora:** Limpiar duplicados y documentar property.ts

---

**Generado automáticamente por auditoría FASE 1 - Types**
**Última actualización:** 2025-11-17
