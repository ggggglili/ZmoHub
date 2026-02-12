import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '../auth/middleware';

// 确保表存在
async function ensureTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS ad_config (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        subtitle VARCHAR(500) NOT NULL,
        enabled BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
  } catch (error) {
    console.error('创建表失败:', error);
  }
}

// 获取配置
export async function GET() {
  try {
    await ensureTable();
    const [config] = await sql`SELECT * FROM ad_config ORDER BY id DESC LIMIT 1`;
    return NextResponse.json({ success: true, config: config || null });
  } catch (error) {
    console.error('获取广告配置失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

// 更新配置（需要认证）
export async function POST(request: NextRequest) {
  try {
    // 认证检查
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    await ensureTable();
    const body = await request.json();
    const { title, subtitle, enabled } = body;

    const cleanTitle = title.slice(0, 200);
    const cleanSubtitle = subtitle.slice(0, 500);

    // 更新或插入
    const existing = await sql`SELECT id FROM ad_config LIMIT 1`;
    if (existing.length > 0) {
      await sql`
        UPDATE ad_config 
        SET title = ${cleanTitle}, subtitle = ${cleanSubtitle}, enabled = ${enabled}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${existing[0].id}
      `;
    } else {
      await sql`
        INSERT INTO ad_config (title, subtitle, enabled)
        VALUES (${cleanTitle}, ${cleanSubtitle}, ${enabled})
      `;
    }

    return NextResponse.json({ success: true, message: '配置已保存' });
  } catch (error) {
    console.error('保存广告配置失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
