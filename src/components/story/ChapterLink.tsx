import { Link } from "@/i18n/navigation";

/** The quiet text link that ends a chapter and leads to the matching page. */
export function ChapterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <p className="container-page py-10">
      <Link href={href} className="label-caps inline-flex min-h-11 items-center gap-2 underline underline-offset-8 decoration-yellow decoration-2 hover:text-maroon [.on-dark_&]:hover:text-yellow">
        {children} <span aria-hidden className="rtl:-scale-x-100">→</span>
      </Link>
    </p>
  );
}
