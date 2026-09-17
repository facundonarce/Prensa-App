import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ConfigModal } from './components/ConfigModal';
import { AdminUsuarios } from './components/AdminUsuarios';
import { AdminValidacion } from './components/AdminValidacion';
import { AcuerdosList } from './components/AcuerdosList';
import { FormularioAcuerdo } from './components/FormularioAcuerdo';
import { FormularioPedido } from './components/FormularioPedido';
import { PedidosList } from './components/PedidosList';
import { FormularioReporte } from './components/FormularioReporte';
import { ReportesList } from './components/ReportesList';
import { SetupInstructions } from './components/SetupInstructions';
import { AuthCard } from './components/AuthCard';
import {
  DataService,
  INITIAL_PAISES,
  INITIAL_PRODUCTOS,
  INITIAL_TIENDAS,
  INITIAL_MEDIOS,
  INITIAL_REDES,
  INITIAL_TIPOS_PUB,
  INITIAL_TIPOS_CONTRATO,
  INITIAL_ESCALONES,
  INITIAL_USUARIOS,
  INITIAL_ACUERDOS,
  INITIAL_PEDIDOS,
  INITIAL_REPORTES,
} from './lib/dataService';
import { getSupabase, getSavedConfig } from './lib/supabase';
import {
  Usuario,
  RolUsuario,
  Pais,
  Producto,
  Tienda,
  Medio,
  RedSocial,
  TipoPublicacion,
  TipoContrato,
  EscalonesSeguidores,
  Acuerdo,
  Pedido,
  Reporte,
} from './types';
import { ValidationListType } from './lib/excelService';
import {
  AlertTriangle,
  Lock,
  ShoppingBag,
  BarChart2,
  Calendar,
  CheckCircle2,
  Copy,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function App() {
  // Navigation
  const [activeModule, setActiveModule] = useState('acuerdos');
  const [isCreatingAcuerdo, setIsCreatingAcuerdo] = useState(false);
  const [isCreatingPedido, setIsCreatingPedido] = useState(false);
  const [isCreatingReporte, setIsCreatingReporte] = useState(false);

  // Config & Modal
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [hasConfig, setHasConfig] = useState(false);

  // Auth & Roles
  const [currentUser, setCurrentUser] = useState<Usuario | null>(INITIAL_USUARIOS[0]); // Default to admin_general
  const [isSimulated, setIsSimulated] = useState(true);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);

  // Data states
  const [usuarios, setUsuarios] = useState<Usuario[]>(INITIAL_USUARIOS);
  const [paises, setPaises] = useState<Pais[]>(INITIAL_PAISES);
  const [productos, setProductos] = useState<Producto[]>(INITIAL_PRODUCTOS);
  const [tiendas, setTiendas] = useState<Tienda[]>(INITIAL_TIENDAS);
  const [medios, setMedios] = useState<Medio[]>(INITIAL_MEDIOS);
  const [redes, setRedes] = useState<RedSocial[]>(INITIAL_REDES);
  const [tiposPub, setTiposPub] = useState<TipoPublicacion[]>(INITIAL_TIPOS_PUB);
  const [tiposContrato, setTiposContrato] = useState<TipoContrato[]>(INITIAL_TIPOS_CONTRATO);
  const [escalones, setEscalones] = useState<EscalonesSeguidores[]>(INITIAL_ESCALONES);
  const [acuerdos, setAcuerdos] = useState<Acuerdo[]>(INITIAL_ACUERDOS);
  const [pedidos, setPedidos] = useState<Pedido[]>(INITIAL_PEDIDOS);
  const [reportes, setReportes] = useState<Reporte[]>(INITIAL_REPORTES);

  // Sync timestamps
  const [lastSyncTime, setLastSyncTime] = useState(() =>
    new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  // Check Supabase config
  const refreshConfigStatus = useCallback(() => {
    const { url, anonKey } = getSavedConfig();
    setHasConfig(Boolean(url && anonKey));
  }, []);

  // Load all data
  const loadData = useCallback(async () => {
    try {
      const [p, pr, t, e, u, a, ped, rep] = await Promise.all([
        DataService.getPaises(),
        DataService.getProductos(),
        DataService.getTiendas(),
        DataService.getEscalones(),
        DataService.getUsuarios(),
        DataService.getAcuerdos(),
        DataService.getPedidos(),
        DataService.getReportes(),
      ]);
      setPaises(p);
      setProductos(pr);
      setTiendas(t);
      setEscalones(e);
      setUsuarios(u);
      setAcuerdos(a);
      setPedidos(ped);
      setReportes(rep);
      setLastSyncTime(
        new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    } catch (e) {
      console.warn('Error loading initial data', e);
    }
  }, []);

  useEffect(() => {
    refreshConfigStatus();
    loadData();
  }, [refreshConfigStatus, loadData]);

  // Handle Role Simulation
  const handleSimulateRole = (role: RolUsuario | 'sin_rol' | null) => {
    if (role === null) {
      setIsSimulated(false);
      return;
    }
    setIsSimulated(true);

    if (role === 'sin_rol') {
      setCurrentUser({
        id: 'user-sin-rol-guest',
        email: 'nuevo.postulante@carestino.com',
        nombre: 'Nuevo Postulante (Sin Asignar)',
        rol: null as any,
        activo: false,
      });
    } else {
      const match = usuarios.find((u) => u.rol === role);
      if (match) {
        setCurrentUser(match);
      } else {
        setCurrentUser({
          id: `sim-${role}`,
          email: `${role}@carestino.com`,
          nombre: role === 'admin_general' ? 'Joaquín Méndez (Admin General)' : role === 'admin_prensa' ? 'Lucía Fernández (Líder Prensa)' : 'Santiago Rossi (Analista)',
          rol: role,
          activo: true,
        });
      }
    }
  };

  // Handlers for saves
  const handleSaveUsuario = async (u: Usuario) => {
    const saved = await DataService.saveUsuario(u);
    setUsuarios((prev) => {
      const idx = prev.findIndex((item) => item.id === saved.id || item.email === saved.email);
      if (idx >= 0) {
        return prev.map((item, i) => (i === idx ? saved : item));
      }
      return [...prev, saved];
    });
  };

  const handleSavePais = async (pais: { id?: number; nombre: string }) => {
    const saved = await DataService.savePais(pais);
    setPaises((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id);
      if (idx >= 0) return prev.map((p) => (p.id === saved.id ? saved : p));
      return [...prev, saved];
    });
  };

  const handleSaveProducto = async (prod: Producto) => {
    const saved = await DataService.saveProducto(prod);
    setProductos((prev) => {
      const idx = prev.findIndex((p) => p.sku === saved.sku);
      if (idx >= 0) return prev.map((p) => (p.sku === saved.sku ? saved : p));
      return [...prev, saved];
    });
  };

  const handleSaveTienda = async (tienda: { id?: number; nombre: string }) => {
    const saved = await DataService.saveTienda(tienda);
    setTiendas((prev) => {
      const idx = prev.findIndex((t) => t.id === saved.id);
      if (idx >= 0) return prev.map((t) => (t.id === saved.id ? saved : t));
      return [...prev, saved];
    });
  };

  const handleSaveEscalon = async (item: EscalonesSeguidores) => {
    const saved = await DataService.saveEscalon(item);
    setEscalones((prev) => {
      const idx = prev.findIndex((e) => e.id === saved.id);
      if (idx >= 0) return prev.map((e) => (e.id === saved.id ? saved : e));
      return [...prev, saved];
    });
  };

  const handleBulkImport = async (type: ValidationListType, items: any[], mode: 'append' | 'replace') => {
    if (type === 'paises') {
      const updated = await DataService.savePaisesBulk(items, mode);
      setPaises(updated);
    } else if (type === 'productos') {
      const updated = await DataService.saveProductosBulk(items, mode);
      setProductos(updated);
    } else if (type === 'tiendas') {
      const updated = await DataService.saveTiendasBulk(items, mode);
      setTiendas(updated);
    } else if (type === 'escalones') {
      const updated = await DataService.saveEscalonesBulk(items, mode);
      setEscalones(updated);
    } else if (type === 'medios') {
      const updated = await DataService.saveMediosBulk(items, mode);
      setMedios(updated);
    } else if (type === 'redes') {
      const updated = await DataService.saveRedesBulk(items, mode);
      setRedes(updated);
    } else if (type === 'tipos_pub') {
      const updated = await DataService.saveTiposPubBulk(items, mode);
      setTiposPub(updated);
    } else if (type === 'tipos_contrato') {
      const updated = await DataService.saveTiposContratoBulk(items, mode);
      setTiposContrato(updated);
    }
  };

  const handleSaveAcuerdo = async (acuerdoData: Omit<Acuerdo, 'id' | 'created_at'>) => {
    const saved = await DataService.saveAcuerdo(acuerdoData);
    setAcuerdos((prev) => [saved, ...prev.filter((a) => a.id !== saved.id)]);
    setIsCreatingAcuerdo(false);
    return saved;
  };

  const handleSavePedido = async (pedidoData: Omit<Pedido, 'id' | 'created_at'>) => {
    await DataService.savePedido(pedidoData);
    const [updatedPedidos, updatedAcuerdos] = await Promise.all([
      DataService.getPedidos(),
      DataService.getAcuerdos(),
    ]);
    setPedidos(updatedPedidos);
    setAcuerdos(updatedAcuerdos);
    setIsCreatingPedido(false);
  };

  const handleDeletePedido = async (id: number) => {
    await DataService.deletePedido(id);
    const [updatedPedidos, updatedAcuerdos] = await Promise.all([
      DataService.getPedidos(),
      DataService.getAcuerdos(),
    ]);
    setPedidos(updatedPedidos);
    setAcuerdos(updatedAcuerdos);
  };

  const handleSaveReporte = async (reporteData: Omit<Reporte, 'id' | 'created_at'>) => {
    await DataService.saveReporte(reporteData);
    const updated = await DataService.getReportes();
    setReportes(updated);
    setIsCreatingReporte(false);
  };

  const handleDeleteReporte = async (id: number) => {
    await DataService.deleteReporte(id);
    const updated = await DataService.getReportes();
    setReportes(updated);
  };

  // URL Copy Helper for callback
  const [copiedUrl, setCopiedUrl] = useState(false);
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const copyCallbackUrl = () => {
    navigator.clipboard.writeText(currentOrigin);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Total dataset count
  const datasetCount = acuerdos.length + productos.length + usuarios.length;

  return (
    <div className="min-h-screen bg-[#FBFBFC] text-[#1F2226] font-sans flex antialiased">
      {/* 1. Sidebar (Fixed left w-64) */}
      <Sidebar
        currentUser={currentUser}
        activeModule={activeModule}
        onSelectModule={(mod) => {
          setActiveModule(mod);
          setIsCreatingAcuerdo(false);
          setIsCreatingPedido(false);
          setIsCreatingReporte(false);
        }}
        datasetCount={datasetCount}
        lastSyncTime={lastSyncTime}
        onRefreshData={loadData}
        onSimulateRole={handleSimulateRole}
        isSimulated={isSimulated}
      />

      {/* 2. Main Content Wrapper */}
      <div className="ml-64 flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          activeModule={activeModule}
          onOpenConfig={() => setIsConfigOpen(true)}
          onRefreshData={loadData}
          hasConfig={hasConfig}
          currentUser={currentUser}
        />

        {/* Body View */}
        <main className="flex-1 p-6 md:p-8 space-y-6">
          {/* User Blocked Notice if role is null */}
          {currentUser && currentUser.rol === null ? (
            <div className="bg-white rounded-2xl border border-[#FECACA] p-6 shadow-xs max-w-2xl mx-auto text-center space-y-4 my-8">
              <div className="w-12 h-12 rounded-full bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1F2226]">
                  Acceso Pendiente de Autorización (RLS)
                </h2>
                <p className="text-xs text-[#4A4F57] mt-1.5 leading-relaxed max-w-lg mx-auto">
                  Tu usuario (<code>{currentUser.email}</code>) se ha autenticado con éxito, pero aún no
                  posee un rol asignado en la tabla <code>usuarios</code> de la base de datos de Carestino.
                </p>
                <div className="mt-3 p-3 bg-[#F4F4F6] rounded-xl text-[11px] text-[#4A4F57] max-w-md mx-auto">
                  💡 <em>Regla de Negocio:</em> El <strong>admin_general</strong> debe darte de alta y
                  asignarte el rol de <code>analista</code> o <code>admin_prensa</code> para desbloquear la
                  plataforma.
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => handleSimulateRole('admin_general')}
                  className="px-4 py-2 bg-[#F15A24] hover:bg-[#D94815] text-white text-xs font-bold rounded-xl shadow-2xs transition"
                >
                  Simular como Admin General para Habilitar
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Module: Acuerdos */}
              {activeModule === 'acuerdos' && (
                <>
                  {isCreatingAcuerdo ? (
                    <FormularioAcuerdo
                      currentUser={currentUser!}
                      usuariosHabilitados={usuarios.filter((u) => u.activo !== false)}
                      paises={paises}
                      productos={productos}
                      tiendas={tiendas}
                      tiposContrato={tiposContrato}
                      escalones={escalones}
                      onSave={handleSaveAcuerdo}
                      onCancel={() => setIsCreatingAcuerdo(false)}
                    />
                  ) : (
                    <AcuerdosList
                      acuerdos={acuerdos}
                      paises={paises}
                      tiposContrato={tiposContrato}
                      usuarios={usuarios}
                      currentUser={currentUser}
                      onOpenNuevoAcuerdo={() => setIsCreatingAcuerdo(true)}
                      onCrearPedido={(acuerdoId) => {
                        setActiveModule('pedidos');
                        setIsCreatingPedido(true);
                      }}
                      onCrearReporte={(acuerdoId) => {
                        setActiveModule('reportes');
                        setIsCreatingReporte(true);
                      }}
                    />
                  )}
                </>
              )}

              {/* Module: Listas de Validación */}
              {activeModule === 'tablas' && (
                <AdminValidacion
                  currentUser={currentUser}
                  paises={paises}
                  productos={productos}
                  tiendas={tiendas}
                  medios={medios}
                  redes={redes}
                  tiposPub={tiposPub}
                  tiposContrato={tiposContrato}
                  escalones={escalones}
                  onSavePais={handleSavePais}
                  onSaveProducto={handleSaveProducto}
                  onSaveTienda={handleSaveTienda}
                  onSaveEscalon={handleSaveEscalon}
                  onBulkImport={handleBulkImport}
                />
              )}

              {/* Module: Usuarios & Permisos */}
              {activeModule === 'usuarios' && (
                <AdminUsuarios
                  usuarios={usuarios}
                  currentUser={currentUser}
                  onSaveUsuario={handleSaveUsuario}
                />
              )}

              {/* Module: Pedidos (Formulario 2) */}
              {activeModule === 'pedidos' && (
                isCreatingPedido ? (
                  <FormularioPedido
                    acuerdos={acuerdos}
                    productos={productos}
                    tiendas={tiendas}
                    usuarios={usuarios}
                    currentUser={currentUser!}
                    onSavePedido={handleSavePedido}
                    onCancel={() => setIsCreatingPedido(false)}
                  />
                ) : (
                  <PedidosList
                    pedidos={pedidos}
                    acuerdos={acuerdos}
                    productos={productos}
                    tiendas={tiendas}
                    usuarios={usuarios}
                    currentUser={currentUser!}
                    onNewPedido={() => setIsCreatingPedido(true)}
                    onDeletePedido={handleDeletePedido}
                  />
                )
              )}

              {/* Module: Reportes de Contenido (Formulario 3) */}
              {activeModule === 'reportes' && (
                isCreatingReporte ? (
                  <FormularioReporte
                    acuerdos={acuerdos}
                    medios={medios}
                    redes={redes}
                    tiposPub={tiposPub}
                    productos={productos}
                    usuarios={usuarios}
                    currentUser={currentUser!}
                    onSaveReporte={handleSaveReporte}
                    onCancel={() => setIsCreatingReporte(false)}
                  />
                ) : (
                  <ReportesList
                    reportes={reportes}
                    acuerdos={acuerdos}
                    medios={medios}
                    redes={redes}
                    tiposPub={tiposPub}
                    productos={productos}
                    usuarios={usuarios}
                    currentUser={currentUser!}
                    onNewReporte={() => setIsCreatingReporte(true)}
                    onDeleteReporte={handleDeleteReporte}
                  />
                )
              )}

              {/* Module: Metas & Presupuestos */}
              {activeModule === 'metas' && (
                <div className="bg-white rounded-2xl border border-[#E7E7EA] p-6 shadow-2xs space-y-4">
                  <h3 className="text-sm font-bold text-[#1F2226]">
                    Metas & Presupuesto por País (Carga Manual Mensual)
                  </h3>
                  <p className="text-xs text-[#4A4F57]">
                    Solo editable por <strong>admin_general</strong>. Permite establecer objetivos mensuales
                    de Público, Alcance e Interacciones por país, y contrastarlo con el gasto real de contratos.
                  </p>

                  <div className="overflow-x-auto pt-2">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#F4F4F6] text-[#8A8F98] text-[10px] uppercase font-bold border-y border-[#E7E7EA]">
                          <th className="py-2.5 px-4">País</th>
                          <th className="py-2.5 px-4">Mes</th>
                          <th className="py-2.5 px-4 text-right">Meta Público</th>
                          <th className="py-2.5 px-4 text-right">Meta Alcance</th>
                          <th className="py-2.5 px-4 text-right">Meta Interacciones</th>
                          <th className="py-2.5 px-4 text-right">Presupuesto USD</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E7E7EA]/50">
                        {paises.slice(0, 4).map((p) => (
                          <tr key={p.id} className="hover:bg-[#F4F4F6]">
                            <td className="py-3 px-4 font-semibold text-[#1F2226]">{p.nombre}</td>
                            <td className="py-3 px-4 font-mono text-[#4A4F57]">2026-03</td>
                            <td className="py-3 px-4 text-right font-mono tabular-nums">2.500.000</td>
                            <td className="py-3 px-4 text-right font-mono tabular-nums">800.000</td>
                            <td className="py-3 px-4 text-right font-mono tabular-nums">45.000</td>
                            <td className="py-3 px-4 text-right font-bold text-[#10B981] tabular-nums">
                              $15.000 USD
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Module: Setup / Infraestructura */}
              {activeModule === 'setup' && (
                <div className="space-y-6">
                  {/* Setup instructions */}
                  <SetupInstructions
                    onOpenConfig={() => setIsConfigOpen(true)}
                    hasConfig={hasConfig}
                  />

                  {/* Redirect URL Card */}
                  <div className="bg-white rounded-2xl border border-[#E7E7EA] shadow-2xs p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-[#1F2226] uppercase tracking-wider">
                          URL de Redirección para Supabase & Google Cloud
                        </h4>
                        <p className="text-xs text-[#4A4F57] mt-1">
                          Configurá esta URL en Supabase Auth &gt; URL Configuration &gt; Redirect URLs:
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-[#F4F4F6] text-[#1F2226] font-mono px-3 py-1.5 rounded-lg border border-[#E7E7EA] select-all">
                          {currentOrigin || 'https://ais-dev-...'}
                        </code>
                        <button
                          onClick={copyCallbackUrl}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1F2226] hover:bg-black text-white rounded-lg text-xs font-semibold shadow-2xs transition"
                        >
                          {copiedUrl ? <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedUrl ? 'Copiado' : 'Copiar'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Config Modal */}
      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onSaved={() => {
          refreshConfigStatus();
          loadData();
        }}
      />
    </div>
  );
}
