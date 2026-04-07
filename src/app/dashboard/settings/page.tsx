import { BatchHistory } from "@/components/upload/BatchHistory";
import { UploadZone } from "@/components/upload/UploadZone";
import { PageHeader } from "@/components/layout/PageHeader";

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Налаштування та імпорт"
        description="Завантажуйте нові XML-експорти HESK і керуйте пакетами, які формують аналітику в системі."
        info="Імпорт використовує natural key `trackingId`, тому повторні завантаження оновлюють існуючі тікети, а не створюють дублікати."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <UploadZone />
        <BatchHistory />
      </div>
    </>
  );
}
