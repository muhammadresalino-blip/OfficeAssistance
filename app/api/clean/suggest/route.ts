import { NextResponse } from 'next/server';
import { CleanSuggestReq, CleanSuggestRes } from '@/lib/schemas';
import { askJson } from '@/lib/claude';
import { limited, remainingAi } from '@/lib/ratelimit';
import { CLEAN_PROMPT, fallbackCleanSuggest } from '@/lib/prompts/clean';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'anon';

  if (await limited(ip)) {
    return NextResponse.json(
      { error: { code: 'RATE_LIMITED', message: 'Batas harian tercapai. Coba lagi besok atau gunakan perbaikan lokal.' } },
      { status: 429, headers: { 'X-RateLimit-Remaining': String(remainingAi(ip)) } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'BAD_REQUEST', message: 'Body harus berupa JSON yang valid.' } },
      { status: 400 }
    );
  }

  const parsed = CleanSuggestReq.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'BAD_REQUEST',
          message: 'Input tidak valid. Kirim maksimal 20 baris contoh dan daftar masalah yang dikenali.',
        },
      },
      { status: 400 }
    );
  }

  try {
    const raw = await askJson(
      CLEAN_PROMPT,
      JSON.stringify(parsed.data),
      undefined,
      fallbackCleanSuggest
    );

    const result = CleanSuggestRes.safeParse(raw);
    if (!result.success) {
      return NextResponse.json(
        { error: { code: 'AI_FORMAT', message: 'Respons AI tidak sesuai skema. Coba ulangi permintaan.' } },
        { status: 502 }
      );
    }

    return NextResponse.json({ ...result.data, rateLimitRemaining: remainingAi(ip) });
  } catch (err) {
    console.error('[/api/clean/suggest]', err);
    return NextResponse.json(
      { error: { code: 'AI_UNAVAILABLE', message: 'Layanan AI sedang bermasalah. Coba lagi nanti.' } },
      { status: 503 }
    );
  }
}
