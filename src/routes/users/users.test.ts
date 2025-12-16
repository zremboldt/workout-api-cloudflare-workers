/* eslint-disable ts/ban-ts-comment */
import { describe, expect, expectTypeOf, it } from "vitest";

import { createTestApp } from "@/lib/create-app";

import { users } from "./users.index";

describe("users list", () => {
  it("responds with an array", async () => {
    const testRouter = createTestApp(users);
    const response = await testRouter.request("/users");
    const result = await response.json();
    // @ts-expect-error
    expectTypeOf(result).toBeArray();
  });
});
