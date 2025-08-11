// src/client/components/ArchiveFilter.tsx
type FilterValue = 'false' | 'true' | 'all';

interface Props {
  value: FilterValue;
  onChange: (v: FilterValue) => void;
}

export default function ArchiveFilter({ value, onChange }: Props) {
  const options: { label: string; val: FilterValue }[] = [
    { label: 'Active', val: 'false' },
    { label: 'Archived', val: 'true' },
    { label: 'All', val: 'all' },
  ];

  return (
    <div className="mb-3 flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.val}
          onClick={() => onChange(opt.val)}
          className={`px-3 py-1 border rounded ${value === opt.val ? 'bg-gray-100' : ''}`}
          aria-pressed={value === opt.val}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
