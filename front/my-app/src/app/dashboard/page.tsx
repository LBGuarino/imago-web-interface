import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import admin from "@/lib/firebaseAdmin";
import MyDashboard from "@/components/myDashboard";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('__session')?.value;

  // Primera verificación fuera del try
  if (!sessionCookie) redirect('/login');
  const decodedToken = await admin.auth().verifySessionCookie(sessionCookie, true);
  if (!decodedToken.approved) redirect('/unauthorized');

  try {
    return <MyDashboard user={{
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      displayName: decodedToken.name || '',
      photoURL: decodedToken.picture || ''
    }} />;

  } catch (error) {
    console.error('Error de verificación:', error);
    redirect('/login');
  }
}