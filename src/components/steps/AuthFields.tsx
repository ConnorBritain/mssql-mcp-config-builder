import type { AuthMode } from "../../state/types";
import type { Action } from "../../state/reducer";
import { FieldGroup } from "../shared/FieldGroup";

interface AuthFieldsProps {
  authMode: AuthMode;
  envId: string;
  username: string;
  password: string;
  domain: string;
  dispatch: (action: Action) => void;
}

export function AuthFields({ authMode, envId, username, password, domain, dispatch }: AuthFieldsProps) {
  function update(field: string, value: string) {
    dispatch({ type: "UPDATE_ENVIRONMENT", id: envId, field, value });
  }

  if (authMode === "aad") {
    return (
      <div class="info-box">
        Azure AD authentication uses browser-based interactive login. No credentials needed in config.
      </div>
    );
  }

  const showSecretWarning = password.trim() !== "" && !password.includes("${secret:");

  return (
    <div>
      {authMode === "windows" && (
        <FieldGroup label="Domain">
          <input
            type="text"
            value={domain}
            onInput={(e) => update("domain", (e.target as HTMLInputElement).value)}
            placeholder="MYDOMAIN"
          />
        </FieldGroup>
      )}
      <FieldGroup label="Username" required>
        <input
          type="text"
          value={username}
          onInput={(e) => update("username", (e.target as HTMLInputElement).value)}
          placeholder="sa"
        />
      </FieldGroup>
      <FieldGroup
        label="Password"
        required
        helpText={showSecretWarning ? undefined : "Use ${secret:NAME} to reference secrets"}
        error={showSecretWarning ? "Consider using ${secret:NAME} for passwords" : undefined}
      >
        <input
          type="password"
          value={password}
          onInput={(e) => update("password", (e.target as HTMLInputElement).value)}
          placeholder="${secret:DB_PASSWORD}"
        />
      </FieldGroup>
    </div>
  );
}
