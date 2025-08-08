"use client";
import { useEffect, useMemo, useState } from "react";
import type * as Ably from "ably";
import { getRealtime } from "@/lib/ablyClient";
import { COLORS, Color } from "@/lib/mazeColor";

type GameStartData = {
  width: number;
  height: number;
  path: [number, number][];
  startTime: number;
};

export function useGame(roomId: string) {
  const ably = useMemo(getRealtime, []);
  const [taken, setTaken] = useState<Color[]>([]);
  const [myColor, setMyColor] = useState<Color>();
  const [game, setGame] = useState<GameStartData>();

  useEffect(() => {
    const ch = ably.channels.get(`maze:${roomId}`);
    let isCurrent = true;

    const waitFor = (state: Ably.ChannelState) =>
      new Promise<void>((resolve, reject) => {
        if (ch.state === state) return resolve();
        const onTarget = () => {
          off();
          resolve();
        };
        const onTerminal = () => {
          off();
          reject(new Error(`Channel moved to ${ch.state} before reaching ${state}`));
        };
        const off = () => {
          ch.off("attached", onTarget);
          ch.off("failed", onTerminal);
          ch.off("suspended", onTerminal);
          ch.off("detached", onTerminal);
        };
        ch.once("attached", onTarget);
        ch.once("failed", onTerminal);
        ch.once("suspended", onTerminal);
        ch.once("detached", onTerminal);
      });

    const refresh = async () => {
      const members = await ch.presence.get();
      if (!isCurrent) return;
      setTaken(
        members
          .map((m) => (m.data as { color?: Color } | undefined)?.color)
          .filter(Boolean) as Color[]
      );
    };

    const onPresence = () => { void refresh(); };

    const onStart = (msg: Ably.Message) => {
      if (!isCurrent) return;
      const data = msg.data as GameStartData;
      setGame({ width: data.width, height: data.height, path: data.path, startTime: data.startTime });
    };

    (async () => {
      try {
        // Attach (or wait if already attaching)
        if (ch.state === "initialized" || ch.state === "detached" || ch.state === "detaching") {
          await ch.attach();
        } else if (ch.state === "attaching") {
          await waitFor("attached");
        }
        if (!isCurrent) return;

        // Only enter presence if we truly are attached
        if (ch.state !== "attached") return;
        await ch.presence.enter({ color: undefined });

        await refresh();

        ch.presence.subscribe("enter", onPresence);
        ch.presence.subscribe("update", onPresence);
        ch.presence.subscribe("leave", onPresence);
        ch.subscribe("game:start", onStart);
      } catch {
        // ignore attach/detach races during fast refresh
      }
    })();

    return () => {
      isCurrent = false;

      ch.unsubscribe("game:start", onStart);
      ch.presence.unsubscribe("enter", onPresence);
      ch.presence.unsubscribe("update", onPresence);
      ch.presence.unsubscribe("leave", onPresence);

      // Try to leave presence only if attached (ignore errors otherwise)
      if (ch.state === "attached") {
        void ch.presence.leave().catch(() => {});
      }

      // Detach safely depending on current state
      if (ch.state === "attached") {
        void ch.detach().catch(() => {});
      } else if (ch.state === "attaching") {
        ch.once("attached", () => { void ch.detach().catch(() => {}); });
      }
    };
  }, [ably, roomId]);

  async function chooseColor(color: Color) {
    if (taken.includes(color)) return false;
    const ch = ably.channels.get(`maze:${roomId}`);
    await ch.presence.update({ color });
    setMyColor(color);
    return true;
  }

  return { COLORS, taken, myColor, chooseColor, game };
}
