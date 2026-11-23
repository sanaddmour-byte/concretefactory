import { cn } from "@/lib/ui";

/**
 * Chapter wrapper: a section that registers itself in the ChapterRail (data-chapter) and sets the theme.
 * dark = dark grey stage, light = very light grey stage (true-colour materials).
 */
export function Chapter({ id, n, title, theme, children, className }: { id: string; n: number; title: string; theme: "dark" | "light"; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} data-chapter data-n={n} data-title={title} data-theme={theme} className={cn("relative scroll-mt-0", theme === "dark" ? "on-dark" : "bg-n-50 text-n-800", className)}>
      {children}
    </section>
  );
}
