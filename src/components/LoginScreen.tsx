import { useState } from 'react';
import {
  ShieldAlert,
  Lock,
  Sparkles,
  Key,
  AlertCircle,
  Loader2,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { signInWithGoogle, getSavedConfig } from '../lib/supabase';

interface LoginScreenProps {
  hasConfig: boolean;
  onOpenConfig: () => void;
  unauthorizedUser?: { email: string; reason?: string } | null;
  onSignOut: () => void;
}

export function LoginScreen({
  hasConfig,
  onOpenConfig,
  unauthorizedUser,
  onSignOut,
}: LoginScreenProps) {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    const config = getSavedConfig();
    if (!config.url || !config.anonKey) {
      setAuthError('Falta configurar la URL y la Anon Key de Supabase para poder iniciar sesión.');
      onOpenConfig();
      return;
    }

    try {
      setIsSigningIn(true);
      setAuthError(null);
      await signInWithGoogle();
    } catch (err: unknown) {
      console.error(err);
      let msg = 'Error al conectar con Google OAuth';
      if (err instanceof Error) {
        msg = err.message;
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        msg = String((err as any).message);
      }
      setAuthError(msg);
      setIsSigningIn(false);
    }
  };

  // If user signed in with Google but is unauthorized (not in table or inactive or no role)
  if (unauthorizedUser) {
    return (
      <div className="min-h-screen bg-[#FBFBFC] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#FECACA] shadow-xl p-8 text-center space-y-6 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-2xl bg-[#FEF2F2] border border-[#FCA5A5] text-[#EF4444] flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FEF2F2] text-[#EF4444] border border-[#FECACA]">
              Acceso Denegado
            </span>
            <h1 className="text-xl font-extrabold text-[#1F2226]">
              Cuenta No Autorizada
            </h1>
            <p className="text-xs text-[#4A4F57] leading-relaxed">
              Iniciaste sesión con Google como:
            </p>
            <div className="inline-block px-3 py-1.5 rounded-xl bg-[#F4F4F6] border border-[#E7E7EA] font-mono text-xs font-semibold text-[#1F2226]">
              {unauthorizedUser.email}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] text-left space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#B45309]">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Regla de Acceso de Carestino:</span>
            </div>
            <p className="text-[11px] text-[#92400E] leading-relaxed">
              {unauthorizedUser.reason === 'inactive'
                ? 'Tu usuario figura registrado pero se encuentra en estado inactivo.'
                : unauthorizedUser.reason === 'no_role'
                ? 'Tu usuario está registrado pero aún no posee un rol asignado por administración.'
                : 'Esta cuenta de correo no se encuentra autorizada para acceder a la plataforma.'}
            </p>
            <p className="text-[11px] text-[#92400E]">
              Contacta al <strong>Administrador</strong> para solicitar acceso.
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <button
              onClick={onSignOut}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#F15A24] hover:bg-[#D94815] text-white text-sm font-bold shadow-md transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar sesión e intentar con otra cuenta</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFC] flex flex-col items-center justify-center p-4">
      {/* Brand Header */}
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF2ED] border border-[#FED7AA] text-xs font-bold text-[#F15A24]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Carestino</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1F2226] tracking-tight">
            Gestión de Prensa & Influencers
          </h1>
          <p className="text-xs sm:text-sm text-[#4A4F57] max-w-sm mx-auto">
            Plataforma corporativa de contratos, despacho logístico y seguimiento de métricas.
          </p>
        </div>

        {/* Main Auth Card */}
        <div className="bg-white rounded-3xl border border-[#E7E7EA] shadow-xl p-6 sm:p-8 space-y-6">
          <div className="space-y-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF2ED] text-[#F15A24] flex items-center justify-center mx-auto font-black text-xl">
              C
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1F2226]">
                Iniciar Sesión
              </h2>
              <p className="text-xs text-[#8A8F98] mt-1">
                Ingresa con tu cuenta de Google corporativa para acceder.
              </p>
            </div>
          </div>

          {/* Primary Google Login Button */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-white hover:bg-[#F4F4F6] text-[#1F2226] border-2 border-[#E7E7EA] hover:border-[#D1D5DB] rounded-2xl text-sm font-bold shadow-xs transition active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              {isSigningIn ? (
                <Loader2 className="w-5 h-5 animate-spin text-[#F15A24]" />
              ) : (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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

            {authError && (
              <div className="p-3.5 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] space-y-2 text-xs text-[#DC2626] animate-in fade-in">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-snug">{authError}</span>
                </div>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={onOpenConfig}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#FECACA] text-[#DC2626] hover:bg-[#FEF2F2] font-semibold text-[11px] shadow-2xs transition cursor-pointer"
                  >
                    <Key className="w-3 h-3" />
                    <span>Verificar credenciales de Supabase</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Security notice pills */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E7E7EA]">
            <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-[#FBFBFC] border border-[#E7E7EA] text-[11px] text-[#4A4F57]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
              <span>Google OAuth</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-[#FBFBFC] border border-[#E7E7EA] text-[11px] text-[#4A4F57]">
              <Lock className="w-3.5 h-3.5 text-[#F15A24] shrink-0" />
              <span>Acceso Exclusivo</span>
            </div>
          </div>

          {/* Subtle Supabase Config Link if needed */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={onOpenConfig}
              className="inline-flex items-center gap-1.5 text-[11px] text-[#8A8F98] hover:text-[#1F2226] transition font-medium"
            >
              <Key className="w-3 h-3" />
              <span>{hasConfig ? 'Supabase configurado' : 'Configurar conexión Supabase'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-[#8A8F98]">
          Carestino S.A. © {new Date().getFullYear()} — Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
