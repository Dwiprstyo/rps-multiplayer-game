export const Rules: Record<string, string[]> = {
  Rock: ["Scissors", "Fire", "Snake", "Human", "Tree", "Wolf", "Sponge"],
  Fire: ["Scissors", "Snake", "Human", "Tree", "Wolf", "Sponge", "Paper"],
  Scissors: ["Snake", "Human", "Tree", "Wolf", "Sponge", "Paper", "Air"],
  Snake: ["Human", "Tree", "Wolf", "Sponge", "Paper", "Air", "Water"],
  Human: ["Tree", "Wolf", "Sponge", "Paper", "Air", "Water", "Dragon"],
  Tree: ["Wolf", "Sponge", "Paper", "Air", "Water", "Dragon", "Devil"],
  Wolf: ["Sponge", "Paper", "Air", "Water", "Dragon", "Devil", "Lightning"],
  Sponge: ["Paper", "Air", "Water", "Dragon", "Devil", "Lightning", "Gun"],
  Paper: ["Air", "Water", "Dragon", "Devil", "Lightning", "Gun", "Rock"],
  Air: ["Water", "Dragon", "Devil", "Lightning", "Gun", "Rock", "Fire"],
  Water: ["Dragon", "Devil", "Lightning", "Gun", "Rock", "Fire", "Scissors"],
  Dragon: ["Devil", "Lightning", "Gun", "Rock", "Fire", "Scissors", "Snake"],
  Devil: ["Lightning", "Gun", "Rock", "Fire", "Scissors", "Snake", "Human"],
  Lightning: ["Gun", "Rock", "Fire", "Scissors", "Snake", "Human", "Tree"],
  Gun: ["Rock", "Fire", "Scissors", "Snake", "Human", "Tree", "Wolf"]
};