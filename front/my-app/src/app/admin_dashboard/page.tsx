import AdminDashboard from "@/components/AdminPanel";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("__session")?.value;

  if (!sessionCookie) redirect("/login");

  const response = await fetch("http://localhost:3001/api/verify-admin", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Cookie: `__session=${sessionCookie}`,
    },
  });

  if (!response.ok) {
    redirect("/unauthorized");
  }

  const decodedToken = await response.json();
  if (!decodedToken || !decodedToken.admin) {
    redirect("/unauthorized");
  }

  try {
    return <AdminDashboard />;
  } catch (error) {
    console.error("Error de verificación:", error);
    redirect("/login");
  }
}
