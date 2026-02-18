// ---------------------------------------------------------------------------
// Config merge utility — upserts the mssql server into an existing MCP config
// ---------------------------------------------------------------------------

import type { McpConfigOutput } from "../state/types";

export interface MergeResult {
  success: boolean;
  json: string;
  otherServerCount: number;
  error?: string;
}

/**
 * Merge a new MCP config into an existing one. Adds/replaces the `mssql` key
 * under `mcpServers` while preserving all other servers.
 */
export function mergeIntoExistingConfig(
  existingJson: string,
  newMcpConfig: McpConfigOutput,
): MergeResult {
  try {
    const existing = JSON.parse(existingJson);

    // Ensure mcpServers exists
    if (!existing.mcpServers || typeof existing.mcpServers !== "object") {
      existing.mcpServers = {};
    }

    const otherServerCount = Object.keys(existing.mcpServers).filter(
      (k) => k !== "mssql",
    ).length;

    // Upsert the mssql key
    existing.mcpServers.mssql = newMcpConfig.mcpServers.mssql;

    return {
      success: true,
      json: JSON.stringify(existing, null, 2),
      otherServerCount,
    };
  } catch (e) {
    return {
      success: false,
      json: "",
      otherServerCount: 0,
      error: e instanceof Error ? e.message : "Invalid JSON",
    };
  }
}
