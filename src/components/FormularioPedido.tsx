import { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Store,
  Truck,
  ArrowLeft,
  Calendar,
  Package,
  Lock,
  UserCheck,
} from 'lucide-react';
import {
  Acuerdo,
  Producto,
  Tienda,
  Usuario,
  Pedido,
  TipoEnvio,
} from '../types';

interface FormularioPedidoProps {
  acuerdos: Acuerdo[];
  productos: Producto[];
  tiendas: Tienda[];
  usuarios: Usuario[];
  currentUser: Usuario;
  initialAcuerdoId?: number;
  pedidoToEdit?: Pedido | null;
  onSavePedido: (pedido: Omit<Pedido, 'id' | 'created_at'> & { id?: number }) => Promise<void>;
  onCancel: () => void;
}

interface ProductItem {
  sku: string;
  cantidad: number;
}

export function FormularioPedido({
  acuerdos,
  productos,
  tiendas,
  usuarios,
  currentUser,
  initialAcuerdoId,
  pedidoToEdit,
  onSavePedido,
  onCancel,
}: FormularioPedidoProps) {
  // Select an agreement
  const [selectedAcuerdoId, setSelectedAcuerdoId] = useState<number>(
    pedidoToEdit ? pedidoToEdit.acuerdo_id : (initialAcuerdoId || (acuerdos.length > 0 ? acuerdos[0].id : 0))
  );

  const selectedAcuerdo = useMemo(() => {
    return acuerdos.find((a) => a.id === selectedAcuerdoId) || null;
  }, [acuerdos, selectedAcuerdoId]);

  // Check role authorization for this agreement:
  // "Solo puede cargar pedidos sobre un acuerdo el Solicitante o el Responsable de ese acuerdo (o admin_general / admin_prensa)."
  const isAuthorized = useMemo(() => {
    if (!selectedAcuerdo) return false;
    if (currentUser.rol === 'admin_general' || currentUser.rol === 'admin_prensa') {
      return true;
    }
    return (
      selectedAcuerdo.solicitante_id === currentUser.id ||
      selectedAcuerdo.responsable_id === currentUser.id
    );
  }, [currentUser, selectedAcuerdo]);

  const responsableName = useMemo(() => {
    if (!selectedAcuerdo) return '-';
    const u = usuarios.find((usr) => usr.id === selectedAcuerdo.responsable_id);
    return u ? u.nombre || u.email : 'Sin asignar';
  }, [usuarios, selectedAcuerdo]);

  // Form State
  const [fecha, setFecha] = useState<string>(
    pedidoToEdit ? pedidoToEdit.fecha : new Date().toISOString().split('T')[0]
  );
  const [tiendaId, setTiendaId] = useState<number>(
    pedidoToEdit?.tienda_id || (tiendas.length > 0 ? tiendas[0].id : 1)
  );
  const [direccion, setDireccion] = useState<string>(pedidoToEdit?.direccion || '');
  const [codigoPostal, setCodigoPostal] = useState<string>(pedidoToEdit?.codigo_postal || '');
  const [localidad, setLocalidad] = useState<string>(pedidoToEdit?.localidad || '');
  const [provincia, setProvincia] = useState<string>(pedidoToEdit?.provincia || '');
  const [comentarios, setComentarios] = useState<string>(pedidoToEdit?.comentarios || '');

  // Products to dispatch in this order
  const [pedidoProductos, setPedidoProductos] = useState<ProductItem[]>(() => {
    if (pedidoToEdit?.productos && pedidoToEdit.productos.length > 0) {
      return pedidoToEdit.productos.map((p) => ({ sku: p.sku, cantidad: p.cantidad }));
    }
    if (selectedAcuerdo?.productos && selectedAcuerdo.productos.length > 0) {
      const firstAvailable = selectedAcuerdo.productos.find((p) => (p.cantidad_restante ?? p.cantidad_acordada) > 0)
        || selectedAcuerdo.productos[0];
      return [{ sku: firstAvailable.sku, cantidad: 1 }];
    }
    return [];
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // When agreement changes, reset products list
  const handleAcuerdoChange = (newAcuerdoId: number) => {
    setSelectedAcuerdoId(newAcuerdoId);
    const newAcuerdo = acuerdos.find((a) => a.id === newAcuerdoId);
    if (newAcuerdo?.productos && newAcuerdo.productos.length > 0) {
      const firstAvailable = newAcuerdo.productos.find((p) => (p.cantidad_restante ?? p.cantidad_acordada) > 0)
        || newAcuerdo.productos[0];
      setPedidoProductos([{ sku: firstAvailable.sku, cantidad: 1 }]);
    } else {
      setPedidoProductos([]);
    }
    setErrorMsg(null);
  };

  // Helper to get remaining quantity in the agreement for a SKU
  const getAcuerdoProductInfo = (sku: string) => {
    if (!selectedAcuerdo?.productos) return null;
    return selectedAcuerdo.productos.find((p) => p.sku === sku);
  };

  // Add a product row
  const handleAddProduct = () => {
    if (!selectedAcuerdo?.productos || selectedAcuerdo.productos.length === 0) return;
    // Find first SKU not yet in pedidoProductos, or default to first
    const unused = selectedAcuerdo.productos.find(
      (ap) => !pedidoProductos.some((pp) => pp.sku === ap.sku)
    );
    const nextSku = unused ? unused.sku : selectedAcuerdo.productos[0].sku;
    setPedidoProductos([...pedidoProductos, { sku: nextSku, cantidad: 1 }]);
  };

  const handleUpdateProduct = (index: number, sku: string, cantidad: number) => {
    const updated = [...pedidoProductos];
    updated[index] = { sku, cantidad: Math.max(1, cantidad) };
    setPedidoProductos(updated);
    setErrorMsg(null);
  };

  const handleRemoveProduct = (index: number) => {
    if (pedidoProductos.length <= 1) return;
    setPedidoProductos(pedidoProductos.filter((_, idx) => idx !== index));
    setErrorMsg(null);
  };

  // VALIDATIONS
  const validationErrors = useMemo(() => {
    const errors: string[] = [];

    if (!isAuthorized) {
      errors.push('No tienes autorización para cargar pedidos sobre este acuerdo.');
    }

    if (!selectedAcuerdo) {
      errors.push('Debes seleccionar un acuerdo.');
      return errors;
    }

    if (pedidoProductos.length === 0) {
      errors.push('Debes agregar al menos un producto.');
    }

    // Check duplicate SKUs in the same order
    const skus = pedidoProductos.map((p) => p.sku);
    const hasDuplicates = new Set(skus).size !== skus.length;
    if (hasDuplicates) {
      errors.push('Hay productos duplicados en el pedido. Unifica las cantidades en una sola fila.');
    }

    // CRITICAL: Check SKU existence in agreement and remaining balance
    for (const item of pedidoProductos) {
      const acuerdoProd = getAcuerdoProductInfo(item.sku);
      if (!acuerdoProd) {
        errors.push(`El producto SKU "${item.sku}" no pertenece a los productos acordados en el contrato.`);
        continue;
      }

      const prevQtyInThisPedido = pedidoToEdit?.productos?.find((p) => p.sku === item.sku)?.cantidad || 0;
      const restante = (acuerdoProd.cantidad_restante ?? acuerdoProd.cantidad_acordada) + prevQtyInThisPedido;
      if (item.cantidad > restante) {
        errors.push(
          `La cantidad solicitada (${item.cantidad}) para el SKU "${item.sku}" supera el remanente disponible (${restante} disponibles${prevQtyInThisPedido > 0 ? ' incluyendo unidades ya reservadas en este pedido' : ''}).`
        );
      }
      if (item.cantidad <= 0) {
        errors.push(`La cantidad para el SKU "${item.sku}" debe ser al menos 1.`);
      }
    }

    // Delivery validations
    if (selectedAcuerdo.tipo_envio === 'domicilio') {
      if (!direccion.trim()) errors.push('La dirección de entrega a domicilio es obligatoria.');
      if (!localidad.trim()) errors.push('La localidad es obligatoria.');
    } else if (selectedAcuerdo.tipo_envio === 'tienda') {
      if (!tiendaId) errors.push('Debes seleccionar una sucursal/tienda de retiro.');
    }

    return errors;
  }, [isAuthorized, selectedAcuerdo, pedidoProductos, direccion, localidad, tiendaId, pedidoToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validationErrors.length > 0) {
      setErrorMsg(validationErrors[0]);
      return;
    }

    if (!selectedAcuerdo) return;

    setIsSubmitting(true);
    try {
      await onSavePedido({
        ...(pedidoToEdit ? { id: pedidoToEdit.id } : {}),
        acuerdo_id: selectedAcuerdo.id,
        fecha,
        tipo_entrega: selectedAcuerdo.tipo_envio,
        tienda_id: selectedAcuerdo.tipo_envio === 'tienda' ? tiendaId : null,
        direccion: selectedAcuerdo.tipo_envio === 'domicilio' ? direccion : null,
        codigo_postal: selectedAcuerdo.tipo_envio === 'domicilio' ? codigoPostal : null,
        localidad: selectedAcuerdo.tipo_envio === 'domicilio' ? localidad : null,
        provincia: selectedAcuerdo.tipo_envio === 'domicilio' ? provincia : null,
        comentarios: comentarios.trim() || null,
        created_by: pedidoToEdit ? (pedidoToEdit.created_by || currentUser.id) : currentUser.id,
        productos: pedidoProductos.map((p) => ({
          sku: p.sku,
          cantidad: p.cantidad,
        })),
      });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error al guardar el pedido.');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E7E7EA]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-xl border border-[#E7E7EA] bg-white text-[#4A4F57] hover:text-[#1F2226] hover:bg-[#F4F4F6] transition cursor-pointer"
            title="Volver a lista de pedidos"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FFF2ED] text-[#F15A24] px-2 py-0.5 rounded border border-[#FED7AA]">
                Formulario 2
              </span>
              <h1 className="text-base font-bold text-[#1F2226]">
                {pedidoToEdit ? `Modificar Pedido #${pedidoToEdit.id}` : 'Nuevo Pedido de Producto'}
              </h1>
            </div>
            <p className="text-xs text-[#4A4F57] mt-0.5">
              {pedidoToEdit
                ? `Editando pedido #${pedidoToEdit.id} del acuerdo con ${selectedAcuerdo?.influencer || ''}`
                : 'Despacho de productos asociados al contrato con validación estricta de remanente disponible.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-[#4A4F57] bg-white border border-[#E7E7EA] rounded-xl hover:bg-[#F4F4F6] transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={validationErrors.length > 0 || isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#F15A24] hover:bg-[#D94815] rounded-xl transition shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{isSubmitting ? 'Guardando...' : 'Confirmar y Generar Pedido'}</span>
          </button>
        </div>
      </div>

      {/* Authorization Alert if not allowed */}
      {!isAuthorized && selectedAcuerdo && (
        <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] flex items-start gap-3">
          <Lock className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-[#EF4444]">Acceso Restringido para este Contrato</h4>
            <p className="text-xs text-[#991B1B] mt-0.5">
              Solo puede cargar pedidos sobre un acuerdo el Solicitante o el Responsable de dicho acuerdo, o los administradores (admin_general / admin_prensa). Tu usuario ({currentUser.nombre || currentUser.email}) tiene rol <strong>{currentUser.rol}</strong> y no es responsable de este contrato.
            </p>
          </div>
        </div>
      )}

      {/* Validation Error Banner */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-[#EF4444]">Atención: Validación de Pedido</h4>
            <p className="text-xs text-[#991B1B] mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Card 1: Selección de Acuerdo y Datos Autocompletados */}
      <div className="bg-white rounded-2xl border border-[#E7E7EA] shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E7EA]">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#F15A24]" />
            <h2 className="text-xs font-bold text-[#1F2226] uppercase tracking-wider">
              1. Selección de Acuerdo de Prensa
            </h2>
          </div>
          <span className="text-[11px] text-[#8A8F98]">
            {acuerdos.length} acuerdos registrados
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase text-[#4A4F57] tracking-wider mb-1.5">
              Acuerdo / Influencer *
            </label>
            <select
              value={selectedAcuerdoId}
              onChange={(e) => handleAcuerdoChange(Number(e.target.value))}
              className="w-full text-xs px-3.5 py-2.5 bg-white border border-[#E7E7EA] rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
            >
              {acuerdos.map((ac) => (
                <option key={ac.id} value={ac.id}>
                  #{ac.id} — {ac.influencer} ({ac.pais?.nombre || 'País #' + ac.pais_id}) — Monto: ${ac.monto_usd} USD
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-[#4A4F57] tracking-wider mb-1.5">
              Fecha del Pedido *
            </label>
            <div className="relative">
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-[#E7E7EA] rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
              />
              <Calendar className="w-4 h-4 text-[#8A8F98] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Autocompleted contract details */}
        {selectedAcuerdo && (
          <div className="p-4 rounded-xl bg-[#FBFBFC] border border-[#E7E7EA] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase text-[#8A8F98] block">Responsable</span>
              <span className="font-semibold text-[#1F2226]">{responsableName}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-[#8A8F98] block">País del Acuerdo</span>
              <span className="font-semibold text-[#1F2226]">{selectedAcuerdo.pais?.nombre || 'ID ' + selectedAcuerdo.pais_id}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-[#8A8F98] block">Tipo de Envío Pactado</span>
              <span className="inline-flex items-center gap-1.5 font-bold uppercase text-[11px] text-[#F15A24] bg-[#FFF2ED] px-2 py-0.5 rounded border border-[#FED7AA]">
                {selectedAcuerdo.tipo_envio === 'tienda' ? (
                  <>
                    <Store className="w-3.5 h-3.5" /> Retiro en Tienda
                  </>
                ) : (
                  <>
                    <Truck className="w-3.5 h-3.5" /> Envío a Domicilio
                  </>
                )}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-[#8A8F98] block">Vigencia</span>
              <span className="text-[#4A4F57]">
                {selectedAcuerdo.fecha_inicio} al {selectedAcuerdo.fecha_fin}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Card 2: Productos y Control de Remanente (VALIDACIÓN CRÍTICA) */}
      <div className="bg-white rounded-2xl border border-[#E7E7EA] shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E7EA]">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[#F15A24]" />
            <h2 className="text-xs font-bold text-[#1F2226] uppercase tracking-wider">
              2. Productos del Pedido (Validación de Remanente)
            </h2>
          </div>
          <span className="text-[11px] text-[#8A8F98]">
            Solo SKUs acordados en el contrato
          </span>
        </div>

        {/* List of Products in contract for reference */}
        {selectedAcuerdo?.productos && selectedAcuerdo.productos.length > 0 ? (
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A8F98] block">
              Balance actual del contrato #{selectedAcuerdo.id}:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {selectedAcuerdo.productos.map((ap) => {
                const prod = productos.find((p) => p.sku === ap.sku);
                const restante = ap.cantidad_restante ?? ap.cantidad_acordada;
                const despachado = ap.cantidad_acordada - restante;
                const isExhausted = restante <= 0;

                return (
                  <div
                    key={ap.sku}
                    className={`p-2.5 rounded-xl border text-xs ${
                      isExhausted
                        ? 'bg-[#F4F4F6] border-[#E7E7EA] opacity-60'
                        : 'bg-[#FBFBFC] border-[#E7E7EA]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#F15A24]">{ap.sku}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isExhausted
                            ? 'bg-[#EF4444] text-white'
                            : 'bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0]'
                        }`}
                      >
                        {restante} disp. de {ap.cantidad_acordada}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#1F2226] font-medium truncate mt-0.5">
                      {prod ? prod.nombre : ap.sku}
                    </p>
                    <span className="text-[10px] text-[#8A8F98]">
                      Despachados: {despachado} | Pendientes: {restante}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-3 text-xs text-[#EF4444] bg-[#FEF2F2] rounded-xl border border-[#FECACA]">
            Este acuerdo no tiene productos vinculados en el contrato.
          </div>
        )}

        {/* Dynamic Product Rows */}
        <div className="space-y-3 pt-2">
          {pedidoProductos.map((item, idx) => {
            const acuerdoProd = getAcuerdoProductInfo(item.sku);
            const fullProd = productos.find((p) => p.sku === item.sku);
            const restante = acuerdoProd ? (acuerdoProd.cantidad_restante ?? acuerdoProd.cantidad_acordada) : 0;
            const isExceeded = item.cantidad > restante;

            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border transition ${
                  isExceeded
                    ? 'bg-[#FEF2F2] border-[#EF4444]'
                    : 'bg-[#FBFBFC] border-[#E7E7EA]'
                }`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-7">
                    <label className="block text-[10px] font-bold uppercase text-[#8A8F98] mb-1">
                      SKU del Contrato
                    </label>
                    <select
                      value={item.sku}
                      onChange={(e) => handleUpdateProduct(idx, e.target.value, item.cantidad)}
                      className="w-full text-xs px-3 py-2 bg-white border border-[#E7E7EA] rounded-lg font-medium focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
                    >
                      {selectedAcuerdo?.productos?.map((ap) => {
                        const pr = productos.find((p) => p.sku === ap.sku);
                        const rest = ap.cantidad_restante ?? ap.cantidad_acordada;
                        return (
                          <option key={ap.sku} value={ap.sku}>
                            [{ap.sku}] {pr ? pr.nombre : ap.sku} — ({rest} disponibles)
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-[10px] font-bold uppercase text-[#8A8F98] mb-1">
                      Cantidad a Despachar (Máx: {restante})
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max={restante}
                        value={item.cantidad}
                        onChange={(e) => handleUpdateProduct(idx, item.sku, Number(e.target.value))}
                        className={`w-full text-xs px-3 py-2 bg-white border rounded-lg font-mono tabular-nums font-bold focus:outline-hidden focus:ring-2 ${
                          isExceeded
                            ? 'border-[#EF4444] text-[#EF4444] focus:ring-[#EF4444]'
                            : 'border-[#E7E7EA] text-[#1F2226] focus:ring-[#F15A24]'
                        }`}
                      />
                      <span className="text-xs text-[#8A8F98] whitespace-nowrap">
                        / {restante} disp.
                      </span>
                    </div>
                  </div>

                  <div className="sm:col-span-1 flex justify-end">
                    {pedidoProductos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(idx)}
                        className="p-2 text-[#8A8F98] hover:text-[#EF4444] rounded-lg hover:bg-white transition"
                        title="Eliminar producto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Warning message if exceeded */}
                {isExceeded && (
                  <div className="mt-2 text-xs font-semibold text-[#EF4444] flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>
                      Error bloqueante: La cantidad ({item.cantidad}) supera el remanente disponible ({restante}) del contrato.
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {selectedAcuerdo?.productos && pedidoProductos.length < selectedAcuerdo.productos.length && (
          <button
            type="button"
            onClick={handleAddProduct}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F15A24] hover:text-[#D94815] transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar otro producto acordado al pedido</span>
          </button>
        )}
      </div>

      {/* Card 3: Destino Logístico (Entrega) */}
      <div className="bg-white rounded-2xl border border-[#E7E7EA] shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E7EA]">
          <div className="flex items-center gap-2">
            {selectedAcuerdo?.tipo_envio === 'tienda' ? (
              <Store className="w-4 h-4 text-[#F15A24]" />
            ) : (
              <Truck className="w-4 h-4 text-[#F15A24]" />
            )}
            <h2 className="text-xs font-bold text-[#1F2226] uppercase tracking-wider">
              3. Destino Logístico (Tipo: {selectedAcuerdo?.tipo_envio?.toUpperCase() || 'NO DEFINIDO'})
            </h2>
          </div>
          <span className="text-[11px] text-[#8A8F98]">
            Inmutable según contrato firmado
          </span>
        </div>

        {selectedAcuerdo?.tipo_envio === 'tienda' ? (
          <div>
            <label className="block text-[11px] font-bold uppercase text-[#4A4F57] tracking-wider mb-1.5">
              Sucursal / Tienda de Retiro *
            </label>
            <select
              value={tiendaId}
              onChange={(e) => setTiendaId(Number(e.target.value))}
              className="w-full text-xs px-3.5 py-2.5 bg-white border border-[#E7E7EA] rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
            >
              {tiendas.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre} (ID #{t.id})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-[#8A8F98] mt-1">
              El influencer o su representante retirará el pedido en la tienda seleccionada.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold uppercase text-[#4A4F57] tracking-wider mb-1.5">
                Dirección Completa (Calle, Número, Piso/Depto) *
              </label>
              <input
                type="text"
                placeholder="Ej: Av. del Libertador 2450, Piso 12 D"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                required
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-[#E7E7EA] rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#4A4F57] tracking-wider mb-1.5">
                Localidad *
              </label>
              <input
                type="text"
                placeholder="Ej: Palermo / Bogotá / Miraflores"
                value={localidad}
                onChange={(e) => setLocalidad(e.target.value)}
                required
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-[#E7E7EA] rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#4A4F57] tracking-wider mb-1.5">
                Provincia / Estado / Departamento
              </label>
              <input
                type="text"
                placeholder="Ej: Buenos Aires / Cundinamarca / Lima"
                value={provincia}
                onChange={(e) => setProvincia(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-[#E7E7EA] rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#4A4F57] tracking-wider mb-1.5">
                Código Postal
              </label>
              <input
                type="text"
                placeholder="Ej: C1425 / 110111"
                value={codigoPostal}
                onChange={(e) => setCodigoPostal(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-[#E7E7EA] rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-[11px] font-bold uppercase text-[#4A4F57] tracking-wider mb-1.5">
            Comentarios o Instrucciones de Entrega
          </label>
          <textarea
            rows={2}
            placeholder="Horarios preferentes, avisar a seguridad, indicaciones para mensajería..."
            value={comentarios}
            onChange={(e) => setComentarios(e.target.value)}
            className="w-full text-xs px-3.5 py-2.5 bg-white border border-[#E7E7EA] rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
          />
        </div>
      </div>

      {/* Submit footer */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 text-xs font-semibold text-[#4A4F57] bg-white border border-[#E7E7EA] rounded-xl hover:bg-[#F4F4F6] transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={validationErrors.length > 0 || isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#F15A24] hover:bg-[#D94815] rounded-xl transition shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>
            {isSubmitting
              ? 'Guardando...'
              : pedidoToEdit
              ? 'Guardar Modificaciones del Pedido'
              : 'Confirmar y Generar Pedido'}
          </span>
        </button>
      </div>
    </form>
  );
}
