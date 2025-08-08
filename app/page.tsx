'use client';

export default function Home() {
  return (
    <main style={{display:"grid",gap:16,placeItems:"start"}}>
      <h1>Multiplayer Games</h1>
      <a href="/rps" style={{padding:12,border:"1px solid #ccc",borderRadius:8}}>Play Rock–Paper–Scissors</a>
      <a href="/maze" style={{padding:12,border:"1px solid #ccc",borderRadius:8}}>Play Maze (auto-solve)</a>
    </main>
  );
}
