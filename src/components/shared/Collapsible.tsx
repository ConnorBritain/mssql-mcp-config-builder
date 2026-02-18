import { useState } from "preact/hooks";
import { ComponentChildren } from "preact";
import { Tooltip } from "./Tooltip";

interface CollapsibleProps {
  title: string;
  tooltip?: string;
  defaultOpen?: boolean;
  children: ComponentChildren;
}

export function Collapsible({ title, tooltip, defaultOpen = false, children }: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div class="collapsible">
      <button
        type="button"
        class="collapsible-header"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span>
          {title}
          {tooltip && <Tooltip text={tooltip} />}
        </span>
        <span class={`chevron${open ? " chevron--open" : ""}`}>&#9654;</span>
      </button>
      {open && <div class="collapsible-body">{children}</div>}
    </div>
  );
}
