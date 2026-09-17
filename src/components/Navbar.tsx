import { Settings, Shield, FileText, ShoppingBag, BarChart3, Database } from 'lucide-react';
import { UserRole, Usuario } from '../types';

interface NavbarProps {
  currentUser: Usuario | null;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenConfig: () => void;
  hasConfig: boolean;
}

export function Navbar({
  currentUser,
  activeTab,
  onSelectTab,
  onOpenConfig,
  hasConfig,
}: NavbarProps) {
  const role: UserRole | null = currentUser?.rol || null;

  // RBAC for navigation tabs
  const canSeeAdminUsers = role === 'admin_general';
  const canSeeValidationLists = role === 'admin_general' || role === 'admin_prensa';
  const canSeeMetas = role === 'admin_general' || role === 'admin_prensa';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl border border-slate-200 p-1 flex items-center justify-center bg-white shadow-xs shrink-0 overflow-hidden">
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
              <div>
                <span className="font-extrabold text-slate-900 tracking-tight text-lg">
                  CARESTINO
                </span>
                <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase tracking-wider">
                  Prensa & Influencers
                </span>
              </div>
            </div>

            {/* Main nav tabs if authorized */}
            {role && (
              <nav className="hidden md:flex items-center space-x-1">
                <button
                  onClick={() => onSelectTab('setup')}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'setup'
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Conexión & Setup
                </button>

                <button
                  onClick={() => onSelectTab('acuerdos')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'acuerdos'
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Acuerdos
                </button>

                <button
                  onClick={() => onSelectTab('pedidos')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'pedidos'
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Pedidos
                </button>

                <button
                  onClick={() => onSelectTab('reportes')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'reportes'
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  Reportes & KPI
                </button>

                {canSeeValidationLists && (
                  <button
                    onClick={() => onSelectTab('tablas')}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                      activeTab === 'tablas'
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Database className="w-3.5 h-3.5" />
                    Listas Validación
                  </button>
                )}

                {canSeeAdminUsers && (
                  <button
                    onClick={() => onSelectTab('usuarios')}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                      activeTab === 'usuarios'
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Usuarios
                  </button>
                )}
              </nav>
            )}
          </div>

          {/* Right side settings & connection indicator */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenConfig}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                hasConfig
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
              }`}
              title="Configurar Supabase"
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  hasConfig ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span className="hidden sm:inline">
                {hasConfig ? 'Supabase Conectado' : 'Supabase No Configurado'}
              </span>
              <Settings className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
