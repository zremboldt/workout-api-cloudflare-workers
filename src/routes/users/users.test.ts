import { SELF } from "cloudflare:test";
import { beforeEach, describe, expect, expectTypeOf, it } from "vitest";

describe("users", () => {
  const testUser = {
    firstName: "Mark",
    lastName: "Watney",
    email: "mark.watney@test.com",
  };

  beforeEach(async () => {
    // Test DB is ephemeral, so we seed a user for each test
    await SELF.fetch("https://test/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testUser),
    });
  });

  it("lists all users", async () => {
    const response = await SELF.fetch("https://test/users");
    expect(response.status).toBe(200);

    const users = await response.json();
    expectTypeOf(users).toBeArray();
    expect(users).toHaveLength(1);
    expect(users[0]).toMatchObject(testUser);
  });

  it("creates a user", async () => {
    const response = await SELF.fetch("https://test/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@example.com",
      }),
    });

    expect(response.status).toBe(200);
    const user = await response.json();
    expect(user).toMatchObject({
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com",
    });
  });
});
