declare class EdgeKV {
  constructor(options: { namespace: string });

  get(key: string, options?: { type: 'stream' }): Promise<ReadableStream | undefined>;
  get(key: string, options: { type: 'text' }): Promise<string | undefined>;
  get<T = any>(key: string, options: { type: 'json' }): Promise<T | undefined>;
  get(key: string, options: { type: 'arrayBuffer' }): Promise<ArrayBuffer | undefined>;

  put(key: string, value: string | ArrayBuffer | ReadableStream, options?: any): Promise<void>;
  delete(key: string): Promise<void>;
}
