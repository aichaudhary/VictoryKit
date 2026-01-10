/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
  readonly GEMINI_API_KEY: string;
  readonly VITE_API_URL: string;
  readonly VITE_ML_API_URL: string;
  readonly VITE_AI_API_URL: string;
  readonly VITE_WS_URL: string;
  // Tool-specific URLs
  readonly [key: `VITE_${string}_API_URL`]: string;
  readonly [key: `VITE_${string}_WS_URL`]: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
