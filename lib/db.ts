import { neon } from '@neondatabase/serverless';

// 创建数据库连接
export const sql = neon(process.env.DATABASE_URL!);
