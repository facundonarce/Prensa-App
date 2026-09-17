import { useState } from 'react';
import {
  FileText,
  ShoppingBag,
  BarChart2,
  Database,
  Users,
  Target,
  Server,
  RefreshCw,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Usuario, RolUsuario } from '../types';

interface SidebarProps {
  currentUser: Usuario | null;
  activeModule: string;
  onSelectModule: (module: string) => void;
  datasetCount: number;
  lastSyncTime: string;
  onRefreshData: () => void;
  onSimulateRole: (role: RolUsuario | 'sin_rol' | null) => void;
  isSimulated: boolean;
  onSignOut?: () => void;
}

export function Sidebar({
  currentUser,
  activeModule,
  onSelectModule,
  datasetCount,
  lastSyncTime,
  onRefreshData,
  onSimulateRole,
  isSimulated,
  onSignOut,
}: SidebarProps) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const role: RolUsuario | null = currentUser?.rol || null;

  const canManageUsers = role === 'admin_general';
  const canManageValidation = role === 'admin_general' || role === 'admin_prensa';
  const canSeeMetas = role === 'admin_general' || role === 'admin_prensa';

  const getRoleLabel = (r: RolUsuario | null) => {
    switch (r) {
      case 'admin_general':
        return 'Admin General';
      case 'admin_prensa':
        return 'Líder Prensa';
      case 'analista':
        return 'Analista Prensa';
      default:
        return 'Sin Rol (Bloqueado)';
    }
  };

  return (
    <aside className="w-64 h-screen bg-white border-r border-[#E7E7EA] flex flex-col justify-between fixed left-0 top-0 z-30 select-none">
      {/* Top Brand Header */}
      <div>
        <div className="p-4 border-b border-[#E7E7EA]">
          <div className="flex items-center gap-3">
            {/* Isologo Carestino */}
            <div className="w-10 h-10 rounded-xl border border-[#E7E7EA] p-1 flex items-center justify-center bg-white shadow-2xs shrink-0 overflow-hidden">
              <img
                src="/carestino-isologo.png"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://trabajo.buenosaires.gob.ar/uploads/logos/2f4016af26e8407902a76ba105c6346f.png';
                }}
                alt="Carestino Isologo"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Logotipo + Pill BI */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold text-[#1F2226] tracking-tight">CARESTINO</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#FFF2ED] text-[#F15A24] shrink-0">
                  BI
                </span>
              </div>
              <div className="text-[11px] text-[#8A8F98] font-medium leading-none mt-0.5 truncate">
                Prensa & Influencers
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-270px)]">
          {/* Group 1: Prensa & Contratos */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] uppercase font-bold text-[#8A8F98] tracking-wider mb-1.5">
              Gestión de Prensa
            </div>

            <button
              onClick={() => onSelectModule('acuerdos')}
              className={`w-full flex items-center justify-between text-xs px-3 py-2.5 rounded-xl transition ${
                activeModule === 'acuerdos'
                  ? 'bg-[#FFF2ED] text-[#F15A24] font-bold shadow-2xs'
                  : 'text-[#4A4F57] hover:bg-[#F4F4F6] hover:text-[#1F2226]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4" />
                <span>Acuerdos (Contratos)</span>
              </div>
              {activeModule === 'acuerdos' && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#F15A24]" />
              )}
            </button>

            <button
              onClick={() => onSelectModule('pedidos')}
              className={`w-full flex items-center justify-between text-xs px-3 py-2.5 rounded-xl transition ${
                activeModule === 'pedidos'
                  ? 'bg-[#FFF2ED] text-[#F15A24] font-bold shadow-2xs'
                  : 'text-[#4A4F57] hover:bg-[#F4F4F6] hover:text-[#1F2226]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4" />
                <span>Pedidos de Producto</span>
              </div>
              {activeModule === 'pedidos' && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#F15A24]" />
              )}
            </button>

            <button
              onClick={() => onSelectModule('reportes')}
              className={`w-full flex items-center justify-between text-xs px-3 py-2.5 rounded-xl transition ${
                activeModule === 'reportes'
                  ? 'bg-[#FFF2ED] text-[#F15A24] font-bold shadow-2xs'
                  : 'text-[#4A4F57] hover:bg-[#F4F4F6] hover:text-[#1F2226]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BarChart2 className="w-4 h-4" />
                <span>Reportes de Contenido</span>
              </div>
              {activeModule === 'reportes' && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#F15A24]" />
              )}
            </button>
          </div>

          {/* Group 2: Administración & Control */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] uppercase font-bold text-[#8A8F98] tracking-wider mb-1.5">
              Administración
            </div>

            {canManageValidation && (
              <button
                onClick={() => onSelectModule('tablas')}
                className={`w-full flex items-center justify-between text-xs px-3 py-2.5 rounded-xl transition ${
                  activeModule === 'tablas'
                    ? 'bg-[#FFF2ED] text-[#F15A24] font-bold shadow-2xs'
                    : 'text-[#4A4F57] hover:bg-[#F4F4F6] hover:text-[#1F2226]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4" />
                  <span>Listas de Validación</span>
                </div>
                {activeModule === 'tablas' && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#F15A24]" />
                )}
              </button>
            )}

            {canManageUsers && (
              <button
                onClick={() => onSelectModule('usuarios')}
                className={`w-full flex items-center justify-between text-xs px-3 py-2.5 rounded-xl transition ${
                  activeModule === 'usuarios'
                    ? 'bg-[#FFF2ED] text-[#F15A24] font-bold shadow-2xs'
                    : 'text-[#4A4F57] hover:bg-[#F4F4F6] hover:text-[#1F2226]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4" />
                  <span>Usuarios & Permisos</span>
                </div>
                {activeModule === 'usuarios' && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#F15A24]" />
                )}
              </button>
            )}

            {canSeeMetas && (
              <button
                onClick={() => onSelectModule('metas')}
                className={`w-full flex items-center justify-between text-xs px-3 py-2.5 rounded-xl transition ${
                  activeModule === 'metas'
                    ? 'bg-[#FFF2ED] text-[#F15A24] font-bold shadow-2xs'
                    : 'text-[#4A4F57] hover:bg-[#F4F4F6] hover:text-[#1F2226]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Target className="w-4 h-4" />
                  <span>Metas & Presupuesto</span>
                </div>
                {activeModule === 'metas' && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#F15A24]" />
                )}
              </button>
            )}
          </div>

          {/* Group 3: Conexión & Backend */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] uppercase font-bold text-[#8A8F98] tracking-wider mb-1.5">
              Infraestructura
            </div>

            <button
              onClick={() => onSelectModule('setup')}
              className={`w-full flex items-center justify-between text-xs px-3 py-2.5 rounded-xl transition ${
                activeModule === 'setup'
                  ? 'bg-[#FFF2ED] text-[#F15A24] font-bold shadow-2xs'
                  : 'text-[#4A4F57] hover:bg-[#F4F4F6] hover:text-[#1F2226]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Server className="w-4 h-4" />
                <span>Conexión & Supabase</span>
              </div>
              {activeModule === 'setup' && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#F15A24]" />
              )}
            </button>
          </div>
        </nav>
      </div>

      {/* Bottom Footer: Dataset box + User profile */}
      <div className="p-3 border-t border-[#E7E7EA] space-y-2.5 bg-white">
        {/* Módulo Dataset */}
        <div className="rounded-xl border border-[#E7E7EA] p-2.5 bg-[#FBFBFC]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
              </span>
              <span className="text-[11px] font-bold text-[#1F2226]">Dataset Conectado</span>
            </div>
            <button
              onClick={onRefreshData}
              title="Sincronizar datos"
              className="text-[#8A8F98] hover:text-[#1F2226] p-0.5 rounded transition"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
          <div className="text-[10px] text-[#4A4F57] mt-1 flex items-center justify-between tabular-nums">
            <span>{datasetCount} registros analizados</span>
            <span className="text-[#8A8F98]">{lastSyncTime}</span>
          </div>
        </div>

        {/* User profile with role simulation switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#F4F4F6] transition text-left border border-transparent hover:border-[#E7E7EA]"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#F15A24] text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                {currentUser?.nombre ? currentUser.nombre[0].toUpperCase() : 'J'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#1F2226] truncate">
                  {currentUser?.nombre || currentUser?.email || 'Joaquín Méndez'}
                </div>
                <div className="text-[10px] text-[#8A8F98] truncate flex items-center gap-1">
                  <span>{getRoleLabel(role)}</span>
                  {isSimulated && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-[#FFF2ED] text-[#F15A24] font-semibold">
                      TEST
                    </span>
                  )}
                </div>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#8A8F98] shrink-0" />
          </button>

          {/* Role selector dropdown */}
          {showRoleMenu && (
            <div className="absolute bottom-full left-0 w-full mb-1 bg-white rounded-xl border border-[#E7E7EA] shadow-lg p-1.5 z-40 space-y-1 text-xs animate-in fade-in zoom-in-95">
              <div className="px-2 py-1 text-[10px] font-bold uppercase text-[#8A8F98] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#F15A24]" />
                Simular Rol de Usuario
              </div>
              <button
                onClick={() => {
                  onSimulateRole('admin_general');
                  setShowRoleMenu(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                  role === 'admin_general' ? 'bg-[#FFF2ED] text-[#F15A24] font-bold' : 'hover:bg-[#F4F4F6] text-[#4A4F57]'
                }`}
              >
                1. Admin General (Acceso Total)
              </button>
              <button
                onClick={() => {
                  onSimulateRole('admin_prensa');
                  setShowRoleMenu(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                  role === 'admin_prensa' ? 'bg-[#FFF2ED] text-[#F15A24] font-bold' : 'hover:bg-[#F4F4F6] text-[#4A4F57]'
                }`}
              >
                2. Admin Prensa (Líder Equipo)
              </button>
              <button
                onClick={() => {
                  onSimulateRole('analista');
                  setShowRoleMenu(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                  role === 'analista' ? 'bg-[#FFF2ED] text-[#F15A24] font-bold' : 'hover:bg-[#F4F4F6] text-[#4A4F57]'
                }`}
              >
                3. Analista (Solo sus acuerdos)
              </button>
              <button
                onClick={() => {
                  onSimulateRole('sin_rol');
                  setShowRoleMenu(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-[#EF4444] hover:bg-[#FEF2F2]"
              >
                4. Usuario Nuevo (Sin Rol/Bloqueado)
              </button>
              {isSimulated && (
                <button
                  onClick={() => {
                    onSimulateRole(null);
                    setShowRoleMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1 border-t border-[#E7E7EA] text-[11px] text-[#8A8F98] hover:text-[#1F2226]"
                >
                  Restablecer sesión real
                </button>
              )}
              {onSignOut && (
                <button
                  onClick={() => {
                    setShowRoleMenu(false);
                    onSignOut();
                  }}
                  className="w-full flex items-center gap-1.5 px-2.5 py-1.5 border-t border-[#E7E7EA] text-xs font-semibold text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Cerrar sesión</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
