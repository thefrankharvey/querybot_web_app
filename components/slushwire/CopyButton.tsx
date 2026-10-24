'use client';

import { useState } from 'react';

/** Copies `text` to the clipboard; the label flips to "Copied!" for two seconds. */
export default function CopyButton({ text, label, className }: { text: string; label: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        navigator.clipboard?.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }).catch(() => {});
      }}
    >
      {copied ? 'Copied!' : label}
    </button>
  );
}
