'use client';

import React from 'react';
import { PropertyFormData } from '@/types/property';
import Input from '@/components/ui/Input';
import ContactSelector from '../components/ContactSelector';

interface Step1Props {
  data: PropertyFormData;
  onUpdate: (data: Partial<PropertyFormData>) => void;
}

const TIPOS_PROPIEDAD = [
  'Departamento',
  'Casa',
  'Villa',
  'Condominio',
  'Penthouse',
  'Loft',
  'Estudio'
];

const ESTADOS_PROPIEDAD = [
  'Renta largo plazo',
  'Renta vacacional',
  'Venta'
];

const OPCIONES_MOBILIARIO = [
  'Amueblada',
  'Semi-amueblada',
  'Sin amueblar'
];

export default function Step1_DatosGenerales({ data, onUpdate }: Step1Props) {
  const handleChange = (field: keyof PropertyFormData, value: any) => {
    onUpdate({ [field]: value });
  };

  const toggleEstado = (estado: string) => {
    const newEstados = data.estados.includes(estado)
      ? data.estados.filter(e => e !== estado)
      : [...data.estados, estado];
    handleChange('estados', newEstados);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-8">
      {/* SECCIÓN: DATOS BÁSICOS */}
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 font-poppins flex items-center gap-2">
            <span>📋</span>
            Datos Básicos
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Información general de la propiedad
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre de la propiedad */}
          <div className="md:col-span-2">
            <Input
              id="nombre_propiedad"
              label="Nombre de la propiedad"
              type="text"
              value={data.nombre_propiedad}
              onChange={(e) => handleChange('nombre_propiedad', e.target.value)}
              placeholder="Ej: Departamento Vista Mar"
              required
            />
          </div>

          {/* Tipo de propiedad */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tipo de propiedad <span className="text-red-500">*</span>
            </label>
            <select
              value={data.tipo_propiedad}
              onChange={(e) => handleChange('tipo_propiedad', e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ras-azul focus:border-transparent font-roboto"
            >
              {TIPOS_PROPIEDAD.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>

          {/* Mobiliario */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mobiliario <span className="text-red-500">*</span>
            </label>
            <select
              value={data.mobiliario}
              onChange={(e) => handleChange('mobiliario', e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ras-azul focus:border-transparent font-roboto"
            >
              {OPCIONES_MOBILIARIO.map(opcion => (
                <option key={opcion} value={opcion}>{opcion}</option>
              ))}
            </select>
          </div>

          {/* Estados */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Estado de la propiedad <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-3">
              {ESTADOS_PROPIEDAD.map(estado => (
                <label
                  key={estado}
                  className={`
                    flex items-center gap-2 px-4 py-3 rounded-lg border-2 cursor-pointer transition-all
                    ${data.estados.includes(estado)
                      ? 'border-ras-azul bg-ras-azul/5 text-ras-azul'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={data.estados.includes(estado)}
                    onChange={() => toggleEstado(estado)}
                    className="rounded text-ras-azul focus:ring-ras-azul"
                  />
                  <span className="text-sm font-medium">{estado}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Puedes seleccionar múltiples estados si la propiedad está disponible para diferentes opciones
            </p>
          </div>

          {/* Capacidad de personas */}
          <div>
            <Input
              id="capacidad_personas"
              label="Capacidad de personas"
              type="number"
              value={data.capacidad_personas}
              onChange={(e) => handleChange('capacidad_personas', e.target.value)}
              placeholder="Ej: 6"
            />
          </div>

          {/* Tamaño del terreno */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tamaño del terreno
            </label>
            <div className="flex gap-2">
              <Input
                id="tamano_terreno"
                type="number"
                value={data.tamano_terreno}
                onChange={(e) => handleChange('tamano_terreno', e.target.value)}
                placeholder="Ej: 150"
                className="flex-1"
              />
              <select
                value={data.tamano_terreno_unit}
                onChange={(e) => handleChange('tamano_terreno_unit', e.target.value)}
                className="w-24 px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ras-azul"
              >
                <option value="m²">m²</option>
                <option value="ft²">ft²</option>
              </select>
            </div>
          </div>

          {/* Tamaño de construcción */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tamaño de construcción
            </label>
            <div className="flex gap-2">
              <Input
                id="tamano_construccion"
                type="number"
                value={data.tamano_construccion}
                onChange={(e) => handleChange('tamano_construccion', e.target.value)}
                placeholder="Ej: 120"
                className="flex-1"
              />
              <select
                value={data.tamano_construccion_unit}
                onChange={(e) => handleChange('tamano_construccion_unit', e.target.value)}
                className="w-24 px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ras-azul"
              >
                <option value="m²">m²</option>
                <option value="ft²">ft²</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* DIVISOR */}
      <div className="border-t border-gray-200"></div>

      {/* SECCIÓN: ASIGNACIONES */}
      <div>
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
              Propietario <span className="text-red-500">*</span>
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

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <span className="text-blue-600 text-xl">💡</span>
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 mb-1">Tip</h4>
            <p className="text-sm text-blue-800">
              Completa todos los campos obligatorios (marcados con *) antes de continuar al siguiente paso.
              Los campos opcionales pueden completarse más tarde.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
