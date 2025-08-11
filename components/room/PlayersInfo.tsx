"use client";

interface PlayersInfoProps {
  playersCount: number;
  maxPlayers: number;
  roomId: string;
}

export default function PlayersInfo({
  playersCount,
  maxPlayers,
  roomId,
}: PlayersInfoProps) {
  const getStatusColor = () => {
    if (playersCount === maxPlayers) return "text-green-600";
    if (playersCount > 0) return "text-yellow-600";
    return "text-gray-600";
  };

  const getStatusText = () => {
    if (playersCount === maxPlayers) return "Ready to play!";
    if (playersCount > 0) return "Waiting for more players...";
    return "No players connected";
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Room: {roomId}
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Players:</span>
            <span className="font-bold">
              {playersCount}/{maxPlayers}
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className={`font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </div>
          <div className="flex items-center justify-end space-x-1 mt-1">
            {Array.from({ length: maxPlayers }).map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index < playersCount ? "bg-green-500" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {playersCount < maxPlayers && (
        <div className="mt-3 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
          <p className="text-sm text-blue-700">
            Share room code &quot;{roomId}&quot; with a friend to start playing!
          </p>
        </div>
      )}
    </div>
  );
}
