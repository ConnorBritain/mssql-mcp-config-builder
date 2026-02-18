import type { AuditSinkConfig, AuditSinkType } from "../../state/types";
import { AUDIT_SINK_TYPE_OPTIONS } from "../../state/defaults";
import { FieldGroup } from "../shared/FieldGroup";

interface AuditSinkCardProps {
  sink: AuditSinkConfig;
  onChange: (sink: AuditSinkConfig) => void;
  onRemove: () => void;
}

function defaultSinkForType(type: AuditSinkType): AuditSinkConfig {
  switch (type) {
    case "file":
      return { type: "file", path: "" };
    case "syslog":
      return { type: "syslog", host: "" };
    case "http":
      return { type: "http", url: "" };
    case "azure-monitor":
      return { type: "azure-monitor", workspaceId: "", sharedKey: "" };
    case "cloudwatch":
      return { type: "cloudwatch", logGroupName: "" };
  }
}

export function AuditSinkCard({ sink, onChange, onRemove }: AuditSinkCardProps) {
  function handleTypeChange(newType: AuditSinkType) {
    if (newType !== sink.type) {
      onChange(defaultSinkForType(newType));
    }
  }

  function updateField(field: string, value: unknown) {
    onChange({ ...sink, [field]: value } as AuditSinkConfig);
  }

  return (
    <div class="card">
      <div class="card-header">
        <FieldGroup label="Sink Type">
          <select
            value={sink.type}
            onChange={(e) => handleTypeChange((e.target as HTMLSelectElement).value as AuditSinkType)}
          >
            {AUDIT_SINK_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </FieldGroup>
        <button type="button" class="btn btn-danger btn-sm" onClick={onRemove}>Remove</button>
      </div>

      {sink.type === "file" && (
        <FieldGroup label="File Path" helpText="Default: logs/audit.jsonl">
          <input
            type="text"
            value={sink.path ?? ""}
            onInput={(e) => updateField("path", (e.target as HTMLInputElement).value)}
            placeholder="logs/audit.jsonl"
          />
        </FieldGroup>
      )}

      {sink.type === "syslog" && (
        <div>
          <FieldGroup label="Host" required>
            <input
              type="text"
              value={sink.host}
              onInput={(e) => updateField("host", (e.target as HTMLInputElement).value)}
              placeholder="localhost"
            />
          </FieldGroup>
          <FieldGroup label="Port">
            <input
              type="number"
              value={sink.port ?? ""}
              onInput={(e) => updateField("port", Number((e.target as HTMLInputElement).value) || undefined)}
              placeholder="514"
            />
          </FieldGroup>
          <FieldGroup label="Protocol">
            <select
              value={sink.protocol ?? "udp"}
              onChange={(e) => updateField("protocol", (e.target as HTMLSelectElement).value)}
            >
              <option value="udp">UDP</option>
              <option value="tcp">TCP</option>
            </select>
          </FieldGroup>
          <FieldGroup label="Facility">
            <input
              type="number"
              value={sink.facility ?? ""}
              onInput={(e) => updateField("facility", Number((e.target as HTMLInputElement).value) || undefined)}
              placeholder="1"
            />
          </FieldGroup>
          <FieldGroup label="App Name">
            <input
              type="text"
              value={sink.appName ?? ""}
              onInput={(e) => updateField("appName", (e.target as HTMLInputElement).value)}
              placeholder="mssql-mcp"
            />
          </FieldGroup>
        </div>
      )}

      {sink.type === "http" && (
        <div>
          <FieldGroup label="URL" required>
            <input
              type="text"
              value={sink.url}
              onInput={(e) => updateField("url", (e.target as HTMLInputElement).value)}
              placeholder="https://example.com/webhook"
            />
          </FieldGroup>
          <FieldGroup label="Method">
            <select
              value={sink.method ?? "POST"}
              onChange={(e) => updateField("method", (e.target as HTMLSelectElement).value)}
            >
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
            </select>
          </FieldGroup>
          <FieldGroup label="Batch Size">
            <input
              type="number"
              value={sink.batchSize ?? ""}
              onInput={(e) => updateField("batchSize", Number((e.target as HTMLInputElement).value) || undefined)}
              placeholder="100"
            />
          </FieldGroup>
          <FieldGroup label="Flush Interval (ms)">
            <input
              type="number"
              value={sink.flushIntervalMs ?? ""}
              onInput={(e) => updateField("flushIntervalMs", Number((e.target as HTMLInputElement).value) || undefined)}
              placeholder="5000"
            />
          </FieldGroup>
        </div>
      )}

      {sink.type === "azure-monitor" && (
        <div>
          <FieldGroup label="Workspace ID" required>
            <input
              type="text"
              value={sink.workspaceId}
              onInput={(e) => updateField("workspaceId", (e.target as HTMLInputElement).value)}
            />
          </FieldGroup>
          <FieldGroup label="Shared Key" required>
            <input
              type="password"
              value={sink.sharedKey}
              onInput={(e) => updateField("sharedKey", (e.target as HTMLInputElement).value)}
            />
          </FieldGroup>
          <FieldGroup label="Log Type">
            <input
              type="text"
              value={sink.logType ?? ""}
              onInput={(e) => updateField("logType", (e.target as HTMLInputElement).value)}
              placeholder="MSSQLMCPAudit"
            />
          </FieldGroup>
          <FieldGroup label="Batch Size">
            <input
              type="number"
              value={sink.batchSize ?? ""}
              onInput={(e) => updateField("batchSize", Number((e.target as HTMLInputElement).value) || undefined)}
            />
          </FieldGroup>
          <FieldGroup label="Flush Interval (ms)">
            <input
              type="number"
              value={sink.flushIntervalMs ?? ""}
              onInput={(e) => updateField("flushIntervalMs", Number((e.target as HTMLInputElement).value) || undefined)}
            />
          </FieldGroup>
        </div>
      )}

      {sink.type === "cloudwatch" && (
        <div>
          <FieldGroup label="Log Group Name" required>
            <input
              type="text"
              value={sink.logGroupName}
              onInput={(e) => updateField("logGroupName", (e.target as HTMLInputElement).value)}
            />
          </FieldGroup>
          <FieldGroup label="Log Stream Name">
            <input
              type="text"
              value={sink.logStreamName ?? ""}
              onInput={(e) => updateField("logStreamName", (e.target as HTMLInputElement).value)}
            />
          </FieldGroup>
          <FieldGroup label="Region">
            <input
              type="text"
              value={sink.region ?? ""}
              onInput={(e) => updateField("region", (e.target as HTMLInputElement).value)}
              placeholder="us-east-1"
            />
          </FieldGroup>
          <FieldGroup label="Batch Size">
            <input
              type="number"
              value={sink.batchSize ?? ""}
              onInput={(e) => updateField("batchSize", Number((e.target as HTMLInputElement).value) || undefined)}
            />
          </FieldGroup>
          <FieldGroup label="Flush Interval (ms)">
            <input
              type="number"
              value={sink.flushIntervalMs ?? ""}
              onInput={(e) => updateField("flushIntervalMs", Number((e.target as HTMLInputElement).value) || undefined)}
            />
          </FieldGroup>
        </div>
      )}
    </div>
  );
}
