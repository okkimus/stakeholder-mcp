import { readFileSync, existsSync } from "fs";
import { parse as parseYaml } from "yaml";
import { join, dirname } from "path";
import {
  StakeholdersConfigSchema,
  type StakeholderConfig,
  type StakeholdersConfig,
} from "./types";
import { logger } from "../utils/logger";

const DEFAULT_CONFIG_PATHS = [
  "./config/stakeholders.yaml",
  "./stakeholders.yaml",
  "../config/stakeholders.yaml",
];

/**
 * Finds the config file path, checking multiple locations
 */
function findConfigPath(customPath?: string): string | null {
  if (customPath) {
    if (existsSync(customPath)) {
      return customPath;
    }
    return null;
  }

  // Try to find relative to current working directory
  for (const relativePath of DEFAULT_CONFIG_PATHS) {
    const fullPath = join(process.cwd(), relativePath);
    if (existsSync(fullPath)) {
      return fullPath;
    }
  }

  // Try to find relative to this file (for when running from dist)
  const fileDir = dirname(import.meta.path.replace("file://", ""));
  for (const relativePath of DEFAULT_CONFIG_PATHS) {
    const fullPath = join(fileDir, "..", "..", relativePath);
    if (existsSync(fullPath)) {
      return fullPath;
    }
  }

  return null;
}

/**
 * Loads stakeholder configurations from a YAML file
 */
export function loadStakeholdersConfig(configPath?: string): StakeholdersConfig {
  const path = findConfigPath(configPath);

  if (!path) {
    logger.warn("No stakeholders config file found. Using empty configuration.", {
      searchedPaths: DEFAULT_CONFIG_PATHS,
    });
    return { stakeholders: [] };
  }

  try {
    const fileContents = readFileSync(path, "utf-8");
    const rawConfig = parseYaml(fileContents);

    // Validate with Zod
    const validatedConfig = StakeholdersConfigSchema.parse(rawConfig);

    logger.info("Loaded stakeholders from config", {
      count: validatedConfig.stakeholders.length,
      path,
    });

    return validatedConfig;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load stakeholders config from ${path}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Loads stakeholder configs and converts them to Stakeholder objects with source metadata
 */
export function loadStakeholders(configPath?: string): StakeholderConfig[] {
  const config = loadStakeholdersConfig(configPath);
  return config.stakeholders;
}
