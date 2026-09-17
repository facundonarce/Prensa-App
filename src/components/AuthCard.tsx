import { useState } from 'react';
import { UserCheck, ShieldAlert, LogOut, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { signInWithGoogle, signOut } from '../lib/supabase';
import { UserRole, Usuario } from '../types';

interface AuthCardProps {
  currentUser: Usuario | null;
  isLoading: boolean;
  onRefreshSession: () => void;
  onSimulateRole: (role: UserRole | 'sin_rol' | null) => void;
  isSimulated: boolean;
}

export function AuthCard({
  currentUser,
  isLoading,
  onRefreshSession,
  onSimulateRole,
  isSimulated,
}: AuthCardProps) {
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsSigningIn(true);
      setAuthError(null);
      await signInWithGoogle();
    } catch (err: unknown) {
      console.error(err);
      const errorMsg = err instanceof Error ? err.message : 'Error al conectar con Supabase Auth';
      setAuthError(errorMsg);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      onRefreshSession();
    } catch (e) {
      console.error(e);
    }
  };

  const getRoleBadge = (role: UserRole | null) => {
    switch (role) {
      case 'admin_general':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            Admin General
          </span>
        );
      case 'admin_prensa':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            Admin Prensa
          </span>
        );
      case 'analista':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            Analista
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Sin Rol Asignado
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            Autenticación y Control de Acceso
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Login con Google a través de Supabase Auth y validación de rol en tabla <code>usuarios</code>.
          </p>
        </div>

        {/* Simulator controls for instant evaluation */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-xl text-xs">
          <span className="text-slate-500 font-medium px-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Simular rol:
          </span>
          <button
            onClick={() => onSimulateRole('admin_general')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              currentUser?.rol === 'admin_general' && isSimulated
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            admin_general
          </button>
          <button
            onClick={() => onSimulateRole('admin_prensa')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              currentUser?.rol === 'admin_prensa' && isSimulated
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            admin_prensa
          </button>
          <button
            onClick={() => onSimulateRole('analista')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              currentUser?.rol === 'analista' && isSimulated
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            analista
          </button>
          <button
            onClick={() => onSimulateRole('sin_rol')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              currentUser && currentUser.rol === null && isSimulated
                ? 'bg-white text-slate-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            sin acceso
          </button>
          {isSimulated && (
            <button
              onClick={() => onSimulateRole(null)}
              className="text-[11px] text-slate-400 hover:text-slate-600 underline ml-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 pt-5 border-t border-slate-100">
        {isLoading ? (
          <div className="flex items-center justify-center py-6 text-slate-500 text-sm gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            <span>Verificando sesión...</span>
          </div>
        ) : !currentUser ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <p className="text-sm font-semibold text-slate-800">No has iniciado sesión</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Ingresá con tu cuenta corporativa de Google para acceder a Carestino Prensa.
              </p>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={isSigningIn}
              className="inline-flex items-center justify-center gap-2.5 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-sm font-semibold shadow-xs transition hover:border-slate-400 disabled:opacity-50"
            >
              {isSigningIn ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Iniciar sesión con Google</span>
            </button>
          </div>
        ) : currentUser.rol === null ? (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-amber-900">
                    Usuario sin rol asignado (Pendiente de aprobación)
                  </h4>
                  <button
                    onClick={handleSignOut}
                    className="text-xs text-amber-800 hover:text-amber-950 font-medium inline-flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Cerrar sesión
                  </button>
                </div>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  Iniciaste sesión como <strong>{currentUser.email}</strong>, pero según la regla del sistema:{' '}
                  <em>
                    "Al loguearse por primera vez, el usuario queda sin acceso hasta que el admin_general lo dé de alta en la tabla <code>usuarios</code> con un rol asignado."
                  </em>
                </p>
                <p className="text-xs text-amber-700 mt-2 font-medium">
                  Solicitá a un Administrador General que active tu cuenta en el panel de usuarios.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-sm">
                {currentUser.nombre ? currentUser.nombre[0].toUpperCase() : currentUser.email[0].toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">
                    {currentUser.nombre || currentUser.email}
                  </span>
                  {getRoleBadge(currentUser.rol)}
                  {isSimulated && (
                    <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded">
                      Simulado
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{currentUser.email}</p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </div>
        )}

        {authError && (
          <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}
      </div>
    </div>
  );
}
