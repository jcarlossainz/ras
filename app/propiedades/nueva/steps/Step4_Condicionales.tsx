'use client';

import React from 'react';
import { PropertyFormData } from '@/types/property';
import Input from '@/components/ui/input';
import ContactSelector from '../components/ContactSelector';

interface Step4Props {
  data: PropertyFormData;
  onUpdate: (data: Partial<PropertyFormData>) => void;
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

export default function Step4_Condicionales({ data, onUpdate }: Step4Props) {
  const handleChange = (field: keyof PropertyFormData, value: any) => {
    onUpdate({ [field]: value });
  };

  const toggleAmenidad = (amenidad: string) => {
    const newAmenidades = data.amenidades_vacacional?.includes(amenidad)
      ? data.amenidades_vacacional.filter(a => a !== amenidad)
      : [...(data.amenidades_vacacional || []), amenidad];
    handleChange('amenidades_vacacional', newAmenidades);
  };

  const renderSection = (estado: string) => {
    switch (estado) {
      case 'Renta largo plazo':
        return (
          <div key={estado} className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-ras-azul to-ras-turquesa flex items-center justify-center">
                <span className="text-2xl">🏠</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 font-poppins">Renta Largo Plazo</h3>
                <p className="text-sm text-gray-600">Información para contratos de renta tradicional</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Inquilino */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Inquilino actual
                </label>
                <ContactSelector
                  value={data.inquilino_id}
                  onChange={(id) => handleChange('inquilino_id', id)}
                  placeholder="Selecciona el inquilino"
                  tipo="inquilino"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Opcional: Persona que actualmente renta la propiedad
                </p>
              </div>

              {/* Fecha de inicio de contrato */}
              <div>
                <Input
                  id="fecha_inicio_contrato"
                  label="Fecha de inicio de contrato"
                  type="date"
                  value={data.fecha_inicio_contrato}
                  onChange={(e) => handleChange('fecha_inicio_contrato', e.target.value)}
                />
              </div>

              {/* Costo de renta mensual */}
              <div className="md:col-span-2">
                <Input
                  id="costo_renta_mensual"
                  label="Costo de renta mensual"
                  type="number"
                  value={data.costo_renta_mensual}
                  onChange={(e) => handleChange('costo_renta_mensual', e.target.value)}
                  placeholder="Ej: 15000"
                  prefix="$"
                />
              </div>
            </div>
          </div>
        );

      case 'Renta vacacional':
        return (
          <div key={estado} className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-ras-turquesa to-ras-azul flex items-center justify-center">
                <span className="text-2xl">🏖️</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 font-poppins">Renta Vacacional</h3>
                <p className="text-sm text-gray-600">Información para rentas por noche</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Precio por noche */}
              <div>
                <Input
                  id="precio_noche"
                  label="Precio por noche"
                  type="number"
                  value={data.precio_noche}
                  onChange={(e) => handleChange('precio_noche', e.target.value)}
                  placeholder="Ej: 1500"
                  prefix="$"
                />
              </div>

              {/* Amenidades vacacional */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Amenidades
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {AMENIDADES_VACACIONAL.map(amenidad => (
                    <label
                      key={amenidad}
                      className={`
                        flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 cursor-pointer transition-all
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
                      <span className="text-sm font-medium">{amenidad}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'Venta':
        return (
          <div key={estado} className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 font-poppins">Venta</h3>
                <p className="text-sm text-gray-600">Precio de venta de la propiedad</p>
              </div>
            </div>

            <div>
              <Input
                id="precio_venta"
                label="Precio de venta"
                type="number"
                value={data.precio_venta}
                onChange={(e) => handleChange('precio_venta', e.target.value)}
                placeholder="Ej: 3500000"
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
    <div className="space-y-6">
      {/* SECCIÓN: ASIGNACIONES */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 font-poppins flex items-center gap-2">
            <span>👥</span>
            Asignaciones
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Propietario y supervisor de la propiedad
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Propietario */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Propietario
            </label>
            <ContactSelector
              value={data.propietario_id}
              onChange={(id) => handleChange('propietario_id', id)}
              placeholder="Selecciona el propietario"
              tipo="propietario"
            />
            <p className="text-xs text-gray-500 mt-1">
              La persona dueña de la propiedad
            </p>
          </div>

          {/* Supervisor */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Supervisor
            </label>
            <ContactSelector
              value={data.supervisor_id}
              onChange={(id) => handleChange('supervisor_id', id)}
              placeholder="Selecciona el supervisor"
              tipo="supervisor"
            />
            <p className="text-xs text-gray-500 mt-1">
              Persona encargada de la gestión
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN: DATOS CONDICIONALES SEGÚN ESTADO */}
      {data.estados.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex gap-3">
            <span className="text-yellow-600 text-2xl">⚠️</span>
            <div>
              <h3 className="font-bold text-yellow-900 mb-1">No hay estados seleccionados</h3>
              <p className="text-sm text-yellow-800">
                Regresa al Paso 1 y selecciona al menos un estado 
                (Renta largo plazo, Renta vacacional, Venta, etc.) para continuar.
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

          {/* Info box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <span className="text-blue-600 text-xl">💡</span>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-1">Información contextual</h4>
                <p className="text-sm text-blue-800">
                  Los campos que ves aquí dependen de los estados que seleccionaste en el Paso 1.
                  Todos los campos son opcionales por ahora.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
