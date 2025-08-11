'use client';

import Image from 'next/image';
import { Rules } from '@/lib/rules';

const options = Object.keys(Rules);

interface GameChoicesProps {
  onSelectChoice: (choice: string) => void;
  disabled: boolean;
  selectedChoice?: string;
}

export default function GameChoices({ onSelectChoice, disabled, selectedChoice }: GameChoicesProps) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Choose your move:</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onSelectChoice(option)}
            disabled={disabled}
            className={`
              bg-white p-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'}
              ${selectedChoice === option ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
              flex flex-col items-center space-y-2
            `}
          >
            <div className="w-8 h-8 relative">
              <Image
                src={`/images/${option}.png`}
                alt={option}
                fill
                className="object-contain"
              />
            </div>
            <p className="text-xs font-medium text-center capitalize">
              {option}
            </p>
          </button>
        ))}
      </div>
      {selectedChoice && (
        <p className="mt-4 text-green-600 font-medium">
          You selected: <span className="capitalize">{selectedChoice}</span>
        </p>
      )}
    </div>
  );
}
