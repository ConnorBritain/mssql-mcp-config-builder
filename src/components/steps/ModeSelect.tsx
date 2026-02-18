import type { StepProps } from "../../app";
import { TIER_OPTIONS } from "../../state/defaults";

export function ModeSelect({ state, dispatch }: StepProps) {
  function selectMode(mode: "quick" | "multi") {
    dispatch({ type: "SET_MODE", mode });
    dispatch({ type: "NEXT_STEP" });
  }

  return (
    <div class="step step-mode">
      <h2>Choose Setup Mode</h2>

      <div class="mode-cards">
        <button
          type="button"
          class={`mode-card${state.mode === "quick" ? " mode-card--selected" : ""}`}
          onClick={() => selectMode("quick")}
        >
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
