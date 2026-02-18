import { useState } from "preact/hooks";

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (mcpConfig?: string, envConfig?: string) => void;
}

export function ImportDialog({ open, onClose, onImport }: ImportDialogProps) {
  const [mcpText, setMcpText] = useState("");
  const [envText, setEnvText] = useState("");

  if (!open) return null;

  function handleImport() {
    onImport(mcpText || undefined, envText || undefined);
    setMcpText("");
    setEnvText("");
  }

  function handleCancel() {
    setMcpText("");
    setEnvText("");
    onClose();
  }

  return (
    <div class="modal-overlay" onClick={handleCancel}>
      <div class="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Import Existing Configuration</h2>

        <div class="field-group">
          <label>MCP Config JSON (mcp_config.json)</label>
          <textarea
            rows={8}
            placeholder='{"mcpServers": { "mssql": { ... } }}'
            value={mcpText}
            onInput={(e) => setMcpText((e.target as HTMLTextAreaElement).value)}
          />
          <small class="help-text">Paste your existing mcp_config.json content</small>
        </div>

        <div class="field-group">
          <label>Environments Config JSON (environments.json)</label>
          <textarea
            rows={8}
            placeholder='{"defaultEnvironment": "dev", "environments": [...]}'
            value={envText}
            onInput={(e) => setEnvText((e.target as HTMLTextAreaElement).value)}
          />
          <small class="help-text">Paste your existing environments.json content</small>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
          <button
            type="button"
            class="btn btn-primary"
            onClick={handleImport}
            disabled={!mcpText && !envText}
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
}
