import { Database } from "bun:sqlite";
import { mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { logger } from "../utils/logger";
import type { ConsultationResponse, ConsultationContext } from "../llm/types";

// Resolve relative to the project root (where this file lives at src/db/database.ts)
const PROJECT_ROOT = resolve(dirname(new URL(import.meta.url).pathname), "..", "..");
const DB_PATH = process.env.DB_PATH ?? resolve(PROJECT_ROOT, "data", "consultations.db");

/**
 * A single consultation log row
 */
export interface ConsultationLog {
  id: number;
  session_id: string | null;
  stakeholder_id: string;
  stakeholder_name: string;
  stakeholder_role: string;
  prompt: string;
  response: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  context_json: string | null;
  created_at: string;
}

/**
 * Filters for querying consultation logs
 */
export interface ConsultationLogFilter {
  stakeholderId?: string;
  sessionId?: string;
  since?: string;
  until?: string;
  limit?: number;
  offset?: number;
  search?: string;
}

/**
 * SQLite-backed consultation logger.
 * Stores every stakeholder call and response so you can review them later.
 */
export class ConsultationDatabase {
  private db: Database;

  constructor(dbPath: string = DB_PATH) {
    // Ensure the parent directory exists
    const dir = dirname(dbPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(dbPath, { create: true });

    // Enable WAL mode for better concurrent read performance
    this.db.run("PRAGMA journal_mode = WAL");
    this.db.run("PRAGMA foreign_keys = ON");

    this.migrate();

    logger.info("Consultation database initialized", { path: dbPath });
  }

  /**
   * Create or update the schema
   */
  private migrate(): void {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS consultations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT,
        stakeholder_id TEXT NOT NULL,
        stakeholder_name TEXT NOT NULL,
        stakeholder_role TEXT NOT NULL,
        prompt TEXT NOT NULL,
        response TEXT NOT NULL,
        model TEXT NOT NULL,
        prompt_tokens INTEGER NOT NULL DEFAULT 0,
        completion_tokens INTEGER NOT NULL DEFAULT 0,
        context_json TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    this.db.run(`
      CREATE INDEX IF NOT EXISTS idx_consultations_stakeholder
      ON consultations (stakeholder_id)
    `);

    this.db.run(`
      CREATE INDEX IF NOT EXISTS idx_consultations_session
      ON consultations (session_id)
    `);

    this.db.run(`
      CREATE INDEX IF NOT EXISTS idx_consultations_created
      ON consultations (created_at)
    `);
  }

  /**
   * Log a consultation call and its response
   */
  logConsultation(
    prompt: string,
    response: ConsultationResponse,
    context?: ConsultationContext
  ): number {
    const stmt = this.db.prepare(`
      INSERT INTO consultations
        (session_id, stakeholder_id, stakeholder_name, stakeholder_role,
         prompt, response, model, prompt_tokens, completion_tokens,
         context_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      context?.sessionId ?? null,
      response.stakeholderId,
      response.stakeholderName,
      response.stakeholderRole,
      prompt,
      response.content,
      response.model,
      response.usage.promptTokens,
      response.usage.completionTokens,
      context ? JSON.stringify(context) : null,
      response.timestamp
    );

    const insertedId = Number(result.lastInsertRowid);

    logger.debug("Consultation logged", {
      id: insertedId,
      stakeholderId: response.stakeholderId,
    });

    return insertedId;
  }

  /**
   * Query consultation logs with optional filters
   */
  getConsultations(filter: ConsultationLogFilter = {}): ConsultationLog[] {
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (filter.stakeholderId) {
      conditions.push("stakeholder_id = ?");
      params.push(filter.stakeholderId);
    }

    if (filter.sessionId) {
      conditions.push("session_id = ?");
      params.push(filter.sessionId);
    }

    if (filter.since) {
      conditions.push("created_at >= ?");
      params.push(filter.since);
    }

    if (filter.until) {
      conditions.push("created_at <= ?");
      params.push(filter.until);
    }

    if (filter.search) {
      conditions.push("(prompt LIKE ? OR response LIKE ?)");
      const term = `%${filter.search}%`;
      params.push(term, term);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const limit = filter.limit ?? 50;
    const offset = filter.offset ?? 0;

    const query = `
      SELECT * FROM consultations
      ${where}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    params.push(limit, offset);

    return this.db.prepare(query).all(...params) as ConsultationLog[];
  }

  /**
   * Get a single consultation by ID
   */
  getConsultation(id: number): ConsultationLog | null {
    return (
      this.db.prepare("SELECT * FROM consultations WHERE id = ?").get(id) as ConsultationLog | null
    );
  }

  /**
   * Get total count of consultations (with optional filters)
   */
  getConsultationCount(filter: ConsultationLogFilter = {}): number {
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (filter.stakeholderId) {
      conditions.push("stakeholder_id = ?");
      params.push(filter.stakeholderId);
    }

    if (filter.sessionId) {
      conditions.push("session_id = ?");
      params.push(filter.sessionId);
    }

    if (filter.since) {
      conditions.push("created_at >= ?");
      params.push(filter.since);
    }

    if (filter.until) {
      conditions.push("created_at <= ?");
      params.push(filter.until);
    }

    if (filter.search) {
      conditions.push("(prompt LIKE ? OR response LIKE ?)");
      const term = `%${filter.search}%`;
      params.push(term, term);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const query = `SELECT COUNT(*) as count FROM consultations ${where}`;

    const row = this.db.prepare(query).get(...params) as { count: number };
    return row.count;
  }

  /**
   * Close the database connection
   */
  close(): void {
    this.db.close();
  }
}

// Singleton
let instance: ConsultationDatabase | null = null;

export function getConsultationDatabase(dbPath?: string): ConsultationDatabase {
  if (!instance) {
    instance = new ConsultationDatabase(dbPath);
  }
  return instance;
}
