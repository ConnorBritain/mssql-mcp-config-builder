interface HeaderProps {
  simpleMode: boolean;
  onSimpleModeChange: (v: boolean) => void;
  onImportClick: () => void;
}

export function Header({ simpleMode, onSimpleModeChange, onImportClick }: HeaderProps) {
  return (
    <header class="header">
      <div>
        <h1>MSSQL MCP Config Builder</h1>
        <small style={{ color: "var(--color-text-secondary)" }}>
          Visual configuration wizard for the MSSQL MCP ecosystem
        </small>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <label class="toggle-switch">
          <input
            type="checkbox"
            checked={!simpleMode}
            onChange={(e) => onSimpleModeChange(!(e.target as HTMLInputElement).checked)}
          />
          <span class="toggle-track" />
          <span class="toggle-label">{simpleMode ? "Simple" : "Advanced"}</span>
        </label>
        <button type="button" class="btn btn-secondary btn-icon" onClick={onImportClick}>
          Import
        </button>
      </div>
    </header>
  );
}
