// types/property.ts
// Tipos y interfaces para el sistema de propiedades RAS V_1.0

// ===== ESPACIOS =====

export interface Space {
  id: string;
  name: string;
  type: SpaceType;
  description?: string;
  icon?: string;
  category?: string;
  quantity?: number;
  features?: string[];
  details: {
    equipamiento: string[];
    camas?: Array<{ tipo: string; id: number }>;
    tieneBanoPrivado?: boolean;
    banoPrivadoId?: string | null;
    notas?: string;
  };
  created_at?: string;
}

export type SpaceType =
  | 'Habitación'
  | 'Lock-off'
  | 'Cuarto de servicio'
  | 'Baño completo'
  | 'Medio baño'
  | 'Cocina'
  | 'Sala'
  | 'Comedor'
  | 'Cuarto de lavado'
  | 'Terraza'
  | 'Rooftop'
  | 'Patio'
  | 'Jardín'
  | 'Alberca'
  | 'Bodega'
  | 'Estacionamiento'
  | 'Gimnasio'
  | 'Bar'
  | 'Cine / Tv Room'
  | 'Oficina';

export const SPACE_CATEGORIES = {
  habitaciones: ['Habitación', 'Lock-off', 'Cuarto de servicio'],
  banos: ['Baño completo', 'Medio baño'],
  areasComunes: ['Cocina', 'Sala', 'Comedor', 'Cuarto de lavado'],
  exteriores: ['Terraza', 'Rooftop', 'Patio', 'Jardín', 'Alberca'],
  adicionales: ['Bodega', 'Estacionamiento', 'Gimnasio', 'Bar', 'Cine / Tv Room', 'Oficina']
};

// ===== GALERÍA DE IMÁGENES =====

export interface PropertyImage {
  id?: string;
  url: string;                    // URL de la imagen display (1200px)
  url_thumbnail?: string;         // URL de la imagen thumbnail (300px)
  is_cover: boolean;              // ¿Es la foto de portada?
  order_index: number;            // Orden de visualización
  space_type: string | null;      // ID del espacio al que pertenece
  caption: string | null;         // Descripción de la foto
  uploaded_at?: string;           // Timestamp de subida
  file_size?: {                   // Tamaños de archivo
    thumbnail: number;
    display: number;
  };
  dimensions?: {                  // Dimensiones de las imágenes
    thumbnail: { width: number; height: number };
    display: { width: number; height: number };
  };
}

export interface GalleryStats {
  total: number;
  assigned: number;
  unassigned: number;
  withCover: number;
  bySpace: Record<string, number>;
}

export interface PhotoUploadProgress {
  total: number;
  current: number;
  percentage: number;
  status: string;
  currentFile: string;
  errors: string[];
}

export interface ImageCompressionResult {
  thumbnail: Blob;
  display: Blob;
  originalSize: number;
  thumbnailSize: number;
  displaySize: number;
  compressionRatio: {
    thumbnail: number;
    display: number;
  };
}

// ===== SERVICIOS DEL INMUEBLE =====

export interface ServicioInmueble {
  id: string;
  tipo_servicio: string;
  nombre: string;
  numero_contrato: string;
  monto: number;
  es_fijo: boolean;
  ultima_fecha_pago: string;
  frecuencia_valor: number;
  frecuencia_unidad: 'dias' | 'semanas' | 'meses' | 'anos';
  responsable?: string;
  proveedor?: string;
  activo: boolean;
}

export interface FechaPagoServicio {
  id: string;
  servicio_id: string;
  propiedad_id: string;
  fecha_pago: string; // YYYY-MM-DD
  monto_estimado: number;
  pagado: boolean;
  fecha_pago_real?: string; // Cuando se marca como pagado
  notas?: string;
  created_at: string;
}

// ===== INTERFACE PRINCIPAL: PropertyFormData =====

export interface PropertyFormData {
  // ===== IDENTIFICACIÓN =====
  id?: string;
  nombre_propiedad: string;
  tipo_propiedad: string;
  estados: string[]; // Array de estados: ['Renta largo plazo', 'Venta', etc.]
  
  // ===== DATOS BÁSICOS =====
  mobiliario: string;
  capacidad_personas: string;
  tamano_terreno: string;
  tamano_terreno_unit: string;
  tamano_construccion: string;
  tamano_construccion_unit: string;
  
  // ===== UBICACIÓN =====
  pais?: string;
  estado?: string;
  ciudad?: string;
  colonia?: string;
  calle?: string;
  numero_exterior?: string;
  numero_interior?: string;
  codigo_postal?: string;
  
  // ===== DESCRIPCIÓN =====
  descripcion_corta?: string;
  descripcion_larga?: string;
  
  // ===== CARACTERÍSTICAS FÍSICAS =====
  superficie_terreno?: number;
  superficie_construccion?: number;
  recamaras?: number;
  banos?: number;
  medios_banos?: number;
  estacionamientos?: number;
  niveles?: number;
  antiguedad?: number;
  
  // ===== ASIGNACIONES =====
  propietario_id: string;
  supervisor_id?: string;
  
  // ===== CONDICIONALES - RENTA LARGO PLAZO =====
  inquilino_id?: string;
  
  // Detalles del contrato (cuando está rentado)
  fecha_inicio_contrato?: string;
  duracion_contrato_valor?: string; // Ej: "12"
  duracion_contrato_unidad?: string; // "meses" | "años"
  
  // Información de pagos (cuando está rentado)
  costo_renta_mensual?: string;
  frecuencia_pago?: string; // "mensual" | "quincenal" | "semanal"
  dia_pago?: string; // Día del mes (1-31)
  
  // Información cuando NO está rentado (disponible)
  precio_renta_disponible?: string;
  requisitos_renta?: string[]; // Requisitos predefinidos seleccionados
  requisitos_renta_custom?: string[]; // Requisitos personalizados agregados
  
  // ===== CONDICIONALES - RENTA VACACIONAL =====
  precio_noche?: string;
  amenidades_vacacional?: string[];
  
  // ===== CONDICIONALES - VENTA =====
  precio_venta?: string;
  precio_venta_number?: number;
  moneda?: string;
  
  // ===== PRECIO ADICIONAL =====
  precio_renta?: number;
  
  // ===== ESPACIOS =====
  espacios: Space[];
  
  // ===== SERVICIOS =====
  servicios?: ServicioInmueble[];
  
  // ===== GALERÍA =====
  photos: PropertyImage[];
  
  // ===== AMENIDADES =====
  amenidades?: string[];
  
  // ===== OTRAS CARACTERÍSTICAS =====
  permite_mascotas?: boolean;
  amueblado?: boolean;
  
  // ===== CONTACTO =====
  contacto_id?: string;
  
  // ===== METADATA =====
  created_at?: string;
  updated_at?: string;
  published_at?: string;
  status?: 'draft' | 'published' | 'archived';
  is_draft: boolean;
}

// ===== ENUMS Y TIPOS AUXILIARES =====

export enum PropertyType {
  CASA = 'Casa',
  DEPARTAMENTO = 'Departamento',
  TERRENO = 'Terreno',
  OFICINA = 'Oficina',
  LOCAL_COMERCIAL = 'Local Comercial',
  BODEGA = 'Bodega',
  RANCHO = 'Rancho',
  VILLA = 'Villa',
  CONDOMINIO = 'Condominio',
  PENTHOUSE = 'Penthouse',
  LOFT = 'Loft',
  ESTUDIO = 'Estudio'
}

export enum PropertyStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export enum TransactionType {
  VENTA = 'venta',
  RENTA = 'renta',
  AMBOS = 'ambos'
}

export type EstadoPropiedad = 
  | 'Renta largo plazo'
  | 'Renta vacacional'
  | 'Venta'
  | 'Mantenimiento'
  | 'Suspendido'
  | 'Propietario';

export type FrecuenciaPago = 
  | 'mensual'
  | 'quincenal'
  | 'semanal';

export type DuracionUnidad = 
  | 'meses'
  | 'años';

// ===== CONSTANTES =====

export const GALLERY_CONSTANTS = {
  THUMBNAIL_SIZE: 300,
  DISPLAY_MAX_WIDTH: 1200,
  COMPRESSION_QUALITY: 0.8,
  MAX_FILES_PER_UPLOAD: 20,
  SUPPORTED_FORMATS: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  MIN_PHOTOS_RECOMMENDED: 5,
  OPTIMAL_PHOTOS: 15
} as const;

export const TIPOS_PROPIEDAD = [
  'Departamento',
  'Casa',
  'Villa',
  'Condominio',
  'Penthouse',
  'Loft',
  'Estudio',
  'Oficina',
  'Local comercial',
  'Bodega'
];

export const ESTADOS_PROPIEDAD = [
  'Renta largo plazo',
  'Renta vacacional',
  'Venta',
  'Mantenimiento',
  'Suspendido',
  'Propietario'
];

export const OPCIONES_MOBILIARIO = [
  'Amueblada',
  'Semi-amueblada',
  'Sin amueblar'
];

export const FRECUENCIA_PAGO_OPTIONS = [
  { value: 'mensual', label: 'Mensual' },
  { value: 'quincenal', label: 'Quincenal' },
  { value: 'semanal', label: 'Semanal' }
];

export const DURACION_CONTRATO_UNIDAD_OPTIONS = [
  { value: 'meses', label: 'Meses' },
  { value: 'años', label: 'Años' }
];

// ===== HELPER TYPES PARA FORMULARIOS =====

export type PropertyFormStep = 
  | 'datos_generales'
  | 'ubicacion'
  | 'espacios'
  | 'condicionales'
  | 'servicios'
  | 'galeria'
  | 'revision';

export interface StepConfig {
  id: PropertyFormStep;
  title: string;
  icon: string;
  description: string;
  isComplete: (data: PropertyFormData) => boolean;
}

// ===== TIPOS PARA VALIDACIONES =====

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface StepValidation {
  step: PropertyFormStep;
  validation: ValidationResult;
}