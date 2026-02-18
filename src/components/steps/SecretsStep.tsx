import type { StepProps } from "../../app";
import { SecretProviderCard } from "./SecretProviderCard";

export function SecretsStep({ state, dispatch }: StepProps) {
  const providers = state.globalConfig.secrets.providers;

  return (
    <div class="step step-secrets">
      <h2>Secret Providers</h2>

      <div class="info-box">
        {"Use ${secret:NAME} syntax in password fields to reference secrets from configured providers."}
      </div>

      {providers.map((provider, i) => (
        <SecretProviderCard
          key={i}
          provider={provider}
          onChange={(p) => dispatch({ type: "UPDATE_SECRET_PROVIDER", index: i, provider: p })}
          onRemove={() => dispatch({ type: "REMOVE_SECRET_PROVIDER", index: i })}
        />
      ))}

      <button
        type="button"
        class="btn btn-secondary"
        onClick={() => dispatch({ type: "ADD_SECRET_PROVIDER", provider: { type: "env" } })}
      >
        + Add Secret Provider
      </button>
    </div>
  );
}
