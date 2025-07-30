'use client';

import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { Rules } from '@/lib/rules';
import Image from 'next/image';

const options = Object.keys(Rules);
let socket: Socket;

type PlayerData = {
  id: string;
  choice: string;
};

type RoundResult = {
  p1: PlayerData;
  p2: PlayerData;
};


export default function Game() {
  const [roomId, setRoomId] = useState('');
  const [joined, setJoined] = useState(false);
  const [players, setPlayers] = useState(0);
  const [choice, setChoice] = useState('');
  const [opponentChoice, setOpponentChoice] = useState('');
  const [result, setResult] = useState('');
  const [roomFull, setRoomFull] = useState(false);
  const [disabledChoice, setDisabledChoice] = useState(false);

  useEffect(() => {
    socket = io({
      path: '/api/socket',
    });

    socket.on('playerJoined', (count: number) => {
      setPlayers(count);
    });

    socket.on('roundResult', ({ p1, p2 }: RoundResult) => {
      const myId = socket.id;
      const me = myId === p1.id ? p1 : p2;
      const opponent = myId === p1.id ? p2 : p1;

      setChoice(me.choice);
      setOpponentChoice(opponent.choice);

      if (me.choice === opponent.choice) {
        setResult('Draw');
      } else if (Rules[me.choice]?.includes(opponent.choice)) {
        setResult('You Win!');
      } else {
        setResult('You Lose!');
      }

      setTimeout(() => {
        setChoice('');
        setOpponentChoice('');
        setResult('');
        setDisabledChoice(false);
      }, 2000);
    });

    socket.on('roomFull', () => {
      setRoomFull(true);
      setJoined(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const joinRoom = () => {
    if (roomId.trim()) {
      socket.emit('joinRoom', { roomId });
      setJoined(true);
    }
  };

  const selectChoice = (opt: string) => {
    if (disabledChoice) return;
    setChoice(opt);
    setDisabledChoice(true);
    socket.emit('makeChoice', { roomId, choice: opt });
  };


  return (
    <main className="p-6 bg-gray-100 min-h-screen text-center text-black">
      <h1 className="text-3xl font-bold mb-4">Multiplayer RPS-15 Game</h1>

      {roomFull && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full text-center">
            <h2 className="text-xl font-semibold mb-4">Room Penuh</h2>
            <p className="mb-4">Room ini sudah berisi 2 pemain. Silakan masukkan kode room lain.</p>
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
          <p className="mb-2">Players in room: {players}</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-w-5xl mx-auto">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => selectChoice(opt)}
                disabled={disabledChoice}
                className={`bg-white p-3 rounded shadow transition ${disabledChoice ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                  }`}
              >
                <Image src={`/images/${opt}.png`} alt={opt} width={20} height={20} className="mx-auto" />
                <p className="capitalize mt-1 font-medium">{opt}</p>
              </button>
            ))}
          </div>

          <div className="mt-6 text-xl">
            {choice && <p>You chose: <strong>{choice}</strong></p>}
            {opponentChoice && <p>Opponent chose: <strong>{opponentChoice}</strong></p>}
            {result && <p className="text-2xl mt-2">{result}</p>}
          </div>
        </>
      )}
    </main>
  );
}
