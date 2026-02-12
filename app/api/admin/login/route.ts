import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { rateLimit } from '@/lib/rate-limit';

// 从环境变量读取管理员账号密码
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'zmoee-fixed-secret-key-for-jwt-2024');

// 获取客户端 IP
function getClientIP(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         request.headers.get('x-real-ip') ||
         'unknown';
}

export async function POST(request: Request) {
  try {
    const clientIP = getClientIP(request);
    
    // 速率限制：每分钟最多 5 次登录尝试
    if (!rateLimit(`login:${clientIP}`, 5, 60000)) {
      return NextResponse.json(
        { success: false, message: '登录尝试过于频繁，请稍后再试' },
        { status: 429 }
      );
    }

    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: '请输入用户名和密码' },
        { status: 400 }
      );
    }

    if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, message: '服务器配置错误：未设置管理员账号' },
        { status: 500 }
      );
    }

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, message: '用户名或密码错误' },
        { status: 401 }
      );
    }

    // 生成 JWT Token
    const token = await new SignJWT({ 
      sub: ADMIN_USERNAME,
      role: 'admin'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')  // 7天有效期，更持久
      .sign(JWT_SECRET);

    return NextResponse.json({
      success: true,
      message: '登录成功',
      token
    });
  } catch (error) {
    console.error('登录错误:', error);
    return NextResponse.json(
      { success: false, message: '登录失败' },
      { status: 500 }
    );
  }
}
