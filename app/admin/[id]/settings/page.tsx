
import { getOfficeSettings, updateOfficeSettings } from "@/lib/actions";
import { SettingsPageClient } from "./settings-page-client";

export default async function AdminSettingsPage() {
  const settings = await getOfficeSettings();

  return (
    <SettingsPageClient 
        initialSettings={settings}
        updateSettingsAction={updateOfficeSettings}
    />
  );
}
