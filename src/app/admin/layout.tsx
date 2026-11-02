import { Shell } from "@/components/Shell";
import { requireAdmin } from "@/lib/data";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireAdmin();
  return <Shell nav={[{ href: "/admin", label: "Clients" }, { href: "/admin/builds", label: "Websites" }, { href: "/admin/offers", label: "Offers" }]} user={profile.full_name || profile.email}>{children}</Shell>;
}
