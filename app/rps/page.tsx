"use client";

import { GameRoom } from "@/components/room";
import { getGameConfig } from "@/lib/gameConfigs";

export default function RPSPage() {
  const gameConfig = getGameConfig("rps");

  if (!gameConfig) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">
            Game Not Found
          </h1>
          <p className="text-gray-600">
            The RPS game configuration could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  return <GameRoom gameConfig={gameConfig} />;
}
