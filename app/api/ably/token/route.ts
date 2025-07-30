// app/api/ably/token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Ably from 'ably';

const ably = new Ably.Rest(process.env.ABLY_API_KEY!);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get('clientId') || 'anonymous';

  const tokenRequest = await ably.auth.createTokenRequest({ clientId });
  return NextResponse.json(tokenRequest);
}
