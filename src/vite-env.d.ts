/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PAKASIR_PROJECT_ID: string;
  readonly VITE_PAKASIR_API_KEY: string;
  readonly VITE_PTERODACTYL_DOMAIN: string;
  readonly VITE_PTERODACTYL_API_KEY: string;
  readonly VITE_TELEGRAM_BOT_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
