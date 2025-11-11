'use client';

import React from 'react';
import { PropertyFormData } from '@/types/property';
import Input from '@/components/ui/input';

interface Step4Props {
  data: PropertyFormData;
  onUpdate: (data: Partial<PropertyFormData>) => void;
  contactos?: Array<{
    id: string;
    nombre: string;
    telefono: string;
    correo: string;
    tipo: 'inquilino' | 'propietario' | 'proveedor' | 'supervisor';
  }>;
  usuariosRegistrados?: Array<{
    id: string;
    full_name: string;
    email: string;
  }>;
  onAgregarContacto?: (tipo: 'inquilino' | 'propietario' | 'proveedor' | 'supervisor') => void;
}

const AMENIDADES_VACACIONAL = [
  'Wi-Fi',
  'Aire acondicionado',
  'Calefacción',
  'TV',
  'Cocina equipada',
  'Lavadora',
  'Secadora',
  'Estacionamiento',
  'Alberca',
  'Gimnasio',
  'Terraza',
  'Jardín',
  'BBQ/Asador',
  'Vista al mar',
  'Pet friendly'
];

const FRECUENCIA_PAGO = [
  { value: 'mensual', label: 'Mensual' },
  { value: 'quincenal', label: 'Quincenal' },
  { value: 'semanal', label: 'Semanal' }
];

const DURACION_CONTRATO_UNIDAD = [
  { value: 'meses', label: 'Meses' },
  { value: 'años', label: 'Años' }
];

export default function Step4_Condicionales({ 
  data, 
  onUpdate, 
  contactos = [], 
  usuariosRegistrados = [],
  onAgregarContacto 
}: Step4Props) {
  // Determinar si está rentado basado en si hay inquilino_id con valor
  const [estaRentado, setEstaRentado] = React.useState(false);

  // Filtrar correctamente por tipo
  const inquilinos = contactos.filter(c => c.tipo === 'inquilino');
  const propietarios = contactos.filter(c => c.tipo === 'propietario');
  const supervisores = contactos.filter(c => c.tipo === 'supervisor');

  // Combinar propietarios de contactos + usuarios registrados del sistema
  const propietariosCombinados = [
    ...propietarios.map(p => ({ id: p.id, nombre: p.nombre, origen: 'contacto' })),
    ...usuariosRegistrados.map(u => ({ id: u.id, nombre: u.full_name, origen: 'usuario' }))
  ];

  // Combinar supervisores de contactos + usuarios registrados del sistema
  const supervisoresCombinados = [
    ...supervisores.map(s => ({ id: s.id, nombre: s.nombre, origen: 'contacto' })),
    ...usuariosRegistrados.map(u => ({ id: u.id, nombre: u.full_name, origen: 'usuario' }))
  ];

  // Sincronizar el estado cuando cambie el inquilino_id desde fuera
  React.useEffect(() => {
    setEstaRentado(!!data.inquilino_id && data.inquilino_id !== '');
  }, [data.inquilino_id]);

  const handleChange = (field: keyof PropertyFormData, value: any) => {
    onUpdate({ [field]: value });
  };

  // Helper para actualizar precios
  const handlePrecioChange = (tipo: 'mensual' | 'noche' | 'venta', value: string) => {
    const precioNumerico = value === '' ? null : parseFloat(value);
    onUpdate({ 
      precios: { 
        ...data.precios, 
        [tipo]: precioNumerico 
      } 
    });
  };

  const toggleAmenidad = (amenidad: string) => {
    const newAmenidades = data.amenidades_vacacional?.includes(amenidad)
      ? data.amenidades_vacacional.filter(a => a !== amenidad)
      : [...(data.amenidades_vacacional || []), amenidad];
    handleChange('amenidades_vacacional', newAmenidades);
  };

  const handleRentadoToggle = (checked: boolean) => {
    setEstaRentado(checked);
    if (!checked) {
      // Limpiar todos los campos relacionados con inquilino
      handleChange('inquilino_id', '');
      handleChange('fecha_inicio_contrato', '');
      handleChange('duracion_contrato_valor', '');
      handleChange('duracion_contrato_unidad', 'meses');
      handlePrecioChange('mensual', '');
      handleChange('frecuencia_pago', 'mensual');
      handleChange('dia_pago', '');
    } else {
      // Limpiar campos de disponible
      handleChange('precio_renta_disponible', '');
      handleChange('requisitos_renta', []);
      handleChange('requisitos_renta_custom', []);
    }
  };

  const renderSection = (estado: string) => {
    switch (estado) {
      case 'Renta largo plazo':
        return (
          <div key={estado} className="space-y-5">
            <h3 className="font-bold text-gray-900 font-poppins text-lg mb-3">Renta Largo Plazo</h3>

            {/* Pregunta: ¿Está rentado? */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">
                ¿Propiedad rentada actualmente?
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleRentadoToggle(true)}
                  className={`
                    px-6 py-2 rounded-lg font-medium text-sm transition-all
                    ${estaRentado
                      ? 'bg-ras-azul text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  Sí
                </button>
                <button
                  type="button"
                  onClick={() => handleRentadoToggle(false)}
                  className={`
                    px-6 py-2 rounded-lg font-medium text-sm transition-all
                    ${!estaRentado
                      ? 'bg-ras-azul text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  No
                </button>
              </div>
            </div>

            {/* Campos solo si está rentado */}
            {estaRentado && (
              <div className="space-y-4 pt-2">
                {/* Inquilino */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Inquilino *
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={data.inquilino_id || ''}
                      onChange={(e) => handleChange('inquilino_id', e.target.value)}
                      className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ras-azul text-sm font-medium"
                    >
                      <option value="">Selecciona el inquilino</option>
                      {inquilinos.map(c => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => onAgregarContacto?.('inquilino')}
                      className="px-3 py-2.5 bg-ras-azul text-white rounded-lg hover:bg-ras-azul/90 transition-colors"
                      title="Agregar inquilino"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Grid de 2 columnas para campos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Fecha de inicio */}
                  <div>
                    <Input
                      id="fecha_inicio_contrato"
                      label="Fecha de inicio"
                      type="date"
                      value={data.fecha_inicio_contrato}
                      onChange={(e) => handleChange('fecha_inicio_contrato', e.target.value)}
                    />
                  </div>

                  {/* Duración del contrato */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Duración del contrato
                    </label>
                    <div className="flex gap-2">
                      <Input
                        id="duracion_contrato_valor"
                        type="number"
                        value={data.duracion_contrato_valor}
                        onChange={(e) => handleChange('duracion_contrato_valor', e.target.value)}
                        placeholder="12"
                        className="flex-1"
                      />
                      <select
                        value={data.duracion_contrato_unidad || 'meses'}
                        onChange={(e) => handleChange('duracion_contrato_unidad', e.target.value)}
                        className="w-32 px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ras-azul text-sm font-medium"
                      >
                        {DURACION_CONTRATO_UNIDAD.map(d => (
                          <option key={d.value} value={d.value}>{d.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Precio mensual */}
                  <div>
                    <Input
                      id="precio_mensual"
                      label="Precio mensual"
                      type="number"
                      value={data.precios?.mensual?.toString() || ''}
                      onChange={(e) => handlePrecioChange('mensual', e.target.value)}
                      placeholder="15000"
                      prefix="$"
                    />
                  </div>

                  {/* Frecuencia de pago */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Frecuencia de pago
                    </label>
                    <select
                      value={data.frecuencia_pago || 'mensual'}
                      onChange={(e) => handleChange('frecuencia_pago', e.target.value)}
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ras-azul text-sm font-medium"
                    >
                      {FRECUENCIA_PAGO.map(f => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Día de pago */}
                  <div>
                    <Input
                      id="dia_pago"
                      label="Día de pago"
                      type="number"
                      value={data.dia_pago}
                      onChange={(e) => handleChange('dia_pago', e.target.value)}
                      placeholder="5"
                      min="1"
                      max="31"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Campos solo si NO está rentado */}
            {!estaRentado && (
              <div className="space-y-4 pt-2">
                <div>
                  <Input
                    id="precio_renta_disponible"
                    label="Precio de renta (disponible)"
                    type="number"
                    value={data.precio_renta_disponible}
                    onChange={(e) => handleChange('precio_renta_disponible', e.target.value)}
                    placeholder="15000"
                    prefix="$"
                  />
                </div>

                {/* Requisitos de renta */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Requisitos de renta
                  </label>
                  <div className="space-y-2">
                    {/* Requisitos predefinidos como checkboxes */}
                    {['Aval', 'Depósito', 'Referencias'].map(req => (
                      <label key={req} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={data.requisitos_renta?.includes(req) || false}
                          onChange={(e) => {
                            const current = data.requisitos_renta || [];
                            const updated = e.target.checked
                              ? [...current, req]
                              : current.filter(r => r !== req);
                            handleChange('requisitos_renta', updated);
                          }}
                          className="rounded text-ras-azul focus:ring-ras-azul"
                        />
                        <span className="text-sm font-medium text-gray-700">{req}</span>
                      </label>
                    ))}

                    {/* Requisitos personalizados agregados */}
                    {data.requisitos_renta_custom?.map((req, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={true}
                          readOnly
                          className="rounded text-ras-azul focus:ring-ras-azul"
                        />
                        <span className="text-sm font-medium text-gray-700 flex-1">{req}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = data.requisitos_renta_custom?.filter((_, i) => i !== idx);
                            handleChange('requisitos_renta_custom', updated);
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}

                    {/* Input para agregar requisito personalizado */}
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="nuevo-requisito"
                        placeholder="Agregar requisito personalizado..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const input = e.target as HTMLInputElement;
                            const valor = input.value.trim();
                            if (valor) {
                              const customActuales = data.requisitos_renta_custom || [];
                              handleChange('requisitos_renta_custom', [...customActuales, valor]);
                              input.value = '';
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById('nuevo-requisito') as HTMLInputElement;
                          const valor = input?.value.trim();
                          if (valor) {
                            const customActuales = data.requisitos_renta_custom || [];
                            handleChange('requisitos_renta_custom', [...customActuales, valor]);
                            input.value = '';
                          }
                        }}
                        className="px-4 py-2 bg-ras-azul text-white rounded-lg hover:bg-ras-azul/90 transition-colors text-sm font-medium"
                      >
                        Agregar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'Renta vacacional':
        return (
          <div key={estado} className="space-y-5">
            <h3 className="font-bold text-gray-900 font-poppins text-lg">Renta Vacacional</h3>

            {/* Precio por noche */}
            <div>
              <Input
                id="precio_noche"
                label="Precio por noche"
                type="number"
                value={data.precios?.noche?.toString() || ''}
                onChange={(e) => handlePrecioChange('noche', e.target.value)}
                placeholder="1500"
                prefix="$"
              />
            </div>

            {/* Amenidades */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Amenidades
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {AMENIDADES_VACACIONAL.map(amenidad => (
                  <label
                    key={amenidad}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-all text-sm
                      ${data.amenidades_vacacional?.includes(amenidad)
                        ? 'border-ras-azul bg-ras-azul/5 text-ras-azul'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={data.amenidades_vacacional?.includes(amenidad)}
                      onChange={() => toggleAmenidad(amenidad)}
                      className="rounded text-ras-azul focus:ring-ras-azul"
                    />
                    <span className="font-medium">{amenidad}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 'Venta':
        return (
          <div key={estado} className="space-y-5">
            <h3 className="font-bold text-gray-900 font-poppins text-lg">Venta</h3>

            {/* Precio de venta */}
            <div>
              <Input
                id="precio_venta"
                label="Precio de venta"
                type="number"
                value={data.precios?.venta?.toString() || ''}
                onChange={(e) => handlePrecioChange('venta', e.target.value)}
                placeholder="3500000"
                prefix="$"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-5">
      {/* SECCIÓN: ASIGNACIONES */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 font-poppins mb-5">
          Asignaciones
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Propietario - COMBINA contactos + usuarios registrados */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Propietario
            </label>
            <div className="flex gap-2">
              <select
                value={data.propietario_id || ''}
                onChange={(e) => handleChange('propietario_id', e.target.value)}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ras-azul text-sm font-medium"
              >
                <option value="">Selecciona el propietario</option>
                {propietariosCombinados.length > 0 ? (
                  <>
                    {/* Primero contactos */}
                    {propietarios.length > 0 && (
                      <optgroup label="📋 Contactos registrados">
                        {propietarios.map(c => (
                          <option key={c.id} value={c.id}>{c.nombre}</option>
                        ))}
                      </optgroup>
                    )}
                    {/* Luego usuarios del sistema */}
                    {usuariosRegistrados.length > 0 && (
                      <optgroup label="👤 Usuarios del sistema">
                        {usuariosRegistrados.map(u => (
                          <option key={u.id} value={u.id}>{u.full_name}</option>
                        ))}
                      </optgroup>
                    )}
                  </>
                ) : null}
              </select>
              <button
                type="button"
                onClick={() => onAgregarContacto?.('propietario')}
                className="px-3 py-2.5 bg-ras-azul text-white rounded-lg hover:bg-ras-azul/90 transition-colors"
                title="Agregar propietario"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Supervisor - COMBINA contactos + usuarios registrados */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Supervisor
            </label>
            <div className="flex gap-2">
              <select
                value={data.supervisor_id || ''}
                onChange={(e) => handleChange('supervisor_id', e.target.value)}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ras-azul text-sm font-medium"
              >
                <option value="">Selecciona el supervisor</option>
                {supervisoresCombinados.length > 0 ? (
                  <>
                    {/* Primero contactos */}
                    {supervisores.length > 0 && (
                      <optgroup label="📋 Contactos registrados">
                        {supervisores.map(c => (
                          <option key={c.id} value={c.id}>{c.nombre}</option>
                        ))}
                      </optgroup>
                    )}
                    {/* Luego usuarios del sistema */}
                    {usuariosRegistrados.length > 0 && (
                      <optgroup label="👤 Usuarios del sistema">
                        {usuariosRegistrados.map(u => (
                          <option key={u.id} value={u.id}>{u.full_name}</option>
                        ))}
                      </optgroup>
                    )}
                  </>
                ) : null}
              </select>
              <button
                type="button"
                onClick={() => onAgregarContacto?.('supervisor')}
                className="px-3 py-2.5 bg-ras-azul text-white rounded-lg hover:bg-ras-azul/90 transition-colors"
                title="Agregar supervisor"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN: DATOS ESPECÍFICOS POR ESTADO */}
      {data.estados && data.estados.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 font-poppins mb-5">
            Datos Específicos
          </h2>

          <div className="space-y-6">
            {data.estados.map(estado => renderSection(estado))}
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-center">
          <div className="text-blue-600 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-blue-900 mb-1">
            Selecciona al menos un estado
          </h3>
          <p className="text-sm text-blue-700">
            Ve al Paso 1 y selecciona uno o más estados para la propiedad (Renta largo plazo, Renta vacacional, Venta, etc.)
          </p>
        </div>
      )}
    </div>
  );
}