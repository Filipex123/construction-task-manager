'use client';
import { ChevronDown, Search, X } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';

export interface Option {
  id: number;
  name: string;
}

type Props = {
  options: Option[];
  value: Option[];
  onChange: (values: Option[]) => void;
  placeholder?: string;
};

export const MultiFilterSelect: React.FC<Props> = ({ options, value, onChange, placeholder = 'Selecionar...' }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() => {
    return options.filter((o) => o.name.toLowerCase().includes(search.toLowerCase()));
  }, [options, search]);

  const toggleOption = (option: Option) => {
    const exists = value.find((v) => v.id === option.id);
    if (exists) {
      onChange(value.filter((v) => v.id !== option.id));
    } else {
      onChange([...value, option]);
    }
  };

  const removeOption = (id: number) => {
    onChange(value.filter((v) => v.id !== id));
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
      <div onClick={() => setOpen((p) => !p)} className="min-h-[42px] w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 flex flex-wrap items-center gap-2 text-black/50">
        {value.length === 0 && <span className="text-black/40 text-md">{placeholder}</span>}

        {value.map((item) => (
          <span key={item.id} className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs">
            {item.name}
            <X
              className="w-3 h-3 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                removeOption(item.id);
              }}
            />
          </span>
        ))}

        <ChevronDown className="ml-auto h-4 w-4 text-gray-400" />
      </div>

      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-black/50"
              />
            </div>
          </div>

          <ul className="max-h-48 overflow-auto">
            {filteredOptions.length === 0 && <li className="px-3 py-2 text-sm text-gray-500">Nenhum resultado</li>}

            {filteredOptions.map((option) => {
              const selected = value.some((v) => v.id === option.id);
              return (
                <li
                  key={option.id}
                  onClick={() => toggleOption(option)}
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
