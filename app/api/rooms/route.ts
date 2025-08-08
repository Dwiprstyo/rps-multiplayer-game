import { NextResponse } from "next/server";
import * as Ably from "ably";

type XY = [number, number];

function generateMazeAndSolution(seed = Date.now(), w = 21, h = 21): { width:number;height:number; path: XY[]; seed:number } {
  // TODO: Replace with a real generator/solver.
  return { width: w, height: h, path: [[1,1],[1,2],[1,3],[2,3],[3,3],[3,4],[4,4]], seed };
}

export async function POST(req: Request) {
  const { width = 21, height = 21 } = await req.json().catch(() => ({}));
  const roomId = crypto.randomUUID();
  const ably = new Ably.Rest(process.env.ABLY_API_KEY!);

  // Ably service time keeps clients in sync
  const serverTime = await ably.time(); // ms epoch
  const startTime = serverTime + 2000;  // 2s join window

  const { path, seed } = generateMazeAndSolution(Date.now(), width, height);
  const channel = ably.channels.get(`maze:${roomId}`);
  await channel.publish("game:start", { mazeSeed: seed, width, height, path, startTime });

  return NextResponse.json({ roomId });
}
