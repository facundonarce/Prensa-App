import { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  ExternalLink,
  Package,
  Layers,
  Calendar,
  DollarSign,
  User,
  CheckCircle2,
  AlertCircle,
  Truck,
  Store,
  ChevronRight,
  FileSpreadsheet,
  Pencil,
  Trash2,
  ShoppingBag,
  BarChart2,
} from 'lucide-react';
import { Acuerdo, Pais, TipoContrato, Usuario } from '../types';

interface AcuerdosListProps {
  acuerdos: Acuerdo[];
  paises: Pais[];
  tiposContrato: TipoContrato[];
  usuarios: Usuario[];
  currentUser: Usuario | null;
  onOpenNuevoAcuerdo: () => void;
  onOpenImport?: () => void;
  onSelectAcuerdo?: (acuerdo: Acuerdo) => void;
  onCrearPedido?: (acuerdoId: number) => void;
  onCrearReporte?: (acuerdoId: number) => void;
  onEditAcuerdo?: (acuerdo: Acuerdo) => void;
  onDeleteAcuerdo?: (id: number) => Promise<void>;
}

export function AcuerdosList({
  acuerdos,
  paises,
  tiposContrato,
  usuarios,
  currentUser,
  onOpenNuevoAcuerdo,
  onOpenImport,
  onSelectAcuerdo,
  onCrearPedido,
  onCrearReporte,
  onEditAcuerdo,
  onDeleteAcuerdo,
}: AcuerdosListProps) {
  const [search, setSearch] = useState('');
  const [filtroPais, setFiltroPais] = useState<string>('todos');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [selectedDetail, setSelectedDetail] = useState<Acuerdo | null>(null);
  const [acuerdoToDelete, setAcuerdoToDelete] = useState<Acuerdo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAnalista = currentUser?.rol === 'analista';

  const filteredAcuerdos = useMemo(() => {
    return acuerdos.filter((a) => {
      // If analista, only own agreements (solicitante or responsable)
      if (isAnalista && currentUser) {
        if (a.solicitante_id !== currentUser.id && a.responsable_id !== currentUser.id) {
          return false;
        }
      }

      // Country filter
      if (filtroPais !== 'todos' && a.pais_id !== Number(filtroPais)) {
        return false;
      }

      // Tipo contrato filter
      if (filtroTipo !== 'todos' && a.tipo_contrato_id !== Number(filtroTipo)) {
        return false;
      }

      // Search text (influencer or ID)
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = a.influencer.toLowerCase().includes(query);
        const matchesId = String(a.id).includes(query);
        return matchesName || matchesId;
      }

      return true;
    });
  }, [acuerdos, filtroPais, filtroTipo, search, isAnalista, currentUser]);

  const getPaisNombre = (id: number) => {
    return paises.find((p) => p.id === id)?.nombre || `País #${id}`;
  };

  const getTipoContratoNombre = (id: number) => {
    return tiposContrato.find((t) => t.id === id)?.nombre || 'Contrato';
  };

  const getUserName = (id: string) => {
    return usuarios.find((u) => u.id === id)?.nombre || 'Usuario';
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#E7E7EA] p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search box */}
          <div className="relative min-w-[240px] flex-1 max-w-sm">
            <Search className="w-4 h-4 text-[#8A8F98] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por influencer o ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 border border-[#E7E7EA] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
            />
          </div>

          {/* País filter */}
          <div className="flex items-center gap-1.5 text-xs text-[#4A4F57]">
            <span className="text-[11px] font-bold uppercase text-[#8A8F98]">País:</span>
            <select
              value={filtroPais}
              onChange={(e) => setFiltroPais(e.target.value)}
              className="text-xs px-2.5 py-2 border border-[#E7E7EA] rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
            >
              <option value="todos">Todos los Países</option>
              {paises.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo Contrato filter */}
          <div className="flex items-center gap-1.5 text-xs text-[#4A4F57]">
            <span className="text-[11px] font-bold uppercase text-[#8A8F98]">Contrato:</span>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="text-xs px-2.5 py-2 border border-[#E7E7EA] rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
            >
              <option value="todos">Todos los Tipos</option>
              {tiposContrato.map((tc) => (
                <option key={tc.id} value={tc.id}>
                  {tc.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {onOpenImport && (
            <button
              type="button"
              onClick={onOpenImport}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-[#E7E7EA] text-xs font-bold rounded-xl shadow-2xs transition cursor-pointer"
              title="Descargar modelo y cargar acuerdos desde Excel o CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#F15A24]" />
              <span>Importar Excel / CSV</span>
            </button>
          )}

          <button
            onClick={onOpenNuevoAcuerdo}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#F15A24] hover:bg-[#D94815] text-white text-xs font-bold rounded-xl shadow-2xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nuevo Acuerdo (Formulario 1)</span>
          </button>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-2xl border border-[#E7E7EA] shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-[#E7E7EA] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#F15A24]" />
            <h3 className="text-xs font-bold text-[#1F2226] uppercase tracking-wider">
              Listado de Acuerdos ({filteredAcuerdos.length})
            </h3>
          </div>
          {isAnalista && (
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#FFFBEB] text-[#F59E0B] border border-[#FDE68A]">
              Vista Filtrada: Solo tus acuerdos asignados
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F4F6] text-[#8A8F98] text-[10px] uppercase font-bold border-y border-[#E7E7EA]">
                <th className="py-2.5 px-4 sticky left-0 z-10 bg-[#F4F4F6]">ID</th>
                <th className="py-2.5 px-4">Influencer</th>
                <th className="py-2.5 px-4">País Principal</th>
                <th className="py-2.5 px-4">Tipo Contrato</th>
                <th className="py-2.5 px-4 text-right">Monto (USD)</th>
                <th className="py-2.5 px-4 text-center">Meses (Teór / Acord)</th>
                <th className="py-2.5 px-4 text-center">Stories / Feeds</th>
                <th className="py-2.5 px-4">Desglose Impacto</th>
                <th className="py-2.5 px-4">Logística</th>
                <th className="py-2.5 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E7EA]/50 text-xs">
              {filteredAcuerdos.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-[#8A8F98]">
                    No se encontraron acuerdos con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredAcuerdos.map((a) => (
                  <tr key={a.id} className="hover:bg-[#F4F4F6] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#1F2226] sticky left-0 z-10 bg-white">
                      #{a.id}
                    </td>

                    <td className="py-3 px-4">
                      <div>
                        <div className="font-bold text-[#1F2226] flex items-center gap-1.5">
                          <span>{a.influencer}</span>
                          {a.target && (
                            <span className="text-[9px] font-black uppercase px-1 py-0.2 rounded bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0]">
                              Target
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#8A8F98] tabular-nums">
                          {a.seguidores.toLocaleString()} seguidores
                          {a.link_instagram && (
                            <a
                              href={a.link_instagram}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#F15A24] ml-1.5 hover:underline inline-flex items-center gap-0.5"
                            >
                              IG <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#F4F4F6] text-[#1F2226] border border-[#E7E7EA]">
                        {getPaisNombre(a.pais_id)}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          a.tipo_contrato_id === 1
                            ? 'bg-[#EFF6FF] text-[#3B82F6]'
                            : a.tipo_contrato_id === 2
                            ? 'bg-[#ECFDF5] text-[#10B981]'
                            : 'bg-[#FFF2ED] text-[#F15A24]'
                        }`}
                      >
                        {getTipoContratoNombre(a.tipo_contrato_id)}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-[#1F2226] tabular-nums">
                      ${a.monto_usd.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-center tabular-nums">
                      <div className="font-semibold text-[#1F2226]">
                        <span className="text-[#F15A24]">{a.meses_teoricos}m teór</span> /{' '}
                        <span>{a.meses_acordados}m acord</span>
                      </div>
                      <div className="text-[10px] text-[#8A8F98] font-mono">
                        {a.fecha_inicio.slice(0, 7)} a {a.fecha_fin.slice(0, 7)}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center tabular-nums">
                      <div className="font-medium text-[#1F2226]">
                        {a.stories_totales} S / {a.feeds_totales} F
                      </div>
                      {a.otros_contenidos && a.otros_contenidos.length > 0 && (
                        <div className="text-[9px] text-[#8A8F98] uppercase">
                          +{a.otros_contenidos.join(', ')}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {a.paises_impacto && a.paises_impacto.length > 0 ? (
                          a.paises_impacto.map((pi, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#FBFBFC] border border-[#E7E7EA] text-[#4A4F57]"
                            >
                              {getPaisNombre(pi.pais_id).slice(0, 3)}: {pi.peso}%
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-[#8A8F98]">100% {getPaisNombre(a.pais_id)}</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-[11px] text-[#4A4F57]">
                        {a.tipo_envio === 'domicilio' ? (
                          <>
                            <Truck className="w-3.5 h-3.5 text-[#F15A24]" />
                            <span>Domicilio</span>
                          </>
                        ) : (
                          <>
                            <Store className="w-3.5 h-3.5 text-[#3B82F6]" />
                            <span>Tienda</span>
                          </>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1 justify-center">
                        <button
                          type="button"
                          onClick={() => setSelectedDetail(a)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#4A4F57] hover:text-[#1F2226] hover:bg-[#F4F4F6] border border-[#E7E7EA] rounded-lg transition cursor-pointer"
                          title="Ver detalle del acuerdo"
                        >
                          <span>Detalle</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>

                        {onEditAcuerdo && (
                          <button
                            type="button"
                            onClick={() => onEditAcuerdo(a)}
                            className="p-1.5 text-[#4A4F57] hover:text-[#F15A24] hover:bg-[#FFF2ED] rounded-lg transition cursor-pointer"
                            title="Modificar acuerdo"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {onDeleteAcuerdo && (
                          <button
                            type="button"
                            onClick={() => setAcuerdoToDelete(a)}
                            className="p-1.5 text-[#8A8F98] hover:text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg transition cursor-pointer"
                            title="Eliminar acuerdo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Agreement Detail Modal */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-[#E7E7EA] shadow-2xl max-w-2xl w-full p-6 animate-in fade-in zoom-in-95 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E7EA]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#F15A24]">
                  Acuerdo de Prensa #{selectedDetail.id}
                </span>
                <h3 className="text-base font-bold text-[#1F2226]">
                  {selectedDetail.influencer}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDetail(null)}
                className="text-[#8A8F98] hover:text-[#1F2226] text-xs font-bold px-2 py-1"
              >
                Cerrar (✕)
              </button>
            </div>

            {/* General info */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-[#FBFBFC] p-3 rounded-xl border border-[#E7E7EA]">
              <div>
                <span className="text-[10px] text-[#8A8F98] uppercase font-bold block">Responsable</span>
                <span className="font-semibold text-[#1F2226]">{getUserName(selectedDetail.responsable_id)}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8A8F98] uppercase font-bold block">Seguidores</span>
                <span className="font-mono font-bold text-[#1F2226] tabular-nums">
                  {selectedDetail.seguidores.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#8A8F98] uppercase font-bold block">Monto Total</span>
                <span className="font-mono font-bold text-[#10B981] tabular-nums">
                  ${selectedDetail.monto_usd} USD
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#8A8F98] uppercase font-bold block">Meses Teóricos</span>
                <span className="font-mono font-bold text-[#F15A24] tabular-nums">
                  {selectedDetail.meses_teoricos} meses
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#8A8F98] uppercase font-bold block">Meses Acordados</span>
                <span className="font-mono font-bold text-[#1F2226] tabular-nums">
                  {selectedDetail.meses_acordados} meses
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#8A8F98] uppercase font-bold block">Período</span>
                <span className="font-mono text-[#1F2226]">
                  {selectedDetail.fecha_inicio} al {selectedDetail.fecha_fin}
                </span>
              </div>
            </div>

            {/* Deliverables & Impact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 rounded-xl border border-[#E7E7EA] space-y-2">
                <span className="text-[11px] font-bold text-[#1F2226] uppercase tracking-wider block">
                  Contenido Acordado
                </span>
                <ul className="text-xs space-y-1 text-[#4A4F57]">
                  <li>• Stories totales: <strong className="text-[#1F2226]">{selectedDetail.stories_totales}</strong></li>
                  <li>• Feeds totales: <strong className="text-[#1F2226]">{selectedDetail.feeds_totales}</strong></li>
                  {selectedDetail.otros_contenidos && (
                    <li>• Otros: {selectedDetail.otros_contenidos.join(', ')}</li>
                  )}
                </ul>
              </div>

              <div className="p-3 rounded-xl border border-[#E7E7EA] space-y-2">
                <span className="text-[11px] font-bold text-[#1F2226] uppercase tracking-wider block">
                  Ponderación de Impacto por País
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDetail.paises_impacto?.map((pi, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 rounded bg-[#FFF2ED] text-[#F15A24] font-bold text-xs border border-[#FED7AA]"
                    >
                      {getPaisNombre(pi.pais_id)}: {pi.peso}%
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="p-3 rounded-xl border border-[#E7E7EA] space-y-2">
              <span className="text-[11px] font-bold text-[#1F2226] uppercase tracking-wider block">
                Productos Asignados al Contrato
              </span>
              <div className="space-y-1.5">
                {selectedDetail.productos?.map((p, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs bg-[#FBFBFC] p-2 rounded-lg">
                    <span className="font-mono font-bold text-[#1F2226]">{p.sku}</span>
                    <span className="text-[#4A4F57]">
                      Cantidad acordada: <strong>{p.cantidad_acordada}</strong> | Restante para pedidos:{' '}
                      <strong className="text-[#10B981]">{p.cantidad_restante}</strong>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions for Pedidos, Reportes, Modificar, Eliminar */}
            <div className="pt-3 border-t border-[#E7E7EA] flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {onCrearPedido && (
                  <button
                    type="button"
                    onClick={() => {
                      const id = selectedDetail.id;
                      setSelectedDetail(null);
                      onCrearPedido(id);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#F15A24] bg-[#FFF2ED] hover:bg-[#FFE5DB] border border-[#FED7AA] rounded-xl transition cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Despachar (Formulario 2)</span>
                  </button>
                )}
                {onCrearReporte && (
                  <button
                    type="button"
                    onClick={() => {
                      const id = selectedDetail.id;
                      setSelectedDetail(null);
                      onCrearReporte(id);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#1F2226] bg-[#F4F4F6] hover:bg-[#E7E7EA] border border-[#E7E7EA] rounded-xl transition cursor-pointer"
                  >
                    <BarChart2 className="w-3.5 h-3.5" />
                    <span>Cargar Reporte (Formulario 3)</span>
                  </button>
                )}
                {onEditAcuerdo && (
                  <button
                    type="button"
                    onClick={() => {
                      const item = selectedDetail;
                      setSelectedDetail(null);
                      onEditAcuerdo(item);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#4A4F57] hover:text-[#F15A24] bg-white hover:bg-[#FFF2ED] border border-[#E7E7EA] rounded-xl transition cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Modificar</span>
                  </button>
                )}
                {onDeleteAcuerdo && (
                  <button
                    type="button"
                    onClick={() => {
                      const item = selectedDetail;
                      setSelectedDetail(null);
                      setAcuerdoToDelete(item);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#EF4444] bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] rounded-xl transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
                className="px-4 py-1.5 text-xs font-semibold text-[#4A4F57] hover:text-[#1F2226] bg-white border border-[#E7E7EA] rounded-xl transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Deleting Acuerdo */}
      {acuerdoToDelete && (
        <div className="fixed inset-0 z-50 bg-[#1F2226]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E7E7EA] shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-[#EF4444]">
              <div className="w-10 h-10 rounded-full bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1F2226]">¿Eliminar Acuerdo #{acuerdoToDelete.id}?</h3>
                <p className="text-xs text-[#8A8F98]">Influencer: {acuerdoToDelete.influencer}</p>
              </div>
            </div>

            <p className="text-xs text-[#4A4F57] leading-relaxed">
              ¿Estás seguro de que deseas eliminar este acuerdo? Se eliminarán de forma permanente los registros y productos acordados vinculados.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E7E7EA]">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setAcuerdoToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-[#4A4F57] hover:bg-[#F4F4F6] rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  if (!onDeleteAcuerdo || !acuerdoToDelete) return;
                  try {
                    setIsDeleting(true);
                    await onDeleteAcuerdo(acuerdoToDelete.id);
                    setAcuerdoToDelete(null);
                  } catch (err: any) {
                    alert(err?.message || 'Error al eliminar el acuerdo');
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#EF4444] hover:bg-[#DC2626] rounded-xl shadow-2xs transition disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Eliminando...' : 'Sí, eliminar acuerdo'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
