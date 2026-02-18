import { useState } from "preact/hooks";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagInput({ tags, onChange, placeholder }: TagInputProps) {
  const [input, setInput] = useState("");

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = input.trim();
      if (value && !tags.includes(value)) {
        onChange([...tags, value]);
      }
      setInput("");
    } else if (e.key === "Backspace" && input === "" && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  function removeTag(index: number) {
    onChange(tags.filter((_, i) => i !== index));
  }

  return (
    <div class="tag-input">
      {tags.map((tag, i) => (
        <span class="tag" key={tag}>
          {tag}
          <span class="tag-remove" onClick={() => removeTag(i)} role="button" aria-label={`Remove ${tag}`}>
            &times;
          </span>
        </span>
      ))}
      <input
        type="text"
        class="tag-input-field"
        value={input}
        onInput={(e) => setInput((e.target as HTMLInputElement).value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ""}
      />
    </div>
  );
}
