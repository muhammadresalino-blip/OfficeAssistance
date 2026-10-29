import { NextResponse } from 'next/server';
import { DictionaryQuery } from '@/lib/schemas';
import formulas from '@/data/formulas.json';
import shortcuts from '@/data/shortcuts.json';
import tips from '@/data/tips.json';

export const runtime = 'nodejs';

const allEntries = [...formulas, ...shortcuts, ...tips];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = DictionaryQuery.safeParse({
    q: searchParams.get('q') ?? undefined,
    app: searchParams.get('app') ?? undefined,
    type: searchParams.get('type') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'BAD_REQUEST', message: 'Parameter query tidak valid' } },
      { status: 400 }
    );
  }

  const { q, app, type, limit } = parsed.data;
  const query = (q ?? '').toLowerCase().trim();

  const filtered = allEntries.filter((e) => {
    const matchQuery =
      !query ||
      e.title.toLowerCase().includes(query) ||
      e.description.toLowerCase().includes(query) ||
      e.keywords.some((k) => k.toLowerCase().includes(query));
    const matchApp = !app || e.app === app;
    const matchType = !type || e.type === type;
    return matchQuery && matchApp && matchType;
  });

  const items = filtered.slice(0, limit);

  return NextResponse.json({ total: filtered.length, items });
}
