import { NextResponse } from 'next/server';
import { FeedbackReq } from '@/lib/schemas';
import { limitedNonAi } from '@/lib/ratelimit';

export const runtime = 'nodejs';

/** Terima nilai pengguna (up/down) tanpa menyimpan isi permintaan. */
export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'anon';

  if (await limitedNonAi(ip)) {
    return NextResponse.json(
      { error: { code: 'RATE_LIMITED', message: 'Terlalu banyak permintaan. Coba lagi sebentar lagi.' } },
      { status: 429 }
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

  const parsed = FeedbackReq.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'BAD_REQUEST', message: 'Input tidak valid.' } },
      { status: 400 }
    );
  }

  // Metrik anonim saja: jenis fitur + nilai, tanpa isi permintaan pengguna.
  console.log(`[feedback] feature=${parsed.data.feature} rating=${parsed.data.rating}`);

  return new NextResponse(null, { status: 204 });
}
