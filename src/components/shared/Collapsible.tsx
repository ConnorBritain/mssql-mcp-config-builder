import { useState } from "preact/hooks";
import { ComponentChildren } from "preact";

interface CollapsibleProps {
  title: string;
  defaultOpen?: boolean;
  children: ComponentChildren;
}

export function Collapsible({ title, defaultOpen = false, children }: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div class="collapsible">
      <button
        type="button"
        class="collapsible-header"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <span class={`chevron${open ? " chevron--open" : ""}`}>&#9654;</span>
      </button>
      {open && <div class="collapsible-body">{children}</div>}
    </div>
  );
}
