'use server'

import { redis } from '#/lib/redis.ts'

export type RateLimitResult = {
	success: boolean
	remaining: number
	resetAt: number
}

export async function checkRateLimit(
	key: string,
	limit: number,
	windowSeconds: number,
): Promise<RateLimitResult> {
	const current = await redis.incr(key)

	if (current === 1) {
		await redis.expire(key, windowSeconds)
	}

	const ttl = await redis.ttl(key)
	const remaining = Math.max(0, limit - current)
	const resetAt = Date.now() + ttl * 1000

	return {
		success: current <= limit,
		remaining,
		resetAt,
	}
}

export function buildRateLimitKey(prefix: string, identifier: string): string {
	return `rl:${prefix}:${identifier}`
}
