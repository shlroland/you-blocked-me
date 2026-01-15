declare class EdgeKV {
  constructor(options: { namespace: string });

  get(key: string, options?: { type: 'stream' }): Promise<ReadableStream | undefined>;
  get(key: string, options: { type: 'text' }): Promise<string | undefined>;
  get<T = any>(key: string, options: { type: 'json' }): Promise<T | undefined>;
  get(key: string, options: { type: 'arrayBuffer' }): Promise<ArrayBuffer | undefined>;

  put(key: string, value: string | ArrayBuffer | ReadableStream, options?: any): Promise<void>;
  delete(key: string): Promise<void>;
}

interface EsaCache {
  put(key: string | Request, value: Response): Promise<void>
  get(key: string | Request): Promise<Response | undefined>
  delete(key: string | Request): Promise<boolean>
}

declare var cache: EsaCache;
