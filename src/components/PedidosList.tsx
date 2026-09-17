import { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  Store,
  Truck,
  Trash2,
  Calendar,
  Package,
  Eye,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { Pedido, Acuerdo, Producto, Tienda, Usuario } from '../types';

interface PedidosListProps {
  pedidos: Pedido[];
  acuerdos: Acuerdo[];
  productos: Producto[];
  tiendas: Tienda[];
  usuarios: Usuario[];
  currentUser: Usuario;
  onNewPedido: () => void;
  onDeletePedido: (id: number) => Promise<void>;
}

export function PedidosList({
  pedidos,
  acuerdos,
  productos,
  tiendas,
  usuarios,
  currentUser,
  onNewPedido,
  onDeletePedido,
}: PedidosListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('all');
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);

  // Filtered list
  const filteredPedidos = useMemo(() => {
    return pedidos.filter((p) => {
      const acuerdo = acuerdos.find((a) => a.id === p.acuerdo_id);
      const influencerName = acuerdo ? acuerdo.influencer.toLowerCase() : '';
      const matchesSearch =
        p.id.toString().includes(searchTerm) ||
        p.acuerdo_id.toString().includes(searchTerm) ||
        influencerName.includes(searchTerm.toLowerCase()) ||
        (p.direccion && p.direccion.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.localidad && p.localidad.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.productos && p.productos.some((pr) => pr.sku.toLowerCase().includes(searchTerm.toLowerCase())));

      const matchesTipo = filterTipo === 'all' || p.tipo_entrega === filterTipo;

      return matchesSearch && matchesTipo;
    });
  }, [pedidos, acuerdos, searchTerm, filterTipo]);

  // Metrics
  const stats = useMemo(() => {
    const total = pedidos.length;
    const tienda = pedidos.filter((p) => p.tipo_entrega === 'tienda').length;
    const domicilio = pedidos.filter((p) => p.tipo_entrega === 'domicilio').length;
    const totalItems = pedidos.reduce((acc, p) => {
      const sub = p.productos ? p.productos.reduce((s, pr) => s + pr.cantidad, 0) : 0;
      return acc + sub;
    }, 0);
    return { total, tienda, domicilio, totalItems };
  }, [pedidos]);

  const handleDelete = async (id: number) => {
    if (confirm(`¿Estás seguro de eliminar el pedido #${id}? Esto restaurará el remanente en el contrato.`)) {
      await onDeletePedido(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-[#1F2226]">Módulo de Pedidos de Producto</h1>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FFF2ED] text-[#F15A24] px-2 py-0.5 rounded border border-[#FED7AA]">
              Formulario 2
            </span>
          </div>
          <p className="text-xs text-[#4A4F57] mt-0.5">
            Despacho y entrega de productos pactados con influencers y control de stock restante.
          </p>
        </div>

        <button
          type="button"
          onClick={onNewPedido}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#F15A24] hover:bg-[#D94815] rounded-xl transition shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Pedido (Formulario 2)</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E7E7EA] shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-[#8A8F98] block">Total Pedidos</span>
          <span className="text-xl font-bold font-mono text-[#1F2226] block mt-1">{stats.total}</span>
          <span className="text-[11px] text-[#4A4F57] mt-0.5 block">Órdenes generadas</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E7E7EA] shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-[#8A8F98] block">Retiro en Tienda</span>
          <span className="text-xl font-bold font-mono text-[#1F2226] block mt-1">{stats.tienda}</span>
          <span className="text-[11px] text-[#4A4F57] mt-0.5 block">Sucursales Carestino</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E7E7EA] shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-[#8A8F98] block">Envío Domicilio</span>
          <span className="text-xl font-bold font-mono text-[#1F2226] block mt-1">{stats.domicilio}</span>
          <span className="text-[11px] text-[#4A4F57] mt-0.5 block">Despacho postal</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E7E7EA] shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-[#8A8F98] block">Unidades Despachadas</span>
          <span className="text-xl font-bold font-mono text-[#F15A24] block mt-1">{stats.totalItems}</span>
          <span className="text-[11px] text-[#4A4F57] mt-0.5 block">Productos totales</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E7E7EA] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-[#8A8F98] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por ID, influencer, SKU o dirección..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2 bg-[#FBFBFC] border border-[#E7E7EA] rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setFilterTipo('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              filterTipo === 'all'
                ? 'bg-[#1F2226] text-white'
                : 'bg-[#F4F4F6] text-[#4A4F57] hover:bg-[#E7E7EA]'
            }`}
          >
            Todos ({pedidos.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTipo('tienda')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition inline-flex items-center gap-1.5 ${
              filterTipo === 'tienda'
                ? 'bg-[#1F2226] text-white'
                : 'bg-[#F4F4F6] text-[#4A4F57] hover:bg-[#E7E7EA]'
            }`}
          >
            <Store className="w-3 h-3" />
            <span>Tienda ({stats.tienda})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterTipo('domicilio')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition inline-flex items-center gap-1.5 ${
              filterTipo === 'domicilio'
                ? 'bg-[#1F2226] text-white'
                : 'bg-[#F4F4F6] text-[#4A4F57] hover:bg-[#E7E7EA]'
            }`}
          >
            <Truck className="w-3 h-3" />
            <span>Domicilio ({stats.domicilio})</span>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-[#E7E7EA] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4F4F6] border-b border-[#E7E7EA] text-[#4A4F57] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">ID Pedido</th>
                <th className="py-3 px-4">Acuerdo / Influencer</th>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Tipo Entrega</th>
                <th className="py-3 px-4">Destino</th>
                <th className="py-3 px-4">Productos Despachados</th>
                <th className="py-3 px-4">Creado Por</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E7EA]">
              {filteredPedidos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-[#8A8F98]">
                    No se encontraron pedidos registrados. Haz clic en "+ Nuevo Pedido (Formulario 2)" para despachar productos.
                  </td>
                </tr>
              ) : (
                filteredPedidos.map((ped) => {
                  const acuerdo = acuerdos.find((a) => a.id === ped.acuerdo_id);
                  const tienda = ped.tienda_id ? tiendas.find((t) => t.id === ped.tienda_id) : null;
                  const creador = usuarios.find((u) => u.id === ped.created_by);

                  return (
                    <tr key={ped.id} className="hover:bg-[#FBFBFC] transition">
                      <td className="py-3 px-4 font-mono font-bold text-[#F15A24]">
                        #{ped.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#1F2226]">
                          {acuerdo ? acuerdo.influencer : 'Acuerdo #' + ped.acuerdo_id}
                        </div>
                        <div className="text-[11px] text-[#8A8F98]">
                          Contrato #{ped.acuerdo_id} {acuerdo?.pais ? `• ${acuerdo.pais.nombre}` : ''}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#4A4F57] font-medium whitespace-nowrap">
                        {ped.fecha}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                            ped.tipo_entrega === 'tienda'
                              ? 'bg-[#EFF6FF] text-[#3B82F6] border border-[#BFDBFE]'
                              : 'bg-[#FFF2ED] text-[#F15A24] border border-[#FED7AA]'
                          }`}
                        >
                          {ped.tipo_entrega === 'tienda' ? (
                            <>
                              <Store className="w-3 h-3" /> Tienda
                            </>
                          ) : (
                            <>
                              <Truck className="w-3 h-3" /> Domicilio
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#1F2226]">
                        {ped.tipo_entrega === 'tienda' ? (
                          <span className="font-medium">{tienda ? tienda.nombre : `Tienda #${ped.tienda_id}`}</span>
                        ) : (
                          <div className="max-w-xs truncate">
                            <span className="font-medium">{ped.direccion || '-'}</span>
                            {ped.localidad && (
                              <span className="text-[11px] text-[#8A8F98] block">
                                {ped.localidad}{ped.provincia ? `, ${ped.provincia}` : ''} {ped.codigo_postal ? `(${ped.codigo_postal})` : ''}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {ped.productos?.map((pp, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 font-mono text-[10px] bg-[#F4F4F6] text-[#1F2226] px-1.5 py-0.5 rounded font-bold"
                            >
                              <span>{pp.sku}</span>
                              <span className="text-[#F15A24]">x{pp.cantidad}</span>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[11px] text-[#8A8F98]">
                        {creador ? creador.nombre || creador.email : 'Sistema'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedPedido(ped)}
                            className="p-1.5 text-[#4A4F57] hover:text-[#1F2226] hover:bg-[#F4F4F6] rounded-lg transition"
                            title="Ver detalle del pedido"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {currentUser.rol === 'admin_general' && (
                            <button
                              type="button"
                              onClick={() => handleDelete(ped.id)}
                              className="p-1.5 text-[#8A8F98] hover:text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg transition"
                              title="Eliminar pedido (solo admin_general)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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

      {/* Detail Modal */}
      {selectedPedido && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E7E7EA] shadow-2xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E7EA]">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#F15A24]" />
                <h3 className="text-sm font-bold text-[#1F2226]">
                  Detalle del Pedido #{selectedPedido.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPedido(null)}
                className="text-xs font-semibold text-[#8A8F98] hover:text-[#1F2226]"
              >
                Cerrar
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#FBFBFC] border border-[#E7E7EA]">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#8A8F98] block">Acuerdo ID</span>
                  <span className="font-semibold text-[#1F2226]">#{selectedPedido.acuerdo_id}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#8A8F98] block">Fecha Pedido</span>
                  <span className="font-semibold text-[#1F2226]">{selectedPedido.fecha}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#8A8F98] block">Tipo de Entrega</span>
                  <span className="font-semibold capitalize text-[#F15A24]">{selectedPedido.tipo_entrega}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#8A8F98] block">Destino</span>
                  <span className="font-semibold text-[#1F2226]">
                    {selectedPedido.tipo_entrega === 'tienda'
                      ? (tiendas.find((t) => t.id === selectedPedido.tienda_id)?.nombre || `Tienda #${selectedPedido.tienda_id}`)
                      : `${selectedPedido.direccion || ''}, ${selectedPedido.localidad || ''}`}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#4A4F57] mb-1.5">
                  Productos Despachados
                </h4>
                <div className="divide-y divide-[#E7E7EA] border border-[#E7E7EA] rounded-xl overflow-hidden">
                  {selectedPedido.productos?.map((p, i) => {
                    const prod = productos.find((item) => item.sku === p.sku);
                    return (
                      <div key={i} className="p-3 flex items-center justify-between text-xs bg-white">
                        <div>
                          <span className="font-mono font-bold text-[#F15A24] mr-2">[{p.sku}]</span>
                          <span className="font-medium text-[#1F2226]">{prod ? prod.nombre : p.sku}</span>
                        </div>
                        <span className="font-mono font-bold text-[#1F2226] bg-[#F4F4F6] px-2 py-0.5 rounded">
                          {p.cantidad} unidad(es)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedPedido.comentarios && (
                <div className="p-3 rounded-xl bg-[#FBFBFC] border border-[#E7E7EA]">
                  <span className="text-[10px] font-bold uppercase text-[#8A8F98] block mb-1">
                    Comentarios / Indicaciones
                  </span>
                  <p className="text-[#4A4F57] italic">"{selectedPedido.comentarios}"</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedPedido(null)}
                className="px-4 py-2 text-xs font-semibold text-[#1F2226] bg-[#F4F4F6] hover:bg-[#E7E7EA] rounded-xl transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
