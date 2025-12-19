import { env } from "cloudflare:test";
import { testClient } from "hono/testing";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { beforeEach, describe, expect, expectTypeOf, it } from "vitest";

import { ZOD_ERROR_MESSAGES } from "@/lib/constants";
import { createApp } from "@/lib/create-app";

import { exercises } from "../exercises/exercises.index";
import { users } from "../users/users.index";
import { sets } from "./sets.index";

// Create app with users, exercises, and sets routes
const app = createApp()
  .route("/", users)
  .route("/", exercises)
  .route("/", sets);

const client = testClient(app, env);

describe("sets routes", () => {
  let exerciseId: number;
  let setId: number;

  beforeEach(async () => {
    // Create a test user first (since exercises require a userId)
    await client.users.$post({
      json: {
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
      },
    });

    // Create a test exercise (since sets require an exerciseId)
    const exerciseResponse = await client.exercises.$post({
      json: {
        name: "Bench Press",
        description: "Compound chest exercise",
      },
    });
    const exerciseJson: any = await exerciseResponse.json();
    exerciseId = exerciseJson.id;

    // Test DB is ephemeral, so we seed a set for each test
    const setResponse = await client.sets.$post({
      json: { exerciseId, reps: 10, weight: 135 },
    });
    const setJson: any = await setResponse.json();
    setId = setJson.id;
  });

  describe("get /sets", () => {
    it("lists all sets", async () => {
      const response = await client.sets.$get();
      expect(response.status).toBe(200);

      const json = await response.json();
      expectTypeOf(json).toBeArray();
      expect(json.length).toBeGreaterThanOrEqual(1);
      expect(json[0]).toMatchObject({ reps: 10, weight: 135 });
    });
  });

  describe("post /sets", () => {
    it("validates the body when creating - missing exerciseId", async () => {
      const response = await client.sets.$post({
        json: {
          reps: 10,
          weight: 100,
        } as any,
      });
      expect(response.status).toBe(422);
      const json: any = await response.json();
      expect(json.error.issues[0].path[0]).toBe("exerciseId");
      expect(json.error.issues[0].message).toBe("Invalid input: expected number, received undefined");
    });

    it("validates the body when creating - missing reps", async () => {
      const response = await client.sets.$post({
        json: {
          exerciseId: 1,
          weight: 100,
        } as any,
      });
      expect(response.status).toBe(422);
      const json: any = await response.json();
      expect(json.error.issues[0].path[0]).toBe("reps");
      expect(json.error.issues[0].message).toBe("Invalid input: expected number, received undefined");
    });

    it("validates the body when creating - reps too small", async () => {
      const response = await client.sets.$post({
        json: {
          exerciseId: 1,
          reps: 0,
          weight: 100,
        },
      });
      expect(response.status).toBe(422);
      const json: any = await response.json();
      expect(json.error.issues[0].path[0]).toBe("reps");
      expect(json.error.issues[0].message).toBe("Too small: expected number to be >=1");
    });

    it("creates a set with weight", async () => {
      const newSet = {
        exerciseId,
        reps: 8,
        weight: 185,
      };

      const response = await client.sets.$post({
        json: newSet,
      });

      expect(response.status).toBe(200);
      const json: any = await response.json();
      expect(json.reps).toBe(newSet.reps);
      expect(json.weight).toBe(newSet.weight);
      expect(json.exerciseId).toBe(exerciseId);
    });

    it("creates a set without weight (bodyweight exercise)", async () => {
      const newSet = {
        exerciseId,
        reps: 15,
      };

      const response = await client.sets.$post({
        json: newSet,
      });

      expect(response.status).toBe(200);
      const json: any = await response.json();
      expect(json.reps).toBe(newSet.reps);
      expect(json.weight).toBeNull();
      expect(json.exerciseId).toBe(exerciseId);
    });
  });

  describe("get /sets/:id", () => {
    it("validates the id param", async () => {
      const response = await client.sets[":id"].$get({
        param: {
          id: "wat",
        },
      });
      expect(response.status).toBe(422);
      const json: any = await response.json();
      expect(json.error.issues[0].path[0]).toBe("id");
      expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.EXPECTED_NUMBER);
    });

    it("returns 404 when set not found", async () => {
      const response = await client.sets[":id"].$get({
        param: {
          id: 999999,
        },
      });
      expect(response.status).toBe(404);
      const json: any = await response.json();
      expect(json.message).toBe(HttpStatusPhrases.NOT_FOUND);
    });

    it("gets a single set", async () => {
      const response = await client.sets[":id"].$get({
        param: {
          id: setId,
        },
      });
      expect(response.status).toBe(200);
      const json: any = await response.json();
      expect(json.reps).toBe(10);
      expect(json.weight).toBe(135);
    });
  });

  describe("patch /sets/:id", () => {
    it("validates the body when updating", async () => {
      const response = await client.sets[":id"].$patch({
        param: {
          id: setId,
        },
        json: {
          reps: 0,
        },
      });
      expect(response.status).toBe(422);
      const json: any = await response.json();
      expect(json.error.issues[0].path[0]).toBe("reps");
      expect(json.error.issues[0].code).toBe("too_small");
    });

    it("validates the id param", async () => {
      const response = await client.sets[":id"].$patch({
        param: {
          id: "wat",
        },
        json: {
          reps: 12,
        },
      });
      expect(response.status).toBe(422);
      const json: any = await response.json();
      expect(json.error.issues[0].path[0]).toBe("id");
      expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.EXPECTED_NUMBER);
    });

    it("returns 404 when set not found", async () => {
      const response = await client.sets[":id"].$patch({
        param: {
          id: 999999,
        },
        json: {
          reps: 12,
        },
      });
      expect(response.status).toBe(404);
      const json: any = await response.json();
      expect(json.message).toBe(HttpStatusPhrases.NOT_FOUND);
    });

    it("updates a single property of a set", async () => {
      const response = await client.sets[":id"].$patch({
        param: {
          id: setId,
        },
        json: {
          reps: 12,
        },
      });
      expect(response.status).toBe(200);
      const json: any = await response.json();
      expect(json.reps).toBe(12);
      expect(json.weight).toBe(135);
    });

    it("updates multiple properties of a set", async () => {
      const response = await client.sets[":id"].$patch({
        param: {
          id: setId,
        },
        json: {
          reps: 8,
          weight: 225,
        },
      });
      expect(response.status).toBe(200);
      const json: any = await response.json();
      expect(json.reps).toBe(8);
      expect(json.weight).toBe(225);
    });
  });

  describe("delete /sets/:id", () => {
    it("validates the id when deleting", async () => {
      const response = await client.sets[":id"].$delete({
        param: {
          id: "wat",
        },
      });
      expect(response.status).toBe(422);
      const json: any = await response.json();
      expect(json.error.issues[0].path[0]).toBe("id");
      expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.EXPECTED_NUMBER);
    });

    it("returns 404 when set not found", async () => {
      const response = await client.sets[":id"].$delete({
        param: {
          id: 999999,
        },
      });
      expect(response.status).toBe(404);
      const json: any = await response.json();
      expect(json.message).toBe(HttpStatusPhrases.NOT_FOUND);
    });

    it("removes a set", async () => {
      const response = await client.sets[":id"].$delete({
        param: {
          id: setId,
        },
      });
      expect(response.status).toBe(204);
    });
  });
});
