interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

export function rateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1分钟
): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetTime) {
    // 新窗口
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false; // 超过限制
  }

  entry.count++;
  return true;
}

// 清理过期的条目（每10分钟运行一次）
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 600000);

export function getRateLimitInfo(identifier: string): { remaining: number; resetTime: number } {
  const entry = rateLimitMap.get(identifier);
  if (!entry) {
    return { remaining: 10, resetTime: Date.now() + 60000 };
  }
  return {
    remaining: Math.max(0, 10 - entry.count),
    resetTime: entry.resetTime
  };
}
