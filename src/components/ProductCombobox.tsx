import { useState, useRef, useEffect } from 'react';
import { Search, Check, ChevronDown, X, Package } from 'lucide-react';
import { Producto } from '../types';

interface ProductComboboxProps {
  products: Producto[];
  selectedSku: string;
  onSelect: (product: Producto) => void;
  placeholder?: string;
  filterBySkus?: string[];
  disabled?: boolean;
}

export function ProductCombobox({
  products,
  selectedSku,
  onSelect,
  placeholder = 'Escribe SKU o nombre del producto...',
  filterBySkus,
  disabled = false,
}: ProductComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Available products (optionally filtered by allowed SKUs)
  const availableProducts = filterBySkus
    ? products.filter((p) => filterBySkus.includes(p.sku))
    : products;

  // Find currently selected product
  const selectedProduct = products.find((p) => p.sku === selectedSku);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter products by search query (matches SKU, Nombre, or Categoria)
  const filteredProducts = availableProducts.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      p.sku.toLowerCase().includes(q) ||
      p.nombre.toLowerCase().includes(q) ||
      p.categoria.toLowerCase().includes(q)
    );
  });

  const handleSelectProduct = (prod: Producto) => {
    onSelect(prod);
    setSearchQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Combobox Trigger / Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8A8F98]">
          <Search className="w-3.5 h-3.5" />
        </div>

        <input
          type="text"
          disabled={disabled}
          placeholder={selectedProduct ? `[${selectedProduct.sku}] ${selectedProduct.nombre}` : placeholder}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className={`w-full text-xs pl-8 pr-16 py-2 bg-white border rounded-xl font-medium transition focus:outline-hidden focus:ring-2 focus:ring-[#F15A24] ${
            isOpen ? 'border-[#F15A24] ring-2 ring-[#F15A24]/20' : 'border-[#E7E7EA]'
          } ${disabled ? 'bg-[#F4F4F6] text-[#8A8F98] cursor-not-allowed' : 'text-[#1F2226]'}`}
        />

        <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="p-1 text-[#8A8F98] hover:text-[#1F2226] rounded-md"
            >
              <X className="w-3 h-3" />
            </button>
          )}

          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsOpen((prev) => !prev)}
            className="p-1 text-[#8A8F98] hover:text-[#1F2226] rounded-md transition"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Selected Product Badge below if not currently searching */}
      {selectedProduct && !isOpen && !searchQuery && (
        <div className="mt-1.5 flex items-center gap-2 text-[11px] text-[#4A4F57] bg-[#FBFBFC] px-2.5 py-1 rounded-lg border border-[#E7E7EA]">
          <Package className="w-3 h-3 text-[#F15A24]" />
          <span className="font-mono font-bold text-[#1F2226]">{selectedProduct.sku}</span>
          <span className="text-[#8A8F98]">•</span>
          <span className="font-medium text-[#1F2226] truncate">{selectedProduct.nombre}</span>
          <span className="text-[10px] uppercase font-bold text-[#8A8F98] bg-[#F4F4F6] px-1.5 py-0.2 rounded ml-auto">
            {selectedProduct.categoria}
          </span>
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-xl border border-[#E7E7EA] shadow-xl max-h-60 overflow-y-auto py-1">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#8A8F98] border-b border-[#E7E7EA] flex justify-between">
            <span>Resultados ({filteredProducts.length})</span>
            <span>Busca por SKU o Nombre</span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="p-4 text-center text-xs text-[#8A8F98]">
              No se encontraron productos coincidentes con "{searchQuery}".
            </div>
          ) : (
            filteredProducts.map((p) => {
              const isSelected = p.sku === selectedSku;
              return (
                <button
                  key={p.sku}
                  type="button"
                  onClick={() => handleSelectProduct(p)}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-[#FFF2ED] transition text-xs ${
                    isSelected ? 'bg-[#FFF2ED]/60 font-semibold' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="font-mono font-bold text-[#F15A24] bg-[#FFF2ED] px-1.5 py-0.5 rounded text-[11px] shrink-0 border border-[#FED7AA]">
                      {p.sku}
                    </span>
                    <span className="text-[#1F2226] truncate">{p.nombre}</span>
                    <span className="text-[10px] text-[#8A8F98] bg-[#F4F4F6] px-1.5 py-0.5 rounded shrink-0">
                      {p.categoria}
                    </span>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-[#F15A24] shrink-0 ml-2" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
