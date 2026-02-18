import { ComponentChildren } from "preact";

interface FieldGroupProps {
  label: string;
  helpText?: string;
  error?: string;
  required?: boolean;
  children: ComponentChildren;
}

export function FieldGroup({ label, helpText, error, required, children }: FieldGroupProps) {
  return (
    <div class={`field-group${error ? " field-group--error" : ""}`}>
      <label>
        {label}
        {required && <span class="required-mark"> *</span>}
      </label>
      {children}
      {helpText && !error && <small class="help-text">{helpText}</small>}
      {error && <small class="error-text">{error}</small>}
    </div>
  );
}
