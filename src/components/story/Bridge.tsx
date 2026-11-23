import { cn } from "@/lib/ui";

/** The hand-off sentence at the end of a chapter: it leads into the next one. `to` softens a dark/light change with a gradient. */
export function Bridge({ children, to }: { children: React.ReactNode; to?: "light" | "dark" }) {
  return (
    <div className={cn("bridge", to && `bridge-to-${to}`)}>
      <p className="bridge-text container-page reveal">{children}</p>
    </div>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="story-eyebrow container-page" style={{ marginBlockEnd: 12 }}>
      <span aria-hidden />
      {children}
    </p>
  );
}
