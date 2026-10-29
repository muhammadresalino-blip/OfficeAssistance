import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'office-assistant',
    aiConfigured: Boolean(process.env.ANTHROPIC_API_KEY),
    rateLimitRemaining: undefined,
  });
}
