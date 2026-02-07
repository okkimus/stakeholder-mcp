import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { PersonaManager } from "../personas/manager";
import { LLMClient } from "../llm/client";
import { consultStakeholder, consultGroup } from "./consult";
import { listStakeholders, getStakeholder, createStakeholder, updateStakeholder, deleteStakeholder } from "./manage";
import {
  ListStakeholdersInputSchema,
  GetStakeholderInputSchema,
  ConsultStakeholderInputSchema,
  ConsultGroupInputSchema,
  CreateStakeholderInputSchema,
  UpdateStakeholderInputSchema,
  DeleteStakeholderInputSchema,
  GetConsultationLogInputSchema,
  GetConsultationByIdInputSchema,
} from "./schemas";
import type { ConsultationDatabase } from "../db/database";

/**
 * Register all stakeholder tools with the MCP server
 */
export function registerTools(
  server: McpServer,
  manager: PersonaManager,
  llmClient: LLMClient,
  db?: ConsultationDatabase
): void {
  // list_stakeholders - Get all available personas
  server.tool(
    "list_stakeholders",
    "List all available stakeholder personas with optional filtering by role or expertise",
    {
      filter: z.object({
        role: z.string().optional(),
        expertise: z.string().optional(),
        source: z.enum(["config", "runtime", "all"]).optional(),
      }).optional(),
    },
    async (params) => {
      const input = ListStakeholdersInputSchema.parse(params);
      const stakeholders = listStakeholders(manager, input.filter);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(stakeholders, null, 2),
          },
        ],
      };
    }
  );

  // get_stakeholder - Get detailed info about a single persona
  server.tool(
    "get_stakeholder",
    "Get detailed information about a specific stakeholder persona",
    {
      id: z.string().min(1).describe("Stakeholder ID"),
    },
    async (params) => {
      const input = GetStakeholderInputSchema.parse(params);
      const stakeholder = getStakeholder(manager, input.id);

      if (!stakeholder) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: `Stakeholder "${input.id}" not found` }),
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(stakeholder, null, 2),
          },
        ],
      };
    }
  );

  // consult_stakeholder - Query a single stakeholder for feedback
  server.tool(
    "consult_stakeholder",
    "Consult a specific stakeholder for feedback on a proposal, design, or idea. The stakeholder will respond in character. Pass context.sessionId (e.g. a stable id for this conversation) so follow-up questions in the same session include prior Q&A and the stakeholder remembers the discussion.",
    {
      id: z.string().min(1).describe("Stakeholder ID to consult"),
      prompt: z.string().min(1).describe("The question or proposal to get feedback on"),
      context: z.object({
        sessionId: z.string().optional().describe("Stable ID for this conversation; when set, prior consultations in this session are shown to the stakeholder so they remember the discussion"),
        projectDescription: z.string().optional(),
        previousFeedback: z.array(z.object({
          stakeholderId: z.string(),
          summary: z.string(),
        })).optional(),
        artifacts: z.array(z.object({
          type: z.enum(["code", "design", "spec", "other"]),
          content: z.string(),
          language: z.string().optional(),
        })).optional(),
      }).optional(),
      model: z.string().optional().describe("Override the LLM model to use"),
      temperature: z.number().min(0).max(2).optional(),
      maxTokens: z.number().min(1).max(4096).optional(),
    },
    async (params) => {
      const input = ConsultStakeholderInputSchema.parse(params);

      try {
        const response = await consultStakeholder(manager, llmClient, {
          id: input.id,
          prompt: input.prompt,
          context: input.context,
          model: input.model,
          temperature: input.temperature,
          maxTokens: input.maxTokens,
        }, db);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: error instanceof Error ? error.message : "Unknown error",
              }),
            },
          ],
          isError: true,
        };
      }
    }
  );

  // consult_group - Query multiple stakeholders
  server.tool(
    "consult_group",
    "Consult multiple stakeholders for feedback. Can run in parallel (all at once) or sequential (each sees previous responses) mode. Pass context.sessionId so follow-ups in the same session let each stakeholder see prior Q&A.",
    {
      ids: z.array(z.string().min(1)).min(1).describe("Array of stakeholder IDs to consult"),
      prompt: z.string().min(1).describe("The question or proposal to get feedback on"),
      context: z.object({
        sessionId: z.string().optional().describe("Stable ID for this conversation; prior consultations in this session are shown so stakeholders remember the discussion"),
        projectDescription: z.string().optional(),
        previousFeedback: z.array(z.object({
          stakeholderId: z.string(),
          summary: z.string(),
        })).optional(),
        artifacts: z.array(z.object({
          type: z.enum(["code", "design", "spec", "other"]),
          content: z.string(),
          language: z.string().optional(),
        })).optional(),
      }).optional(),
      mode: z.enum(["parallel", "sequential"]).default("parallel").describe("Whether to consult stakeholders in parallel or sequentially"),
      model: z.string().optional().describe("Override the LLM model to use"),
      temperature: z.number().min(0).max(2).optional(),
      maxTokens: z.number().min(1).max(4096).optional(),
    },
    async (params) => {
      const input = ConsultGroupInputSchema.parse(params);

      try {
        const result = await consultGroup(manager, llmClient, {
          ids: input.ids,
          prompt: input.prompt,
          context: input.context,
          mode: input.mode,
          model: input.model,
          temperature: input.temperature,
          maxTokens: input.maxTokens,
        }, db);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: error instanceof Error ? error.message : "Unknown error",
              }),
            },
          ],
          isError: true,
        };
      }
    }
  );

  // create_stakeholder - Add a new runtime persona
  server.tool(
    "create_stakeholder",
    "Create a new stakeholder persona at runtime. Runtime stakeholders are persisted to a JSON file (data/runtime-stakeholders.json by default) and survive server restarts.",
    {
      stakeholder: z.object({
        id: z.string().min(1).optional().describe("Optional ID, will be auto-generated if not provided"),
        name: z.string().min(1).describe("Display name of the stakeholder"),
        role: z.string().min(1).describe("Role description"),
        model: z.string().optional().describe("Preferred LLM model for this stakeholder"),
        personality: z.object({
          traits: z.array(z.string()).min(1).describe("Personality traits"),
          communication_style: z.string().describe("How this stakeholder communicates"),
        }),
        expertise: z.array(z.string()).min(1).describe("Areas of expertise"),
        concerns: z.array(z.string()).min(1).describe("Primary concerns when giving feedback"),
        prompt_template: z.string().optional().describe("Custom prompt template"),
      }),
    },
    async (params) => {
      const input = CreateStakeholderInputSchema.parse(params);

      try {
        const stakeholder = createStakeholder(manager, input.stakeholder);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                message: `Stakeholder "${stakeholder.id}" created successfully`,
                stakeholder,
              }, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: error instanceof Error ? error.message : "Unknown error",
              }),
            },
          ],
          isError: true,
        };
      }
    }
  );

  // update_stakeholder - Modify an existing persona
  server.tool(
    "update_stakeholder",
    "Update an existing stakeholder persona. For config-based stakeholders, this creates a runtime override.",
    {
      id: z.string().min(1).describe("Stakeholder ID to update"),
      updates: z.object({
        name: z.string().min(1).optional(),
        role: z.string().optional(),
        model: z.string().optional(),
        personality: z.object({
          traits: z.array(z.string()).optional(),
          communication_style: z.string().optional(),
        }).optional(),
        expertise: z.array(z.string()).optional(),
        concerns: z.array(z.string()).optional(),
        prompt_template: z.string().optional(),
      }),
    },
    async (params) => {
      const input = UpdateStakeholderInputSchema.parse(params);

      try {
        const stakeholder = updateStakeholder(manager, input.id, input.updates);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                message: `Stakeholder "${stakeholder.id}" updated successfully`,
                stakeholder,
              }, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: error instanceof Error ? error.message : "Unknown error",
              }),
            },
          ],
          isError: true,
        };
      }
    }
  );

  // delete_stakeholder - Remove a runtime persona
  server.tool(
    "delete_stakeholder",
    "Delete a runtime stakeholder persona. Config-based stakeholders cannot be deleted, but their runtime overrides can be removed. Persisted runtime stakeholders are removed from the store file.",
    {
      id: z.string().min(1).describe("Stakeholder ID to delete"),
    },
    async (params) => {
      const input = DeleteStakeholderInputSchema.parse(params);
      const result = deleteStakeholder(manager, input.id);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result),
          },
        ],
        isError: !result.success,
      };
    }
  );

  // Only register log tools if the database is available
  if (db) {
    // get_consultation_log - Query past consultations
    server.tool(
      "get_consultation_log",
      "Query the log of past stakeholder consultations. Filter by stakeholder, session, date range, or search prompt/response text.",
      {
        stakeholderId: z.string().optional().describe("Filter by stakeholder ID"),
        sessionId: z.string().optional().describe("Filter by session ID"),
        since: z.string().optional().describe("Filter consultations after this ISO datetime"),
        until: z.string().optional().describe("Filter consultations before this ISO datetime"),
        search: z.string().optional().describe("Full-text search across prompts and responses"),
        limit: z.number().min(1).max(200).optional().describe("Max rows to return (default 50)"),
        offset: z.number().min(0).optional().describe("Offset for pagination"),
      },
      async (params) => {
        const input = GetConsultationLogInputSchema.parse(params);
        const consultations = db.getConsultations(input);
        const total = db.getConsultationCount(input);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                total,
                count: consultations.length,
                offset: input.offset ?? 0,
                consultations,
              }, null, 2),
            },
          ],
        };
      }
    );

    // get_consultation - Get a single consultation by ID
    server.tool(
      "get_consultation",
      "Get a single past consultation by its log ID, including the full prompt, response, and metadata.",
      {
        id: z.number().int().min(1).describe("Consultation log ID"),
      },
      async (params) => {
        const input = GetConsultationByIdInputSchema.parse(params);
        const consultation = db.getConsultation(input.id);

        if (!consultation) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({ error: `Consultation with ID ${input.id} not found` }),
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(consultation, null, 2),
            },
          ],
        };
      }
    );
  }
}

export * from "./schemas";
export * from "./consult";
export * from "./manage";
