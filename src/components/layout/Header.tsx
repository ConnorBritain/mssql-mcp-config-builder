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
          <svg class="header-icon" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <ellipse cx="12" cy="5.5" rx="8" ry="2.5" fill="rgba(37,99,235,0.15)" stroke="currentColor" stroke-width="1.5" />
            <path d="M4 5.5v4c0 1.38 3.58 2.5 8 2.5s8-1.12 8-2.5v-4" stroke="currentColor" stroke-width="1.5" />
            <path d="M4 9.5v4c0 1.38 3.58 2.5 8 2.5s8-1.12 8-2.5v-4" stroke="currentColor" stroke-width="1.5" />
            <path d="M4 13.5v4c0 1.38 3.58 2.5 8 2.5s8-1.12 8-2.5v-4" stroke="currentColor" stroke-width="1.5" />
            <circle cx="18" cy="17" r="4" fill="var(--color-primary)" stroke="none" />
            <path d="M16.5 17h3M18 15.5v3" stroke="white" stroke-width="1.5" />
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
