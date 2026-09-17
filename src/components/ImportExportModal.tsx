import { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  RefreshCw,
  Info,
  ArrowDownToLine,
  HelpCircle,
} from 'lucide-react';
import {
  ValidationListType,
  VALIDATION_CONFIGS,
  downloadTemplate,
  exportCurrentData,
  parseUploadedFile,
  ParseResult,
} from '../lib/excelService';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: ValidationListType;
  currentData: any[];
  onConfirmImport: (items: any[], mode: 'append' | 'replace') => Promise<void>;
}

export function ImportExportModal({
  isOpen,
  onClose,
  type,
  currentData,
  onConfirmImport,
}: ImportExportModalProps) {
  const config = VALIDATION_CONFIGS[type];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeAction, setActiveAction] = useState<'template' | 'import' | 'export'>('template');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen || !config) return null;

  const handleFileChange = async (file: File) => {
    setSelectedFile(file);
    setParseError(null);
    setParseResult(null);
    setImportSuccess(null);
    setIsParsing(true);

    try {
      const result = await parseUploadedFile(file, type);
      setParseResult(result);
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
      handleFileChange(file);
    }
  };

  const handleConfirm = async () => {
    if (!parseResult || parseResult.validRows.length === 0) return;
    setIsSubmitting(true);
    try {
      await onConfirmImport(parseResult.validRows, importMode);
      setImportSuccess(
        `¡Se importaron ${parseResult.validRows.length} registros con éxito en la lista de ${config.title}!`
      );
      setTimeout(() => {
        onClose();
        // Reset state
        setSelectedFile(null);
        setParseResult(null);
        setImportSuccess(null);
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar los registros importados.';
      setParseError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-[#E7E7EA] shadow-2xl max-w-2xl w-full p-6 animate-in fade-in zoom-in-95 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E7E7EA]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF2ED] text-[#F15A24] flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1F2226]">
                Importar & Descargar Modelo: {config.title}
              </h3>
              <p className="text-xs text-[#8A8F98] mt-0.5">
                Tabla: <code className="font-mono text-[#1F2226] font-semibold">{config.tableName}</code>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8A8F98] hover:text-[#1F2226] hover:bg-[#F4F4F6] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator / Navigation */}
        <div className="mt-4 flex items-center gap-2 p-1 bg-[#FBFBFC] border border-[#E7E7EA] rounded-xl text-xs">
          <button
            onClick={() => setActiveAction('template')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-bold transition ${
              activeAction === 'template'
                ? 'bg-white text-[#F15A24] shadow-2xs border border-[#E7E7EA]'
                : 'text-[#4A4F57] hover:text-[#1F2226]'
            }`}
          >
            <ArrowDownToLine className="w-3.5 h-3.5" />
            <span>1. Descargar Archivo Modelo</span>
          </button>

          <button
            onClick={() => setActiveAction('import')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-bold transition ${
              activeAction === 'import'
                ? 'bg-white text-[#F15A24] shadow-2xs border border-[#E7E7EA]'
                : 'text-[#4A4F57] hover:text-[#1F2226]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>2. Subir e Importar</span>
          </button>

          <button
            onClick={() => setActiveAction('export')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-semibold transition ${
              activeAction === 'export'
                ? 'bg-white text-[#F15A24] shadow-2xs border border-[#E7E7EA]'
                : 'text-[#8A8F98] hover:text-[#1F2226]'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar ({currentData.length})</span>
          </button>
        </div>

        {/* Action 1: Descargar Modelo */}
        {activeAction === 'template' && (
          <div className="mt-5 space-y-4">
            <div className="p-4 bg-[#FFF2ED]/50 border border-[#FED7AA] rounded-xl">
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-[#F15A24] mt-0.5 shrink-0" />
                <div className="text-xs text-[#1F2226]">
                  <span className="font-bold block text-xs">Paso previo recomendado antes de importar:</span>
                  <p className="text-[#4A4F57] mt-0.5 leading-relaxed">
                    Descargá este archivo modelo con la estructura de columnas exacta y ejemplos precargados. Completalo con tus datos y luego importalo en la pestaña siguiente.
                  </p>
                </div>
              </div>
            </div>

            {/* Columns schema explanation */}
            <div>
              <h4 className="text-xs font-bold text-[#1F2226] uppercase tracking-wider mb-2">
                Estructura de Columnas Requerida
              </h4>
              <div className="border border-[#E7E7EA] rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F4F4F6] text-[#8A8F98] text-[10px] uppercase font-bold border-b border-[#E7E7EA]">
                      <th className="py-2 px-3">Columna</th>
                      <th className="py-2 px-3">Requerida</th>
                      <th className="py-2 px-3">Descripción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E7EA]/50">
                    {config.columns.map((col) => (
                      <tr key={col.key} className="hover:bg-[#FBFBFC]">
                        <td className="py-2 px-3 font-mono font-bold text-[#1F2226]">
                          {col.label} <span className="text-[#8A8F98] font-normal">({col.key})</span>
                        </td>
                        <td className="py-2 px-3">
                          {col.required ? (
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF2F2] text-[#EF4444]">
                              Obligatoria
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-medium bg-[#F4F4F6] text-[#8A8F98]">
                              Opcional
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-[#4A4F57]">{col.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => downloadTemplate(type, 'xlsx')}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs rounded-xl shadow-2xs transition"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Descargar Modelo Excel (.xlsx)</span>
              </button>

              <button
                onClick={() => downloadTemplate(type, 'csv')}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#1F2226] hover:bg-black text-white font-bold text-xs rounded-xl shadow-2xs transition"
              >
                <FileText className="w-4 h-4" />
                <span>Descargar Modelo CSV (.csv)</span>
              </button>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => setActiveAction('import')}
                className="text-xs text-[#F15A24] font-bold hover:underline inline-flex items-center gap-1"
              >
                ¿Ya completaste el archivo? Ir al paso de importación &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Action 2: Subir e Importar */}
        {activeAction === 'import' && (
          <div className="mt-5 space-y-4">
            {/* Upload Area */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
                isDragging
                  ? 'border-[#F15A24] bg-[#FFF2ED]'
                  : 'border-[#E7E7EA] hover:border-[#F15A24] bg-[#FBFBFC]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />

              <div className="w-12 h-12 rounded-full bg-[#FFF2ED] text-[#F15A24] flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6" />
              </div>

              <span className="text-xs font-bold text-[#1F2226] block">
                {selectedFile ? selectedFile.name : 'Arrastrá tu archivo Excel o CSV aquí, o hacé clic para buscarlo'}
              </span>
              <p className="text-[11px] text-[#8A8F98] mt-1">
                Formatos soportados: <strong>.xlsx</strong>, <strong>.xls</strong> o <strong>.csv</strong>
              </p>
            </div>

            {/* Parsing spinner */}
            {isParsing && (
              <div className="p-4 rounded-xl bg-[#F4F4F6] text-xs text-[#4A4F57] flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-[#F15A24]" />
                <span>Analizando y validando estructura del archivo...</span>
              </div>
            )}

            {/* Parse Error */}
            {parseError && (
              <div className="p-3.5 bg-[#FEF2F2] border border-[#FECACA] rounded-xl flex items-start gap-2.5 text-xs text-[#EF4444]">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold block">Error al leer el archivo:</span>
                  <span className="mt-0.5 block">{parseError}</span>
                </div>
              </div>
            )}

            {/* Success notification */}
            {importSuccess && (
              <div className="p-3.5 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl flex items-center gap-2.5 text-xs text-[#065F46] font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>{importSuccess}</span>
              </div>
            )}

            {/* Parse Preview */}
            {parseResult && (
              <div className="space-y-4 pt-1">
                {/* Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-[#F4F4F6] border border-[#E7E7EA]">
                    <span className="text-[10px] uppercase font-bold text-[#8A8F98] block">Filas Leídas</span>
                    <span className="text-base font-bold text-[#1F2226] font-mono tabular-nums">{parseResult.totalRows}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0]">
                    <span className="text-[10px] uppercase font-bold text-[#065F46] block">Válidas para Importar</span>
                    <span className="text-base font-bold text-[#10B981] font-mono tabular-nums">{parseResult.validRows.length}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] col-span-2 sm:col-span-1">
                    <span className="text-[10px] uppercase font-bold text-[#991B1B] block">Con Observaciones</span>
                    <span className="text-base font-bold text-[#EF4444] font-mono tabular-nums">{parseResult.invalidRows.length}</span>
                  </div>
                </div>

                {/* Import Mode Selector */}
                <div className="p-3 bg-[#FBFBFC] border border-[#E7E7EA] rounded-xl text-xs space-y-2">
                  <span className="font-bold text-[#1F2226] block text-[11px] uppercase tracking-wider">
                    Modo de Inserción:
                  </span>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === 'append'}
                        onChange={() => setImportMode('append')}
                        className="text-[#F15A24] focus:ring-[#F15A24]"
                      />
                      <span>
                        <strong>Agregar y Actualizar (Upsert)</strong> — Conserva los datos existentes y actualiza coincidencias.
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === 'replace'}
                        onChange={() => setImportMode('replace')}
                        className="text-[#F15A24] focus:ring-[#F15A24]"
                      />
                      <span>
                        <strong>Reemplazar Todo</strong> — Sustituye toda la lista con el archivo nuevo.
                      </span>
                    </label>
                  </div>
                </div>

                {/* Data preview table */}
                <div>
                  <h5 className="text-[11px] font-bold text-[#1F2226] uppercase tracking-wider mb-1.5">
                    Vista previa de registros ({parseResult.validRows.length} filas):
                  </h5>
                  <div className="max-h-48 overflow-y-auto border border-[#E7E7EA] rounded-xl">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#F4F4F6] text-[#8A8F98] text-[10px] uppercase font-bold border-b border-[#E7E7EA] sticky top-0">
                          {config.columns.map((c) => (
                            <th key={c.key} className="py-2 px-3">{c.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E7E7EA]/50 font-mono text-[11px]">
                        {parseResult.validRows.slice(0, 15).map((row, idx) => (
                          <tr key={idx} className="hover:bg-[#FBFBFC]">
                            {config.columns.map((c) => (
                              <td key={c.key} className="py-1.5 px-3">
                                {String(row[c.key] !== undefined ? row[c.key] : '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {parseResult.validRows.length > 15 && (
                    <p className="text-[10px] text-[#8A8F98] text-right mt-1">
                      Mostrando primeros 15 registros de {parseResult.validRows.length}.
                    </p>
                  )}
                </div>

                {/* Confirm button */}
                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setParseResult(null);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-[#4A4F57] hover:bg-[#F4F4F6] rounded-xl transition"
                  >
                    Elegir otro archivo
                  </button>

                  <button
                    type="button"
                    disabled={parseResult.validRows.length === 0 || isSubmitting}
                    onClick={handleConfirm}
                    className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#F15A24] hover:bg-[#D94815] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-2xs transition"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {isSubmitting
                        ? 'Importando...'
                        : `Confirmar e Importar (${parseResult.validRows.length})`}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action 3: Exportar Datos Actuales */}
        {activeAction === 'export' && (
          <div className="mt-5 space-y-4">
            <div className="p-4 bg-[#FBFBFC] border border-[#E7E7EA] rounded-xl">
              <span className="font-bold text-xs text-[#1F2226] block">
                Descarga de Registros Actuales
              </span>
              <p className="text-xs text-[#4A4F57] mt-0.5">
                Tenés actualmente <strong>{currentData.length}</strong> registros en la lista de{' '}
                <strong>{config.title}</strong>. Podés exportarlos para editarlos masivamente en Excel o conservarlos como copia de seguridad.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => exportCurrentData(type, currentData, 'xlsx')}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs rounded-xl shadow-2xs transition"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Exportar a Excel (.xlsx)</span>
              </button>

              <button
                onClick={() => exportCurrentData(type, currentData, 'csv')}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#1F2226] hover:bg-black text-white font-bold text-xs rounded-xl shadow-2xs transition"
              >
                <FileText className="w-4 h-4" />
                <span>Exportar a CSV (.csv)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
