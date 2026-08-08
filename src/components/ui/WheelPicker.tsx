import { useEffect, useRef } from 'react';

const ITEM_HEIGHT = 32;
const VISIBLE_COUNT = 5;
const PAD_COUNT = (VISIBLE_COUNT - 1) / 2;
const SCROLL_END_DELAY = 160;

export interface WheelOption {
  value: number;
  label: string;
}

function getNearestIndex(options: WheelOption[], value: number): number {
  let nearest = 0;

  for (let index = 1; index < options.length; index += 1) {
    if (options[index].value === value) return index;
    if (Math.abs(options[index].value - value) < Math.abs(options[nearest].value - value)) {
      nearest = index;
    }
  }

  return nearest;
}

export function WheelPickerGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 bg-[#FFF3D1]"
        style={{ height: ITEM_HEIGHT }}
      />
      <div className="relative flex flex-1 divide-x divide-gray-100">{children}</div>
    </div>
  );
}

interface WheelPickerProps {
  options: WheelOption[];
  value: number;
  onChange: (value: number) => void;
  label: string;
}

export function WheelPicker({ options, value, onChange, label }: WheelPickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isUserScrollingRef = useRef(false);
  const scrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeIndex = getNearestIndex(options, value);

  useEffect(() => {
    const option = options[activeIndex];
    if (option && option.value !== value) onChange(option.value);
  }, [options, activeIndex, value, onChange]);

  // 값이 밖에서 바뀌면 선택된 항목을 가운데로 맞춰줘요.
  // 사용자가 굴리는 중에는 스크롤을 건드리지 않아요.
  useEffect(() => {
    if (isUserScrollingRef.current) return;
    scrollRef.current?.scrollTo({ top: activeIndex * ITEM_HEIGHT });
  }, [activeIndex]);

  useEffect(() => {
    return () => {
      if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current);
    };
  }, []);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;

    isUserScrollingRef.current = true;
    if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current);
    scrollEndTimerRef.current = setTimeout(() => {
      isUserScrollingRef.current = false;
    }, SCROLL_END_DELAY);

    const index = Math.round(el.scrollTop / ITEM_HEIGHT);
    const option = options[Math.min(options.length - 1, Math.max(0, index))];
    if (option && option.value !== value) onChange(option.value);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;

    e.preventDefault();
    const nextIndex = activeIndex + (e.key === 'ArrowDown' ? 1 : -1);
    const option = options[nextIndex];
    if (option) onChange(option.value);
  }

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      onKeyDown={handleKeyDown}
      role="listbox"
      aria-label={label}
      tabIndex={0}
      className="scrollbar-hide flex-1 overflow-y-auto snap-y snap-mandatory focus:outline-none"
      style={{
        height: ITEM_HEIGHT * VISIBLE_COUNT,
        paddingBlock: ITEM_HEIGHT * PAD_COUNT,
      }}
    >
      {options.map((option, index) => {
        const distance = Math.abs(index - activeIndex);

        return (
          <div
            key={option.value}
            role="option"
            aria-selected={index === activeIndex}
            onClick={() => onChange(option.value)}
            className={`flex items-center justify-center snap-center text-sm cursor-pointer select-none transition-colors ${
              distance === 0
                ? 'text-gray-900 font-semibold'
                : distance === 1
                  ? 'text-gray-400'
                  : 'text-gray-200'
            }`}
            style={{ height: ITEM_HEIGHT }}
          >
            {option.label}
          </div>
        );
      })}
    </div>
  );
}
