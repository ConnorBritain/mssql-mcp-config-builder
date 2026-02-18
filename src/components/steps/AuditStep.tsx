import { useState } from "preact/hooks";
import type { StepProps } from "../../app";
import type { AuditSinkConfig } from "../../state/types";
import { AUDIT_LEVEL_OPTIONS } from "../../state/defaults";
import { FieldGroup } from "../shared/FieldGroup";
import { AuditSinkCard } from "./AuditSinkCard";

export function AuditStep({ state, dispatch }: StepProps) {
  const [selectedEnvId, setSelectedEnvId] = useState(state.environments[0].id);
  const [scope, setScope] = useState<"global" | "env">("global");

  const env = state.environments.find((e) => e.id === selectedEnvId) ?? state.environments[0];

  function updateEnvField(field: string, value: unknown) {
    dispatch({ type: "UPDATE_ENVIRONMENT", id: env.id, field, value });
  }

  const isMulti = state.mode === "multi";
  const sinks = isMulti && scope === "global" ? state.globalConfig.auditSinks : env.auditSinks;

  function addSink() {
    const newSink: AuditSinkConfig = { type: "file", path: "" };
    if (isMulti && scope === "global") {
      dispatch({ type: "ADD_GLOBAL_AUDIT_SINK", sink: newSink });
    } else {
      dispatch({ type: "ADD_ENV_AUDIT_SINK", envId: env.id, sink: newSink });
    }
  }

  function removeSink(index: number) {
    if (isMulti && scope === "global") {
      dispatch({ type: "REMOVE_GLOBAL_AUDIT_SINK", index });
    } else {
      dispatch({ type: "REMOVE_ENV_AUDIT_SINK", envId: env.id, index });
    }
  }

  function updateSink(index: number, sink: AuditSinkConfig) {
    if (isMulti && scope === "global") {
      dispatch({ type: "UPDATE_GLOBAL_AUDIT_SINK", index, sink });
    } else {
      dispatch({ type: "UPDATE_ENV_AUDIT_SINK", envId: env.id, index, sink });
    }
  }

  return (
    <div class="step step-audit">
      <h2>Audit Configuration</h2>

      <FieldGroup label="Audit Level">
        <select
          value={env.auditLevel}
          onChange={(e) => updateEnvField("auditLevel", (e.target as HTMLSelectElement).value)}
        >
          {AUDIT_LEVEL_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </FieldGroup>

      {isMulti && (
        <div class="scope-toggle">
          <FieldGroup label="Sink Scope">
            <div class="radio-group">
              <label>
                <input
                  type="radio"
                  name="auditScope"
                  checked={scope === "global"}
                  onChange={() => setScope("global")}
                />
                Global sinks (apply to all environments)
              </label>
              <label>
                <input
                  type="radio"
                  name="auditScope"
                  checked={scope === "env"}
                  onChange={() => setScope("env")}
                />
                Per-environment sinks
              </label>
            </div>
          </FieldGroup>

          {scope === "env" && (
            <FieldGroup label="Environment">
              <select
                value={selectedEnvId}
                onChange={(e) => setSelectedEnvId((e.target as HTMLSelectElement).value)}
              >
                {state.environments.map((e) => (
                  <option key={e.id} value={e.id}>{e.name || "Unnamed"}</option>
                ))}
              </select>
            </FieldGroup>
          )}
        </div>
      )}

      {sinks.map((sink, i) => (
        <AuditSinkCard
          key={i}
          sink={sink}
          onChange={(s) => updateSink(i, s)}
          onRemove={() => removeSink(i)}
        />
      ))}

      <button type="button" class="btn btn-secondary" onClick={addSink}>
        + Add Audit Sink
      </button>
    </div>
  );
}
