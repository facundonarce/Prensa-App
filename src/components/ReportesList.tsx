import { useState, useMemo } from 'react';
import {
  BarChart2,
  Plus,
  Search,
  Share2,
  ThumbsUp,
  MessageCircle,
  Bookmark,
  Eye,
  Trash2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Radio,
  Tv,
  FileText,
  Package,
  FileSpreadsheet,
  Pencil,
} from 'lucide-react';
import { Reporte, Acuerdo, Medio, RedSocial, TipoPublicacion, Producto, Usuario } from '../types';

interface ReportesListProps {
  reportes: Reporte[];
  acuerdos: Acuerdo[];
  medios: Medio[];
  redes: RedSocial[];
  tiposPub: TipoPublicacion[];
  productos: Producto[];
  usuarios: Usuario[];
  currentUser: Usuario;
  onNewReporte: () => void;
  onOpenImport?: () => void;
  onDeleteReporte: (id: number) => Promise<void>;
  onEditReporte?: (reporte: Reporte) => void;
}

export function ReportesList({
  reportes,
  acuerdos,
  medios,
  redes,
  tiposPub,
  productos,
  usuarios,
  currentUser,
  onNewReporte,
  onOpenImport,
  onDeleteReporte,
  onEditReporte,
}: ReportesListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMedio, setFilterMedio] = useState<string>('all');
  const [selectedReporte, setSelectedReporte] = useState<Reporte | null>(null);
  const [reporteToDelete, setReporteToDelete] = useState<Reporte | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtered list
  const filteredReportes = useMemo(() => {
    return reportes.filter((r) => {
      const acuerdo = acuerdos.find((a) => a.id === r.acuerdo_id);
      const influencerName = acuerdo ? acuerdo.influencer.toLowerCase() : '';
      const medio = medios.find((m) => m.id === r.medio_id);
      const medioName = medio ? medio.nombre.toLowerCase() : '';

      const matchesSearch =
        r.id.toString().includes(searchTerm) ||
        r.acuerdo_id.toString().includes(searchTerm) ||
        influencerName.includes(searchTerm.toLowerCase()) ||
        (r.link && r.link.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.productos && r.productos.some((p) => p.sku.toLowerCase().includes(searchTerm.toLowerCase())));

      const matchesMedio = filterMedio === 'all' || r.medio_id.toString() === filterMedio;

      return matchesSearch && matchesMedio;
    });
  }, [reportes, acuerdos, medios, searchTerm, filterMedio]);

  // Aggregate Metrics
  const stats = useMemo(() => {
    const total = reportes.length;
    const views = reportes.reduce((acc, r) => acc + (r.visualizaciones || 0), 0);
    const interacciones = reportes.reduce(
      (acc, r) =>
        acc +
        (r.me_gusta || 0) +
        (r.comentarios || 0) +
        (r.compartidos || 0) +
        (r.guardados || 0) +
        (r.reposts || 0),
      0
    );
    const brandOk = reportes.filter((r) => r.marca_visible && r.etiqueto_carestino).length;

    return { total, views, interacciones, brandOk };
  }, [reportes]);

  const handleDelete = async (id: number) => {
    if (confirm(`¿Estás seguro de eliminar el reporte #${id}?`)) {
      await onDeleteReporte(id);
    }
  };

  const formatNumber = (num: number | null | undefined) => {
    if (num == null) return '-';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-[#1F2226]">Módulo de Reportes de Contenido</h1>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FFF2ED] text-[#F15A24] px-2 py-0.5 rounded border border-[#FED7AA]">
              Formulario 3
            </span>
          </div>
          <p className="text-xs text-[#4A4F57] mt-0.5">
            Monitoreo de publicaciones en redes sociales, notas y medios con métricas de engagement y cumplimiento.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onOpenImport && (
            <button
              type="button"
              onClick={onOpenImport}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-[#E7E7EA] rounded-xl transition shadow-2xs cursor-pointer"
              title="Descargar modelo y cargar reportes desde Excel o CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#F15A24]" />
              <span>Importar Excel / CSV</span>
            </button>
          )}

          <button
            type="button"
            onClick={onNewReporte}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#F15A24] hover:bg-[#D94815] rounded-xl transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Reporte (Formulario 3)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E7E7EA] shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-[#8A8F98] block">Publicaciones</span>
          <span className="text-xl font-bold font-mono text-[#1F2226] block mt-1">{stats.total}</span>
          <span className="text-[11px] text-[#4A4F57] mt-0.5 block">Contenidos relevados</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E7E7EA] shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-[#8A8F98] block">Visualizaciones</span>
          <span className="text-xl font-bold font-mono text-[#1F2226] block mt-1">{formatNumber(stats.views)}</span>
          <span className="text-[11px] text-[#4A4F57] mt-0.5 block">Total alcance views</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E7E7EA] shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-[#8A8F98] block">Interacciones</span>
          <span className="text-xl font-bold font-mono text-[#F15A24] block mt-1">{formatNumber(stats.interacciones)}</span>
          <span className="text-[11px] text-[#4A4F57] mt-0.5 block">Likes, comments, shares</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E7E7EA] shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-[#8A8F98] block">Cumplimiento Marca</span>
          <span className="text-xl font-bold font-mono text-[#10B981] block mt-1">
            {stats.total > 0 ? `${Math.round((stats.brandOk / stats.total) * 100)}%` : '0%'}
          </span>
          <span className="text-[11px] text-[#4A4F57] mt-0.5 block">Tag oficial + marca visible</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E7E7EA] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-[#8A8F98] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por ID, influencer, link o SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2 bg-[#FBFBFC] border border-[#E7E7EA] rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilterMedio('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition shrink-0 ${
              filterMedio === 'all'
                ? 'bg-[#1F2226] text-white'
                : 'bg-[#F4F4F6] text-[#4A4F57] hover:bg-[#E7E7EA]'
            }`}
          >
            Todos ({reportes.length})
          </button>
          {medios.map((m) => {
            const count = reportes.filter((r) => r.medio_id === m.id).length;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setFilterMedio(m.id.toString())}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition shrink-0 ${
                  filterMedio === m.id.toString()
                    ? 'bg-[#1F2226] text-white'
                    : 'bg-[#F4F4F6] text-[#4A4F57] hover:bg-[#E7E7EA]'
                }`}
              >
                {m.nombre} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Reportes Table */}
      <div className="bg-white rounded-2xl border border-[#E7E7EA] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4F4F6] border-b border-[#E7E7EA] text-[#4A4F57] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">ID Reporte</th>
                <th className="py-3 px-4">Influencer / Contrato</th>
                <th className="py-3 px-4">Medio & Formato</th>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Interacciones / Views</th>
                <th className="py-3 px-4">Validación Marca</th>
                <th className="py-3 px-4">Productos & Categorías</th>
                <th className="py-3 px-4">Link / Captura</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E7EA]">
              {filteredReportes.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-xs text-[#8A8F98]">
                    No se encontraron reportes de contenido. Haz clic en "+ Nuevo Reporte (Formulario 3)" para registrar uno.
                  </td>
                </tr>
              ) : (
                filteredReportes.map((rep) => {
                  const acuerdo = acuerdos.find((a) => a.id === rep.acuerdo_id);
                  const medio = medios.find((m) => m.id === rep.medio_id);
                  const red = rep.red_social_id ? redes.find((r) => r.id === rep.red_social_id) : null;
                  const tipoP = rep.tipo_publicacion_id ? tiposPub.find((tp) => tp.id === rep.tipo_publicacion_id) : null;

                  return (
                    <tr key={rep.id} className="hover:bg-[#FBFBFC] transition">
                      <td className="py-3 px-4 font-mono font-bold text-[#F15A24]">
                        #{rep.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#1F2226]">
                          {acuerdo ? acuerdo.influencer : 'Acuerdo #' + rep.acuerdo_id}
                        </div>
                        <div className="text-[11px] text-[#8A8F98]">
                          Contrato #{rep.acuerdo_id} {acuerdo?.pais ? `• ${acuerdo.pais.nombre}` : ''}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#1F2226]">
                          {medio ? medio.nombre : 'Medio #' + rep.medio_id}
                        </div>
                        {red && (
                          <div className="text-[11px] text-[#4A4F57]">
                            {red.nombre} {tipoP ? `• ${tipoP.nombre}` : ''}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#4A4F57] font-medium whitespace-nowrap">
                        {rep.fecha}
                      </td>
                      <td className="py-3 px-4">
                        {rep.visualizaciones != null || rep.me_gusta != null ? (
                          <div className="space-y-0.5 font-mono text-[11px]">
                            <div className="flex items-center gap-2">
                              <span className="text-[#10B981] font-bold">♥ {formatNumber(rep.me_gusta)}</span>
                              <span className="text-[#3B82F6] font-bold">💬 {formatNumber(rep.comentarios)}</span>
                            </div>
                            <div className="text-[#8A8F98]">
                              👁 {formatNumber(rep.visualizaciones)} views
                            </div>
                          </div>
                        ) : (
                          <span className="text-[#8A8F98] italic text-[11px]">No aplica (Medio Tradicional)</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {rep.marca_visible != null ? (
                          <div className="space-y-1">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                rep.marca_visible
                                  ? 'bg-[#ECFDF5] text-[#10B981]'
                                  : 'bg-[#FEF2F2] text-[#EF4444]'
                              }`}
                            >
                              {rep.marca_visible ? '✓ Marca visible' : '✗ Sin logo'}
                            </span>
                            <div className="text-[10px] text-[#8A8F98]">
                              {rep.etiqueto_carestino ? '@carestino OK' : 'Sin tag'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[#8A8F98] text-[11px]">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {rep.productos?.map((rp, i) => (
                            <div
                              key={i}
                              className="text-[10px] bg-[#F4F4F6] border border-[#E7E7EA] rounded px-1.5 py-0.5 flex items-center gap-1 font-medium"
                            >
                              <span className="font-mono font-bold text-[#F15A24]">{rp.sku}</span>
                              <span className="text-[#8A8F98]">({rp.categoria})</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {rep.link && (
                            <a
                              href={rep.link}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 text-[#F15A24] hover:bg-[#FFF2ED] rounded-lg transition"
                              title="Ver publicación original"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          {rep.captura_url && (
                            <a
                              href={rep.captura_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] font-semibold text-[#3B82F6] hover:underline"
                            >
                              Captura ↗
                            </a>
                          )}
                          {!rep.link && !rep.captura_url && (
                            <span className="text-[#8A8F98] text-[11px]">-</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1 justify-end">
                          {onEditReporte && (
                            <button
                              type="button"
                              onClick={() => onEditReporte(rep)}
                              className="p-1.5 text-[#4A4F57] hover:text-[#F15A24] hover:bg-[#FFF2ED] rounded-lg transition cursor-pointer"
                              title="Modificar reporte"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setReporteToDelete(rep)}
                            className="p-1.5 text-[#8A8F98] hover:text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg transition cursor-pointer"
                            title="Eliminar reporte"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Dialog for Deleting Reporte */}
      {reporteToDelete && (
        <div className="fixed inset-0 z-50 bg-[#1F2226]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E7E7EA] shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-[#EF4444]">
              <div className="w-10 h-10 rounded-full bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1F2226]">¿Eliminar Reporte #{reporteToDelete.id}?</h3>
                <p className="text-xs text-[#8A8F98]">Acuerdo vinculado: #{reporteToDelete.acuerdo_id}</p>
              </div>
            </div>

            <p className="text-xs text-[#4A4F57] leading-relaxed">
              ¿Estás seguro de que deseas eliminar este reporte de contenido? Esta acción borrará el registro de métricas y productos reportados.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E7E7EA]">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setReporteToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-[#4A4F57] hover:bg-[#F4F4F6] rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  if (!reporteToDelete) return;
                  try {
                    setIsDeleting(true);
                    await onDeleteReporte(reporteToDelete.id);
                    setReporteToDelete(null);
                  } catch (err: any) {
                    alert(err?.message || 'Error al eliminar el reporte');
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#EF4444] hover:bg-[#DC2626] rounded-xl shadow-2xs transition disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Eliminando...' : 'Sí, eliminar reporte'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
