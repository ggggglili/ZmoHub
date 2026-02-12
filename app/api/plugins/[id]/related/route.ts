import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 先获取当前插件的分类
    const [currentPlugin] = await sql`SELECT category FROM plugins WHERE id = ${id}`;
    
    if (!currentPlugin) {
      return NextResponse.json(
        { success: false, error: '插件不存在' },
        { status: 404 }
      );
    }

    // 查询同分类的其他插件，随机取4个
    const related = await sql`
      SELECT id, name, description, category, download_count
      FROM plugins
      WHERE id != ${id} AND category = ${currentPlugin.category}
      ORDER BY RANDOM()
      LIMIT 4
    `;

    // 如果同分类不足4个，补充其他分类的热门插件
    if (related.length < 4) {
      const excludeIds = [id, ...related.map(p => p.id)];
      const additional = await sql`
        SELECT id, name, description, category, download_count
        FROM plugins
        WHERE id NOT IN (${excludeIds})
        ORDER BY RANDOM()
        LIMIT ${4 - related.length}
      `;
      related.push(...additional);
    }

    return NextResponse.json({ success: true, related });
  } catch (error) {
    console.error('获取相关推荐失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
