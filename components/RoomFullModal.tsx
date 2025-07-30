interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function RoomFullModal({ visible, onClose }: Props) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full text-center">
        <h2 className="text-xl font-semibold mb-4">Room Full</h2>
        <p className="mb-4">This room already has 2 players. Use another code.</p>
        <button
          onClick={onClose}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          OK
        </button>
      </div>
    </div>
  );
}