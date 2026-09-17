import { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Calendar,
  DollarSign,
  Truck,
  Store,
  HelpCircle,
  Upload,
  Link2,
  Layers,
  Save,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import {
  Pais,
  Producto,
  Tienda,
  TipoContrato,
  EscalonesSeguidores,
  Usuario,
  Acuerdo,
  AcuerdoPaisImpacto,
  AcuerdoProducto,
  TipoEnvio,
} from '../types';
import { calcularMesesTeoricos } from '../lib/dataService';
import { ProductCombobox } from './ProductCombobox';

interface FormularioAcuerdoProps {
  currentUser: Usuario;
  usuariosHabilitados: Usuario[];
  paises: Pais[];
  productos: Producto[];
  tiendas: Tienda[];
  tiposContrato: TipoContrato[];
  escalones: EscalonesSeguidores[];
  onSave: (acuerdo: Omit<Acuerdo, 'id' | 'created_at'>) => Promise<Acuerdo>;
  onCancel: () => void;
}

export function FormularioAcuerdo({
  currentUser,
  usuariosHabilitados,
  paises,
  productos,
  tiendas,
  tiposContrato,
  escalones,
  onSave,
  onCancel,
}: FormularioAcuerdoProps) {
  // 1. Basic Info
  const [responsableId, setResponsableId] = useState(currentUser.id);
  const [paisId, setPaisId] = useState<number>(paises[0]?.id || 1);
  const [influencer, setInfluencer] = useState('');
  const [seguidores, setSeguidores] = useState<number | ''>('');
  const [linkInstagram, setLinkInstagram] = useState('');
  const [celular, setCelular] = useState('');
  const [target, setTarget] = useState(true);
  const [tipoContratoId, setTipoContratoId] = useState<number>(tiposContrato[0]?.id || 1);

  // 2. Monto & Calculo Meses Teóricos
  const [montoUsd, setMontoUsd] = useState<number | ''>('');

  const numSeguidores = typeof seguidores === 'number' ? seguidores : 0;
  const numMontoUsd = typeof montoUsd === 'number' ? montoUsd : 0;

  const theoreticalCalc = useMemo(() => {
    return calcularMesesTeoricos(numSeguidores, numMontoUsd, escalones);
  }, [numSeguidores, numMontoUsd, escalones]);

  const mesesTeoricos = theoreticalCalc.meses;

  // 3. Meses acordados & Fechas (mes y año)
  const [mesesAcordados, setMesesAcordados] = useState<number>(1);
  const [fechaInicio, setFechaInicio] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [fechaFin, setFechaFin] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 2).padStart(2, '0')}`;
  });

  // 4. Stories y Feeds totales acordados (por defecto = meses acordados)
  const [storiesTotales, setStoriesTotales] = useState<number>(1);
  const [feedsTotales, setFeedsTotales] = useState<number>(1);
  const [isManualDeliverables, setIsManualDeliverables] = useState(false);

  // Auto sync deliverables when mesesAcordados changes unless manually overridden
  useEffect(() => {
    if (!isManualDeliverables) {
      setStoriesTotales(mesesAcordados);
      setFeedsTotales(mesesAcordados);
    }
  }, [mesesAcordados, isManualDeliverables]);

  // When theoretical months updates, suggest setting meses acordados if user hasn't modified it
  useEffect(() => {
    if (mesesTeoricos > 0 && mesesAcordados === 1) {
      setMesesAcordados(mesesTeoricos);
    }
  }, [mesesTeoricos]);

  // 5. Otros contenidos acordados
  const [otrosContenidos, setOtrosContenidos] = useState<{
    tiktok: boolean;
    youtube: boolean;
    facebook: boolean;
  }>({
    tiktok: false,
    youtube: false,
    facebook: false,
  });

  // 6. Impacto por país (% peso) - Validation: Sum must be exactly 100
  const [paisesImpacto, setPaisesImpacto] = useState<Array<{ pais_id: number; peso: number }>>([
    { pais_id: paisId, peso: 100 },
  ]);

  // Keep primary country as first impact row if list only has 1
  useEffect(() => {
    if (paisesImpacto.length === 1 && paisesImpacto[0].peso === 100) {
      setPaisesImpacto([{ pais_id: paisId, peso: 100 }]);
    }
  }, [paisId]);

  const sumaImpacto = useMemo(() => {
    return paisesImpacto.reduce((acc, curr) => acc + (Number(curr.peso) || 0), 0);
  }, [paisesImpacto]);

  const isImpactoValido = sumaImpacto === 100;

  const handleAddPaisImpacto = () => {
    const availablePais = paises.find((p) => !paisesImpacto.some((pi) => pi.pais_id === p.id));
    if (!availablePais) return;

    const remaining = Math.max(0, 100 - sumaImpacto);
    setPaisesImpacto([...paisesImpacto, { pais_id: availablePais.id, peso: remaining }]);
  };

  const handleRemovePaisImpacto = (index: number) => {
    if (paisesImpacto.length <= 1) return;
    setPaisesImpacto(paisesImpacto.filter((_, i) => i !== index));
  };

  const handleUpdatePaisImpacto = (index: number, field: 'pais_id' | 'peso', value: number) => {
    const next = [...paisesImpacto];
    next[index] = { ...next[index], [field]: value };
    setPaisesImpacto(next);
  };

  // 7. Tipo de envío (Domicilio / Tienda)
  const [tipoEnvio, setTipoEnvio] = useState<TipoEnvio>('domicilio');
  const [costoEnvioUsd, setCostoEnvioUsd] = useState<number | ''>('');
  const [cantidadEntregas, setCantidadEntregas] = useState<number>(1);
  const [fechaEntregaEstimada, setFechaEntregaEstimada] = useState('');
  const [cantidadRetiros, setCantidadRetiros] = useState<number>(1);
  const [fechaRetiroEstimada, setFechaRetiroEstimada] = useState('');

  // 8. Contrato Link & Archivo
  const [contratoLink, setContratoLink] = useState('');
  const [contratoArchivoUrl, setContratoArchivoUrl] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');

  // 9. Productos acordados
  const [productosAcordados, setProductosAcordados] = useState<Array<{ sku: string; cantidad: number }>>([
    { sku: productos[0]?.sku || '', cantidad: 1 },
  ]);

  const handleAddProducto = () => {
    const available = productos.find((p) => !productosAcordados.some((pa) => pa.sku === p.sku));
    setProductosAcordados([...productosAcordados, { sku: available?.sku || productos[0]?.sku || '', cantidad: 1 }]);
  };

  const handleRemoveProducto = (index: number) => {
    if (productosAcordados.length <= 1) return;
    setProductosAcordados(productosAcordados.filter((_, i) => i !== index));
  };

  const handleUpdateProducto = (index: number, sku: string, cantidad: number) => {
    const next = [...productosAcordados];
    next[index] = { sku, cantidad: Math.max(1, cantidad) };
    setProductosAcordados(next);
  };

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validations
    if (!influencer.trim()) {
      setErrorMsg('El nombre del influencer es obligatorio.');
      return;
    }
    if (numSeguidores <= 0) {
      setErrorMsg('Debe ingresar una cantidad válida de seguidores.');
      return;
    }
    if (numMontoUsd <= 0) {
      setErrorMsg('Debe ingresar un monto en USD mayor a cero.');
      return;
    }
    if (!isImpactoValido) {
      setErrorMsg(`La suma de % de impacto por país debe dar exactamente 100%. (Actualmente suma ${sumaImpacto}%)`);
      return;
    }
    if (productosAcordados.length === 0 || productosAcordados.some((p) => !p.sku || p.cantidad <= 0)) {
      setErrorMsg('Debe agregar al menos un producto con cantidad mayor a cero.');
      return;
    }

    try {
      setIsSubmitting(true);

      const otros: Array<'tiktok' | 'youtube' | 'facebook'> = [];
      if (otrosContenidos.tiktok) otros.push('tiktok');
      if (otrosContenidos.youtube) otros.push('youtube');
      if (otrosContenidos.facebook) otros.push('facebook');

      const acuerdoPayload: Omit<Acuerdo, 'id' | 'created_at'> = {
        solicitante_id: currentUser.id,
        responsable_id: responsableId,
        pais_id: paisId,
        influencer: influencer.trim(),
        seguidores: numSeguidores,
        link_instagram: linkInstagram.trim() || null,
        celular: celular.trim() || null,
        target,
        tipo_contrato_id: tipoContratoId,
        contrato_link: contratoLink.trim() || null,
        contrato_archivo_url: contratoArchivoUrl.trim() || null,
        monto_usd: numMontoUsd,
        tipo_envio: tipoEnvio,
        costo_envio_usd: tipoEnvio === 'domicilio' && costoEnvioUsd ? Number(costoEnvioUsd) : null,
        meses_teoricos: mesesTeoricos,
        meses_acordados: mesesAcordados,
        fecha_inicio: `${fechaInicio}-01`,
        fecha_fin: `${fechaFin}-01`,
        stories_totales: storiesTotales,
        feeds_totales: feedsTotales,
        cantidad_retiros: tipoEnvio === 'tienda' ? cantidadRetiros : null,
        fechas_retiro_estimadas: tipoEnvio === 'tienda' && fechaRetiroEstimada ? fechaRetiroEstimada : null,
        cantidad_entregas: tipoEnvio === 'domicilio' ? cantidadEntregas : null,
        fechas_entrega_estimadas: tipoEnvio === 'domicilio' && fechaEntregaEstimada ? fechaEntregaEstimada : null,
        paises_impacto: paisesImpacto.map((p) => ({ pais_id: p.pais_id, peso: p.peso })),
        productos: productosAcordados.map((p) => ({
          sku: p.sku,
          cantidad_acordada: p.cantidad,
          cantidad_restante: p.cantidad,
        })),
        otros_contenidos: otros,
      };

      await onSave(acuerdoPayload);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Error al guardar el acuerdo.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4A4F57] hover:text-[#1F2226] bg-white border border-[#E7E7EA] hover:bg-[#F4F4F6] px-3 py-1.5 rounded-xl shadow-2xs transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver a la lista
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FFF2ED] text-[#F15A24]">
            Formulario 1
          </span>
          <span className="text-xs font-semibold text-[#4A4F57]">
            Tabla <code className="font-mono text-[#1F2226]">acuerdos</code>
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Solicitante, Responsable y Datos del Influencer */}
        <div className="bg-white rounded-2xl border border-[#E7E7EA] shadow-2xs p-5 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E7E7EA]">
            <FileText className="w-4 h-4 text-[#F15A24]" />
            <h3 className="text-xs font-bold text-[#1F2226] uppercase tracking-wider">
              1. Solicitante, Responsable & Datos del Influencer
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Solicitante (Autocompletado, No editable) */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#8A8F98] tracking-wider mb-1">
                Solicitante (Tú)
              </label>
              <input
                type="text"
                disabled
                value={currentUser.nombre || currentUser.email}
                className="w-full text-xs px-3 py-2 bg-[#F4F4F6] text-[#4A4F57] border border-[#E7E7EA] rounded-xl font-medium cursor-not-allowed"
              />
              <span className="text-[10px] text-[#8A8F98] mt-0.5 block">
                Se autocompleta con el usuario logueado
              </span>
            </div>

            {/* Responsable */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#4A4F57] tracking-wider mb-1">
                Responsable del Acuerdo <span className="text-[#EF4444]">*</span>
              </label>
              <select
                value={responsableId}
                onChange={(e) => setResponsableId(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-[#E7E7EA] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
              >
                {usuariosHabilitados.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre || u.email} ({u.rol})
                  </option>
                ))}
              </select>
            </div>

            {/* País Principal */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#4A4F57] tracking-wider mb-1">
                País Principal <span className="text-[#EF4444]">*</span>
              </label>
              <select
                value={paisId}
                onChange={(e) => setPaisId(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 bg-white border border-[#E7E7EA] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
              >
                {paises.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
            {/* Influencer */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold uppercase text-[#4A4F57] tracking-wider mb-1">
                Nombre / Alias del Influencer <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Pampita Ardohain, Marley, etc."
                value={influencer}
                onChange={(e) => setInfluencer(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-[#E7E7EA] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
              />
            </div>

            {/* Seguidores */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#4A4F57] tracking-wider mb-1">
                Cantidad de Seguidores <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="Ej: 450000"
                value={seguidores}
                onChange={(e) => setSeguidores(e.target.value ? Number(e.target.value) : '')}
                className="w-full text-xs px-3 py-2 border border-[#E7E7EA] rounded-xl font-mono tabular-nums focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
              />
            </div>

            {/* Target */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#4A4F57] tracking-wider mb-1">
                Público Target Carestino
              </label>
              <div className="flex items-center gap-3 pt-1.5">
                <button
                  type="button"
                  onClick={() => setTarget(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    target
                      ? 'bg-[#10B981] text-white shadow-2xs'
                      : 'bg-[#F4F4F6] text-[#4A4F57] hover:bg-[#E7E7EA]'
                  }`}
                >
                  Sí (Target)
                </button>
                <button
                  type="button"
                  onClick={() => setTarget(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    !target
                      ? 'bg-[#EF4444] text-white shadow-2xs'
                      : 'bg-[#F4F4F6] text-[#4A4F57] hover:bg-[#E7E7EA]'
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#4A4F57] tracking-wider mb-1">
                Link de Instagram
              </label>
              <div className="relative">
                <Link2 className="w-3.5 h-3.5 text-[#8A8F98] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  placeholder="https://instagram.com/nombre"
                  value={linkInstagram}
                  onChange={(e) => setLinkInstagram(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2 border border-[#E7E7EA] rounded-xl font-mono focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#4A4F57] tracking-wider mb-1">
                Celular / WhatsApp
              </label>
              <input
                type="text"
                placeholder="+54 9 11 5544 3322"
                value={celular}
                onChange={(e) => setCelular(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-[#E7E7EA] rounded-xl font-mono focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#4A4F57] tracking-wider mb-1">
                Tipo de Contrato <span className="text-[#EF4444]">*</span>
              </label>
              <select
                value={tipoContratoId}
                onChange={(e) => setTipoContratoId(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 bg-white border border-[#E7E7EA] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
              >
                {tiposContrato.map((tc) => (
                  <option key={tc.id} value={tc.id}>
                    {tc.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Card 2: Monto y Cálculo Automático de Meses Teóricos */}
        <div className="bg-white rounded-2xl border border-[#E7E7EA] shadow-2xs p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E7E7EA]">
            <DollarSign className="w-4 h-4 text-[#F15A24]" />
            <h3 className="text-xs font-bold text-[#1F2226] uppercase tracking-wider">
              2. Monto del Contrato y Cálculo de Meses Teóricos
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#4A4F57] tracking-wider mb-1">
                Monto Total del Acuerdo (USD) <span className="text-[#EF4444]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8A8F98]">$</span>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="2000"
                  value={montoUsd}
                  onChange={(e) => setMontoUsd(e.target.value ? Number(e.target.value) : '')}
                  className="w-full text-xs pl-7 pr-3 py-2 border border-[#E7E7EA] rounded-xl font-mono tabular-nums text-base font-bold text-[#1F2226] focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
                />
              </div>
              <span className="text-[10px] text-[#8A8F98] mt-1 block">
                Carga manual en USD (aplica tanto a canje valorizado como a pago o mixto).
              </span>
            </div>

            {/* Calculation highlight box */}
            <div className="p-4 rounded-xl bg-[#FFF2ED] border border-[#FED7AA] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-[#F15A24] tracking-wider mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Meses Teóricos (Calculado Automáticamente)</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[#1F2226] tabular-nums">
                    {mesesTeoricos > 0 ? mesesTeoricos : '-'}
                  </span>
                  <span className="text-xs font-bold text-[#F15A24]">meses teóricos</span>
                </div>
              </div>

              <div className="text-[11px] text-[#4A4F57] mt-2 pt-2 border-t border-[#FED7AA]/60">
                {numSeguidores > 0 && numMontoUsd > 0 && theoreticalCalc.escalon ? (
                  <span>
                    Escalón: <strong>{theoreticalCalc.escalon.comentario}</strong> (${theoreticalCalc.usdMes} USD/mes).
                    <br />
                    Fórmula: <code className="font-mono">ceil({numMontoUsd} / {theoreticalCalc.usdMes}) = {mesesTeoricos} meses</code>.
                  </span>
                ) : (
                  <span className="text-[#8A8F98]">
                    Ingresá seguidores y monto en USD para calcular automáticamente.
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#E7E7EA]/60">
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#4A4F57] tracking-wider mb-1">
                Meses Acordados en Contrato (1 a 50) <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                max="50"
                value={mesesAcordados}
                onChange={(e) => setMesesAcordados(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 border border-[#E7E7EA] rounded-xl font-mono tabular-nums font-bold text-[#1F2226] focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
              />
              <span className="text-[10px] text-[#8A8F98] mt-0.5 block">
                Valor negociado final pactado con el influencer.
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#4A4F57] tracking-wider mb-1">
                Fecha Inicio (Mes y Año) <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="month"
                required
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-[#E7E7EA] rounded-xl font-mono focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#4A4F57] tracking-wider mb-1">
                Fecha Fin (Mes y Año) <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="month"
                required
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-[#E7E7EA] rounded-xl font-mono focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
              />
            </div>
          </div>

          {/* Stories & Feeds totales acordados */}
          <div className="bg-[#FBFBFC] p-4 rounded-xl border border-[#E7E7EA] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-[#1F2226]">
                  Entregables de Contenido Acordados
                </span>
                <p className="text-[11px] text-[#8A8F98]">
                  Por defecto son iguales a los meses acordados (1 por mes).
                </p>
              </div>

              {!isManualDeliverables ? (
                <button
                  type="button"
                  onClick={() => setIsManualDeliverables(true)}
                  className="text-xs font-semibold text-[#F15A24] hover:underline"
                >
                  ¿Deseas sobrescribir con un número distinto?
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsManualDeliverables(false);
                    setStoriesTotales(mesesAcordados);
                    setFeedsTotales(mesesAcordados);
                  }}
                  className="text-xs font-semibold text-[#8A8F98] hover:text-[#1F2226]"
                >
                  Volver al valor automático ({mesesAcordados}/mes)
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#4A4F57] tracking-wider mb-1">
                  Stories Totales Acordadas
                </label>
                <input
                  type="number"
                  min="0"
                  disabled={!isManualDeliverables}
                  value={storiesTotales}
                  onChange={(e) => setStoriesTotales(Number(e.target.value))}
                  className={`w-full text-xs px-3 py-2 border border-[#E7E7EA] rounded-xl font-mono tabular-nums font-bold ${
                    isManualDeliverables ? 'bg-white text-[#1F2226]' : 'bg-[#F4F4F6] text-[#4A4F57]'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#4A4F57] tracking-wider mb-1">
                  Feeds Totales Acordados
                </label>
                <input
                  type="number"
                  min="0"
                  disabled={!isManualDeliverables}
                  value={feedsTotales}
                  onChange={(e) => setFeedsTotales(Number(e.target.value))}
                  className={`w-full text-xs px-3 py-2 border border-[#E7E7EA] rounded-xl font-mono tabular-nums font-bold ${
                    isManualDeliverables ? 'bg-white text-[#1F2226]' : 'bg-[#F4F4F6] text-[#4A4F57]'
                  }`}
                />
              </div>
            </div>

            {/* Otros contenidos */}
            <div className="pt-2">
              <label className="block text-[11px] font-bold uppercase text-[#4A4F57] tracking-wider mb-1.5">
                Otros Contenidos Acordados
              </label>
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-xs font-semibold text-[#1F2226] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={otrosContenidos.tiktok}
                    onChange={(e) => setOtrosContenidos({ ...otrosContenidos, tiktok: e.target.checked })}
                    className="rounded text-[#F15A24] focus:ring-[#F15A24] border-[#E7E7EA]"
                  />
                  <span>TikTok</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-[#1F2226] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={otrosContenidos.youtube}
                    onChange={(e) => setOtrosContenidos({ ...otrosContenidos, youtube: e.target.checked })}
                    className="rounded text-[#F15A24] focus:ring-[#F15A24] border-[#E7E7EA]"
                  />
                  <span>YouTube</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-[#1F2226] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={otrosContenidos.facebook}
                    onChange={(e) => setOtrosContenidos({ ...otrosContenidos, facebook: e.target.checked })}
                    className="rounded text-[#F15A24] focus:ring-[#F15A24] border-[#E7E7EA]"
                  />
                  <span>Facebook</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: % Impacto por país (VALIDACIÓN CRÍTICA: SUMA EXACTA 100) */}
        <div className="bg-white rounded-2xl border border-[#E7E7EA] shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7E7EA]">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#F15A24]" />
              <h3 className="text-xs font-bold text-[#1F2226] uppercase tracking-wider">
                3. % Impacto por País (Suma obligatoria: 100%)
              </h3>
            </div>

            {/* Live validation indicator */}
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold ${
                isImpactoValido
                  ? 'bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0]'
                  : 'bg-[#FEF2F2] text-[#EF4444] border border-[#FECACA]'
              }`}
            >
              {isImpactoValido ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Suma 100% Válida</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4" />
                  <span>
                    Suma actual: {sumaImpacto}% ({sumaImpacto < 100 ? `Faltan ${100 - sumaImpacto}%` : `Excede ${sumaImpacto - 100}%`})
                  </span>
                </>
              )}
            </div>
          </div>

          <p className="text-xs text-[#4A4F57]">
            Definí en qué países tiene audiencia el influencer y con qué ponderación relativa. Esta proporción se utilizará para prorratear KPIs de Público, Alcance e Interacciones en el Dashboard.
          </p>

          <div className="space-y-3">
            {paisesImpacto.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#FBFBFC] border border-[#E7E7EA]"
              >
                <div className="flex-1">
                  <label className="block text-[10px] font-bold uppercase text-[#8A8F98] mb-1">
                    País #{idx + 1}
                  </label>
                  <select
                    value={item.pais_id}
                    onChange={(e) => handleUpdatePaisImpacto(idx, 'pais_id', Number(e.target.value))}
                    className="w-full text-xs px-3 py-1.5 bg-white border border-[#E7E7EA] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
                  >
                    {paises.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-32">
                  <label className="block text-[10px] font-bold uppercase text-[#8A8F98] mb-1">
                    % Impacto
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={item.peso}
                      onChange={(e) => handleUpdatePaisImpacto(idx, 'peso', Number(e.target.value))}
                      className="w-full text-xs pr-6 pl-3 py-1.5 bg-white border border-[#E7E7EA] rounded-lg font-mono tabular-nums font-bold text-[#1F2226] focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8A8F98]">%</span>
                  </div>
                </div>

                {paisesImpacto.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemovePaisImpacto(idx)}
                    className="mt-4 p-1.5 text-[#8A8F98] hover:text-[#EF4444] rounded-lg hover:bg-white transition"
                    title="Eliminar país"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddPaisImpacto}
            disabled={paisesImpacto.length >= paises.length}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F15A24] hover:text-[#D94815] transition disabled:opacity-40"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar otro país al desglose de impacto</span>
          </button>
        </div>

        {/* Card 4: Productos Acordados */}
        <div className="bg-white rounded-2xl border border-[#E7E7EA] shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7E7EA]">
            <h3 className="text-xs font-bold text-[#1F2226] uppercase tracking-wider">
              4. Productos Acordados (Catálogo SKU)
            </h3>
            <span className="text-[11px] text-[#8A8F98]">
              {productosAcordados.length} productos en el contrato
            </span>
          </div>

          <div className="space-y-3">
            {productosAcordados.map((item, idx) => {
              const selectedProd = productos.find((p) => p.sku === item.sku);
              return (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 rounded-xl bg-[#FBFBFC] border border-[#E7E7EA] items-center"
                >
                  <div className="sm:col-span-8">
                    <label className="block text-[10px] font-bold uppercase text-[#8A8F98] mb-1">
                      Producto (Buscar por SKU o por Nombre)
                    </label>
                    <ProductCombobox
                      products={productos}
                      selectedSku={item.sku}
                      onSelect={(prod) => handleUpdateProducto(idx, prod.sku, item.cantidad)}
                      placeholder="Escribe el SKU o nombre del producto (ej: CAR-COCH o Beverly)..."
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-bold uppercase text-[#8A8F98] mb-1">
                      Cantidad Acordada
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.cantidad}
                      onChange={(e) => handleUpdateProducto(idx, item.sku, Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 bg-white border border-[#E7E7EA] rounded-lg font-mono tabular-nums font-bold text-[#1F2226] focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
                    />
                  </div>

                  <div className="sm:col-span-1 flex justify-end">
                    {productosAcordados.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveProducto(idx)}
                        className="p-2 text-[#8A8F98] hover:text-[#EF4444] rounded-lg hover:bg-white transition"
                        title="Eliminar producto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleAddProducto}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F15A24] hover:text-[#D94815] transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar otro producto al contrato</span>
          </button>
        </div>

        {/* Card 5: Logística y Tipo de Envío */}
        <div className="bg-white rounded-2xl border border-[#E7E7EA] shadow-2xs p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E7E7EA]">
            <Truck className="w-4 h-4 text-[#F15A24]" />
            <h3 className="text-xs font-bold text-[#1F2226] uppercase tracking-wider">
              5. Logística y Tipo de Entrega
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setTipoEnvio('domicilio')}
              className={`flex-1 p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                tipoEnvio === 'domicilio'
                  ? 'bg-[#FFF2ED] border-[#F15A24] text-[#F15A24]'
                  : 'bg-white border-[#E7E7EA] text-[#4A4F57] hover:bg-[#F4F4F6]'
              }`}
            >
              <Truck className="w-5 h-5" />
              <div>
                <div className="text-xs font-bold">Envío a Domicilio</div>
                <div className="text-[11px] text-[#8A8F98]">Despacho por correo/flete al hogar del influencer</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTipoEnvio('tienda')}
              className={`flex-1 p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                tipoEnvio === 'tienda'
                  ? 'bg-[#FFF2ED] border-[#F15A24] text-[#F15A24]'
                  : 'bg-white border-[#E7E7EA] text-[#4A4F57] hover:bg-[#F4F4F6]'
              }`}
            >
              <Store className="w-5 h-5" />
              <div>
                <div className="text-xs font-bold">Retiro en Tienda Oficial</div>
                <div className="text-[11px] text-[#8A8F98]">El influencer retira en sucursal Carestino</div>
              </div>
            </button>
          </div>

          {/* Domicilio details */}
          {tipoEnvio === 'domicilio' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#4A4F57] tracking-wider mb-1">
                  Monto de Envío (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8A8F98]">$</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Ej: 50"
                    value={costoEnvioUsd}
                    onChange={(e) => setCostoEnvioUsd(e.target.value ? Number(e.target.value) : '')}
                    className="w-full text-xs pl-7 pr-3 py-2 border border-[#E7E7EA] rounded-xl font-mono tabular-nums focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#4A4F57] tracking-wider mb-1">
                  Cantidad de Entregas Acordadas
                </label>
                <input
                  type="number"
                  min="1"
                  value={cantidadEntregas}
                  onChange={(e) => setCantidadEntregas(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 border border-[#E7E7EA] rounded-xl font-mono tabular-nums focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#4A4F57] tracking-wider mb-1">
                  Fecha de Entrega Estimada
                </label>
                <input
                  type="date"
                  value={fechaEntregaEstimada}
                  onChange={(e) => setFechaEntregaEstimada(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-[#E7E7EA] rounded-xl font-mono focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
                />
              </div>
            </div>
          )}

          {/* Tienda details */}
          {tipoEnvio === 'tienda' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#4A4F57] tracking-wider mb-1">
                  Cantidad de Retiros Acordados
                </label>
                <input
                  type="number"
                  min="1"
                  value={cantidadRetiros}
                  onChange={(e) => setCantidadRetiros(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 border border-[#E7E7EA] rounded-xl font-mono tabular-nums focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#4A4F57] tracking-wider mb-1">
                  Fecha de Retiro Estimada
                </label>
                <input
                  type="date"
                  value={fechaRetiroEstimada}
                  onChange={(e) => setFechaRetiroEstimada(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-[#E7E7EA] rounded-xl font-mono focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Card 6: Contrato Digital y Adjuntos */}
        <div className="bg-white rounded-2xl border border-[#E7E7EA] shadow-2xs p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E7E7EA]">
            <Link2 className="w-4 h-4 text-[#F15A24]" />
            <h3 className="text-xs font-bold text-[#1F2226] uppercase tracking-wider">
              6. Documento de Contrato / Adjunto
            </h3>
          </div>

          <p className="text-xs text-[#4A4F57]">
            Podés ingresar un link a Google Drive / Dropbox, adjuntar un archivo PDF/imagen, o ambos.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#4A4F57] tracking-wider mb-1">
                Link de Contrato (Drive / Cloud)
              </label>
              <input
                type="url"
                placeholder="https://drive.google.com/carestino/contratos/..."
                value={contratoLink}
                onChange={(e) => setContratoLink(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-[#E7E7EA] rounded-xl font-mono focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#4A4F57] tracking-wider mb-1">
                Cargar Archivo de Contrato
              </label>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-[#E7E7EA] rounded-xl bg-[#FBFBFC] hover:bg-[#F4F4F6] text-xs font-semibold text-[#1F2226] transition">
                  <Upload className="w-4 h-4 text-[#F15A24]" />
                  <span>Seleccionar PDF / Imagen</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setUploadedFileName(file.name);
                        setContratoArchivoUrl(`https://storage.carestino.com/contratos/${encodeURIComponent(file.name)}`);
                      }
                    }}
                  />
                </label>
                {uploadedFileName && (
                  <span className="text-xs text-[#10B981] font-medium truncate">
                    ✓ {uploadedFileName}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] flex items-center gap-3 text-xs text-[#EF4444] font-semibold">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-xs font-semibold text-[#4A4F57] hover:bg-[#F4F4F6] rounded-xl transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !isImpactoValido}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#F15A24] hover:bg-[#D94815] rounded-xl shadow-2xs transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Guardando Acuerdo...' : 'Guardar Acuerdo (Generar ID)'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
