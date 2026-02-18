import type { SecretProviderConfig, SecretProviderType } from "../../state/types";
import { SECRET_PROVIDER_TYPE_OPTIONS } from "../../state/defaults";
import { FieldGroup } from "../shared/FieldGroup";

interface SecretProviderCardProps {
  provider: SecretProviderConfig;
  onChange: (p: SecretProviderConfig) => void;
  onRemove: () => void;
}

export function SecretProviderCard({ provider, onChange, onRemove }: SecretProviderCardProps) {
  function handleTypeChange(newType: SecretProviderType) {
    if (newType !== provider.type) {
      onChange({ type: newType });
    }
  }

  function updateField(field: string, value: unknown) {
    onChange({ ...provider, [field]: value });
  }

  return (
    <div class="card">
      <div class="card-header">
        <FieldGroup label="Provider Type">
          <select
            value={provider.type}
            onChange={(e) => handleTypeChange((e.target as HTMLSelectElement).value as SecretProviderType)}
          >
            {SECRET_PROVIDER_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </FieldGroup>
        <button type="button" class="btn btn-danger btn-sm" onClick={onRemove}>Remove</button>
      </div>

      {provider.type === "env" && (
        <div class="info-box">
          Reads secrets from environment variables. No additional configuration needed.
        </div>
      )}

      {provider.type === "dotenv" && (
        <FieldGroup label="Path" required helpText="Path to .env file">
          <input
            type="text"
            value={provider.path ?? ""}
            onInput={(e) => updateField("path", (e.target as HTMLInputElement).value)}
            placeholder=".env"
          />
        </FieldGroup>
      )}

      {provider.type === "file" && (
        <FieldGroup label="Directory" required helpText="Directory containing secret files (one file per secret)">
          <input
            type="text"
            value={provider.directory ?? ""}
            onInput={(e) => updateField("directory", (e.target as HTMLInputElement).value)}
            placeholder="/run/secrets"
          />
        </FieldGroup>
      )}

      {provider.type === "azure-keyvault" && (
        <div>
          <FieldGroup label="Vault URL" required>
            <input
              type="text"
              value={provider.vaultUrl ?? ""}
              onInput={(e) => updateField("vaultUrl", (e.target as HTMLInputElement).value)}
              placeholder="https://myvault.vault.azure.net"
            />
          </FieldGroup>
          <FieldGroup label="TTL (seconds)" helpText="Cache duration for retrieved secrets">
            <input
              type="number"
              value={provider.ttlSeconds ?? ""}
              onInput={(e) => updateField("ttlSeconds", Number((e.target as HTMLInputElement).value) || undefined)}
              placeholder="3600"
            />
          </FieldGroup>
        </div>
      )}

      {provider.type === "aws-secrets-manager" && (
        <div>
          <FieldGroup label="Region" required>
            <input
              type="text"
              value={provider.region ?? ""}
              onInput={(e) => updateField("region", (e.target as HTMLInputElement).value)}
              placeholder="us-east-1"
            />
          </FieldGroup>
          <FieldGroup label="TTL (seconds)" helpText="Cache duration for retrieved secrets">
            <input
              type="number"
              value={provider.ttlSeconds ?? ""}
              onInput={(e) => updateField("ttlSeconds", Number((e.target as HTMLInputElement).value) || undefined)}
              placeholder="3600"
            />
          </FieldGroup>
        </div>
      )}

      {provider.type === "hashicorp-vault" && (
        <div>
          <FieldGroup label="Address" required>
            <input
              type="text"
              value={provider.address ?? ""}
              onInput={(e) => updateField("address", (e.target as HTMLInputElement).value)}
              placeholder="https://vault.example.com:8200"
            />
          </FieldGroup>
          <FieldGroup label="Token">
            <input
              type="password"
              value={provider.token ?? ""}
              onInput={(e) => updateField("token", (e.target as HTMLInputElement).value)}
            />
          </FieldGroup>
          <FieldGroup label="Vault Path">
            <input
              type="text"
              value={provider.vaultPath ?? ""}
              onInput={(e) => updateField("vaultPath", (e.target as HTMLInputElement).value)}
              placeholder="secret/data/mssql"
            />
          </FieldGroup>
          <FieldGroup label="TTL (seconds)" helpText="Cache duration for retrieved secrets">
            <input
              type="number"
              value={provider.ttlSeconds ?? ""}
              onInput={(e) => updateField("ttlSeconds", Number((e.target as HTMLInputElement).value) || undefined)}
              placeholder="3600"
            />
          </FieldGroup>
        </div>
      )}
    </div>
  );
}
