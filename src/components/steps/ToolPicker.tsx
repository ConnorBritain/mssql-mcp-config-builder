import type { Tier } from "../../state/types";
import { READER_TOOLS, WRITER_ONLY_TOOLS, ADMIN_ONLY_TOOLS, toolsForTier } from "../../state/defaults";

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
              {tool}
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
