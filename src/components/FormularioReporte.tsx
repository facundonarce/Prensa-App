import { useState, useMemo } from 'react';
import {
  BarChart2,
  Calendar,
  Link2,
  Image,
  Upload,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Share2,
  ThumbsUp,
  MessageCircle,
  Bookmark,
  Eye,
  Repeat,
  Package,
  Sparkles,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  Acuerdo,
  Medio,
  RedSocial,
  TipoPublicacion,
  Producto,
  Usuario,
  Reporte,
} from '../types';

interface FormularioReporteProps {
  acuerdos: Acuerdo[];
  medios: Medio[];
  redes: RedSocial[];
  tiposPub: TipoPublicacion[];
  productos: Producto[];
  usuarios: Usuario[];
  currentUser: Usuario;
  initialAcuerdoId?: number;
  reporteToEdit?: Reporte | null;
  onSaveReporte: (reporte: Omit<Reporte, 'id' | 'created_at'> & { id?: number }) => Promise<void>;
  onCancel: () => void;
}

interface ReporteProductoItem {
  sku: string;
  categoria: string;
}

export function FormularioReporte({
  acuerdos,
  medios,
  redes,
  tiposPub,
  productos,
  usuarios,
  currentUser,
  initialAcuerdoId,
  reporteToEdit,
  onSaveReporte,
  onCancel,
}: FormularioReporteProps) {
  // Select Agreement
  const [selectedAcuerdoId, setSelectedAcuerdoId] = useState<number>(
    reporteToEdit ? reporteToEdit.acuerdo_id : (initialAcuerdoId || (acuerdos.length > 0 ? acuerdos[0].id : 0))
  );

  const selectedAcuerdo = useMemo(() => {
    return acuerdos.find((a) => a.id === selectedAcuerdoId) || null;
  }, [acuerdos, selectedAcuerdoId]);

  const responsableName = useMemo(() => {
    if (!selectedAcuerdo) return '-';
    const u = usuarios.find((usr) => usr.id === selectedAcuerdo.responsable_id);
    return u ? u.nombre || u.email : 'Sin asignar';
  }, [usuarios, selectedAcuerdo]);

  // Form Basic Fields
  const [fecha, setFecha] = useState<string>(
    reporteToEdit ? reporteToEdit.fecha : new Date().toISOString().split('T')[0]
  );
  const [medioId, setMedioId] = useState<number>(() => {
    if (reporteToEdit) return reporteToEdit.medio_id;
    // Default to 'Red Social' if exists
    const redSocialMedio = medios.find((m) => m.nombre.toLowerCase().includes('social'));
    return redSocialMedio ? redSocialMedio.id : (medios.length > 0 ? medios[0].id : 1);
  });

  const selectedMedio = useMemo(() => {
    return medios.find((m) => m.id === medioId);
  }, [medios, medioId]);

  // Conditional flag: is it a Social Media post?
  const isRedSocial = useMemo(() => {
    if (!selectedMedio) return false;
    return selectedMedio.nombre.toLowerCase().includes('social');
  }, [selectedMedio]);

  // Social media fields (only if isRedSocial)
  const [redSocialId, setRedSocialId] = useState<number>(
    reporteToEdit?.red_social_id || (redes.length > 0 ? redes[0].id : 1)
  );
  const [tipoPubId, setTipoPubId] = useState<number>(
    reporteToEdit?.tipo_publicacion_id || (tiposPub.length > 0 ? tiposPub[0].id : 1)
  );

  // Engagement metrics (numeric manual input)
  const [meGusta, setMeGusta] = useState<number>(reporteToEdit?.me_gusta ?? 0);
  const [comentarios, setComentarios] = useState<number>(reporteToEdit?.comentarios ?? 0);
  const [compartidos, setCompartidos] = useState<number>(reporteToEdit?.compartidos ?? 0);
  const [guardados, setGuardados] = useState<number>(reporteToEdit?.guardados ?? 0);
  const [reposts, setReposts] = useState<number>(reporteToEdit?.reposts ?? 0);
  const [visualizaciones, setVisualizaciones] = useState<number>(reporteToEdit?.visualizaciones ?? 0);

  // Brand compliance questions (Yes / No)
  const [marcaVisible, setMarcaVisible] = useState<boolean>(reporteToEdit?.marca_visible ?? true);
  const [etiquetoCarestino, setEtiquetoCarestino] = useState<boolean>(reporteToEdit?.etiqueto_carestino ?? true);
  const [etiquetoCarestinoPais, setEtiquetoCarestinoPais] = useState<boolean>(reporteToEdit?.etiqueto_carestino_pais ?? true);
  const [etiquetoOtraPagina, setEtiquetoOtraPagina] = useState<boolean>(reporteToEdit?.etiqueto_otra_pagina ?? false);

  // Evidence fields
  const [link, setLink] = useState<string>(reporteToEdit?.link || '');
  const [capturaUrl, setCapturaUrl] = useState<string>(reporteToEdit?.captura_url || '');

  // Associated products from the agreement
  const [selectedProductos, setSelectedProductos] = useState<ReporteProductoItem[]>(() => {
    if (reporteToEdit?.productos && reporteToEdit.productos.length > 0) {
      return reporteToEdit.productos.map((p) => ({ sku: p.sku, categoria: p.categoria }));
    }
    if (selectedAcuerdo?.productos && selectedAcuerdo.productos.length > 0) {
      const firstSku = selectedAcuerdo.productos[0].sku;
      const prod = productos.find((p) => p.sku === firstSku);
      return [{ sku: firstSku, categoria: prod ? prod.categoria : 'General' }];
    }
    return [];
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // When agreement changes, update available products
  const handleAcuerdoChange = (newAcuerdoId: number) => {
    setSelectedAcuerdoId(newAcuerdoId);
    const newAcuerdo = acuerdos.find((a) => a.id === newAcuerdoId);
    if (newAcuerdo?.productos && newAcuerdo.productos.length > 0) {
      const firstSku = newAcuerdo.productos[0].sku;
      const prod = productos.find((p) => p.sku === firstSku);
      setSelectedProductos([{ sku: firstSku, categoria: prod ? prod.categoria : 'General' }]);
    } else {
      setSelectedProductos([]);
    }
    setErrorMsg(null);
  };

  const handleAddProductoRow = () => {
    if (!selectedAcuerdo?.productos || selectedAcuerdo.productos.length === 0) return;
    const unused = selectedAcuerdo.productos.find(
      (ap) => !selectedProductos.some((sp) => sp.sku === ap.sku)
    );
    const nextSku = unused ? unused.sku : selectedAcuerdo.productos[0].sku;
    const prod = productos.find((p) => p.sku === nextSku);
    setSelectedProductos([
      ...selectedProductos,
      { sku: nextSku, categoria: prod ? prod.categoria : 'General' },
    ]);
  };

  const handleUpdateProductoRow = (index: number, sku: string) => {
    const prod = productos.find((p) => p.sku === sku);
    const updated = [...selectedProductos];
    updated[index] = {
      sku,
      categoria: prod ? prod.categoria : 'General',
    };
    setSelectedProductos(updated);
  };

  const handleRemoveProductoRow = (index: number) => {
    if (selectedProductos.length <= 1) return;
    setSelectedProductos(selectedProductos.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAcuerdo) {
      setErrorMsg('Debes seleccionar un acuerdo de prensa.');
      return;
    }

    if (selectedProductos.length === 0) {
      setErrorMsg('Debes seleccionar al menos un producto asociado a la publicación.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSaveReporte({
        ...(reporteToEdit ? { id: reporteToEdit.id } : {}),
        acuerdo_id: selectedAcuerdo.id,
        medio_id: medioId,
        red_social_id: isRedSocial ? redSocialId : null,
        tipo_publicacion_id: isRedSocial ? tipoPubId : null,
        link: link.trim() || null,
        captura_url: capturaUrl.trim() || null,
        fecha,
        me_gusta: isRedSocial ? meGusta : null,
        comentarios: isRedSocial ? comentarios : null,
        compartidos: isRedSocial ? compartidos : null,
        guardados: isRedSocial ? guardados : null,
        reposts: isRedSocial ? reposts : null,
        visualizaciones: isRedSocial ? visualizaciones : null,
        marca_visible: isRedSocial ? marcaVisible : null,
        etiqueto_carestino: isRedSocial ? etiquetoCarestino : null,
        etiqueto_carestino_pais: isRedSocial ? etiquetoCarestinoPais : null,
        etiqueto_otra_pagina: isRedSocial ? etiquetoOtraPagina : null,
        created_by: reporteToEdit ? (reporteToEdit.created_by || currentUser.id) : currentUser.id,
        productos: selectedProductos.map((p) => ({
          sku: p.sku,
          categoria: p.categoria,
        })),
      });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error al guardar el reporte de contenido.');
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
            title="Volver a lista de reportes"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FFF2ED] text-[#F15A24] px-2 py-0.5 rounded border border-[#FED7AA]">
                Formulario 3
              </span>
              <h1 className="text-base font-bold text-[#1F2226]">
                {reporteToEdit ? `Modificar Reporte #${reporteToEdit.id}` : 'Nuevo Reporte de Contenido'}
              </h1>
            </div>
            <p className="text-xs text-[#4A4F57] mt-0.5">
              {reporteToEdit
                ? `Editando reporte #${reporteToEdit.id} del acuerdo con ${selectedAcuerdo?.influencer || ''}`
                : 'Registro de publicaciones, links, capturas y métricas de engagement con visualización condicional.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-[#4A4F57] bg-white border border-[#E7E7EA] rounded-xl hover:bg-[#F4F4F6] transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#F15A24] hover:bg-[#D94815] rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <BarChart2 className="w-4 h-4" />
            <span>
              {isSubmitting
                ? 'Guardando...'
                : reporteToEdit
                ? 'Guardar Modificaciones'
                : 'Guardar Reporte'}
            </span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-[#EF4444]">Atención</h4>
            <p className="text-xs text-[#991B1B] mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Card 1: Acuerdo y Autocompletado */}
      <div className="bg-white rounded-2xl border border-[#E7E7EA] shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E7EA]">
          <h2 className="text-xs font-bold text-[#1F2226] uppercase tracking-wider">
            1. Selección de Acuerdo
          </h2>
          <span className="text-[11px] text-[#8A8F98]">
            Autocompleta Responsable, País e Influencer
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
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
                  #{ac.id} — {ac.influencer} ({ac.pais?.nombre || 'País #' + ac.pais_id}) — {ac.seguidores.toLocaleString()} seguidores
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-[#4A4F57] tracking-wider mb-1.5">
              Fecha de la Publicación *
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

        {/* Autocompleted Summary Card */}
        {selectedAcuerdo && (
          <div className="p-4 rounded-xl bg-[#FBFBFC] border border-[#E7E7EA] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase text-[#8A8F98] block">ID Acuerdo</span>
              <span className="font-mono font-bold text-[#F15A24]">#{selectedAcuerdo.id}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-[#8A8F98] block">Responsable</span>
              <span className="font-semibold text-[#1F2226]">{responsableName}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-[#8A8F98] block">País</span>
              <span className="font-semibold text-[#1F2226]">{selectedAcuerdo.pais?.nombre || 'ID ' + selectedAcuerdo.pais_id}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-[#8A8F98] block">Influencer</span>
              <span className="font-semibold text-[#1F2226]">{selectedAcuerdo.influencer}</span>
            </div>
          </div>
        )}
      </div>

      {/* Card 2: Medio y Condicionalidad */}
      <div className="bg-white rounded-2xl border border-[#E7E7EA] shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E7EA]">
          <h2 className="text-xs font-bold text-[#1F2226] uppercase tracking-wider">
            2. Medio de Comunicación
          </h2>
          <span className="text-[11px] text-[#8A8F98]">
            Condiciona los campos visibles de Red Social e Interacciones
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase text-[#4A4F57] tracking-wider mb-1.5">
              Medio *
            </label>
            <select
              value={medioId}
              onChange={(e) => setMedioId(Number(e.target.value))}
              className="w-full text-xs px-3.5 py-2.5 bg-white border border-[#E7E7EA] rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
            >
              {medios.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <div
              className={`p-3 rounded-xl border text-xs w-full ${
                isRedSocial
                  ? 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]'
                  : 'bg-[#F4F4F6] text-[#4A4F57] border-[#E7E7EA]'
              }`}
            >
              <span className="font-bold block">
                {isRedSocial ? '✓ Modo Red Social Activo' : 'ℹ Modo Medio Tradicional (Radio / TV / Prensa)'}
              </span>
              <span className="text-[11px]">
                {isRedSocial
                  ? 'Se habilitan los campos de red social, tipo de publicación, métricas de engagement y validación de marca.'
                  : 'Campos de red social e interacciones ocultos por no aplicar a este tipo de medio.'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: CONDITIONAL — Red Social e Interacciones (Only if isRedSocial) */}
      {isRedSocial && (
        <div className="bg-white rounded-2xl border border-[#E7E7EA] shadow-2xs p-5 space-y-5 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7E7EA]">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-[#F15A24]" />
              <h2 className="text-xs font-bold text-[#1F2226] uppercase tracking-wider">
                3. Red Social y Tipo de Publicación
              </h2>
            </div>
            <span className="text-[11px] font-bold text-[#F15A24] bg-[#FFF2ED] px-2 py-0.5 rounded border border-[#FED7AA]">
              Campos Condicionales
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#4A4F57] tracking-wider mb-1.5">
                Red Social *
              </label>
              <select
                value={redSocialId}
                onChange={(e) => setRedSocialId(Number(e.target.value))}
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-[#E7E7EA] rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
              >
                {redes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#4A4F57] tracking-wider mb-1.5">
                Tipo de Publicación *
              </label>
              <select
                value={tipoPubId}
                onChange={(e) => setTipoPubId(Number(e.target.value))}
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-[#E7E7EA] rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
              >
                {tiposPub.map((tp) => (
                  <option key={tp.id} value={tp.id}>
                    {tp.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Interacciones / Engagement */}
          <div className="pt-2">
            <h3 className="text-xs font-bold text-[#1F2226] uppercase tracking-wider mb-3">
              Métricas de Interacción (Carga Manual)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <div>
                <label className="flex items-center gap-1 text-[10px] font-bold uppercase text-[#8A8F98] mb-1">
                  <ThumbsUp className="w-3 h-3 text-[#3B82F6]" /> Me gusta
                </label>
                <input
                  type="number"
                  min="0"
                  value={meGusta}
                  onChange={(e) => setMeGusta(Number(e.target.value))}
                  className="w-full text-xs px-2.5 py-2 bg-white border border-[#E7E7EA] rounded-xl font-mono tabular-nums font-bold text-[#1F2226] focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
                />
              </div>

              <div>
                <label className="flex items-center gap-1 text-[10px] font-bold uppercase text-[#8A8F98] mb-1">
                  <MessageCircle className="w-3 h-3 text-[#10B981]" /> Comentarios
                </label>
                <input
                  type="number"
                  min="0"
                  value={comentarios}
                  onChange={(e) => setComentarios(Number(e.target.value))}
                  className="w-full text-xs px-2.5 py-2 bg-white border border-[#E7E7EA] rounded-xl font-mono tabular-nums font-bold text-[#1F2226] focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
                />
              </div>

              <div>
                <label className="flex items-center gap-1 text-[10px] font-bold uppercase text-[#8A8F98] mb-1">
                  <Share2 className="w-3 h-3 text-[#8B5CF6]" /> Compartidos
                </label>
                <input
                  type="number"
                  min="0"
                  value={compartidos}
                  onChange={(e) => setCompartidos(Number(e.target.value))}
                  className="w-full text-xs px-2.5 py-2 bg-white border border-[#E7E7EA] rounded-xl font-mono tabular-nums font-bold text-[#1F2226] focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
                />
              </div>

              <div>
                <label className="flex items-center gap-1 text-[10px] font-bold uppercase text-[#8A8F98] mb-1">
                  <Bookmark className="w-3 h-3 text-[#F59E0B]" /> Guardados
                </label>
                <input
                  type="number"
                  min="0"
                  value={guardados}
                  onChange={(e) => setGuardados(Number(e.target.value))}
                  className="w-full text-xs px-2.5 py-2 bg-white border border-[#E7E7EA] rounded-xl font-mono tabular-nums font-bold text-[#1F2226] focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
                />
              </div>

              <div>
                <label className="flex items-center gap-1 text-[10px] font-bold uppercase text-[#8A8F98] mb-1">
                  <Repeat className="w-3 h-3 text-[#EC4899]" /> Reposts
                </label>
                <input
                  type="number"
                  min="0"
                  value={reposts}
                  onChange={(e) => setReposts(Number(e.target.value))}
                  className="w-full text-xs px-2.5 py-2 bg-white border border-[#E7E7EA] rounded-xl font-mono tabular-nums font-bold text-[#1F2226] focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
                />
              </div>

              <div>
                <label className="flex items-center gap-1 text-[10px] font-bold uppercase text-[#8A8F98] mb-1">
                  <Eye className="w-3 h-3 text-[#06B6D4]" /> Views
                </label>
                <input
                  type="number"
                  min="0"
                  value={visualizaciones}
                  onChange={(e) => setVisualizaciones(Number(e.target.value))}
                  className="w-full text-xs px-2.5 py-2 bg-white border border-[#E7E7EA] rounded-xl font-mono tabular-nums font-bold text-[#1F2226] focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
                />
              </div>
            </div>
          </div>

          {/* Validación de Marca / Preguntas Sí/No */}
          <div className="pt-2 border-t border-[#E7E7EA]">
            <h3 className="text-xs font-bold text-[#1F2226] uppercase tracking-wider mb-3">
              Preguntas de Validación de Marca Carestino
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Q1 */}
              <div className="p-3 rounded-xl bg-[#FBFBFC] border border-[#E7E7EA] flex items-center justify-between">
                <span className="text-xs font-medium text-[#1F2226]">
                  ¿Es visible la marca en el feed?
                </span>
                <div className="flex items-center gap-1 bg-[#F4F4F6] p-0.5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setMarcaVisible(true)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                      marcaVisible ? 'bg-white text-[#10B981] shadow-2xs' : 'text-[#8A8F98]'
                    }`}
                  >
                    Sí
                  </button>
                  <button
                    type="button"
                    onClick={() => setMarcaVisible(false)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                      !marcaVisible ? 'bg-white text-[#EF4444] shadow-2xs' : 'text-[#8A8F98]'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {/* Q2 */}
              <div className="p-3 rounded-xl bg-[#FBFBFC] border border-[#E7E7EA] flex items-center justify-between">
                <span className="text-xs font-medium text-[#1F2226]">
                  ¿Etiquetó a Carestino oficial (@carestino)?
                </span>
                <div className="flex items-center gap-1 bg-[#F4F4F6] p-0.5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setEtiquetoCarestino(true)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                      etiquetoCarestino ? 'bg-white text-[#10B981] shadow-2xs' : 'text-[#8A8F98]'
                    }`}
                  >
                    Sí
                  </button>
                  <button
                    type="button"
                    onClick={() => setEtiquetoCarestino(false)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                      !etiquetoCarestino ? 'bg-white text-[#EF4444] shadow-2xs' : 'text-[#8A8F98]'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {/* Q3 */}
              <div className="p-3 rounded-xl bg-[#FBFBFC] border border-[#E7E7EA] flex items-center justify-between">
                <span className="text-xs font-medium text-[#1F2226]">
                  ¿Etiquetó a Carestino del país (@carestino.ar/co/pe)?
                </span>
                <div className="flex items-center gap-1 bg-[#F4F4F6] p-0.5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setEtiquetoCarestinoPais(true)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                      etiquetoCarestinoPais ? 'bg-white text-[#10B981] shadow-2xs' : 'text-[#8A8F98]'
                    }`}
                  >
                    Sí
                  </button>
                  <button
                    type="button"
                    onClick={() => setEtiquetoCarestinoPais(false)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                      !etiquetoCarestinoPais ? 'bg-white text-[#EF4444] shadow-2xs' : 'text-[#8A8F98]'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {/* Q4 */}
              <div className="p-3 rounded-xl bg-[#FBFBFC] border border-[#E7E7EA] flex items-center justify-between">
                <span className="text-xs font-medium text-[#1F2226]">
                  ¿Etiquetó otra página oficial de Carestino?
                </span>
                <div className="flex items-center gap-1 bg-[#F4F4F6] p-0.5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setEtiquetoOtraPagina(true)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                      etiquetoOtraPagina ? 'bg-white text-[#10B981] shadow-2xs' : 'text-[#8A8F98]'
                    }`}
                  >
                    Sí
                  </button>
                  <button
                    type="button"
                    onClick={() => setEtiquetoOtraPagina(false)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                      !etiquetoOtraPagina ? 'bg-white text-[#EF4444] shadow-2xs' : 'text-[#8A8F98]'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card 4: Links y Capturas (Siempre visible) */}
      <div className="bg-white rounded-2xl border border-[#E7E7EA] shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E7EA]">
          <h2 className="text-xs font-bold text-[#1F2226] uppercase tracking-wider">
            4. Evidencia y Enlaces (Aplica a cualquier medio)
          </h2>
          <span className="text-[11px] text-[#8A8F98]">
            URL de publicación y captura de pantalla
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase text-[#4A4F57] tracking-wider mb-1.5">
              Link de la Publicación o Nota
            </label>
            <div className="relative">
              <input
                type="url"
                placeholder="https://instagram.com/reel/... o link a noticia"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2.5 bg-white border border-[#E7E7EA] rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
              />
              <Link2 className="w-3.5 h-3.5 text-[#8A8F98] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-[#4A4F57] tracking-wider mb-1.5">
              URL de la Captura de Pantalla / Imagen
            </label>
            <div className="relative">
              <input
                type="url"
                placeholder="https://... URL de la captura o subida de imagen"
                value={capturaUrl}
                onChange={(e) => setCapturaUrl(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2.5 bg-white border border-[#E7E7EA] rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
              />
              <Image className="w-3.5 h-3.5 text-[#8A8F98] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Image Preview if provided */}
        {capturaUrl && (
          <div className="p-3 bg-[#FBFBFC] rounded-xl border border-[#E7E7EA] flex items-center gap-4">
            <img
              src={capturaUrl}
              alt="Vista previa captura"
              referrerPolicy="no-referrer"
              className="w-20 h-20 object-cover rounded-lg border border-[#E7E7EA] shrink-0"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="text-xs">
              <span className="font-bold text-[#1F2226] block">Vista previa de la captura adjunta</span>
              <a
                href={capturaUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#F15A24] hover:underline text-[11px] font-semibold break-all"
              >
                Abrir enlace original en nueva pestaña ↗
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Card 5: Productos Asociados y Categoría */}
      <div className="bg-white rounded-2xl border border-[#E7E7EA] shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E7EA]">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[#F15A24]" />
            <h2 className="text-xs font-bold text-[#1F2226] uppercase tracking-wider">
              5. Productos Mostrados en el Contenido
            </h2>
          </div>
          <span className="text-[11px] text-[#8A8F98]">
            Categoría autocompletada por producto individual
          </span>
        </div>

        <p className="text-xs text-[#4A4F57]">
          Seleccioná los productos que aparecen en esta publicación. La categoría se autocompleta individualmente para cada producto según el catálogo.
        </p>

        <div className="space-y-3">
          {selectedProductos.map((item, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 rounded-xl bg-[#FBFBFC] border border-[#E7E7EA] items-center"
            >
              <div className="sm:col-span-7">
                <label className="block text-[10px] font-bold uppercase text-[#8A8F98] mb-1">
                  Producto
                </label>
                <select
                  value={item.sku}
                  onChange={(e) => handleUpdateProductoRow(idx, e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-[#E7E7EA] rounded-lg font-medium focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]"
                >
                  {selectedAcuerdo?.productos && selectedAcuerdo.productos.length > 0 ? (
                    selectedAcuerdo.productos.map((ap) => {
                      const pr = productos.find((p) => p.sku === ap.sku);
                      return (
                        <option key={ap.sku} value={ap.sku}>
                          [{ap.sku}] {pr ? pr.nombre : ap.sku}
                        </option>
                      );
                    })
                  ) : (
                    productos.map((pr) => (
                      <option key={pr.sku} value={pr.sku}>
                        [{pr.sku}] {pr.nombre}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="sm:col-span-4">
                <label className="block text-[10px] font-bold uppercase text-[#8A8F98] mb-1">
                  Categoría Autocompletada
                </label>
                <div className="px-3 py-2 bg-[#F4F4F6] border border-[#E7E7EA] rounded-lg text-xs font-bold text-[#1F2226]">
                  {item.categoria}
                </div>
              </div>

              <div className="sm:col-span-1 flex justify-end">
                {selectedProductos.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveProductoRow(idx)}
                    className="p-2 text-[#8A8F98] hover:text-[#EF4444] rounded-lg hover:bg-white transition"
                    title="Eliminar producto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {selectedAcuerdo?.productos && selectedProductos.length < selectedAcuerdo.productos.length && (
          <button
            type="button"
            onClick={handleAddProductoRow}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F15A24] hover:text-[#D94815] transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar otro producto mostrado en la publicación</span>
          </button>
        )}
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
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#F15A24] hover:bg-[#D94815] rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer"
        >
          <BarChart2 className="w-4 h-4" />
          <span>
            {isSubmitting
              ? 'Guardando...'
              : reporteToEdit
              ? 'Guardar Modificaciones del Reporte'
              : 'Guardar Reporte de Contenido'}
          </span>
        </button>
      </div>
    </form>
  );
}
