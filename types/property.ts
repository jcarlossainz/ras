// types/property.ts
// Tipos y interfaces para el sistema de propiedades RAS V_1.0

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

export interface PropertyFormData {
  // Datos básicos
  nombre_propiedad: string;
  tipo_propiedad: string;
  estados: string[];
  mobiliario: string;
  capacidad_personas: string;
  tamano_terreno: string;
  tamano_terreno_unit: string;
  tamano_construccion: string;
  tamano_construccion_unit: string;

  // Asignaciones
  propietario_id: string;
  supervisor_id?: string;

  // Condicionales - Renta largo plazo
  inquilino_id?: string;
  fecha_inicio_contrato?: string;
  costo_renta_mensual?: string;

  // Condicionales - Renta vacacional
  precio_noche?: string;
  amenidades_vacacional?: string[];

  // Condicionales - Venta
  precio_venta?: string;

  // Espacios
  espacios: Space[];

  // Metadata
  is_draft: boolean;
}

// 📁 src/types/property.ts (actualizado con campos de galería dual)

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

export interface PropertyFormData {
  // Identificación
  id?: string;
  nombre_propiedad: string;
  tipo_propiedad: string;
  estado_propiedad: string;
  
  // Ubicación
  pais?: string;
  estado?: string;
  ciudad?: string;
  colonia?: string;
  calle?: string;
  numero_exterior?: string;
  numero_interior?: string;
  codigo_postal?: string;
  
  // Descripción
  descripcion_corta?: string;
  descripcion_larga?: string;
  
  // Precio
  precio_venta?: number;
  precio_renta?: number;
  moneda?: string;
  
  // Características
  superficie_terreno?: number;
  superficie_construccion?: number;
  recamaras?: number;
  banos?: number;
  medios_banos?: number;
  estacionamientos?: number;
  niveles?: number;
  antiguedad?: number;
  
  // Galería (ACTUALIZADO)
  photos: PropertyImage[];
  
  // Espacios
  espacios: Space[];
  
  // Amenidades
  amenidades?: string[];
  
  // Condicionales
  permite_mascotas?: boolean;
  amueblado?: boolean;
  
  // Contacto
  contacto_id?: string;
  
  // Metadata
  created_at?: string;
  updated_at?: string;
  published_at?: string;
  status?: 'draft' | 'published' | 'archived';
}

// Tipos auxiliares para la galería

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

// Enums útiles

export enum PropertyType {
  CASA = 'Casa',
  DEPARTAMENTO = 'Departamento',
  TERRENO = 'Terreno',
  OFICINA = 'Oficina',
  LOCAL_COMERCIAL = 'Local Comercial',
  BODEGA = 'Bodega',
  RANCHO = 'Rancho'
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

// Constantes para la galería

export const GALLERY_CONSTANTS = {
  THUMBNAIL_SIZE: 300,
  DISPLAY_MAX_WIDTH: 1200,
  COMPRESSION_QUALITY: 0.8,
  MAX_FILES_PER_UPLOAD: 20,
  SUPPORTED_FORMATS: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  MIN_PHOTOS_RECOMMENDED: 5,
  OPTIMAL_PHOTOS: 15
} as const;

// Helper types para formularios

export type PropertyFormStep = 
  | 'datos_generales'
  | 'ubicacion'
  | 'espacios'
  | 'condicionales'
  | 'galeria'
  | 'revision';

export interface StepConfig {
  id: PropertyFormStep;
  title: string;
  icon: string;
  description: string;
  isComplete: (data: PropertyFormData) => boolean;
}
