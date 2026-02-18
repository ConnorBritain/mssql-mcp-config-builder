interface HeaderProps {
  simpleMode: boolean;
  onSimpleModeChange: (v: boolean) => void;
  onImportClick: () => void;
}

export function Header({ simpleMode, onSimpleModeChange, onImportClick }: HeaderProps) {
  return (
    <header class="header">
      <div class="header-accent" />
      <div class="header-content">
        <div class="header-left">
          <svg class="header-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
          </svg>
          <div class="header-text">
            <h1>MSSQL MCP Config Builder</h1>
            <span class="header-subtitle">
              Visual configuration wizard for the MSSQL MCP ecosystem
            </span>
          </div>
        </div>
        <div class="header-actions">
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
      </div>
    </header>
  );
}
