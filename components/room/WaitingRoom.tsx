"use client";

interface WaitingRoomProps {
  playersCount: number;
  maxPlayers: number;
  roomId: string;
}

export default function WaitingRoom({
  playersCount,
  maxPlayers,
  roomId,
}: WaitingRoomProps) {
  return (
    <div className="text-center py-8">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
        <div className="mb-6">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full animate-bounce"></div>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Waiting for Players...
          </h2>
          <p className="text-gray-600">
            {playersCount}/{maxPlayers} players connected
          </p>
        </div>

        <div className="mb-6">
          <div className="flex justify-center space-x-2 mb-4">
            {Array.from({ length: maxPlayers }).map((_, index) => (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-colors duration-300 ${
                  index < playersCount ? "bg-green-500" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-700 mb-2">
            <strong>Room Code:</strong>
          </p>
          <div className="bg-white px-3 py-2 rounded border font-mono text-lg font-bold text-center text-blue-600">
            {roomId}
          </div>
          <p className="text-xs text-blue-600 mt-2">
            Share this code with friends to invite them!
          </p>
        </div>

        {playersCount === 1 && (
          <div className="mt-4 text-sm text-gray-500">
            <p>🎮 You&apos;re the first player!</p>
            <p>Share the room code to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
