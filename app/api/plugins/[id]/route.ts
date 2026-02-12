import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '../../auth/middleware';
import { rateLimit } from '@/lib/rate-limit';

// 确保版本历史表存在
async function ensureVersionTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS plugin_versions (
        id SERIAL PRIMARY KEY,
        plugin_id INTEGER NOT NULL,
        version_number VARCHAR(20) NOT NULL DEFAULT '1.0.0',
        name VARCHAR(100) NOT NULL,
        description TEXT,
        download_url VARCHAR(500) NOT NULL,
        category VARCHAR(50),
        install_guide TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (plugin_id) REFERENCES plugins(id) ON DELETE CASCADE
      )
    `;
  } catch (error) {
    console.error('创建版本表失败:', error);
  }
}

// 保存当前版本到历史表
async function saveVersion(pluginId: number, version: string = '1.0.0') {
  try {
    const [plugin] = await sql`SELECT * FROM plugins WHERE id = ${pluginId}`;
    if (!plugin) return;

    await sql`
      INSERT INTO plugin_versions (plugin_id, version_number, name, description, download_url, category, install_guide)
      VALUES (${pluginId}, ${version}, ${plugin.name}, ${plugin.description}, ${plugin.download_url}, ${plugin.category}, ${plugin.install_guide})
    `;
  } catch (error) {
    console.error('保存版本失败:', error);
  }
}

// 输入清理函数
function sanitizeInput(input: unknown, maxLength: number = 100): string {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength);
}
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await sql`SELECT * FROM plugins WHERE id = ${id}`;
    
    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: '插件不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, plugin: result[0] });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

// 更新插件（需要认证）
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    if (!rateLimit(`update:${auth.sub as string}`, 10, 60000)) {
      return NextResponse.json(
        { success: false, error: '操作过于频繁' },
        { status: 429 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, download_url, category, install_guide } = body;

    // 输入验证和清理
    if (!name || !download_url) {
      return NextResponse.json(
        { success: false, error: '插件名称和下载链接为必填项' },
        { status: 400 }
      );
    }

    const cleanName = sanitizeInput(name, 100);
    const cleanDesc = sanitizeInput(description, 500);
    const cleanUrl = sanitizeInput(download_url, 500);
    const cleanCategory = sanitizeInput(category, 50);
    const cleanInstallGuide = sanitizeInput(install_guide, 2000);
    const version = sanitizeInput(body.version || '1.0.0', 20);

    // URL 格式验证
    try {
      new URL(cleanUrl);
    } catch {
      return NextResponse.json(
        { success: false, error: '下载链接格式无效' },
        { status: 400 }
      );
    }

    // 确保版本表存在并保存当前版本
    await ensureVersionTable();
    await saveVersion(parseInt(id), version);

    const result = await sql`
      UPDATE plugins 
      SET name = ${cleanName}, description = ${cleanDesc}, download_url = ${cleanUrl}, category = ${cleanCategory}, install_guide = ${cleanInstallGuide}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: '插件不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, plugin: result[0] });
  } catch (error) {
    console.error('更新插件错误:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

// 删除插件（需要认证）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    if (!rateLimit(`delete:${auth.sub as string}`, 10, 60000)) {
      return NextResponse.json(
        { success: false, error: '操作过于频繁' },
        { status: 429 }
      );
    }

    const { id } = await params;
    const result = await sql`DELETE FROM plugins WHERE id = ${id} RETURNING *`;

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: '插件不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: '插件已删除' });
  } catch (error) {
    console.error('删除插件错误:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
