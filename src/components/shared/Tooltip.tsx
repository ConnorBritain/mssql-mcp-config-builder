import { ComponentChildren } from "preact";

interface TooltipProps {
  text: string;
  children?: ComponentChildren;
}

/**
 * Inline (?) icon with a hover tooltip. If children are provided,
 * wraps them instead of rendering the default "?" icon.
 */
export function Tooltip({ text, children }: TooltipProps) {
  return (
    <span class="tooltip-wrapper tooltip-wrapper--delayed">
      {children ?? <span class="tooltip-icon">?</span>}
      <span class="tooltip-bubble">{text}</span>
    </span>
  );
}
