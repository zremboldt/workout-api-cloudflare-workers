declare module "cloudflare:test" {
  interface ProvidedEnv extends CloudflareBindings {
    TEST_MIGRATIONS: D1Migration[];
  }
}

export {};
