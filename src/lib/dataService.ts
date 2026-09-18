import {
  Pais,
  Producto,
  Tienda,
  Medio,
  RedSocial,
  TipoPublicacion,
  TipoContrato,
  EscalonesSeguidores,
  Usuario,
  Acuerdo,
  Pedido,
  PedidoProducto,
  Reporte,
  ReporteProducto,
} from '../types';
import { getSupabase } from './supabase';

// Seed data from schema_supabase.sql
export const INITIAL_PAISES: Pais[] = [
  { id: 1, nombre: 'Argentina' },
  { id: 2, nombre: 'Colombia' },
  { id: 3, nombre: 'Perú' },
  { id: 4, nombre: 'Chile' },
  { id: 5, nombre: 'Uruguay' },
  { id: 6, nombre: 'Paraguay' },
  { id: 7, nombre: 'Panamá' },
  { id: 8, nombre: 'México' },
];

export const INITIAL_PRODUCTOS: Producto[] = [
  { sku: 'CAR-COCH-001', nombre: 'Cochecito Beverly Black Edition', categoria: 'Cochecitos' },
  { sku: 'CAR-COCH-002', nombre: 'Cochecito Travel System London', categoria: 'Cochecitos' },
  { sku: 'CAR-BUTA-010', nombre: 'Butaca Auto Isofix Monza 0-36kg', categoria: 'Butacas' },
  { sku: 'CAR-BUTA-012', nombre: 'Butaca Booster Daytona', categoria: 'Butacas' },
  { sku: 'CAR-CUNA-020', nombre: 'Practicuna Colecho Sweet Dreams', categoria: 'Cunas' },
  { sku: 'CAR-SILL-030', nombre: 'Silla de Comer Plegable Gourmet', categoria: 'Alimentación' },
  { sku: 'CAR-ACCE-050', nombre: 'Mochila Maternal Premium Térmica', categoria: 'Accesorios' },
  { sku: 'CAR-JUGU-070', nombre: 'Gimnasio Didáctico Play & Learn', categoria: 'Juguetes' },
];

export const INITIAL_TIENDAS: Tienda[] = [
  { id: 1, nombre: 'Tienda Unicenter (Buenos Aires)' },
  { id: 2, nombre: 'Tienda Alto Palermo (Buenos Aires)' },
  { id: 3, nombre: 'Tienda Palmas del Pilar' },
  { id: 4, nombre: 'Tienda Córdoba Shopping' },
  { id: 5, nombre: 'Tienda Rosario Portal' },
  { id: 6, nombre: 'Tienda Montevideo Shopping (Uruguay)' },
  { id: 7, nombre: 'Tienda Bogotá Calle 93 (Colombia)' },
  { id: 8, nombre: 'Tienda Lima Jockey Plaza (Perú)' },
];

export const INITIAL_MEDIOS: Medio[] = [
  { id: 1, nombre: 'Radio' },
  { id: 2, nombre: 'TV' },
  { id: 3, nombre: 'Red Social' },
  { id: 4, nombre: 'Nota Periodística' },
];

export const INITIAL_REDES: RedSocial[] = [
  { id: 1, nombre: 'Instagram' },
  { id: 2, nombre: 'Facebook' },
  { id: 3, nombre: 'TikTok' },
  { id: 4, nombre: 'YouTube' },
];

export const INITIAL_TIPOS_PUB: TipoPublicacion[] = [
  { id: 1, nombre: 'Carrusel' },
  { id: 2, nombre: 'Reel' },
  { id: 3, nombre: 'Stories' },
];

export const INITIAL_TIPOS_CONTRATO: TipoContrato[] = [
  { id: 1, nombre: 'Canje' },
  { id: 2, nombre: 'Pago' },
  { id: 3, nombre: 'Mixto' },
];

export const INITIAL_ESCALONES: EscalonesSeguidores[] = [
  { id: 1, seguidores_hasta: 50000, usd_mes: 100, comentario: 'Hasta 50K Seguidores' },
  { id: 2, seguidores_hasta: 100000, usd_mes: 150, comentario: 'Hasta 100K Seguidores' },
  { id: 3, seguidores_hasta: 200000, usd_mes: 200, comentario: 'Hasta 200K Seguidores' },
  { id: 4, seguidores_hasta: 300000, usd_mes: 275, comentario: 'Hasta 300K Seguidores' },
  { id: 5, seguidores_hasta: 400000, usd_mes: 350, comentario: 'Hasta 400K Seguidores' },
  { id: 6, seguidores_hasta: 500000, usd_mes: 425, comentario: 'Hasta 500K Seguidores' },
  { id: 7, seguidores_hasta: 750000, usd_mes: 500, comentario: 'Hasta 750K Seguidores' },
  { id: 8, seguidores_hasta: 1000000, usd_mes: 625, comentario: 'Hasta 1M Seguidores' },
  { id: 9, seguidores_hasta: 2000000, usd_mes: 750, comentario: 'Hasta 2M Seguidores' },
  { id: 10, seguidores_hasta: 3500000, usd_mes: 1200, comentario: 'Hasta 3.5M Seguidores' },
  { id: 11, seguidores_hasta: 100000000, usd_mes: 1500, comentario: 'Hasta 100M Seguidores' },
];

export const INITIAL_USUARIOS: Usuario[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    email: 'reporting@carestino.com',
    nombre: 'Reporting Carestino (Admin)',
    rol: 'admin_general',
    activo: true,
  },
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    email: 'joaquin.mendez@carestino.com',
    nombre: 'Joaquín Méndez',
    rol: 'admin_general',
    activo: true,
  },
  {
    id: 'b1234567-89ab-cdef-0123-456789abcdef',
    email: 'lucia.fernandez@carestino.com',
    nombre: 'Lucía Fernández (Líder Prensa)',
    rol: 'admin_prensa',
    activo: true,
  },
  {
    id: 'c2345678-9abc-def0-1234-56789abcdef0',
    email: 'santiago.rossi@carestino.com',
    nombre: 'Santiago Rossi (Analista Cono Sur)',
    rol: 'analista',
    activo: true,
  },
  {
    id: 'd3456789-abcd-ef01-2345-6789abcdef01',
    email: 'mariana.lopez@carestino.com',
    nombre: 'Mariana López (Analista Andina)',
    rol: 'analista',
    activo: true,
  },
  {
    id: 'e456789a-bcde-f012-3456-789abcdef012',
    email: 'carolina.diaz@carestino.com',
    nombre: 'Carolina Díaz',
    rol: 'analista',
    activo: false,
  },
];

export const INITIAL_ACUERDOS: Acuerdo[] = [
  {
    id: 1001,
    solicitante_id: 'c2345678-9abc-def0-1234-56789abcdef0',
    responsable_id: 'c2345678-9abc-def0-1234-56789abcdef0',
    pais_id: 1, // Argentina
    influencer: 'Pampita Ardohain',
    seguidores: 7500000,
    link_instagram: 'https://instagram.com/pampitaoficial',
    celular: '+5491155443322',
    target: true,
    tipo_contrato_id: 3, // Mixto
    contrato_link: 'https://drive.google.com/carestino/contratos/1001.pdf',
    monto_usd: 6000,
    tipo_envio: 'domicilio',
    costo_envio_usd: 80,
    meses_teoricos: 4, // 6000 / 1500 = 4
    meses_acordados: 6,
    fecha_inicio: '2026-03-01',
    fecha_fin: '2026-08-31',
    stories_totales: 6,
    feeds_totales: 6,
    cantidad_entregas: 2,
    fechas_entrega_estimadas: '2026-03-15',
    created_at: '2026-03-01T10:00:00Z',
    paises_impacto: [
      { pais_id: 1, peso: 70 },
      { pais_id: 4, peso: 20 },
      { pais_id: 5, peso: 10 },
    ],
    otros_contenidos: ['tiktok', 'youtube'],
    productos: [
      { sku: 'CAR-COCH-001', cantidad_acordada: 1, cantidad_restante: 1 },
      { sku: 'CAR-BUTA-010', cantidad_acordada: 2, cantidad_restante: 2 },
      { sku: 'CAR-SILL-030', cantidad_acordada: 1, cantidad_restante: 1 },
    ],
  },
  {
    id: 1002,
    solicitante_id: 'c2345678-9abc-def0-1234-56789abcdef0',
    responsable_id: 'b1234567-89ab-cdef-0123-456789abcdef',
    pais_id: 2, // Colombia
    influencer: 'Maleja Restrepo & Tatán',
    seguidores: 4200000,
    link_instagram: 'https://instagram.com/maleja_restrepo',
    celular: '+573102345678',
    target: true,
    tipo_contrato_id: 1, // Canje
    monto_usd: 2400,
    tipo_envio: 'tienda',
    meses_teoricos: 2,
    meses_acordados: 3,
    fecha_inicio: '2026-04-01',
    fecha_fin: '2026-06-30',
    stories_totales: 3,
    feeds_totales: 3,
    cantidad_retiros: 1,
    fechas_retiro_estimadas: '2026-04-10',
    created_at: '2026-04-01T14:30:00Z',
    paises_impacto: [
      { pais_id: 2, peso: 85 },
      { pais_id: 7, peso: 15 },
    ],
    otros_contenidos: ['tiktok'],
    productos: [
      { sku: 'CAR-COCH-002', cantidad_acordada: 1, cantidad_restante: 1 },
      { sku: 'CAR-CUNA-020', cantidad_acordada: 1, cantidad_restante: 1 },
    ],
  },
  {
    id: 1003,
    solicitante_id: 'd3456789-abcd-ef01-2345-6789abcdef01',
    responsable_id: 'd3456789-abcd-ef01-2345-6789abcdef01',
    pais_id: 3, // Perú
    influencer: 'Natalie Vértiz',
    seguidores: 3800000,
    link_instagram: 'https://instagram.com/msperu',
    celular: '+51987654321',
    target: true,
    tipo_contrato_id: 2, // Pago
    monto_usd: 3600,
    tipo_envio: 'domicilio',
    costo_envio_usd: 45,
    meses_teoricos: 3,
    meses_acordados: 4,
    fecha_inicio: '2026-05-01',
    fecha_fin: '2026-08-31',
    stories_totales: 4,
    feeds_totales: 4,
    cantidad_entregas: 1,
    fechas_entrega_estimadas: '2026-05-08',
    created_at: '2026-05-01T09:15:00Z',
    paises_impacto: [
      { pais_id: 3, peso: 100 },
    ],
    otros_contenidos: ['youtube'],
    productos: [
      { sku: 'CAR-COCH-001', cantidad_acordada: 1, cantidad_restante: 1 },
      { sku: 'CAR-ACCE-050', cantidad_acordada: 2, cantidad_restante: 2 },
    ],
  },
];

export const INITIAL_PEDIDOS: Pedido[] = [
  {
    id: 5001,
    acuerdo_id: 1001,
    fecha: '2026-03-10',
    tipo_entrega: 'domicilio',
    direccion: 'Av. del Libertador 2450, Piso 12',
    codigo_postal: 'C1425',
    localidad: 'Palermo',
    provincia: 'Buenos Aires',
    comentarios: 'Entregar de 10 a 16 hs. Anunciar a seguridad del edificio.',
    created_by: 'c2345678-9abc-def0-1234-56789abcdef0',
    created_at: '2026-03-10T14:30:00Z',
    productos: [
      { sku: 'CAR-COCH-001', cantidad: 1 },
    ],
  },
  {
    id: 5002,
    acuerdo_id: 1002,
    fecha: '2026-04-05',
    tipo_entrega: 'tienda',
    tienda_id: 2, // Tienda Bogotá Unicentro
    comentarios: 'Retira la representante con documento de identidad y confirmación de prensa.',
    created_by: 'c2345678-9abc-def0-1234-56789abcdef0',
    created_at: '2026-04-05T11:00:00Z',
    productos: [
      { sku: 'CAR-COCH-002', cantidad: 1 },
    ],
  },
];

export const INITIAL_REPORTES: Reporte[] = [
  {
    id: 7001,
    acuerdo_id: 1001,
    medio_id: 3, // Red Social
    red_social_id: 1, // Instagram
    tipo_publicacion_id: 2, // Reel
    link: 'https://instagram.com/reel/pampita_carestino_beverly',
    captura_url: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&auto=format&fit=crop&q=80',
    fecha: '2026-03-20',
    me_gusta: 48500,
    comentarios: 1320,
    compartidos: 4200,
    guardados: 9800,
    reposts: 150,
    visualizaciones: 720000,
    marca_visible: true,
    etiqueto_carestino: true,
    etiqueto_carestino_pais: true,
    etiqueto_otra_pagina: false,
    created_by: 'c2345678-9abc-def0-1234-56789abcdef0',
    created_at: '2026-03-20T18:00:00Z',
    productos: [
      { sku: 'CAR-COCH-001', categoria: 'Cochecitos' },
    ],
  },
  {
    id: 7002,
    acuerdo_id: 1001,
    medio_id: 3, // Red Social
    red_social_id: 1, // Instagram
    tipo_publicacion_id: 3, // Stories
    link: 'https://instagram.com/stories/pampita_story_carestino',
    captura_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
    fecha: '2026-03-28',
    me_gusta: 12400,
    comentarios: 340,
    compartidos: 890,
    guardados: 2100,
    reposts: 40,
    visualizaciones: 410000,
    marca_visible: true,
    etiqueto_carestino: true,
    etiqueto_carestino_pais: true,
    etiqueto_otra_pagina: false,
    created_by: 'c2345678-9abc-def0-1234-56789abcdef0',
    created_at: '2026-03-28T20:30:00Z',
    productos: [
      { sku: 'CAR-BUTA-010', categoria: 'Butacas' },
    ],
  },
  {
    id: 7003,
    acuerdo_id: 1002,
    medio_id: 3, // Red Social
    red_social_id: 3, // TikTok
    tipo_publicacion_id: 2, // Reel / Video
    link: 'https://tiktok.com/@maleja/video/carestino_unboxing_colombia',
    fecha: '2026-04-12',
    me_gusta: 32000,
    comentarios: 890,
    compartidos: 2300,
    guardados: 5400,
    reposts: 90,
    visualizaciones: 510000,
    marca_visible: true,
    etiqueto_carestino: true,
    etiqueto_carestino_pais: false,
    etiqueto_otra_pagina: false,
    created_by: 'c2345678-9abc-def0-1234-56789abcdef0',
    created_at: '2026-04-12T16:15:00Z',
    productos: [
      { sku: 'CAR-COCH-002', categoria: 'Cochecitos' },
    ],
  },
];

// Helper: Calculate theoretical months strictly following trigger trg_calcular_meses_teoricos
export function calcularMesesTeoricos(
  seguidores: number,
  montoUsd: number,
  escalones: EscalonesSeguidores[] = INITIAL_ESCALONES
): { meses: number; usdMes: number; escalon: EscalonesSeguidores | null } {
  if (seguidores <= 0 || montoUsd <= 0) {
    return { meses: 0, usdMes: 0, escalon: null };
  }

  // Sort ascending by seguidores_hasta
  const sorted = [...escalones].sort((a, b) => a.seguidores_hasta - b.seguidores_hasta);
  const found = sorted.find((e) => e.seguidores_hasta >= seguidores);

  if (!found || found.usd_mes <= 0) {
    // Fallback to highest tier
    const highest = sorted[sorted.length - 1];
    const usd = highest ? highest.usd_mes : 1500;
    return {
      meses: Math.ceil(montoUsd / usd),
      usdMes: usd,
      escalon: highest || null,
    };
  }

  const meses = Math.ceil(montoUsd / found.usd_mes);
  return {
    meses,
    usdMes: found.usd_mes,
    escalon: found,
  };
}

// Local cache keys
const STORAGE_KEY = {
  PAISES: 'carestino_db_paises',
  PRODUCTOS: 'carestino_db_productos',
  TIENDAS: 'carestino_db_tiendas',
  MEDIOS: 'carestino_db_medios',
  REDES: 'carestino_db_redes',
  TIPOS_PUB: 'carestino_db_tipos_pub',
  TIPOS_CONTRATO: 'carestino_db_tipos_contrato',
  ESCALONES: 'carestino_db_escalones',
  USUARIOS: 'carestino_db_usuarios',
  ACUERDOS: 'carestino_db_acuerdos',
  PEDIDOS: 'carestino_db_pedidos',
  REPORTES: 'carestino_db_reportes',
};

function getLocal<T>(key: string, initial: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return initial;
    return JSON.parse(raw);
  } catch {
    return initial;
  }
}

function setLocal<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving to localStorage ${key}`, e);
  }
}

export class DataService {
  // Paises
  static async getPaises(): Promise<Pais[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('paises').select('*').order('nombre');
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Falling back to local data for paises', e);
      }
    }
    return getLocal(STORAGE_KEY.PAISES, INITIAL_PAISES);
  }

  static async savePais(pais: { id?: number; nombre: string }): Promise<Pais> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        if (pais.id) {
          const { data, error } = await supabase.from('paises').update({ nombre: pais.nombre }).eq('id', pais.id).select().single();
          if (!error && data) return data;
        } else {
          const { data, error } = await supabase.from('paises').insert({ nombre: pais.nombre }).select().single();
          if (!error && data) return data;
        }
      } catch (e) {
        console.warn('Supabase save error, fallback to local', e);
      }
    }
    const current = getLocal(STORAGE_KEY.PAISES, INITIAL_PAISES);
    if (pais.id) {
      const updated = current.map((p) => (p.id === pais.id ? { ...p, nombre: pais.nombre } : p));
      setLocal(STORAGE_KEY.PAISES, updated);
      return { id: pais.id, nombre: pais.nombre };
    } else {
      const nextId = current.length > 0 ? Math.max(...current.map((p) => p.id)) + 1 : 1;
      const created = { id: nextId, nombre: pais.nombre };
      setLocal(STORAGE_KEY.PAISES, [...current, created]);
      return created;
    }
  }

  static async savePaisesBulk(items: Pais[], mode: 'append' | 'replace' = 'append'): Promise<Pais[]> {
    const supabase = getSupabase();
    const current = getLocal(STORAGE_KEY.PAISES, INITIAL_PAISES);
    let finalItems: Pais[] = [];

    if (mode === 'replace') {
      finalItems = items.map((it, idx) => ({ id: it.id || idx + 1, nombre: it.nombre }));
    } else {
      let nextId = current.length > 0 ? Math.max(...current.map((p) => p.id)) + 1 : 1;
      const mapByName = new Map(current.map((p) => [p.nombre.toLowerCase().trim(), p]));
      items.forEach((item) => {
        const key = item.nombre.toLowerCase().trim();
        if (mapByName.has(key)) {
          const existing = mapByName.get(key)!;
          mapByName.set(key, { ...existing, nombre: item.nombre });
        } else {
          mapByName.set(key, { id: item.id || nextId++, nombre: item.nombre });
        }
      });
      finalItems = Array.from(mapByName.values());
    }

    setLocal(STORAGE_KEY.PAISES, finalItems);
    if (supabase) {
      try {
        await supabase.from('paises').upsert(finalItems);
      } catch (e) {
        console.warn('Supabase bulk save error', e);
      }
    }
    return finalItems;
  }

  // Productos
  static async getProductos(): Promise<Producto[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('productos').select('*').order('sku');
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Falling back to local data for productos', e);
      }
    }
    return getLocal(STORAGE_KEY.PRODUCTOS, INITIAL_PRODUCTOS);
  }

  static async saveProducto(prod: Producto): Promise<Producto> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('productos').upsert(prod).select().single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase save error, fallback to local', e);
      }
    }
    const current = getLocal(STORAGE_KEY.PRODUCTOS, INITIAL_PRODUCTOS);
    const existingIndex = current.findIndex((p) => p.sku === prod.sku);
    let updated: Producto[];
    if (existingIndex >= 0) {
      updated = current.map((p) => (p.sku === prod.sku ? prod : p));
    } else {
      updated = [...current, prod];
    }
    setLocal(STORAGE_KEY.PRODUCTOS, updated);
    return prod;
  }

  static async saveProductosBulk(items: Producto[], mode: 'append' | 'replace' = 'append'): Promise<Producto[]> {
    const supabase = getSupabase();
    const current = getLocal(STORAGE_KEY.PRODUCTOS, INITIAL_PRODUCTOS);
    let finalItems: Producto[] = [];

    if (mode === 'replace') {
      finalItems = items;
    } else {
      const mapBySku = new Map(current.map((p) => [p.sku.toUpperCase(), p]));
      items.forEach((p) => {
        mapBySku.set(p.sku.toUpperCase(), p);
      });
      finalItems = Array.from(mapBySku.values());
    }

    setLocal(STORAGE_KEY.PRODUCTOS, finalItems);
    if (supabase) {
      try {
        await supabase.from('productos').upsert(finalItems);
      } catch (e) {
        console.warn('Supabase bulk save productos error', e);
      }
    }
    return finalItems;
  }

  // Tiendas
  static async getTiendas(): Promise<Tienda[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('tiendas').select('*').order('nombre');
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Falling back to local data for tiendas', e);
      }
    }
    return getLocal(STORAGE_KEY.TIENDAS, INITIAL_TIENDAS);
  }

  static async saveTienda(tienda: { id?: number; nombre: string }): Promise<Tienda> {
    const current = getLocal(STORAGE_KEY.TIENDAS, INITIAL_TIENDAS);
    if (tienda.id) {
      const updated = current.map((t) => (t.id === tienda.id ? { ...t, nombre: tienda.nombre } : t));
      setLocal(STORAGE_KEY.TIENDAS, updated);
      return { id: tienda.id, nombre: tienda.nombre };
    } else {
      const nextId = current.length > 0 ? Math.max(...current.map((t) => t.id)) + 1 : 1;
      const created = { id: nextId, nombre: tienda.nombre };
      setLocal(STORAGE_KEY.TIENDAS, [...current, created]);
      return created;
    }
  }

  static async saveTiendasBulk(items: Tienda[], mode: 'append' | 'replace' = 'append'): Promise<Tienda[]> {
    const supabase = getSupabase();
    const current = getLocal(STORAGE_KEY.TIENDAS, INITIAL_TIENDAS);
    let finalItems: Tienda[] = [];

    if (mode === 'replace') {
      finalItems = items.map((it, idx) => ({ id: it.id || idx + 1, nombre: it.nombre }));
    } else {
      let nextId = current.length > 0 ? Math.max(...current.map((t) => t.id)) + 1 : 1;
      const mapByName = new Map(current.map((t) => [t.nombre.toLowerCase().trim(), t]));
      items.forEach((item) => {
        const key = item.nombre.toLowerCase().trim();
        if (mapByName.has(key)) {
          const existing = mapByName.get(key)!;
          mapByName.set(key, { ...existing, nombre: item.nombre });
        } else {
          mapByName.set(key, { id: item.id || nextId++, nombre: item.nombre });
        }
      });
      finalItems = Array.from(mapByName.values());
    }

    setLocal(STORAGE_KEY.TIENDAS, finalItems);
    if (supabase) {
      try {
        await supabase.from('tiendas').upsert(finalItems);
      } catch (e) {
        console.warn('Supabase bulk save tiendas error', e);
      }
    }
    return finalItems;
  }

  // Escalones de Seguidores
  static async getEscalones(): Promise<EscalonesSeguidores[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('escalones_seguidores').select('*').order('seguidores_hasta');
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Falling back to local data for escalones', e);
      }
    }
    return getLocal(STORAGE_KEY.ESCALONES, INITIAL_ESCALONES);
  }

  static async saveEscalon(item: EscalonesSeguidores): Promise<EscalonesSeguidores> {
    const current = getLocal(STORAGE_KEY.ESCALONES, INITIAL_ESCALONES);
    const existing = current.findIndex((e) => e.id === item.id);
    let updated: EscalonesSeguidores[];
    if (existing >= 0) {
      updated = current.map((e) => (e.id === item.id ? item : e));
    } else {
      const nextId = current.length > 0 ? Math.max(...current.map((e) => e.id)) + 1 : 1;
      item.id = nextId;
      updated = [...current, item];
    }
    setLocal(STORAGE_KEY.ESCALONES, updated);
    return item;
  }

  static async saveEscalonesBulk(items: EscalonesSeguidores[], mode: 'append' | 'replace' = 'append'): Promise<EscalonesSeguidores[]> {
    const supabase = getSupabase();
    const current = getLocal(STORAGE_KEY.ESCALONES, INITIAL_ESCALONES);
    let finalItems: EscalonesSeguidores[] = [];

    if (mode === 'replace') {
      finalItems = items.map((it, idx) => ({
        id: it.id || idx + 1,
        seguidores_hasta: it.seguidores_hasta,
        usd_mes: it.usd_mes,
        comentario: it.comentario || '',
      }));
    } else {
      let nextId = current.length > 0 ? Math.max(...current.map((e) => e.id)) + 1 : 1;
      const mapByLimit = new Map(current.map((e) => [e.seguidores_hasta, e]));
      items.forEach((item) => {
        if (mapByLimit.has(item.seguidores_hasta)) {
          const existing = mapByLimit.get(item.seguidores_hasta)!;
          mapByLimit.set(item.seguidores_hasta, {
            ...existing,
            usd_mes: item.usd_mes,
            comentario: item.comentario || existing.comentario,
          });
        } else {
          mapByLimit.set(item.seguidores_hasta, {
            id: item.id || nextId++,
            seguidores_hasta: item.seguidores_hasta,
            usd_mes: item.usd_mes,
            comentario: item.comentario || `Hasta ${item.seguidores_hasta} seguidores`,
          });
        }
      });
      finalItems = Array.from(mapByLimit.values()).sort((a, b) => a.seguidores_hasta - b.seguidores_hasta);
    }

    setLocal(STORAGE_KEY.ESCALONES, finalItems);
    if (supabase) {
      try {
        await supabase.from('escalones_seguidores').upsert(finalItems);
      } catch (e) {
        console.warn('Supabase bulk save escalones error', e);
      }
    }
    return finalItems;
  }

  // Medios
  static async getMedios(): Promise<Medio[]> {
    return getLocal(STORAGE_KEY.MEDIOS, INITIAL_MEDIOS);
  }

  static async saveMediosBulk(items: Medio[], mode: 'append' | 'replace' = 'append'): Promise<Medio[]> {
    const current = getLocal(STORAGE_KEY.MEDIOS, INITIAL_MEDIOS);
    let finalItems: Medio[] = [];
    if (mode === 'replace') {
      finalItems = items.map((it, idx) => ({ id: it.id || idx + 1, nombre: it.nombre }));
    } else {
      let nextId = current.length > 0 ? Math.max(...current.map((m) => m.id)) + 1 : 1;
      const map = new Map(current.map((m) => [m.nombre.toLowerCase().trim(), m]));
      items.forEach((it) => {
        const k = it.nombre.toLowerCase().trim();
        if (map.has(k)) {
          map.set(k, { ...map.get(k)!, nombre: it.nombre });
        } else {
          map.set(k, { id: it.id || nextId++, nombre: it.nombre });
        }
      });
      finalItems = Array.from(map.values());
    }
    setLocal(STORAGE_KEY.MEDIOS, finalItems);
    return finalItems;
  }

  // Redes Sociales
  static async getRedes(): Promise<RedSocial[]> {
    return getLocal(STORAGE_KEY.REDES, INITIAL_REDES);
  }

  static async saveRedesBulk(items: RedSocial[], mode: 'append' | 'replace' = 'append'): Promise<RedSocial[]> {
    const current = getLocal(STORAGE_KEY.REDES, INITIAL_REDES);
    let finalItems: RedSocial[] = [];
    if (mode === 'replace') {
      finalItems = items.map((it, idx) => ({ id: it.id || idx + 1, nombre: it.nombre }));
    } else {
      let nextId = current.length > 0 ? Math.max(...current.map((r) => r.id)) + 1 : 1;
      const map = new Map(current.map((r) => [r.nombre.toLowerCase().trim(), r]));
      items.forEach((it) => {
        const k = it.nombre.toLowerCase().trim();
        if (map.has(k)) {
          map.set(k, { ...map.get(k)!, nombre: it.nombre });
        } else {
          map.set(k, { id: it.id || nextId++, nombre: it.nombre });
        }
      });
      finalItems = Array.from(map.values());
    }
    setLocal(STORAGE_KEY.REDES, finalItems);
    return finalItems;
  }

  // Tipos de Publicación
  static async getTiposPub(): Promise<TipoPublicacion[]> {
    return getLocal(STORAGE_KEY.TIPOS_PUB, INITIAL_TIPOS_PUB);
  }

  static async saveTiposPubBulk(items: TipoPublicacion[], mode: 'append' | 'replace' = 'append'): Promise<TipoPublicacion[]> {
    const current = getLocal(STORAGE_KEY.TIPOS_PUB, INITIAL_TIPOS_PUB);
    let finalItems: TipoPublicacion[] = [];
    if (mode === 'replace') {
      finalItems = items.map((it, idx) => ({ id: it.id || idx + 1, nombre: it.nombre }));
    } else {
      let nextId = current.length > 0 ? Math.max(...current.map((tp) => tp.id)) + 1 : 1;
      const map = new Map(current.map((tp) => [tp.nombre.toLowerCase().trim(), tp]));
      items.forEach((it) => {
        const k = it.nombre.toLowerCase().trim();
        if (map.has(k)) {
          map.set(k, { ...map.get(k)!, nombre: it.nombre });
        } else {
          map.set(k, { id: it.id || nextId++, nombre: it.nombre });
        }
      });
      finalItems = Array.from(map.values());
    }
    setLocal(STORAGE_KEY.TIPOS_PUB, finalItems);
    return finalItems;
  }

  // Tipos de Contrato
  static async getTiposContrato(): Promise<TipoContrato[]> {
    return getLocal(STORAGE_KEY.TIPOS_CONTRATO, INITIAL_TIPOS_CONTRATO);
  }

  static async saveTiposContratoBulk(items: TipoContrato[], mode: 'append' | 'replace' = 'append'): Promise<TipoContrato[]> {
    const current = getLocal(STORAGE_KEY.TIPOS_CONTRATO, INITIAL_TIPOS_CONTRATO);
    let finalItems: TipoContrato[] = [];
    if (mode === 'replace') {
      finalItems = items.map((it, idx) => ({ id: it.id || idx + 1, nombre: it.nombre }));
    } else {
      let nextId = current.length > 0 ? Math.max(...current.map((tc) => tc.id)) + 1 : 1;
      const map = new Map(current.map((tc) => [tc.nombre.toLowerCase().trim(), tc]));
      items.forEach((it) => {
        const k = it.nombre.toLowerCase().trim();
        if (map.has(k)) {
          map.set(k, { ...map.get(k)!, nombre: it.nombre });
        } else {
          map.set(k, { id: it.id || nextId++, nombre: it.nombre });
        }
      });
      finalItems = Array.from(map.values());
    }
    setLocal(STORAGE_KEY.TIPOS_CONTRATO, finalItems);
    return finalItems;
  }

  // Usuarios & Roles
  static async getUsuarios(): Promise<Usuario[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('usuarios').select('*').order('nombre');
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Falling back to local data for usuarios', e);
      }
    }
    return getLocal(STORAGE_KEY.USUARIOS, INITIAL_USUARIOS);
  }

  static async saveUsuario(user: Usuario): Promise<Usuario> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('usuarios').upsert({
          id: user.id,
          email: user.email,
          nombre: user.nombre,
          rol: user.rol,
        }).select().single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase user save error, fallback to local', e);
      }
    }
    const current = getLocal(STORAGE_KEY.USUARIOS, INITIAL_USUARIOS);
    const idx = current.findIndex((u) => u.id === user.id || u.email === user.email);
    let updated: Usuario[];
    if (idx >= 0) {
      updated = current.map((u, i) => (i === idx ? { ...u, ...user } : u));
    } else {
      updated = [...current, user];
    }
    setLocal(STORAGE_KEY.USUARIOS, updated);
    return user;
  }

  // Acuerdos (Formulario 1)
  static async getAcuerdos(): Promise<Acuerdo[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('acuerdos')
          .select(`
            *,
            paises_impacto:acuerdo_paises_impacto(*),
            productos:acuerdo_productos(*),
            otros:acuerdo_otros_contenidos(*)
          `)
          .order('id', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Falling back to local data for acuerdos', e);
      }
    }
    return getLocal(STORAGE_KEY.ACUERDOS, INITIAL_ACUERDOS);
  }

  static async saveAcuerdo(acuerdoData: Omit<Acuerdo, 'id' | 'created_at'> & { id?: number }): Promise<Acuerdo> {
    const current = getLocal(STORAGE_KEY.ACUERDOS, INITIAL_ACUERDOS);
    const existing = acuerdoData.id ? current.find((a) => a.id === acuerdoData.id) : undefined;
    const newId = acuerdoData.id || (current.length > 0 ? Math.max(...current.map((a) => a.id)) + 1 : 1001);

    const fullAcuerdo: Acuerdo = {
      ...acuerdoData,
      id: newId,
      created_at: existing?.created_at || new Date().toISOString(),
    };

    // Save locally
    setLocal(STORAGE_KEY.ACUERDOS, [fullAcuerdo, ...current.filter((a) => a.id !== newId)]);

    // Try Supabase insert or update if available
    const supabase = getSupabase();
    if (supabase) {
      try {
        if (acuerdoData.id) {
          // UPDATE EXISTING
          await supabase
            .from('acuerdos')
            .update({
              solicitante_id: fullAcuerdo.solicitante_id,
              responsable_id: fullAcuerdo.responsable_id,
              pais_id: fullAcuerdo.pais_id,
              influencer: fullAcuerdo.influencer,
              seguidores: fullAcuerdo.seguidores,
              link_instagram: fullAcuerdo.link_instagram,
              celular: fullAcuerdo.celular,
              target: fullAcuerdo.target,
              tipo_contrato_id: fullAcuerdo.tipo_contrato_id,
              contrato_link: fullAcuerdo.contrato_link,
              contrato_archivo_url: fullAcuerdo.contrato_archivo_url,
              monto_usd: fullAcuerdo.monto_usd,
              tipo_envio: fullAcuerdo.tipo_envio,
              costo_envio_usd: fullAcuerdo.costo_envio_usd,
              meses_acordados: fullAcuerdo.meses_acordados,
              fecha_inicio: fullAcuerdo.fecha_inicio,
              fecha_fin: fullAcuerdo.fecha_fin,
              stories_totales: fullAcuerdo.stories_totales,
              feeds_totales: fullAcuerdo.feeds_totales,
              cantidad_retiros: fullAcuerdo.cantidad_retiros,
              fechas_retiro_estimadas: fullAcuerdo.fechas_retiro_estimadas,
              cantidad_entregas: fullAcuerdo.cantidad_entregas,
              fechas_entrega_estimadas: fullAcuerdo.fechas_entrega_estimadas,
            })
            .eq('id', acuerdoData.id);

          // Update paises impacto
          await supabase.from('acuerdo_paises_impacto').delete().eq('acuerdo_id', acuerdoData.id);
          if (fullAcuerdo.paises_impacto && fullAcuerdo.paises_impacto.length > 0) {
            await supabase.from('acuerdo_paises_impacto').insert(
              fullAcuerdo.paises_impacto.map((p) => ({
                acuerdo_id: acuerdoData.id,
                pais_id: p.pais_id,
                peso: p.peso,
              }))
            );
          }

          // Update productos
          await supabase.from('acuerdo_productos').delete().eq('acuerdo_id', acuerdoData.id);
          if (fullAcuerdo.productos && fullAcuerdo.productos.length > 0) {
            await supabase.from('acuerdo_productos').insert(
              fullAcuerdo.productos.map((pr) => ({
                acuerdo_id: acuerdoData.id,
                sku: pr.sku,
                cantidad_acordada: pr.cantidad_acordada,
                cantidad_restante: pr.cantidad_restante ?? pr.cantidad_acordada,
              }))
            );
          }

          // Update otros contenidos
          await supabase.from('acuerdo_otros_contenidos').delete().eq('acuerdo_id', acuerdoData.id);
          if (fullAcuerdo.otros_contenidos && fullAcuerdo.otros_contenidos.length > 0) {
            await supabase.from('acuerdo_otros_contenidos').insert(
              fullAcuerdo.otros_contenidos.map((t) => ({
                acuerdo_id: acuerdoData.id,
                tipo: t,
              }))
            );
          }
        } else {
          // INSERT NEW
          const { data: insertedAcuerdo, error: acuerdoError } = await supabase
            .from('acuerdos')
            .insert({
              solicitante_id: fullAcuerdo.solicitante_id,
              responsable_id: fullAcuerdo.responsable_id,
              pais_id: fullAcuerdo.pais_id,
              influencer: fullAcuerdo.influencer,
              seguidores: fullAcuerdo.seguidores,
              link_instagram: fullAcuerdo.link_instagram,
              celular: fullAcuerdo.celular,
              target: fullAcuerdo.target,
              tipo_contrato_id: fullAcuerdo.tipo_contrato_id,
              contrato_link: fullAcuerdo.contrato_link,
              contrato_archivo_url: fullAcuerdo.contrato_archivo_url,
              monto_usd: fullAcuerdo.monto_usd,
              tipo_envio: fullAcuerdo.tipo_envio,
              costo_envio_usd: fullAcuerdo.costo_envio_usd,
              meses_acordados: fullAcuerdo.meses_acordados,
              fecha_inicio: fullAcuerdo.fecha_inicio,
              fecha_fin: fullAcuerdo.fecha_fin,
              stories_totales: fullAcuerdo.stories_totales,
              feeds_totales: fullAcuerdo.feeds_totales,
              cantidad_retiros: fullAcuerdo.cantidad_retiros,
              fechas_retiro_estimadas: fullAcuerdo.fechas_retiro_estimadas,
              cantidad_entregas: fullAcuerdo.cantidad_entregas,
              fechas_entrega_estimadas: fullAcuerdo.fechas_entrega_estimadas,
            })
            .select()
            .single();

          if (!acuerdoError && insertedAcuerdo) {
            const insertedId = insertedAcuerdo.id;

            // Insert paises impacto
            if (fullAcuerdo.paises_impacto && fullAcuerdo.paises_impacto.length > 0) {
              await supabase.from('acuerdo_paises_impacto').insert(
                fullAcuerdo.paises_impacto.map((p) => ({
                  acuerdo_id: insertedId,
                  pais_id: p.pais_id,
                  peso: p.peso,
                }))
              );
            }

            // Insert productos
            if (fullAcuerdo.productos && fullAcuerdo.productos.length > 0) {
              await supabase.from('acuerdo_productos').insert(
                fullAcuerdo.productos.map((pr) => ({
                  acuerdo_id: insertedId,
                  sku: pr.sku,
                  cantidad_acordada: pr.cantidad_acordada,
                  cantidad_restante: pr.cantidad_acordada,
                }))
              );
            }

            // Insert otros contenidos
            if (fullAcuerdo.otros_contenidos && fullAcuerdo.otros_contenidos.length > 0) {
              await supabase.from('acuerdo_otros_contenidos').insert(
                fullAcuerdo.otros_contenidos.map((t) => ({
                  acuerdo_id: insertedId,
                  tipo: t,
                }))
              );
            }

            fullAcuerdo.id = insertedId;
          }
        }
      } catch (err) {
        console.warn('Supabase agreement save error:', err);
      }
    }

    return fullAcuerdo;
  }

  static async deleteAcuerdo(id: number): Promise<void> {
    const current = getLocal(STORAGE_KEY.ACUERDOS, INITIAL_ACUERDOS);
    setLocal(STORAGE_KEY.ACUERDOS, current.filter((a) => a.id !== id));

    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('acuerdo_paises_impacto').delete().eq('acuerdo_id', id);
        await supabase.from('acuerdo_productos').delete().eq('acuerdo_id', id);
        await supabase.from('acuerdo_otros_contenidos').delete().eq('acuerdo_id', id);
        await supabase.from('acuerdos').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase delete acuerdo error:', e);
      }
    }
  }

  // Pedidos (Formulario 2)
  static async getPedidos(): Promise<Pedido[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('pedidos')
          .select(`
            *,
            productos:pedido_productos(*),
            acuerdo:acuerdos(*)
          `)
          .order('id', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Falling back to local data for pedidos', e);
      }
    }
    return getLocal(STORAGE_KEY.PEDIDOS, INITIAL_PEDIDOS);
  }

  static async savePedido(pedidoData: Omit<Pedido, 'id' | 'created_at'> & { id?: number }): Promise<Pedido> {
    const current = getLocal(STORAGE_KEY.PEDIDOS, INITIAL_PEDIDOS);
    const existing = pedidoData.id ? current.find((p) => p.id === pedidoData.id) : undefined;
    const newId = pedidoData.id || (current.length > 0 ? Math.max(...current.map((p) => p.id)) + 1 : 5001);

    const fullPedido: Pedido = {
      ...pedidoData,
      id: newId,
      created_at: existing?.created_at || new Date().toISOString(),
    };

    // If updating, first restore previous quantities from this order on the acuerdo
    const acuerdos = getLocal(STORAGE_KEY.ACUERDOS, INITIAL_ACUERDOS);
    if (existing && existing.productos) {
      const acuerdoPrevIdx = acuerdos.findIndex((a) => a.id === existing.acuerdo_id);
      if (acuerdoPrevIdx >= 0 && acuerdos[acuerdoPrevIdx].productos) {
        acuerdos[acuerdoPrevIdx].productos = acuerdos[acuerdoPrevIdx].productos!.map((ap) => {
          const prevProd = existing.productos?.find((pp) => pp.sku === ap.sku);
          if (prevProd) {
            return {
              ...ap,
              cantidad_restante: Math.min(ap.cantidad_acordada, (ap.cantidad_restante ?? 0) + prevProd.cantidad),
            };
          }
          return ap;
        });
      }
    }

    // Now subtract the new order quantities from the target agreement
    const acuerdoIdx = acuerdos.findIndex((a) => a.id === fullPedido.acuerdo_id);
    if (acuerdoIdx >= 0 && acuerdos[acuerdoIdx].productos) {
      acuerdos[acuerdoIdx].productos = acuerdos[acuerdoIdx].productos!.map((ap) => {
        const pedProd = fullPedido.productos?.find((pp) => pp.sku === ap.sku);
        if (pedProd) {
          return {
            ...ap,
            cantidad_restante: Math.max(0, (ap.cantidad_restante ?? ap.cantidad_acordada) - pedProd.cantidad),
          };
        }
        return ap;
      });
      setLocal(STORAGE_KEY.ACUERDOS, acuerdos);
    }

    // Save locally
    setLocal(STORAGE_KEY.PEDIDOS, [fullPedido, ...current.filter((p) => p.id !== newId)]);

    // Try Supabase insert or update if available
    const supabase = getSupabase();
    if (supabase) {
      try {
        if (pedidoData.id) {
          // UPDATE EXISTING
          await supabase
            .from('pedidos')
            .update({
              acuerdo_id: fullPedido.acuerdo_id,
              fecha: fullPedido.fecha,
              tipo_entrega: fullPedido.tipo_entrega,
              tienda_id: fullPedido.tienda_id,
              direccion: fullPedido.direccion,
              codigo_postal: fullPedido.codigo_postal,
              localidad: fullPedido.localidad,
              provincia: fullPedido.provincia,
              comentarios: fullPedido.comentarios,
            })
            .eq('id', pedidoData.id);

          await supabase.from('pedido_productos').delete().eq('pedido_id', pedidoData.id);
          if (fullPedido.productos && fullPedido.productos.length > 0) {
            await supabase.from('pedido_productos').insert(
              fullPedido.productos.map((pp) => ({
                pedido_id: pedidoData.id,
                sku: pp.sku,
                cantidad: pp.cantidad,
              }))
            );
          }
        } else {
          // INSERT NEW
          const { data: inserted, error } = await supabase
            .from('pedidos')
            .insert({
              acuerdo_id: fullPedido.acuerdo_id,
              fecha: fullPedido.fecha,
              tipo_entrega: fullPedido.tipo_entrega,
              tienda_id: fullPedido.tienda_id,
              direccion: fullPedido.direccion,
              codigo_postal: fullPedido.codigo_postal,
              localidad: fullPedido.localidad,
              provincia: fullPedido.provincia,
              comentarios: fullPedido.comentarios,
              created_by: fullPedido.created_by,
            })
            .select()
            .single();

          if (!error && inserted) {
            if (fullPedido.productos && fullPedido.productos.length > 0) {
              await supabase.from('pedido_productos').insert(
                fullPedido.productos.map((pp) => ({
                  pedido_id: inserted.id,
                  sku: pp.sku,
                  cantidad: pp.cantidad,
                }))
              );
            }
            fullPedido.id = inserted.id;
          }
        }
      } catch (err) {
        console.warn('Supabase pedido save error:', err);
      }
    }

    return fullPedido;
  }

  static async deletePedido(id: number): Promise<void> {
    const current = getLocal(STORAGE_KEY.PEDIDOS, INITIAL_PEDIDOS);
    const toDelete = current.find((p) => p.id === id);
    if (toDelete) {
      // Restore remaining quantities
      const acuerdos = getLocal(STORAGE_KEY.ACUERDOS, INITIAL_ACUERDOS);
      const acuerdoIdx = acuerdos.findIndex((a) => a.id === toDelete.acuerdo_id);
      if (acuerdoIdx >= 0) {
        const acuerdo = acuerdos[acuerdoIdx];
        if (acuerdo.productos) {
          acuerdo.productos = acuerdo.productos.map((ap) => {
            const pedProd = toDelete.productos?.find((pp) => pp.sku === ap.sku);
            if (pedProd) {
              return {
                ...ap,
                cantidad_restante: Math.min(ap.cantidad_acordada, (ap.cantidad_restante ?? 0) + pedProd.cantidad),
              };
            }
            return ap;
          });
          acuerdos[acuerdoIdx] = { ...acuerdo };
          setLocal(STORAGE_KEY.ACUERDOS, acuerdos);
        }
      }
    }
    setLocal(STORAGE_KEY.PEDIDOS, current.filter((p) => p.id !== id));

    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('pedidos').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase delete pedido error:', e);
      }
    }
  }

  // Reportes (Formulario 3)
  static async getReportes(): Promise<Reporte[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('reportes')
          .select(`
            *,
            productos:reporte_productos(*),
            acuerdo:acuerdos(*)
          `)
          .order('id', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Falling back to local data for reportes', e);
      }
    }
    return getLocal(STORAGE_KEY.REPORTES, INITIAL_REPORTES);
  }

  static async saveReporte(reporteData: Omit<Reporte, 'id' | 'created_at'> & { id?: number }): Promise<Reporte> {
    const current = getLocal(STORAGE_KEY.REPORTES, INITIAL_REPORTES);
    const existing = reporteData.id ? current.find((r) => r.id === reporteData.id) : undefined;
    const newId = reporteData.id || (current.length > 0 ? Math.max(...current.map((r) => r.id)) + 1 : 7001);

    const fullReporte: Reporte = {
      ...reporteData,
      id: newId,
      created_at: existing?.created_at || new Date().toISOString(),
    };

    setLocal(STORAGE_KEY.REPORTES, [fullReporte, ...current.filter((r) => r.id !== newId)]);

    const supabase = getSupabase();
    if (supabase) {
      try {
        if (reporteData.id) {
          // UPDATE EXISTING
          await supabase
            .from('reportes')
            .update({
              acuerdo_id: fullReporte.acuerdo_id,
              medio_id: fullReporte.medio_id,
              red_social_id: fullReporte.red_social_id,
              tipo_publicacion_id: fullReporte.tipo_publicacion_id,
              link: fullReporte.link,
              captura_url: fullReporte.captura_url,
              fecha: fullReporte.fecha,
              me_gusta: fullReporte.me_gusta,
              comentarios: fullReporte.comentarios,
              compartidos: fullReporte.compartidos,
              guardados: fullReporte.guardados,
              reposts: fullReporte.reposts,
              visualizaciones: fullReporte.visualizaciones,
              marca_visible: fullReporte.marca_visible,
              etiqueto_carestino: fullReporte.etiqueto_carestino,
              etiqueto_carestino_pais: fullReporte.etiqueto_carestino_pais,
              etiqueto_otra_pagina: fullReporte.etiqueto_otra_pagina,
            })
            .eq('id', reporteData.id);

          await supabase.from('reporte_productos').delete().eq('reporte_id', reporteData.id);
          if (fullReporte.productos && fullReporte.productos.length > 0) {
            await supabase.from('reporte_productos').insert(
              fullReporte.productos.map((rp) => ({
                reporte_id: reporteData.id,
                sku: rp.sku,
                categoria: rp.categoria,
              }))
            );
          }
        } else {
          // INSERT NEW
          const { data: inserted, error } = await supabase
            .from('reportes')
            .insert({
              acuerdo_id: fullReporte.acuerdo_id,
              medio_id: fullReporte.medio_id,
              red_social_id: fullReporte.red_social_id,
              tipo_publicacion_id: fullReporte.tipo_publicacion_id,
              link: fullReporte.link,
              captura_url: fullReporte.captura_url,
              fecha: fullReporte.fecha,
              me_gusta: fullReporte.me_gusta,
              comentarios: fullReporte.comentarios,
              compartidos: fullReporte.compartidos,
              guardados: fullReporte.guardados,
              reposts: fullReporte.reposts,
              visualizaciones: fullReporte.visualizaciones,
              marca_visible: fullReporte.marca_visible,
              etiqueto_carestino: fullReporte.etiqueto_carestino,
              etiqueto_carestino_pais: fullReporte.etiqueto_carestino_pais,
              etiqueto_otra_pagina: fullReporte.etiqueto_otra_pagina,
              created_by: fullReporte.created_by,
            })
            .select()
            .single();

          if (!error && inserted) {
            if (fullReporte.productos && fullReporte.productos.length > 0) {
              await supabase.from('reporte_productos').insert(
                fullReporte.productos.map((rp) => ({
                  reporte_id: inserted.id,
                  sku: rp.sku,
                  categoria: rp.categoria,
                }))
              );
            }
            fullReporte.id = inserted.id;
          }
        }
      } catch (err) {
        console.warn('Supabase reporte save error:', err);
      }
    }

    return fullReporte;
  }

  static async deleteReporte(id: number): Promise<void> {
    const current = getLocal(STORAGE_KEY.REPORTES, INITIAL_REPORTES);
    setLocal(STORAGE_KEY.REPORTES, current.filter((r) => r.id !== id));

    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('reportes').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase delete reporte error:', e);
      }
    }
  }

  // Bulk import methods for Forms 1, 2, and 3
  static async saveAcuerdosBulk(acuerdosList: Array<Omit<Acuerdo, 'id' | 'created_at'>>): Promise<Acuerdo[]> {
    const savedList: Acuerdo[] = [];
    for (const item of acuerdosList) {
      try {
        const saved = await this.saveAcuerdo(item);
        savedList.push(saved);
      } catch (err) {
        console.error('Error saving bulk acuerdo item:', err);
      }
    }
    return savedList;
  }

  static async savePedidosBulk(pedidosList: Array<Omit<Pedido, 'id' | 'created_at'>>): Promise<Pedido[]> {
    const savedList: Pedido[] = [];
    for (const item of pedidosList) {
      try {
        const saved = await this.savePedido(item);
        savedList.push(saved);
      } catch (err) {
        console.error('Error saving bulk pedido item:', err);
      }
    }
    return savedList;
  }

  static async saveReportesBulk(reportesList: Array<Omit<Reporte, 'id' | 'created_at'>>): Promise<Reporte[]> {
    const savedList: Reporte[] = [];
    for (const item of reportesList) {
      try {
        const saved = await this.saveReporte(item);
        savedList.push(saved);
      } catch (err) {
        console.error('Error saving bulk reporte item:', err);
      }
    }
    return savedList;
  }
}
