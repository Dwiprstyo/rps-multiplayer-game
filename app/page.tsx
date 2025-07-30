'use client';

import { useEffect, useState } from 'react';
import Ably, { Message, PresenceMessage } from 'ably';
import { Rules } from '@/lib/rules';
import Image from 'next/image';

const options = Object.keys(Rules);

let ably: Ably.Realtime;
let channel: ReturnType<Ably.Realtime['channels']['get']>;

export default function Game() {
  const [roomId, setRoomId] = useState('');
  const [joined, setJoined] = useState(false);
  const [players, setPlayers] = useState<string[]>([]);
  const [choice, setChoice] = useState('');
  const [opponentChoice, setOpponentChoice] = useState('');
  const [result, setResult] = useState('');
  const [roomFull, setRoomFull] = useState(false);
  const [disabledChoice, setDisabledChoice] = useState(false);
  const [clientId, setClientId] = useState('');
  const [opponentReady, setOpponentReady] = useState(false);

  console.log(clientId);
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
    channel.subscribe('reset', () => {
      setChoice('');
      setOpponentChoice('');
      setResult('');
      setDisabledChoice(false);
      setOpponentReady(false);
    });

    setJoined(true);

    // Presence listeners
    channel.presence.subscribe('enter', updatePlayerList);
    channel.presence.subscribe('leave', updatePlayerList);
    await updatePlayerList();

    channel.presence.subscribe('update', (msg: PresenceMessage) => {
      if (msg.clientId !== ably.auth.clientId) {
        setOpponentReady(msg.data?.playAgain === true);
      }
    });

    // Game message listeners
    channel.subscribe('choice', (msg: Message) => {
      const data = msg.data;
      if (data.clientId !== ably.auth.clientId) {
        setOpponentChoice(data.choice);
      }
    });

    channel.subscribe('result', (msg: Message) => {
      const { clientId: targetId, outcome, choices } = msg.data;

      if (targetId === ably.auth.clientId) {
        setResult(outcome);

        const opponentId = Object.keys(choices).find(id => id !== ably.auth.clientId);
        if (opponentId) {
          setOpponentChoice(choices[opponentId]);
        }
      }
    });

  };

  const updatePlayerList = async () => {
    const members = await channel.presence.get();
    const ids = members.map((m: PresenceMessage) => m.clientId || '');
    setPlayers(ids);
    if (ids.length > 2) setRoomFull(true);
  };

  const selectChoice = async (opt: string) => {
    if (disabledChoice) return;
    setChoice(opt);
    setDisabledChoice(true);

    await channel.publish('choice', {
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
      await Promise.all(Object.keys(choices).map(async (id) => {
        let outcome: string;
        const c1 = choices[id];
        const opponentId = Object.keys(choices).find(k => k !== id)!;
        const c2 = choices[opponentId];

        if (c1 === c2) {
          outcome = 'Draw';
        } else if (Rules[c1]?.includes(c2)) {
          outcome = 'You Win!';
        } else {
          outcome = 'You Lose!';
        }

        await channel.publish('result', {
          clientId: id,
          outcome,
          choices
        });
      }));
      await channel.presence.update({});
    }

  };

  const resetGame = async () => {
    setChoice('');
    setOpponentChoice('');
    setResult('');
    setOpponentReady(false);

    // Menandakan pemain ini siap
    await channel.presence.update({ playAgain: true });

    // Cek apakah dua-duanya sudah siap
    const members = await channel.presence.get();
    const readyPlayers = members.filter(
      (m) => m.data?.playAgain === true
    );

    if (readyPlayers.length === 2) {
      // reset game untuk semua
      await channel.publish('reset', {});
      await channel.presence.update({}); // clear playAgain

      setDisabledChoice(false);
    }
  };

  return (
    <main className="p-6 bg-gray-100 min-h-screen text-center text-black">
      <h1 className="text-3xl font-bold mb-4">Multiplayer RPS-15 Game</h1>

      {roomFull && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full text-center">
            <h2 className="text-xl font-semibold mb-4">Room Full</h2>
            <p className="mb-4">This room already has 2 players. Use another code.</p>
            <button
              onClick={() => setRoomFull(false)}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {!joined ? (
        <div className="space-y-4">
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter room code"
            className="p-2 border rounded"
          />
          <button onClick={joinRoom} className="bg-blue-500 text-white px-4 py-2 rounded">
            Join Room
          </button>
        </div>
      ) : (
        <>
          <p className="mb-2">Players in room: {players.length}</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-w-5xl mx-auto">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => selectChoice(opt)}
                disabled={disabledChoice || !!result}
                className={`bg-white p-3 rounded shadow transition ${disabledChoice ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                  }`}
              >
                <Image
                  src={`/images/${opt}.png`}
                  alt={opt}
                  width={20}
                  height={20}
                  className="mx-auto"
                />
                <p className="capitalize mt-1 font-medium">{opt}</p>
              </button>
            ))}
          </div>

          <div className="mt-6 text-xl space-y-2">
            {choice && <p>You chose: <strong>{choice}</strong></p>}
            {result && opponentChoice && (
              <p>Opponent chose: <strong>{opponentChoice}</strong></p>
            )}
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
        </>
      )}
    </main>
  );
}
