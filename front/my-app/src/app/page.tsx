import HomePage from "@/components/Home";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("__session")?.value;

  const response = await fetch("http://localhost:3001/api/check-attributes", {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Cookie: `__session=${sessionCookie}`,
    },
  });

  if (sessionCookie && !response.ok) {
    redirect("/verification");
  }

  return <HomePage />;
}
