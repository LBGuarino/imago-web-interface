// app/login/page.tsx
"use client";

import { useState } from "react";
import firebase from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { getAuth, signInWithEmailAndPassword, User } from "firebase/auth";
import Link from "next/link";
import { refreshAuth } from "@/lib/auth";
import LoadingSpinner from "@/components/LoadingSpinner";
import { SECURITY_CONFIG } from "@/config/security";
import axiosInstance from "@/lib/axios";

// Función que fuerza la actualización del token y espera a que aparezcan los custom claims
async function waitForClaims(user: User, maxAttempts = 5, delay = 1000): Promise<any> {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    try {
      // Forzar refresh del token
      await user.getIdToken(true);
      const tokenResult = await user.getIdTokenResult();
      
      // Verificar que los claims existan
      if (tokenResult.claims.approved !== undefined) {
        return tokenResult;
      }
      
      attempts++;
      await new Promise(resolve => setTimeout(resolve, delay));
    } catch (error) {
      console.error(`Intento ${attempts + 1} fallido:`, error);
      attempts++;
      if (attempts >= maxAttempts) {
        throw new Error("No se pudieron obtener los claims del usuario");
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error("Timeout esperando claims");
}

// Función para esperar a que el estado de la aplicación se actualice
async function waitForAppStateUpdate(user: User, maxAttempts = 5, delay = 1000): Promise<void> {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    try {
      // Verificar que el localStorage tenga los datos del usuario
      const userData = localStorage.getItem('userData');
      if (!userData) {
        throw new Error("Datos de usuario no encontrados en localStorage");
      }

      // Verificar que el token esté actualizado
      const tokenResult = await user.getIdTokenResult();
      if (!tokenResult) {
        throw new Error("Token no disponible");
      }

      // Si llegamos aquí, todo está actualizado
      return;
    } catch (error) {
      console.log(`Intento ${attempts + 1} de actualización de estado:`, error);
      attempts++;
      if (attempts >= maxAttempts) {
        throw new Error("Timeout esperando actualización del estado");
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Función para limpiar el estado de la aplicación
function clearAppState() {
  localStorage.clear();
  sessionStorage.clear();
  // Limpiar cookies
  document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
  });
}

export default function LoginComponent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Iniciando sesión...");
  const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
  const router = useRouter();
  const auth = getAuth(firebase);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    setError(null);
    setIsErrorModalVisible(false);
    setIsLoading(true);
    setLoadingMessage("Iniciando sesión...");

    try {
      // Mantener el rate limiting de intentos de login
      const loginAttempts = JSON.parse(localStorage.getItem('loginAttempts') || '{"count": 0, "timestamp": 0}');
      if (loginAttempts.count >= SECURITY_CONFIG.maxLoginAttempts) {
        const timeLeft = SECURITY_CONFIG.lockoutTime - (Date.now() - loginAttempts.timestamp);
        if (timeLeft > 0) {
          setError(`Demasiados intentos. Por favor, espere ${Math.ceil(timeLeft / 1000)} segundos.`);
          setIsErrorModalVisible(true);
          return;
        }
      }

      // Limpiar estado anterior
      clearAppState();

      // 1. Autenticar con Firebase
      setLoadingMessage("Autenticando con Firebase...");
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user) {
        throw new Error("Error de autenticación");
      }

      // 2. Obtener token fresco y esperar claims
      setLoadingMessage("Verificando permisos...");
      const tokenResult = await waitForClaims(user);
      
      // 3. Crear sesión en el backend
      setLoadingMessage("Creando sesión...");
      const sessionResponse = await axiosInstance.post("/api/login", {
        idToken: await user.getIdToken(true)
      });

      if (!sessionResponse.data) {
        throw new Error("Error al crear la sesión");
      }

      const sessionData = sessionResponse.data;

      // 4. Almacenar información del usuario en localStorage
      setLoadingMessage("Actualizando datos del usuario...");
      localStorage.setItem('userData', JSON.stringify(sessionData.user));

      // 5. Forzar un refresh del token para asegurar que la navbar se actualice
      setLoadingMessage("Actualizando interfaz...");
      await refreshAuth();

      // 6. Esperar a que el estado de la aplicación se actualice completamente
      setLoadingMessage("Finalizando configuración...");
      await waitForAppStateUpdate(user);

      // 7. Verificar que la navbar se haya actualizado
      setLoadingMessage("Verificando estado de la aplicación...");
      let navbarUpdated = false;
      let attempts = 0;
      const maxAttempts = 5;

      while (!navbarUpdated && attempts < maxAttempts) {
        try {
          // Verificar que el token tenga los claims actualizados
          const currentToken = await user.getIdTokenResult();
          if (currentToken.claims.approved !== undefined) {
            navbarUpdated = true;
          }
        } catch (error) {
          console.log(`Intento ${attempts + 1} de verificación de navbar:`, error);
        }
        attempts++;
        if (!navbarUpdated && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (!navbarUpdated) {
        throw new Error("No se pudo actualizar la interfaz correctamente");
      }

      // 8. Preparar la redirección
      setLoadingMessage("Redirigiendo...");
      
      // Determinar la ruta de redirección
      const redirectPath = tokenResult.claims.approved ? "/dashboard" : "/verification";
      
      // Esperar un momento para asegurar que todo esté listo
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Limpiar cualquier estado pendiente antes de la redirección
      localStorage.removeItem('isLoggingOut');
      sessionStorage.removeItem('isLoggingOut');
      
      // Forzar una recarga completa para asegurar que todo el estado se inicialice correctamente
      window.location.href = redirectPath;

    } catch (err: any) {
      console.error("Error en login:", err);
      
      // Manejar específicamente el error de token expirado
      if (err.code === 'auth/user-token-expired') {
        setError("Por favor, espera unos segundos antes de intentar iniciar sesión nuevamente. El sistema está limpiando la sesión anterior.");
      } else if (err.code === 'auth/invalid-credential') {
        setError("Correo electrónico o contraseña incorrectos");
      } else {
        setError(err.message || "Error en las credenciales");
      }
      setIsErrorModalVisible(true);

    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push("/forgot_password");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner fullScreen={true} message={loadingMessage} />
      </div>
    );
  }

  return (
    <>
      {isErrorModalVisible && error && (
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
                onClick={() => {
                  setError(null);
                  setIsErrorModalVisible(false);
                }}
                className="mt-2 bg-red-500 hover:bg-red-600 text-white text-sm py-2 px-3 rounded-full transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-light text-center text-blue-700 mb-6">
            Iniciar Sesión
          </h1>
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
