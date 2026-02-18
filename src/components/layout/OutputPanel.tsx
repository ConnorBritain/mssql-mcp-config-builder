import { useState, useMemo } from "preact/hooks";
import type { AppState } from "../../state/types";
import { serializeToJson } from "../../state";
import { highlightJson } from "../../lib/jsonHighlight";
import { downloadJson } from "../../lib/download";
import { CopyButton } from "../shared/CopyButton";

interface OutputPanelProps {
  state: AppState;
}

export function OutputPanel({ state }: OutputPanelProps) {
  const [activeTab, setActiveTab] = useState<"mcp" | "env">("mcp");

  const { mcpConfigJson, environmentsConfigJson } = useMemo(
    () => serializeToJson(state),
    [state],
  );

  const showEnvTab = state.mode === "multi";
  const currentJson = activeTab === "mcp" ? mcpConfigJson : (environmentsConfigJson ?? "");
  const currentFilename = activeTab === "mcp" ? "mcp_config.json" : "environments.json";

  const highlighted = useMemo(() => highlightJson(currentJson), [currentJson]);

  return (
    <div class="output-panel">
      <div class="tab-bar">
        <button
          type="button"
          class={`tab ${activeTab === "mcp" ? "active" : ""}`}
          onClick={() => setActiveTab("mcp")}
        >
          mcp_config.json
        </button>
        {showEnvTab && (
          <button
            type="button"
            class={`tab ${activeTab === "env" ? "active" : ""}`}
            onClick={() => setActiveTab("env")}
          >
            environments.json
          </button>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", padding: "8px 12px" }}>
        <CopyButton text={currentJson} />
        <button
          type="button"
          class="btn btn-secondary btn-icon"
          onClick={() => downloadJson(currentJson, currentFilename)}
        >
          Download
        </button>
      </div>
      <pre class="json-output" dangerouslySetInnerHTML={{ __html: highlighted }} />
    </div>
  );
}
