"use client";

import Image from "next/image";

interface GameResultProps {
  result: string;
  playerChoice: string;
  opponentChoice: string;
  onPlayAgain: () => void;
  opponentReady: boolean;
  playersCount: number;
}

export default function GameResult({
  result,
  playerChoice,
  opponentChoice,
  onPlayAgain,
  opponentReady,
  playersCount,
}: GameResultProps) {
  const getResultColor = () => {
    if (result.includes("Win")) return "text-green-600";
    if (result.includes("Lose")) return "text-red-600";
    return "text-yellow-600";
  };

  const getResultIcon = () => {
    if (result.includes("Win")) return "🏆";
    if (result.includes("Lose")) return "💔";
    return "🤝";
  };

  const getResultBackground = () => {
    if (result.includes("Win")) return "bg-green-50 border-green-200";
    if (result.includes("Lose")) return "bg-red-50 border-red-200";
    return "bg-yellow-50 border-yellow-200";
  };

  const getResultMessage = () => {
    if (result.includes("Win")) return "Victory!";
    if (result.includes("Lose")) return "Defeat!";
    return "Draw!";
  };

  const getResultSubtext = () => {
    if (result.includes("Win")) return "Congratulations! You won this round!";
    if (result.includes("Lose")) return "Better luck next time!";
    return "Great minds think alike!";
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Result Banner */}
      <div className={`rounded-lg border-2 p-6 ${getResultBackground()}`}>
        <div className="text-center">
          <div className="text-6xl mb-2">{getResultIcon()}</div>
          <h2 className={`text-4xl font-bold mb-2 ${getResultColor()}`}>
            {getResultMessage()}
          </h2>
          <p className="text-lg text-gray-600">{getResultSubtext()}</p>
        </div>
      </div>

      {/* Battle Breakdown */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-center mb-6">Round Results</h3>
        <div className="flex justify-center items-center space-x-8 mb-6">
          {/* Player Choice */}
          <div className="text-center">
            <h4 className="text-lg font-semibold mb-3 text-blue-600">You</h4>
            <div
              className={`p-6 rounded-xl border-3 ${
                result.includes("Win")
                  ? "bg-green-100 border-green-400"
                  : result.includes("Lose")
                    ? "bg-red-100 border-red-400"
                    : "bg-yellow-100 border-yellow-400"
              }`}
            >
              <div className="w-20 h-20 relative mx-auto mb-3">
                <Image
                  src={`/images/${playerChoice}.png`}
                  alt={playerChoice}
                  fill
                  className="object-contain"
                />
              </div>
              <p className="capitalize font-bold text-lg">{playerChoice}</p>
              <div
                className={`mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                  result.includes("Win")
                    ? "bg-green-200 text-green-800"
                    : result.includes("Lose")
                      ? "bg-red-200 text-red-800"
                      : "bg-yellow-200 text-yellow-800"
                }`}
              >
                {result.includes("Win")
                  ? "WINNER"
                  : result.includes("Lose")
                    ? "LOSER"
                    : "DRAW"}
              </div>
            </div>
          </div>

          {/* VS */}
          <div className="text-4xl font-bold text-gray-400">VS</div>

          {/* Opponent Choice */}
          <div className="text-center">
            <h4 className="text-lg font-semibold mb-3 text-red-600">
              Opponent
            </h4>
            <div
              className={`p-6 rounded-xl border-3 ${
                result.includes("Lose")
                  ? "bg-green-100 border-green-400"
                  : result.includes("Win")
                    ? "bg-red-100 border-red-400"
                    : "bg-yellow-100 border-yellow-400"
              }`}
            >
              {opponentChoice ? (
                <>
                  <div className="w-20 h-20 relative mx-auto mb-3">
                    <Image
                      src={`/images/${opponentChoice}.png`}
                      alt={opponentChoice}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <p className="capitalize font-bold text-lg">
                    {opponentChoice}
                  </p>
                  <div
                    className={`mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                      result.includes("Lose")
                        ? "bg-green-200 text-green-800"
                        : result.includes("Win")
                          ? "bg-red-200 text-red-800"
                          : "bg-yellow-200 text-yellow-800"
                    }`}
                  >
                    {result.includes("Lose")
                      ? "WINNER"
                      : result.includes("Win")
                        ? "LOSER"
                        : "DRAW"}
                  </div>
                </>
              ) : (
                <div className="w-20 h-20 bg-gray-200 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <span className="text-gray-500 text-2xl">?</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Play Again Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <button
            onClick={onPlayAgain}
            className="px-8 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl"
          >
            🎮 Play Another Round
          </button>

          <div className="mt-6">
            {playersCount < 2 ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 font-medium">
                  ⚠️ Opponent disconnected
                </p>
                <p className="text-sm text-red-500 mt-1">
                  Waiting for opponent to reconnect...
                </p>
              </div>
            ) : opponentReady ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-600 font-medium">
                  ✅ Opponent is ready!
                </p>
                <p className="text-sm text-green-500 mt-1">
                  Starting next round...
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-600 font-medium">
                  ⏳ Waiting for opponent
                </p>
                <p className="text-sm text-yellow-500 mt-1">
                  Opponent is deciding whether to play again...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
