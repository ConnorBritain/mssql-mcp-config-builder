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

/* Simple recognizable SVG icons for each client */
function ClientIcon({ id }: { id: McpClientId }) {
  switch (id) {
    case "cursor":
      // Cursor-style: angled bracket cursor
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="2" width="20" height="20" rx="4" fill="#000" />
          <path d="M8 7l8 5-8 5V7z" fill="#fff" />
        </svg>
      );
    case "windsurf":
      // Wave/sail icon
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="2" width="20" height="20" rx="4" fill="#0EA5E9" />
          <path d="M7 17c2-2 4-6 5-10 1 4 3 8 5 10" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
          <path d="M6 18h12" stroke="#fff" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      );
    case "claude-desktop":
      // Claude-style: speech bubble with sparkle
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="2" width="20" height="20" rx="4" fill="#D97706" />
          <path d="M12 6c-3.3 0-6 2.2-6 5 0 1.5.7 2.8 1.8 3.7L7 18l3.2-1.3c.6.2 1.2.3 1.8.3 3.3 0 6-2.2 6-5s-2.7-5-6-5z" fill="#fff" />
        </svg>
      );
    case "vscode":
      // VS Code-style: bracket icon
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="2" width="20" height="20" rx="4" fill="#007ACC" />
          <path d="M15 6l-7 6 7 6" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
          <path d="M16 6v12" stroke="#fff" stroke-width="2" stroke-linecap="round" />
        </svg>
      );
  }
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
