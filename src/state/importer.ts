// ---------------------------------------------------------------------------
// MSSQL MCP Config Builder – Importer (JSON -> State)
// ---------------------------------------------------------------------------

import type {
  AppState,
  AuditSinkConfig,
  AuthMode,
  AuditLevel,
  AccessLevel,
  EnvironmentFormState,
  SecretProviderConfig,
  Tier,
} from "./types";
import { createDefaultEnvironment, DEFAULT_APP_STATE } from "./defaults";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function str(val: unknown): string {
  if (val === undefined || val === null) return "";
  return String(val);
}

function arrToStr(val: unknown): string {
  if (Array.isArray(val)) return val.join(", ");
  if (typeof val === "string") return val;
  return "";
}

function strArr(val: unknown): string[] {
  if (Array.isArray(val)) return val.map(String);
  return [];
}

function isAuthMode(val: unknown): val is AuthMode {
  return val === "sql" || val === "windows" || val === "aad";
}

function isAuditLevel(val: unknown): val is AuditLevel {
  return val === "none" || val === "basic" || val === "verbose";
}

function isAccessLevel(val: unknown): val is AccessLevel {
  return val === "server" || val === "database";
}

function isTier(val: unknown): val is Tier {
  return val === "reader" || val === "writer" || val === "admin";
}

// ---------------------------------------------------------------------------
// Parse an environment object from environments.json
// ---------------------------------------------------------------------------

function parseEnvironment(raw: Record<string, unknown>): EnvironmentFormState {
  return createDefaultEnvironment({
    name: str(raw.name),
    description: str(raw.description),
    server: str(raw.server),
    database: str(raw.database),
    port: raw.port !== undefined ? String(raw.port) : "",
    authMode: isAuthMode(raw.authMode) ? raw.authMode : "sql",
    username: str(raw.username),
    password: str(raw.password),
    domain: str(raw.domain),
    trustServerCertificate: raw.trustServerCertificate === true,
    connectionTimeout: raw.connectionTimeout !== undefined ? String(raw.connectionTimeout) : "",
    requestTimeout: raw.requestTimeout !== undefined ? String(raw.requestTimeout) : "",
    readonly: raw.readonly === true,
    allowedTools: strArr(raw.allowedTools),
    deniedTools: strArr(raw.deniedTools),
    maxRowsDefault: raw.maxRowsDefault !== undefined ? String(raw.maxRowsDefault) : "",
    requireApproval: strArr(raw.requireApproval),
    auditLevel: isAuditLevel(raw.auditLevel) ? raw.auditLevel : "basic",
    auditSinks: Array.isArray(raw.auditSinks) ? (raw.auditSinks as AuditSinkConfig[]) : [],
    accessLevel: isAccessLevel(raw.accessLevel) ? raw.accessLevel : "database",
    allowedDatabases: arrToStr(raw.allowedDatabases),
    deniedDatabases: arrToStr(raw.deniedDatabases),
    allowedSchemas: arrToStr(raw.allowedSchemas),
    deniedSchemas: arrToStr(raw.deniedSchemas),
  });
}

// ---------------------------------------------------------------------------
// Detect file type and import
// ---------------------------------------------------------------------------

export type ImportFileType = "mcp_config" | "environments" | "unknown";

export function detectFileType(json: unknown): ImportFileType {
  if (typeof json !== "object" || json === null) return "unknown";
  const obj = json as Record<string, unknown>;

  if ("mcpServers" in obj) return "mcp_config";
  if ("environments" in obj && Array.isArray(obj.environments)) return "environments";
  return "unknown";
}

/** Detect the tier from the package name in args. */
function detectTier(args: unknown[]): Tier {
  for (const arg of args) {
    const s = String(arg);
    if (s.includes("mssql-mcp-reader")) return "reader";
    if (s.includes("mssql-mcp-writer")) return "writer";
    if (s.includes("mssql-mcp-server")) return "admin";
  }
  return "reader";
}

// ---------------------------------------------------------------------------
// Import mcp_config.json (quick mode)
// ---------------------------------------------------------------------------

function importMcpConfig(json: Record<string, unknown>): AppState {
  const servers = json.mcpServers as Record<string, unknown> | undefined;
  const mssql = (servers?.mssql ?? {}) as Record<string, unknown>;
  const args = Array.isArray(mssql.args) ? mssql.args : [];
  const envVars = (mssql.env ?? {}) as Record<string, string>;

  const tier = detectTier(args);

  // If ENVIRONMENTS_CONFIG_PATH is set, this is multi-env mode but we only
  // have the mcp_config side. Import what we can.
  const isMulti = !!envVars.ENVIRONMENTS_CONFIG_PATH;

  const env = createDefaultEnvironment({
    server: envVars.SERVER_NAME ?? "",
    database: envVars.DATABASE_NAME ?? "",
    port: envVars.SERVER_PORT ?? "",
    authMode: isAuthMode(envVars.SQL_AUTH_MODE) ? envVars.SQL_AUTH_MODE : "sql",
    username: envVars.SQL_USERNAME ?? "",
    password: envVars.SQL_PASSWORD ?? "",
    domain: envVars.SQL_DOMAIN ?? "",
    trustServerCertificate: envVars.TRUST_SERVER_CERTIFICATE === "true",
    connectionTimeout: envVars.CONNECTION_TIMEOUT ?? "",
    requestTimeout: envVars.REQUEST_TIMEOUT ?? "",
    readonly: envVars.READONLY === "true",
    maxRowsDefault: envVars.MAX_ROWS_DEFAULT ?? "",
    auditLevel: isAuditLevel(envVars.AUDIT_LEVEL)
      ? envVars.AUDIT_LEVEL
      : envVars.AUDIT_LOGGING === "false"
        ? "none"
        : "basic",
  });

  return {
    ...DEFAULT_APP_STATE,
    mode: isMulti ? "multi" : "quick",
    tier,
    environments: [env],
  };
}

// ---------------------------------------------------------------------------
// Import environments.json (multi-env mode)
// ---------------------------------------------------------------------------

function importEnvironmentsConfig(json: Record<string, unknown>): AppState {
  const rawEnvs = json.environments as Record<string, unknown>[];
  const environments = rawEnvs.map(parseEnvironment);

  // Detect tier from environment-level hints if present
  let tier: Tier = "reader";
  for (const raw of rawEnvs) {
    if (isTier(raw.tier)) {
      tier = raw.tier;
      break;
    }
  }

  const secrets = json.secrets as { providers?: SecretProviderConfig[] } | undefined;

  return {
    ...DEFAULT_APP_STATE,
    mode: "multi",
    tier,
    environments: environments.length > 0 ? environments : [createDefaultEnvironment()],
    globalConfig: {
      defaultEnvironment: str(json.defaultEnvironment),
      scriptsPath: str(json.scriptsPath),
      secrets: {
        providers: Array.isArray(secrets?.providers) ? secrets.providers : [],
      },
      auditSinks: Array.isArray(json.auditSinks) ? (json.auditSinks as AuditSinkConfig[]) : [],
    },
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface ImportResult {
  success: boolean;
  state: AppState | null;
  fileType: ImportFileType;
  error?: string;
}

export function importConfig(text: string): ImportResult {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { success: false, state: null, fileType: "unknown", error: "Invalid JSON" };
  }

  const fileType = detectFileType(json);

  switch (fileType) {
    case "mcp_config":
      return {
        success: true,
        state: importMcpConfig(json as Record<string, unknown>),
        fileType,
      };

    case "environments":
      return {
        success: true,
        state: importEnvironmentsConfig(json as Record<string, unknown>),
        fileType,
      };

    case "unknown":
      return {
        success: false,
        state: null,
        fileType,
        error:
          "Unrecognized JSON format. Expected mcp_config.json (with mcpServers) or environments.json (with environments array).",
      };
  }
}

/**
 * Merge an imported environments.json into a state that was imported from
 * mcp_config.json. Useful when the user uploads both files.
 */
export function mergeEnvironmentsIntoState(
  base: AppState,
  environmentsJson: string,
): ImportResult {
  const result = importConfig(environmentsJson);
  if (!result.success || !result.state) return result;
  if (result.fileType !== "environments") {
    return { ...result, success: false, error: "Expected environments.json format" };
  }

  return {
    success: true,
    fileType: "environments",
    state: {
      ...base,
      mode: "multi",
      environments: result.state.environments,
      globalConfig: result.state.globalConfig,
    },
  };
}
