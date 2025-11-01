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