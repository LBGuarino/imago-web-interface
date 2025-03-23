import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import MyDashboard from "@/components/myDashboard";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("__session")?.value;

  if (!sessionCookie) redirect("/login");
  const response = await fetch("http://localhost:3001/api/check-attributes", {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Cookie: `__session=${sessionCookie}`,
    },
  });
  if (!response.ok)
    // Aquí puedes loggear o redirigir según el error
    console.error(
      "Error en la petición:",
      response.status,
      await response.text()
    );
  const decodedToken = await response.json();
  if (!decodedToken.approved) redirect("/unauthorized");

  try {
    return <MyDashboard />;
  } catch (error) {
    console.error("Error de verificación:", error);
    redirect("/login");
  }
}
