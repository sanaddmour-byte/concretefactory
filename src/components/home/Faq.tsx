import { getTranslations } from "next-intl/server";
import { FaqList, type FaqItem } from "@/components/ui/FaqList";

export async function Faq({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "home.faq" });
  return <FaqList id="faq-h" title={t("title")} items={t.raw("items") as FaqItem[]} />;
}
