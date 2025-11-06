'use client';

import React from 'react';
import { PropertyFormData, ServicioInmueble } from '@/types/property';
import Input from '@/components/ui/input';

interface Step5Props {
  data: PropertyFormData;
  onUpdate: (data: Partial<PropertyFormData>) => void;
  contactos?: Array<{
    id: string;
    nombre: string;
    telefono: string;
    correo: string;
    tipo: 'inquilino' | 'proveedor';
  }>;
  onAgregarContacto?: (tipo: 'inquilino' | 'proveedor') => void;
}

const TIPOS_SERVICIO = [
  { 
    value: 'agua', 
    label: 'Agua',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 007.92 12.446A9 9 0 1112 3z" /></svg>
  },
  { 
    value: 'luz', 
    label: 'Luz',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
  },
  { 
    value: 'gas', 
    label: 'Gas',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /></svg>
  },
  { 
    value: 'internet', 
    label: 'Internet',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>
  },
  { 
    value: 'predial', 
    label: 'Predial',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
  },
  { 
    value: 'condominio', 
    label: 'Condominio',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
  },
  { 
    value: 'alberca', 
    label: 'Alberca',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 15c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M3 20c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M13 5l-2 5h4l-2 5" /></svg>
  },
  { 
    value: 'seguro', 
    label: 'Seguro',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
  },
  { 
    value: 'cctv', 
    label: 'CCTV',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
  },
  { 
    value: 'limpieza', 
    label: 'Limpieza',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
  },
  { 
    value: 'jardineria', 
    label: 'Jardinería',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  },
  { 
    value: 'otro', 
    label: 'Otro',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
  }
];

const FRECUENCIAS = [
  { value: 'dias', label: 'Días' },
  { value: 'semanas', label: 'Semanas' },
  { value: 'meses', label: 'Meses' },
  { value: 'anos', label: 'Años' }
];

// Plan C: Lista de responsables y proveedores
const RESPONSABLES = [
  { value: '', label: 'Sin asignar' },
  { value: 'propietario', label: 'Propietario' },
  { value: 'inquilino', label: 'Inquilino' },
  { value: 'administrador', label: 'Administrador' },
  { value: 'condominio', label: 'Condominio' }
];

const PROVEEDORES = [
  { value: '', label: 'Sin proveedor' },
  { value: 'cfe', label: 'CFE' },
  { value: 'aguakan', label: 'Aguakan' },
  { value: 'telmex', label: 'Telmex' },
  { value: 'totalplay', label: 'Totalplay' },
  { value: 'naturgy', label: 'Naturgy' },
  { value: 'otro', label: 'Otro proveedor' }
];

export default function Step5_Servicios({ data, onUpdate, contactos = [], onAgregarContacto }: Step5Props) {
  const servicios = data.servicios || [];

  // Filtrar solo proveedores
  const proveedores = contactos.filter(c => c.tipo === 'proveedor');

  // Función para obtener el ícono según el tipo de servicio
  const obtenerIcono = (tipo: string) => {
    const tipoEncontrado = TIPOS_SERVICIO.find(t => t.value === tipo);
    return tipoEncontrado?.icon || TIPOS_SERVICIO.find(t => t.value === 'otro')?.icon;
  };

  const agregarServicio = (tipo: string, label: string) => {
    const nuevoServicio: ServicioInmueble = {
      id: `srv-${Date.now()}`,
      tipo_servicio: tipo,
      nombre: label,
      numero_contrato: '',
      monto: 0,
      es_fijo: true,
      ultima_fecha_pago: '',
      frecuencia_valor: 1,
      frecuencia_unidad: 'meses',
      responsable: '',
      proveedor: '',
      activo: true
    };
    onUpdate({ servicios: [...servicios, nuevoServicio] });
  };

  const actualizarServicio = (id: string, updates: Partial<ServicioInmueble>) => {
    onUpdate({ 
      servicios: servicios.map(s => s.id === id ? { ...s, ...updates } : s) 
    });
  };

  const eliminarServicio = (id: string) => {
    if (confirm('¿Eliminar servicio?')) {
      onUpdate({ servicios: servicios.filter(s => s.id !== id) });
    }
  };

  const duplicarServicio = (servicio: ServicioInmueble) => {
    onUpdate({ 
      servicios: [...servicios, { ...servicio, id: `srv-${Date.now()}`, nombre: `${servicio.nombre} (copia)` }] 
    });
  };

  return (
    <div className="space-y-6">
      {/* Header con resumen */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 font-poppins mb-2">
          Servicios del Inmueble
        </h2>
        {servicios.length > 0 ? (
          <div className="flex flex-wrap gap-2 mt-4">
            {servicios.map(s => (
              <span key={s.id} className="px-3 py-1 bg-ras-azul/10 border border-ras-azul/30 rounded-full text-xs font-semibold text-ras-azul">
                {s.nombre}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">Agrega los servicios de la propiedad</p>
        )}
      </div>

      {/* Botones para agregar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Agregar Servicios</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {TIPOS_SERVICIO.map(tipo => (
            <button
              key={tipo.value}
              onClick={() => agregarServicio(tipo.value, tipo.label)}
              className="flex flex-col items-center gap-2 px-4 py-3 rounded-lg border-2 border-gray-200 hover:border-ras-azul hover:bg-ras-azul/5 transition-all group"
            >
              <span className="text-gray-600 group-hover:text-ras-azul transition-colors">
                {tipo.icon}
              </span>
              <span className="font-medium text-sm text-gray-700 group-hover:text-ras-azul transition-colors">
                {tipo.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Lista de servicios */}
      {servicios.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Servicios Agregados ({servicios.length})</h3>
          
          {servicios.map(servicio => (
            <div key={servicio.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-ras-azul">
                    {obtenerIcono(servicio.tipo_servicio)}
                  </span>
                  <input
                    type="text"
                    value={servicio.nombre}
                    onChange={(e) => actualizarServicio(servicio.id, { nombre: e.target.value })}
                    className="text-lg font-bold text-gray-900 border-b-2 border-transparent hover:border-gray-300 focus:border-ras-azul focus:outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => duplicarServicio(servicio)} 
                    className="p-2 text-gray-600 hover:text-ras-azul hover:bg-ras-azul/5 rounded-lg transition-colors"
                    title="Duplicar servicio"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => eliminarServicio(servicio.id)} 
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar servicio"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Número de contrato */}
                <Input
                  id={`contrato_${servicio.id}`}
                  label="Número de contrato"
                  value={servicio.numero_contrato}
                  onChange={(e) => actualizarServicio(servicio.id, { numero_contrato: e.target.value })}
                />
                
                {/* Monto */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Monto</label>
                  <div className="flex gap-2">
                    <Input
                      id={`monto_${servicio.id}`}
                      type="number"
                      value={servicio.monto}
                      onChange={(e) => actualizarServicio(servicio.id, { monto: parseFloat(e.target.value) || 0 })}
                      prefix="$"
                      className="flex-1"
                    />
                    <select
                      value={servicio.es_fijo ? 'fijo' : 'variable'}
                      onChange={(e) => actualizarServicio(servicio.id, { es_fijo: e.target.value === 'fijo' })}
                      className="w-28 px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ras-azul text-sm font-medium"
                    >
                      <option value="fijo">Fijo</option>
                      <option value="variable">Variable</option>
                    </select>
                  </div>
                </div>

                {/* Última fecha de pago */}
                <Input
                  id={`fecha_${servicio.id}`}
                  label="Última fecha de pago"
                  type="date"
                  value={servicio.ultima_fecha_pago}
                  onChange={(e) => actualizarServicio(servicio.id, { ultima_fecha_pago: e.target.value })}
                />
                
                {/* Frecuencia */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Frecuencia</label>
                  <div className="flex gap-2">
                    <Input
                      id={`frec_val_${servicio.id}`}
                      type="number"
                      value={servicio.frecuencia_valor}
                      onChange={(e) => actualizarServicio(servicio.id, { frecuencia_valor: parseInt(e.target.value) || 1 })}
                      className="w-20"
                      min="1"
                    />
                    <select
                      value={servicio.frecuencia_unidad}
                      onChange={(e) => actualizarServicio(servicio.id, { frecuencia_unidad: e.target.value as any })}
                      className="flex-1 px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ras-azul text-sm font-medium"
                    >
                      {FRECUENCIAS.map(f => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Responsable */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Responsable
                    </span>
                  </label>
                  <select
                    value={servicio.responsable || ''}
                    onChange={(e) => actualizarServicio(servicio.id, { responsable: e.target.value })}
                    className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ras-azul text-sm font-medium"
                  >
                    <option value="">Sin asignar</option>
                    <option value="administrador">Administrador</option>
                    <option value="propietario">Propietario</option>
                    <option value="inquilino">Inquilino</option>
                    <option value="condominio">Condominio</option>
                  </select>
                </div>

                {/* Proveedor */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Proveedor
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={servicio.proveedor || ''}
                      onChange={(e) => actualizarServicio(servicio.id, { proveedor: e.target.value })}
                      className="flex-1 px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ras-azul text-sm font-medium"
                    >
                      <option value="">Sin proveedor</option>
                      {proveedores.map(c => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => onAgregarContacto?.('proveedor')}
                      className="px-3 py-2.5 bg-ras-azul text-white rounded-lg hover:bg-ras-azul/90 transition-colors"
                      title="Agregar proveedor"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                </div>


              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}