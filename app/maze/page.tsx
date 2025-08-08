"use client";
import { useEffect, useRef, useState } from "react";
import { useGame } from "./useGame";

export default function MazePage() {
    const [roomId, setRoomId] = useState<string>();
    const [creating, setCreating] = useState(false);

    async function createRoom() {
        setCreating(true);
        const res = await fetch("/api/rooms", { method: "POST", body: JSON.stringify({ width: 21, height: 21 }) });
        const { roomId } = await res.json();
        setRoomId(roomId);
        setCreating(false);
    }

    return (
        <main style={{ display: "grid", gap: 12 }}>
            <h1>Maze (Auto-solve)</h1>
            {!roomId ? (
                <button onClick={createRoom} disabled={creating}>Create Room</button>
            ) : (
                <Room roomId={roomId} />
            )}
        </main>
    );
}

function Room({ roomId }: { roomId: string }) {
    const { COLORS, taken, myColor, chooseColor, game } = useGame(roomId);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!game || !canvasRef.current) return;
        const { path, startTime } = game;
        const ctx = canvasRef.current.getContext("2d")!;
        let raf = 0;

        function draw() {
            const now = Date.now();
            const t = Math.max(0, Math.floor((now - startTime) / 80)); // 80ms/step
            const idx = Math.min(t, path.length - 1);

            ctx.clearRect(0, 0, 800, 800);
            // draw path
            ctx.beginPath();
            path.slice(0, idx + 1).forEach(([x, y], i) => {
                const px = x * 20 + 10, py = y * 20 + 10;
                if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            });
            ctx.stroke();

            // your marker
            if (myColor) {
                const [x, y] = path[idx];
                ctx.beginPath();
                ctx.arc(x * 20 + 10, y * 20 + 10, 8, 0, Math.PI * 2);
                ctx.fillStyle = myColor;
                ctx.fill();
            }
            raf = requestAnimationFrame(draw);
        }
        raf = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(raf);
    }, [game, myColor]);

    return (
        <div style={{ display: "grid", gap: 8 }}>
            <div>Room: {roomId}</div>
            <div>
                Pick a color (max 4 players):
                {COLORS.map((c) => {
                    const takenBySomeone = taken.includes(c);
                    return (
                        <button
                            key={c}
                            disabled={takenBySomeone || (myColor && myColor !== c)}
                            onClick={() => chooseColor(c)}
                            style={{
                                background: c,
                                color: "#fff",
                                marginRight: 8,
                                opacity: takenBySomeone ? 0.4 : 1
                            }}
                        >
                            {c}{takenBySomeone ? " (taken)" : ""}
                        </button>
                    );
                })}
            </div>
            <canvas ref={canvasRef} width={800} height={800} style={{ border: "1px solid #ccc" }} />
        </div>
    );
}
