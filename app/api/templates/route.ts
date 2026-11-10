import { NextResponse } from 'next/server';
import templates from '@/data/templates.json';

export const runtime = 'nodejs';

/** Katalog template gratis (statis, tanpa AI). */
export async function GET() {
  return NextResponse.json({
    items: templates.map(({ file: _file, ...item }) => item),
  });
}
