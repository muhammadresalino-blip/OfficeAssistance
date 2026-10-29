import { NextResponse } from 'next/server';
import { FormulaReq, FormulaRes, type FormulaResponse } from '@/lib/schemas';
import { askJson } from '@/lib/claude';
import { limited, remainingAi } from '@/lib/ratelimit';
import { FORMULA_PROMPT } from '@/lib/prompts/formula';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'anon';

  if (await limited(ip)) {
    return NextResponse.json(
      { error: { code: 'RATE_LIMITED', message: 'Batas harian tercapai. Coba lagi besok atau gunakan Kamus.' } },
      { status: 429, headers: { 'X-RateLimit-Remaining': String(remainingAi(ip)) } }
    );
  }

  const parsed = FormulaReq.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'BAD_REQUEST', message: 'Input tidak valid. Masukkan kebutuhan minimal 5 karakter.' } },
      { status: 400 }
    );
  }

  const { request, separator, range } = parsed.data;

  try {
    const raw = await askJson(
      FORMULA_PROMPT,
      `Kebutuhan: ${request}\nPemisah: ${separator}\nRentang: ${range ?? '-'}\nBahasa: Indonesia`
    );

    const result = FormulaRes.safeParse(raw);
    if (!result.success) {
      return NextResponse.json(
        { error: { code: 'AI_FORMAT', message: 'Respons AI tidak sesuai skema. Coba ulangi permintaan.' } },
        { status: 502 }
      );
    }

    return NextResponse.json({ ...result.data, rateLimitRemaining: remainingAi(ip) });
  } catch (err) {
    console.error('[/api/formula]', err);
    return NextResponse.json(
      { error: { code: 'AI_UNAVAILABLE', message: 'Layanan AI sedang bermasalah. Coba lagi nanti.' } },
      { status: 503 }
    );
  }
}
