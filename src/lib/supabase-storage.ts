// ═══════════════════════════════════════════════════════
// FUNCIONES DE SUPABASE STORAGE
// ═══════════════════════════════════════════════════════
//
// Este archivo contiene todas las funciones para:
// - Subir fotos de OTs
// - Listar fotos de una OT
// - Eliminar fotos
// - Obtener URLs firmadas
//
// ═══════════════════════════════════════════════════════

import { supabase } from './supabase';

// ───────────────────────────────────────────────────────
// TIPOS
// ───────────────────────────────────────────────────────

export interface FotoOT {
  nombre: string;
  url: string;
  size: number;
  created_at: string;
}

// ───────────────────────────────────────────────────────
// SUBIR FOTO
// ───────────────────────────────────────────────────────

/**
 * Sube una foto de evidencia de una OT
 *
 * @param otNumero - Número de la OT (ej: "OT-2024-001")
 * @param empresaId - ID de la empresa
 * @param fotoUri - URI local de la foto (ej: "file:///path/to/photo.jpg")
 * @param nombreArchivo - Nombre del archivo (ej: "antes-01.jpg")
 * @returns URL firmada de la foto subida o null si falla
 *
 * @example
 * const url = await subirFotoOT('OT-2024-001', 1, 'file:///photo.jpg', 'antes-01.jpg');
 * if (url) {
 *   console.log('Foto subida:', url);
 * }
 */
export async function subirFotoOT(
  otNumero: string,
  empresaId: number,
  fotoUri: string,
  nombreArchivo?: string
): Promise<string | null> {
  try {
    // 1. Generar nombre único si no se proporciona
    const timestamp = Date.now();
    const nombre = nombreArchivo || `foto-${timestamp}.jpg`;

    // 2. Leer el archivo desde el URI
    const response = await fetch(fotoUri);
    const blob = await response.blob();

    // 3. Construir el path según nuestra estructura
    // empresa-{id}/ot-{numero}/{nombre}
    const filePath = `empresa-${empresaId}/${otNumero}/${nombre}`;

    console.log('📤 Subiendo foto a:', filePath);

    // 4. Subir a Supabase Storage
    const { data, error } = await supabase.storage
      .from('ots-evidencias')
      .upload(filePath, blob, {
        contentType: 'image/jpeg',
        upsert: false, // No sobreescribir si ya existe
      });

    if (error) {
      console.error('❌ Error subiendo foto:', error.message);
      return null;
    }

    console.log('✅ Foto subida exitosamente:', data.path);

    // 5. Generar URL firmada (válida por 1 año)
    const { data: urlData } = await supabase.storage
      .from('ots-evidencias')
      .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 365 días

    if (!urlData?.signedUrl) {
      console.error('❌ Error generando URL firmada');
      return null;
    }

    return urlData.signedUrl;
  } catch (error) {
    console.error('❌ Error en subirFotoOT:', error);
    return null;
  }
}

// ───────────────────────────────────────────────────────
// LISTAR FOTOS
// ───────────────────────────────────────────────────────

/**
 * Obtiene todas las fotos de una OT
 *
 * @param otNumero - Número de la OT
 * @param empresaId - ID de la empresa
 * @returns Array de fotos con sus URLs firmadas
 *
 * @example
 * const fotos = await obtenerFotosOT('OT-2024-001', 1);
 * fotos.forEach(foto => {
 *   console.log('Foto:', foto.nombre, 'URL:', foto.url);
 * });
 */
export async function obtenerFotosOT(
  otNumero: string,
  empresaId: number
): Promise<FotoOT[]> {
  try {
    // 1. Construir path de la carpeta
    const folderPath = `empresa-${empresaId}/${otNumero}`;

    console.log('📂 Listando fotos de:', folderPath);

    // 2. Listar archivos en la carpeta
    const { data, error } = await supabase.storage
      .from('ots-evidencias')
      .list(folderPath, {
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      console.error('❌ Error listando fotos:', error.message);
      return [];
    }

    if (!data || data.length === 0) {
      console.log('📭 No hay fotos en esta OT');
      return [];
    }

    console.log(`✅ Se encontraron ${data.length} fotos`);

    // 3. Generar URLs firmadas para cada foto
    const fotosConUrls = await Promise.all(
      data
        .filter(file => file.name !== '.emptyFolderPlaceholder') // Ignorar placeholder
        .map(async (file) => {
          const filePath = `${folderPath}/${file.name}`;

          // URL firmada válida por 1 hora
          const { data: urlData } = await supabase.storage
            .from('ots-evidencias')
            .createSignedUrl(filePath, 60 * 60); // 1 hora

          return {
            nombre: file.name,
            url: urlData?.signedUrl || '',
            size: file.metadata?.size || 0,
            created_at: file.created_at || '',
          };
        })
    );

    // 4. Filtrar fotos con URL válida
    return fotosConUrls.filter(foto => foto.url !== '');
  } catch (error) {
    console.error('❌ Error en obtenerFotosOT:', error);
    return [];
  }
}

// ───────────────────────────────────────────────────────
// ELIMINAR FOTO
// ───────────────────────────────────────────────────────

/**
 * Elimina una foto de evidencia (solo admin)
 *
 * @param otNumero - Número de la OT
 * @param empresaId - ID de la empresa
 * @param nombreArchivo - Nombre del archivo a eliminar
 * @returns true si se eliminó correctamente
 *
 * @example
 * const eliminada = await eliminarFotoOT('OT-2024-001', 1, 'antes-01.jpg');
 * if (eliminada) {
 *   console.log('Foto eliminada');
 * }
 */
export async function eliminarFotoOT(
  otNumero: string,
  empresaId: number,
  nombreArchivo: string
): Promise<boolean> {
  try {
    // 1. Construir path completo
    const filePath = `empresa-${empresaId}/${otNumero}/${nombreArchivo}`;

    console.log('🗑️ Eliminando foto:', filePath);

    // 2. Eliminar de Supabase Storage
    const { error } = await supabase.storage
      .from('ots-evidencias')
      .remove([filePath]);

    if (error) {
      console.error('❌ Error eliminando foto:', error.message);
      return false;
    }

    console.log('✅ Foto eliminada exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error en eliminarFotoOT:', error);
    return false;
  }
}

// ───────────────────────────────────────────────────────
// ELIMINAR TODAS LAS FOTOS DE UNA OT
// ───────────────────────────────────────────────────────

/**
 * Elimina todas las fotos de una OT (solo admin)
 *
 * @param otNumero - Número de la OT
 * @param empresaId - ID de la empresa
 * @returns Número de fotos eliminadas
 *
 * @example
 * const cantidad = await eliminarTodasFotosOT('OT-2024-001', 1);
 * console.log(`Se eliminaron ${cantidad} fotos`);
 */
export async function eliminarTodasFotosOT(
  otNumero: string,
  empresaId: number
): Promise<number> {
  try {
    // 1. Listar todas las fotos
    const fotos = await obtenerFotosOT(otNumero, empresaId);

    if (fotos.length === 0) {
      console.log('📭 No hay fotos para eliminar');
      return 0;
    }

    // 2. Construir paths de todas las fotos
    const folderPath = `empresa-${empresaId}/${otNumero}`;
    const filePaths = fotos.map(foto => `${folderPath}/${foto.nombre}`);

    console.log(`🗑️ Eliminando ${filePaths.length} fotos...`);

    // 3. Eliminar todas las fotos
    const { error } = await supabase.storage
      .from('ots-evidencias')
      .remove(filePaths);

    if (error) {
      console.error('❌ Error eliminando fotos:', error.message);
      return 0;
    }

    console.log(`✅ Se eliminaron ${filePaths.length} fotos`);
    return filePaths.length;
  } catch (error) {
    console.error('❌ Error en eliminarTodasFotosOT:', error);
    return 0;
  }
}

// ───────────────────────────────────────────────────────
// OBTENER URL PÚBLICA TEMPORAL
// ───────────────────────────────────────────────────────

/**
 * Genera una URL firmada temporal para una foto
 *
 * @param otNumero - Número de la OT
 * @param empresaId - ID de la empresa
 * @param nombreArchivo - Nombre del archivo
 * @param duracionSegundos - Duración de validez en segundos (default: 1 hora)
 * @returns URL firmada temporal
 *
 * @example
 * const url = await obtenerUrlTemporalFoto('OT-2024-001', 1, 'antes-01.jpg', 3600);
 * // URL válida por 1 hora
 */
export async function obtenerUrlTemporalFoto(
  otNumero: string,
  empresaId: number,
  nombreArchivo: string,
  duracionSegundos: number = 3600 // Default: 1 hora
): Promise<string | null> {
  try {
    const filePath = `empresa-${empresaId}/${otNumero}/${nombreArchivo}`;

    const { data, error } = await supabase.storage
      .from('ots-evidencias')
      .createSignedUrl(filePath, duracionSegundos);

    if (error) {
      console.error('❌ Error generando URL temporal:', error.message);
      return null;
    }

    return data?.signedUrl || null;
  } catch (error) {
    console.error('❌ Error en obtenerUrlTemporalFoto:', error);
    return null;
  }
}

// ───────────────────────────────────────────────────────
// VERIFICAR SI EXISTE FOTO
// ───────────────────────────────────────────────────────

/**
 * Verifica si existe una foto específica
 *
 * @param otNumero - Número de la OT
 * @param empresaId - ID de la empresa
 * @param nombreArchivo - Nombre del archivo
 * @returns true si existe
 *
 * @example
 * const existe = await existeFoto('OT-2024-001', 1, 'antes-01.jpg');
 * if (existe) {
 *   console.log('La foto ya existe');
 * }
 */
export async function existeFoto(
  otNumero: string,
  empresaId: number,
  nombreArchivo: string
): Promise<boolean> {
  try {
    const fotos = await obtenerFotosOT(otNumero, empresaId);
    return fotos.some(foto => foto.nombre === nombreArchivo);
  } catch (error) {
    console.error('❌ Error en existeFoto:', error);
    return false;
  }
}
