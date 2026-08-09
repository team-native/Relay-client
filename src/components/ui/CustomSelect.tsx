import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CustomSelectProps {
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export default function CustomSelect({ options, value, onChange, placeholder }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(option: string) {
    onChange(option);
    setIsOpen(false);
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full h-11 flex items-center justify-between border rounded-lg px-4 text-left bg-white focus:outline-none transition-colors ${
          isOpen ? 'border-amber-400 ring-1 ring-amber-400' : 'border-gray-200'
        }`}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>
          {value || placeholder}
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
        )}
      </button>

      {isOpen && (
        <ul className="absolute z-10 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto shadow-lg">
          {options.map((option) => (
            <li key={option}>
              <button
                type="button"
                onClick={() => handleSelect(option)}
                className="w-full h-11 flex items-center px-4 text-left text-sm text-black hover:bg-[#FFDD86]/30"
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}