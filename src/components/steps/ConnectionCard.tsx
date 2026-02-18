import type { EnvironmentFormState } from "../../state/types";
import type { Action } from "../../state/reducer";
import { AUTH_MODE_OPTIONS } from "../../state/defaults";
import { FieldGroup } from "../shared/FieldGroup";
import { Collapsible } from "../shared/Collapsible";
import { AuthFields } from "./AuthFields";

interface ConnectionCardProps {
  env: EnvironmentFormState;
  dispatch: (action: Action) => void;
  onRemove?: () => void;
  canRemove: boolean;
}

export function ConnectionCard({ env, dispatch, onRemove, canRemove }: ConnectionCardProps) {
  function update(field: string, value: unknown) {
    dispatch({ type: "UPDATE_ENVIRONMENT", id: env.id, field, value });
  }

  const title = env.name ? env.name : "New Environment";
  const subtitle = env.server && env.database ? `${env.server} / ${env.database}` : "";

  return (
    <Collapsible title={subtitle ? `${title} - ${subtitle}` : title} defaultOpen={!env.server}>
      <div class="card-body">
        <FieldGroup label="Environment Name" required>
          <input
            type="text"
            value={env.name}
            onInput={(e) => update("name", (e.target as HTMLInputElement).value)}
            placeholder="production"
          />
        </FieldGroup>
        <FieldGroup label="Description">
          <input
            type="text"
            value={env.description}
            onInput={(e) => update("description", (e.target as HTMLInputElement).value)}
            placeholder="Production database"
          />
        </FieldGroup>
        <FieldGroup label="Server" required>
          <input
            type="text"
            value={env.server}
            onInput={(e) => update("server", (e.target as HTMLInputElement).value)}
            placeholder="myserver.database.windows.net"
          />
        </FieldGroup>
        <FieldGroup label="Database" required>
          <input
            type="text"
            value={env.database}
            onInput={(e) => update("database", (e.target as HTMLInputElement).value)}
            placeholder="mydb"
          />
        </FieldGroup>
        <FieldGroup label="Authentication Mode">
          <select
            value={env.authMode}
            onChange={(e) => update("authMode", (e.target as HTMLSelectElement).value)}
          >
            {AUTH_MODE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </FieldGroup>
        <AuthFields
          authMode={env.authMode}
          envId={env.id}
          username={env.username}
          password={env.password}
          domain={env.domain}
          dispatch={dispatch}
        />

        <Collapsible title="Advanced Settings">
          <FieldGroup label="Port" helpText="Default: 1433">
            <input
              type="text"
              value={env.port}
              onInput={(e) => update("port", (e.target as HTMLInputElement).value)}
              placeholder="1433"
            />
          </FieldGroup>
          <FieldGroup label="Connection Timeout (ms)">
            <input
              type="text"
              value={env.connectionTimeout}
              onInput={(e) => update("connectionTimeout", (e.target as HTMLInputElement).value)}
              placeholder="15000"
            />
          </FieldGroup>
          <FieldGroup label="Request Timeout (ms)">
            <input
              type="text"
              value={env.requestTimeout}
              onInput={(e) => update("requestTimeout", (e.target as HTMLInputElement).value)}
              placeholder="15000"
            />
          </FieldGroup>
          <FieldGroup label="Trust Server Certificate">
            <label class="toggle-label">
              <input
                type="checkbox"
                checked={env.trustServerCertificate}
                onChange={(e) => update("trustServerCertificate", (e.target as HTMLInputElement).checked)}
              />
              Trust the server certificate (useful for self-signed certs)
            </label>
          </FieldGroup>
        </Collapsible>

        {canRemove && onRemove && (
          <button type="button" class="btn btn-danger btn-sm" onClick={onRemove}>
            Remove Environment
          </button>
        )}
      </div>
    </Collapsible>
  );
}
