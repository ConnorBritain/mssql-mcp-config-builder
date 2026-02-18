import { useState } from "preact/hooks";
import { copyToClipboard } from "../../lib/clipboard";

interface CopyButtonProps {
  text: string;
  label?: string;
}

export function CopyButton({ text, label = "Copy" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button type="button" class="btn btn-secondary btn-icon" onClick={handleClick}>
      {copied ? "Copied!" : label}
    </button>
  );
}
