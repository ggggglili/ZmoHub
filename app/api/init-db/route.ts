import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const results: string[] = [];

    // 1. 创建插件表
    await sql`
      CREATE TABLE IF NOT EXISTS plugins (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        download_url VARCHAR(500) NOT NULL,
        category VARCHAR(50),
        install_guide TEXT,
        download_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    results.push('✓ plugins 表创建成功');

    // 2. 创建插件版本历史表
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
    results.push('✓ plugin_versions 表创建成功');

    // 3. 创建配置表
    await sql`
      CREATE TABLE IF NOT EXISTS config (
        id INTEGER PRIMARY KEY DEFAULT 1,
        qq_group_name VARCHAR(100) DEFAULT 'ZmoHub 交流群',
        qq_group_number VARCHAR(50) DEFAULT '1064830613',
        qq_group_link VARCHAR(500) DEFAULT 'https://qm.qq.com/q/xxxxxx',
        site_name VARCHAR(50) DEFAULT 'ZmoHub',
        site_description VARCHAR(500) DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    results.push('✓ config 表创建成功');

    // 4. 创建广告配置表
    await sql`
      CREATE TABLE IF NOT EXISTS ad_config (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL DEFAULT '欢迎访问 ZmoHub',
        subtitle VARCHAR(500) NOT NULL DEFAULT '发现优质插件 · 每日更新精选资源',
        enabled BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    results.push('✓ ad_config 表创建成功');

    // 5. 创建索引
    await sql`CREATE INDEX IF NOT EXISTS idx_plugins_category ON plugins(category)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_plugins_name ON plugins(name)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_plugins_download_count ON plugins(download_count DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_plugins_created_at ON plugins(created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_plugin_versions_plugin_id ON plugin_versions(plugin_id)`;
    results.push('✓ 数据库索引创建成功');

    // 6. 插入默认配置
    const configExists = await sql`SELECT 1 FROM config WHERE id = 1`;
    if (configExists.length === 0) {
      await sql`
        INSERT INTO config (id, qq_group_name, qq_group_number, qq_group_link, site_name, site_description)
        VALUES (1, 'ZmoHub 官方交流群', '1064830613', 'https://qm.qq.com/', 'ZmoHub', '发现优质插件 · 每日更新精选资源')
      `;
      results.push('✓ 默认群聊配置已插入');
    }

    // 7. 插入默认广告配置
    const adExists = await sql`SELECT 1 FROM ad_config LIMIT 1`;
    if (adExists.length === 0) {
      await sql`
        INSERT INTO ad_config (title, subtitle, enabled)
        VALUES ('欢迎访问 ZmoHub', '发现优质插件 · 每日更新精选资源', true)
      `;
      results.push('✓ 默认广告配置已插入');
    }

    return NextResponse.json({
      success: true,
      message: '数据库初始化完成',
      details: results
    });

  } catch (error) {
    console.error('数据库初始化失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      message: '数据库初始化失败，请检查 DATABASE_URL 配置'
    }, { status: 500 });
  }
}
