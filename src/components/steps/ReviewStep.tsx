import { useState } from "preact/hooks";
import { validate } from "../../state/validation";
import { serialize, serializeToJson } from "../../state/serializer";
import { DEFAULT_APP_STATE } from "../../state/defaults";
import { highlightJson } from "../../lib/jsonHighlight";
import { downloadJson } from "../../lib/download";
import { CopyButton } from "../shared/CopyButton";
import { ExportLocationPicker } from "./ExportLocationPicker";
import type { StepProps } from "../../app";

export function ReviewStep({ state, dispatch }: StepProps) {
  const [downloadFilename, setDownloadFilename] = useState("mcp_config.json");

  const result = validate(state);
  const { mcpConfig } = serialize(state);
  const { mcpConfigJson, environmentsConfigJson } = serializeToJson(state);

  const errors = result.errors.filter((e) => e.severity === "error");
  const warnings = result.errors.filter((e) => e.severity === "warning");

  return (
    <div class="step step-review">
      <h2>Review and Export</h2>
      <p>Review your configuration and export it to your MCP client.</p>

      {(errors.length > 0 || warnings.length > 0) && (
        <div class="validation-summary">
          {errors.length > 0 && (
            <div class="validation-errors">
              <strong>Errors ({errors.length})</strong>
              <ul>
                {errors.map((e, i) => (
                  <li key={i} class="validation-error">[!] {e.field}: {e.message}</li>
                ))}
              </ul>
            </div>
          )}
          {warnings.length > 0 && (
            <div class="validation-warnings">
              <strong>Warnings ({warnings.length})</strong>
              <ul>
                {warnings.map((e, i) => (
                  <li key={i} class="validation-warning">[?] {e.field}: {e.message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <ExportLocationPicker
        mcpConfig={mcpConfig}
        onFilenameChange={setDownloadFilename}
      />

      <div class="review-panels">
        <div class="review-panel">
          <div class="review-panel-header">
            <h3>{downloadFilename}</h3>
            <div class="review-panel-actions">
              <CopyButton text={mcpConfigJson} label="Copy" />
              <button
                type="button"
                class="btn btn-secondary btn-icon"
                onClick={() => downloadJson(mcpConfigJson, downloadFilename)}
              >
                Download
              </button>
            </div>
          </div>
          <pre
            class="json-preview"
            dangerouslySetInnerHTML={{ __html: highlightJson(mcpConfigJson) }}
          />
        </div>

        {environmentsConfigJson && (
          <div class="review-panel">
            <div class="review-panel-header">
              <h3>environments.json</h3>
              <div class="review-panel-actions">
                <CopyButton text={environmentsConfigJson} label="Copy" />
                <button
                  type="button"
                  class="btn btn-secondary btn-icon"
                  onClick={() => downloadJson(environmentsConfigJson, "environments.json")}
                >
                  Download
                </button>
              </div>
            </div>
            <pre
              class="json-preview"
              dangerouslySetInnerHTML={{ __html: highlightJson(environmentsConfigJson) }}
            />
          </div>
        )}
      </div>

      <button
        type="button"
        class="btn btn-secondary"
        onClick={() => dispatch({ type: "RESET", state: DEFAULT_APP_STATE })}
      >
        Start Over
      </button>
    </div>
  );
}
