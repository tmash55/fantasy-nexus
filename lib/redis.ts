import { Redis } from "@upstash/redis"

// Initialize Redis client via Upstash SDK to match other apps
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Keep compatibility helpers used by our API routes
export async function redisGetJSON<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get<T>(key)
    return (data as T) ?? null
  } catch (error) {
    console.error(`[redis] get JSON failed for key: ${key}`, error)
    return null
  }
}

export async function redisGetRaw(key: string): Promise<unknown | null> {
  try {
    const data = await redis.get<unknown>(key)
    return data ?? null
  } catch (error) {
    console.error(`[redis] get raw failed for key: ${key}`, error)
    return null
  }
}


