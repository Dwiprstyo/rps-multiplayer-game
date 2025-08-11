'use client';

import { useState } from 'react';

interface RoomJoinProps {
  onJoinRoom: (roomId: string) => void;
  roomFull?: boolean;
}

export default function RoomJoin({ onJoinRoom, roomFull }: RoomJoinProps) {
  const [roomId, setRoomId] = useState('');

  const handleJoinRoom = () => {
    if (!roomId.trim()) return;
    onJoinRoom(roomId);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJoinRoom();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {roomFull && (
        <p className="text-red-500 font-semibold">Room is full! Please try another room.</p>
      )}
      <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
        <input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter room code"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={handleJoinRoom}
          disabled={!roomId.trim()}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Join Room
        </button>
      </div>
      <p className="text-sm text-gray-600">
        Enter a room code to join an existing game or create a new one
      </p>
    </div>
  );
}
