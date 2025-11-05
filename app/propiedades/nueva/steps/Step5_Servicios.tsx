'use client';

import React, { useState } from 'react';
import { PropertyFormData, ServicioInmueble } from '@/types/property';
import Input from '@/components/ui/input';

interface Step5Props {
  data: PropertyFormData;
  onUpdate: (data: Partial<PropertyFormData>) => void;
}

const TIPOS_SERVICIO = {
  basicos: [
    { value: 'agua', label: 'Agua', icon: '💧' },
    { value: 'gas', label: 'Gas', icon: '🔥' },
    { value: 'luz', label: 'Luz', icon: '💡' },
    { value: 'internet', label: 'Internet', icon: '📡' },
    { value: 'predial', label: 'Predial', icon: '🏛️' },
    { value: 'cuota_condominio', label: 'Cuota Condominio', icon: '🏘️' },
    { value: 'mantenimiento_alberca', label: 'Mantenimiento Alberca', icon: '🏊' }
  ],
  secundarios: [
    { value: 'cctv', label: 'CCTV', icon: '📹' },
    { value: 'seguro', label: 'Seguro', icon: '🛡️' },
    { value: 'fumigacion', label: 'Fumigación', icon: '🐛' },
    { value: 'mantenimiento_aires', label: 'Mantenimiento Aires', icon: '❄️' },
    { value: 'impermeabilizacion', label: 'Impermeabilización', icon: '☔' }
  ]
};

const FRECUENCIAS = [
  { value: 'dias', label: 'Días' },
  { value: 'semanas', label: 'Semanas' },
  { value: 'meses', label: 'Meses' },
  { value: 'anos', label: 'Años' }
];

export default function Step5_Servicios({ data, onUpdate }: Step5Props) {
  const [editandoServicio, setEditandoServicio] = useState<ServicioInmueble | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Estado inicial para nuevo servicio
  const servicioVacio: ServicioInmueble = {
    id: crypto.randomUUID(),
    tipo_servicio: 'agua',
    nombre: '',
    numero_contrato: '',
    monto: 0,
    es_fijo: true,
    ultima_fecha_pago: '',
    frecuencia_valor: 1,
    frecuencia_unidad: 'meses',
    activo: true
  };

  const [nuevoServicio, setNuevoServicio] = useState<ServicioInmueble>(servicioVacio);

  const handleAgregarServicio = () => {
    if (!nuevoServicio.nombre || !nuevoServicio.ultima_fecha_pago) {
      alert('Por favor completa al menos el nombre y la última fecha de pago');
      return;
    }

    const serviciosActuales = data.servicios || [];
    onUpdate({ servicios: [...serviciosActuales, { ...nuevoServicio, id: crypto.randomUUID() }] });
    
    // Reset form
    setNuevoServicio(servicioVacio);
    setMostrarFormulario(false);
  };

  const handleEditarServicio = (servicio: ServicioInmueble) => {
    setEditandoServicio(servicio);
    setNuevoServicio(servicio);
    setMostrarFormulario(true);
  };

  const handleActualizarServicio = () => {
    if (!editandoServicio) return;

    const serviciosActuales = data.servicios || [];
    const serviciosActualizados = serviciosActuales.map(s => 
      s.id === editandoServicio.id ? nuevoServicio : s
    );
    
    onUpdate({ servicios: serviciosActualizados });
    setEditandoServicio(null);
    setNuevoServicio(servicioVacio);
    setMostrarFormulario(false);
  };

  const handleEliminarServicio = (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este servicio?')) return;
    
    const serviciosActuales = data.servicios || [];
    onUpdate({ servicios: serviciosActuales.filter(s => s.id !== id) });
  };

  const calcularProximasFechas = (servicio: ServicioInmueble): string[] => {
    if (!servicio.ultima_fecha_pago) return [];
    
    const fechas: string[] = [];
    const ultimaFecha = new Date(servicio.ultima_fecha_pago);
    
    for (let i = 1; i <= 6; i++) {
      const proximaFecha = new Date(ultimaFecha);
      
      switch (servicio.frecuencia_unidad) {
        case 'dias':
          proximaFecha.setDate(ultimaFecha.getDate() + (servicio.frecuencia_valor * i));
          break;
        case 'semanas':
          proximaFecha.setDate(ultimaFecha.getDate() + (servicio.frecuencia_valor * 7 * i));
          break;
        case 'meses':
          proximaFecha.setMonth(ultimaFecha.getMonth() + (servicio.frecuencia_valor * i));
          break;
        case 'anos':
          proximaFecha.setFullYear(ultimaFecha.getFullYear() + (servicio.frecuencia_valor * i));
          break;
      }
      
      fechas.push(proximaFecha.toISOString().split('T')[0]);
    }
    
    return fechas;
  };

  const getTipoServicioInfo = (tipo: string) => {
    const todos = [...TIPOS_SERVICIO.basicos, ...TIPOS_SERVICIO.secundarios];
    return todos.find(t => t.value === tipo) || { value: tipo, label: tipo, icon: '📋' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 font-poppins flex items-center gap-2">
              <span>💳</span>
              Servicios del Inmueble
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Gestiona los servicios y sus fechas de pago
            </p>
          </div>
          
          {!mostrarFormulario && (
            <button
              onClick={() => {
                setNuevoServicio(servicioVacio);
                setEditandoServicio(null);
                setMostrarFormulario(true);
              }}
              className="px-4 py-2 bg-ras-azul text-white rounded-lg hover:bg-ras-azul/90 transition-colors font-medium flex items-center gap-2"
            >
              <span>+</span>
              Agregar Servicio
            </button>
          )}
        </div>
      </div>

      {/* Formulario de Servicio */}
      {mostrarFormulario && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 font-poppins mb-6">
            {editandoServicio ? 'Editar Servicio' : 'Nuevo Servicio'}
          </h3>

          <div className="space-y-6">
            {/* Tipo de servicio */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Tipo de servicio
              </label>
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-600 uppercase">Servicios Básicos</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {TIPOS_SERVICIO.basicos.map(tipo => (
                    <button
                      key={tipo.value}
                      onClick={() => setNuevoServicio({ ...nuevoServicio, tipo_servicio: tipo.value })}
                      className={`
                        px-3 py-2.5 rounded-lg border-2 text-left transition-all
                        ${nuevoServicio.tipo_servicio === tipo.value
                          ? 'border-ras-azul bg-ras-azul/5 text-ras-azul'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{tipo.icon}</span>
                        <span className="text-sm font-medium">{tipo.label}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <p className="text-xs font-semibold text-gray-600 uppercase mt-4">Servicios Secundarios</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {TIPOS_SERVICIO.secundarios.map(tipo => (
                    <button
                      key={tipo.value}
                      onClick={() => setNuevoServicio({ ...nuevoServicio, tipo_servicio: tipo.value })}
                      className={`
                        px-3 py-2.5 rounded-lg border-2 text-left transition-all
                        ${nuevoServicio.tipo_servicio === tipo.value
                          ? 'border-ras-azul bg-ras-azul/5 text-ras-azul'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{tipo.icon}</span>
                        <span className="text-sm font-medium">{tipo.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Nombre y Número de contrato */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  id="nombre_servicio"
                  label="Nombre del servicio"
                  type="text"
                  value={nuevoServicio.nombre}
                  onChange={(e) => setNuevoServicio({ ...nuevoServicio, nombre: e.target.value })}
                  placeholder="Ej: CFE Cancún"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Nombre personalizado para identificar el servicio</p>
              </div>

              <div>
                <Input
                  id="numero_contrato"
                  label="Número de contrato/servicio"
                  type="text"
                  value={nuevoServicio.numero_contrato}
                  onChange={(e) => setNuevoServicio({ ...nuevoServicio, numero_contrato: e.target.value })}
                  placeholder="Ej: 123456789"
                />
                <p className="text-xs text-gray-500 mt-1">Número para realizar el pago</p>
              </div>
            </div>

            {/* Monto y tipo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  id="monto"
                  label="Monto"
                  type="number"
                  value={nuevoServicio.monto}
                  onChange={(e) => setNuevoServicio({ ...nuevoServicio, monto: parseFloat(e.target.value) || 0 })}
                  placeholder="Ej: 850"
                  prefix="$"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de monto
                </label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={nuevoServicio.es_fijo}
                      onChange={() => setNuevoServicio({ ...nuevoServicio, es_fijo: true })}
                      className="text-ras-azul focus:ring-ras-azul"
                    />
                    <span className="text-sm font-medium text-gray-700">Fijo</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={!nuevoServicio.es_fijo}
                      onChange={() => setNuevoServicio({ ...nuevoServicio, es_fijo: false })}
                      className="text-ras-azul focus:ring-ras-azul"
                    />
                    <span className="text-sm font-medium text-gray-700">Variable</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {nuevoServicio.es_fijo ? 'El monto no cambia cada periodo' : 'El monto puede variar'}
                </p>
              </div>
            </div>

            {/* Última fecha de pago y frecuencia */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <Input
                  id="ultima_fecha_pago"
                  label="Última fecha de pago"
                  type="date"
                  value={nuevoServicio.ultima_fecha_pago}
                  onChange={(e) => setNuevoServicio({ ...nuevoServicio, ultima_fecha_pago: e.target.value })}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Fecha del último pago realizado</p>
              </div>

              <div>
                <Input
                  id="frecuencia_valor"
                  label="Frecuencia (cantidad)"
                  type="number"
                  value={nuevoServicio.frecuencia_valor}
                  onChange={(e) => setNuevoServicio({ ...nuevoServicio, frecuencia_valor: parseInt(e.target.value) || 1 })}
                  placeholder="Ej: 1"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Frecuencia (unidad)
                </label>
                <select
                  value={nuevoServicio.frecuencia_unidad}
                  onChange={(e) => setNuevoServicio({ ...nuevoServicio, frecuencia_unidad: e.target.value as 'dias' | 'semanas' | 'meses' | 'anos' })}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ras-azul focus:border-transparent font-roboto"
                >
                  {FRECUENCIAS.map(freq => (
                    <option key={freq.value} value={freq.value}>{freq.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Preview de próximas fechas */}
            {nuevoServicio.ultima_fecha_pago && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">
                  📅 Próximas 6 fechas de pago
                </h4>
                <div className="flex flex-wrap gap-2">
                  {calcularProximasFechas(nuevoServicio).map((fecha, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-white border border-blue-300 rounded text-xs font-medium text-blue-900"
                    >
                      {new Date(fecha).toLocaleDateString('es-MX', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex gap-3 pt-4">
              {editandoServicio ? (
                <>
                  <button
                    onClick={handleActualizarServicio}
                    className="flex-1 px-4 py-2.5 bg-ras-azul text-white rounded-lg hover:bg-ras-azul/90 transition-colors font-medium"
                  >
                    Actualizar Servicio
                  </button>
                  <button
                    onClick={() => {
                      setEditandoServicio(null);
                      setNuevoServicio(servicioVacio);
                      setMostrarFormulario(false);
                    }}
                    className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleAgregarServicio}
                    className="flex-1 px-4 py-2.5 bg-ras-azul text-white rounded-lg hover:bg-ras-azul/90 transition-colors font-medium"
                  >
                    Agregar Servicio
                  </button>
                  <button
                    onClick={() => {
                      setNuevoServicio(servicioVacio);
                      setMostrarFormulario(false);
                    }}
                    className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lista de servicios */}
      <div className="space-y-3">
        {(!data.servicios || data.servicios.length === 0) && !mostrarFormulario && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <span className="text-5xl mb-3 block">💳</span>
            <h3 className="font-bold text-gray-900 mb-2">No hay servicios registrados</h3>
            <p className="text-sm text-gray-600 mb-4">
              Agrega los servicios del inmueble para gestionar sus pagos
            </p>
            <button
              onClick={() => setMostrarFormulario(true)}
              className="px-4 py-2 bg-ras-azul text-white rounded-lg hover:bg-ras-azul/90 transition-colors font-medium"
            >
              Agregar primer servicio
            </button>
          </div>
        )}

        {data.servicios?.map(servicio => {
          const tipoInfo = getTipoServicioInfo(servicio.tipo_servicio);
          const proximasFechas = calcularProximasFechas(servicio);
          
          return (
            <div key={servicio.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-ras-azul to-ras-turquesa flex items-center justify-center text-2xl">
                    {tipoInfo.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{servicio.nombre}</h3>
                    <p className="text-sm text-gray-600">{tipoInfo.label}</p>
                    {servicio.numero_contrato && (
                      <p className="text-xs text-gray-500 mt-1">
                        Contrato: {servicio.numero_contrato}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditarServicio(servicio)}
                    className="p-2 text-ras-azul hover:bg-ras-azul/10 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleEliminarServicio(servicio.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Monto</p>
                  <p className="text-sm font-semibold text-gray-900">
                    ${servicio.monto.toLocaleString('es-MX')}
                    <span className="text-xs text-gray-500 ml-1">
                      ({servicio.es_fijo ? 'Fijo' : 'Variable'})
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Frecuencia</p>
                  <p className="text-sm font-semibold text-gray-900">
                    Cada {servicio.frecuencia_valor} {servicio.frecuencia_unidad}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500">Última fecha de pago</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(servicio.ultima_fecha_pago).toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {proximasFechas.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-600">Próximas fechas de pago</p>
                    <button className="text-xs px-3 py-1 bg-ras-turquesa/10 text-ras-turquesa rounded hover:bg-ras-turquesa/20 transition-colors font-medium">
                      Link a pago
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {proximasFechas.slice(0, 3).map((fecha, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-medium text-gray-700"
                      >
                        {new Date(fecha).toLocaleDateString('es-MX', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    ))}
                    {proximasFechas.length > 3 && (
                      <span className="px-2 py-1 text-xs text-gray-500">
                        +{proximasFechas.length - 3} más
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info box */}
      {data.servicios && data.servicios.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <span className="text-blue-600 text-xl">💡</span>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">Gestión automática de pagos</h4>
              <p className="text-sm text-blue-800">
                El sistema generará automáticamente las próximas 6 fechas de pago para cada servicio.
                En futuras actualizaciones podrás configurar alertas y enlaces directos de pago.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}