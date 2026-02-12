-- ===========================================
-- ZmoHub 数据库初始化脚本
-- 适用于 PostgreSQL
-- ===========================================

-- 删除现有表（如果存在）
DROP TABLE IF EXISTS plugin_versions CASCADE;
DROP TABLE IF EXISTS ad_config CASCADE;
DROP TABLE IF EXISTS config CASCADE;
DROP TABLE IF EXISTS plugins CASCADE;

-- ===========================================
-- 1. 插件表 (plugins)
-- ===========================================
CREATE TABLE plugins (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    download_url VARCHAR(500) NOT NULL,
    category VARCHAR(50),
    install_guide TEXT,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插件表索引
CREATE INDEX idx_plugins_category ON plugins(category);
CREATE INDEX idx_plugins_name ON plugins(name);
CREATE INDEX idx_plugins_description ON plugins(description);
CREATE INDEX idx_plugins_download_count ON plugins(download_count DESC);
CREATE INDEX idx_plugins_created_at ON plugins(created_at DESC);
CREATE INDEX idx_plugins_updated_at ON plugins(updated_at DESC);

-- ===========================================
-- 2. 插件版本历史表 (plugin_versions)
-- ===========================================
CREATE TABLE plugin_versions (
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
);

CREATE INDEX idx_plugin_versions_plugin_id ON plugin_versions(plugin_id);

-- ===========================================
-- 3. 配置表 (config) - 群聊配置 + 站点配置
-- ===========================================
CREATE TABLE config (
    id INTEGER PRIMARY KEY DEFAULT 1,
    qq_group_name VARCHAR(100) DEFAULT 'ZmoHub 交流群',
    qq_group_number VARCHAR(50) DEFAULT '1064830613',
    qq_group_link VARCHAR(500) DEFAULT 'https://qm.qq.com/q/xxxxxx',
    site_name VARCHAR(50) DEFAULT 'ZmoHub',
    site_description VARCHAR(500) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入默认配置
INSERT INTO config (id, qq_group_name, qq_group_number, qq_group_link, site_name, site_description) VALUES
(1, 'ZmoHub 官方交流群', '1064830613', 'https://qm.qq.com/', 'ZmoHub', '发现优质插件 · 每日更新精选资源');

-- ===========================================
-- 4. 广告配置表 (ad_config)
-- ===========================================
CREATE TABLE ad_config (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL DEFAULT '欢迎访问 ZmoHub',
    subtitle VARCHAR(500) NOT NULL DEFAULT '发现优质插件 · 每日更新精选资源',
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入默认广告配置
INSERT INTO ad_config (title, subtitle, enabled) VALUES
('欢迎访问 ZmoHub', '发现优质插件 · 每日更新精选资源', true);

-- ===========================================
-- 创建更新时间触发器函数
-- ===========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要自动更新 updated_at 的表创建触发器
CREATE TRIGGER update_plugins_updated_at BEFORE UPDATE ON plugins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_config_updated_at BEFORE UPDATE ON config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ad_config_updated_at BEFORE UPDATE ON ad_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- 完成
-- ===========================================
SELECT '数据库初始化完成！' as message;
