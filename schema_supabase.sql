-- ==============================================================================
-- SISTEMA DE GESTIÓN DE PRENSA & INFLUENCERS - CARESTINO
-- Schema completo para Supabase (PostgreSQL 15+)
-- Incluye: Tablas, Relaciones, Enums, Triggers, RLS y Datos Semilla (Seeds)
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS Y TIPOS PERSONALIZADOS
DO $$ BEGIN
    CREATE TYPE rol_usuario AS ENUM ('admin_general', 'admin_prensa', 'analista');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE tipo_envio AS ENUM ('tienda', 'domicilio');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABLAS DE CONFIGURACIÓN Y CATÁLOGOS (LISTAS DE VALIDACIÓN)

-- 3.1 Usuarios del sistema (sincronizados con auth.users de Supabase)
-- Regla de Negocio: Solo usuarios activos y con rol asignado por el admin pueden operar.
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    nombre TEXT,
    rol rol_usuario NULL,
    activo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.2 Países de operación
CREATE TABLE IF NOT EXISTS public.paises (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE
);

-- 3.3 Catálogo de Productos
CREATE TABLE IF NOT EXISTS public.productos (
    sku TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    categoria TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.4 Tiendas / Sucursales físicas
CREATE TABLE IF NOT EXISTS public.tiendas (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL
);

-- 3.5 Medios de Difusión
CREATE TABLE IF NOT EXISTS public.medios (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE
);

-- 3.6 Redes Sociales
CREATE TABLE IF NOT EXISTS public.redes_sociales (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE
);

-- 3.7 Tipos de Publicación
CREATE TABLE IF NOT EXISTS public.tipos_publicacion (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE
);

-- 3.8 Tipos de Contrato
CREATE TABLE IF NOT EXISTS public.tipos_contrato (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE
);

-- 3.9 Escalones de Seguidores (Cálculo de USD/mes según audiencia)
CREATE TABLE IF NOT EXISTS public.escalones_seguidores (
    id SERIAL PRIMARY KEY,
    seguidores_hasta BIGINT NOT NULL UNIQUE,
    usd_mes NUMERIC(10, 2) NOT NULL CHECK (usd_mes >= 0),
    comentario TEXT
);

-- 3.10 Metas mensuales por País
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

-- 3.11 Presupuestos mensuales por País
CREATE TABLE IF NOT EXISTS public.presupuestos (
    id SERIAL PRIMARY KEY,
    pais_id INTEGER NOT NULL REFERENCES public.paises(id) ON DELETE CASCADE,
    mes DATE NOT NULL,
    monto_presupuestado NUMERIC(14, 2) DEFAULT 0,
    monto_consumido NUMERIC(14, 2) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (pais_id, mes)
);

-- 4. MÓDULO 1: FORMULARIO 1 - ACUERDOS DE PRENSA (CONTRATOS)

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

-- 4.1 Países de Impacto por Acuerdo (Prorrateo de audiencia %)
CREATE TABLE IF NOT EXISTS public.acuerdo_paises_impacto (
    id SERIAL PRIMARY KEY,
    acuerdo_id INTEGER NOT NULL REFERENCES public.acuerdos(id) ON DELETE CASCADE,
    pais_id INTEGER NOT NULL REFERENCES public.paises(id),
    peso NUMERIC(5, 2) NOT NULL CHECK (peso > 0 AND peso <= 100),
    UNIQUE (acuerdo_id, pais_id)
);

-- 4.2 Productos acordados por contrato con control de remanente
CREATE TABLE IF NOT EXISTS public.acuerdo_productos (
    id SERIAL PRIMARY KEY,
    acuerdo_id INTEGER NOT NULL REFERENCES public.acuerdos(id) ON DELETE CASCADE,
    sku TEXT NOT NULL REFERENCES public.productos(sku) ON UPDATE CASCADE,
    cantidad_acordada INTEGER NOT NULL CHECK (cantidad_acordada > 0),
    cantidad_restante INTEGER NOT NULL CHECK (cantidad_restante >= 0),
    UNIQUE (acuerdo_id, sku)
);

-- 4.3 Otros contenidos solicitados (TikTok, YouTube, Facebook, etc.)
CREATE TABLE IF NOT EXISTS public.acuerdo_otros_contenidos (
    id SERIAL PRIMARY KEY,
    acuerdo_id INTEGER NOT NULL REFERENCES public.acuerdos(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL
);

-- 5. MÓDULO 2: FORMULARIO 2 - PEDIDOS DE PRODUCTO (DESPACHOS)

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

-- 5.1 Items de productos despachados en cada pedido
CREATE TABLE IF NOT EXISTS public.pedido_productos (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
    sku TEXT NOT NULL REFERENCES public.productos(sku) ON UPDATE CASCADE,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0)
);

-- 6. MÓDULO 3: FORMULARIO 3 - REPORTES DE CONTENIDO & ENGAGEMENT

CREATE TABLE IF NOT EXISTS public.reportes (
    id SERIAL PRIMARY KEY,
    acuerdo_id INTEGER NOT NULL REFERENCES public.acuerdos(id) ON DELETE CASCADE,
    medio_id INTEGER NOT NULL REFERENCES public.medios(id),
    red_social_id INTEGER REFERENCES public.redes_sociales(id),
    tipo_publicacion_id INTEGER REFERENCES public.tipos_publicacion(id),
    link TEXT,
    captura_url TEXT,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    -- Métricas de Engagement (manuales si es Red Social)
    me_gusta INTEGER DEFAULT 0,
    comentarios INTEGER DEFAULT 0,
    compartidos INTEGER DEFAULT 0,
    guardados INTEGER DEFAULT 0,
    reposts INTEGER DEFAULT 0,
    visualizaciones INTEGER DEFAULT 0,
    -- Validación de marca Carestino (Sí / No)
    marca_visible BOOLEAN,
    etiqueto_carestino BOOLEAN,
    etiqueto_carestino_pais BOOLEAN,
    etiqueto_otra_pagina BOOLEAN,
    created_by UUID NOT NULL REFERENCES public.usuarios(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6.1 Productos expuestos en la publicación (con categoría autocompletada)
CREATE TABLE IF NOT EXISTS public.reporte_productos (
    id SERIAL PRIMARY KEY,
    reporte_id INTEGER NOT NULL REFERENCES public.reportes(id) ON DELETE CASCADE,
    sku TEXT NOT NULL REFERENCES public.productos(sku) ON UPDATE CASCADE,
    categoria TEXT NOT NULL
);

-- 7. ÍNDICES DE RENDIMIENTO PARA CONSULTAS Y DASHBOARDS
CREATE INDEX IF NOT EXISTS idx_acuerdos_pais ON public.acuerdos(pais_id);
CREATE INDEX IF NOT EXISTS idx_acuerdos_responsable ON public.acuerdos(responsable_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_acuerdo ON public.pedidos(acuerdo_id);
CREATE INDEX IF NOT EXISTS idx_reportes_acuerdo ON public.reportes(acuerdo_id);
CREATE INDEX IF NOT EXISTS idx_reportes_fecha ON public.reportes(fecha);
CREATE INDEX IF NOT EXISTS idx_acuerdo_productos_acuerdo ON public.acuerdo_productos(acuerdo_id);
CREATE INDEX IF NOT EXISTS idx_pedido_productos_pedido ON public.pedido_productos(pedido_id);
CREATE INDEX IF NOT EXISTS idx_reporte_productos_reporte ON public.reporte_productos(reporte_id);

-- ==============================================================================
-- 8. TRIGGERS AUTOMÁTICOS
-- ==============================================================================

-- 8.1 Cálculo automático de Meses Teóricos al insertar o actualizar Acuerdo
CREATE OR REPLACE FUNCTION public.fn_calcular_meses_teoricos()
RETURNS TRIGGER AS $$
DECLARE
    v_usd_mes NUMERIC(10, 2);
BEGIN
    -- Busca el escalón correspondiente según la cantidad de seguidores
    SELECT usd_mes INTO v_usd_mes
    FROM public.escalones_seguidores
    WHERE seguidores_hasta >= NEW.seguidores
    ORDER BY seguidores_hasta ASC
    LIMIT 1;

    -- Si los seguidores superan el último escalón, toma el valor más alto
    IF v_usd_mes IS NULL THEN
        SELECT usd_mes INTO v_usd_mes
        FROM public.escalones_seguidores
        ORDER BY seguidores_hasta DESC
        LIMIT 1;
    END IF;

    -- Si no hay escalones configurados, fallback por defecto a 1500 USD
    IF v_usd_mes IS NULL OR v_usd_mes <= 0 THEN
        v_usd_mes := 1500;
    END IF;

    -- Cálculo: CEIL(monto_usd / usd_mes)
    NEW.meses_teoricos := GREATEST(1, CEIL(NEW.monto_usd / v_usd_mes));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calcular_meses_teoricos ON public.acuerdos;
CREATE TRIGGER trg_calcular_meses_teoricos
BEFORE INSERT OR UPDATE OF monto_usd, seguidores ON public.acuerdos
FOR EACH ROW
EXECUTE FUNCTION public.fn_calcular_meses_teoricos();


-- 8.2 Descontar remanente de productos al emitir un pedido (Formulario 2)
CREATE OR REPLACE FUNCTION public.fn_actualizar_remanente_pedido()
RETURNS TRIGGER AS $$
DECLARE
    v_acuerdo_id INTEGER;
    v_disponible INTEGER;
BEGIN
    -- Obtener el acuerdo_id asociado al pedido
    SELECT acuerdo_id INTO v_acuerdo_id
    FROM public.pedidos
    WHERE id = NEW.pedido_id;

    -- Validar existencia en el contrato y cantidad disponible
    SELECT cantidad_restante INTO v_disponible
    FROM public.acuerdo_productos
    WHERE acuerdo_id = v_acuerdo_id AND sku = NEW.sku;

    IF v_disponible IS NULL THEN
        RAISE EXCEPTION 'El producto con SKU % no está incluido en el acuerdo #%', NEW.sku, v_acuerdo_id;
    END IF;

    IF NEW.cantidad > v_disponible THEN
        RAISE EXCEPTION 'Stock acordado insuficiente para SKU %. Restante disponible: %, solicitado: %',
            NEW.sku, v_disponible, NEW.cantidad;
    END IF;

    -- Descontar remanente
    UPDATE public.acuerdo_productos
    SET cantidad_restante = cantidad_restante - NEW.cantidad
    WHERE acuerdo_id = v_acuerdo_id AND sku = NEW.sku;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_descontar_remanente_pedido ON public.pedido_productos;
CREATE TRIGGER trg_descontar_remanente_pedido
AFTER INSERT ON public.pedido_productos
FOR EACH ROW
EXECUTE FUNCTION public.fn_actualizar_remanente_pedido();


-- 8.3 Restaurar remanente si se cancela o elimina un pedido
CREATE OR REPLACE FUNCTION public.fn_restaurar_remanente_pedido()
RETURNS TRIGGER AS $$
DECLARE
    v_acuerdo_id INTEGER;
BEGIN
    SELECT acuerdo_id INTO v_acuerdo_id
    FROM public.pedidos
    WHERE id = OLD.pedido_id;

    IF v_acuerdo_id IS NOT NULL THEN
        UPDATE public.acuerdo_productos
        SET cantidad_restante = LEAST(cantidad_acordada, cantidad_restante + OLD.cantidad)
        WHERE acuerdo_id = v_acuerdo_id AND sku = OLD.sku;
    END IF;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_restaurar_remanente_pedido ON public.pedido_productos;
CREATE TRIGGER trg_restaurar_remanente_pedido
AFTER DELETE ON public.pedido_productos
FOR EACH ROW
EXECUTE FUNCTION public.fn_restaurar_remanente_pedido();


-- 8.4 Sincronización de usuarios Google Auth con public.usuarios
-- Regla de Seguridad: Si el usuario ya fue pre-cargado por el Administrador, se vincula y preserva su rol.
-- Si es un correo desconocido, se registra sin rol y deshabilitado (activo = false) para no otorgar acceso no autorizado.
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.usuarios WHERE email = NEW.email) THEN
        UPDATE public.usuarios
        SET id = NEW.id,
            nombre = COALESCE(public.usuarios.nombre, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
        WHERE email = NEW.email;
    ELSE
        INSERT INTO public.usuarios (id, email, nombre, rol, activo)
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
            NULL,
            false
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_auth_user();


-- ==============================================================================
-- 9. SEGURIDAD A NIVEL DE FILAS (ROW LEVEL SECURITY - RLS)
-- ==============================================================================

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tiendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redes_sociales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_publicacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_contrato ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalones_seguidores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presupuestos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acuerdos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acuerdo_paises_impacto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acuerdo_productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acuerdo_otros_contenidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedido_productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reportes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reporte_productos ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura abierta para usuarios autenticados
DO $$ BEGIN
    CREATE POLICY "Lectura pública catálogos para autenticados" ON public.paises FOR SELECT TO authenticated USING (true);
    CREATE POLICY "Lectura productos para autenticados" ON public.productos FOR SELECT TO authenticated USING (true);
    CREATE POLICY "Lectura tiendas para autenticados" ON public.tiendas FOR SELECT TO authenticated USING (true);
    CREATE POLICY "Lectura medios para autenticados" ON public.medios FOR SELECT TO authenticated USING (true);
    CREATE POLICY "Lectura redes para autenticados" ON public.redes_sociales FOR SELECT TO authenticated USING (true);
    CREATE POLICY "Lectura tipos_pub para autenticados" ON public.tipos_publicacion FOR SELECT TO authenticated USING (true);
    CREATE POLICY "Lectura tipos_contrato para autenticados" ON public.tipos_contrato FOR SELECT TO authenticated USING (true);
    CREATE POLICY "Lectura escalones para autenticados" ON public.escalones_seguidores FOR SELECT TO authenticated USING (true);
    CREATE POLICY "Lectura usuarios para autenticados" ON public.usuarios FOR SELECT TO authenticated USING (true);
    CREATE POLICY "Lectura metas para autenticados" ON public.metas FOR SELECT TO authenticated USING (true);
    CREATE POLICY "Lectura presupuestos para autenticados" ON public.presupuestos FOR SELECT TO authenticated USING (true);
    CREATE POLICY "Lectura acuerdos para autenticados" ON public.acuerdos FOR SELECT TO authenticated USING (true);
    CREATE POLICY "Lectura acuerdo_paises para autenticados" ON public.acuerdo_paises_impacto FOR SELECT TO authenticated USING (true);
    CREATE POLICY "Lectura acuerdo_productos para autenticados" ON public.acuerdo_productos FOR SELECT TO authenticated USING (true);
    CREATE POLICY "Lectura acuerdo_otros para autenticados" ON public.acuerdo_otros_contenidos FOR SELECT TO authenticated USING (true);
    CREATE POLICY "Lectura pedidos para autenticados" ON public.pedidos FOR SELECT TO authenticated USING (true);
    CREATE POLICY "Lectura pedido_productos para autenticados" ON public.pedido_productos FOR SELECT TO authenticated USING (true);
    CREATE POLICY "Lectura reportes para autenticados" ON public.reportes FOR SELECT TO authenticated USING (true);
    CREATE POLICY "Lectura reporte_productos para autenticados" ON public.reporte_productos FOR SELECT TO authenticated USING (true);

    -- Permisos de Inserción / Modificación
    CREATE POLICY "Inserción acuerdos para autenticados" ON public.acuerdos FOR ALL TO authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "Inserción acuerdo_paises para autenticados" ON public.acuerdo_paises_impacto FOR ALL TO authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "Inserción acuerdo_productos para autenticados" ON public.acuerdo_productos FOR ALL TO authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "Inserción acuerdo_otros para autenticados" ON public.acuerdo_otros_contenidos FOR ALL TO authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "Gestión pedidos para autenticados" ON public.pedidos FOR ALL TO authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "Gestión pedido_productos para autenticados" ON public.pedido_productos FOR ALL TO authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "Gestión reportes para autenticados" ON public.reportes FOR ALL TO authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "Gestión reporte_productos para autenticados" ON public.reporte_productos FOR ALL TO authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "Gestión catálogos para autenticados" ON public.paises FOR ALL TO authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "Gestión productos para autenticados" ON public.productos FOR ALL TO authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "Gestión tiendas para autenticados" ON public.tiendas FOR ALL TO authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "Gestión escalones para autenticados" ON public.escalones_seguidores FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- ==============================================================================
-- 10. DATOS SEMILLA (INITIAL SEEDS DE CARESTINO)
-- ==============================================================================

-- 10.1 Países
INSERT INTO public.paises (id, nombre) VALUES
    (1, 'Argentina'),
    (2, 'Colombia'),
    (3, 'Perú'),
    (4, 'Chile'),
    (5, 'Uruguay'),
    (6, 'Paraguay'),
    (7, 'Panamá'),
    (8, 'México')
ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre;

-- 10.2 Productos
INSERT INTO public.productos (sku, nombre, categoria) VALUES
    ('CAR-COCH-001', 'Cochecito Beverly Black Edition', 'Cochecitos'),
    ('CAR-COCH-002', 'Cochecito Travel System London', 'Cochecitos'),
    ('CAR-BUTA-010', 'Butaca Auto Isofix Monza 0-36kg', 'Butacas'),
    ('CAR-BUTA-012', 'Butaca Booster Daytona', 'Butacas'),
    ('CAR-CUNA-020', 'Practicuna Colecho Sweet Dreams', 'Cunas'),
    ('CAR-SILL-030', 'Silla de Comer Plegable Gourmet', 'Alimentación'),
    ('CAR-ACCE-050', 'Mochila Maternal Premium Térmica', 'Accesorios'),
    ('CAR-JUGU-070', 'Gimnasio Didáctico Play & Learn', 'Juguetes')
ON CONFLICT (sku) DO UPDATE SET nombre = EXCLUDED.nombre, categoria = EXCLUDED.categoria;

-- 10.3 Tiendas
INSERT INTO public.tiendas (id, nombre) VALUES
    (1, 'Tienda Unicenter (Buenos Aires)'),
    (2, 'Tienda Alto Palermo (Buenos Aires)'),
    (3, 'Tienda Palmas del Pilar'),
    (4, 'Tienda Córdoba Shopping'),
    (5, 'Tienda Rosario Portal'),
    (6, 'Tienda Montevideo Shopping (Uruguay)'),
    (7, 'Tienda Bogotá Calle 93 (Colombia)'),
    (8, 'Tienda Lima Jockey Plaza (Perú)')
ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre;

-- 10.4 Medios
INSERT INTO public.medios (id, nombre) VALUES
    (1, 'Radio'),
    (2, 'TV'),
    (3, 'Red Social'),
    (4, 'Nota Periodística')
ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre;

-- 10.5 Redes Sociales
INSERT INTO public.redes_sociales (id, nombre) VALUES
    (1, 'Instagram'),
    (2, 'Facebook'),
    (3, 'TikTok'),
    (4, 'YouTube')
ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre;

-- 10.6 Tipos de Publicación
INSERT INTO public.tipos_publicacion (id, nombre) VALUES
    (1, 'Carrusel'),
    (2, 'Reel'),
    (3, 'Stories')
ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre;

-- 10.7 Tipos de Contrato
INSERT INTO public.tipos_contrato (id, nombre) VALUES
    (1, 'Canje'),
    (2, 'Pago'),
    (3, 'Mixto')
ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre;

-- 10.8 Escalones de Seguidores y USD/mes
INSERT INTO public.escalones_seguidores (id, seguidores_hasta, usd_mes, comentario) VALUES
    (1, 50000, 100.00, 'Hasta 50K Seguidores'),
    (2, 100000, 150.00, 'Hasta 100K Seguidores'),
    (3, 200000, 200.00, 'Hasta 200K Seguidores'),
    (4, 300000, 275.00, 'Hasta 300K Seguidores'),
    (5, 400000, 350.00, 'Hasta 400K Seguidores'),
    (6, 500000, 425.00, 'Hasta 500K Seguidores'),
    (7, 750000, 500.00, 'Hasta 750K Seguidores'),
    (8, 1000000, 625.00, 'Hasta 1M Seguidores'),
    (9, 2000000, 750.00, 'Hasta 2M Seguidores'),
    (10, 3500000, 1200.00, 'Hasta 3.5M Seguidores'),
    (11, 100000000, 1500.00, 'Hasta 100M Seguidores')
ON CONFLICT (seguidores_hasta) DO UPDATE SET usd_mes = EXCLUDED.usd_mes, comentario = EXCLUDED.comentario;

-- 10.9 Usuarios Autorizados con Acceso Inicial (Padrón Carestino)
INSERT INTO public.usuarios (id, email, nombre, rol, activo) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'reporting@carestino.com', 'Reporting Carestino (Admin)', 'admin_general', true),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'joaquin.mendez@carestino.com', 'Joaquín Méndez (Admin General)', 'admin_general', true),
    ('b1234567-89ab-cdef-0123-456789abcdef', 'lucia.fernandez@carestino.com', 'Lucía Fernández (Líder Prensa)', 'admin_prensa', true),
    ('c2345678-9abc-def0-1234-56789abcdef0', 'santiago.rossi@carestino.com', 'Santiago Rossi (Analista Cono Sur)', 'analista', true),
    ('d3456789-abcd-ef01-2345-6789abcdef01', 'mariana.lopez@carestino.com', 'Mariana López (Analista Andina)', 'analista', true)
ON CONFLICT (email) DO UPDATE 
SET rol = EXCLUDED.rol, activo = EXCLUDED.activo, nombre = COALESCE(public.usuarios.nombre, EXCLUDED.nombre);

-- Ajustar las secuencias de las tablas con IDs seriales
SELECT setval('public.paises_id_seq', (SELECT MAX(id) FROM public.paises));
SELECT setval('public.tiendas_id_seq', (SELECT MAX(id) FROM public.tiendas));
SELECT setval('public.medios_id_seq', (SELECT MAX(id) FROM public.medios));
SELECT setval('public.redes_sociales_id_seq', (SELECT MAX(id) FROM public.redes_sociales));
SELECT setval('public.tipos_publicacion_id_seq', (SELECT MAX(id) FROM public.tipos_publicacion));
SELECT setval('public.tipos_contrato_id_seq', (SELECT MAX(id) FROM public.tipos_contrato));
SELECT setval('public.escalones_seguidores_id_seq', (SELECT MAX(id) FROM public.escalones_seguidores));
