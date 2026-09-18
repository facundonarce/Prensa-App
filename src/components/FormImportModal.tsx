import { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  X,
  FileText,
  Loader2,
  HelpCircle,
  ArrowRight,
  Database,
  Tag,
  Check,
  RotateCcw,
} from 'lucide-react';
import {
  FormType,
  FORM_CONFIGS,
  downloadFormTemplate,
  parseFormFile,
  FormParseResult,
  ValidationContext,
} from '../lib/formsExcelService';

interface FormImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  formType: FormType;
  context: ValidationContext;
  onConfirmImport: (items: any[]) => Promise<void>;
}

export function FormImportModal({
  isOpen,
  onClose,
  formType,
  context,
  onConfirmImport,
}: FormImportModalProps) {
  const config = FORM_CONFIGS[formType];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'template' | 'upload'>('template');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<FormParseResult<any> | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen || !config) return null;

  const handleDownload = (format: 'xlsx' | 'csv') => {
    downloadFormTemplate(formType, format);
  };

  const handleProcessFile = async (file: File) => {
    setSelectedFile(file);
    setParseError(null);
    setParseResult(null);
    setSuccessMessage(null);
    setIsParsing(true);

    try {
      const result = await parseFormFile(file, formType, context);
      setParseResult(result);
      setActiveTab('upload');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al procesar el archivo.';
      setParseError(msg);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleProcessFile(file);
    }
  };

  const handleConfirm = async () => {
    if (!parseResult || parseResult.validItems.length === 0) return;
    setIsSubmitting(true);
    try {
      await onConfirmImport(parseResult.validItems);
      setSuccessMessage(
        `¡Se importaron ${parseResult.validItems.length} registros con éxito en ${config.title}!`
      );
      setTimeout(() => {
        onClose();
        // Reset state
        setSelectedFile(null);
        setParseResult(null);
        setSuccessMessage(null);
        setActiveTab('template');
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar los registros importados.';
      setParseError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setParseResult(null);
    setParseError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full p-6 sm:p-7 animate-in fade-in zoom-in-95 duration-150 my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF2ED] text-[#F15A24] flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900">
                  Importación de {config.title}
                </h3>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#FFF2ED] text-[#F15A24] px-2 py-0.5 rounded-md border border-[#FED7AA]">
                  {config.formNumber}
                </span>
              </div>
              <p className="text-xs text-slate-500">{config.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Navigation Tabs */}
        <div className="flex border-b border-slate-100 mt-4 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('template')}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'template'
                ? 'border-[#F15A24] text-[#F15A24]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Paso 1: Descargar Modelo & Referencias</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'upload'
                ? 'border-[#F15A24] text-[#F15A24]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Paso 2: Cargar e Importar Archivo</span>
            {parseResult && (
              <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-extrabold">
                {parseResult.validCount} listos
              </span>
            )}
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="overflow-y-auto flex-1 py-4 space-y-6">
          {/* TAB 1: DESCARGAR ARCHIVO MODELO */}
          {activeTab === 'template' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Instructions Banner */}
              <div className="bg-[#FFF2ED]/60 border border-[#FED7AA] rounded-2xl p-4 text-xs text-[#9A3412] flex items-start gap-3">
                <HelpCircle className="w-5 h-5 shrink-0 text-[#F15A24] mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-slate-900">
                    ¿Cómo funciona la importación masiva?
                  </p>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    1. Descarga el archivo modelo en formato <strong>Excel (.xlsx)</strong> o <strong>CSV (.csv)</strong>.<br />
                    2. Completa o copia tus registros respetando los nombres de las columnas. Las filas de ejemplo incluidas en la plantilla te servirán de guía.<br />
                    3. Ve a la pestaña <strong>"Paso 2: Cargar e Importar Archivo"</strong> para previsualizar y validar los datos antes de guardarlos.
                  </p>
                </div>
              </div>

              {/* Download Buttons Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Excel Option */}
                <div className="bg-white border-2 border-emerald-200 hover:border-emerald-500 rounded-2xl p-5 shadow-2xs hover:shadow-md transition group flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Plantilla en Excel (.xlsx)</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Recomendado. Incluye pestaña de datos de ejemplo formateados y hoja de instrucciones con tipos de datos.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownload('xlsx')}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar Modelo Excel (.xlsx)</span>
                  </button>
                </div>

                {/* CSV Option */}
                <div className="bg-white border-2 border-blue-200 hover:border-blue-500 rounded-2xl p-5 shadow-2xs hover:shadow-md transition group flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Plantilla en CSV (.csv)</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Formato liviano delimitado por comas con codificación UTF-8 para compatibilidad universal.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownload('csv')}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar Modelo CSV (.csv)</span>
                  </button>
                </div>
              </div>

              {/* Columns Table Specification */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                <div className="p-3.5 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-slate-700" />
                    <span className="text-xs font-bold text-slate-800">
                      Columnas requeridas en la plantilla ({config.columns.length} campos)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('upload')}
                    className="text-xs font-bold text-[#F15A24] hover:text-[#D94815] flex items-center gap-1 cursor-pointer"
                  >
                    <span>Ya tengo mi archivo listo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto max-h-60">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-slate-100 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Encabezado Columna</th>
                        <th className="py-2.5 px-3">Estado</th>
                        <th className="py-2.5 px-3">Descripción</th>
                        <th className="py-2.5 px-3">Ejemplo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/70 text-slate-700 bg-white">
                      {config.columns.map((col) => (
                        <tr key={col.key} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-semibold text-slate-900 whitespace-nowrap">
                            {col.label}
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap">
                            {col.required ? (
                              <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                                Obligatorio
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-slate-100 text-slate-600">
                                Opcional
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-slate-600 text-[11px]">{col.description}</td>
                          <td className="py-2 px-3 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                            {String(col.example)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Reference Values Guide */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#F15A24]" />
                  <h5 className="text-xs font-bold text-slate-900">
                    Valores de referencia cargados en el sistema
                  </h5>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-slate-600">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                    <span className="font-bold text-slate-800 block mb-1">Países disponibles:</span>
                    <span className="text-slate-600 leading-relaxed">
                      {context.paises.map((p) => p.nombre).join(', ') || 'Argentina, Colombia, Perú...'}
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                    <span className="font-bold text-slate-800 block mb-1">SKUs de Productos Carestino:</span>
                    <span className="text-slate-600 font-mono text-[10px] leading-relaxed">
                      {context.productos.slice(0, 6).map((p) => p.sku).join(', ')}...
                    </span>
                  </div>

                  {formType !== 'acuerdos' && context.acuerdos.length > 0 && (
                    <div className="sm:col-span-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                      <span className="font-bold text-slate-800 block mb-1">
                        Acuerdos Activos (puedes usar el ID o el nombre del Influencer):
                      </span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {context.acuerdos.slice(0, 10).map((a) => (
                          <span
                            key={a.id}
                            className="px-2 py-0.5 bg-white border border-slate-200 rounded-md font-mono text-[10px] text-slate-700"
                          >
                            #{a.id} - {a.influencer}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CARGAR E IMPORTAR */}
          {activeTab === 'upload' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Dropzone */}
              {!selectedFile && (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-3xl p-8 text-center transition cursor-pointer flex flex-col items-center justify-center gap-3 ${
                    isDragging
                      ? 'border-[#F15A24] bg-[#FFF2ED]'
                      : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleProcessFile(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-xs border border-slate-200 text-[#F15A24] flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800">
                      Arrastrá tu archivo Excel o CSV aquí, o hacé clic para seleccionarlo
                    </p>
                    <p className="text-xs text-slate-500">
                      Soporta formatos <strong>.xlsx</strong>, <strong>.xls</strong> y <strong>.csv</strong>
                    </p>
                  </div>
                  <button
                    type="button"
                    className="mt-2 px-4 py-2 bg-[#F15A24] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#D94815] transition pointer-events-none"
                  >
                    Seleccionar Archivo
                  </button>
                </div>
              )}

              {/* Parsing Spinner */}
              {isParsing && (
                <div className="p-8 text-center bg-slate-50 rounded-3xl border border-slate-200 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 text-[#F15A24] animate-spin" />
                  <p className="text-xs font-bold text-slate-700">
                    Procesando y validando filas del archivo...
                  </p>
                </div>
              )}

              {/* Parse Error */}
              {parseError && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-800">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">Error en la importación:</p>
                    <p>{parseError}</p>
                    <button
                      type="button"
                      onClick={resetUpload}
                      className="mt-2 text-xs font-bold text-rose-700 underline hover:text-rose-900"
                    >
                      Intentar con otro archivo
                    </button>
                  </div>
                </div>
              )}

              {/* Parse Results Preview */}
              {parseResult && !isParsing && (
                <div className="space-y-4">
                  {/* File status bar */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-emerald-600 flex items-center justify-center font-bold text-xs">
                        <FileSpreadsheet className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{selectedFile?.name}</p>
                        <p className="text-[10px] text-slate-500">
                          {parseResult.totalRows} filas detectadas en la hoja
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={resetUpload}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Cambiar archivo</span>
                      </button>
                    </div>
                  </div>

                  {/* Summary Metric Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                          Listos para Importar
                        </span>
                        <span className="text-lg font-black text-emerald-900 font-mono">
                          {parseResult.validCount}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`border rounded-2xl p-3.5 flex items-center gap-3 ${
                        parseResult.errorCount > 0
                          ? 'bg-rose-50 border-rose-200 text-rose-800'
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          parseResult.errorCount > 0
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider block">
                          Filas con Error
                        </span>
                        <span className="text-lg font-black font-mono">{parseResult.errorCount}</span>
                      </div>
                    </div>

                    <div className="col-span-2 sm:col-span-1 bg-blue-50 border border-blue-200 rounded-2xl p-3.5 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                        <Database className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
                          Destino
                        </span>
                        <span className="text-xs font-bold text-blue-900 truncate block">
                          {config.title}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Table of Rows */}
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                    <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-700">
                      <span className="font-bold">Vista previa de validación de filas</span>
                      <span className="text-[11px] text-slate-500">
                        Solo las filas válidas ({parseResult.validCount}) serán importadas.
                      </span>
                    </div>

                    <div className="overflow-x-auto max-h-72">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="sticky top-0 bg-slate-100 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3 w-16">Fila</th>
                            <th className="py-2.5 px-3 w-28">Estado</th>
                            <th className="py-2.5 px-3">Identificador / Registro</th>
                            <th className="py-2.5 px-3">Detalle / Validaciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-slate-700">
                          {parseResult.rows.map((row) => {
                            const raw = row.originalData;
                            let mainLabel = '';
                            if (formType === 'acuerdos') {
                              mainLabel = raw.influencer || raw.Influencer || `Fila #${row.rowIndex}`;
                            } else if (formType === 'pedidos') {
                              mainLabel = `Acuerdo: ${raw.acuerdo_id || raw['ID Acuerdo o Influencer'] || ''} - Fecha: ${raw.fecha || raw['Fecha Pedido'] || ''}`;
                            } else if (formType === 'reportes') {
                              mainLabel = `Acuerdo: ${raw.acuerdo_id || ''} - ${raw.medio || raw.Medio || ''} (${raw.tipo_publicacion || ''})`;
                            }

                            return (
                              <tr
                                key={row.rowIndex}
                                className={`hover:bg-slate-50/80 ${
                                  !row.isValid ? 'bg-rose-50/40' : ''
                                }`}
                              >
                                <td className="py-2 px-3 font-mono text-slate-400 font-bold">
                                  #{row.rowIndex}
                                </td>
                                <td className="py-2 px-3">
                                  {row.isValid ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                      <Check className="w-3 h-3" />
                                      <span>Válido</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-bold">
                                      <AlertCircle className="w-3 h-3" />
                                      <span>Error</span>
                                    </span>
                                  )}
                                </td>
                                <td className="py-2 px-3 font-semibold text-slate-900">
                                  {mainLabel}
                                </td>
                                <td className="py-2 px-3 text-[11px]">
                                  {row.errors.length > 0 && (
                                    <span className="text-rose-600 font-semibold block">
                                      {row.errors.join(' • ')}
                                    </span>
                                  )}
                                  {row.warnings.length > 0 && (
                                    <span className="text-amber-700 block text-[10px] mt-0.5">
                                      Nota: {row.warnings.join(' • ')}
                                    </span>
                                  )}
                                  {row.errors.length === 0 && row.warnings.length === 0 && (
                                    <span className="text-slate-500 text-[10px]">
                                      Datos completos y verificados correctamente.
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Action Confirmation Box */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs text-slate-600">
                      {parseResult.validCount > 0 ? (
                        <p>
                          Se crearán <strong>{parseResult.validCount} nuevos registros</strong> en{' '}
                          <strong>{config.title}</strong> vinculándose automáticamente a la base de datos.
                        </p>
                      ) : (
                        <p className="text-rose-600 font-semibold">
                          No hay filas válidas para importar en este archivo. Por favor verifica los errores señalados.
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={parseResult.validCount === 0 || isSubmitting}
                      onClick={handleConfirm}
                      className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#F15A24] hover:bg-[#D94815] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer shrink-0"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Importando {parseResult.validCount} registros...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>Importar {parseResult.validCount} Registros</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Success Message Banner */}
              {successMessage && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-800 font-bold animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Formato compatible:</span>
            <span>Excel (.xlsx, .xls) o CSV con separador de coma</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
