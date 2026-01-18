export const registerHmr = async (dispose: () => Promise<void>) => {
  const globalHmr = globalThis as unknown as {
    __EFFECT_DISPOSE__?: () => Promise<void>;
  };
  if (globalHmr.__EFFECT_DISPOSE__) {
    await globalHmr.__EFFECT_DISPOSE__();
    globalHmr.__EFFECT_DISPOSE__ = undefined;
  }

  globalHmr.__EFFECT_DISPOSE__ = dispose;
}
