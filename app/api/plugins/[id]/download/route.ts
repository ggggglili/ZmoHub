import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// 增加下载计数
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const result = await sql`
      UPDATE plugins 
      SET download_count = download_count + 1 
      WHERE id = ${id}
      RETURNING download_url, download_count
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: '插件不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      downloadUrl: result[0].download_url,
      downloadCount: result[0].download_count
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
