import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import templates from '@/data/templates.json';

export const runtime = 'nodejs';

const MIME: Record<string, string> = {
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

/** Unduh file template dengan Content-Disposition attachment. */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const template = templates.find((t) => t.id === params.id);

  if (!template) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Template tidak ditemukan.' } },
      { status: 404 }
    );
  }

  try {
    const filePath = path.join(process.cwd(), 'public', 'templates', template.file);
    const buffer = await readFile(filePath);

    const asciiName = `${template.id}.${template.format}`;
    const utf8Name = encodeURIComponent(template.name);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': MIME[template.format] ?? 'application/octet-stream',
        'Content-Length': String(buffer.byteLength),
        'Content-Disposition': `attachment; filename="${asciiName}"; filename*=UTF-8''${utf8Name}.${template.format}`,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (err) {
    console.error('[/api/templates/download]', err);
    return NextResponse.json(
      { error: { code: 'FILE_UNAVAILABLE', message: 'File template tidak tersedia.' } },
      { status: 500 }
    );
  }
}
