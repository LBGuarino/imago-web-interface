import Account from "@/components/Account";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AccountPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("__session")?.value;

  if (!sessionCookie) redirect("/login");

  const response = await fetch("http://localhost:3001/api/account", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Cookie: `__session=${sessionCookie}`,
    },
  });

  const userData = await response.json();

  return <Account userData={userData} />;
}
