import { GameConfig } from '@/components/room/types';
import RPSGame from '@/components/games/RPSGame';

export const gameConfigs: Record<string, GameConfig> = {
  rps: {
    name: 'Rock Paper Scissors',
    maxPlayers: 2,
    minPlayers: 2,
    description: 'Classic rock-paper-scissors game with 15 different options!',
    component: RPSGame,
  }
};

export const getGameConfig = (gameType: string): GameConfig | null => {
  return gameConfigs[gameType] || null;
};

export const getAllGameConfigs = (): GameConfig[] => {
  return Object.values(gameConfigs);
};
