import type { AppRouteHandler } from "@/lib/types";

import type { ListRoute } from "./users.routes";

export const list: AppRouteHandler<ListRoute> = (c) => {
  return c.json([
    { firstName: "John", lastName: "Doe" },
    { firstName: "Jane", lastName: "Smith" },
  ]);
};
