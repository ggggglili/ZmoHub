import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode('zmoee-fixed-secret-key-for-jwt-2024');

export async function verifyAuth(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '') ||
                request.cookies.get('admin_token')?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

export function requireAuth(handler: Function) {
  return async (request: NextRequest, context: any) => {
    const auth = await verifyAuth(request);
    
    if (!auth) {
      return NextResponse.json(
        { success: false, message: '未授权访问' },
        { status: 401 }
      );
    }
    
    return handler(request, context, auth);
  };
}
