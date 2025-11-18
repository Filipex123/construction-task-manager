import React, { useEffect, useRef, useState } from 'react';

export interface Option {
  id: number;
  name: string;
}

type Props = {
  options: Option[];
  isLoading?: boolean;
  label?: string;
  value?: {
    id: number;
    name: string;
  };
  onChange: (newValue: { id: number; name: string } | null) => void;
};

export const TextWithSelect: React.FC<Props> = ({ label, value, options, isLoading = false, onChange }) => {
  const [filteredOptions, setFilteredOptions] = useState<Option[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (text: string) => {
    onChange({ id: 0, name: text });
    setFilteredOptions(options.filter((opt) => opt.name.toLowerCase().includes(text.toLowerCase())));
    setOpen(true);
  };

  const handleSelect = (option: Option) => {
    onChange({ id: option.id, name: option.name });
    setOpen(false);
  };

  useEffect(() => {
    setFilteredOptions(options);
  }, [options]);

  return (
    <div className="flex flex-col gap-2 w-full relative" ref={containerRef}>
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}

      <input
        type="text"
        className="bg-white text-black w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={isLoading ? `Carregando...` : `Digite ou selecione uma opção...`}
        value={value?.name || ''}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => {
          if (!isLoading) {
            setFilteredOptions(options); // MOSTRAR TODAS AS OPÇÕES AO FOCAR
            setOpen(true);
          }
        }}
        onBlur={() => {
          // Se o valor atual não corresponder a nenhuma opção válida, limpa
          const found = options.find((opt) => opt.name === value?.name);
          if (!found) onChange(null);
        }}
      />

      {open && filteredOptions.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-10 bg-white border border-gray-200 rounded-lg mt-1 w-full max-h-48 overflow-auto shadow-md">
          {filteredOptions.map((opt) => (
            <li key={opt.id} onClick={() => handleSelect(opt)} className="p-2 cursor-pointer hover:bg-blue-50 transition text-black">
              {opt.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
