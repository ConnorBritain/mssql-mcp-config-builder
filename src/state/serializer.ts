// ---------------------------------------------------------------------------
// MSSQL MCP Config Builder – Serializer (State -> JSON)
// ---------------------------------------------------------------------------

import type {
  AppState,
  AuditSinkConfig,
  EnvironmentFormState,
  EnvironmentsConfigOutput,
  McpConfigOutput,
  SecretsConfig,
  SerializerOutput,
} from "./types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Omit keys whose values are undefined, empty strings, empty arrays, or match defaults. */
function clean<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Partial<T> = {};
  for (const key of Object.keys(obj) as (keyof T)[]) {
    const val = obj[key];
    if (val === undefined || val === null) continue;
    if (val === "") continue;
    if (Array.isArray(val) && val.length === 0) continue;
    if (typeof val === "object" && !Array.isArray(val) && Object.keys(val as object).length === 0)
      continue;
    result[key] = val;
  }
  return result;
}

function numOrUndefined(s: string): number | undefined {
  if (!s.trim()) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

function csvToArray(s: string): string[] | undefined {
  const arr = s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  return arr.length > 0 ? arr : undefined;
}

function serializeSink(sink: AuditSinkConfig): Record<string, unknown> {
  return clean(sink as unknown as Record<string, unknown>);
}

function serializeSinks(sinks: AuditSinkConfig[]): Record<string, unknown>[] | undefined {
  if (sinks.length === 0) return undefined;
  return sinks.map(serializeSink);
}

// ---------------------------------------------------------------------------
// Environment serialization (for environments.json)
// ---------------------------------------------------------------------------

function serializeEnvironment(env: EnvironmentFormState): Record<string, unknown> {
  const out: Record<string, unknown> = {
    name: env.name,
    server: env.server,
    database: env.database,
  };

  if (env.description) out.description = env.description;
  if (env.port) out.port = numOrUndefined(env.port);
  if (env.authMode !== "sql") out.authMode = env.authMode;
  if (env.username) out.username = env.username;
  if (env.password) out.password = env.password;
  if (env.domain) out.domain = env.domain;
  if (env.trustServerCertificate) out.trustServerCertificate = true;

  const connTimeout = numOrUndefined(env.connectionTimeout);
  if (connTimeout !== undefined) out.connectionTimeout = connTimeout;

  const reqTimeout = numOrUndefined(env.requestTimeout);
  if (reqTimeout !== undefined) out.requestTimeout = reqTimeout;

  if (env.readonly) out.readonly = true;
  if (env.allowedTools.length > 0) out.allowedTools = [...env.allowedTools];
  if (env.deniedTools.length > 0) out.deniedTools = [...env.deniedTools];

  const maxRows = numOrUndefined(env.maxRowsDefault);
  if (maxRows !== undefined) out.maxRowsDefault = maxRows;

  if (env.requireApproval.length > 0) out.requireApproval = [...env.requireApproval];

  if (env.auditLevel !== "basic") out.auditLevel = env.auditLevel;

  const sinks = serializeSinks(env.auditSinks);
  if (sinks) out.auditSinks = sinks;

  if (env.accessLevel !== "database") out.accessLevel = env.accessLevel;

  const allowedDb = csvToArray(env.allowedDatabases);
  if (allowedDb) out.allowedDatabases = allowedDb;
  const deniedDb = csvToArray(env.deniedDatabases);
  if (deniedDb) out.deniedDatabases = deniedDb;
  const allowedSch = csvToArray(env.allowedSchemas);
  if (allowedSch) out.allowedSchemas = allowedSch;
  const deniedSch = csvToArray(env.deniedSchemas);
  if (deniedSch) out.deniedSchemas = deniedSch;

  return out;
}

// ---------------------------------------------------------------------------
// Quick-mode env vars
// ---------------------------------------------------------------------------

function quickModeEnvVars(env: EnvironmentFormState, state: AppState): Record<string, string> {
  const vars: Record<string, string> = {};

  vars.SERVER_NAME = env.server;
  vars.DATABASE_NAME = env.database;

  if (env.port) vars.SERVER_PORT = env.port;
  if (env.authMode !== "sql") vars.SQL_AUTH_MODE = env.authMode;
  if (env.username) vars.SQL_USERNAME = env.username;
  if (env.password) vars.SQL_PASSWORD = env.password;
  if (env.domain) vars.SQL_DOMAIN = env.domain;
  if (env.trustServerCertificate) vars.TRUST_SERVER_CERTIFICATE = "true";
  if (env.connectionTimeout) vars.CONNECTION_TIMEOUT = env.connectionTimeout;
  if (env.requestTimeout) vars.REQUEST_TIMEOUT = env.requestTimeout;
  if (env.readonly || state.tier === "reader") vars.READONLY = "true";
  if (env.maxRowsDefault) vars.MAX_ROWS_DEFAULT = env.maxRowsDefault;
  if (env.auditLevel !== "basic") vars.AUDIT_LEVEL = env.auditLevel;
  if (env.auditLevel === "none") vars.AUDIT_LOGGING = "false";

  return vars;
}

// ---------------------------------------------------------------------------
// MCP config
// ---------------------------------------------------------------------------

function buildMcpConfig(state: AppState): McpConfigOutput {
  const tier = state.tier;
  const pkg = `@connorbritain/mssql-mcp-${tier}@latest`;

  const env: Record<string, string> = {};

  if (state.mode === "quick") {
    Object.assign(env, quickModeEnvVars(state.environments[0], state));
  } else {
    env.ENVIRONMENTS_CONFIG_PATH = "./environments.json";
  }

  return {
    mcpServers: {
      mssql: {
        command: "npx",
        args: [pkg],
        env,
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Environments config
// ---------------------------------------------------------------------------

function buildEnvironmentsConfig(state: AppState): EnvironmentsConfigOutput | null {
  if (state.mode === "quick") return null;

  const out: EnvironmentsConfigOutput = {
    environments: state.environments.map(serializeEnvironment),
  };

  if (state.globalConfig.defaultEnvironment) {
    out.defaultEnvironment = state.globalConfig.defaultEnvironment;
  }

  if (state.globalConfig.scriptsPath) {
    out.scriptsPath = state.globalConfig.scriptsPath;
  }

  if (state.globalConfig.secrets.providers.length > 0) {
    const secrets: SecretsConfig = {
      providers: state.globalConfig.secrets.providers.map(
        (p) => clean(p as unknown as Record<string, unknown>) as unknown as SecretsConfig["providers"][number],
      ),
    };
    out.secrets = secrets;
  }

  const sinks = serializeSinks(state.globalConfig.auditSinks);
  if (sinks) out.auditSinks = sinks as unknown as EnvironmentsConfigOutput["auditSinks"];

  return out;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function serialize(state: AppState): SerializerOutput {
  return {
    mcpConfig: buildMcpConfig(state),
    environmentsConfig: buildEnvironmentsConfig(state),
  };
}

/** Produce formatted JSON strings ready for download / clipboard. */
export function serializeToJson(state: AppState): {
  mcpConfigJson: string;
  environmentsConfigJson: string | null;
} {
  const output = serialize(state);
  return {
    mcpConfigJson: JSON.stringify(output.mcpConfig, null, 2),
    environmentsConfigJson: output.environmentsConfig
      ? JSON.stringify(output.environmentsConfig, null, 2)
      : null,
  };
}
