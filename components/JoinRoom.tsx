interface Props {
  roomId: string;
  setRoomId: (id: string) => void;
  joinRoom: () => void;
}

export default function JoinRoom({ roomId, setRoomId, joinRoom }: Props) {
  return (
    <div className="space-y-4">
      <input
        type="text"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        placeholder="Enter room code"
        className="p-2 border rounded"
      />
      <button onClick={joinRoom} className="bg-blue-500 text-white px-4 py-2 mx-2 rounded">
        Join Room
      </button>
    </div>
  );
}
