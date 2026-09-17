import { useState } from 'react';
import { Settings, CheckCircle2, AlertCircle, Eye, EyeOff, Save, ExternalLink, Activity, Loader2 } from 'lucide-react';
import { getSavedConfig, saveConfig } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function ConfigModal({ isOpen, onClose, onSaved }: ConfigModalProps) {
  const current = getSavedConfig();
  const [url, setUrl] = useState(current.url);
  const [anonKey, setAnonKey] = useState(current.anonKey);
  const [showKey, setShowKey] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [testStatus, setTestStatus] = useState<{
    state: 'idle' | 'testing' | 'success' | 'error';
    message?: string;
  }>({ state: 'idle' });

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    const cleanUrl = url.trim().replace(/\/+$/, '');
    const cleanKey = anonKey.trim();

    if (!cleanUrl) {
      setTestStatus({ state: 'error', message: 'Falta ingresar la Project URL de Supabase.' });
      return;
    }
    if (!cleanKey) {
      setTestStatus({ state: 'error', message: 'Falta ingresar la Anon Public Key de Supabase.' });
      return;
    }

    setTestStatus({ state: 'testing' });
    try {
      const tempClient = createClient(cleanUrl, cleanKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      // Try fetching session or health
      const { error } = await tempClient.from('usuarios').select('id', { head: true, count: 'exact' });

      if (error && error.message?.includes('No API key found in request')) {
        setTestStatus({
          state: 'error',
          message: 'Error: La Anon Key ingresada no es válida o está incompleta.',
        });
      } else if (error && error.code === 'PGRST301') {
        // JWT expired or invalid
        setTestStatus({
          state: 'error',
          message: 'Error de autenticación: Verifica que la Anon Public Key sea la correcta.',
        });
      } else {
        setTestStatus({
          state: 'success',
          message: '¡Conexión validada con éxito! La URL y la clave Anon son correctas.',
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al conectar con Supabase';
      setTestStatus({ state: 'error', message: msg });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = url.trim().replace(/\/+$/, '');
    const cleanKey = anonKey.trim();

    if (!cleanUrl || !cleanKey) {
      setTestStatus({
        state: 'error',
        message: 'Ambos campos (Project URL y Anon Public Key) son requeridos.',
      });
      return;
    }

    saveConfig(cleanUrl, cleanKey);
    setSavedMsg(true);
    setTimeout(() => {
      setSavedMsg(false);
      onSaved();
      onClose();
    }, 600);
  };

  const originUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 sm:p-7 animate-in fade-in zoom-in-95 duration-150 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-800">
            <div className="w-8 h-8 rounded-xl bg-[#FFF2ED] text-[#F15A24] flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Configuración de Supabase</h3>
              <p className="text-[11px] text-slate-500">Credenciales de API y Autenticación Google</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm font-semibold px-2 py-1 rounded-md transition"
          >
            Cerrar
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Ingresa los datos de tu proyecto de Supabase para habilitar la base de datos y el inicio de sesión con Google.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Project URL
            </label>
            <input
              type="text"
              placeholder="https://xxxxxxxxxxxxxxxxxxxx.supabase.co"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setTestStatus({ state: 'idle' });
              }}
              required
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F15A24] focus:border-transparent font-mono"
            />
            <p className="text-[10px] text-slate-400 mt-1">Ejemplo: https://abcdefghijklm.supabase.co</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Anon Public Key (API Key)
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKey}
                onChange={(e) => {
                  setAnonKey(e.target.value);
                  setTestStatus({ state: 'idle' });
                }}
                required
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 pr-10 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F15A24] focus:border-transparent font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Es el token largo que empieza con <code>eyJ...</code> en <strong>Project Settings → API</strong>.
            </p>
          </div>

          {/* Test Status Feedback */}
          {testStatus.state === 'testing' && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              <span>Probando comunicación con Supabase...</span>
            </div>
          )}

          {testStatus.state === 'success' && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{testStatus.message}</span>
            </div>
          )}

          {testStatus.state === 'error' && (
            <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{testStatus.message}</span>
            </div>
          )}

          {/* Tips and Redirect URL */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <ExternalLink className="w-3.5 h-3.5 text-[#F15A24]" />
              <span>Configuración en Supabase Dashboard:</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-600">
              <li>
                <strong>API Keys:</strong> En <em>Project Settings → API</em> copia la <strong>URL</strong> y la <strong>anon public key</strong>.
              </li>
              <li>
                <strong>Google Auth Redirect URL:</strong> En <em>Authentication → URL Configuration</em>, agrega esta URL a los <em>Redirect URLs</em> permitidos:
                <div className="mt-1 font-mono text-[10px] bg-white p-1.5 rounded border border-slate-200 select-all break-all text-slate-800">
                  {originUrl}
                </div>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testStatus.state === 'testing'}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Probar Conexión</span>
            </button>

            <div className="w-full sm:w-auto flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#F15A24] hover:bg-[#D94815] rounded-xl shadow-xs transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Credenciales</span>
              </button>
            </div>
          </div>

          {savedMsg && (
            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 p-3 rounded-xl text-xs font-bold border border-emerald-200 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Credenciales guardadas con éxito. Conexión actualizada.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
