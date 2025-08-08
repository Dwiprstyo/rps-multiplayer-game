export const COLORS = ["red", "blue", "green", "yellow"] as const;
export type Color = typeof COLORS[number];