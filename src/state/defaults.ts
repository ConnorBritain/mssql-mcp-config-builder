// ---------------------------------------------------------------------------
// MSSQL MCP Config Builder – Defaults & Constants
// ---------------------------------------------------------------------------

import type {
  AppState,
  AuthMode,
  AuditLevel,
  AuditSinkType,
  AccessLevel,
  EnvironmentFormState,
  GlobalConfig,
  SecretProviderType,
  Tier,
} from "./types";

// ---------------------------------------------------------------------------
// Tool name constants
// ---------------------------------------------------------------------------

export const READER_TOOLS = [
  "read_data",
  "list_tables",
  "describe_table",
  "search_schema",
  "profile_table",
  "inspect_relationships",
  "inspect_dependencies",
  "explain_query",
  "list_databases",
  "list_environments",
  "validate_environment_config",
  "test_connection",
  "list_scripts",
  "run_script",
] as const;

export const WRITER_ONLY_TOOLS = [
  "insert_data",
  "update_data",
  "delete_data",
] as const;

export const ADMIN_ONLY_TOOLS = [
  "create_table",
  "create_index",
  "drop_table",
] as const;

export const WRITER_TOOLS = [...READER_TOOLS, ...WRITER_ONLY_TOOLS] as const;
export const ADMIN_TOOLS = [...WRITER_TOOLS, ...ADMIN_ONLY_TOOLS] as const;

export type ToolName = (typeof ADMIN_TOOLS)[number];

/** Tools available for a given tier. */
export function toolsForTier(tier: Tier): readonly string[] {
  switch (tier) {
    case "reader":
      return READER_TOOLS;
    case "writer":
      return WRITER_TOOLS;
    case "admin":
      return ADMIN_TOOLS;
  }
}

// ---------------------------------------------------------------------------
// Option enums (for dropdown rendering)
// ---------------------------------------------------------------------------

export const AUTH_MODE_OPTIONS: { value: AuthMode; label: string }[] = [
  { value: "sql", label: "SQL Server Authentication" },
  { value: "windows", label: "Windows / NTLM" },
  { value: "aad", label: "Azure AD / Entra ID" },
];

export const AUDIT_LEVEL_OPTIONS: { value: AuditLevel; label: string }[] = [
  { value: "none", label: "None" },
  { value: "basic", label: "Basic" },
  { value: "verbose", label: "Verbose" },
];

export const ACCESS_LEVEL_OPTIONS: { value: AccessLevel; label: string }[] = [
  { value: "server", label: "Server-wide" },
  { value: "database", label: "Single database" },
];

export const TIER_OPTIONS: { value: Tier; label: string; description: string }[] = [
  { value: "reader", label: "Reader", description: "14 read-only tools" },
  { value: "writer", label: "Writer", description: "Reader + INSERT/UPDATE/DELETE" },
  { value: "admin", label: "Admin", description: "Writer + DDL (CREATE/DROP)" },
];

export const AUDIT_SINK_TYPE_OPTIONS: { value: AuditSinkType; label: string }[] = [
  { value: "file", label: "File" },
  { value: "syslog", label: "Syslog" },
  { value: "http", label: "HTTP / Webhook" },
  { value: "azure-monitor", label: "Azure Monitor" },
  { value: "cloudwatch", label: "CloudWatch" },
];

export const SECRET_PROVIDER_TYPE_OPTIONS: { value: SecretProviderType; label: string }[] = [
  { value: "env", label: "Environment Variables" },
  { value: "dotenv", label: ".env File" },
  { value: "file", label: "File" },
  { value: "azure-keyvault", label: "Azure Key Vault" },
  { value: "aws-secrets-manager", label: "AWS Secrets Manager" },
  { value: "hashicorp-vault", label: "HashiCorp Vault" },
];

// ---------------------------------------------------------------------------
// Default values
// ---------------------------------------------------------------------------

let envCounter = 0;

export function createDefaultEnvironment(
  overrides: Partial<EnvironmentFormState> = {},
): EnvironmentFormState {
  return {
    id: `env-${++envCounter}-${Date.now()}`,
    name: "",
    description: "",
    server: "",
    database: "",
    port: "",
    authMode: "sql",
    username: "",
    password: "",
    domain: "",
    trustServerCertificate: false,
    connectionTimeout: "",
    requestTimeout: "",
    readonly: false,
    allowedTools: [],
    deniedTools: [],
    maxRowsDefault: "",
    requireApproval: [],
    auditLevel: "basic",
    auditSinks: [],
    accessLevel: "database",
    allowedDatabases: "",
    deniedDatabases: "",
    allowedSchemas: "",
    deniedSchemas: "",
    ...overrides,
  };
}

export const DEFAULT_GLOBAL_CONFIG: GlobalConfig = {
  defaultEnvironment: "",
  scriptsPath: "",
  secrets: { providers: [] },
  auditSinks: [],
};

export const DEFAULT_APP_STATE: AppState = {
  mode: "quick",
  currentStep: 0,
  simpleMode: true,
  tier: "reader",
  environments: [createDefaultEnvironment()],
  globalConfig: { ...DEFAULT_GLOBAL_CONFIG },
  importDialogOpen: false,
};

// ---------------------------------------------------------------------------
// MCP Client Config Paths
// ---------------------------------------------------------------------------

export type McpClientId = "cursor" | "windsurf" | "claude-desktop" | "vscode";

export interface McpClientConfig {
  id: McpClientId;
  label: string;
  icon: string;
  filename: string;
  paths: {
    mac?: string;
    windows?: string;
    linux?: string;
  };
}

export const MCP_CLIENT_CONFIGS: McpClientConfig[] = [
  {
    id: "cursor",
    label: "Cursor",
    icon: "\u{1F5A5}",
    filename: "mcp.json",
    paths: {
      mac: "~/.cursor/mcp.json",
      windows: "%APPDATA%\\Cursor\\User\\mcp.json",
      linux: "~/.config/cursor/mcp.json",
    },
  },
  {
    id: "windsurf",
    label: "Windsurf",
    icon: "\u{1F3C4}",
    filename: "mcp_config.json",
    paths: {
      mac: "~/.codeium/windsurf/mcp_config.json",
      windows: "%APPDATA%\\Codeium\\Windsurf\\mcp_config.json",
      linux: "~/.codeium/windsurf/mcp_config.json",
    },
  },
  {
    id: "claude-desktop",
    label: "Claude Desktop",
    icon: "\u{1F4AC}",
    filename: "claude_desktop_config.json",
    paths: {
      mac: "~/Library/Application Support/Claude/claude_desktop_config.json",
      windows: "%APPDATA%\\Claude\\claude_desktop_config.json",
      linux: "~/.config/claude/claude_desktop_config.json",
    },
  },
  {
    id: "vscode",
    label: "VS Code",
    icon: "\u{1F4DD}",
    filename: "mcp.json",
    paths: {
      mac: "~/.vscode/mcp.json",
      windows: "%APPDATA%\\Code\\User\\mcp.json",
      linux: "~/.config/Code/User/mcp.json",
    },
  },
];

// ---------------------------------------------------------------------------
// Wizard step metadata
// ---------------------------------------------------------------------------

export const WIZARD_STEPS = [
  { key: "mode", label: "Mode & Package" },
  { key: "connection", label: "Connection" },
  { key: "governance", label: "Governance" },
  { key: "audit", label: "Audit" },
  { key: "secrets", label: "Secrets" },
  { key: "review", label: "Review & Export" },
] as const;

export const SIMPLE_WIZARD_STEPS = [
  { key: "mode", label: "Mode & Package" },
  { key: "connection", label: "Connection" },
  { key: "review", label: "Review & Export" },
] as const;

export const TOTAL_STEPS = WIZARD_STEPS.length;

/** Returns the visible wizard steps based on simple/advanced mode. */
export function getVisibleSteps(simpleMode: boolean) {
  return simpleMode ? SIMPLE_WIZARD_STEPS : WIZARD_STEPS;
}
