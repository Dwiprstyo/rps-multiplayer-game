"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Ably, { PresenceMessage, Message } from "ably";
import type {
  Player,
  RoomState,
  GameMessage,
  RoomConfig,
} from "@/components/room/types";

export function useGameRoom({
  roomId,
  maxPlayers,
  gameType,
  onMessage,
  onPlayerJoin,
  onPlayerLeave,
  onRoomStateChange,
}: RoomConfig) {
  const [ablyClient, setAblyClient] = useState<Ably.Realtime | null>(null);
  const [roomState, setRoomState] = useState<RoomState>({
    id: roomId,
    players: [],
    maxPlayers,
    gameType,
    gameState: "waiting",
  });
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [roomFull, setRoomFull] = useState(false);
  const [connected, setConnected] = useState(false);

  const channelRef = useRef<ReturnType<
    Ably.Realtime["channels"]["get"]
  > | null>(null);

  // Store latest callbacks in refs to avoid useEffect dependency issues
  const onMessageRef = useRef(onMessage);
  const onPlayerJoinRef = useRef(onPlayerJoin);
  const onPlayerLeaveRef = useRef(onPlayerLeave);
  const onRoomStateChangeRef = useRef(onRoomStateChange);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);
  useEffect(() => {
    onPlayerJoinRef.current = onPlayerJoin;
  }, [onPlayerJoin]);
  useEffect(() => {
    onPlayerLeaveRef.current = onPlayerLeave;
  }, [onPlayerLeave]);
  useEffect(() => {
    onRoomStateChangeRef.current = onRoomStateChange;
  }, [onRoomStateChange]);

  // Initialize Ably client
  useEffect(() => {
    const randomId = `user-${Math.floor(Math.random() * 10000)}`;
    const client = new Ably.Realtime({
      authUrl: `/api/ably/token?clientId=${randomId}`,
      clientId: randomId,
    });

    client.connection.on("connected", () => {
      setConnected(true);
      setCurrentPlayer({
        id: randomId,
        clientId: randomId,
        name: `Player ${randomId.split("-")[1]}`,
      });
    });

    client.connection.on("disconnected", () => {
      setConnected(false);
    });

    setAblyClient(client);

    return () => {
      client.close();
    };
  }, []);

  // Room management
  useEffect(() => {
    if (!ablyClient || !roomId || !connected) return;

    const channel = ablyClient.channels.get(`room:${roomId}`);
    channelRef.current = channel;

    const handleMessage = (msg: Message) => {

      if (msg.name === "game-message") {
        // Validate message data structure
        if (!msg.data || typeof msg.data !== "object") {
          console.warn("Invalid game message data:", msg.data);
          return;
        }

        if (!msg.data.type || !msg.data.fromPlayer) {
          console.warn("Missing required game message fields:", msg.data);
          return;
        }

        const gameMessage: GameMessage = {
          type: msg.data.type,
          data: msg.data.data,
          fromPlayer: msg.data.fromPlayer,
          timestamp: msg.timestamp || Date.now(),
        };

        onMessageRef.current?.(gameMessage);
      } else if (msg.name === "room-state") {
        if (!msg.data || typeof msg.data !== "object") {
          console.warn("Invalid room state data:", msg.data);
          return;
        }

        const newState: RoomState = msg.data;
        setRoomState(newState);
        onRoomStateChangeRef.current?.(newState);
      }
    };

    const updateRoomState = async () => {
      const members = await channel.presence.get();
      const players: Player[] = members.map((member) => ({
        id: member.clientId || "",
        clientId: member.clientId || "",
        name:
          member.data?.name ||
          `Player ${(member.clientId || "").split("-")[1]}`,
        data: member.data || {},
      }));

      const newState: RoomState = {
        id: roomId,
        players,
        maxPlayers,
        gameType,
        gameState: players.length >= 2 ? "playing" : "waiting",
        gameData: {},
      };

      setRoomState(newState);
      setRoomFull(players.length >= maxPlayers);
      onRoomStateChangeRef.current?.(newState);
    };

    const handlePresenceEnter = async (member: PresenceMessage) => {
      await updateRoomState();
      const player: Player = {
        id: member.clientId || "",
        clientId: member.clientId || "",
        name:
          member.data?.name ||
          `Player ${(member.clientId || "").split("-")[1]}`,
        data: member.data || {},
      };
      onPlayerJoinRef.current?.(player);
    };

    const handlePresenceLeave = async (member: PresenceMessage) => {
      await updateRoomState();
      const player: Player = {
        id: member.clientId || "",
        clientId: member.clientId || "",
        name:
          member.data?.name ||
          `Player ${(member.clientId || "").split("-")[1]}`,
        data: member.data || {},
      };
      onPlayerLeaveRef.current?.(player);
    };

    const joinRoom = async () => {
      try {
        const members = await channel.presence.get();
        if (members.length >= maxPlayers) {
          setRoomFull(true);
          return;
        }

        await channel.presence.enter({
          name:
            currentPlayer?.name ||
            `Player ${ablyClient.auth.clientId?.split("-")[1]}`,
          gameType,
        });

        await updateRoomState();

        // Subscribe to events
        channel.subscribe(handleMessage);
        channel.presence.subscribe("enter", handlePresenceEnter);
        channel.presence.subscribe("leave", handlePresenceLeave);
        channel.presence.subscribe("update", updateRoomState);
      } catch (error) {
        console.error("Error joining room:", error);
      }
    };

    void joinRoom();

    return () => {
      channel.unsubscribe(handleMessage);
      channel.presence.unsubscribe("enter", handlePresenceEnter);
      channel.presence.unsubscribe("leave", handlePresenceLeave);
      channel.presence.unsubscribe("update", updateRoomState);
      channel.presence.leave().catch(() => {});
    };
  }, [
    ablyClient,
    roomId,
    maxPlayers,
    gameType,
    connected,
    currentPlayer?.name,
  ]);

  // Send game message
  const sendMessage = useCallback(
    async (type: string, data: unknown) => {
      if (!channelRef.current || !currentPlayer) {
        console.warn("Cannot send message: no channel or current player");
        return;
      }

      if (!type || typeof type !== "string") {
        console.error("Invalid message type:", type);
        return;
      }

      const messagePayload = {
        type,
        data,
        fromPlayer: currentPlayer.clientId,
      };

      try {
        await channelRef.current.publish("game-message", messagePayload);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    },
    [currentPlayer],
  );

  // Update player data
  const updatePlayerData = useCallback(
    async (data: Record<string, unknown>) => {
      if (!channelRef.current || !currentPlayer) return;

      try {
        await channelRef.current.presence.update({
          name: currentPlayer.name,
          gameType,
          ...data,
        });
      } catch (error) {
        console.error("Error updating player data:", error);
      }
    },
    [currentPlayer, gameType],
  );

  // Broadcast room state change
  const updateRoomState = useCallback(
    async (newGameData: Record<string, unknown>) => {
      if (!channelRef.current) return;

      const newState: RoomState = {
        ...roomState,
        gameData: newGameData,
      };

      try {
        await channelRef.current.publish("room-state", newState);
      } catch (error) {
        console.error("Error updating room state:", error);
      }
    },
    [roomState],
  );

  return {
    ablyClient,
    channel: channelRef.current ?? undefined,
    roomState,
    currentPlayer,
    roomFull,
    connected,
    sendMessage,
    updatePlayerData,
    updateRoomState,
  };
}
