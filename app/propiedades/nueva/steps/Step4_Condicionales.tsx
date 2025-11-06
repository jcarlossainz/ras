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
    tipo: 'inquilino' | 'proveedor';
  }>;
  onAgregarContacto?: (tipo: 'inquilino' | 'proveedor') => void;
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

export default function Step4_Condicionales({ data, onUpdate, contactos = [], onAgregarContacto }: Step4Props) {
  // Determinar si está rentado basado en si hay inquilino_id con valor
  const [estaRentado, setEstaRentado] = React.useState(false);

  // Filtrar solo inquilinos
  const inquilinos = contactos.filter(c => c.tipo === 'inquilino');

  // Sincronizar el estado cuando cambie el inquilino_id desde fuera
  React.useEffect(() => {
    setEstaRentado(!!data.inquilino_id && data.inquilino_id !== '');
  }, [data.inquilino_id]);

  const handleChange = (field: keyof PropertyFormData, value: any) => {
    onUpdate({ [field]: value });
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
      handleChange('costo_renta_mensual', '');
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
                    Inquilino
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
                        min="1"
                      />
                      <select
                        value={data.duracion_contrato_unidad || 'meses'}
                        onChange={(e) => handleChange('duracion_contrato_unidad', e.target.value)}
                        className="w-28 px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ras-azul focus:border-transparent font-roboto text-sm"
                      >
                        {DURACION_CONTRATO_UNIDAD.map(unidad => (
                          <option key={unidad.value} value={unidad.value}>{unidad.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Monto de renta */}
                  <div>
                    <Input
                      id="costo_renta_mensual"
                      label="Monto de renta"
                      type="number"
                      value={data.costo_renta_mensual}
                      onChange={(e) => handleChange('costo_renta_mensual', e.target.value)}
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
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ras-azul focus:border-transparent font-roboto text-sm"
                    >
                      {FRECUENCIA_PAGO.map(frecuencia => (
                        <option key={frecuencia.value} value={frecuencia.value}>
                          {frecuencia.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Día de pago */}
                  <div className="md:col-span-2">
                    <Input
                      id="dia_pago"
                      label="Día de pago del mes"
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

            {/* Campos cuando NO está rentado */}
            {!estaRentado && (
              <div className="space-y-4 pt-2">
                {/* Precio de renta */}
                <div>
                  <Input
                    id="precio_renta_disponible"
                    label="Precio de renta"
                    type="number"
                    value={data.precio_renta_disponible}
                    onChange={(e) => handleChange('precio_renta_disponible', e.target.value)}
                    placeholder="15000"
                    prefix="$"
                  />
                </div>

                {/* Requisitos */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Requisitos
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {/* Requisitos predefinidos */}
                    {['Depósito de garantía', 'Aval', 'Pet Friendly', 'Comprobante de ingresos', 'Referencias personales', 'Seguro de arrendamiento'].map(requisito => (
                      <label
                        key={requisito}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={data.requisitos_renta?.includes(requisito) || false}
                          onChange={(e) => {
                            const requisitos = data.requisitos_renta || [];
                            const newRequisitos = e.target.checked
                              ? [...requisitos, requisito]
                              : requisitos.filter(r => r !== requisito);
                            handleChange('requisitos_renta', newRequisitos);
                          }}
                          className="rounded text-ras-azul focus:ring-ras-azul"
                        />
                        <span className="text-sm font-medium text-gray-700">{requisito}</span>
                      </label>
                    ))}

                    {/* Requisitos personalizados */}
                    {data.requisitos_renta_custom?.map((requisito, index) => (
                      <div key={`custom-${index}`} className="flex items-center gap-2">
                        <label className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-blue-50">
                          <input
                            type="checkbox"
                            checked
                            disabled
                            className="rounded text-ras-azul"
                          />
                          <span className="text-sm font-medium text-gray-700">{requisito}</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const newCustom = data.requisitos_renta_custom?.filter((_, i) => i !== index) || [];
                            handleChange('requisitos_renta_custom', newCustom);
                          }}
                          className="px-2 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {/* Botón agregar otro requisito */}
                    <button
                      type="button"
                      onClick={() => {
                        const nuevoRequisito = prompt('Ingresa el requisito personalizado:');
                        if (nuevoRequisito && nuevoRequisito.trim()) {
                          const custom = data.requisitos_renta_custom || [];
                          handleChange('requisitos_renta_custom', [...custom, nuevoRequisito.trim()]);
                        }
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed border-gray-300 hover:border-ras-azul hover:bg-ras-azul/5 transition-all justify-center text-gray-600 hover:text-ras-azul"
                    >
                      <span className="text-lg">+</span>
                      <span className="text-sm font-medium">Otro</span>
                    </button>
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
                value={data.precio_noche}
                onChange={(e) => handleChange('precio_noche', e.target.value)}
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

            <div>
              <Input
                id="precio_venta"
                label="Precio de venta"
                type="number"
                value={data.precio_venta}
                onChange={(e) => handleChange('precio_venta', e.target.value)}
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
                {contactos.filter(c => c.tipo === 'inquilino').map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => onAgregarContacto?.('inquilino')}
                className="px-3 py-2.5 bg-ras-azul text-white rounded-lg hover:bg-ras-azul/90 transition-colors"
                title="Agregar propietario"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          </div>

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
                {contactos.filter(c => c.tipo === 'inquilino').map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => onAgregarContacto?.('inquilino')}
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

      {/* SECCIÓN: DATOS CONDICIONALES */}
      {data.estados.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5">
          <div className="flex gap-3">
            <span className="text-yellow-600 text-xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-yellow-900 mb-1">No hay estados seleccionados</h3>
              <p className="text-sm text-yellow-800">
                Regresa al Paso 1 y selecciona al menos un estado para continuar.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {data.estados.map(estado => (
            <div key={estado} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {renderSection(estado)}
            </div>
          ))}
        </>
      )}
    </div>
  );
}