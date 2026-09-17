// Types strictly mapped from schema_supabase.sql

export type RolUsuario = 'admin_general' | 'admin_prensa' | 'analista';
export type UserRole = RolUsuario;
export type TipoEnvio = 'tienda' | 'domicilio';

export interface Usuario {
  id: string; // uuid references auth.users(id)
  email: string;
  nombre: string | null;
  rol: RolUsuario | null;
  activo?: boolean;
  created_at?: string;
}

export interface Pais {
  id: number;
  nombre: string;
}

export interface Producto {
  sku: string;
  nombre: string;
  categoria: string;
}

export interface Tienda {
  id: number;
  nombre: string;
}

export interface Medio {
  id: number;
  nombre: string; // Radio, TV, Red Social, Nota Periodística
}

export interface RedSocial {
  id: number;
  nombre: string; // Instagram, Facebook, TikTok, etc.
}

export interface TipoPublicacion {
  id: number;
  nombre: string; // Carrusel, Reel, Stories
}

export interface TipoContrato {
  id: number;
  nombre: string; // Canje, Pago, Mixto
}

export interface EscalonesSeguidores {
  id: number;
  seguidores_hasta: number;
  usd_mes: number;
  comentario?: string | null;
}

export interface Meta {
  id?: number;
  pais_id: number;
  mes: string; // YYYY-MM-01
  objetivo_publico: number;
  objetivo_alcance: number;
  objetivo_interacciones: number;
}

export interface Presupuesto {
  id?: number;
  pais_id: number;
  mes: string; // YYYY-MM-01
  monto_presupuestado: number;
  monto_consumido: number;
}

// Acuerdos (Formulario 1)
export interface AcuerdoPaisImpacto {
  id?: number;
  acuerdo_id?: number;
  pais_id: number;
  peso: number; // check (peso > 0 and peso <= 100), sum must be 100
}

export interface AcuerdoProducto {
  id?: number;
  acuerdo_id?: number;
  sku: string;
  cantidad_acordada: number;
  cantidad_restante: number;
  // joined fields
  producto?: Producto;
}

export interface AcuerdoOtroContenido {
  acuerdo_id?: number;
  tipo: 'tiktok' | 'youtube' | 'facebook';
}

export interface Acuerdo {
  id: number;
  solicitante_id: string;
  responsable_id: string;
  pais_id: number;
  influencer: string;
  seguidores: number;
  link_instagram?: string | null;
  celular?: string | null;
  target: boolean;
  tipo_contrato_id: number;
  contrato_link?: string | null;
  contrato_archivo_url?: string | null;
  monto_usd: number;
  tipo_envio: TipoEnvio;
  costo_envio_usd?: number | null;
  meses_teoricos: number;
  meses_acordados: number;
  fecha_inicio: string; // YYYY-MM-01
  fecha_fin: string; // YYYY-MM-01
  stories_totales: number;
  feeds_totales: number;
  cantidad_retiros?: number | null;
  fechas_retiro_estimadas?: string | null;
  cantidad_entregas?: number | null;
  fechas_entrega_estimadas?: string | null;
  created_at: string;

  // Relational data
  paises_impacto?: AcuerdoPaisImpacto[];
  productos?: AcuerdoProducto[];
  otros_contenidos?: string[];
  solicitante?: Usuario;
  responsable?: Usuario;
  pais?: Pais;
  tipo_contrato?: TipoContrato;
}

// Pedidos (Formulario 2)
export interface PedidoProducto {
  id?: number;
  pedido_id?: number;
  sku: string;
  cantidad: number;
  producto?: Producto;
}

export interface Pedido {
  id: number;
  acuerdo_id: number;
  fecha: string;
  tipo_entrega: TipoEnvio;
  tienda_id?: number | null;
  direccion?: string | null;
  codigo_postal?: string | null;
  localidad?: string | null;
  provincia?: string | null;
  comentarios?: string | null;
  created_by: string;
  created_at: string;
  productos?: PedidoProducto[];
  acuerdo?: Acuerdo;
}

// Reportes (Formulario 3)
export interface ReporteProducto {
  id?: number;
  reporte_id?: number;
  sku: string;
  categoria: string;
  producto?: Producto;
}

export interface Reporte {
  id: number;
  acuerdo_id: number;
  medio_id: number;
  red_social_id?: number | null;
  tipo_publicacion_id?: number | null;
  link?: string | null;
  captura_url?: string | null;
  fecha: string;
  me_gusta?: number | null;
  comentarios?: number | null;
  compartidos?: number | null;
  guardados?: number | null;
  reposts?: number | null;
  visualizaciones?: number | null;
  marca_visible?: boolean | null;
  etiqueto_carestino?: boolean | null;
  etiqueto_carestino_pais?: boolean | null;
  etiqueto_otra_pagina?: boolean | null;
  created_by: string;
  created_at: string;
  productos?: ReporteProducto[];
  acuerdo?: Acuerdo;
}
