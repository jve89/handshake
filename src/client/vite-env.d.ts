/// <reference types="vite/client" />

// Extend Vite env typing with our custom vars.
// Note: only VITE_* are exposed to the client by Vite.
interface ImportMetaEnv {
  readonly VITE_DEV_EMAIL?: string;
  readonly VITE_DEV_PASSWORD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
