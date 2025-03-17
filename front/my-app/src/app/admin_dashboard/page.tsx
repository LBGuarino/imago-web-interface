import AdminDashboard from "@/components/AdminPanel";
import admin from "@/lib/firebaseAdmin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('__session')?.value;

    if (!sessionCookie) redirect('/login');
    const decodedToken = await admin.auth().verifySessionCookie(sessionCookie, true);
    if (!decodedToken.admin) redirect('/unauthorized');

    try {
      return <AdminDashboard />;
    } catch (error) {
      console.error('Error de verificación:', error);
      redirect('/login');
    }
}