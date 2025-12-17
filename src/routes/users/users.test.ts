import { env } from "cloudflare:test";
import { testClient } from "hono/testing";
import { beforeEach, describe, expect, expectTypeOf, it } from "vitest";

import { createApp } from "@/lib/create-app";

import { users } from "./users.index";

const client = testClient(createApp().route("/", users), env);

describe("users", () => {
  const testUser = {
    firstName: "Mark",
    lastName: "Watney",
    email: "mark.watney@test.com",
  };

  beforeEach(async () => {
    // Test DB is ephemeral, so we seed a user for each test
    await client.users.$post({
      json: testUser,
    });
  });

  it("lists all users", async () => {
    const response = await client.users.$get();
    expect(response.status).toBe(200);

    const json = await response.json();
    expectTypeOf(json).toBeArray();
    expect(json).toHaveLength(1);
    expect(json[0]).toMatchObject(testUser);
  });

  it("creates a user", async () => {
    const newUser = {
      firstName: "Mindy",
      lastName: "Park",
      email: "mindy.park@test.com",
    };

    const response = await client.users.$post({
      json: newUser,
    });

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toMatchObject(newUser);
  });
});
