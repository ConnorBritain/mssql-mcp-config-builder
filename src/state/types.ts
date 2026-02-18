// ---------------------------------------------------------------------------
// MSSQL MCP Config Builder – Type Definitions
// ---------------------------------------------------------------------------

/** Wizard mode: quick (single server) or multi (multi-environment). */
export type WizardMode = "quick" | "multi";

/** Package tier determines which tools are available. */
export type Tier = "reader" | "writer" | "admin";

/** SQL Server authentication mode. */
export type AuthMode = "sql" | "windows" | "aad";

/** Audit verbosity level. */
export type AuditLevel = "none" | "basic" | "verbose";

/** Environment access level. */
export type AccessLevel = "server" | "database";

// ---------------------------------------------------------------------------
// Audit sink configs (discriminated union)
// ---------------------------------------------------------------------------

export interface FileSinkConfig {
  type: "file";
  path?: string;
}

export interface SyslogSinkConfig {
  type: "syslog";
  host: string;
  port?: number;
  protocol?: "udp" | "tcp";
  facility?: number;
  appName?: string;
}

export interface HttpSinkConfig {
  type: "http";
  url: string;
  headers?: Record<string, string>;
  method?: "POST" | "PUT";
  batchSize?: number;
  flushIntervalMs?: number;
}

export interface AzureMonitorSinkConfig {
  type: "azure-monitor";
  workspaceId: string;
  sharedKey: string;
  logType?: string;
  batchSize?: number;
  flushIntervalMs?: number;
}

export interface CloudWatchSinkConfig {
  type: "cloudwatch";
  logGroupName: string;
  logStreamName?: string;
  region?: string;
  batchSize?: number;
  flushIntervalMs?: number;
}

export type AuditSinkConfig =
  | FileSinkConfig
  | SyslogSinkConfig
  | HttpSinkConfig
  | AzureMonitorSinkConfig
  | CloudWatchSinkConfig;

export type AuditSinkType = AuditSinkConfig["type"];

// ---------------------------------------------------------------------------
// Secret provider configs
// ---------------------------------------------------------------------------

export type SecretProviderType =
  | "env"
  | "dotenv"
  | "file"
  | "azure-keyvault"
  | "aws-secrets-manager"
  | "hashicorp-vault";

export interface SecretProviderConfig {
  type: SecretProviderType;
  // dotenv / file
  path?: string;
  directory?: string;
  // azure-keyvault
  vaultUrl?: string;
  // aws-secrets-manager
  region?: string;
  // hashicorp-vault
  address?: string;
  token?: string;
  vaultPath?: string;
  // common
  secrets?: Record<string, string>;
  ttlSeconds?: number;
}

export interface SecretsConfig {
  providers: SecretProviderConfig[];
}

// ---------------------------------------------------------------------------
// Environment form state (one per environment row)
// ---------------------------------------------------------------------------

export interface EnvironmentFormState {
  /** Client-side id for React keys. */
  id: string;
  /** Environment name (used as key in config). */
  name: string;
  description: string;

  // Connection
  server: string;
  database: string;
  port: string; // stored as string in the form; serialized as number
  authMode: AuthMode;
  username: string;
  password: string;
  domain: string;
  trustServerCertificate: boolean;
  connectionTimeout: string;
  requestTimeout: string;

  // Governance
  readonly: boolean;
  allowedTools: string[];
  deniedTools: string[];
  maxRowsDefault: string;
  requireApproval: string[];

  // Audit
  auditLevel: AuditLevel;
  auditSinks: AuditSinkConfig[];

  // Access control
  accessLevel: AccessLevel;
  allowedDatabases: string;
  deniedDatabases: string;
  allowedSchemas: string;
  deniedSchemas: string;
}

// ---------------------------------------------------------------------------
// Global config (multi-env mode)
// ---------------------------------------------------------------------------

export interface GlobalConfig {
  defaultEnvironment: string;
  scriptsPath: string;
  secrets: SecretsConfig;
  auditSinks: AuditSinkConfig[];
}

// ---------------------------------------------------------------------------
// Top-level app state
// ---------------------------------------------------------------------------

export interface AppState {
  mode: WizardMode;
  currentStep: number;
  simpleMode: boolean;
  tier: Tier;
  environments: EnvironmentFormState[];
  globalConfig: GlobalConfig;
  importDialogOpen: boolean;
}

// ---------------------------------------------------------------------------
// Serializer output types
// ---------------------------------------------------------------------------

export interface McpServerEntry {
  command: string;
  args: string[];
  env: Record<string, string>;
}

export interface McpConfigOutput {
  mcpServers: {
    mssql: McpServerEntry;
  };
}

/** The environments.json structure (mirrors core EnvironmentsConfig). */
export interface EnvironmentsConfigOutput {
  defaultEnvironment?: string;
  environments: Record<string, unknown>[];
  scriptsPath?: string;
  secrets?: SecretsConfig;
  auditSinks?: AuditSinkConfig[];
}

export interface SerializerOutput {
  mcpConfig: McpConfigOutput;
  environmentsConfig: EnvironmentsConfigOutput | null;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export interface FieldError {
  field: string;
  message: string;
  severity: "error" | "warning";
}

export interface ValidationResult {
  valid: boolean;
  errors: FieldError[];
}
