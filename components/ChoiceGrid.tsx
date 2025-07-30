import Image from 'next/image';

interface Props {
  options: string[];
  disabled: boolean;
  onSelect: (opt: string) => void;
}

export default function ChoiceGrid({ options, disabled, onSelect }: Props) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-w-5xl mx-auto">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          disabled={disabled}
          className={`bg-white p-3 rounded shadow transition ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
        >
          <Image src={`/images/choice/${opt}.png`} alt={opt} width={50} height={50}className="mx-auto" />
          <p className="capitalize mt-1 font-medium">{opt}</p>
        </button>
      ))}
    </div>
  );
}
