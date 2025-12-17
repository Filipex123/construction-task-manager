'use client';
import { ChevronDown } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';

export interface Option {
  id: number;
  name: string;
}

type Props = {
  options: Option[];
  value?: Option | null;
  onChange: (value: Option | null) => void;
  placeholder?: string;
  allowClear?: boolean;
};

export const SingleFilterSelect: React.FC<Props> = ({ options, value, onChange, placeholder = 'Selecionar...', allowClear = true }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() => {
    const filtered = options.filter((o) => o.name.toLowerCase().includes(search.toLowerCase()));
    filtered.sort((a, b) => a.name.localeCompare(b.name));
    return filtered;
  }, [options, search]);

  const handleSelect = (option: Option) => {
    onChange(option);
    setOpen(false);
    setSearch('');
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <div onClick={() => setOpen((p) => !p)} className="min-h-[42px] w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 flex items-center gap-2">
        {!value && <span className="text-black/40 text-sm">{placeholder}</span>}

        {value && <span className="text-sm text-gray-800 truncate">{value.name}</span>}

        <ChevronDown className="ml-auto h-4 w-4 text-gray-400" />
      </div>

      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
          <ul className="max-h-48 overflow-auto">
            {filteredOptions.length === 0 && <li className="px-3 py-2 text-sm text-gray-500">Nenhum resultado</li>}

            {filteredOptions.map((option) => {
              const selected = value?.id === option.id;
              return (
                <li
                  key={option.id}
                  onClick={() => handleSelect(option)}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${selected ? 'bg-blue-50 text-blue-700 font-medium' : 'text-black/50'}`}
                >
                  {option.name}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
