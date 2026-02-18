import { useState } from "preact/hooks";
import type { StepProps } from "../../app";
import { ACCESS_LEVEL_OPTIONS } from "../../state/defaults";
import { FieldGroup } from "../shared/FieldGroup";
import { Collapsible } from "../shared/Collapsible";
import { ToolPicker } from "./ToolPicker";

type ToolRestriction = "none" | "allow" | "deny";

export function GovernanceStep({ state, dispatch }: StepProps) {
  const [selectedEnvId, setSelectedEnvId] = useState(state.environments[0].id);

  const env = state.environments.find((e) => e.id === selectedEnvId) ?? state.environments[0];

  function update(field: string, value: unknown) {
    if (state.mode === "multi" && selectedEnvId === "__all__") {
      for (const e of state.environments) {
        dispatch({ type: "UPDATE_ENVIRONMENT", id: e.id, field, value });
      }
    } else {
      dispatch({ type: "UPDATE_ENVIRONMENT", id: env.id, field, value });
    }
  }

  const toolRestriction: ToolRestriction =
    env.allowedTools.length > 0 ? "allow" : env.deniedTools.length > 0 ? "deny" : "none";

  function setToolRestriction(mode: ToolRestriction) {
    if (mode === "none") {
      update("allowedTools", []);
      update("deniedTools", []);
    } else if (mode === "allow") {
      update("deniedTools", []);
    } else {
      update("allowedTools", []);
    }
  }

  return (
    <div class="step step-governance">
      <h2>Governance</h2>

      {state.mode === "multi" && (
        <FieldGroup label="Configure for">
          <select
            value={selectedEnvId}
            onChange={(e) => setSelectedEnvId((e.target as HTMLSelectElement).value)}
          >
            <option value="__all__">All environments</option>
            {state.environments.map((e) => (
              <option key={e.id} value={e.id}>{e.name || "Unnamed"}</option>
            ))}
          </select>
        </FieldGroup>
      )}

      <FieldGroup label="Read Only">
        <label class="toggle-label">
          <input
            type="checkbox"
            checked={env.readonly}
            onChange={(e) => update("readonly", (e.target as HTMLInputElement).checked)}
          />
          Disable all write operations
        </label>
      </FieldGroup>

      <FieldGroup label="Max Rows Default" helpText="Maximum rows returned by read_data queries">
        <input
          type="number"
          value={env.maxRowsDefault}
          onInput={(e) => update("maxRowsDefault", (e.target as HTMLInputElement).value)}
          placeholder="1000"
        />
      </FieldGroup>

      <FieldGroup label="Require Approval">
        <label class="toggle-label">
          <input
            type="checkbox"
            checked={env.requireApproval.length > 0}
            onChange={(e) => {
              const checked = (e.target as HTMLInputElement).checked;
              update("requireApproval", checked ? ["mutating"] : []);
            }}
          />
          Require explicit approval for mutating operations
        </label>
      </FieldGroup>

      <Collapsible title="Access Control">
        <FieldGroup label="Access Level">
          <div class="radio-group">
            {ACCESS_LEVEL_OPTIONS.map((o) => (
              <label key={o.value}>
                <input
                  type="radio"
                  name="accessLevel"
                  value={o.value}
                  checked={env.accessLevel === o.value}
                  onChange={() => update("accessLevel", o.value)}
                />
                {o.label}
              </label>
            ))}
          </div>
        </FieldGroup>

        {env.accessLevel === "server" && (
          <div>
            <FieldGroup label="Allowed Databases" helpText="Comma-separated list of database names">
              <input
                type="text"
                value={env.allowedDatabases}
                onInput={(e) => update("allowedDatabases", (e.target as HTMLInputElement).value)}
                placeholder="db1, db2"
              />
            </FieldGroup>
            <FieldGroup label="Denied Databases" helpText="Comma-separated list of database names to block">
              <input
                type="text"
                value={env.deniedDatabases}
                onInput={(e) => update("deniedDatabases", (e.target as HTMLInputElement).value)}
                placeholder="master, tempdb"
              />
            </FieldGroup>
          </div>
        )}
      </Collapsible>

      <Collapsible title="Tool Restrictions">
        <div class="radio-group">
          <label>
            <input
              type="radio"
              name="toolRestriction"
              checked={toolRestriction === "none"}
              onChange={() => setToolRestriction("none")}
            />
            No restrictions
          </label>
          <label>
            <input
              type="radio"
              name="toolRestriction"
              checked={toolRestriction === "allow"}
              onChange={() => setToolRestriction("allow")}
            />
            Allow list (only these tools)
          </label>
          <label>
            <input
              type="radio"
              name="toolRestriction"
              checked={toolRestriction === "deny"}
              onChange={() => setToolRestriction("deny")}
            />
            Deny list (block these tools)
          </label>
        </div>

        {toolRestriction === "allow" && (
          <ToolPicker
            selectedTools={env.allowedTools}
            onChange={(tools) => update("allowedTools", tools)}
            tier={state.tier}
          />
        )}
        {toolRestriction === "deny" && (
          <ToolPicker
            selectedTools={env.deniedTools}
            onChange={(tools) => update("deniedTools", tools)}
            tier={state.tier}
          />
        )}
      </Collapsible>

      <Collapsible title="Schema Access">
        <FieldGroup
          label="Allowed Schemas"
          helpText="Comma-separated. Supports wildcards: dbo.*, sales.Orders, *.Users"
        >
          <input
            type="text"
            value={env.allowedSchemas}
            onInput={(e) => update("allowedSchemas", (e.target as HTMLInputElement).value)}
            placeholder="dbo.*, sales.*"
          />
        </FieldGroup>
        <FieldGroup
          label="Denied Schemas"
          helpText="Comma-separated. Supports wildcards: sys.*, INFORMATION_SCHEMA.*"
        >
          <input
            type="text"
            value={env.deniedSchemas}
            onInput={(e) => update("deniedSchemas", (e.target as HTMLInputElement).value)}
            placeholder="sys.*, INFORMATION_SCHEMA.*"
          />
        </FieldGroup>
      </Collapsible>
    </div>
  );
}
