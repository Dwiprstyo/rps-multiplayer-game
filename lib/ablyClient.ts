"use client";
import Ably from "ably";

let client: Ably.Realtime | null = null;
export function getRealtime() {
  if (!client) {
    client = new Ably.Realtime({ authUrl: '/api/ably/token' });
  }
  return client;
}
