import { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Mail,
  UserCheck,
  Edit2,
  Save,
  X,
} from 'lucide-react';
import { Usuario, RolUsuario } from '../types';

interface AdminUsuariosProps {
  usuarios: Usuario[];
  currentUser: Usuario | null;
  onSaveUsuario: (usuario: Usuario) => Promise<void>;
}

export function AdminUsuarios({ usuarios, currentUser, onSaveUsuario }: AdminUsuariosProps) {
  const isAdminGeneral = currentUser?.rol === 'admin_general';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);

  // Form state
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState<RolUsuario>('analista');
  const [activo, setActivo] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setEmail('');
    setNombre('');
    setRol('analista');
    setActivo(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: Usuario) => {
    setEditingUser(user);
    setEmail(user.email);
    setNombre(user.nombre || '');
    setRol(user.rol || 'analista');
    setActivo(user.activo ?? true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsSaving(true);
      const userToSave: Usuario = {
        id: editingUser ? editingUser.id : crypto.randomUUID(),
        email: email.trim().toLowerCase(),
        nombre: nombre.trim() || null,
        rol,
        activo,
        created_at: editingUser?.created_at || new Date().toISOString(),
      };
      await onSaveUsuario(userToSave);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const getRolBadge = (r: RolUsuario | null) => {
    if (!r) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-[#F4F4F6] text-[#8A8F98] border border-[#E7E7EA]">
          Sin Rol (Bloqueado)
        </span>
      );
    }
    switch (r) {
      case 'admin_general':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-[#FEF2F2] text-[#EF4444] border border-[#FECACA]">
            Admin General
          </span>
        );
      case 'admin_prensa':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-[#FFFBEB] text-[#F59E0B] border border-[#FDE68A]">
            Admin Prensa
          </span>
        );
      case 'analista':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-[#EFF6FF] text-[#3B82F6] border border-[#BFDBFE]">
            Analista
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Notice bar */}
      <div className="bg-white rounded-2xl border border-[#E7E7EA] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-[#FFF2ED] rounded-xl text-[#F15A24] shrink-0 mt-0.5">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#1F2226]">
              Políticas de Acceso y RLS (Row Level Security)
            </h2>
            <p className="text-xs text-[#4A4F57] mt-0.5 max-w-2xl leading-relaxed">
              Al loguearse por primera vez con Google, el usuario queda sin acceso hasta que un{' '}
              <strong className="text-[#1F2226]">admin_general</strong> lo dé de alta en la tabla{' '}
              <code className="bg-[#F4F4F6] px-1.5 py-0.5 rounded text-[#1F2226]">usuarios</code> con un rol asignado.
            </p>
          </div>
        </div>

        {isAdminGeneral ? (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#F15A24] hover:bg-[#D94815] text-white text-xs font-bold rounded-xl shadow-2xs transition shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Dar de Alta Usuario</span>
          </button>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F4F4F6] text-[#8A8F98] text-xs font-semibold rounded-xl border border-[#E7E7EA]">
            <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Solo lectura (Requiere Admin General)</span>
          </div>
        )}
      </div>

      {/* Users Table Card */}
      <div className="bg-white rounded-2xl border border-[#E7E7EA] shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-[#E7E7EA] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#F15A24]" />
            <h3 className="text-xs font-bold text-[#1F2226] uppercase tracking-wider">
              Usuarios Registrados ({usuarios.length})
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F4F6] text-[#8A8F98] text-[10px] uppercase font-bold border-y border-[#E7E7EA]">
                <th className="py-2.5 px-4 sticky left-0 z-10 bg-[#F4F4F6]">Nombre / Usuario</th>
                <th className="py-2.5 px-4">Email Google</th>
                <th className="py-2.5 px-4">Rol Asignado</th>
                <th className="py-2.5 px-4 text-center">Estado</th>
                {isAdminGeneral && <th className="py-2.5 px-4 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E7EA]/50 text-xs">
              {usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-[#F4F4F6] transition-colors">
                  <td className="py-3 px-4 font-semibold text-[#1F2226] sticky left-0 z-10 bg-white">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#FFF2ED] text-[#F15A24] font-bold flex items-center justify-center text-xs shrink-0 border border-[#FED7AA]">
                        {u.nombre ? u.nombre[0].toUpperCase() : u.email[0].toUpperCase()}
                      </div>
                      <div>
                        <div>{u.nombre || 'Sin nombre registrado'}</div>
                        <div className="text-[10px] text-[#8A8F98] font-mono">{u.id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#4A4F57] font-mono text-[11px]">{u.email}</td>
                  <td className="py-3 px-4">{getRolBadge(u.rol)}</td>
                  <td className="py-3 px-4 text-center">
                    {u.activo !== false ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-[#10B981] bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#A7F3D0]">
                        <CheckCircle2 className="w-3 h-3" /> Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-[#EF4444] bg-[#FEF2F2] px-2 py-0.5 rounded border border-[#FECACA]">
                        <XCircle className="w-3 h-3" /> Inactivo
                      </span>
                    )}
                  </td>
                  {isAdminGeneral && (
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#4A4F57] hover:text-[#1F2226] hover:bg-[#F4F4F6] border border-[#E7E7EA] rounded-lg transition"
                      >
                        <Edit2 className="w-3 h-3 text-[#F15A24]" />
                        <span>Editar</span>
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Alta/Edición */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-[#E7E7EA] shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-[#E7E7EA]">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#F15A24]" />
                <h3 className="font-bold text-base text-[#1F2226]">
                  {editingUser ? 'Editar Rol de Usuario' : 'Dar de Alta Usuario'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#8A8F98] hover:text-[#1F2226] p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#4A4F57] tracking-wider mb-1">
                  Email de Google
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8A8F98] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="usuario@carestino.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2 border border-[#E7E7EA] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F15A24] focus:border-transparent font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#4A4F57] tracking-wider mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  placeholder="Ej: Lucía Fernández"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-[#E7E7EA] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F15A24] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#4A4F57] tracking-wider mb-1">
                  Rol del Sistema (tabla usuarios.rol)
                </label>
                <select
                  value={rol}
                  onChange={(e) => setRol(e.target.value as RolUsuario)}
                  className="w-full text-xs px-3 py-2 border border-[#E7E7EA] rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
                >
                  <option value="analista">analista — Solo sus acuerdos, pedidos y reportes</option>
                  <option value="admin_prensa">admin_prensa — Ve y edita todo el equipo, listas y metas</option>
                  <option value="admin_general">admin_general — Acceso total, gestión usuarios, elimina registros</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activo_chk"
                  checked={activo}
                  onChange={(e) => setActivo(e.target.checked)}
                  className="rounded text-[#F15A24] focus:ring-[#F15A24] border-[#E7E7EA]"
                />
                <label htmlFor="activo_chk" className="text-xs font-medium text-[#1F2226]">
                  Usuario activo (habilitado para operar)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E7E7EA]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#4A4F57] hover:bg-[#F4F4F6] rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#F15A24] hover:bg-[#D94815] rounded-xl shadow-2xs transition disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSaving ? 'Guardando...' : 'Guardar Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
