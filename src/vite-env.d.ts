/// <reference types="vite/client" />

// Tipos para variables de entorno inyectadas por Vite (ej. VITE_GOOGLE_API_KEY).
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_GOOGLE_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "pdfjs-dist/build/pdf.worker.min?url" {
  const workerSrc: string;
  export default workerSrc;
}

