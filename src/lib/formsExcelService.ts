import * as XLSX from 'xlsx';
import {
  Acuerdo,
  Pedido,
  Reporte,
  Pais,
  Producto,
  Tienda,
  Medio,
  RedSocial,
  TipoPublicacion,
  TipoContrato,
  Usuario,
  TipoEnvio,
} from '../types';

export type FormType = 'acuerdos' | 'pedidos' | 'reportes';

export interface FormColumnDef {
  key: string;
  label: string;
  required: boolean;
  type: 'string' | 'number' | 'date' | 'boolean';
  description: string;
  example: string | number;
}

export interface FormTemplateConfig {
  formType: FormType;
  title: string;
  formNumber: string;
  description: string;
  filename: string;
  columns: FormColumnDef[];
  sampleRows: Record<string, any>[];
}

// Helpers for string normalization
export function normalizeString(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

export function parseDateString(val: any): string {
  if (!val) return new Date().toISOString().split('T')[0];
  if (val instanceof Date) {
    return val.toISOString().split('T')[0];
  }
  // If numeric Excel date serial number (e.g. 45367)
  if (typeof val === 'number') {
    const date = new Date((val - (25567 + 2)) * 86400 * 1000);
    return !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  }
  const str = String(val).trim();
  // Check DD/MM/YYYY or DD-MM-YYYY
  const ddmmyyyy = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (ddmmyyyy) {
    const day = ddmmyyyy[1].padStart(2, '0');
    const month = ddmmyyyy[2].padStart(2, '0');
    const year = ddmmyyyy[3];
    return `${year}-${month}-${day}`;
  }
  // Check YYYY-MM-DD
  const yyyymmdd = str.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (yyyymmdd) {
    const year = yyyymmdd[1];
    const month = yyyymmdd[2].padStart(2, '0');
    const day = yyyymmdd[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return str;
}

export const FORM_CONFIGS: Record<FormType, FormTemplateConfig> = {
  acuerdos: {
    formType: 'acuerdos',
    title: 'Acuerdos de Prensa (Contratos)',
    formNumber: 'Formulario 1',
    description: 'Alta masiva de contratos y acuerdos con influencers, canjes y pautas de medios.',
    filename: 'modelo_formulario_1_acuerdos',
    columns: [
      { key: 'influencer', label: 'Influencer', required: true, type: 'string', description: 'Nombre o cuenta de Instagram del influencer', example: '@mama.viajera' },
      { key: 'pais', label: 'País', required: true, type: 'string', description: 'País de operación (ej: Argentina, Colombia, Perú, Chile)', example: 'Argentina' },
      { key: 'seguidores', label: 'Seguidores', required: true, type: 'number', description: 'Cantidad total de seguidores (número entero)', example: 185000 },
      { key: 'tipo_contrato', label: 'Tipo Contrato', required: true, type: 'string', description: 'Canje, Pago o Mixto', example: 'Canje' },
      { key: 'monto_usd', label: 'Monto USD', required: true, type: 'number', description: 'Valor total acordado en USD (para canje, valor de productos)', example: 450.00 },
      { key: 'tipo_envio', label: 'Tipo Envío', required: true, type: 'string', description: 'tienda (retiro en sucursal) o domicilio (envío postal)', example: 'domicilio' },
      { key: 'fecha_inicio', label: 'Fecha Inicio', required: true, type: 'date', description: 'Inicio de vigencia (YYYY-MM-DD o DD/MM/AAAA)', example: '2026-03-01' },
      { key: 'fecha_fin', label: 'Fecha Fin', required: true, type: 'date', description: 'Fin de vigencia (YYYY-MM-DD o DD/MM/AAAA)', example: '2026-05-31' },
      { key: 'meses_acordados', label: 'Meses Acordados', required: false, type: 'number', description: 'Meses pactados (si se omite se calcula entre fechas)', example: 3 },
      { key: 'stories_totales', label: 'Stories Totales', required: false, type: 'number', description: 'Cantidad total de Stories pactadas', example: 6 },
      { key: 'feeds_totales', label: 'Feeds Totales', required: false, type: 'number', description: 'Cantidad de publicaciones/Reels en feed', example: 2 },
      { key: 'skus_productos', label: 'Productos Acordados', required: false, type: 'string', description: 'SKU y cantidad (ej: CAR-COCH-001:1, CAR-ACCE-050:2)', example: 'CAR-COCH-001:1, CAR-ACCE-050:1' },
      { key: 'responsable_email', label: 'Responsable Email', required: false, type: 'string', description: 'Email del analista de prensa a cargo', example: 'lucia.fernandez@carestino.com' },
      { key: 'link_instagram', label: 'Link Instagram', required: false, type: 'string', description: 'Enlace al perfil de Instagram', example: 'https://instagram.com/mama.viajera' },
      { key: 'celular', label: 'Celular', required: false, type: 'string', description: 'Teléfono de contacto con código de área', example: '+54 9 11 5555-1234' },
      { key: 'target', label: 'Target', required: false, type: 'boolean', description: '¿Cumple target demográfico? (SI/NO)', example: 'SI' },
      { key: 'costo_envio_usd', label: 'Costo Envío USD', required: false, type: 'number', description: 'Costo logístico estimado', example: 15.00 },
      { key: 'otros_contenidos', label: 'Otros Contenidos', required: false, type: 'string', description: 'Otras plataformas separadas por coma (tiktok, youtube)', example: 'tiktok' },
    ],
    sampleRows: [
      {
        influencer: '@mama.viajera',
        pais: 'Argentina',
        seguidores: 185000,
        tipo_contrato: 'Canje',
        monto_usd: 450,
        tipo_envio: 'domicilio',
        fecha_inicio: '2026-03-01',
        fecha_fin: '2026-05-31',
        meses_acordados: 3,
        stories_totales: 6,
        feeds_totales: 2,
        skus_productos: 'CAR-COCH-001:1, CAR-ACCE-050:1',
        responsable_email: 'lucia.fernandez@carestino.com',
        link_instagram: 'https://instagram.com/mama.viajera',
        celular: '+54 9 11 5555-1234',
        target: 'SI',
        costo_envio_usd: 15,
        otros_contenidos: 'tiktok',
      },
      {
        influencer: '@papas.primerizos',
        pais: 'Colombia',
        seguidores: 95000,
        tipo_contrato: 'Pago',
        monto_usd: 300,
        tipo_envio: 'tienda',
        fecha_inicio: '2026-04-01',
        fecha_fin: '2026-06-30',
        meses_acordados: 2,
        stories_totales: 4,
        feeds_totales: 1,
        skus_productos: 'CAR-SILL-030:1',
        responsable_email: 'mariana.lopez@carestino.com',
        link_instagram: 'https://instagram.com/papas.primerizos',
        celular: '+57 300 1234567',
        target: 'SI',
        costo_envio_usd: 0,
        otros_contenidos: 'youtube',
      },
      {
        influencer: '@lifestyle.bebe',
        pais: 'Perú',
        seguidores: 320000,
        tipo_contrato: 'Mixto',
        monto_usd: 850,
        tipo_envio: 'domicilio',
        fecha_inicio: '2026-03-15',
        fecha_fin: '2026-07-15',
        meses_acordados: 4,
        stories_totales: 8,
        feeds_totales: 3,
        skus_productos: 'CAR-COCH-002:1, CAR-CUNA-020:1',
        responsable_email: 'santiago.rossi@carestino.com',
        link_instagram: 'https://instagram.com/lifestyle.bebe',
        celular: '+51 987 654 321',
        target: 'SI',
        costo_envio_usd: 25,
        otros_contenidos: 'tiktok, youtube',
      },
    ],
  },

  pedidos: {
    formType: 'pedidos',
    title: 'Pedidos de Producto (Despachos)',
    formNumber: 'Formulario 2',
    description: 'Carga masiva de órdenes de entrega y despacho de productos a influencers vinculados a un acuerdo.',
    filename: 'modelo_formulario_2_pedidos',
    columns: [
      { key: 'acuerdo_id', label: 'ID Acuerdo o Influencer', required: true, type: 'string', description: 'Número de ID del Acuerdo (ej: 1001) o Nombre del Influencer', example: '1001' },
      { key: 'fecha', label: 'Fecha Pedido', required: true, type: 'date', description: 'Fecha del pedido (YYYY-MM-DD o DD/MM/AAAA)', example: '2026-03-05' },
      { key: 'tipo_entrega', label: 'Tipo Entrega', required: true, type: 'string', description: 'tienda (retiro en sucursal) o domicilio (envío postal)', example: 'domicilio' },
      { key: 'skus_cantidades', label: 'Productos (SKU:Cantidad)', required: true, type: 'string', description: 'Lista de SKUs y cantidades (ej: CAR-COCH-001:1, CAR-ACCE-050:1)', example: 'CAR-COCH-001:1' },
      { key: 'tienda', label: 'Tienda (Si es retiro)', required: false, type: 'string', description: 'Nombre de la tienda si es retiro (ej: Tienda Unicenter)', example: '' },
      { key: 'direccion', label: 'Dirección (Si es domicilio)', required: false, type: 'string', description: 'Calle, altura y piso/depto para envío', example: 'Av. Libertador 2450 Piso 4B' },
      { key: 'localidad', label: 'Localidad / Ciudad', required: false, type: 'string', description: 'Ciudad o localidad de destino', example: 'Olivos' },
      { key: 'provincia', label: 'Provincia / Estado', required: false, type: 'string', description: 'Provincia o departamento', example: 'Buenos Aires' },
      { key: 'codigo_postal', label: 'Código Postal', required: false, type: 'string', description: 'Código postal de destino', example: 'B1636' },
      { key: 'comentarios', label: 'Comentarios / Indicaciones', required: false, type: 'string', description: 'Notas para la logística o entrega', example: 'Entregar de 9 a 18hs' },
    ],
    sampleRows: [
      {
        acuerdo_id: '1001',
        fecha: '2026-03-05',
        tipo_entrega: 'domicilio',
        skus_cantidades: 'CAR-COCH-001:1',
        tienda: '',
        direccion: 'Av. Libertador 2450 Piso 4B',
        localidad: 'Olivos',
        provincia: 'Buenos Aires',
        codigo_postal: 'B1636',
        comentarios: 'Tocar timbre A, coordinar con conserjería',
      },
      {
        acuerdo_id: '@papas.primerizos',
        fecha: '2026-04-02',
        tipo_entrega: 'tienda',
        skus_cantidades: 'CAR-SILL-030:1',
        tienda: 'Tienda Bogotá Calle 93 (Colombia)',
        direccion: '',
        localidad: 'Bogotá',
        provincia: 'Cundinamarca',
        codigo_postal: '110221',
        comentarios: 'Retira personalmente presentando cédula',
      },
    ],
  },

  reportes: {
    formType: 'reportes',
    title: 'Reportes de Contenido & Engagement',
    formNumber: 'Formulario 3',
    description: 'Importación masiva de métricas de publicaciones, links, engagement y cumplimiento de marca.',
    filename: 'modelo_formulario_3_reportes',
    columns: [
      { key: 'acuerdo_id', label: 'ID Acuerdo o Influencer', required: true, type: 'string', description: 'Número de ID del Acuerdo (ej: 1001) o Nombre del Influencer', example: '1001' },
      { key: 'fecha', label: 'Fecha Publicación', required: true, type: 'date', description: 'Fecha en que se publicó (YYYY-MM-DD o DD/MM/AAAA)', example: '2026-03-10' },
      { key: 'medio', label: 'Medio', required: true, type: 'string', description: 'Red Social, Radio, TV o Nota Periodística', example: 'Red Social' },
      { key: 'red_social', label: 'Red Social', required: false, type: 'string', description: 'Instagram, Facebook, TikTok, YouTube (si medio es Red Social)', example: 'Instagram' },
      { key: 'tipo_publicacion', label: 'Tipo Publicación', required: false, type: 'string', description: 'Stories, Reel o Carrusel', example: 'Reel' },
      { key: 'link', label: 'Link de Publicación', required: false, type: 'string', description: 'Enlace directo al post, video o historia', example: 'https://www.instagram.com/reel/C8xyz123/' },
      { key: 'skus_expuestos', label: 'SKUs Productos Visibles', required: false, type: 'string', description: 'SKUs mostrados separados por coma (ej: CAR-COCH-001, CAR-ACCE-050)', example: 'CAR-COCH-001' },
      { key: 'visualizaciones', label: 'Visualizaciones', required: false, type: 'number', description: 'Reproducciones o alcance total', example: 45000 },
      { key: 'me_gusta', label: 'Me Gusta (Likes)', required: false, type: 'number', description: 'Cantidad de likes', example: 3200 },
      { key: 'comentarios', label: 'Comentarios', required: false, type: 'number', description: 'Cantidad de comentarios recibidos', example: 145 },
      { key: 'compartidos', label: 'Compartidos', required: false, type: 'number', description: 'Cantidad de veces compartido', example: 89 },
      { key: 'guardados', label: 'Guardados', required: false, type: 'number', description: 'Cantidad de guardados', example: 210 },
      { key: 'reposts', label: 'Reposts', required: false, type: 'number', description: 'Reposts en la plataforma', example: 15 },
      { key: 'marca_visible', label: 'Marca Visible (SI/NO)', required: false, type: 'boolean', description: '¿Se visualiza claramente el logo o producto Carestino?', example: 'SI' },
      { key: 'etiqueto_carestino', label: 'Etiquetó @Carestino (SI/NO)', required: false, type: 'boolean', description: '¿Etiquetó la cuenta principal de Carestino?', example: 'SI' },
      { key: 'etiqueto_carestino_pais', label: 'Etiquetó Cuenta País (SI/NO)', required: false, type: 'boolean', description: '¿Etiquetó la cuenta local del país (ej: @carestino.ar)?', example: 'SI' },
      { key: 'etiqueto_otra_pagina', label: 'Etiquetó Otra Marca (SI/NO)', required: false, type: 'boolean', description: '¿Mencionó a otra marca de la competencia?', example: 'NO' },
    ],
    sampleRows: [
      {
        acuerdo_id: '1001',
        fecha: '2026-03-10',
        medio: 'Red Social',
        red_social: 'Instagram',
        tipo_publicacion: 'Reel',
        link: 'https://www.instagram.com/reel/C8xyz123/',
        skus_expuestos: 'CAR-COCH-001',
        visualizaciones: 45000,
        me_gusta: 3200,
        comentarios: 145,
        compartidos: 89,
        guardados: 210,
        reposts: 15,
        marca_visible: 'SI',
        etiqueto_carestino: 'SI',
        etiqueto_carestino_pais: 'SI',
        etiqueto_otra_pagina: 'NO',
      },
      {
        acuerdo_id: '1001',
        fecha: '2026-03-12',
        medio: 'Red Social',
        red_social: 'Instagram',
        tipo_publicacion: 'Stories',
        link: 'https://www.instagram.com/stories/mama.viajera/12345/',
        skus_expuestos: 'CAR-COCH-001, CAR-ACCE-050',
        visualizaciones: 18500,
        me_gusta: 450,
        comentarios: 30,
        compartidos: 12,
        guardados: 40,
        reposts: 0,
        marca_visible: 'SI',
        etiqueto_carestino: 'SI',
        etiqueto_carestino_pais: 'SI',
        etiqueto_otra_pagina: 'NO',
      },
      {
        acuerdo_id: '@papas.primerizos',
        fecha: '2026-04-15',
        medio: 'Red Social',
        red_social: 'YouTube',
        tipo_publicacion: 'Carrusel',
        link: 'https://www.youtube.com/watch?v=sample123',
        skus_expuestos: 'CAR-SILL-030',
        visualizaciones: 28000,
        me_gusta: 1950,
        comentarios: 98,
        compartidos: 45,
        guardados: 120,
        reposts: 0,
        marca_visible: 'SI',
        etiqueto_carestino: 'SI',
        etiqueto_carestino_pais: 'NO',
        etiqueto_otra_pagina: 'NO',
      },
    ],
  },
};

/**
 * Generates and downloads the template file (Excel .xlsx or CSV)
 */
export function downloadFormTemplate(formType: FormType, format: 'xlsx' | 'csv') {
  const config = FORM_CONFIGS[formType];
  if (!config) return;

  // Prepare header labels mapping
  const headers = config.columns.map((c) => c.label);
  const rows = config.sampleRows.map((sample) => {
    const rowObj: Record<string, any> = {};
    config.columns.forEach((c) => {
      rowObj[c.label] = sample[c.key] !== undefined ? sample[c.key] : '';
    });
    return rowObj;
  });

  const ws = XLSX.utils.json_to_sheet(rows, { header: headers });

  // Add column widths for neat display in Excel
  ws['!cols'] = config.columns.map((c) => ({
    wch: Math.max(c.label.length + 4, String(c.example).length + 4, 16),
  }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, config.formNumber);

  // Also add an instructions sheet in Excel
  if (format === 'xlsx') {
    const instructionsData = config.columns.map((col) => ({
      Campo: col.label,
      'Obligatorio / Opcional': col.required ? 'OBLIGATORIO' : 'OPCIONAL',
      Tipo: col.type.toUpperCase(),
      Descripción: col.description,
      'Ejemplo Válido': String(col.example),
    }));
    const wsInstructions = XLSX.utils.json_to_sheet(instructionsData);
    wsInstructions['!cols'] = [{ wch: 22 }, { wch: 24 }, { wch: 14 }, { wch: 45 }, { wch: 25 }];
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instrucciones y Campos');
  }

  const filename = `${config.filename}.${format}`;

  if (format === 'xlsx') {
    XLSX.writeFile(wb, filename, { bookType: 'xlsx' });
  } else {
    // Generate CSV with UTF-8 BOM so accents open properly in Spanish Excel
    const csvContent = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Parsing & Validation Results
 */
export interface ParsedRowResult<T> {
  rowIndex: number;
  originalData: Record<string, any>;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  parsedItem?: T;
}

export interface FormParseResult<T> {
  formType: FormType;
  totalRows: number;
  validCount: number;
  errorCount: number;
  rows: ParsedRowResult<T>[];
  validItems: T[];
}

export interface ValidationContext {
  paises: Pais[];
  productos: Producto[];
  tiendas: Tienda[];
  medios: Medio[];
  redes: RedSocial[];
  tiposPub: TipoPublicacion[];
  tiposContrato: TipoContrato[];
  usuarios: Usuario[];
  acuerdos: Acuerdo[];
  currentUser: Usuario;
}

/**
 * Read and parse Excel or CSV file
 */
export async function parseFormFile(
  file: File,
  formType: FormType,
  context: ValidationContext
): Promise<FormParseResult<any>> {
  const config = FORM_CONFIGS[formType];
  if (!config) throw new Error(`Configuración no encontrada para ${formType}`);

  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array', cellDates: true });
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];

  // Convert to raw JSON
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, {
    defval: '',
    raw: false,
  });

  if (!rawRows || rawRows.length === 0) {
    throw new Error('El archivo no contiene filas de datos para procesar.');
  }

  // Build mapping from lower normalized header keys to standard config keys
  // E.g. "Nombre Influencer" -> "influencer"
  const rowResults: ParsedRowResult<any>[] = [];
  const validItems: any[] = [];

  rawRows.forEach((rawRow, idx) => {
    const rowIndex = idx + 2; // +1 for 1-based, +1 for header
    // Normalize keys in rawRow
    const normalizedRow: Record<string, any> = {};
    Object.keys(rawRow).forEach((k) => {
      const normK = normalizeString(k);
      normalizedRow[normK] = rawRow[k];
    });

    // Helper getter that looks up either canonical key or label norm
    const getVal = (colKey: string, colLabel: string): any => {
      const k1 = normalizeString(colKey);
      const k2 = normalizeString(colLabel);
      if (normalizedRow[k1] !== undefined && normalizedRow[k1] !== '') return normalizedRow[k1];
      if (normalizedRow[k2] !== undefined && normalizedRow[k2] !== '') return normalizedRow[k2];
      // partial match
      for (const normKey of Object.keys(normalizedRow)) {
        if (normKey.includes(k1) || k1.includes(normKey)) {
          if (normalizedRow[normKey] !== '') return normalizedRow[normKey];
        }
      }
      return '';
    };

    const errors: string[] = [];
    const warnings: string[] = [];
    let parsedItem: any = null;

    if (formType === 'acuerdos') {
      const influencer = String(getVal('influencer', 'Influencer') || '').trim();
      const paisStr = String(getVal('pais', 'País') || '').trim();
      const seguidoresRaw = getVal('seguidores', 'Seguidores');
      const tipoContratoStr = String(getVal('tipo_contrato', 'Tipo Contrato') || '').trim();
      const montoUsdRaw = getVal('monto_usd', 'Monto USD');
      const tipoEnvioStr = String(getVal('tipo_envio', 'Tipo Envío') || '').trim().toLowerCase();
      const fechaInicioRaw = getVal('fecha_inicio', 'Fecha Inicio');
      const fechaFinRaw = getVal('fecha_fin', 'Fecha Fin');
      const skusProdStr = String(getVal('skus_productos', 'Productos Acordados') || '').trim();
      const responsableEmail = String(getVal('responsable_email', 'Responsable Email') || '').trim();

      if (!influencer) errors.push('El campo Influencer es obligatorio.');
      
      // Match país
      let matchedPais = context.paises.find(
        (p) => normalizeString(p.nombre) === normalizeString(paisStr) || String(p.id) === paisStr
      );
      if (!matchedPais) {
        if (context.paises.length > 0) {
          matchedPais = context.paises[0];
          warnings.push(`País "${paisStr}" no encontrado. Asignado "${matchedPais.nombre}".`);
        } else {
          errors.push(`País "${paisStr}" no encontrado en el catálogo.`);
        }
      }

      // Seguidores
      const seguidores = parseInt(String(seguidoresRaw).replace(/[^0-9]/g, ''), 10);
      if (isNaN(seguidores) || seguidores <= 0) {
        errors.push('Seguidores debe ser un número entero mayor a 0.');
      }

      // Tipo contrato
      let matchedContrato = context.tiposContrato.find(
        (tc) => normalizeString(tc.nombre) === normalizeString(tipoContratoStr) || String(tc.id) === tipoContratoStr
      );
      if (!matchedContrato) {
        matchedContrato = context.tiposContrato[0] || { id: 1, nombre: 'Canje' };
        warnings.push(`Tipo de contrato "${tipoContratoStr}" no reconocido. Asignado "${matchedContrato.nombre}".`);
      }

      // Monto USD
      const montoUsd = parseFloat(String(montoUsdRaw).replace(/[^0-9.]/g, ''));
      if (isNaN(montoUsd) || montoUsd < 0) {
        errors.push('Monto USD debe ser un número válido.');
      }

      // Tipo Envío
      let tipoEnvio: TipoEnvio = 'domicilio';
      if (tipoEnvioStr.includes('tienda') || tipoEnvioStr.includes('sucursal') || tipoEnvioStr.includes('retiro')) {
        tipoEnvio = 'tienda';
      }

      // Fechas
      const fechaInicio = parseDateString(fechaInicioRaw);
      const fechaFin = parseDateString(fechaFinRaw);
      if (!fechaInicio) errors.push('Fecha Inicio inválida o faltante.');
      if (!fechaFin) errors.push('Fecha Fin inválida o faltante.');

      // Meses acordados
      const mesesRaw = parseInt(String(getVal('meses_acordados', 'Meses Acordados')), 10);
      let mesesAcordados = !isNaN(mesesRaw) && mesesRaw > 0 ? mesesRaw : 1;
      if (fechaInicio && fechaFin && isNaN(mesesRaw)) {
        const d1 = new Date(fechaInicio);
        const d2 = new Date(fechaFin);
        const diffMonths = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
        mesesAcordados = Math.max(1, diffMonths);
      }

      // Responsable
      let responsableUser = context.usuarios.find(
        (u) => u.email.toLowerCase() === responsableEmail.toLowerCase() || normalizeString(u.nombre) === normalizeString(responsableEmail)
      );
      if (!responsableUser) {
        responsableUser = context.currentUser;
      }

      // Target
      const targetVal = String(getVal('target', 'Target')).toLowerCase();
      const target = targetVal === 'no' || targetVal === 'false' ? false : true;

      // Stories & Feeds
      const stories = parseInt(String(getVal('stories_totales', 'Stories Totales')), 10) || 0;
      const feeds = parseInt(String(getVal('feeds_totales', 'Feeds Totales')), 10) || 0;

      // Parse SKUs
      const productosAcordados: { sku: string; cantidad_acordada: number; cantidad_restante: number }[] = [];
      if (skusProdStr) {
        const parts = skusProdStr.split(/[,;\n]/);
        parts.forEach((part) => {
          const item = part.trim();
          if (!item) return;
          const [skuPart, qtyPart] = item.split(/[:=\-xX]/);
          const cleanSku = skuPart ? skuPart.trim() : item;
          const qty = qtyPart ? parseInt(qtyPart.trim(), 10) : 1;
          const validSku = context.productos.find((p) => p.sku.toUpperCase() === cleanSku.toUpperCase())?.sku || cleanSku;
          productosAcordados.push({
            sku: validSku,
            cantidad_acordada: !isNaN(qty) && qty > 0 ? qty : 1,
            cantidad_restante: !isNaN(qty) && qty > 0 ? qty : 1,
          });
        });
      }

      if (errors.length === 0 && matchedPais) {
        parsedItem = {
          influencer,
          pais_id: matchedPais.id,
          seguidores: seguidores || 1000,
          tipo_contrato_id: matchedContrato.id,
          monto_usd: montoUsd || 0,
          tipo_envio: tipoEnvio,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          meses_acordados: mesesAcordados,
          meses_teoricos: Math.max(1, Math.ceil((montoUsd || 100) / 250)),
          stories_totales: stories,
          feeds_totales: feeds,
          responsable_id: responsableUser.id,
          solicitante_id: context.currentUser.id,
          target: target,
          link_instagram: String(getVal('link_instagram', 'Link Instagram') || '').trim() || null,
          celular: String(getVal('celular', 'Celular') || '').trim() || null,
          costo_envio_usd: parseFloat(String(getVal('costo_envio_usd', 'Costo Envío USD'))) || 0,
          paises_impacto: [{ pais_id: matchedPais.id, peso: 100 }],
          productos: productosAcordados,
          otros_contenidos: getVal('otros_contenidos', 'Otros Contenidos')
            ? String(getVal('otros_contenidos', 'Otros Contenidos')).split(/[,;]/).map((s) => s.trim()).filter(Boolean)
            : [],
        };
      }
    } else if (formType === 'pedidos') {
      const acuerdoRef = String(getVal('acuerdo_id', 'ID Acuerdo o Influencer') || '').trim();
      const fechaRaw = getVal('fecha', 'Fecha Pedido');
      const tipoEntregaStr = String(getVal('tipo_entrega', 'Tipo Entrega') || '').trim().toLowerCase();
      const skusStr = String(getVal('skus_cantidades', 'Productos (SKU:Cantidad)') || '').trim();
      const tiendaStr = String(getVal('tienda', 'Tienda') || '').trim();

      if (!acuerdoRef) errors.push('Debe indicar el ID del Acuerdo o nombre del Influencer.');

      // Match acuerdo
      let matchedAcuerdo = context.acuerdos.find(
        (a) => String(a.id) === acuerdoRef || normalizeString(a.influencer) === normalizeString(acuerdoRef)
      );
      if (!matchedAcuerdo) {
        // partial influencer match
        matchedAcuerdo = context.acuerdos.find((a) =>
          normalizeString(a.influencer).includes(normalizeString(acuerdoRef))
        );
      }
      if (!matchedAcuerdo) {
        errors.push(`Acuerdo "${acuerdoRef}" no encontrado en la base de datos.`);
      }

      const fecha = parseDateString(fechaRaw);
      if (!fecha) errors.push('Fecha de pedido inválida.');

      let tipoEntrega: TipoEnvio = 'domicilio';
      if (tipoEntregaStr.includes('tienda') || tipoEntregaStr.includes('sucursal') || tipoEntregaStr.includes('retiro')) {
        tipoEntrega = 'tienda';
      }

      // Tienda lookup
      let tiendaId: number | null = null;
      if (tipoEntrega === 'tienda') {
        const foundTienda = context.tiendas.find(
          (t) => normalizeString(t.nombre) === normalizeString(tiendaStr) || String(t.id) === tiendaStr
        );
        if (foundTienda) {
          tiendaId = foundTienda.id;
        } else if (context.tiendas.length > 0) {
          tiendaId = context.tiendas[0].id;
          warnings.push(`Tienda "${tiendaStr}" no encontrada. Asignada "${context.tiendas[0].nombre}".`);
        }
      }

      // Parse SKUs
      const pedidoProductos: { sku: string; cantidad: number }[] = [];
      if (!skusStr) {
        errors.push('Debe especificar al menos un producto (SKU:Cantidad).');
      } else {
        const parts = skusStr.split(/[,;\n]/);
        parts.forEach((part) => {
          const item = part.trim();
          if (!item) return;
          const [skuPart, qtyPart] = item.split(/[:=\-xX]/);
          const cleanSku = skuPart ? skuPart.trim() : item;
          const qty = qtyPart ? parseInt(qtyPart.trim(), 10) : 1;
          const validSku = context.productos.find((p) => p.sku.toUpperCase() === cleanSku.toUpperCase())?.sku || cleanSku;
          pedidoProductos.push({
            sku: validSku,
            cantidad: !isNaN(qty) && qty > 0 ? qty : 1,
          });
        });
      }

      if (errors.length === 0 && matchedAcuerdo) {
        parsedItem = {
          acuerdo_id: matchedAcuerdo.id,
          fecha: fecha,
          tipo_entrega: tipoEntrega,
          tienda_id: tiendaId,
          direccion: String(getVal('direccion', 'Dirección') || '').trim() || null,
          localidad: String(getVal('localidad', 'Localidad') || '').trim() || null,
          provincia: String(getVal('provincia', 'Provincia') || '').trim() || null,
          codigo_postal: String(getVal('codigo_postal', 'Código Postal') || '').trim() || null,
          comentarios: String(getVal('comentarios', 'Comentarios') || '').trim() || null,
          created_by: context.currentUser.id,
          productos: pedidoProductos,
        };
      }
    } else if (formType === 'reportes') {
      const acuerdoRef = String(getVal('acuerdo_id', 'ID Acuerdo o Influencer') || '').trim();
      const fechaRaw = getVal('fecha', 'Fecha Publicación');
      const medioStr = String(getVal('medio', 'Medio') || '').trim();
      const redStr = String(getVal('red_social', 'Red Social') || '').trim();
      const tipoPubStr = String(getVal('tipo_publicacion', 'Tipo Publicación') || '').trim();
      const link = String(getVal('link', 'Link de Publicación') || '').trim();
      const skusStr = String(getVal('skus_expuestos', 'SKUs Productos Visibles') || '').trim();

      if (!acuerdoRef) errors.push('Debe indicar el ID del Acuerdo o nombre del Influencer.');

      let matchedAcuerdo = context.acuerdos.find(
        (a) => String(a.id) === acuerdoRef || normalizeString(a.influencer) === normalizeString(acuerdoRef)
      );
      if (!matchedAcuerdo) {
        matchedAcuerdo = context.acuerdos.find((a) =>
          normalizeString(a.influencer).includes(normalizeString(acuerdoRef))
        );
      }
      if (!matchedAcuerdo) {
        errors.push(`Acuerdo "${acuerdoRef}" no encontrado en la base de datos.`);
      }

      const fecha = parseDateString(fechaRaw);
      if (!fecha) errors.push('Fecha de publicación inválida.');

      // Medio
      let matchedMedio = context.medios.find(
        (m) => normalizeString(m.nombre) === normalizeString(medioStr) || String(m.id) === medioStr
      );
      if (!matchedMedio) {
        matchedMedio = context.medios.find((m) => m.nombre.toLowerCase().includes('social')) || context.medios[0] || { id: 3, nombre: 'Red Social' };
        warnings.push(`Medio "${medioStr}" asignado a "${matchedMedio.nombre}".`);
      }

      // Red social
      let redSocialId: number | null = null;
      if (redStr) {
        const foundRed = context.redes.find(
          (r) => normalizeString(r.nombre) === normalizeString(redStr) || String(r.id) === redStr
        );
        if (foundRed) redSocialId = foundRed.id;
      }

      // Tipo Pub
      let tipoPubId: number | null = null;
      if (tipoPubStr) {
        const foundTipoPub = context.tiposPub.find(
          (tp) => normalizeString(tp.nombre) === normalizeString(tipoPubStr) || String(tp.id) === tipoPubStr
        );
        if (foundTipoPub) tipoPubId = foundTipoPub.id;
      }

      // Boolean verification helpers
      const toBool = (v: any) => {
        const s = String(v).trim().toLowerCase();
        return s === 'si' || s === 'true' || s === '1' || s === 'yes';
      };

      // Metrics
      const parseNum = (val: any) => {
        if (!val) return 0;
        const n = parseInt(String(val).replace(/[^0-9]/g, ''), 10);
        return isNaN(n) ? 0 : n;
      };

      // Products exposed
      const reporteProductos: { sku: string; categoria: string }[] = [];
      if (skusStr) {
        const parts = skusStr.split(/[,;\n]/);
        parts.forEach((p) => {
          const rawSku = p.trim().toUpperCase();
          if (!rawSku) return;
          const matchProd = context.productos.find((pr) => pr.sku.toUpperCase() === rawSku);
          reporteProductos.push({
            sku: matchProd ? matchProd.sku : rawSku,
            categoria: matchProd ? matchProd.categoria : 'General',
          });
        });
      }

      if (errors.length === 0 && matchedAcuerdo && matchedMedio) {
        parsedItem = {
          acuerdo_id: matchedAcuerdo.id,
          fecha,
          medio_id: matchedMedio.id,
          red_social_id: redSocialId,
          tipo_publicacion_id: tipoPubId,
          link: link || null,
          visualizaciones: parseNum(getVal('visualizaciones', 'Visualizaciones')),
          me_gusta: parseNum(getVal('me_gusta', 'Me Gusta (Likes)')),
          comentarios: parseNum(getVal('comentarios', 'Comentarios')),
          compartidos: parseNum(getVal('compartidos', 'Compartidos')),
          guardados: parseNum(getVal('guardados', 'Guardados')),
          reposts: parseNum(getVal('reposts', 'Reposts')),
          marca_visible: toBool(getVal('marca_visible', 'Marca Visible')),
          etiqueto_carestino: toBool(getVal('etiqueto_carestino', 'Etiquetó @Carestino')),
          etiqueto_carestino_pais: toBool(getVal('etiqueto_carestino_pais', 'Etiquetó Cuenta País')),
          etiqueto_otra_pagina: toBool(getVal('etiqueto_otra_pagina', 'Etiquetó Otra Marca')),
          created_by: context.currentUser.id,
          productos: reporteProductos,
        };
      }
    }

    const isValid = errors.length === 0 && parsedItem !== null;
    if (isValid && parsedItem) {
      validItems.push(parsedItem);
    }

    rowResults.push({
      rowIndex,
      originalData: rawRow,
      isValid,
      errors,
      warnings,
      parsedItem,
    });
  });

  return {
    formType,
    totalRows: rawRows.length,
    validCount: validItems.length,
    errorCount: rowResults.filter((r) => !r.isValid).length,
    rows: rowResults,
    validItems,
  };
}
