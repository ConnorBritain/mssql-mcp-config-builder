import type { StepProps } from "../../app";
import { AUTH_MODE_OPTIONS } from "../../state/defaults";
import { FieldGroup } from "../shared/FieldGroup";
import { Collapsible } from "../shared/Collapsible";
import { AuthFields } from "./AuthFields";
import { ConnectionCard } from "./ConnectionCard";

export function ConnectionStep({ state, dispatch }: StepProps) {
  if (state.mode === "multi") {
    return (
      <div class="step step-connection">
        <h2>Environments</h2>
        <p class="section-intro">
          Each environment is a named database connection that your AI assistant can use. Define one per database or server you want to query.
        </p>

        {state.environments.map((env) => (
          <ConnectionCard
            key={env.id}
            env={env}
            dispatch={dispatch}
            canRemove={state.environments.length > 1}
            onRemove={() => dispatch({ type: "REMOVE_ENVIRONMENT", id: env.id })}
          />
        ))}

        <button
          type="button"
          class="btn btn-secondary"
          onClick={() => dispatch({ type: "ADD_ENVIRONMENT" })}
        >
          + Add Environment
        </button>
      </div>
    );
  }

  // Quick mode: single form
  const env = state.environments[0];

  function update(field: string, value: unknown) {
    dispatch({ type: "UPDATE_ENVIRONMENT", id: env.id, field, value });
  }

  return (
    <div class="step step-connection">
      <h2>Connection Details</h2>
      <p class="section-intro">
        Tell the MCP server how to reach your SQL Server instance. Your AI assistant will use these credentials to run queries on your behalf.
      </p>

      <FieldGroup label="Server" required tooltip="The hostname or IP address of your SQL Server. For Azure, this is usually yourserver.database.windows.net.">
        <input
          type="text"
          value={env.server}
          onInput={(e) => update("server", (e.target as HTMLInputElement).value)}
          placeholder="myserver.database.windows.net"
        />
      </FieldGroup>

      <FieldGroup label="Database" required tooltip="The name of the database to connect to. The AI assistant will only be able to query this database.">
        <input
          type="text"
          value={env.database}
          onInput={(e) => update("database", (e.target as HTMLInputElement).value)}
          placeholder="mydb"
        />
      </FieldGroup>

      <FieldGroup label="Authentication Mode" tooltip="SQL: username/password login. Windows/NTLM: uses your Windows domain credentials. Azure AD: for Azure-hosted databases with Entra ID authentication.">
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

      <Collapsible title="Advanced Settings" tooltip="Optional settings for custom ports, timeouts, and certificate handling. Most users can skip this.">
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
        <FieldGroup label="Trust Server Certificate" tooltip="Enable this if your SQL Server uses a self-signed SSL certificate. Common in development environments.">
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
    </div>
  );
}
