'use client';

import Image from 'next/image';
import { useState } from 'react';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function RulesModal({ visible, onClose }: Props) {
  const [step, setStep] = useState(1);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl max-w-lg w-full text-left space-y-4 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-sm text-gray-500 hover:text-black"
        >
          ✕
        </button>

        {step === 1 && (
          <>
            <h2 className="text-2xl font-bold text-center">Game Rules</h2>
            <p>This is a variation of Rock-Paper-Scissors with 15 options. Each item beats 7 and loses to 7.</p>
            <ul className="list-disc list-inside text-sm">
              <li>Pick your move by clicking an icon.</li>
              <li>Wait for your opponent to pick theirs.</li>
              <li>The result is shown once both have chosen.</li>
              <li>Press "Play Again" to play the next round.</li>
            </ul>
            <div className="text-center">
              <button
                onClick={() => setStep(2)}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Show Graph →
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-2xl font-bold text-center">RPS-15 Interaction Graph</h2>
            <div className="flex justify-center">
              <Image
                src="/images/rules.jpg"
                alt="RPS-15 Rules Chart"
                width={400}
                height={400}
                className="rounded shadow"
              />
            </div>
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setStep(1)}
                className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
              >
                ← Back
              </button>
              <button
                onClick={onClose}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Got it!
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}