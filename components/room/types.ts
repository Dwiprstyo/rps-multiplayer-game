export interface Player {
  id: string;
  clientId: string;
  name?: string;
  data?: Record<string, unknown>;
}

export interface RoomState {
  id: string;
  players: Player[];
  maxPlayers: number;
  gameType: string;
  gameState: "waiting" | "playing" | "finished";
  gameData?: Record<string, unknown>;
}

export interface GameMessage {
  type: string;
  data: unknown;
  fromPlayer: string;
  timestamp: number;
}

export interface RoomConfig {
  roomId: string;
  maxPlayers: number;
  gameType: string;
  onMessage?: (message: GameMessage) => void;
  onPlayerJoin?: (player: Player) => void;
  onPlayerLeave?: (player: Player) => void;
  onRoomStateChange?: (state: RoomState) => void;
}

export interface GameComponentProps {
  roomState: RoomState;
  currentPlayer: Player | null;
  sendMessage: (type: string, data: unknown) => Promise<void>;
  updatePlayerData: (data: Record<string, unknown>) => Promise<void>;
  registerMessageHandler?: (handler: (message: GameMessage) => void) => void;
}

export interface GameConfig {
  name: string;
  maxPlayers: number;
  minPlayers: number;
  description: string;
  component: React.ComponentType<GameComponentProps>;
}
