import { ComponentChildren } from "preact";

interface SplitLayoutProps {
  children: ComponentChildren;
  preview: ComponentChildren;
}

export function SplitLayout({ children, preview }: SplitLayoutProps) {
  return (
    <div class="split-layout">
      <div class="form-panel">{children}</div>
      <div class="preview-panel">{preview}</div>
    </div>
  );
}
