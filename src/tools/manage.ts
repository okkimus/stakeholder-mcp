import { PersonaManager } from "../personas/manager";
import type { Stakeholder, CreateStakeholderInput, UpdateStakeholderInput, StakeholderFilter } from "../personas/types";

/**
 * List all stakeholders with optional filtering
 */
export function listStakeholders(
  manager: PersonaManager,
  filter?: StakeholderFilter
): Array<{
  id: string;
  name: string;
  role: string;
  source: string;
  expertise: string[];
}> {
  const stakeholders = manager.getAll(filter);
  return stakeholders.map((s) => manager.getSummary(s));
}

/**
 * Get detailed information about a single stakeholder
 */
export function getStakeholder(
  manager: PersonaManager,
  id: string
): Stakeholder | null {
  return manager.get(id) ?? null;
}

/**
 * Create a new runtime stakeholder
 */
export function createStakeholder(
  manager: PersonaManager,
  input: CreateStakeholderInput
): Stakeholder {
  return manager.create(input);
}

/**
 * Update an existing stakeholder
 */
export function updateStakeholder(
  manager: PersonaManager,
  id: string,
  updates: UpdateStakeholderInput
): Stakeholder {
  return manager.update(id, updates);
}

/**
 * Delete a runtime stakeholder
 */
export function deleteStakeholder(
  manager: PersonaManager,
  id: string
): { success: boolean; message: string } {
  try {
    const deleted = manager.delete(id);
    if (deleted) {
      return { success: true, message: `Stakeholder "${id}" deleted successfully` };
    }
    return { success: false, message: `Stakeholder "${id}" not found` };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
