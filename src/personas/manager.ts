import { randomUUID } from "crypto";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { loadStakeholders } from "./loader";
import {
  type Stakeholder,
  type StakeholderConfig,
  type StakeholderFilter,
  type CreateStakeholderInput,
  type UpdateStakeholderInput,
  DEFAULT_PROMPT_TEMPLATE,
  CreateStakeholderSchema,
  UpdateStakeholderSchema,
  StakeholderSchema,
} from "./types";
import { logger } from "../utils/logger";

/**
 * Manages stakeholder personas from both config and runtime sources.
 * Runtime stakeholders can be persisted to a JSON file so they survive server restarts.
 */
export class PersonaManager {
  private configStakeholders: Map<string, Stakeholder> = new Map();
  private runtimeStakeholders: Map<string, Stakeholder> = new Map();
  private readonly runtimeStorePath: string | undefined;

  constructor(configPath?: string, runtimeStorePath?: string) {
    this.runtimeStorePath = runtimeStorePath;
    this.loadFromConfig(configPath);
    if (this.runtimeStorePath) {
      this.loadRuntimeStore();
    }
  }

  /**
   * Load stakeholders from YAML config file
   */
  private loadFromConfig(configPath?: string): void {
    const configs = loadStakeholders(configPath);

    for (const config of configs) {
      const stakeholder = this.configToStakeholder(config, "config");
      this.configStakeholders.set(stakeholder.id, stakeholder);
    }
  }

  /**
   * Load runtime stakeholders from JSON file (if path is set and file exists)
   */
  private loadRuntimeStore(): void {
    if (!this.runtimeStorePath || !existsSync(this.runtimeStorePath)) {
      return;
    }
    try {
      const raw = readFileSync(this.runtimeStorePath, "utf-8");
      const data = JSON.parse(raw) as unknown;
      const list = Array.isArray(data) ? data : (data as { stakeholders?: unknown[] }).stakeholders ?? [];
      for (const item of list) {
        const parsed = StakeholderSchema.safeParse(item);
        if (parsed.success && parsed.data.source === "runtime") {
          this.runtimeStakeholders.set(parsed.data.id, parsed.data);
        }
      }
      logger.info("Loaded runtime stakeholders from store", {
        path: this.runtimeStorePath,
        count: this.runtimeStakeholders.size,
      });
    } catch (error) {
      logger.warn("Failed to load runtime stakeholders store", {
        path: this.runtimeStorePath,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Persist runtime stakeholders to JSON file
   */
  private saveRuntimeStore(): void {
    if (!this.runtimeStorePath) return;
    try {
      const dir = dirname(this.runtimeStorePath);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      const list = Array.from(this.runtimeStakeholders.values());
      writeFileSync(this.runtimeStorePath, JSON.stringify({ stakeholders: list }, null, 2), "utf-8");
      logger.debug("Saved runtime stakeholders to store", { path: this.runtimeStorePath, count: list.length });
    } catch (error) {
      logger.warn("Failed to save runtime stakeholders store", {
        path: this.runtimeStorePath,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Convert a config object to a full Stakeholder
   */
  private configToStakeholder(
    config: StakeholderConfig,
    source: "config" | "runtime"
  ): Stakeholder {
    const now = new Date().toISOString();
    return {
      ...config,
      source,
      prompt_template: config.prompt_template ?? DEFAULT_PROMPT_TEMPLATE,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Get all stakeholders (runtime shadows config by ID)
   */
  getAll(filter?: StakeholderFilter): Stakeholder[] {
    const merged = new Map<string, Stakeholder>();

    // Add config stakeholders first
    for (const [id, stakeholder] of this.configStakeholders) {
      if (!filter?.source || filter.source === "all" || filter.source === "config") {
        merged.set(id, stakeholder);
      }
    }

    // Runtime stakeholders override/add
    for (const [id, stakeholder] of this.runtimeStakeholders) {
      if (!filter?.source || filter.source === "all" || filter.source === "runtime") {
        merged.set(id, stakeholder);
      }
    }

    let results = Array.from(merged.values());

    // Apply filters
    if (filter?.role) {
      const roleFilter = filter.role.toLowerCase();
      results = results.filter((s) =>
        s.role.toLowerCase().includes(roleFilter)
      );
    }

    if (filter?.expertise) {
      const expertiseFilter = filter.expertise.toLowerCase();
      results = results.filter((s) =>
        s.expertise.some((e) => e.toLowerCase().includes(expertiseFilter))
      );
    }

    return results;
  }

  /**
   * Get a single stakeholder by ID
   */
  get(id: string): Stakeholder | undefined {
    // Runtime stakeholders take precedence
    return this.runtimeStakeholders.get(id) ?? this.configStakeholders.get(id);
  }

  /**
   * Check if a stakeholder exists
   */
  has(id: string): boolean {
    return this.runtimeStakeholders.has(id) || this.configStakeholders.has(id);
  }

  /**
   * Create a new runtime stakeholder
   */
  create(input: CreateStakeholderInput): Stakeholder {
    // Validate input
    const validated = CreateStakeholderSchema.parse(input);

    // Generate ID if not provided
    const id = validated.id ?? `stakeholder-${randomUUID().slice(0, 8)}`;

    // Check for ID collision
    if (this.runtimeStakeholders.has(id)) {
      throw new Error(`Runtime stakeholder with ID "${id}" already exists`);
    }

    const config: StakeholderConfig = {
      ...validated,
      id,
    };

    const stakeholder = this.configToStakeholder(config, "runtime");
    this.runtimeStakeholders.set(id, stakeholder);
    this.saveRuntimeStore();
    return stakeholder;
  }

  /**
   * Update an existing stakeholder (creates runtime override for config stakeholders)
   */
  update(id: string, updates: UpdateStakeholderInput): Stakeholder {
    // Validate updates
    const validated = UpdateStakeholderSchema.parse(updates);

    const existing = this.get(id);
    if (!existing) {
      throw new Error(`Stakeholder with ID "${id}" not found`);
    }

    // Merge updates
    const updated: Stakeholder = {
      ...existing,
      ...validated,
      personality: {
        ...existing.personality,
        ...(validated.personality ?? {}),
      },
      expertise: validated.expertise ?? existing.expertise,
      concerns: validated.concerns ?? existing.concerns,
      source: "runtime", // Updates always create runtime version
      updatedAt: new Date().toISOString(),
    };

    this.runtimeStakeholders.set(id, updated);
    this.saveRuntimeStore();
    return updated;
  }

  /**
   * Delete a runtime stakeholder (cannot delete config-based ones)
   */
  delete(id: string): boolean {
    if (!this.runtimeStakeholders.has(id)) {
      if (this.configStakeholders.has(id)) {
        throw new Error(
          `Cannot delete config-based stakeholder "${id}". Use update to override instead.`
        );
      }
      return false;
    }

    this.runtimeStakeholders.delete(id);
    this.saveRuntimeStore();
    return true;
  }

  /**
   * Build the system prompt for a stakeholder
   */
  buildSystemPrompt(stakeholder: Stakeholder): string {
    const template = stakeholder.prompt_template ?? DEFAULT_PROMPT_TEMPLATE;

    return template
      .replace(/\{\{name\}\}/g, stakeholder.name)
      .replace(/\{\{role\}\}/g, stakeholder.role)
      .replace(/\{\{traits\}\}/g, stakeholder.personality.traits.join(", "))
      .replace(/\{\{communication_style\}\}/g, stakeholder.personality.communication_style)
      .replace(/\{\{expertise\}\}/g, stakeholder.expertise.map((e) => `- ${e}`).join("\n"))
      .replace(/\{\{concerns\}\}/g, stakeholder.concerns.map((c) => `- ${c}`).join("\n"));
  }

  /**
   * Get summary info for listing
   */
  getSummary(stakeholder: Stakeholder): {
    id: string;
    name: string;
    role: string;
    source: string;
    expertise: string[];
  } {
    return {
      id: stakeholder.id,
      name: stakeholder.name,
      role: stakeholder.role,
      source: stakeholder.source,
      expertise: stakeholder.expertise,
    };
  }

  /**
   * Reset runtime stakeholders (useful for testing)
   */
  resetRuntime(): void {
    this.runtimeStakeholders.clear();
  }

  /**
   * Reload config from file
   */
  reloadConfig(configPath?: string): void {
    this.configStakeholders.clear();
    this.loadFromConfig(configPath);
  }
}

// Export singleton instance factory
let defaultManager: PersonaManager | null = null;

export function getPersonaManager(configPath?: string): PersonaManager {
  if (!defaultManager) {
    defaultManager = new PersonaManager(configPath);
  }
  return defaultManager;
}

export function resetPersonaManager(): void {
  defaultManager = null;
}
