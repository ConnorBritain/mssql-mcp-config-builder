import { useReducer } from "preact/hooks";
import type { AppState } from "./state/types";
import type { Action } from "./state/reducer";
import {
  appReducer,
  DEFAULT_APP_STATE,
  importConfig,
  mergeEnvironmentsIntoState,
  WIZARD_STEPS,
  TOTAL_STEPS,
} from "./state";
import { Header } from "./components/layout/Header";
import { Stepper } from "./components/layout/Stepper";
import { SplitLayout } from "./components/layout/SplitLayout";
import { OutputPanel } from "./components/layout/OutputPanel";
import { ImportDialog } from "./components/shared/ImportDialog";
import { ModeSelect } from "./components/steps/ModeSelect";
import { ConnectionStep } from "./components/steps/ConnectionStep";
import { GovernanceStep } from "./components/steps/GovernanceStep";
import { AuditStep } from "./components/steps/AuditStep";
import { SecretsStep } from "./components/steps/SecretsStep";
import { ReviewStep } from "./components/steps/ReviewStep";

export interface StepProps {
  state: AppState;
  dispatch: (action: Action) => void;
}

export function App() {
  const [state, dispatch] = useReducer(appReducer, DEFAULT_APP_STATE);

  function handleImport(mcpConfigText?: string, envConfigText?: string) {
    let imported: AppState | null = null;

    if (mcpConfigText) {
      const result = importConfig(mcpConfigText);
      if (result.success && result.state) {
        imported = result.state;
      }
    }

    if (envConfigText && imported) {
      const merged = mergeEnvironmentsIntoState(imported, envConfigText);
      if (merged.success && merged.state) {
        imported = merged.state;
      }
    } else if (envConfigText) {
      const result = importConfig(envConfigText);
      if (result.success && result.state) {
        imported = result.state;
      }
    }

    if (imported) {
      dispatch({ type: "IMPORT_STATE", state: imported });
    }
    dispatch({ type: "SET_IMPORT_DIALOG_OPEN", open: false });
  }

  function renderStep() {
    const props: StepProps = { state, dispatch };
    switch (state.currentStep) {
      case 0:
        return <ModeSelect {...props} />;
      case 1:
        return <ConnectionStep {...props} />;
      case 2:
        return <GovernanceStep {...props} />;
      case 3:
        return <AuditStep {...props} />;
      case 4:
        return <SecretsStep {...props} />;
      case 5:
        return <ReviewStep {...props} />;
      default:
        return null;
    }
  }

  const isFirstStep = state.currentStep === 0;
  const isLastStep = state.currentStep === TOTAL_STEPS - 1;

  return (
    <div>
      <Header
        simpleMode={state.simpleMode}
        onSimpleModeChange={(v) => dispatch({ type: "SET_SIMPLE_MODE", value: v })}
        onImportClick={() => dispatch({ type: "SET_IMPORT_DIALOG_OPEN", open: true })}
      />
      <SplitLayout preview={<OutputPanel state={state} />}>
        <Stepper
          steps={WIZARD_STEPS.map((s) => ({ key: s.key, label: s.label }))}
          currentStep={state.currentStep}
          onStepClick={(step) => dispatch({ type: "SET_STEP", step })}
        />
        {renderStep()}
        <div class="step-nav">
          <button
            type="button"
            class="btn btn-secondary"
            disabled={isFirstStep}
            onClick={() => dispatch({ type: "PREV_STEP" })}
          >
            Back
          </button>
          <button
            type="button"
            class="btn btn-primary"
            disabled={isLastStep}
            onClick={() => dispatch({ type: "NEXT_STEP" })}
          >
            Next
          </button>
        </div>
      </SplitLayout>
      <ImportDialog
        open={state.importDialogOpen}
        onClose={() => dispatch({ type: "SET_IMPORT_DIALOG_OPEN", open: false })}
        onImport={handleImport}
      />
      <footer class="app-footer">
        <div class="footer-links">
          <span>&copy; 2026 Connor England</span>
          <span class="footer-separator">|</span>
          <a href="https://github.com/ConnorBritain/mssql-mcp-server" target="_blank" rel="noopener noreferrer">
            mssql-mcp-server
          </a>
          <span class="footer-separator">|</span>
          <a href="https://github.com/ConnorBritain/mssql-mcp-config-builder" target="_blank" rel="noopener noreferrer">
            Config Builder Source
          </a>
        </div>
      </footer>
    </div>
  );
}
