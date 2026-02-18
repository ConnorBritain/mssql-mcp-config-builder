import { useState, useMemo } from "preact/hooks";
import { CopyButton } from "../shared/CopyButton";
import { mergeIntoExistingConfig } from "../../lib/configMerge";
import { MCP_CLIENT_CONFIGS, type McpClientId } from "../../state/defaults";
import type { McpConfigOutput } from "../../state/types";

interface ExportLocationPickerProps {
  mcpConfig: McpConfigOutput;
  onFilenameChange?: (filename: string) => void;
}

function detectOS(): "mac" | "windows" | "linux" {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("win")) return "windows";
  if (ua.includes("mac")) return "mac";
  return "linux";
}

const CLIENT_LOGOS: Record<McpClientId, string> = {
  cursor: "logos/cursor.png",
  windsurf: "logos/Windsurf-black-symbol.svg",
  "claude-desktop": "logos/claude.png",
  vscode: "logos/visual-studio-code-1.svg",
};

function ClientIcon({ id }: { id: McpClientId }) {
  const src = `${import.meta.env.BASE_URL}${CLIENT_LOGOS[id]}`;
  const client = MCP_CLIENT_CONFIGS.find((c) => c.id === id);
  return <img src={src} alt={client?.label ?? id} width="32" height="32" class="client-logo-img" />;
}

export function ExportLocationPicker({ mcpConfig, onFilenameChange }: ExportLocationPickerProps) {
  const [selectedClient, setSelectedClient] = useState<McpClientId | null>(null);
  const [customPath, setCustomPath] = useState("");
  const [existingConfig, setExistingConfig] = useState("");
  const os = useMemo(detectOS, []);

  const clients = MCP_CLIENT_CONFIGS;

  function handleClientClick(id: McpClientId) {
    setSelectedClient(id);
    const client = clients.find((c) => c.id === id);
    if (client) {
      onFilenameChange?.(client.filename);
    }
  }

  const selectedInfo = selectedClient ? clients.find((c) => c.id === selectedClient) : null;
  const resolvedPath = selectedInfo
    ? selectedInfo.paths[os] ?? selectedInfo.paths.linux ?? ""
    : customPath;

  const mergeResult = useMemo(() => {
    if (!existingConfig.trim()) return null;
    return mergeIntoExistingConfig(existingConfig, mcpConfig);
  }, [existingConfig, mcpConfig]);

  return (
    <div class="export-location">
      <h3>Export Target</h3>
      <p>Select your MCP client to get the correct config file path.</p>

      <div class="client-grid">
        {clients.map((client) => (
          <button
            key={client.id}
            type="button"
            class={`client-btn${selectedClient === client.id ? " client-btn--selected" : ""}`}
            onClick={() => handleClientClick(client.id)}
          >
            <span class="client-icon"><ClientIcon id={client.id} /></span>
            {client.label}
          </button>
        ))}
      </div>

      {selectedInfo && (
        <div class="config-path-display">
          <code>{resolvedPath}</code>
          <CopyButton text={resolvedPath} label="Copy" />
        </div>
      )}

      {!selectedClient && (
        <div class="field-group">
          <label>Custom config path</label>
          <input
            type="text"
            placeholder="/path/to/mcp_config.json"
            value={customPath}
            onInput={(e) => setCustomPath((e.target as HTMLInputElement).value)}
          />
        </div>
      )}

      <div class="info-box">
        Copy the generated config and paste it into the file at the path above, or use the Download button and move the file manually.
      </div>

      <div class="merge-section">
        <h4>Merge with existing config</h4>
        <p>
          If you already have an MCP config with other servers, paste it below.
          The mssql server will be added without touching your other servers.
        </p>
        <textarea
          rows={5}
          placeholder='Paste your existing config JSON here (e.g., contents of claude_desktop_config.json)...'
          value={existingConfig}
          onInput={(e) => setExistingConfig((e.target as HTMLTextAreaElement).value)}
        />

        {mergeResult && mergeResult.success && (
          <div class="merge-result merge-result--success">
            Your existing config has {mergeResult.otherServerCount} other MCP server{mergeResult.otherServerCount !== 1 ? "s" : ""}. They will be preserved.
            <div style={{ marginTop: "8px" }}>
              <CopyButton text={mergeResult.json} label="Copy merged config" />
            </div>
          </div>
        )}

        {mergeResult && !mergeResult.success && (
          <div class="merge-result merge-result--error">
            Could not parse existing config: {mergeResult.error}
          </div>
        )}
      </div>
    </div>
  );
}
