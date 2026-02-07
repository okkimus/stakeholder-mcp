/**
 * Example test client for the Stakeholder MCP Server
 * 
 * This script demonstrates how to interact with the server programmatically.
 * Run with: bun run examples/test-client.ts
 */

import { PersonaManager } from "../src/personas/manager";
import { LLMClient } from "../src/llm/client";

async function main() {
  console.log("=== Stakeholder MCP Server Test Client ===\n");

  // Create persona manager directly (doesn't require API key)
  const manager = new PersonaManager();

  // Test 1: List all stakeholders
  console.log("1. Listing all stakeholders:");
  const allStakeholders = manager.getAll();
  console.log(`   Found ${allStakeholders.length} stakeholders:`);
  for (const s of allStakeholders) {
    console.log(`   - ${s.id}: ${s.name} (${s.role})`);
  }
  console.log();

  // Test 2: Get a specific stakeholder
  console.log("2. Getting tech-lead details:");
  const techLead = manager.get("tech-lead");
  if (techLead) {
    console.log(`   Name: ${techLead.name}`);
    console.log(`   Role: ${techLead.role}`);
    console.log(`   Traits: ${techLead.personality.traits.join(", ")}`);
    console.log(`   Expertise: ${techLead.expertise.join(", ")}`);
  }
  console.log();

  // Test 3: Filter stakeholders by expertise
  console.log("3. Filtering stakeholders with 'security' expertise:");
  const securityExperts = manager.getAll({ expertise: "security" });
  for (const s of securityExperts) {
    console.log(`   - ${s.id}: ${s.name}`);
  }
  console.log();

  // Test 4: Create a runtime stakeholder
  console.log("4. Creating a runtime stakeholder:");
  const newStakeholder = manager.create({
    name: "Test User",
    role: "QA Tester",
    personality: {
      traits: ["meticulous", "patient"],
      communication_style: "detailed and systematic",
    },
    expertise: ["testing", "quality assurance"],
    concerns: ["bugs", "edge cases", "user experience"],
  });
  console.log(`   Created: ${newStakeholder.id} (${newStakeholder.name})`);
  console.log(`   Source: ${newStakeholder.source}`);
  console.log();

  // Test 5: Update the runtime stakeholder
  console.log("5. Updating the runtime stakeholder:");
  const updated = manager.update(newStakeholder.id, {
    name: "Updated Test User",
    expertise: ["testing", "quality assurance", "automation"],
  });
  console.log(`   Updated name: ${updated.name}`);
  console.log(`   Updated expertise: ${updated.expertise.join(", ")}`);
  console.log();

  // Test 6: Build system prompt
  console.log("6. Building system prompt for tech-lead:");
  if (techLead) {
    const prompt = manager.buildSystemPrompt(techLead);
    console.log("   " + prompt.slice(0, 200).replace(/\n/g, "\n   ") + "...");
  }
  console.log();

  // Test 7: Delete runtime stakeholder
  console.log("7. Deleting the runtime stakeholder:");
  const deleted = manager.delete(newStakeholder.id);
  console.log(`   Deleted: ${deleted}`);
  console.log();

  // Test 8: Verify total stakeholders after deletion
  console.log("8. Verifying stakeholder count:");
  const finalCount = manager.getAll().length;
  console.log(`   Total stakeholders: ${finalCount} (should be ${allStakeholders.length})`);
  console.log();

  // Test 9: Consult stakeholder (requires API key)
  if (process.env.OPENROUTER_API_KEY) {
    console.log("9. Consulting tech-lead (requires OPENROUTER_API_KEY):");
    try {
      const llmClient = new LLMClient();
      const { consultStakeholder } = await import("../src/tools/consult");
      
      const response = await consultStakeholder(manager, llmClient, {
        id: "tech-lead",
        prompt: "What do you think about using microservices for a simple blog application?",
        maxTokens: 150,
      });
      
      console.log(`   Response from ${response.stakeholderName}:`);
      console.log(`   "${response.content.slice(0, 300)}..."`);
      console.log(`   Model: ${response.model}`);
      console.log(`   Tokens: ${response.usage.promptTokens} prompt, ${response.usage.completionTokens} completion`);
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  } else {
    console.log("9. Skipping LLM consultation (set OPENROUTER_API_KEY to test)");
  }
  console.log();

  console.log("=== Tests complete ===");
}

main().catch(console.error);
