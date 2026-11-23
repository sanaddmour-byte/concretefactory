import { notFound } from "next/navigation";

// Routes for later phases do not exist yet; unknown paths render the locale 404.
export default function CatchAll() {
  notFound();
}
