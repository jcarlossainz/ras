'use client';

import React from 'react';
import { PropertyFormData } from '@/types/property';
import Input from '@/components/ui/input';

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
  'Estudio',
  'Oficina',
  'Local comercial',
  'Bodega'
];

const ESTADOS_PROPIEDAD = [
  'Renta largo plazo',
  'Renta vacacional',
  'Venta',
  'Mantenimiento',
  'Suspendido',
  'Propietario'
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
      {/* SECCIÓN: BÁSICOS */}
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 font-poppins flex items-center gap-2">
            <svg className="w-6 h-6 text-ras-azul" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Básicos</span>
          </h2>
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
              placeholder="Ej: Departamento Laguna 305"
              required
            />
          </div>

          {/* Tipo de propiedad */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tipo de propiedad
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
              Mobiliario
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
                className="w-20 px-2 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ras-azul focus:border-transparent font-roboto"
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
                className="w-20 px-2 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ras-azul focus:border-transparent font-roboto"
              >
                <option value="m²">m²</option>
                <option value="ft²">ft²</option>
              </select>
            </div>
          </div>

          {/* Estado actual */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Estado actual
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ESTADOS_PROPIEDAD.map(estado => (
                <label
                  key={estado}
                  className={`
                    flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 cursor-pointer transition-all
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
          </div>
        </div>
      </div>
    </div>
  );
}
