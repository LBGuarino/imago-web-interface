"use client";
import "../../app/globals.css";
import Image from "next/image";
import AnimatedPage from "@/components/AnimatedPage";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

interface UserData {
  firstName: string;
  lastName: string;
  dni: string;
  address: string;
}

interface UserWelcomeProps {
  backendUserData: UserData;
}

export default function HomePage() {
  const { loggedUser, backendUserData, loading } = useAuth();

  if (loading) return <div className="text-center mt-10">Cargando...</div>;

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="relative w-full h-80">
          <Image src="/imago.jpg" alt="Logo" fill className="object-cover" />
          <div className="absolute inset-0 bg-black opacity-20"></div>
        </div>

        <div className="p-8">
          {loggedUser ? (
            <UserWelcome backendUserData={backendUserData} />
          ) : (
            <PublicWelcome />
          )}
        </div>
      </div>
    </AnimatedPage>
  );
}

const UserWelcome = ({ backendUserData }: UserWelcomeProps) => (
  <div>
    <p className="text-2xl text-gray-800 text-center">
      ¡Bienvenido Dr/a.{" "}
      {backendUserData.firstName + " " + backendUserData.lastName}!
    </p>
  </div>
);

const PublicWelcome = () => (
  <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-gray-200">
    <h1 className="text-3xl font-light text-blue-600 mb-4 text-center">
      Bienvenidos a la plataforma de acceso de Imago ICE Reveal Argentina
    </h1>
    <h2 className="text-xl font-normal mb-2 text-center">¡Importante!</h2>
    <p className="text-gray-700 mb-2 text-center">
      Para acceder necesitas una cuenta de Imago Argentina autorizada.
    </p>
    <p className="text-gray-700 text-center">
      Si no tienes una cuenta y estás interesado/a en Imago ICE Reveal,{" "}
      <Link
        href="/access_request"
        className="text-blue-600 hover:text-blue-800 transition-colors"
      >
        haz click aquí.
      </Link>
    </p>
  </div>
);
