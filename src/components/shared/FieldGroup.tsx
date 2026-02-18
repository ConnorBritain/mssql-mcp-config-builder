import { ComponentChildren } from "preact";
import { Tooltip } from "./Tooltip";

interface FieldGroupProps {
  label: string;
  helpText?: string;
  tooltip?: string;
  error?: string;
  required?: boolean;
  children: ComponentChildren;
}

export function FieldGroup({ label, helpText, tooltip, error, required, children }: FieldGroupProps) {
  return (
    <div class={`field-group${error ? " field-group--error" : ""}`}>
      <label>
        {label}
        {required && <span class="required-mark"> *</span>}
        {tooltip && <Tooltip text={tooltip} />}
      </label>
      {children}
      {helpText && !error && <small class="help-text">{helpText}</small>}
      {error && <small class="error-text">{error}</small>}
    </div>
  );
}
