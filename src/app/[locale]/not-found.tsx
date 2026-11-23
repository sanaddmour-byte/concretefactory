import { Link } from "@/i18n/navigation";
import { buttonClass } from "@/lib/ui";

export default function NotFound() {
  return (
    <section className="container-page py-24">
      <h1 className="display text-4xl">404</h1>
      <p className="mt-4 text-n-700">This page isn’t here yet. · هذه الصفحة غير متاحة بعد.</p>
      <Link href="/" className={buttonClass("primary", "mt-8")}>Home · الرئيسية</Link>
    </section>
  );
}
