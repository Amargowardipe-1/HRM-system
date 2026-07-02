import { SettingsDashboard } from "@/components/settings/SettingsDashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "System Settings | People Ops HRM",
  description: "Admin-only HRM settings, role access, permissions, and data modules.",
};

export default function SettingsPage() {
  return <SettingsDashboard />;
}
