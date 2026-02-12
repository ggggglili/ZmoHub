import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const versions = await sql`
      SELECT id, version_number, name, description, download_url, category, install_guide, created_at
      FROM plugin_versions
      WHERE plugin_id = ${id}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ success: true, versions });
  } catch (error) {
    console.error('获取版本历史失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
