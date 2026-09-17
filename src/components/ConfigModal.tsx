import { useState } from 'react';
import { Settings, CheckCircle2, AlertCircle, Eye, EyeOff, Save, ExternalLink } from 'lucide-react';
import { getSavedConfig, saveConfig } from '../lib/supabase';

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

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveConfig(url, anonKey);
    setSavedMsg(true);
    setTimeout(() => {
      setSavedMsg(false);
      onSaved();
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-800">
            <Settings className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-lg">Configuración de Supabase</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm font-medium px-2 py-1 rounded-md"
          >
            Cerrar
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Podés configurar la URL del proyecto y la Anon Public Key de Supabase para conectar la app directamente a tu base de datos y autenticación.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Project URL
            </label>
            <input
              type="text"
              placeholder="https://xxxxxxxx.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Anon Public Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                className="w-full text-sm px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 text-xs text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-slate-700">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>¿Dónde encontrar estos datos?</span>
            </div>
            <p>
              En tu dashboard de Supabase: <strong>Project Settings → API → Project URL y anon/public key</strong>.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition"
            >
              <Save className="w-4 h-4" />
              Guardar credenciales
            </button>
          </div>

          {savedMsg && (
            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 p-2.5 rounded-lg text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Credenciales guardadas correctamente.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
