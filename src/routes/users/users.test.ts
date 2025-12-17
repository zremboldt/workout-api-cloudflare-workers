import { env } from "cloudflare:test";
import { testClient } from "hono/testing";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { beforeEach, describe, expect, expectTypeOf, it } from "vitest";

import { ZOD_ERROR_MESSAGES } from "@/lib/constants";
import { createApp } from "@/lib/create-app";

import { users } from "./users.index";

const client = testClient(createApp().route("/", users), env);

describe("users routes", () => {
  let userId: number;
  const testUser = {
    firstName: "Mark",
    lastName: "Watney",
    email: "mark.watney@test.com",
  };

  beforeEach(async () => {
    // Test DB is ephemeral, so we seed a user for each test
    const response = await client.users.$post({
      json: testUser,
    });
    const json: any = await response.json();
    userId = json.id;
  });

  describe("get /users", () => {
    it("lists all users", async () => {
      const response = await client.users.$get();
      expect(response.status).toBe(200);

      const json = await response.json();
      expectTypeOf(json).toBeArray();
      expect(json.length).toBeGreaterThanOrEqual(1);
      expect(json[0]).toMatchObject(testUser);
    });
  });

  describe("post /users", () => {
    it("validates the body when creating", async () => {
      const response = await client.users.$post({
        json: {
          firstName: "",
          lastName: "Kapoor",
          email: "test@example.com",
        },
      });
      expect(response.status).toBe(422);
      const json: any = await response.json();
      expect(json.error.issues[0].path[0]).toBe("firstName");
      expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.TOO_SMALL);
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
      const json: any = await response.json();
      expect(json.firstName).toBe(newUser.firstName);
      expect(json.lastName).toBe(newUser.lastName);
      expect(json.email).toBe(newUser.email);
    });
  });

  describe("get /users/:id", () => {
    it("validates the id param", async () => {
      const response = await client.users[":id"].$get({
        param: {
          id: "wat",
        },
      });
      expect(response.status).toBe(422);
      const json: any = await response.json();
      expect(json.error.issues[0].path[0]).toBe("id");
      expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.EXPECTED_NUMBER);
    });

    it("returns 404 when user not found", async () => {
      const response = await client.users[":id"].$get({
        param: {
          id: 999999,
        },
      });
      expect(response.status).toBe(404);
      const json: any = await response.json();
      expect(json.message).toBe(HttpStatusPhrases.NOT_FOUND);
    });

    it("gets a single user", async () => {
      const response = await client.users[":id"].$get({
        param: {
          id: userId,
        },
      });
      expect(response.status).toBe(200);
      const json: any = await response.json();
      expect(json.firstName).toBe(testUser.firstName);
      expect(json.lastName).toBe(testUser.lastName);
      expect(json.email).toBe(testUser.email);
    });
  });

  describe("patch /users/:id", () => {
    it("validates the body when updating", async () => {
      const response = await client.users[":id"].$patch({
        param: {
          id: userId,
        },
        json: {
          firstName: "",
        },
      });
      expect(response.status).toBe(422);
      const json: any = await response.json();
      expect(json.error.issues[0].path[0]).toBe("firstName");
      expect(json.error.issues[0].code).toBe("too_small");
    });

    it("validates the id param", async () => {
      const response = await client.users[":id"].$patch({
        param: {
          id: "wat",
        },
        json: {
          firstName: "Updated",
        },
      });
      expect(response.status).toBe(422);
      const json: any = await response.json();
      expect(json.error.issues[0].path[0]).toBe("id");
      expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.EXPECTED_NUMBER);
    });

    it("returns 404 when user not found", async () => {
      const response = await client.users[":id"].$patch({
        param: {
          id: 999999,
        },
        json: {
          firstName: "Updated",
        },
      });
      expect(response.status).toBe(404);
      const json: any = await response.json();
      expect(json.message).toBe(HttpStatusPhrases.NOT_FOUND);
    });

    it("updates a single property of a user", async () => {
      const response = await client.users[":id"].$patch({
        param: {
          id: userId,
        },
        json: {
          firstName: "Mark",
        },
      });
      expect(response.status).toBe(200);
      const json: any = await response.json();
      expect(json.firstName).toBe("Mark");
      expect(json.lastName).toBe(testUser.lastName);
      expect(json.email).toBe(testUser.email);
    });
  });

  describe("delete /users/:id", () => {
    it("validates the id when deleting", async () => {
      const response = await client.users[":id"].$delete({
        param: {
          id: "wat",
        },
      });
      expect(response.status).toBe(422);
      const json: any = await response.json();
      expect(json.error.issues[0].path[0]).toBe("id");
      expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.EXPECTED_NUMBER);
    });

    it("returns 404 when user not found", async () => {
      const response = await client.users[":id"].$delete({
        param: {
          id: 999999,
        },
      });
      expect(response.status).toBe(404);
      const json: any = await response.json();
      expect(json.message).toBe(HttpStatusPhrases.NOT_FOUND);
    });

    it("removes a user", async () => {
      const response = await client.users[":id"].$delete({
        param: {
          id: userId,
        },
      });
      expect(response.status).toBe(204);
    });
  });
});
