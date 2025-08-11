"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { GameChoices, GameResult } from "@/components/rps";
import { Rules } from "@/lib/rules";
import type { GameComponentProps, GameMessage } from "@/components/room/types";

interface PlayerScore {
  wins: number;
}

export default function RPSGame({
  roomState,
  currentPlayer,
  sendMessage,
  registerMessageHandler,
}: GameComponentProps) {
  const [playerScores, setPlayerScores] = useState<Record<string, PlayerScore>>(
    {},
  );
  const [currentRound, setCurrentRound] = useState(1);
  const [myChoice, setMyChoice] = useState("");
  const [opponentChoice, setOpponentChoice] = useState("");
  const [result, setResult] = useState("");
  const [opponentHasChosen, setOpponentHasChosen] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [playAgainVotes, setPlayAgainVotes] = useState<string[]>([]);

  // Track choices from all players
  const [allChoices, setAllChoices] = useState<Record<string, string>>({});
  const resultCalculated = useRef(false);

  // Initialize player scores when players change
  useEffect(() => {
    if (roomState.players.length < 2) return;

    setPlayerScores((prev) => {
      // copy once, but only if we need to modify
      let changed = false;
      const next = { ...prev };

      for (const p of roomState.players) {
        if (!next[p.clientId]) {
          next[p.clientId] = { wins: 0 };
          changed = true;
        }
      }

      // If nothing changed, return the previous object to avoid a state update
      return changed ? next : prev;
    });
  }, [roomState.players]);

  // Calculate results when both players have chosen
  useEffect(() => {
    if (
      roomState.players.length === 2 &&
      Object.keys(allChoices).length === 2 &&
      !resultCalculated.current &&
      currentPlayer
    ) {
      const [player1, player2] = roomState.players;
      const player1Choice = allChoices[player1.clientId];
      const player2Choice = allChoices[player2.clientId];

      if (player1Choice && player2Choice) {
        // Only the first player (by sorted ID) calculates results
        const sortedPlayerIds = [player1.clientId, player2.clientId].sort();
        if (currentPlayer.clientId === sortedPlayerIds[0]) {
          resultCalculated.current = true;

          const getOutcome = (playerChoice: string, opponentChoice: string) => {
            if (playerChoice === opponentChoice) return "Draw!";
            if (Rules[playerChoice]?.includes(opponentChoice))
              return "You Win!";
            return "You Lose!";
          };

          const player1Result = getOutcome(player1Choice, player2Choice);
          const player2Result = getOutcome(player2Choice, player1Choice);

          // Update scores
          const newScores = { ...playerScores };
          if (player1Result === "You Win!") {
            newScores[player1.clientId].wins++;
          } else if (player2Result === "You Win!") {
            newScores[player2.clientId].wins++;
          }

          // Send results
          sendMessage("game-result", {
            player1Choice,
            player2Choice,
            player1Result,
            player2Result,
            player1Id: player1.clientId,
            player2Id: player2.clientId,
            newScores,
          }).catch(console.error);
        }
      }
    }
  }, [allChoices, roomState.players, playerScores, currentPlayer, sendMessage]);

  // Simple message handler
  const handleMessage = useCallback(
    (message: GameMessage | null | undefined) => {
      if (!message || !message.type || !currentPlayer) {
        return;
      }

      try {
        switch (message.type) {
          case "player-choice":
            const choiceData = message.data as {
              choice: string;
              playerId: string;
            };
            if (choiceData && choiceData.choice && choiceData.playerId) {
              setAllChoices((prev) => ({
                ...prev,
                [choiceData.playerId]: choiceData.choice,
              }));

              if (choiceData.playerId !== currentPlayer.clientId) {
                setOpponentHasChosen(true);
              }
            }
            break;

          case "game-result":
            const resultData = message.data as {
              player1Choice: string;
              player2Choice: string;
              player1Result: string;
              player2Result: string;
              player1Id: string;
              player2Id: string;
              newScores: Record<string, PlayerScore>;
            };

            if (resultData && resultData.newScores) {
              setPlayerScores(resultData.newScores);
              setGameFinished(true);

              if (currentPlayer.clientId === resultData.player1Id) {
                setResult(resultData.player1Result);
                setOpponentChoice(resultData.player2Choice);
              } else {
                setResult(resultData.player2Result);
                setOpponentChoice(resultData.player1Choice);
              }
            }
            break;

          case "play-again-vote":
            if (message.fromPlayer) {
              setPlayAgainVotes((prev) => {
                const updated = [
                  ...prev.filter((id) => id !== message.fromPlayer),
                  message.fromPlayer,
                ];
                if (updated.length === roomState.players.length) {
                  setTimeout(() => resetGame(), 1000);
                }
                return updated;
              });
            }
            break;

          case "game-reset":
            resetGame();
            break;
        }
      } catch (error) {
        console.error("Error handling message:", error);
      }
    },
    [currentPlayer, roomState.players],
  );

  // Register message handler
  useEffect(() => {
    if (registerMessageHandler) {
      registerMessageHandler(handleMessage);
    }
  }, [handleMessage, registerMessageHandler]);

  const resetGame = () => {
    setMyChoice("");
    setOpponentChoice("");
    setResult("");
    setOpponentHasChosen(false);
    setGameFinished(false);
    setPlayAgainVotes([]);
    setAllChoices({});
    resultCalculated.current = false;
    setCurrentRound((prev) => prev + 1);
  };

  const handleSelectChoice = async (choice: string) => {
    if (myChoice || gameFinished || !currentPlayer) return;

    setMyChoice(choice);

    try {
      await sendMessage("player-choice", {
        choice,
        playerId: currentPlayer.clientId,
      });
    } catch (error) {
      console.error("Error sending choice:", error);
    }
  };

  const handlePlayAgain = async () => {
    try {
      await sendMessage("play-again-vote", {});
    } catch (error) {
      console.error("Error sending play again vote:", error);
    }
  };

  // Get opponent player info
  const opponent = roomState.players.find(
    (p) => p.clientId !== currentPlayer?.clientId,
  );

  // Get current player scores
  const myScore = playerScores[currentPlayer?.clientId || ""]?.wins || 0;
  const opponentScore = playerScores[opponent?.clientId || ""]?.wins || 0;

  // Don't render if there's no current player
  if (!currentPlayer) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading game...</p>
      </div>
    );
  }

  // Show waiting message if only one player
  if (roomState.players.length < 2) {
    return (
      <div className="text-center py-8">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-4">
            Waiting for Another Player
          </h2>
          <p className="text-gray-600">
            Share the room code with a friend to start playing
            Rock-Paper-Scissors!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Simple Score Display */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Round {currentRound}</h2>
          <div className="text-4xl font-bold text-gray-800">
            {myScore} - {opponentScore}
          </div>
          <div className="text-sm text-gray-600 mt-2">
            <span className="text-blue-600">You</span> vs{" "}
            <span className="text-red-600">{opponent?.name || "Opponent"}</span>
          </div>
        </div>
      </div>

      {/* Game Area */}
      {gameFinished ? (
        <GameResult
          result={result}
          playerChoice={myChoice}
          opponentChoice={opponentChoice}
          onPlayAgain={handlePlayAgain}
          opponentReady={playAgainVotes.includes(opponent?.clientId || "")}
          playersCount={roomState.players.length}
        />
      ) : (
        <div className="space-y-6">
          <div className="flex justify-center">
            <GameChoices
              onSelectChoice={handleSelectChoice}
              disabled={!!myChoice}
              selectedChoice={myChoice}
            />
          </div>

          {/* Real-time feedback */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center">
              <div className="text-center flex-1">
                <h3 className="font-semibold text-blue-600">Your Choice</h3>
                <div className="mt-2">
                  {myChoice ? (
                    <div className="bg-blue-100 rounded-lg p-3">
                      <div className="text-lg font-medium capitalize">
                        {myChoice}
                      </div>
                      <div className="text-sm text-green-600">✓ Ready</div>
                    </div>
                  ) : (
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="text-gray-500">Make your choice</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-2xl font-bold text-gray-400 mx-4">VS</div>

              <div className="text-center flex-1">
                <h3 className="font-semibold text-red-600">Opponent</h3>
                <div className="mt-2">
                  {opponentHasChosen ? (
                    <div className="bg-red-100 rounded-lg p-3">
                      <div className="text-lg font-medium">Hidden</div>
                      <div className="text-sm text-green-600">✓ Ready</div>
                    </div>
                  ) : (
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="text-gray-500">Choosing...</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {myChoice && opponentHasChosen && (
              <div className="text-center mt-4">
                <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3">
                  <div className="text-yellow-800 font-medium">
                    🎲 Both players ready! Calculating results...
                  </div>
                </div>
              </div>
            )}

            {myChoice && !opponentHasChosen && (
              <div className="text-center mt-4">
                <div className="text-blue-600">
                  <div className="animate-pulse inline-flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  <p className="mt-2">Waiting for opponent to choose...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
