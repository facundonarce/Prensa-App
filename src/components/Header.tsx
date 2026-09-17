import {
  RefreshCw,
  Settings,
  Database,
  FileText,
  ShoppingBag,
  BarChart2,
  Users,
  Target,
  Server,
  DollarSign,
} from 'lucide-react';
import { RolUsuario, Usuario } from '../types';

interface HeaderProps {
  activeModule: string;
  onOpenConfig: () => void;
  onRefreshData: () => void;
  hasConfig: boolean;
  currentUser: Usuario | null;
}

export function Header({
  activeModule,
  onOpenConfig,
  onRefreshData,
  hasConfig,
  currentUser,
}: HeaderProps) {
  const getModuleInfo = () => {
    switch (activeModule) {
      case 'acuerdos':
        return {
          module: 'PRENSA',
          view: 'ACUERDOS & CONTRATOS',
          title: 'Acuerdos con Influencers',
          desc: 'Formulario de alta, cálculo de meses teóricos, impacto país y seguimiento de contratos',
          icon: <FileText className="w-5 h-5 text-[#F15A24]" />,
        };
      case 'pedidos':
        return {
          module: 'LOGÍSTICA',
          view: 'PEDIDOS DE PRODUCTO',
          title: 'Pedidos y Despacho',
          desc: 'Despacho de productos según contratos pactados con validación de remanente por SKU',
          icon: <ShoppingBag className="w-5 h-5 text-[#F15A24]" />,
        };
      case 'reportes':
        return {
          module: 'CONTENIDO',
          view: 'REPORTES & MÉTRICAS',
          title: 'Reportes de Contenido Publicado',
          desc: 'Registro de posts, reels, stories, métricas de engagement y cumplimiento pactado',
          icon: <BarChart2 className="w-5 h-5 text-[#F15A24]" />,
        };
      case 'tablas':
        return {
          module: 'ADMINISTRACIÓN',
          view: 'LISTAS DE VALIDACIÓN',
          title: 'Listas de Validación & Escalones',
          desc: 'CRUD de Países, Productos (SKU), Tiendas, Medios y Escalones de Seguidores',
          icon: <Database className="w-5 h-5 text-[#F15A24]" />,
        };
      case 'usuarios':
        return {
          module: 'ADMINISTRACIÓN',
          view: 'USUARIOS & PERMISOS',
          title: 'Gestión de Usuarios y Roles',
          desc: 'Alta de analistas y administradores, asignación de permisos RLS en tabla usuarios',
          icon: <Users className="w-5 h-5 text-[#F15A24]" />,
        };
      case 'metas':
        return {
          module: 'ESTRATEGIA',
          view: 'METAS & PRESUPUESTOS',
          title: 'Metas y Presupuesto por País',
          desc: 'Carga manual de presupuesto USD mensual y objetivos de público, alcance e interacciones',
          icon: <Target className="w-5 h-5 text-[#F15A24]" />,
        };
      case 'setup':
      default:
        return {
          module: 'SISTEMA',
          view: 'CONEXIÓN & SETUP',
          title: 'Conexión a Supabase & Google OAuth',
          desc: 'Configuración de credenciales de Postgres, autenticación y esquema SQL',
          icon: <Server className="w-5 h-5 text-[#F15A24]" />,
        };
    }
  };

  const info = getModuleInfo();
  const role: RolUsuario | null = currentUser?.rol || null;

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-[#E7E7EA] px-6 py-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {/* Breadcrumb */}
          <div className="text-[10px] uppercase font-bold text-[#8A8F98] tracking-wider mb-1">
            PANEL &gt; {info.module} &gt; <span className="text-[#1F2226]">{info.view}</span>
          </div>

          {/* Title row */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FFF2ED] flex items-center justify-center shrink-0">
              {info.icon}
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1F2226] leading-tight">
                {info.title}
              </h1>
              <p className="text-xs text-[#4A4F57] mt-0.5">
                {info.desc}
              </p>
            </div>
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#FBFBFC] border border-[#E7E7EA] text-xs font-semibold text-[#1F2226]">
            <DollarSign className="w-3.5 h-3.5 text-[#F15A24]" />
            <span>USD</span>
          </div>

          <button
            onClick={onRefreshData}
            title="Sincronizar datos"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E7E7EA] hover:bg-[#F4F4F6] text-xs font-semibold text-[#1F2226] shadow-2xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#4A4F57]" />
            <span className="hidden sm:inline">Actualizar</span>
          </button>

          <button
            onClick={onOpenConfig}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition shadow-2xs ${
              hasConfig
                ? 'bg-[#ECFDF5] text-[#10B981] border-[#A7F3D0] hover:bg-[#D1FAE5]'
                : 'bg-[#FFFBEB] text-[#F59E0B] border-[#FDE68A] hover:bg-[#FEF3C7]'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${hasConfig ? 'bg-[#10B981] animate-pulse' : 'bg-[#F59E0B]'}`} />
            <span>{hasConfig ? 'Supabase Conectado' : 'Configurar Supabase'}</span>
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
