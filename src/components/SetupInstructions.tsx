import { useState } from 'react';
import { Key, FileCode, CheckCircle2, ShieldAlert, ArrowRight, Copy, Check, Eye, X } from 'lucide-react';

interface SetupInstructionsProps {
  onOpenConfig: () => void;
  hasConfig: boolean;
}

export function SetupInstructions({ onOpenConfig, hasConfig }: SetupInstructionsProps) {
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopySql = () => {
    fetch('/schema_supabase.sql')
      .then((res) => res.text())
      .then((text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      })
      .catch(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-linear-to-r from-slate-50 to-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 mb-2">
              Punto 1: Setup & Conexión
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              ¿Qué necesitamos de tu lado para arrancar?
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Para dejar 100% operativo el login con Google y la base de datos de Carestino Prensa, requerimos estos 4 elementos:
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSqlModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition shadow-xs"
            >
              <FileCode className="w-4 h-4" />
              <span>Ver SQL de Supabase</span>
            </button>

            <button
              onClick={onOpenConfig}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-xs ${
                hasConfig
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              <Key className="w-4 h-4" />
              {hasConfig ? 'Modificar credenciales Supabase' : 'Ingresar credenciales Supabase'}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Item 1 */}
        <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg shrink-0 mt-0.5">
              <Key className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-slate-800 text-sm">
                1. Credenciales de Supabase
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Necesitamos la <strong>Project URL</strong> y la <strong>anon public key</strong>. Las encontrás en tu proyecto de Supabase en <em>Project Settings → API</em>.
              </p>
              <div className="pt-2">
                <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md ${
                  hasConfig ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'
                }`}>
                  {hasConfig ? <CheckCircle2 className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                  {hasConfig ? 'Configurado en el cliente' : 'Pendiente de ingresar'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Item 2 */}
        <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg shrink-0 mt-0.5">
              <FileCode className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-slate-800 text-sm">
                2. Script <code>schema_supabase.sql</code> (Listo para pegar)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generamos el script SQL completo con todas las tablas (Catálogos, Acuerdos, Pedidos, Reportes), triggers de remanente y meses teóricos, RLS y datos iniciales de Carestino.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowSqlModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-100/80 hover:bg-blue-200 rounded-lg transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ver Script Completo</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Item 3 */}
        <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-lg shrink-0 mt-0.5">
              <span className="font-bold text-xs">G</span>
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-slate-800 text-sm">
                3. Google Cloud OAuth activado en Supabase
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                En <em>Google Cloud Console → APIs & Credentials</em> crear un <strong>OAuth 2.0 Client ID</strong> (Web).
                En Supabase <em>Authentication → Providers → Google</em>: activar y pegar el <strong>Client ID</strong> y <strong>Client Secret</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Item 4 */}
        <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg shrink-0 mt-0.5">
              <ArrowRight className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-slate-800 text-sm">
                4. Callback URL de Redirección
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                En Supabase <em>Authentication → URL Configuration</em>, agregar en <strong>Redirect URLs</strong> la URL de este entorno y/o la de producción en Vercel.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SQL Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Script SQL para Supabase (schema_supabase.sql)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Copia y pega este script en el SQL Editor de tu proyecto en Supabase
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#F15A24] hover:bg-[#D94E1B] rounded-lg transition"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? '¡Copiado!' : 'Copiar SQL'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSqlModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 flex-1 overflow-y-auto bg-slate-950 font-mono text-xs text-slate-200 leading-relaxed">
              <p className="text-slate-400 mb-3">
                -- Puedes copiar todo este bloque y ejecutarlo en: Supabase Dashboard &gt; SQL Editor &gt; New Query &gt; Run
              </p>
              <pre className="whitespace-pre-wrap select-all font-mono text-[11px] text-emerald-400/90">
{`-- ==============================================================================
-- SISTEMA DE GESTIÓN DE PRENSA & INFLUENCERS - CARESTINO
-- Schema completo para Supabase (PostgreSQL 15+)
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE rol_usuario AS ENUM ('admin_general', 'admin_prensa', 'analista');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE tipo_envio AS ENUM ('tienda', 'domicilio');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. TABLAS DE CATÁLOGO
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    nombre TEXT,
    rol rol_usuario NOT NULL DEFAULT 'analista',
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.paises (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS public.productos (
    sku TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    categoria TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tiendas (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.medios (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS public.redes_sociales (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS public.tipos_publicacion (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS public.tipos_contrato (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS public.escalones_seguidores (
    id SERIAL PRIMARY KEY,
    seguidores_hasta BIGINT NOT NULL UNIQUE,
    usd_mes NUMERIC(10, 2) NOT NULL CHECK (usd_mes >= 0),
    comentario TEXT
);

CREATE TABLE IF NOT EXISTS public.metas (
    id SERIAL PRIMARY KEY,
    pais_id INTEGER NOT NULL REFERENCES public.paises(id) ON DELETE CASCADE,
    mes DATE NOT NULL,
    objetivo_publico NUMERIC(14, 2) DEFAULT 0,
    objetivo_alcance NUMERIC(14, 2) DEFAULT 0,
    objetivo_interacciones NUMERIC(14, 2) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (pais_id, mes)
);

CREATE TABLE IF NOT EXISTS public.presupuestos (
    id SERIAL PRIMARY KEY,
    pais_id INTEGER NOT NULL REFERENCES public.paises(id) ON DELETE CASCADE,
    mes DATE NOT NULL,
    monto_presupuestado NUMERIC(14, 2) DEFAULT 0,
    monto_consumido NUMERIC(14, 2) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (pais_id, mes)
);

-- 4. FORMULARIO 1: ACUERDOS
CREATE TABLE IF NOT EXISTS public.acuerdos (
    id SERIAL PRIMARY KEY,
    solicitante_id UUID NOT NULL REFERENCES public.usuarios(id),
    responsable_id UUID NOT NULL REFERENCES public.usuarios(id),
    pais_id INTEGER NOT NULL REFERENCES public.paises(id),
    influencer TEXT NOT NULL,
    seguidores BIGINT NOT NULL CHECK (seguidores >= 0),
    link_instagram TEXT,
    celular TEXT,
    target BOOLEAN NOT NULL DEFAULT true,
    tipo_contrato_id INTEGER NOT NULL REFERENCES public.tipos_contrato(id),
    contrato_link TEXT,
    contrato_archivo_url TEXT,
    monto_usd NUMERIC(12, 2) NOT NULL CHECK (monto_usd >= 0),
    tipo_envio tipo_envio NOT NULL,
    costo_envio_usd NUMERIC(10, 2) DEFAULT 0 CHECK (costo_envio_usd >= 0),
    meses_teoricos INTEGER NOT NULL DEFAULT 1 CHECK (meses_teoricos >= 1),
    meses_acordados INTEGER NOT NULL CHECK (meses_acordados >= 1),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    stories_totales INTEGER NOT NULL DEFAULT 0 CHECK (stories_totales >= 0),
    feeds_totales INTEGER NOT NULL DEFAULT 0 CHECK (feeds_totales >= 0),
    cantidad_retiros INTEGER CHECK (cantidad_retiros >= 0),
    fechas_retiro_estimadas TEXT,
    cantidad_entregas INTEGER CHECK (cantidad_entregas >= 0),
    fechas_entrega_estimadas TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.acuerdo_paises_impacto (
    id SERIAL PRIMARY KEY,
    acuerdo_id INTEGER NOT NULL REFERENCES public.acuerdos(id) ON DELETE CASCADE,
    pais_id INTEGER NOT NULL REFERENCES public.paises(id),
    peso NUMERIC(5, 2) NOT NULL CHECK (peso > 0 AND peso <= 100),
    UNIQUE (acuerdo_id, pais_id)
);

CREATE TABLE IF NOT EXISTS public.acuerdo_productos (
    id SERIAL PRIMARY KEY,
    acuerdo_id INTEGER NOT NULL REFERENCES public.acuerdos(id) ON DELETE CASCADE,
    sku TEXT NOT NULL REFERENCES public.productos(sku) ON UPDATE CASCADE,
    cantidad_acordada INTEGER NOT NULL CHECK (cantidad_acordada > 0),
    cantidad_restante INTEGER NOT NULL CHECK (cantidad_restante >= 0),
    UNIQUE (acuerdo_id, sku)
);

CREATE TABLE IF NOT EXISTS public.acuerdo_otros_contenidos (
    id SERIAL PRIMARY KEY,
    acuerdo_id INTEGER NOT NULL REFERENCES public.acuerdos(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL
);

-- 5. FORMULARIO 2: PEDIDOS
CREATE TABLE IF NOT EXISTS public.pedidos (
    id SERIAL PRIMARY KEY,
    acuerdo_id INTEGER NOT NULL REFERENCES public.acuerdos(id) ON DELETE CASCADE,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    tipo_entrega tipo_envio NOT NULL,
    tienda_id INTEGER REFERENCES public.tiendas(id),
    direccion TEXT,
    codigo_postal TEXT,
    localidad TEXT,
    provincia TEXT,
    comentarios TEXT,
    created_by UUID NOT NULL REFERENCES public.usuarios(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pedido_productos (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
    sku TEXT NOT NULL REFERENCES public.productos(sku) ON UPDATE CASCADE,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0)
);

-- 6. FORMULARIO 3: REPORTES
CREATE TABLE IF NOT EXISTS public.reportes (
    id SERIAL PRIMARY KEY,
    acuerdo_id INTEGER NOT NULL REFERENCES public.acuerdos(id) ON DELETE CASCADE,
    medio_id INTEGER NOT NULL REFERENCES public.medios(id),
    red_social_id INTEGER REFERENCES public.redes_sociales(id),
    tipo_publicacion_id INTEGER REFERENCES public.tipos_publicacion(id),
    link TEXT,
    captura_url TEXT,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    me_gusta INTEGER DEFAULT 0,
    comentarios INTEGER DEFAULT 0,
    compartidos INTEGER DEFAULT 0,
    guardados INTEGER DEFAULT 0,
    reposts INTEGER DEFAULT 0,
    visualizaciones INTEGER DEFAULT 0,
    marca_visible BOOLEAN,
    etiqueto_carestino BOOLEAN,
    etiqueto_carestino_pais BOOLEAN,
    etiqueto_otra_pagina BOOLEAN,
    created_by UUID NOT NULL REFERENCES public.usuarios(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reporte_productos (
    id SERIAL PRIMARY KEY,
    reporte_id INTEGER NOT NULL REFERENCES public.reportes(id) ON DELETE CASCADE,
    sku TEXT NOT NULL REFERENCES public.productos(sku) ON UPDATE CASCADE,
    categoria TEXT NOT NULL
);

-- 7. TRIGGERS
CREATE OR REPLACE FUNCTION public.fn_calcular_meses_teoricos()
RETURNS TRIGGER AS $$
DECLARE v_usd_mes NUMERIC(10, 2);
BEGIN
    SELECT usd_mes INTO v_usd_mes FROM public.escalones_seguidores
    WHERE seguidores_hasta >= NEW.seguidores ORDER BY seguidores_hasta ASC LIMIT 1;
    IF v_usd_mes IS NULL THEN
        SELECT usd_mes INTO v_usd_mes FROM public.escalones_seguidores ORDER BY seguidores_hasta DESC LIMIT 1;
    END IF;
    IF v_usd_mes IS NULL OR v_usd_mes <= 0 THEN v_usd_mes := 1500; END IF;
    NEW.meses_teoricos := GREATEST(1, CEIL(NEW.monto_usd / v_usd_mes));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calcular_meses_teoricos ON public.acuerdos;
CREATE TRIGGER trg_calcular_meses_teoricos
BEFORE INSERT OR UPDATE OF monto_usd, seguidores ON public.acuerdos
FOR EACH ROW EXECUTE FUNCTION public.fn_calcular_meses_teoricos();

CREATE OR REPLACE FUNCTION public.fn_actualizar_remanente_pedido()
RETURNS TRIGGER AS $$
DECLARE v_acuerdo_id INTEGER; v_disponible INTEGER;
BEGIN
    SELECT acuerdo_id INTO v_acuerdo_id FROM public.pedidos WHERE id = NEW.pedido_id;
    SELECT cantidad_restante INTO v_disponible FROM public.acuerdo_productos WHERE acuerdo_id = v_acuerdo_id AND sku = NEW.sku;
    IF v_disponible IS NULL THEN RAISE EXCEPTION 'El SKU % no está en el acuerdo #%', NEW.sku, v_acuerdo_id; END IF;
    IF NEW.cantidad > v_disponible THEN RAISE EXCEPTION 'Stock insuficiente para SKU %. Restante: %, solicitado: %', NEW.sku, v_disponible, NEW.cantidad; END IF;
    UPDATE public.acuerdo_productos SET cantidad_restante = cantidad_restante - NEW.cantidad WHERE acuerdo_id = v_acuerdo_id AND sku = NEW.sku;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_descontar_remanente_pedido ON public.pedido_productos;
CREATE TRIGGER trg_descontar_remanente_pedido
AFTER INSERT ON public.pedido_productos
FOR EACH ROW EXECUTE FUNCTION public.fn_actualizar_remanente_pedido();

-- 8. DATOS SEMILLA BÁSICOS
INSERT INTO public.paises (id, nombre) VALUES
    (1, 'Argentina'), (2, 'Colombia'), (3, 'Perú'), (4, 'Chile'),
    (5, 'Uruguay'), (6, 'Paraguay'), (7, 'Panamá'), (8, 'México')
ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre;

INSERT INTO public.medios (id, nombre) VALUES
    (1, 'Radio'), (2, 'TV'), (3, 'Red Social'), (4, 'Nota Periodística')
ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre;

INSERT INTO public.redes_sociales (id, nombre) VALUES
    (1, 'Instagram'), (2, 'Facebook'), (3, 'TikTok'), (4, 'YouTube')
ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre;

INSERT INTO public.tipos_publicacion (id, nombre) VALUES
    (1, 'Carrusel'), (2, 'Reel'), (3, 'Stories')
ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre;

INSERT INTO public.tipos_contrato (id, nombre) VALUES
    (1, 'Canje'), (2, 'Pago'), (3, 'Mixto')
ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre;

INSERT INTO public.escalones_seguidores (id, seguidores_hasta, usd_mes, comentario) VALUES
    (1, 50000, 100.00, 'Hasta 50K'), (2, 100000, 150.00, 'Hasta 100K'),
    (3, 200000, 200.00, 'Hasta 200K'), (4, 300000, 275.00, 'Hasta 300K'),
    (5, 400000, 350.00, 'Hasta 400K'), (6, 500000, 425.00, 'Hasta 500K'),
    (7, 750000, 500.00, 'Hasta 750K'), (8, 1000000, 625.00, 'Hasta 1M'),
    (9, 2000000, 750.00, 'Hasta 2M'), (10, 3500000, 1200.00, 'Hasta 3.5M'),
    (11, 100000000, 1500.00, 'Hasta 100M')
ON CONFLICT (seguidores_hasta) DO UPDATE SET usd_mes = EXCLUDED.usd_mes;`}
              </pre>
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="text-xs text-slate-500">
                El archivo también se encuentra guardado en la raíz del proyecto como <code>schema_supabase.sql</code>.
              </span>
              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition"
              >
                Entendido, cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

