// ---------------------------------------------------------------------------
// MSSQL MCP Config Builder – Validation
// ---------------------------------------------------------------------------

import type {
  AppState,
  EnvironmentFormState,
  FieldError,
  ValidationResult,
} from "./types";

// ---------------------------------------------------------------------------
// Per-environment validation
// ---------------------------------------------------------------------------

function validateEnvironment(
  env: EnvironmentFormState,
  index: number,
  state: AppState,
): FieldError[] {
  const errors: FieldError[] = [];
  const prefix = state.mode === "multi" ? `environments[${index}].` : "";

  // Name required in multi-env mode
  if (state.mode === "multi" && !env.name.trim()) {
    errors.push({
      field: `${prefix}name`,
      message: "Environment name is required",
      severity: "error",
    });
  }

  // Duplicate name check
  if (state.mode === "multi" && env.name.trim()) {
    const dupes = state.environments.filter(
      (e) => e.id !== env.id && e.name.trim().toLowerCase() === env.name.trim().toLowerCase(),
    );
    if (dupes.length > 0) {
      errors.push({
        field: `${prefix}name`,
        message: "Duplicate environment name",
        severity: "error",
      });
    }
  }

  // Server required
  if (!env.server.trim()) {
    errors.push({
      field: `${prefix}server`,
      message: "Server hostname is required",
      severity: "error",
    });
  }

  // Database required
  if (!env.database.trim()) {
    errors.push({
      field: `${prefix}database`,
      message: "Database name is required",
      severity: "error",
    });
  }

  // Port validation
  if (env.port.trim()) {
    const port = Number(env.port);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      errors.push({
        field: `${prefix}port`,
        message: "Port must be 1-65535",
        severity: "error",
      });
    }
  }

  // Auth-specific fields
  if (env.authMode === "sql") {
    if (!env.username.trim()) {
      errors.push({
        field: `${prefix}username`,
        message: "Username is required for SQL authentication",
        severity: "error",
      });
    }
    if (!env.password.trim()) {
      errors.push({
        field: `${prefix}password`,
        message: "Password is required for SQL authentication",
        severity: "error",
      });
    }
    // Warn if password looks like a plaintext secret (no ${secret:...} wrapper)
    if (env.password.trim() && !env.password.includes("${secret:")) {
      errors.push({
        field: `${prefix}password`,
        message:
          "Consider using a secret reference (e.g. ${secret:DB_PASSWORD}) instead of a plaintext password",
        severity: "warning",
      });
    }
  }

  if (env.authMode === "windows" && !env.domain.trim()) {
    errors.push({
      field: `${prefix}domain`,
      message: "Domain is recommended for Windows authentication",
      severity: "warning",
    });
  }

  // Numeric field validation
  if (env.connectionTimeout.trim()) {
    const val = Number(env.connectionTimeout);
    if (!Number.isInteger(val) || val < 0) {
      errors.push({
        field: `${prefix}connectionTimeout`,
        message: "Connection timeout must be a non-negative integer (ms)",
        severity: "error",
      });
    }
  }

  if (env.requestTimeout.trim()) {
    const val = Number(env.requestTimeout);
    if (!Number.isInteger(val) || val < 0) {
      errors.push({
        field: `${prefix}requestTimeout`,
        message: "Request timeout must be a non-negative integer (ms)",
        severity: "error",
      });
    }
  }

  if (env.maxRowsDefault.trim()) {
    const val = Number(env.maxRowsDefault);
    if (!Number.isInteger(val) || val < 1) {
      errors.push({
        field: `${prefix}maxRowsDefault`,
        message: "Max rows must be a positive integer",
        severity: "error",
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Global config validation
// ---------------------------------------------------------------------------

function validateGlobal(state: AppState): FieldError[] {
  const errors: FieldError[] = [];

  if (state.mode === "multi") {
    // Default environment should reference an existing name
    const def = state.globalConfig.defaultEnvironment.trim();
    if (def) {
      const exists = state.environments.some(
        (e) => e.name.trim().toLowerCase() === def.toLowerCase(),
      );
      if (!exists) {
        errors.push({
          field: "globalConfig.defaultEnvironment",
          message: `Default environment "${def}" does not match any defined environment`,
          severity: "warning",
        });
      }
    }
  }

  // Validate secret providers
  state.globalConfig.secrets.providers.forEach((p, i) => {
    const prefix = `globalConfig.secrets.providers[${i}].`;
    if (p.type === "dotenv" && !p.path?.trim()) {
      errors.push({
        field: `${prefix}path`,
        message: "Path is required for dotenv provider",
        severity: "warning",
      });
    }
    if (p.type === "azure-keyvault" && !p.vaultUrl?.trim()) {
      errors.push({
        field: `${prefix}vaultUrl`,
        message: "Vault URL is required for Azure Key Vault provider",
        severity: "error",
      });
    }
    if (p.type === "aws-secrets-manager" && !p.region?.trim()) {
      errors.push({
        field: `${prefix}region`,
        message: "Region is recommended for AWS Secrets Manager",
        severity: "warning",
      });
    }
    if (p.type === "hashicorp-vault" && !p.address?.trim()) {
      errors.push({
        field: `${prefix}address`,
        message: "Vault address is required for HashiCorp Vault provider",
        severity: "error",
      });
    }
  });

  return errors;
}

// ---------------------------------------------------------------------------
// Full validation
// ---------------------------------------------------------------------------

export function validate(state: AppState): ValidationResult {
  const errors: FieldError[] = [];

  state.environments.forEach((env, i) => {
    errors.push(...validateEnvironment(env, i, state));
  });

  errors.push(...validateGlobal(state));

  return {
    valid: errors.every((e) => e.severity !== "error"),
    errors,
  };
}

/** Validate only a specific step for enabling/disabling the Next button. */
export function validateStep(state: AppState, step: number): ValidationResult {
  const allResult = validate(state);

  // Map step indices to field prefixes
  const stepFieldPatterns: Record<number, (field: string) => boolean> = {
    0: () => false, // Mode selection has no validation
    1: (f) => f.includes("server") || f.includes("database") || f.includes("port") ||
              f.includes("username") || f.includes("password") || f.includes("domain") ||
              f.includes("name") || f.includes("authMode") || f.includes("connectionTimeout") ||
              f.includes("requestTimeout") || f.includes("trustServerCertificate"),
    2: (f) => f.includes("readonly") || f.includes("allowedTools") || f.includes("deniedTools") ||
              f.includes("maxRowsDefault") || f.includes("requireApproval") ||
              f.includes("accessLevel") || f.includes("allowedDatabases") ||
              f.includes("deniedDatabases") || f.includes("allowedSchemas") ||
              f.includes("deniedSchemas"),
    3: (f) => f.includes("audit"),
    4: (f) => f.includes("secret") || f.includes("scriptsPath"),
    5: () => false, // Review step shows all errors
  };

  const matcher = stepFieldPatterns[step];
  if (!matcher) return { valid: true, errors: [] };

  const stepErrors = allResult.errors.filter((e) => matcher(e.field));
  return {
    valid: stepErrors.every((e) => e.severity !== "error"),
    errors: stepErrors,
  };
}
