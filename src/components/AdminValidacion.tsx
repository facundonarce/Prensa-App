import { useState, useMemo } from 'react';
import {
  Database,
  Plus,
  Edit2,
  Trash2,
  Calculator,
  Search,
  CheckCircle2,
  Save,
  X,
  Sparkles,
  FileSpreadsheet,
  Download,
  Upload,
  ArrowDownToLine,
  Layers,
  ChevronDown,
} from 'lucide-react';
import {
  Pais,
  Producto,
  Tienda,
  Medio,
  RedSocial,
  TipoPublicacion,
  TipoContrato,
  EscalonesSeguidores,
  Usuario,
} from '../types';
import { calcularMesesTeoricos, DataService } from '../lib/dataService';
import {
  ValidationListType,
  downloadTemplate,
  exportCurrentData,
} from '../lib/excelService';
import { ImportExportModal } from './ImportExportModal';

interface AdminValidacionProps {
  currentUser: Usuario | null;
  paises: Pais[];
  productos: Producto[];
  tiendas: Tienda[];
  medios: Medio[];
  redes: RedSocial[];
  tiposPub: TipoPublicacion[];
  tiposContrato: TipoContrato[];
  escalones: EscalonesSeguidores[];
  onSavePais: (pais: { id?: number; nombre: string }) => Promise<void>;
  onSaveProducto: (prod: Producto) => Promise<void>;
  onSaveTienda: (tienda: { id?: number; nombre: string }) => Promise<void>;
  onSaveEscalon: (escalon: EscalonesSeguidores) => Promise<void>;
  onBulkImport?: (
    type: ValidationListType,
    items: any[],
    mode: 'append' | 'replace'
  ) => Promise<void>;
}

export function AdminValidacion({
  currentUser,
  paises,
  productos,
  tiendas,
  medios,
  redes,
  tiposPub,
  tiposContrato,
  escalones,
  onSavePais,
  onSaveProducto,
  onSaveTienda,
  onSaveEscalon,
  onBulkImport,
}: AdminValidacionProps) {
  const canEdit = currentUser?.rol === 'admin_general' || currentUser?.rol === 'admin_prensa';
  const isAdminGeneral = currentUser?.rol === 'admin_general';

  const [activeSubTab, setActiveSubTab] = useState<
    'escalones' | 'paises' | 'productos' | 'tiendas' | 'medios' | 'tipos'
  >('escalones');

  const [searchTerm, setSearchTerm] = useState('');

  // Simulator for escalones
  const [testSeguidores, setTestSeguidores] = useState(450000);
  const [testMontoUsd, setTestMontoUsd] = useState(2000);
  const testCalc = calcularMesesTeoricos(testSeguidores, testMontoUsd, escalones);

  // Manual Add Modal states
  const [modalType, setModalType] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  // Import / Export Modal state
  const [activeImportType, setActiveImportType] = useState<ValidationListType | null>(null);

  const handleOpenAdd = (type: string) => {
    setModalType(type);
    setFormData({});
  };

  const handleOpenImportModal = (type: ValidationListType) => {
    setActiveImportType(type);
  };

  const handleCloseImportModal = () => {
    setActiveImportType(null);
  };

  const handleExecuteBulkImport = async (items: any[], mode: 'append' | 'replace') => {
    if (!activeImportType) return;
    if (onBulkImport) {
      await onBulkImport(activeImportType, items, mode);
    } else {
      // Direct DataService fallback
      if (activeImportType === 'paises') await DataService.savePaisesBulk(items, mode);
      else if (activeImportType === 'productos') await DataService.saveProductosBulk(items, mode);
      else if (activeImportType === 'tiendas') await DataService.saveTiendasBulk(items, mode);
      else if (activeImportType === 'escalones') await DataService.saveEscalonesBulk(items, mode);
      else if (activeImportType === 'medios') await DataService.saveMediosBulk(items, mode);
      else if (activeImportType === 'redes') await DataService.saveRedesBulk(items, mode);
      else if (activeImportType === 'tipos_pub') await DataService.saveTiposPubBulk(items, mode);
      else if (activeImportType === 'tipos_contrato') await DataService.saveTiposContratoBulk(items, mode);
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalType === 'pais') {
        await onSavePais({ id: formData.id, nombre: formData.nombre });
      } else if (modalType === 'producto') {
        await onSaveProducto({
          sku: formData.sku,
          nombre: formData.nombre,
          categoria: formData.categoria || 'Accesorios',
        });
      } else if (modalType === 'tienda') {
        await onSaveTienda({ id: formData.id, nombre: formData.nombre });
      } else if (modalType === 'escalon') {
        await onSaveEscalon({
          id: formData.id || 0,
          seguidores_hasta: Number(formData.seguidores_hasta),
          usd_mes: Number(formData.usd_mes),
          comentario: formData.comentario || '',
        });
      } else if (modalType === 'medio') {
        const updated = await DataService.saveMediosBulk([{ id: formData.id || 0, nombre: formData.nombre }], 'append');
        if (onBulkImport) await onBulkImport('medios', updated, 'replace');
      } else if (modalType === 'red') {
        const updated = await DataService.saveRedesBulk([{ id: formData.id || 0, nombre: formData.nombre }], 'append');
        if (onBulkImport) await onBulkImport('redes', updated, 'replace');
      } else if (modalType === 'tipo_pub') {
        const updated = await DataService.saveTiposPubBulk([{ id: formData.id || 0, nombre: formData.nombre }], 'append');
        if (onBulkImport) await onBulkImport('tipos_pub', updated, 'replace');
      } else if (modalType === 'tipo_contrato') {
        const updated = await DataService.saveTiposContratoBulk([{ id: formData.id || 0, nombre: formData.nombre }], 'append');
        if (onBulkImport) await onBulkImport('tipos_contrato', updated, 'replace');
      }
      setModalType(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered lists
  const filteredEscalones = useMemo(() => {
    if (!searchTerm) return escalones;
    const term = searchTerm.toLowerCase();
    return escalones.filter(
      (e) =>
        e.comentario?.toLowerCase().includes(term) ||
        String(e.seguidores_hasta).includes(term) ||
        String(e.usd_mes).includes(term)
    );
  }, [escalones, searchTerm]);

  const filteredPaises = useMemo(() => {
    if (!searchTerm) return paises;
    const term = searchTerm.toLowerCase();
    return paises.filter((p) => p.nombre.toLowerCase().includes(term));
  }, [paises, searchTerm]);

  const filteredProductos = useMemo(() => {
    if (!searchTerm) return productos;
    const term = searchTerm.toLowerCase();
    return productos.filter(
      (p) =>
        p.sku.toLowerCase().includes(term) ||
        p.nombre.toLowerCase().includes(term) ||
        p.categoria?.toLowerCase().includes(term)
    );
  }, [productos, searchTerm]);

  const filteredTiendas = useMemo(() => {
    if (!searchTerm) return tiendas;
    const term = searchTerm.toLowerCase();
    return tiendas.filter((t) => t.nombre.toLowerCase().includes(term));
  }, [tiendas, searchTerm]);

  // Current data for active import modal
  const currentModalData = useMemo(() => {
    if (!activeImportType) return [];
    if (activeImportType === 'escalones') return escalones;
    if (activeImportType === 'paises') return paises;
    if (activeImportType === 'productos') return productos;
    if (activeImportType === 'tiendas') return tiendas;
    if (activeImportType === 'medios') return medios;
    if (activeImportType === 'redes') return redes;
    if (activeImportType === 'tipos_pub') return tiposPub;
    if (activeImportType === 'tipos_contrato') return tiposContrato;
    return [];
  }, [activeImportType, escalones, paises, productos, tiendas, medios, redes, tiposPub, tiposContrato]);

  return (
    <div className="space-y-6">
      {/* Sub-navigation tabs */}
      <div className="bg-white rounded-2xl border border-[#E7E7EA] p-1.5 flex flex-wrap items-center gap-1">
        <button
          onClick={() => {
            setActiveSubTab('escalones');
            setSearchTerm('');
          }}
          className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
            activeSubTab === 'escalones'
              ? 'bg-[#FFF2ED] text-[#F15A24] font-bold shadow-2xs'
              : 'text-[#4A4F57] hover:bg-[#F4F4F6] hover:text-[#1F2226]'
          }`}
        >
          Escalones Seguidores ({escalones.length})
        </button>
        <button
          onClick={() => {
            setActiveSubTab('paises');
            setSearchTerm('');
          }}
          className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
            activeSubTab === 'paises'
              ? 'bg-[#FFF2ED] text-[#F15A24] font-bold shadow-2xs'
              : 'text-[#4A4F57] hover:bg-[#F4F4F6] hover:text-[#1F2226]'
          }`}
        >
          Países ({paises.length})
        </button>
        <button
          onClick={() => {
            setActiveSubTab('productos');
            setSearchTerm('');
          }}
          className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
            activeSubTab === 'productos'
              ? 'bg-[#FFF2ED] text-[#F15A24] font-bold shadow-2xs'
              : 'text-[#4A4F57] hover:bg-[#F4F4F6] hover:text-[#1F2226]'
          }`}
        >
          Productos SKU ({productos.length})
        </button>
        <button
          onClick={() => {
            setActiveSubTab('tiendas');
            setSearchTerm('');
          }}
          className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
            activeSubTab === 'tiendas'
              ? 'bg-[#FFF2ED] text-[#F15A24] font-bold shadow-2xs'
              : 'text-[#4A4F57] hover:bg-[#F4F4F6] hover:text-[#1F2226]'
          }`}
        >
          Tiendas ({tiendas.length})
        </button>
        <button
          onClick={() => {
            setActiveSubTab('medios');
            setSearchTerm('');
          }}
          className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
            activeSubTab === 'medios'
              ? 'bg-[#FFF2ED] text-[#F15A24] font-bold shadow-2xs'
              : 'text-[#4A4F57] hover:bg-[#F4F4F6] hover:text-[#1F2226]'
          }`}
        >
          Medios & Redes
        </button>
        <button
          onClick={() => {
            setActiveSubTab('tipos');
            setSearchTerm('');
          }}
          className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
            activeSubTab === 'tipos'
              ? 'bg-[#FFF2ED] text-[#F15A24] font-bold shadow-2xs'
              : 'text-[#4A4F57] hover:bg-[#F4F4F6] hover:text-[#1F2226]'
          }`}
        >
          Tipos de Contrato ({tiposContrato.length})
        </button>
      </div>

      {/* Tab: Escalones Seguidores */}
      {activeSubTab === 'escalones' && (
        <div className="space-y-6">
          {/* Interactive Calculator Box */}
          <div className="bg-white rounded-2xl border border-[#E7E7EA] p-5 shadow-2xs">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="w-5 h-5 text-[#F15A24]" />
              <h3 className="text-sm font-bold text-[#1F2226]">
                Simulador del Trigger: Cálculo Automático de Meses Teóricos
              </h3>
            </div>
            <p className="text-xs text-[#4A4F57] mb-4">
              Fórmula SQL:{' '}
              <code className="bg-[#F4F4F6] px-1.5 py-0.5 rounded text-[#1F2226] font-mono">
                meses_teoricos = ceil(monto_usd / usd_mes)
              </code>{' '}
              según el escalón correspondiente.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#FBFBFC] p-4 rounded-xl border border-[#E7E7EA]">
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#4A4F57] tracking-wider mb-1">
                  Cantidad de Seguidores
                </label>
                <input
                  type="number"
                  value={testSeguidores}
                  onChange={(e) => setTestSeguidores(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 bg-white border border-[#E7E7EA] rounded-xl font-mono tabular-nums"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#4A4F57] tracking-wider mb-1">
                  Monto Contrato (USD)
                </label>
                <input
                  type="number"
                  value={testMontoUsd}
                  onChange={(e) => setTestMontoUsd(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 bg-white border border-[#E7E7EA] rounded-xl font-mono tabular-nums"
                />
              </div>

              <div className="flex flex-col justify-center">
                <div className="text-[10px] uppercase font-bold text-[#8A8F98]">
                  Resultado Calculado
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-[#F15A24] tabular-nums">
                    {testCalc.meses}
                  </span>
                  <span className="text-xs font-semibold text-[#1F2226]">meses teóricos</span>
                </div>
                <div className="text-[11px] text-[#4A4F57] mt-0.5">
                  Escalón: {testCalc.escalon?.comentario || 'N/A'} (
                  <span className="tabular-nums font-semibold">${testCalc.usdMes} USD/mes</span>)
                </div>
              </div>
            </div>
          </div>

          {/* Table of Escalones */}
          <div className="bg-white rounded-2xl border border-[#E7E7EA] shadow-2xs overflow-hidden">
            {/* Action Bar */}
            <div className="p-4 border-b border-[#E7E7EA] flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-[#1F2226] uppercase tracking-wider">
                  Tabla `escalones_seguidores` ({escalones.length})
                </div>
                <p className="text-[11px] text-[#8A8F98]">
                  Define el fee mensual en USD según la escala de audiencia
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Descargar Modelo */}
                <div className="inline-flex rounded-xl shadow-2xs">
                  <button
                    onClick={() => downloadTemplate('escalones', 'xlsx')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F4F4F6] hover:bg-[#E7E7EA] text-[#1F2226] text-xs font-bold rounded-l-xl border border-[#E7E7EA] transition"
                    title="Descargar archivo modelo Excel (.xlsx)"
                  >
                    <ArrowDownToLine className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Descargar Modelo (.xlsx)</span>
                  </button>
                  <button
                    onClick={() => downloadTemplate('escalones', 'csv')}
                    className="px-2 py-1.5 bg-[#F4F4F6] hover:bg-[#E7E7EA] text-[#8A8F98] hover:text-[#1F2226] text-xs font-semibold rounded-r-xl border-y border-r border-[#E7E7EA] transition"
                    title="Descargar archivo modelo en formato CSV"
                  >
                    CSV
                  </button>
                </div>

                {/* Importar Excel / CSV */}
                {canEdit && (
                  <button
                    onClick={() => handleOpenImportModal('escalones')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF2ED] hover:bg-[#FED7AA] text-[#F15A24] text-xs font-bold rounded-xl border border-[#FED7AA] shadow-2xs transition"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Importar Excel / CSV</span>
                  </button>
                )}

                {/* Exportar datos actuales */}
                <button
                  onClick={() => exportCurrentData('escalones', escalones, 'xlsx')}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#8A8F98] hover:text-[#1F2226] hover:bg-[#F4F4F6] rounded-xl transition"
                  title="Exportar escalones actuales a Excel"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Exportar</span>
                </button>

                {/* Manual Add */}
                {isAdminGeneral && (
                  <button
                    onClick={() => handleOpenAdd('escalon')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F15A24] hover:bg-[#D94815] text-white text-xs font-bold rounded-xl shadow-2xs transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nuevo Escalón</span>
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F4F4F6] text-[#8A8F98] text-[10px] uppercase font-bold border-y border-[#E7E7EA]">
                    <th className="py-2.5 px-4">ID</th>
                    <th className="py-2.5 px-4 text-right">Hasta Seguidores</th>
                    <th className="py-2.5 px-4 text-right">USD / Mes</th>
                    <th className="py-2.5 px-4">Descripción / Comentario</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E7EA]/50 text-xs">
                  {escalones.map((e) => (
                    <tr key={e.id} className="hover:bg-[#F4F4F6] transition-colors">
                      <td className="py-2.5 px-4 text-[#8A8F98] font-mono">{e.id}</td>
                      <td className="py-2.5 px-4 text-right font-semibold text-[#1F2226] tabular-nums">
                        {e.seguidores_hasta.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-[#F15A24] tabular-nums">
                        ${e.usd_mes} USD
                      </td>
                      <td className="py-2.5 px-4 text-[#4A4F57]">{e.comentario || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Países */}
      {activeSubTab === 'paises' && (
        <div className="bg-white rounded-2xl border border-[#E7E7EA] shadow-2xs overflow-hidden">
          {/* Action Bar */}
          <div className="p-4 border-b border-[#E7E7EA] flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-[#1F2226] uppercase tracking-wider">
                Países Habilitados ({paises.length})
              </div>
              <p className="text-[11px] text-[#8A8F98]">
                Tabla `paises` — Mercado objetivo y distribución de impacto
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Descargar Modelo */}
              <div className="inline-flex rounded-xl shadow-2xs">
                <button
                  onClick={() => downloadTemplate('paises', 'xlsx')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F4F4F6] hover:bg-[#E7E7EA] text-[#1F2226] text-xs font-bold rounded-l-xl border border-[#E7E7EA] transition"
                  title="Descargar plantilla Excel para Países"
                >
                  <ArrowDownToLine className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Descargar Modelo (.xlsx)</span>
                </button>
                <button
                  onClick={() => downloadTemplate('paises', 'csv')}
                  className="px-2 py-1.5 bg-[#F4F4F6] hover:bg-[#E7E7EA] text-[#8A8F98] hover:text-[#1F2226] text-xs font-semibold rounded-r-xl border-y border-r border-[#E7E7EA] transition"
                  title="Descargar plantilla en CSV"
                >
                  CSV
                </button>
              </div>

              {/* Importar Excel / CSV */}
              {canEdit && (
                <button
                  onClick={() => handleOpenImportModal('paises')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF2ED] hover:bg-[#FED7AA] text-[#F15A24] text-xs font-bold rounded-xl border border-[#FED7AA] shadow-2xs transition"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Importar Excel / CSV</span>
                </button>
              )}

              {/* Exportar */}
              <button
                onClick={() => exportCurrentData('paises', paises, 'xlsx')}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#8A8F98] hover:text-[#1F2226] hover:bg-[#F4F4F6] rounded-xl transition"
                title="Exportar países actuales"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exportar</span>
              </button>

              {/* Manual Add */}
              {canEdit && (
                <button
                  onClick={() => handleOpenAdd('pais')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F15A24] hover:bg-[#D94815] text-white text-xs font-bold rounded-xl shadow-2xs transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar País</span>
                </button>
              )}
            </div>
          </div>

          {/* Search bar */}
          <div className="p-3 bg-[#FBFBFC] border-b border-[#E7E7EA] flex items-center gap-2">
            <Search className="w-4 h-4 text-[#8A8F98]" />
            <input
              type="text"
              placeholder="Buscar país..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-xs text-[#1F2226] placeholder-[#8A8F98] focus:outline-hidden w-full"
            />
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F4F6] text-[#8A8F98] text-[10px] uppercase font-bold border-y border-[#E7E7EA]">
                <th className="py-2.5 px-4">ID</th>
                <th className="py-2.5 px-4">Nombre del País</th>
                <th className="py-2.5 px-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E7EA]/50 text-xs">
              {filteredPaises.map((p) => (
                <tr key={p.id} className="hover:bg-[#F4F4F6] transition-colors">
                  <td className="py-2.5 px-4 text-[#8A8F98] font-mono">{p.id}</td>
                  <td className="py-2.5 px-4 font-semibold text-[#1F2226]">{p.nombre}</td>
                  <td className="py-2.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#10B981] bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#A7F3D0]">
                      <CheckCircle2 className="w-3 h-3" /> Habilitado
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Productos SKU */}
      {activeSubTab === 'productos' && (
        <div className="bg-white rounded-2xl border border-[#E7E7EA] shadow-2xs overflow-hidden">
          {/* Action Bar */}
          <div className="p-4 border-b border-[#E7E7EA] flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-[#1F2226] uppercase tracking-wider">
                Catálogo de Productos Carestino ({productos.length})
              </div>
              <p className="text-[11px] text-[#8A8F98]">
                Tabla `productos` — SKUs oficiales para despachos y acuerdos de influencers
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Descargar Modelo */}
              <div className="inline-flex rounded-xl shadow-2xs">
                <button
                  onClick={() => downloadTemplate('productos', 'xlsx')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F4F4F6] hover:bg-[#E7E7EA] text-[#1F2226] text-xs font-bold rounded-l-xl border border-[#E7E7EA] transition"
                  title="Descargar plantilla Excel para Productos"
                >
                  <ArrowDownToLine className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Descargar Modelo (.xlsx)</span>
                </button>
                <button
                  onClick={() => downloadTemplate('productos', 'csv')}
                  className="px-2 py-1.5 bg-[#F4F4F6] hover:bg-[#E7E7EA] text-[#8A8F98] hover:text-[#1F2226] text-xs font-semibold rounded-r-xl border-y border-r border-[#E7E7EA] transition"
                  title="Descargar plantilla en CSV"
                >
                  CSV
                </button>
              </div>

              {/* Importar Excel / CSV */}
              {canEdit && (
                <button
                  onClick={() => handleOpenImportModal('productos')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF2ED] hover:bg-[#FED7AA] text-[#F15A24] text-xs font-bold rounded-xl border border-[#FED7AA] shadow-2xs transition"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Importar Excel / CSV</span>
                </button>
              )}

              {/* Exportar */}
              <button
                onClick={() => exportCurrentData('productos', productos, 'xlsx')}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#8A8F98] hover:text-[#1F2226] hover:bg-[#F4F4F6] rounded-xl transition"
                title="Exportar catálogo completo a Excel"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exportar</span>
              </button>

              {/* Manual Add */}
              {canEdit && (
                <button
                  onClick={() => handleOpenAdd('producto')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F15A24] hover:bg-[#D94815] text-white text-xs font-bold rounded-xl shadow-2xs transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nuevo Producto</span>
                </button>
              )}
            </div>
          </div>

          {/* Search bar */}
          <div className="p-3 bg-[#FBFBFC] border-b border-[#E7E7EA] flex items-center gap-2">
            <Search className="w-4 h-4 text-[#8A8F98]" />
            <input
              type="text"
              placeholder="Buscar por SKU, nombre o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-xs text-[#1F2226] placeholder-[#8A8F98] focus:outline-hidden w-full"
            />
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F4F6] text-[#8A8F98] text-[10px] uppercase font-bold border-y border-[#E7E7EA]">
                <th className="py-2.5 px-4">SKU</th>
                <th className="py-2.5 px-4">Nombre del Producto</th>
                <th className="py-2.5 px-4">Categoría</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E7EA]/50 text-xs">
              {filteredProductos.map((pr) => (
                <tr key={pr.sku} className="hover:bg-[#F4F4F6] transition-colors">
                  <td className="py-2.5 px-4 font-mono font-bold text-[#1F2226]">{pr.sku}</td>
                  <td className="py-2.5 px-4 text-[#1F2226] font-medium">{pr.nombre}</td>
                  <td className="py-2.5 px-4">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#F4F4F6] text-[#4A4F57] border border-[#E7E7EA]">
                      {pr.categoria}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Tiendas */}
      {activeSubTab === 'tiendas' && (
        <div className="bg-white rounded-2xl border border-[#E7E7EA] shadow-2xs overflow-hidden">
          {/* Action Bar */}
          <div className="p-4 border-b border-[#E7E7EA] flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-[#1F2226] uppercase tracking-wider">
                Tiendas para Retiro ({tiendas.length})
              </div>
              <p className="text-[11px] text-[#8A8F98]">
                Tabla `tiendas` — Sucursales Carestino habilitadas para retiro de productos
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Descargar Modelo */}
              <div className="inline-flex rounded-xl shadow-2xs">
                <button
                  onClick={() => downloadTemplate('tiendas', 'xlsx')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F4F4F6] hover:bg-[#E7E7EA] text-[#1F2226] text-xs font-bold rounded-l-xl border border-[#E7E7EA] transition"
                  title="Descargar plantilla Excel para Tiendas"
                >
                  <ArrowDownToLine className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Descargar Modelo (.xlsx)</span>
                </button>
                <button
                  onClick={() => downloadTemplate('tiendas', 'csv')}
                  className="px-2 py-1.5 bg-[#F4F4F6] hover:bg-[#E7E7EA] text-[#8A8F98] hover:text-[#1F2226] text-xs font-semibold rounded-r-xl border-y border-r border-[#E7E7EA] transition"
                  title="Descargar plantilla en CSV"
                >
                  CSV
                </button>
              </div>

              {/* Importar Excel / CSV */}
              {canEdit && (
                <button
                  onClick={() => handleOpenImportModal('tiendas')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF2ED] hover:bg-[#FED7AA] text-[#F15A24] text-xs font-bold rounded-xl border border-[#FED7AA] shadow-2xs transition"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Importar Excel / CSV</span>
                </button>
              )}

              {/* Exportar */}
              <button
                onClick={() => exportCurrentData('tiendas', tiendas, 'xlsx')}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#8A8F98] hover:text-[#1F2226] hover:bg-[#F4F4F6] rounded-xl transition"
                title="Exportar tiendas a Excel"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exportar</span>
              </button>

              {/* Manual Add */}
              {canEdit && (
                <button
                  onClick={() => handleOpenAdd('tienda')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F15A24] hover:bg-[#D94815] text-white text-xs font-bold rounded-xl shadow-2xs transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Tienda</span>
                </button>
              )}
            </div>
          </div>

          {/* Search bar */}
          <div className="p-3 bg-[#FBFBFC] border-b border-[#E7E7EA] flex items-center gap-2">
            <Search className="w-4 h-4 text-[#8A8F98]" />
            <input
              type="text"
              placeholder="Buscar tienda o sucursal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-xs text-[#1F2226] placeholder-[#8A8F98] focus:outline-hidden w-full"
            />
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F4F6] text-[#8A8F98] text-[10px] uppercase font-bold border-y border-[#E7E7EA]">
                <th className="py-2.5 px-4">ID</th>
                <th className="py-2.5 px-4">Nombre de la Tienda</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E7EA]/50 text-xs">
              {filteredTiendas.map((t) => (
                <tr key={t.id} className="hover:bg-[#F4F4F6] transition-colors">
                  <td className="py-2.5 px-4 text-[#8A8F98] font-mono">{t.id}</td>
                  <td className="py-2.5 px-4 font-semibold text-[#1F2226]">{t.nombre}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Medios y Redes */}
      {activeSubTab === 'medios' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Medios Card */}
            <div className="bg-white rounded-2xl border border-[#E7E7EA] shadow-2xs overflow-hidden flex flex-col">
              <div className="p-4 border-b border-[#E7E7EA] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#1F2226] uppercase tracking-wider">
                    Medios ({medios.length})
                  </h4>
                  <span className="text-[10px] text-[#8A8F98] font-mono">tabla `medios`</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => downloadTemplate('medios', 'xlsx')}
                    className="p-1.5 rounded-lg text-[#10B981] hover:bg-[#ECFDF5] transition"
                    title="Descargar plantilla Excel para Medios"
                  >
                    <ArrowDownToLine className="w-4 h-4" />
                  </button>
                  {canEdit && (
                    <button
                      onClick={() => handleOpenImportModal('medios')}
                      className="p-1.5 rounded-lg text-[#F15A24] hover:bg-[#FFF2ED] transition"
                      title="Importar Excel o CSV de Medios"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                  )}
                  {canEdit && (
                    <button
                      onClick={() => handleOpenAdd('medio')}
                      className="p-1.5 rounded-lg text-white bg-[#F15A24] hover:bg-[#D94815] transition"
                      title="Nuevo Medio"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 flex-1">
                <ul className="space-y-1.5 text-xs">
                  {medios.map((m) => (
                    <li
                      key={m.id}
                      className="p-2 rounded-lg bg-[#FBFBFC] border border-[#E7E7EA] flex justify-between items-center"
                    >
                      <span className="font-semibold text-[#1F2226]">{m.nombre}</span>
                      <span className="text-[#8A8F98] font-mono text-[10px]">ID {m.id}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Redes Sociales Card */}
            <div className="bg-white rounded-2xl border border-[#E7E7EA] shadow-2xs overflow-hidden flex flex-col">
              <div className="p-4 border-b border-[#E7E7EA] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#1F2226] uppercase tracking-wider">
                    Redes Sociales ({redes.length})
                  </h4>
                  <span className="text-[10px] text-[#8A8F98] font-mono">tabla `redes_sociales`</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => downloadTemplate('redes', 'xlsx')}
                    className="p-1.5 rounded-lg text-[#10B981] hover:bg-[#ECFDF5] transition"
                    title="Descargar plantilla Excel para Redes Sociales"
                  >
                    <ArrowDownToLine className="w-4 h-4" />
                  </button>
                  {canEdit && (
                    <button
                      onClick={() => handleOpenImportModal('redes')}
                      className="p-1.5 rounded-lg text-[#F15A24] hover:bg-[#FFF2ED] transition"
                      title="Importar Excel o CSV de Redes"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                  )}
                  {canEdit && (
                    <button
                      onClick={() => handleOpenAdd('red')}
                      className="p-1.5 rounded-lg text-white bg-[#F15A24] hover:bg-[#D94815] transition"
                      title="Nueva Red Social"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 flex-1">
                <ul className="space-y-1.5 text-xs">
                  {redes.map((r) => (
                    <li
                      key={r.id}
                      className="p-2 rounded-lg bg-[#FBFBFC] border border-[#E7E7EA] flex justify-between items-center"
                    >
                      <span className="font-semibold text-[#1F2226]">{r.nombre}</span>
                      <span className="text-[#8A8F98] font-mono text-[10px]">ID {r.id}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Tipos de Publicación Card */}
            <div className="bg-white rounded-2xl border border-[#E7E7EA] shadow-2xs overflow-hidden flex flex-col">
              <div className="p-4 border-b border-[#E7E7EA] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#1F2226] uppercase tracking-wider">
                    Tipos de Publicación ({tiposPub.length})
                  </h4>
                  <span className="text-[10px] text-[#8A8F98] font-mono">tabla `tipos_publicacion`</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => downloadTemplate('tipos_pub', 'xlsx')}
                    className="p-1.5 rounded-lg text-[#10B981] hover:bg-[#ECFDF5] transition"
                    title="Descargar plantilla Excel para Tipos de Publicación"
                  >
                    <ArrowDownToLine className="w-4 h-4" />
                  </button>
                  {canEdit && (
                    <button
                      onClick={() => handleOpenImportModal('tipos_pub')}
                      className="p-1.5 rounded-lg text-[#F15A24] hover:bg-[#FFF2ED] transition"
                      title="Importar Excel o CSV de Tipos de Publicación"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                  )}
                  {canEdit && (
                    <button
                      onClick={() => handleOpenAdd('tipo_pub')}
                      className="p-1.5 rounded-lg text-white bg-[#F15A24] hover:bg-[#D94815] transition"
                      title="Nuevo Tipo de Publicación"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 flex-1">
                <ul className="space-y-1.5 text-xs">
                  {tiposPub.map((tp) => (
                    <li
                      key={tp.id}
                      className="p-2 rounded-lg bg-[#FBFBFC] border border-[#E7E7EA] flex justify-between items-center"
                    >
                      <span className="font-semibold text-[#1F2226]">{tp.nombre}</span>
                      <span className="text-[#8A8F98] font-mono text-[10px]">ID {tp.id}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Tipos de Contrato */}
      {activeSubTab === 'tipos' && (
        <div className="bg-white rounded-2xl border border-[#E7E7EA] shadow-2xs overflow-hidden max-w-2xl">
          {/* Action Bar */}
          <div className="p-4 border-b border-[#E7E7EA] flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-[#1F2226] uppercase tracking-wider">
                Tipos de Contrato ({tiposContrato.length})
              </h4>
              <p className="text-[11px] text-[#8A8F98]">
                Tabla `tipos_contrato` — Canje, Pago y Mixto
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => downloadTemplate('tipos_contrato', 'xlsx')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F4F4F6] hover:bg-[#E7E7EA] text-[#1F2226] text-xs font-bold rounded-xl border border-[#E7E7EA] transition"
                title="Descargar archivo modelo Excel (.xlsx)"
              >
                <ArrowDownToLine className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Descargar Modelo</span>
              </button>

              {canEdit && (
                <button
                  onClick={() => handleOpenImportModal('tipos_contrato')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF2ED] hover:bg-[#FED7AA] text-[#F15A24] text-xs font-bold rounded-xl border border-[#FED7AA] transition shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Importar Excel / CSV</span>
                </button>
              )}

              {canEdit && (
                <button
                  onClick={() => handleOpenAdd('tipo_contrato')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F15A24] hover:bg-[#D94815] text-white text-xs font-bold rounded-xl shadow-2xs transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nuevo</span>
                </button>
              )}
            </div>
          </div>

          <div className="p-4">
            <ul className="space-y-2 text-xs">
              {tiposContrato.map((tc) => (
                <li
                  key={tc.id}
                  className="p-3 rounded-xl bg-[#FBFBFC] border border-[#E7E7EA] flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-[#1F2226]">{tc.nombre}</span>
                    <p className="text-[11px] text-[#8A8F98] mt-0.5">
                      {tc.nombre === 'Canje' && 'Compensación 100% en productos Carestino.'}
                      {tc.nombre === 'Pago' && 'Honorario dinerario transferido en USD.'}
                      {tc.nombre === 'Mixto' && 'Combinación de productos y fee dinerario.'}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FFF2ED] text-[#F15A24]">
                    ID {tc.id}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Universal Import / Export Modal */}
      {activeImportType && (
        <ImportExportModal
          isOpen={!!activeImportType}
          onClose={handleCloseImportModal}
          type={activeImportType}
          currentData={currentModalData}
          onConfirmImport={handleExecuteBulkImport}
        />
      )}

      {/* Generic Modal for manual item adding */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-[#E7E7EA] shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E7EA]">
              <h3 className="font-bold text-base text-[#1F2226] uppercase tracking-tight">
                Agregar {modalType}
              </h3>
              <button onClick={() => setModalType(null)} className="text-[#8A8F98] hover:text-[#1F2226]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="mt-4 space-y-4">
              {modalType === 'pais' && (
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#4A4F57] mb-1">
                    Nombre del País
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Ecuador"
                    value={formData.nombre || ''}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-[#E7E7EA] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
                  />
                </div>
              )}

              {modalType === 'tienda' && (
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#4A4F57] mb-1">
                    Nombre de la Tienda
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Tienda Quito Mall El Jardín"
                    value={formData.nombre || ''}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-[#E7E7EA] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
                  />
                </div>
              )}

              {modalType === 'producto' && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#4A4F57] mb-1">
                      SKU (Identificador Único)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="CAR-COCH-005"
                      value={formData.sku || ''}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                      className="w-full text-xs px-3 py-2 border border-[#E7E7EA] rounded-xl font-mono focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#4A4F57] mb-1">
                      Nombre del Producto
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Cochecito Ultralight Titanium"
                      value={formData.nombre || ''}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-[#E7E7EA] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#4A4F57] mb-1">
                      Categoría
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Cochecitos"
                      value={formData.categoria || ''}
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-[#E7E7EA] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
                    />
                  </div>
                </>
              )}

              {modalType === 'escalon' && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#4A4F57] mb-1">
                      Seguidores Hasta
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="500000"
                      value={formData.seguidores_hasta || ''}
                      onChange={(e) => setFormData({ ...formData, seguidores_hasta: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-[#E7E7EA] rounded-xl font-mono focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#4A4F57] mb-1">
                      USD / Mes
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="425"
                      value={formData.usd_mes || ''}
                      onChange={(e) => setFormData({ ...formData, usd_mes: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-[#E7E7EA] rounded-xl font-mono focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#4A4F57] mb-1">
                      Comentario / Etiqueta
                    </label>
                    <input
                      type="text"
                      placeholder="Hasta 500K Seguidores"
                      value={formData.comentario || ''}
                      onChange={(e) => setFormData({ ...formData, comentario: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-[#E7E7EA] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
                    />
                  </div>
                </>
              )}

              {(modalType === 'medio' || modalType === 'red' || modalType === 'tipo_pub' || modalType === 'tipo_contrato') && (
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#4A4F57] mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Nuevo item..."
                    value={formData.nombre || ''}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-[#E7E7EA] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E7E7EA]">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#4A4F57] hover:bg-[#F4F4F6] rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#F15A24] hover:bg-[#D94815] rounded-xl shadow-2xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
