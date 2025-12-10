import type { Logger } from "pino";

export interface AppBindings {
  Bindings: Omit<CloudflareBindings, "ENVIRONMENT"> & {
    ENVIRONMENT: string;
  };
  Variables: {
    logger: Logger;
  };
}
