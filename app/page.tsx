"use client";

import { useEffect, useState } from "react";
import Ably, { Message, PresenceMessage } from "ably";
import { Rules } from "@/lib/rules";
import Header from "@/components/Header";
import RoomFullModal from "@/components/RoomFullModal";
import RulesModal from "@/components/RulesModal";
import JoinRoom from "@/components/JoinRoom";
import ChoiceGrid from "@/components/ChoiceGrid";
import GameInfo from "@/components/GameInfo";

const options = Object.keys(Rules);

let ably: Ably.Realtime;
let channel: ReturnType<Ably.Realtime["channels"]["get"]>;

export default function Game() {
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [players, setPlayers] = useState<string[]>([]);
  const [choice, setChoice] = useState("");
  const [opponentChoice, setOpponentChoice] = useState("");
  const [result, setResult] = useState("");
  const [roomFull, setRoomFull] = useState(false);
  const [disabledChoice, setDisabledChoice] = useState(false);
  const [clientId, setClientId] = useState("");
  const [opponentReady, setOpponentReady] = useState(false);
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    const randomId = `user-${Math.floor(Math.random() * 10000)}`;
    const client = new Ably.Realtime({
      authUrl: `/api/ably/token?clientId=${randomId}`,
      clientId: randomId,
    });

    ably = client;
    setClientId(randomId);

    return () => ably?.close();
  }, []);

  const joinRoom = async () => {
    if (!roomId.trim()) return;
    channel = ably.channels.get(`room:${roomId}`);
    const members = await channel.presence.get();

    if (members.length >= 2) {
      setRoomFull(true);
      return;
    }

    await channel.presence.enter({});
    channel.subscribe("reset", () => {
      setChoice("");
      setOpponentChoice("");
      setResult("");
      setDisabledChoice(false);
      setOpponentReady(false);
    });

    setJoined(true);
    setShowRules(true);

    channel.presence.subscribe("enter", updatePlayerList);
    channel.presence.subscribe("leave", updatePlayerList);
    await updatePlayerList();

    channel.presence.subscribe("update", (msg: PresenceMessage) => {
      if (msg.clientId !== ably.auth.clientId) {
        setOpponentReady(msg.data?.playAgain === true);
      }
    });

    channel.subscribe("choice", (msg: Message) => {
      if (msg.data.clientId !== ably.auth.clientId) {
        setOpponentChoice(msg.data.choice);
      }
    });

    channel.subscribe("result", (msg: Message) => {
      const { clientId: targetId, outcome, choices } = msg.data;
      if (targetId === ably.auth.clientId) {
        setResult(outcome);
        const opponentId = Object.keys(choices).find(
          (id) => id !== ably.auth.clientId
        );
        if (opponentId) setOpponentChoice(choices[opponentId]);
      }
    });
  };

  const updatePlayerList = async () => {
    const members = await channel.presence.get();
    const ids = members.map((m: PresenceMessage) => m.clientId || "");
    setPlayers(ids);
    if (ids.length > 2) setRoomFull(true);
  };

  const selectChoice = async (opt: string) => {
    if (disabledChoice) return;
    setChoice(opt);
    setDisabledChoice(true);
    await channel.publish("choice", {
      clientId: ably.auth.clientId,
      choice: opt,
    });
    await channel.presence.update({ choice: opt });

    const presenceMembers = await channel.presence.get();
    const choices: Record<string, string> = {};
    presenceMembers.forEach((m: PresenceMessage) => {
      const data = m.data as { choice?: string };
      if (data?.choice) choices[m.clientId!] = data.choice;
    });

    if (Object.keys(choices).length === 2) {
      await Promise.all(
        Object.keys(choices).map(async (id) => {
          const c1 = choices[id];
          const c2 = choices[Object.keys(choices).find((k) => k !== id)!];
          const outcome =
            c1 === c2
              ? "Draw"
              : Rules[c1]?.includes(c2)
              ? "You Win!"
              : "You Lose!";
          await channel.publish("result", { clientId: id, outcome, choices });
        })
      );
      await channel.presence.update({});
    }
  };

  const resetGame = async () => {
    setChoice("");
    setOpponentChoice("");
    setResult("");
    setOpponentReady(false);
    await channel.presence.update({ playAgain: true });

    const members = await channel.presence.get();
    const readyPlayers = members.filter((m) => m.data?.playAgain === true);
    if (readyPlayers.length === 2) {
      await channel.publish("reset", {});
      await channel.presence.update({});
      setDisabledChoice(false);
    }
  };
  
  return (
    <main className="p-6 bg-gray-100 min-h-screen text-center text-black">
      <Header />
      <RoomFullModal visible={roomFull} onClose={() => setRoomFull(false)} />
      <RulesModal visible={showRules} onClose={() => setShowRules(false)} />

      {!joined ? (
        <JoinRoom roomId={roomId} setRoomId={setRoomId} joinRoom={joinRoom} />
      ) : (
        <>
          <p className="mb-2">Players in room: {players.length}</p>
          <p className="mb-2">Room code: {roomId}</p>
          <ChoiceGrid
            options={options}
            disabled={disabledChoice || !!result}
            onSelect={selectChoice}
          />
          <GameInfo
            choice={choice}
            opponentChoice={opponentChoice}
            result={result}
            disabledChoice={disabledChoice}
            opponentReady={opponentReady}
            resetGame={resetGame}
          />
        </>
      )}
      <p className="fixed bottom-2 right-2 text-xs text-gray-500">{clientId}</p>
    </main>
  );
}
