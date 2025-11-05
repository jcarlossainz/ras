// 📁 src/app/api/vision/analyze/route.ts
// API para analizar imágenes con Google Cloud Vision

import { NextRequest, NextResponse } from 'next/server';
import { analyzeImage } from '@/lib/google-vision';
import { supabase } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { propertyId, imageId, imageUrl, spaceType } = body;

    if (!propertyId || !imageId || !imageUrl) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos' },
        { status: 400 }
      );
    }

    console.log('🔍 Iniciando análisis de imagen:', imageId);

    // 1. Analizar imagen con Google Vision
    const detectedObjects = await analyzeImage(imageUrl);

    if (detectedObjects.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No se detectaron objetos en la imagen',
        count: 0
      });
    }

    // 2. Guardar objetos en la base de datos
    const inventoryItems = detectedObjects.map(obj => ({
      property_id: propertyId,
      image_id: imageId,
      object_name: obj.name,
      confidence: obj.confidence,
      space_type: spaceType || null,
      image_url: imageUrl
    }));

    const { data, error } = await supabase
      .from('property_inventory')
      .insert(inventoryItems)
      .select();

    if (error) {
      console.error('❌ Error guardando en BD:', error);
      throw error;
    }

    console.log(`✅ ${data.length} objetos guardados en inventario`);

    return NextResponse.json({
      success: true,
      message: `${data.length} objetos detectados y guardados`,
      count: data.length,
      objects: detectedObjects
    });

  } catch (error) {
    console.error('❌ Error en API analyze:', error);
    return NextResponse.json(
      { 
        error: 'Error al analizar imagen',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

// Endpoint para análisis masivo
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { propertyId } = body;

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID es requerido' },
        { status: 400 }
      );
    }

    console.log('🔍 Iniciando análisis masivo para propiedad:', propertyId);

    // 1. Obtener todas las imágenes de la propiedad
    const { data: images, error: imagesError } = await supabase
      .from('property_images')
      .select('*')
      .eq('property_id', propertyId);

    if (imagesError) throw imagesError;

    if (!images || images.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No hay imágenes para analizar',
        count: 0
      });
    }

    // 2. Limpiar inventario anterior de esta propiedad
    await supabase
      .from('property_inventory')
      .delete()
      .eq('property_id', propertyId);

    // 3. Analizar cada imagen
    let totalObjects = 0;
    const results = [];

    for (const image of images) {
      try {
        const detectedObjects = await analyzeImage(image.url);
        
        if (detectedObjects.length > 0) {
          const inventoryItems = detectedObjects.map(obj => ({
            property_id: propertyId,
            image_id: image.id,
            object_name: obj.name,
            confidence: obj.confidence,
            space_type: image.space_type || null,
            image_url: image.url_thumbnail || image.url
          }));

          const { error } = await supabase
            .from('property_inventory')
            .insert(inventoryItems);

          if (!error) {
            totalObjects += detectedObjects.length;
            results.push({
              imageId: image.id,
              objectsFound: detectedObjects.length
            });
          }
        }

        // Delay entre requests
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`Error analizando imagen ${image.id}:`, error);
      }
    }

    console.log(`✅ Análisis masivo completado: ${totalObjects} objetos`);

    return NextResponse.json({
      success: true,
      message: `Análisis completado: ${totalObjects} objetos detectados`,
      imagesProcessed: images.length,
      totalObjects,
      results
    });

  } catch (error) {
    console.error('❌ Error en análisis masivo:', error);
    return NextResponse.json(
      { 
        error: 'Error en análisis masivo',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
