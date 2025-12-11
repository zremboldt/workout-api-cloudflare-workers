import type { Logger } from "pino";

export interface AppBindings {
  Bindings: CloudflareBindings;
  Variables: {
    logger: Logger;
  };
}
