import { env } from "cloudflare:test";
import { testClient } from "hono/testing";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { beforeEach, describe, expect, expectTypeOf, it } from "vitest";

import { ZOD_ERROR_MESSAGES } from "@/lib/constants";
import { createApp } from "@/lib/create-app";

import { users } from "../users/users.index";
import { tags } from "./tags.index";

// Create app with both users and tags routes because tags depend on users (for foreign key)
const app = createApp()
  .route("/", users)
  .route("/", tags);

const client = testClient(app, env);

describe("tags routes", () => {
  let tagId: number;
  const testTag = {
    name: "Upper Body",
    description: "Exercises for upper body strength",
  };

  beforeEach(async () => {
    // Create a test user first (since tags require a userId)
    await client.users.$post({
      json: {
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
      },
    });

    // Test DB is ephemeral, so we seed a tag for each test
    const response = await client.tags.$post({
      json: testTag,
    });
    const json: any = await response.json();
    tagId = json.id;
  });

  describe("get /tags", () => {
    it("lists all tags", async () => {
      const response = await client.tags.$get();
      expect(response.status).toBe(200);

      const json = await response.json();
      expectTypeOf(json).toBeArray();
      expect(json.length).toBeGreaterThanOrEqual(1);
      expect(json[0]).toMatchObject(testTag);
    });
  });

  describe("post /tags", () => {
    it("validates the body when creating", async () => {
      const response = await client.tags.$post({
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

    it("creates a tag", async () => {
      const newTag = {
        name: "Lower Body",
        description: "Exercises for lower body strength",
      };

      const response = await client.tags.$post({
        json: newTag,
      });

      expect(response.status).toBe(200);
      const json: any = await response.json();
      expect(json.name).toBe(newTag.name);
      expect(json.description).toBe(newTag.description);
    });
  });

  describe("get /tags/:id", () => {
    it("validates the id param", async () => {
      const response = await client.tags[":id"].$get({
        param: {
          id: "wat",
        },
      });
      expect(response.status).toBe(422);
      const json: any = await response.json();
      expect(json.error.issues[0].path[0]).toBe("id");
      expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.EXPECTED_NUMBER);
    });

    it("returns 404 when tag not found", async () => {
      const response = await client.tags[":id"].$get({
        param: {
          id: 99999,
        },
      });
      expect(response.status).toBe(404);
      const json: any = await response.json();
      expect(json.message).toBe(HttpStatusPhrases.NOT_FOUND);
    });

    it("returns a tag", async () => {
      const response = await client.tags[":id"].$get({
        param: {
          id: tagId,
        },
      });
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json).toMatchObject(testTag);
    });
  });

  describe("patch /tags/:id", () => {
    it("validates the body when updating", async () => {
      const response = await client.tags[":id"].$patch({
        param: {
          id: tagId,
        },
        json: {
          name: "",
        },
      });
      expect(response.status).toBe(422);
      const json: any = await response.json();
      expect(json.error.issues[0].path[0]).toBe("name");
      expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.TOO_SMALL);
    });

    it("returns 404 when tag not found", async () => {
      const response = await client.tags[":id"].$patch({
        param: {
          id: 99999,
        },
        json: {
          name: "Updated Name",
        },
      });
      expect(response.status).toBe(404);
      const json: any = await response.json();
      expect(json.message).toBe(HttpStatusPhrases.NOT_FOUND);
    });

    it("updates a tag", async () => {
      const response = await client.tags[":id"].$patch({
        param: {
          id: tagId,
        },
        json: {
          name: "Updated Upper Body",
        },
      });
      expect(response.status).toBe(200);
      const json: any = await response.json();
      expect(json.name).toBe("Updated Upper Body");
    });
  });

  describe("delete /tags/:id", () => {
    it("validates the id param", async () => {
      const response = await client.tags[":id"].$delete({
        param: {
          id: "wat",
        },
      });
      expect(response.status).toBe(422);
      const json: any = await response.json();
      expect(json.error.issues[0].path[0]).toBe("id");
      expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.EXPECTED_NUMBER);
    });

    it("returns 404 when tag not found", async () => {
      const response = await client.tags[":id"].$delete({
        param: {
          id: 99999,
        },
      });
      expect(response.status).toBe(404);
      const json: any = await response.json();
      expect(json.message).toBe(HttpStatusPhrases.NOT_FOUND);
    });

    it("deletes a tag", async () => {
      const response = await client.tags[":id"].$delete({
        param: {
          id: tagId,
        },
      });
      expect(response.status).toBe(204);

      // Verify it's gone
      const getResponse = await client.tags[":id"].$get({
        param: {
          id: tagId,
        },
      });
      expect(getResponse.status).toBe(404);
    });
  });
});
