import SignUpForm from "@/components/SignUpForm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function SignUpPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("__session")?.value;

  if (!sessionCookie) redirect("/login");
  const response = await fetch("http://localhost:3001/api/verify_admin", {
    headers: {
      "Content-Type": "application/json",
      Cookie: `__session=${sessionCookie}`,
    },
    method: "POST",
    credentials: "include",
  });
  const decodedToken = await response.json();
  if (!decodedToken.user || !decodedToken.user.admin) {
    redirect("/unauthorized");
  }
  try {
    return <SignUpForm />;
  } catch (error) {
    console.error("Error de verificación:", error);
    redirect("/login");
  }
}
