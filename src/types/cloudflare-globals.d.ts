// 让 Cloudflare Workers 的类型覆盖 DOM 类型
import type { CacheStorage as CFCacheStorage, Cache as CFCache } from '@cloudflare/workers-types';

declare global {
  // 覆盖全局 caches 对象的类型
  const caches: CFCacheStorage;

  // 如果需要，也可以覆盖 Cache 类型
  // type Cache = CFCache;
}

export { };
