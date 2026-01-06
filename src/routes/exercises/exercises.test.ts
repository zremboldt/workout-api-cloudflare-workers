import { env } from "cloudflare:test";
import { testClient } from "hono/testing";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { beforeEach, describe, expect, expectTypeOf, it } from "vitest";

import { ZOD_ERROR_MESSAGES } from "@/lib/constants";
import { createApp } from "@/lib/create-app";

import { tags } from "../tags/tags.index";
import { users } from "../users/users.index";
import { exercises } from "./exercises.index";

// Create app with users, exercises, and tags routes
const app = createApp()
  .route("/", users)
  .route("/", exercises)
  .route("/", tags);

const client = testClient(app, env);

describe("exercises routes", () => {
  let exerciseId: number;
  let tagId: number;
  const testExercise = {
    name: "Bench Press",
    description: "Compound chest exercise",
  };
  const testTag = {
    name: "Chest",
    description: "Chest exercises",
  };

  beforeEach(async () => {
    // Create a test user first (since exercises require a userId)
    await client.users.$post({
      json: {
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
      },
    });

    // Create a test tag
    const tagResponse = await client.tags.$post({
      json: testTag,
    });
    const tagJson: any = await tagResponse.json();
    tagId = tagJson.id;

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
          name: "",
          description: "Some description",
        },
      });
      expect(response.status).toBe(422);
      const json: any = await response.json();
      expect(json.error.issues[0].path[0]).toBe("name");
      expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.TOO_SMALL);
    });

    it("creates an exercise", async () => {
      const newExercise = {
        name: "Squat",
        description: "Compound leg exercise",
      };

      const response = await client.exercises.$post({
        json: newExercise,
      });

      expect(response.status).toBe(200);
      const json: any = await response.json();
      expect(json.name).toBe(newExercise.name);
      expect(json.description).toBe(newExercise.description);
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
      expect(json.name).toBe(testExercise.name);
      expect(json.description).toBe(testExercise.description);
    });
  });

  describe("patch /exercises/:id", () => {
    it("validates the body when updating", async () => {
      const response = await client.exercises[":id"].$patch({
        param: {
          id: exerciseId,
        },
        json: {
          name: "",
        },
      });
      expect(response.status).toBe(422);
      const json: any = await response.json();
      expect(json.error.issues[0].path[0]).toBe("name");
      expect(json.error.issues[0].code).toBe("too_small");
    });

    it("validates the id param", async () => {
      const response = await client.exercises[":id"].$patch({
        param: {
          id: "wat",
        },
        json: {
          name: "Updated",
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
          name: "Updated",
        },
      });
      expect(response.status).toBe(404);
      const json: any = await response.json();
      expect(json.message).toBe(HttpStatusPhrases.NOT_FOUND);
    });

    it("updates a single property of an exercise", async () => {
      const response = await client.exercises[":id"].$patch({
        param: {
          id: exerciseId,
        },
        json: {
          name: "Updated Bench Press",
        },
      });
      expect(response.status).toBe(200);
      const json: any = await response.json();
      expect(json.name).toBe("Updated Bench Press");
      expect(json.description).toBe(testExercise.description);
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

    it("removes an exercise", async () => {
      const response = await client.exercises[":id"].$delete({
        param: {
          id: exerciseId,
        },
      });
      expect(response.status).toBe(204);
    });
  });

  describe("post /exercises/:id/tags/:tagId", () => {
    it("adds a tag to an exercise", async () => {
      const response = await client.exercises[":id"].tags[":tagId"].$post({
        param: {
          id: exerciseId,
          tagId,
        },
      });
      expect(response.status).toBe(201);
      const json: any = await response.json();
      expect(json.tags).toBeDefined();
      expect(json.tags.length).toBe(1);
      expect(json.tags[0].id).toBe(tagId);
    });

    it("returns 404 when exercise not found", async () => {
      const response = await client.exercises[":id"].tags[":tagId"].$post({
        param: {
          id: 999999,
          tagId,
        },
      });
      expect(response.status).toBe(404);
      const json: any = await response.json();
      expect(json.message).toBe("Exercise not found");
    });

    it("returns 404 when tag not found", async () => {
      const response = await client.exercises[":id"].tags[":tagId"].$post({
        param: {
          id: exerciseId,
          tagId: 999999,
        },
      });
      expect(response.status).toBe(404);
      const json: any = await response.json();
      expect(json.message).toBe("Tag not found");
    });

    it("returns 409 when tag already added", async () => {
      // Add tag first
      await client.exercises[":id"].tags[":tagId"].$post({
        param: {
          id: exerciseId,
          tagId,
        },
      });

      // Try to add again
      const response = await client.exercises[":id"].tags[":tagId"].$post({
        param: {
          id: exerciseId,
          tagId,
        },
      });
      expect(response.status).toBe(409);
      const json: any = await response.json();
      expect(json.message).toBe("Tag already added to exercise");
    });
  });

  describe("delete /exercises/:id/tags/:tagId", () => {
    it("removes a tag from an exercise", async () => {
      // Add tag first
      await client.exercises[":id"].tags[":tagId"].$post({
        param: {
          id: exerciseId,
          tagId,
        },
      });

      // Remove it
      const response = await client.exercises[":id"].tags[":tagId"].$delete({
        param: {
          id: exerciseId,
          tagId,
        },
      });
      expect(response.status).toBe(204);
    });

    it("returns 404 when association not found", async () => {
      const response = await client.exercises[":id"].tags[":tagId"].$delete({
        param: {
          id: exerciseId,
          tagId,
        },
      });
      expect(response.status).toBe(404);
      const json: any = await response.json();
      expect(json.message).toBe("Exercise, tag, or association not found");
    });
  });

  describe("exercises with tags", () => {
    it("lists exercises with their tags", async () => {
      // Add tag to exercise
      await client.exercises[":id"].tags[":tagId"].$post({
        param: {
          id: exerciseId,
          tagId,
        },
      });

      const response = await client.exercises.$get();
      expect(response.status).toBe(200);

      const json: any = await response.json();
      expect(Array.isArray(json)).toBe(true);
      const exerciseWithTag = json.find((e: any) => e.id === exerciseId);
      expect(exerciseWithTag.tags).toBeDefined();
      expect(exerciseWithTag.tags.length).toBe(1);
      expect(exerciseWithTag.tags[0].name).toBe(testTag.name);
    });

    it("gets a single exercise with its tags", async () => {
      // Add tag to exercise
      await client.exercises[":id"].tags[":tagId"].$post({
        param: {
          id: exerciseId,
          tagId,
        },
      });

      const response = await client.exercises[":id"].$get({
        param: {
          id: exerciseId,
        },
      });
      expect(response.status).toBe(200);

      const json: any = await response.json();
      expect(json.tags).toBeDefined();
      expect(json.tags.length).toBe(1);
      expect(json.tags[0].name).toBe(testTag.name);
    });
  });
});
