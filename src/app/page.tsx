import { redirect } from "next/navigation";
import { requireUser } from "@/lib/data";

export default async function Home() {
  const { profile } = await requireUser();
  redirect(profile?.role === "admin" ? "/admin" : "/dashboard");
}
