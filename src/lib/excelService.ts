import * as XLSX from 'xlsx';
import {
  Pais,
  Producto,
  Tienda,
  Medio,
  RedSocial,
  TipoPublicacion,
  TipoContrato,
  EscalonesSeguidores,
} from '../types';

export type ValidationListType =
  | 'escalones'
  | 'paises'
  | 'productos'
  | 'tiendas'
  | 'medios'
  | 'redes'
  | 'tipos_pub'
  | 'tipos_contrato';

export interface ValidationTemplateConfig {
  type: ValidationListType;
  title: string;
  tableName: string;
  filename: string;
  columns: { key: string; label: string; required: boolean; description: string }[];
  sampleData: Record<string, any>[];
  validateRow: (row: Record<string, any>) => { isValid: boolean; parsed?: any; error?: string };
}

// Normalized key helper (e.g. "Seguidores Hasta" -> "seguidores_hasta")
export function normalizeKey(key: string): string {
  return key
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

export const VALIDATION_CONFIGS: Record<ValidationListType, ValidationTemplateConfig> = {
  escalones: {
    type: 'escalones',
    title: 'Escalones de Seguidores',
    tableName: 'escalones_seguidores',
    filename: 'modelo_escalones_seguidores',
    columns: [
      { key: 'id', label: 'ID', required: false, description: 'ID numérico (opcional)' },
      { key: 'seguidores_hasta', label: 'Seguidores Hasta', required: true, description: 'Límite superior de seguidores (entero > 0)' },
      { key: 'usd_mes', label: 'USD Mes', required: true, description: 'Monto mensual equivalente en USD (número > 0)' },
      { key: 'comentario', label: 'Comentario', required: false, description: 'Descripción o etiqueta del escalón' },
    ],
    sampleData: [
      { id: 1, seguidores_hasta: 50000, usd_mes: 100, comentario: 'Hasta 50K Seguidores' },
      { id: 2, seguidores_hasta: 100000, usd_mes: 150, comentario: 'Hasta 100K Seguidores' },
      { id: 3, seguidores_hasta: 200000, usd_mes: 200, comentario: 'Hasta 200K Seguidores' },
      { id: 4, seguidores_hasta: 500000, usd_mes: 425, comentario: 'Hasta 500K Seguidores' },
      { id: 5, seguidores_hasta: 1000000, usd_mes: 625, comentario: 'Hasta 1M Seguidores' },
      { id: 6, seguidores_hasta: 100000000, usd_mes: 1500, comentario: 'Hasta 100M Seguidores' },
    ],
    validateRow: (raw) => {
      const seguidoresHasta = Number(raw.seguidores_hasta || raw.seguidores || raw.hasta);
      const usdMes = Number(raw.usd_mes || raw.usd || raw.monto_mes || raw.usd_mensual);
      if (isNaN(seguidoresHasta) || seguidoresHasta <= 0) {
        return { isValid: false, error: 'Seguidores Hasta debe ser un número positivo mayor a 0' };
      }
      if (isNaN(usdMes) || usdMes <= 0) {
        return { isValid: false, error: 'USD Mes debe ser un número positivo mayor a 0' };
      }
      const parsed: EscalonesSeguidores = {
        id: raw.id ? Number(raw.id) : 0,
        seguidores_hasta: seguidoresHasta,
        usd_mes: usdMes,
        comentario: String(raw.comentario || `Hasta ${seguidoresHasta.toLocaleString('es-AR')} seguidores`),
      };
      return { isValid: true, parsed };
    },
  },

  paises: {
    type: 'paises',
    title: 'Países',
    tableName: 'paises',
    filename: 'modelo_paises',
    columns: [
      { key: 'id', label: 'ID', required: false, description: 'ID numérico (opcional)' },
      { key: 'nombre', label: 'Nombre', required: true, description: 'Nombre oficial del país' },
    ],
    sampleData: [
      { id: 1, nombre: 'Argentina' },
      { id: 2, nombre: 'Colombia' },
      { id: 3, nombre: 'Perú' },
      { id: 4, nombre: 'Uruguay' },
      { id: 5, nombre: 'Chile' },
      { id: 6, nombre: 'Ecuador' },
      { id: 7, nombre: 'Paraguay' },
      { id: 8, nombre: 'México' },
    ],
    validateRow: (raw) => {
      const nombre = String(raw.nombre || raw.pais || raw.country || '').trim();
      if (!nombre) {
        return { isValid: false, error: 'El nombre del país es obligatorio' };
      }
      const parsed: Pais = {
        id: raw.id ? Number(raw.id) : 0,
        nombre,
      };
      return { isValid: true, parsed };
    },
  },

  productos: {
    type: 'productos',
    title: 'Productos SKU',
    tableName: 'productos',
    filename: 'modelo_productos_sku',
    columns: [
      { key: 'sku', label: 'SKU', required: true, description: 'Identificador único del SKU (ej: CAR-COCH-001)' },
      { key: 'nombre', label: 'Nombre', required: true, description: 'Nombre descriptivo del producto' },
      { key: 'categoria', label: 'Categoría', required: false, description: 'Categoría (Cochecitos, Butacas, etc.)' },
    ],
    sampleData: [
      { sku: 'CAR-COCH-001', nombre: 'Cochecito Beverly Black', categoria: 'Cochecitos' },
      { sku: 'CAR-COCH-002', nombre: 'Cochecito Aspen Grey', categoria: 'Cochecitos' },
      { sku: 'CAR-BUTA-010', nombre: 'Butaca Auto Isofix 360', categoria: 'Butacas' },
      { sku: 'CAR-SILL-030', nombre: 'Silla de Comer Tasty Pink', categoria: 'Sillas de Comer' },
      { sku: 'CAR-ACCE-050', nombre: 'Bolso Maternal Dublin Beige', categoria: 'Accesorios' },
      { sku: 'CAR-PRACT-020', nombre: 'Practicuna Colecho Sweet Dreams', categoria: 'Practicunas' },
    ],
    validateRow: (raw) => {
      const sku = String(raw.sku || raw.codigo || raw.id || '').trim().toUpperCase();
      const nombre = String(raw.nombre || raw.producto || raw.descripcion || '').trim();
      const categoria = String(raw.categoria || raw.rubro || 'Accesorios').trim();
      if (!sku) {
        return { isValid: false, error: 'El SKU es obligatorio y debe ser único' };
      }
      if (!nombre) {
        return { isValid: false, error: 'El nombre del producto es obligatorio' };
      }
      const parsed: Producto = {
        sku,
        nombre,
        categoria: categoria || 'General',
      };
      return { isValid: true, parsed };
    },
  },

  tiendas: {
    type: 'tiendas',
    title: 'Tiendas & Sucursales',
    tableName: 'tiendas',
    filename: 'modelo_tiendas',
    columns: [
      { key: 'id', label: 'ID', required: false, description: 'ID numérico (opcional)' },
      { key: 'nombre', label: 'Nombre', required: true, description: 'Nombre de la tienda / sucursal' },
    ],
    sampleData: [
      { id: 1, nombre: 'Tienda Unicenter Martínez (Buenos Aires)' },
      { id: 2, nombre: 'Tienda Alto Palermo CABA' },
      { id: 3, nombre: 'Tienda Córdoba Shopping Villa Cabrera' },
      { id: 4, nombre: 'Tienda Rosario Shopping del Siglo' },
      { id: 5, nombre: 'Tienda Bogotá Calle 122 (Colombia)' },
      { id: 6, nombre: 'Tienda Jockey Plaza Lima (Perú)' },
    ],
    validateRow: (raw) => {
      const nombre = String(raw.nombre || raw.tienda || raw.sucursal || '').trim();
      if (!nombre) {
        return { isValid: false, error: 'El nombre de la tienda es obligatorio' };
      }
      const parsed: Tienda = {
        id: raw.id ? Number(raw.id) : 0,
        nombre,
      };
      return { isValid: true, parsed };
    },
  },

  medios: {
    type: 'medios',
    title: 'Medios de Difusión',
    tableName: 'medios',
    filename: 'modelo_medios',
    columns: [
      { key: 'id', label: 'ID', required: false, description: 'ID numérico (opcional)' },
      { key: 'nombre', label: 'Nombre', required: true, description: 'Nombre del medio' },
    ],
    sampleData: [
      { id: 1, nombre: 'Redes Sociales' },
      { id: 2, nombre: 'Prensa / Gráfica' },
      { id: 3, nombre: 'Radio / Podcast' },
      { id: 4, nombre: 'Televisión' },
      { id: 5, nombre: 'Portal Web / Blog' },
    ],
    validateRow: (raw) => {
      const nombre = String(raw.nombre || raw.medio || '').trim();
      if (!nombre) return { isValid: false, error: 'El nombre del medio es obligatorio' };
      return { isValid: true, parsed: { id: raw.id ? Number(raw.id) : 0, nombre } };
    },
  },

  redes: {
    type: 'redes',
    title: 'Redes Sociales',
    tableName: 'redes_sociales',
    filename: 'modelo_redes_sociales',
    columns: [
      { key: 'id', label: 'ID', required: false, description: 'ID numérico (opcional)' },
      { key: 'nombre', label: 'Nombre', required: true, description: 'Nombre de la red social' },
    ],
    sampleData: [
      { id: 1, nombre: 'Instagram' },
      { id: 2, nombre: 'TikTok' },
      { id: 3, nombre: 'Facebook' },
      { id: 4, nombre: 'YouTube' },
      { id: 5, nombre: 'Twitter / X' },
      { id: 6, nombre: 'LinkedIn' },
    ],
    validateRow: (raw) => {
      const nombre = String(raw.nombre || raw.red || raw.red_social || '').trim();
      if (!nombre) return { isValid: false, error: 'El nombre de la red social es obligatorio' };
      return { isValid: true, parsed: { id: raw.id ? Number(raw.id) : 0, nombre } };
    },
  },

  tipos_pub: {
    type: 'tipos_pub',
    title: 'Tipos de Publicación',
    tableName: 'tipos_publicacion',
    filename: 'modelo_tipos_publicacion',
    columns: [
      { key: 'id', label: 'ID', required: false, description: 'ID numérico (opcional)' },
      { key: 'nombre', label: 'Nombre', required: true, description: 'Formato de publicación' },
    ],
    sampleData: [
      { id: 1, nombre: 'Stories' },
      { id: 2, nombre: 'Reel' },
      { id: 3, nombre: 'Carrusel' },
      { id: 4, nombre: 'Post Estático' },
      { id: 5, nombre: 'Video Largo / Vlog' },
    ],
    validateRow: (raw) => {
      const nombre = String(raw.nombre || raw.tipo || raw.publicacion || '').trim();
      if (!nombre) return { isValid: false, error: 'El formato de publicación es obligatorio' };
      return { isValid: true, parsed: { id: raw.id ? Number(raw.id) : 0, nombre } };
    },
  },

  tipos_contrato: {
    type: 'tipos_contrato',
    title: 'Tipos de Contrato',
    tableName: 'tipos_contrato',
    filename: 'modelo_tipos_contrato',
    columns: [
      { key: 'id', label: 'ID', required: false, description: 'ID numérico (opcional)' },
      { key: 'nombre', label: 'Nombre', required: true, description: 'Modalidad de acuerdo' },
    ],
    sampleData: [
      { id: 1, nombre: 'Canje' },
      { id: 2, nombre: 'Pago' },
      { id: 3, nombre: 'Mixto' },
    ],
    validateRow: (raw) => {
      const nombre = String(raw.nombre || raw.tipo || raw.contrato || '').trim();
      if (!nombre) return { isValid: false, error: 'El tipo de contrato es obligatorio' };
      return { isValid: true, parsed: { id: raw.id ? Number(raw.id) : 0, nombre } };
    },
  },
};

/**
 * Generates and downloads a model template file in Excel (.xlsx) or CSV format.
 */
export function downloadTemplate(type: ValidationListType, format: 'xlsx' | 'csv' = 'xlsx') {
  const config = VALIDATION_CONFIGS[type];
  if (!config) throw new Error(`Configuración no encontrada para ${type}`);

  // Create worksheet with sample data
  const ws = XLSX.utils.json_to_sheet(config.sampleData);

  // Set column widths for aesthetic Excel readability
  const colWidths = config.columns.map((col) => ({
    wch: Math.max(col.label.length, 16),
  }));
  ws['!cols'] = colWidths;

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, config.tableName);

  if (format === 'xlsx') {
    XLSX.writeFile(wb, `${config.filename}.xlsx`);
  } else {
    XLSX.writeFile(wb, `${config.filename}.csv`, { bookType: 'csv' });
  }
}

/**
 * Exports current live data of a validation list to Excel (.xlsx) or CSV.
 */
export function exportCurrentData(
  type: ValidationListType,
  data: any[],
  format: 'xlsx' | 'csv' = 'xlsx'
) {
  const config = VALIDATION_CONFIGS[type];
  if (!config) throw new Error(`Configuración no encontrada para ${type}`);

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, config.tableName);

  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `carestino_${config.tableName}_${dateStr}`;

  if (format === 'xlsx') {
    XLSX.writeFile(wb, `${filename}.xlsx`);
  } else {
    XLSX.writeFile(wb, `${filename}.csv`, { bookType: 'csv' });
  }
}

export interface ParseResult<T = any> {
  totalRows: number;
  validRows: T[];
  invalidRows: { rowNumber: number; raw: Record<string, any>; error: string }[];
  headersDetected: string[];
}

/**
 * Parses an uploaded Excel (.xlsx, .xls) or CSV file and validates it against the schema.
 */
export async function parseUploadedFile(
  file: File,
  type: ValidationListType
): Promise<ParseResult> {
  const config = VALIDATION_CONFIGS[type];
  if (!config) throw new Error(`Configuración no encontrada para ${type}`);

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });

  if (!workbook.SheetNames.length) {
    throw new Error('El archivo no contiene hojas válidas.');
  }

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convert to JSON
  const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });

  if (rawRows.length === 0) {
    throw new Error('El archivo está vacío o no contiene filas con datos legibles.');
  }

  const detectedHeaders = Object.keys(rawRows[0] || {});

  const validRows: any[] = [];
  const invalidRows: { rowNumber: number; raw: Record<string, any>; error: string }[] = [];

  rawRows.forEach((row, idx) => {
    // Normalize keys of each row
    const normalizedRow: Record<string, any> = {};
    for (const [key, val] of Object.entries(row)) {
      normalizedRow[normalizeKey(key)] = typeof val === 'string' ? val.trim() : val;
    }

    const { isValid, parsed, error } = config.validateRow(normalizedRow);
    if (isValid && parsed) {
      validRows.push(parsed);
    } else {
      invalidRows.push({
        rowNumber: idx + 2, // Excel row offset (1-indexed + header)
        raw: row,
        error: error || 'Datos no válidos',
      });
    }
  });

  return {
    totalRows: rawRows.length,
    validRows,
    invalidRows,
    headersDetected: detectedHeaders,
  };
}
