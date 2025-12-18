import { env } from "cloudflare:test";
import { testClient } from "hono/testing";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { beforeEach, describe, expect, expectTypeOf, it } from "vitest";

import { ZOD_ERROR_MESSAGES } from "@/lib/constants";
import { createApp } from "@/lib/create-app";

import { exercises } from "./exercises.index";

const client = testClient(createApp().route("/", exercises), env);

// TODO
// Finish converting this test file from users to exercises

describe("exercises routes", () => {
  let exerciseId: number;
  const testExercise = {
    firstName: "Mark",
    lastName: "Watney",
    email: "mark.watney@test.com",
  };

  beforeEach(async () => {
    // Test DB is ephemeral, so we seed an exercise for each test
    const response = await client.exercises.$post({
      json: testExercise,
    });
    const json: any = await response.json();
    exerciseId = json.id;
  });

  describe("get /exercises", () => {
    it("lists all exercises", async () => {
      const response = await client.exercises.$get();
      expect(response.status).toBe(200);

      const json = await response.json();
      expectTypeOf(json).toBeArray();
      expect(json.length).toBeGreaterThanOrEqual(1);
      expect(json[0]).toMatchObject(testExercise);
    });
  });

  describe("post /exercises", () => {
    it("validates the body when creating", async () => {
      const response = await client.exercises.$post({
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

    it("creates a exercise", async () => {
      const newExercise = {
        firstName: "Mindy",
        lastName: "Park",
        email: "mindy.park@test.com",
      };

      const response = await client.exercises.$post({
        json: newExercise,
      });

      expect(response.status).toBe(200);
      const json: any = await response.json();
      expect(json.firstName).toBe(newExercise.firstName);
      expect(json.lastName).toBe(newExercise.lastName);
      expect(json.email).toBe(newExercise.email);
    });
  });

  describe("get /exercises/:id", () => {
    it("validates the id param", async () => {
      const response = await client.exercises[":id"].$get({
        param: {
          id: "wat",
        },
      });
      expect(response.status).toBe(422);
      const json: any = await response.json();
      expect(json.error.issues[0].path[0]).toBe("id");
      expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.EXPECTED_NUMBER);
    });

    it("returns 404 when exercise not found", async () => {
      const response = await client.exercises[":id"].$get({
        param: {
          id: 999999,
        },
      });
      expect(response.status).toBe(404);
      const json: any = await response.json();
      expect(json.message).toBe(HttpStatusPhrases.NOT_FOUND);
    });

    it("gets a single exercise", async () => {
      const response = await client.exercises[":id"].$get({
        param: {
          id: exerciseId,
        },
      });
      expect(response.status).toBe(200);
      const json: any = await response.json();
      expect(json.firstName).toBe(testExercise.firstName);
      expect(json.lastName).toBe(testExercise.lastName);
      expect(json.email).toBe(testExercise.email);
    });
  });

  describe("patch /exercises/:id", () => {
    it("validates the body when updating", async () => {
      const response = await client.exercises[":id"].$patch({
        param: {
          id: exerciseId,
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
      const response = await client.exercises[":id"].$patch({
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

    it("returns 404 when exercise not found", async () => {
      const response = await client.exercises[":id"].$patch({
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

    it("updates a single property of a exercise", async () => {
      const response = await client.exercises[":id"].$patch({
        param: {
          id: exerciseId,
        },
        json: {
          firstName: "Mark",
        },
      });
      expect(response.status).toBe(200);
      const json: any = await response.json();
      expect(json.firstName).toBe("Mark");
      expect(json.lastName).toBe(testExercise.lastName);
      expect(json.email).toBe(testExercise.email);
    });
  });

  describe("delete /exercises/:id", () => {
    it("validates the id when deleting", async () => {
      const response = await client.exercises[":id"].$delete({
        param: {
          id: "wat",
        },
      });
      expect(response.status).toBe(422);
      const json: any = await response.json();
      expect(json.error.issues[0].path[0]).toBe("id");
      expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.EXPECTED_NUMBER);
    });

    it("returns 404 when exercise not found", async () => {
      const response = await client.exercises[":id"].$delete({
        param: {
          id: 999999,
        },
      });
      expect(response.status).toBe(404);
      const json: any = await response.json();
      expect(json.message).toBe(HttpStatusPhrases.NOT_FOUND);
    });

    it("removes a exercise", async () => {
      const response = await client.exercises[":id"].$delete({
        param: {
          id: exerciseId,
        },
      });
      expect(response.status).toBe(204);
    });
  });
});
