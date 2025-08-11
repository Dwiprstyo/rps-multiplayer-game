"use client";

import { useState, useCallback } from "react";
import { useGameRoom } from "@/hooks/useGameRoom";
import { RoomJoin, PlayersInfo, WaitingRoom } from "@/components/room";
import type {
  GameComponentProps,
  GameConfig,
  Player,
  RoomState,
  GameMessage,
} from "./types";

interface GameRoomProps {
  gameConfig: GameConfig;
  onMessage?: (message: GameMessage) => void;
  onPlayerJoin?: (player: Player) => void;
  onPlayerLeave?: (player: Player) => void;
  onRoomStateChange?: (state: RoomState) => void;
}

export default function GameRoom({
  gameConfig,
  onMessage,
  onPlayerJoin,
  onPlayerLeave,
  onRoomStateChange,
}: GameRoomProps) {
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [gameMessageHandler, setGameMessageHandler] = useState<
    ((message: GameMessage) => void) | null
  >(null);

  // Handle messages from room and forward to game
  const handleRoomMessage = useCallback(
    (message: GameMessage) => {

      // Add null check to prevent passing null messages
      if (!message || typeof message !== "object") {
        console.warn("GameRoom received null or invalid message:", message);
        return;
      }

      if (gameMessageHandler) {
        gameMessageHandler(message);
      }
      if (onMessage) {
        onMessage(message);
      }
    },
    [gameMessageHandler, onMessage],
  );

  // Stable message handler registration function
  const safeRegisterMessageHandler = useCallback(
    (handler: (message: GameMessage) => void) => {
      const wrappedHandler = (message: GameMessage) => {
        if (message && typeof message === "object" && message.type) {
          handler(message);
        } else {
          console.warn("Game component received invalid message:", message);
        }
      };
      setGameMessageHandler(() => wrappedHandler);
    },
    [],
  );

  const {
    roomState,
    currentPlayer,
    roomFull,
    connected,
    sendMessage,
    updatePlayerData,
  } = useGameRoom({
    roomId,
    maxPlayers: gameConfig.maxPlayers,
    gameType: gameConfig.name,
    onMessage: handleRoomMessage,
    onPlayerJoin,
    onPlayerLeave,
    onRoomStateChange,
  });

  const handleJoinRoom = (newRoomId: string) => {
    setRoomId(newRoomId);
    setJoined(true);
  };

  const GameComponent = gameConfig.component;

  // Game component props with stable message handler
  const gameComponentProps: GameComponentProps = {
    roomState,
    currentPlayer,
    sendMessage,
    updatePlayerData,
    registerMessageHandler: safeRegisterMessageHandler,
  };

  if (!connected) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="p-6 bg-gray-100 min-h-screen text-black">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{gameConfig.name}</h1>
          <p className="text-gray-600">{gameConfig.description}</p>
        </div>

        {!joined ? (
          <div className="flex justify-center">
            <RoomJoin onJoinRoom={handleJoinRoom} roomFull={roomFull} />
          </div>
        ) : (
          <div className="space-y-6">
            <PlayersInfo
              playersCount={roomState.players.length}
              maxPlayers={gameConfig.maxPlayers}
              roomId={roomId}
            />

            {roomState.players.length < gameConfig.minPlayers ? (
              <WaitingRoom
                playersCount={roomState.players.length}
                maxPlayers={gameConfig.maxPlayers}
                roomId={roomId}
              />
            ) : (
              <GameComponent {...gameComponentProps} />
            )}
          </div>
        )}
      </div>
    </main>
  );
}
