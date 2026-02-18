import type { StepProps } from "../../app";
import { TIER_OPTIONS } from "../../state/defaults";
import { Tooltip } from "../shared/Tooltip";

export function ModeSelect({ state, dispatch }: StepProps) {
  function selectMode(mode: "quick" | "multi") {
    dispatch({ type: "SET_MODE", mode });
    dispatch({ type: "NEXT_STEP" });
  }

  return (
    <div class="step step-mode">
      <div class="mode-heading">
        <h2>Choose Setup Mode</h2>
        <div class="mode-toggle-group">
          <label class={`mode-toggle${!state.simpleMode ? " mode-toggle--advanced" : ""}`}>
            <input
              type="checkbox"
              checked={!state.simpleMode}
              onChange={(e) => dispatch({ type: "SET_SIMPLE_MODE", value: !(e.target as HTMLInputElement).checked })}
            />
            <span class="mode-toggle-track">
              <span class="mode-toggle-label mode-toggle-label--simple">Simple</span>
              <span class="mode-toggle-label mode-toggle-label--advanced">Advanced</span>
            </span>
          </label>
          <Tooltip text="Simple mode is a streamlined 3-step flow (Mode, Connection, Review) — ideal for report writers, analysts, or anyone who just needs to connect and query. Advanced mode unlocks all 6 steps with full governance, audit logging, secrets management, and access controls — best for DBAs, software engineers, data architects, and sysadmins managing enterprise environments." />
        </div>
      </div>
      <p>Select how you want to configure your MSSQL MCP server.</p>

      <div class="mode-cards">
        <button
          type="button"
          class={`mode-card${state.mode === "quick" ? " mode-card--selected" : ""}`}
          onClick={() => selectMode("quick")}
        >
          <span class="mode-card-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
              <ellipse cx="12" cy="10" rx="4" ry="2" />
            </svg>
          </span>
          <h3>Quick Setup</h3>
          <p>Configure a single database connection with minimal options.</p>
          <ul>
            <li>Single database connection</li>
            <li>~5 fields to configure</li>
            <li>Produces mcp_config.json</li>
          </ul>
        </button>

        <button
          type="button"
          class={`mode-card${state.mode === "multi" ? " mode-card--selected" : ""}`}
          onClick={() => selectMode("multi")}
        >
          <span class="mode-card-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
              <line x1="15" y1="10" x2="21" y2="10" />
              <line x1="18" y1="7" x2="18" y2="13" />
            </svg>
          </span>
          <h3>Multi-Environment</h3>
          <p>Configure multiple database connections with full governance controls.</p>
          <ul>
            <li>Multiple database connections</li>
            <li>Full governance and audit controls</li>
            <li>Produces both config files</li>
          </ul>
        </button>
      </div>

      <div class="tier-select">
        <h3>Package Tier</h3>
        <div class="tier-options">
          {TIER_OPTIONS.map((t) => (
            <label key={t.value} class={`tier-option${state.tier === t.value ? " tier-option--selected" : ""}`}>
              <input
                type="radio"
                name="tier"
                value={t.value}
                checked={state.tier === t.value}
                onChange={() => dispatch({ type: "SET_TIER", tier: t.value })}
              />
              <div>
                <strong>{t.label}</strong>
                <small>{t.description}</small>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
