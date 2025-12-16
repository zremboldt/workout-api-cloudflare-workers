import { env } from "cloudflare:test";
import { testClient } from "hono/testing";
import { describe, expect, expectTypeOf, it } from "vitest";

import { createTestApp } from "@/lib/create-app";

import { users } from "./users.index";

const client = testClient(createTestApp(users), { env });

describe("users list", () => {
  // it("responds with an array", async () => {
  //   const testRouter = createTestApp(users);
  //   const response = await testRouter.request("/users", {}, env);
  //   const result = await response.json();
  //   // @ts-expect-error
  //   expectTypeOf(result).toBeArray();
  // });

  const firstName = "John";
  const lastName = "Maxfield";
  const email = "john.maxfield@example.com";

  it("post /users creates a user", async () => {
    const response = await client.users.$post({
      json: {
        firstName,
        lastName,
        email,
      },
    });
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      expect(json.firstName).toBe(firstName);
      expect(json.lastName).toBe(lastName);
      expect(json.email).toBe(email);
    }
  });

  it("get /users lists all users", async () => {
    const response = await client.users.$get();
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      expectTypeOf(json).toBeArray();
      expect(json.length).toBe(1);
    }
  });
});
