import { BatchHistory } from "@/components/upload/BatchHistory";
import { UploadZone } from "@/components/upload/UploadZone";
import { PageHeader } from "@/components/layout/PageHeader";

export default function SettingsPage() {
  return (
    <>
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <UploadZone />
        <BatchHistory />
      </div>
    </>
  );
}
