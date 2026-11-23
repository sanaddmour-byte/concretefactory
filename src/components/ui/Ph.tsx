import { isDev, isPlaceholder, placeholderLabel } from "@/lib/placeholder";

/**
 * Renders `value` when it is real. When it is still a {{PLACEHOLDER}}/{{CONFIRM}}:
 * dev builds show an amber dashed badge, production builds render nothing.
 */
export function Ph({ value, children }: { value: string | null | undefined; children?: (v: string) => React.ReactNode }) {
  if (value == null || value === "") return null;
  if (isPlaceholder(value)) {
    return isDev ? <span className="ph-badge">{placeholderLabel(value)}</span> : null;
  }
  return <>{children ? children(value) : value}</>;
}

/** Visible-in-dev marker for a missing photo slot; renders nothing in production. */
export function PhotoNeeded({ what, className }: { what: string; className?: string }) {
  if (!isDev) return null;
  return (
    <div className={`tex-placeholder flex items-end p-3 ${className ?? ""}`} role="img" aria-label={`PHOTO NEEDED: ${what}`}>
      <span className="ph-badge">PHOTO NEEDED: {what}</span>
    </div>
  );
}
