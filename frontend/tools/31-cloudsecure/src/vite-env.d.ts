/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLOUDSECURE_API_URL: string;
  readonly VITE_API_URL: string;
  // Cloud Provider API Keys (for frontend-side validation, actual auth happens on backend)
  readonly VITE_AWS_REGION: string;
  readonly VITE_AZURE_TENANT_ID: string;
  readonly VITE_GCP_PROJECT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
