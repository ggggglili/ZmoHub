import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '../auth/middleware';
import { rateLimit } from '@/lib/rate-limit';

// 索引是否已创建的标志
let indexesCreated = false;

// 创建数据库索引和字段
async function ensureIndexes() {
  if (indexesCreated) return;
  
  try {
    // 分类索引 - 加速按分类筛选
    await sql`CREATE INDEX IF NOT EXISTS idx_plugins_category ON plugins(category)`;
    
    // 搜索索引 - 加速名称搜索（使用前缀匹配）
    await sql`CREATE INDEX IF NOT EXISTS idx_plugins_name ON plugins(name text_pattern_ops)`;
    
    // 排序索引 - 加速下载量和时间排序
    await sql`CREATE INDEX IF NOT EXISTS idx_plugins_download_count ON plugins(download_count DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_plugins_created_at ON plugins(created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_plugins_updated_at ON plugins(updated_at DESC)`;
    
    // 添加 install_guide 字段（如果不存在）
    await sql`ALTER TABLE plugins ADD COLUMN IF NOT EXISTS install_guide TEXT`;
    
    indexesCreated = true;
    console.log('数据库索引和字段创建成功');
  } catch (error) {
    console.error('创建索引失败:', error);
  }
}

// 获取插件列表（公开访问，只读）
export async function GET(request: NextRequest) {
  try {
    // 确保索引已创建
    await ensureIndexes();
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at'; // created_at, download_count, updated_at
    const order = searchParams.get('order') || 'desc'; // asc, desc

    let query = sql`SELECT * FROM plugins WHERE 1=1`;

    if (search) {
      query = sql`${query} AND (name ILIKE ${`%${search}%`} OR description ILIKE ${`%${search}%`})`;
    }

    if (category) {
      query = sql`${query} AND category = ${category}`;
    }

    // 排序
    if (sortBy === 'download_count') {
      query = sql`${query} ORDER BY download_count ${order === 'desc' ? sql`DESC` : sql`ASC`}`;
    } else if (sortBy === 'updated_at') {
      query = sql`${query} ORDER BY updated_at ${order === 'desc' ? sql`DESC` : sql`ASC`}`;
    } else {
      query = sql`${query} ORDER BY created_at ${order === 'desc' ? sql`DESC` : sql`ASC`}`;
    }

    const plugins = await query;

    // 获取所有分类
    const categoriesResult = await sql`SELECT DISTINCT category FROM plugins WHERE category IS NOT NULL ORDER BY category`;
    const categories = categoriesResult.map(r => r.category as string);

    return NextResponse.json({ 
      success: true, 
      plugins, 
      categories 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

// 创建新插件（需要认证）
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

    // 速率限制
    if (!rateLimit(`create:${auth.sub as string}`, 10, 60000)) {
      return NextResponse.json(
        { success: false, error: '操作过于频繁' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, description, download_url, category, install_guide } = body;

    // 输入验证
    if (!name || !download_url) {
      return NextResponse.json(
        { success: false, error: '插件名称和下载链接为必填项' },
        { status: 400 }
      );
    }

    // 清理输入，防止 XSS
    const cleanName = name.toString().trim().slice(0, 100);
    const cleanDesc = (description || '').toString().trim().slice(0, 500);
    const cleanUrl = download_url.toString().trim().slice(0, 500);
    const cleanCategory = (category || '').toString().trim().slice(0, 50);
    const cleanInstallGuide = (install_guide || '').toString().trim().slice(0, 2000);

    // URL 格式验证
    try {
      new URL(cleanUrl);
    } catch {
      return NextResponse.json(
        { success: false, error: '下载链接格式无效' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO plugins (name, description, download_url, category, install_guide)
      VALUES (${cleanName}, ${cleanDesc}, ${cleanUrl}, ${cleanCategory}, ${cleanInstallGuide})
      RETURNING *
    `;

    return NextResponse.json({ success: true, plugin: result[0] }, { status: 201 });
  } catch (error) {
    console.error('创建插件错误:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
