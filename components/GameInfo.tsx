interface Props {
  choice: string;
  opponentChoice: string;
  result: string;
  disabledChoice: boolean;
  opponentReady: boolean;
  resetGame: () => void;
}

export default function GameInfo({
  choice,
  opponentChoice,
  result,
  disabledChoice,
  opponentReady,
  resetGame,
}: Props) {
  return (
    <div className="mt-6 text-xl space-y-2">
      {choice && <p>You chose: <strong>{choice}</strong></p>}
      {result && opponentChoice && <p>Opponent chose: <strong>{opponentChoice}</strong></p>}
      {!result && disabledChoice && (
        <p className="italic text-gray-600">Waiting for opponent...</p>
      )}
      {result && (
        <div className="mt-4 space-y-2">
          <p className="text-2xl font-bold">{result}</p>
          <button
            onClick={resetGame}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Play Again
          </button>
          {disabledChoice && (
            opponentReady ? (
              <p className="text-green-600 italic">Opponent is ready</p>
            ) : (
              <p className="text-gray-500 italic">Waiting for opponent to press `Play Again`...</p>
            )
          )}
        </div>
      )}
    </div>
  );
}
