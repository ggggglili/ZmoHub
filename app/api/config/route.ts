import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '../auth/middleware';
import { rateLimit } from '@/lib/rate-limit';

// 输入清理函数
function sanitizeInput(input: unknown, maxLength: number = 200): string {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength);
}

export async function GET() {
  try {
    const result = await sql`SELECT qq_group_name, qq_group_number, qq_group_link, site_name FROM config WHERE id = 1`;
    
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

// 更新配置（需要认证）
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
    if (!rateLimit(`config:${auth.sub as string}`, 10, 60000)) {
      return NextResponse.json(
        { success: false, error: '操作过于频繁' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { qq_group_name, qq_group_number, qq_group_link } = body;

    // 输入验证和清理
    const cleanName = sanitizeInput(qq_group_name, 100);
    const cleanNumber = sanitizeInput(qq_group_number, 50);
    const cleanLink = sanitizeInput(qq_group_link, 500);

    // 群号格式验证（只允许数字）
    if (cleanNumber && !/^\d+$/.test(cleanNumber)) {
      return NextResponse.json(
        { success: false, error: 'QQ群号格式无效' },
        { status: 400 }
      );
    }

    // 链接格式验证
    if (cleanLink) {
      try {
        new URL(cleanLink);
      } catch {
        return NextResponse.json(
          { success: false, error: '群链接格式无效' },
          { status: 400 }
        );
      }
    }

    const result = await sql`
      UPDATE config 
      SET qq_group_name = ${cleanName}, qq_group_number = ${cleanNumber}, qq_group_link = ${cleanLink}
      WHERE id = 1
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: '配置不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, config: result[0] });
  } catch (error) {
    console.error('更新配置错误:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
