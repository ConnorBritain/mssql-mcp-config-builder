// ---------------------------------------------------------------------------
// MSSQL MCP Config Builder – Reducer
// ---------------------------------------------------------------------------

import type {
  AppState,
  AuditSinkConfig,
  EnvironmentFormState,
  GlobalConfig,
  SecretProviderConfig,
  Tier,
  WizardMode,
} from "./types";
import { createDefaultEnvironment } from "./defaults";

// ---------------------------------------------------------------------------
// Action types
// ---------------------------------------------------------------------------

export type Action =
  // Navigation
  | { type: "SET_MODE"; mode: WizardMode }
  | { type: "SET_STEP"; step: number }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "SET_SIMPLE_MODE"; value: boolean }
  | { type: "SET_TIER"; tier: Tier }

  // Environment CRUD
  | { type: "ADD_ENVIRONMENT"; overrides?: Partial<EnvironmentFormState> }
  | { type: "REMOVE_ENVIRONMENT"; id: string }
  | { type: "DUPLICATE_ENVIRONMENT"; id: string }
  | { type: "UPDATE_ENVIRONMENT"; id: string; field: string; value: unknown }
  | { type: "SET_ENVIRONMENT"; id: string; env: EnvironmentFormState }

  // Environment audit sinks
  | { type: "ADD_ENV_AUDIT_SINK"; envId: string; sink: AuditSinkConfig }
  | { type: "REMOVE_ENV_AUDIT_SINK"; envId: string; index: number }
  | { type: "UPDATE_ENV_AUDIT_SINK"; envId: string; index: number; sink: AuditSinkConfig }

  // Global config
  | { type: "UPDATE_GLOBAL"; field: keyof GlobalConfig; value: unknown }

  // Global audit sinks
  | { type: "ADD_GLOBAL_AUDIT_SINK"; sink: AuditSinkConfig }
  | { type: "REMOVE_GLOBAL_AUDIT_SINK"; index: number }
  | { type: "UPDATE_GLOBAL_AUDIT_SINK"; index: number; sink: AuditSinkConfig }

  // Secret providers
  | { type: "ADD_SECRET_PROVIDER"; provider: SecretProviderConfig }
  | { type: "REMOVE_SECRET_PROVIDER"; index: number }
  | { type: "UPDATE_SECRET_PROVIDER"; index: number; provider: SecretProviderConfig }

  // Import
  | { type: "SET_IMPORT_DIALOG_OPEN"; open: boolean }
  | { type: "IMPORT_STATE"; state: AppState }

  // Reset
  | { type: "RESET"; state: AppState };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function updateEnv(
  envs: EnvironmentFormState[],
  id: string,
  updater: (env: EnvironmentFormState) => EnvironmentFormState,
): EnvironmentFormState[] {
  return envs.map((e) => (e.id === id ? updater(e) : e));
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

export function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    // -- Navigation --------------------------------------------------------
    case "SET_MODE":
      return { ...state, mode: action.mode };

    case "SET_STEP":
      return { ...state, currentStep: clamp(action.step, 0, 5) };

    case "NEXT_STEP":
      return { ...state, currentStep: clamp(state.currentStep + 1, 0, 5) };

    case "PREV_STEP":
      return { ...state, currentStep: clamp(state.currentStep - 1, 0, 5) };

    case "SET_SIMPLE_MODE":
      return { ...state, simpleMode: action.value };

    case "SET_TIER":
      return { ...state, tier: action.tier };

    // -- Environment CRUD --------------------------------------------------
    case "ADD_ENVIRONMENT":
      return {
        ...state,
        environments: [
          ...state.environments,
          createDefaultEnvironment(action.overrides),
        ],
      };

    case "REMOVE_ENVIRONMENT":
      // Prevent removing the last environment
      if (state.environments.length <= 1) return state;
      return {
        ...state,
        environments: state.environments.filter((e) => e.id !== action.id),
      };

    case "DUPLICATE_ENVIRONMENT": {
      const source = state.environments.find((e) => e.id === action.id);
      if (!source) return state;
      const dupe = createDefaultEnvironment({
        ...source,
        name: source.name ? `${source.name} (copy)` : "",
      });
      return { ...state, environments: [...state.environments, dupe] };
    }

    case "UPDATE_ENVIRONMENT":
      return {
        ...state,
        environments: updateEnv(state.environments, action.id, (env) => ({
          ...env,
          [action.field]: action.value,
        })),
      };

    case "SET_ENVIRONMENT":
      return {
        ...state,
        environments: updateEnv(state.environments, action.id, () => action.env),
      };

    // -- Environment audit sinks -------------------------------------------
    case "ADD_ENV_AUDIT_SINK":
      return {
        ...state,
        environments: updateEnv(state.environments, action.envId, (env) => ({
          ...env,
          auditSinks: [...env.auditSinks, action.sink],
        })),
      };

    case "REMOVE_ENV_AUDIT_SINK":
      return {
        ...state,
        environments: updateEnv(state.environments, action.envId, (env) => ({
          ...env,
          auditSinks: env.auditSinks.filter((_, i) => i !== action.index),
        })),
      };

    case "UPDATE_ENV_AUDIT_SINK":
      return {
        ...state,
        environments: updateEnv(state.environments, action.envId, (env) => ({
          ...env,
          auditSinks: env.auditSinks.map((s, i) =>
            i === action.index ? action.sink : s,
          ),
        })),
      };

    // -- Global config -----------------------------------------------------
    case "UPDATE_GLOBAL":
      return {
        ...state,
        globalConfig: { ...state.globalConfig, [action.field]: action.value },
      };

    // -- Global audit sinks ------------------------------------------------
    case "ADD_GLOBAL_AUDIT_SINK":
      return {
        ...state,
        globalConfig: {
          ...state.globalConfig,
          auditSinks: [...state.globalConfig.auditSinks, action.sink],
        },
      };

    case "REMOVE_GLOBAL_AUDIT_SINK":
      return {
        ...state,
        globalConfig: {
          ...state.globalConfig,
          auditSinks: state.globalConfig.auditSinks.filter(
            (_, i) => i !== action.index,
          ),
        },
      };

    case "UPDATE_GLOBAL_AUDIT_SINK":
      return {
        ...state,
        globalConfig: {
          ...state.globalConfig,
          auditSinks: state.globalConfig.auditSinks.map((s, i) =>
            i === action.index ? action.sink : s,
          ),
        },
      };

    // -- Secret providers --------------------------------------------------
    case "ADD_SECRET_PROVIDER":
      return {
        ...state,
        globalConfig: {
          ...state.globalConfig,
          secrets: {
            providers: [
              ...state.globalConfig.secrets.providers,
              action.provider,
            ],
          },
        },
      };

    case "REMOVE_SECRET_PROVIDER":
      return {
        ...state,
        globalConfig: {
          ...state.globalConfig,
          secrets: {
            providers: state.globalConfig.secrets.providers.filter(
              (_, i) => i !== action.index,
            ),
          },
        },
      };

    case "UPDATE_SECRET_PROVIDER":
      return {
        ...state,
        globalConfig: {
          ...state.globalConfig,
          secrets: {
            providers: state.globalConfig.secrets.providers.map((p, i) =>
              i === action.index ? action.provider : p,
            ),
          },
        },
      };

    // -- Import / Reset ----------------------------------------------------
    case "SET_IMPORT_DIALOG_OPEN":
      return { ...state, importDialogOpen: action.open };

    case "IMPORT_STATE":
      return { ...action.state, importDialogOpen: false };

    case "RESET":
      return action.state;
  }
}
