import { Shell } from "@/components/Shell";
import { getClientProject } from "@/lib/data";

// Nav adapts to the modules switched on for this client's project.
export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const { profile, project } = await getClientProject();
  const m = project?.modules;
  const nav = [
    { href: "/dashboard", label: "Progress" },
    ...(m?.consultation ? [{ href: "/brief", label: "Consultation" }] : []),
    ...(m?.uploads ? [{ href: "/files", label: "Files" }] : []),
    ...(m?.agreement ? [{ href: "/agreement", label: "Agreement" }] : []),
    ...(m?.payments ? [{ href: "/payments", label: "Payments" }] : []),
  ];
  return <Shell nav={nav} user={profile?.full_name || profile?.email || ""}>{children}</Shell>;
}
