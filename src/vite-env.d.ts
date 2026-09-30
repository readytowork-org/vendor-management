/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Read by src/data/index.ts to pick the repository. */
  readonly VITE_COSTDB_SOURCE?: "mock" | "dataverse";
  /** Deep link to the companion model-driven app. */
  readonly VITE_MODEL_DRIVEN_APP_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
