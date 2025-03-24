"use client";

import { useSearchParams } from "next/navigation";

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message") || "Tu cuenta está en proceso de verificación. La confirmación de la misma puede tardar hasta 48 horas.";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-[#4578b1]">Cuenta en proceso de verificación</h1>
      <p className="text-lg text-gray-700 mt-2">{message}</p>
    </div>
  );
}
