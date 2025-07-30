export const Rules: Record<string, string[]> = {
  rock: ["scissors", "fire", "snake", "human", "tree", "wolf", "sponge"],
  fire: ["scissors", "snake", "human", "tree", "wolf", "sponge", "paper"],
  scissors: ["snake", "human", "tree", "wolf", "sponge", "paper", "air"],
  snake: ["human", "tree", "wolf", "sponge", "paper", "air", "water"],
  human: ["tree", "wolf", "sponge", "paper", "air", "water", "dragon"],
  tree: ["wolf", "sponge", "paper", "air", "water", "dragon", "devil"],
  wolf: ["sponge", "paper", "air", "water", "dragon", "devil", "lightning"],
  sponge: ["paper", "air", "water", "dragon", "devil", "lightning", "gun"],
  paper: ["air", "water", "dragon", "devil", "lightning", "gun", "rock"],
  air: ["water", "dragon", "devil", "lightning", "gun", "rock", "fire"],
  water: ["dragon", "devil", "lightning", "gun", "rock", "fire", "scissors"],
  dragon: ["devil", "lightning", "gun", "rock", "fire", "scissors", "snake"],
  devil: ["lightning", "gun", "rock", "fire", "scissors", "snake", "human"],
  lightning: ["gun", "rock", "fire", "scissors", "snake", "human", "tree"],
  gun: ["rock", "fire", "scissors", "snake", "human", "tree", "wolf"]
};