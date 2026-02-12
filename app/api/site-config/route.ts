import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '../auth/middleware';
import { rateLimit } from '@/lib/rate-limit';

// 输入清理函数
function sanitizeInput(input: unknown, maxLength: number = 200): string {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength);
}

// 获取站点配置（公开访问）
export async function GET() {
  try {
    const result = await sql`SELECT site_name, site_description FROM config WHERE id = 1`;
    
    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: '配置不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, config: result[0] });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

// 更新站点配置（需要认证）
export async function PUT(request: NextRequest) {
  try {
    // 认证检查
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    // 速率限制
    if (!rateLimit(`site-config:${auth.sub as string}`, 10, 60000)) {
      return NextResponse.json(
        { success: false, error: '操作过于频繁' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { site_name, site_description } = body;

    // 输入验证和清理
    const cleanSiteName = sanitizeInput(site_name, 50);
    const cleanSiteDescription = sanitizeInput(site_description, 500);

    // 站点名称不能为空
    if (!cleanSiteName) {
      return NextResponse.json(
        { success: false, error: '站点名称不能为空' },
        { status: 400 }
      );
    }

    const result = await sql`
      UPDATE config 
      SET site_name = ${cleanSiteName}, site_description = ${cleanSiteDescription}
      WHERE id = 1
      RETURNING site_name, site_description
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: '配置不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, config: result[0] });
  } catch (error) {
    console.error('更新站点配置错误:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
