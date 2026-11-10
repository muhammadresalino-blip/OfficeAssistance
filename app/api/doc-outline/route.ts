import { NextResponse } from 'next/server';
import { DocOutlineReq, DocOutlineRes } from '@/lib/schemas';
import { askJson } from '@/lib/claude';
import { limited, remainingAi } from '@/lib/ratelimit';
import { DOC_PROMPT, fallbackDocOutline } from '@/lib/prompts/document';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'anon';
  if (await limited(ip)) {
    return NextResponse.json({ error: { code: 'RATE_LIMITED', message: 'Batas harian tercapai.' } }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = DocOutlineReq.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: { code: 'BAD_REQUEST', message: 'Input tidak valid.' } }, { status: 400 });

    const raw = await askJson(DOC_PROMPT, JSON.stringify(parsed.data), undefined, fallbackDocOutline);
    const result = DocOutlineRes.safeParse(raw);
    
    if (!result.success) return NextResponse.json({ error: { code: 'AI_FORMAT', message: 'Gagal memproses respons AI.' } }, { status: 502 });
    return NextResponse.json({ ...result.data, rateLimitRemaining: remainingAi(ip) });
  } catch (err) {
    return NextResponse.json({ error: { code: 'SERVER_ERROR', message: 'Terjadi kesalahan.' } }, { status: 500 });
  }
}
