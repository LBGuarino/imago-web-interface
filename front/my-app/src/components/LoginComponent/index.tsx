// app/login/page.tsx
"use client";

import { useState } from "react";
import firebase from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { getAuth, signInWithEmailAndPassword, User } from "firebase/auth";
import Link from "next/link";
import { refreshAuth } from "@/lib/auth";

// Función que fuerza la actualización del token y espera a que aparezcan los custom claims
async function waitForClaims(user: User, maxAttempts = 5, delay = 1000) {
  let attempts = 0;
  while (attempts < maxAttempts) {
    await user.getIdToken(true);
    const tokenResult = await user.getIdTokenResult();
    if (tokenResult.claims.approved !== undefined) {
      return tokenResult;
    }
    attempts++;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  throw new Error("Los custom claims no están disponibles");
}

export default function LoginComponent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const auth = getAuth(firebase);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    try {
      // Autentica al usuario con Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      if (user) {
        await user.getIdToken(true);
        const idToken = await user.getIdToken();

        // Llama al endpoint de sesión pasando el token CSRF recibido
        const sessionResponse = await fetch(
          "http://localhost:3001/api/sessionLogin",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ idToken }),
          }
        );

        if (!sessionResponse.ok) {
          setError(sessionResponse.statusText || "Error al crear la sesión");
          return;
        }
        const tokenResult = await waitForClaims(user);
        const authData = await refreshAuth();
        if (!authData) return;
        if (tokenResult.claims.approved === true) {
          router.push("/dashboard");
        } else {
          router.push("/verification");
        }
      }
    } catch (err: any) {
      setError("Credenciales erróneas");
    }
  };

  const handleForgotPassword = () => {
    router.push("/forgot_password");
  };

  return (
    <>
      {error && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex justify-center items-center">
          <div className="bg-white shadow-2xl rounded-xl p-8 border border-gray-200">
            <div className="flex flex-col items-center justify-center space-y-4">
              <svg
                className="w-12 h-12 text-red-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3m0 4h.01M21 12c0 4.97-4.03 9-9 9-4.97 0-9-4.03-9-9 0-4.97 4.03-9 9-9 4.97 0 9 4.03 9 9z"
                />
              </svg>
              <p className="text-gray-700 font-semibold text-lg text-center">
                {error}
              </p>
              <button
                onClick={() => setError(null)}
                className="mt-2 bg-red-500 hover:bg-red-600 text-white text-sm py-2 px-3 rounded-full transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-light text-center text-blue-700 mb-6">
            Iniciar Sesión
          </h1>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                placeholder="tucorreo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              Iniciar Sesión
            </button>
            <Link href="/forgot_password">
              <p className="text-center text-sm text-gray-500 mt-5 hover:text-blue-600 transition-colors duration-200">
                Olvidé mi contraseña
              </p>
            </Link>
          </form>
        </div>
      </div>
    </>
  );
}
