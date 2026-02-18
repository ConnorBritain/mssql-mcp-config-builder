import type { Tier } from "../../state/types";
import { READER_TOOLS, WRITER_ONLY_TOOLS, ADMIN_ONLY_TOOLS, toolsForTier } from "../../state/defaults";

/** Short descriptions for each MCP tool. */
const TOOL_DESCRIPTIONS: Record<string, string> = {
  read_data: "Run SELECT queries against the database.",
  list_tables: "List all tables and views in the database.",
  describe_table: "Show column names, types, and constraints for a table.",
  search_schema: "Search table and column names by keyword.",
  profile_table: "Get row counts, null rates, and value distributions for a table.",
  inspect_relationships: "Show foreign key relationships between tables.",
  inspect_dependencies: "Show dependencies like views or procedures that reference an object.",
  explain_query: "Show the estimated execution plan for a SQL query.",
  list_databases: "List all databases on the server.",
  list_environments: "List configured named environments.",
  validate_environment_config: "Check the environments config file for errors.",
  test_connection: "Test connectivity to a database and report success or failure.",
  list_scripts: "List saved SQL scripts available to run.",
  run_script: "Execute a saved SQL script by name.",
  insert_data: "Insert new rows into a table.",
  update_data: "Update existing rows in a table (requires confirmation).",
  delete_data: "Delete rows from a table (requires confirmation).",
  create_table: "Create a new table with specified columns.",
  create_index: "Create an index on a table to improve query performance.",
  drop_table: "Permanently delete a table and all its data.",
};

interface ToolPickerProps {
  selectedTools: string[];
  onChange: (tools: string[]) => void;
  tier: Tier;
}

interface ToolGroupProps {
  title: string;
  tools: readonly string[];
  selectedTools: string[];
  availableTools: readonly string[];
  onChange: (tools: string[]) => void;
  allSelected: string[];
}

function ToolGroup({ title, tools, selectedTools, availableTools, onChange, allSelected }: ToolGroupProps) {
  const groupSelected = tools.filter((t) => selectedTools.includes(t));
  function selectAll() {
    const newTools = [...new Set([...allSelected, ...tools.filter((t) => availableTools.includes(t))])];
    onChange(newTools);
  }

  function clearAll() {
    onChange(allSelected.filter((t) => !tools.includes(t)));
  }

  return (
    <div class="tool-group">
      <div class="tool-group-header">
        <strong>{title}</strong>
        <span class="tool-group-actions">
          <button type="button" class="btn-link" onClick={selectAll}>Select All</button>
          <button type="button" class="btn-link" onClick={clearAll}>Clear</button>
        </span>
        <small class="tool-group-count">{groupSelected.length}/{tools.length}</small>
      </div>
      <div class="tool-grid">
        {tools.map((tool) => {
          const available = availableTools.includes(tool);
          const desc = TOOL_DESCRIPTIONS[tool];
          return (
            <label key={tool} class={`tool-checkbox${!available ? " tool-checkbox--disabled" : ""}`}>
              <input
                type="checkbox"
                checked={selectedTools.includes(tool)}
                disabled={!available}
                onChange={(e) => {
                  const checked = (e.target as HTMLInputElement).checked;
                  if (checked) {
                    onChange([...allSelected, tool]);
                  } else {
                    onChange(allSelected.filter((t) => t !== tool));
                  }
                }}
              />
              <span class="tool-name">
                {tool}
                {desc && (
                  <span class="tooltip-wrapper tooltip-wrapper--delayed">
                    <span class="tooltip-icon tooltip-icon--subtle">?</span>
                    <span class="tooltip-bubble">{desc}</span>
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export function ToolPicker({ selectedTools, onChange, tier }: ToolPickerProps) {
  const available = toolsForTier(tier);

  return (
    <div class="tool-picker">
      <ToolGroup
        title="Reader Tools"
        tools={READER_TOOLS}
        selectedTools={selectedTools}
        availableTools={available}
        onChange={onChange}
        allSelected={selectedTools}
      />
      <ToolGroup
        title="Writer Tools"
        tools={WRITER_ONLY_TOOLS}
        selectedTools={selectedTools}
        availableTools={available}
        onChange={onChange}
        allSelected={selectedTools}
      />
      <ToolGroup
        title="Admin Tools"
        tools={ADMIN_ONLY_TOOLS}
        selectedTools={selectedTools}
        availableTools={available}
        onChange={onChange}
        allSelected={selectedTools}
      />
    </div>
  );
}
