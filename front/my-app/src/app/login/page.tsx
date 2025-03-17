// app/login/page.tsx
'use client';

import { useState } from 'react';
import firebase from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { getAuth, signInWithEmailAndPassword, User } from 'firebase/auth';

// Función que fuerza la actualización del token y espera a que aparezcan los custom claims
async function waitForClaims(user: User, maxAttempts = 5, delay = 1000) {
  let attempts = 0;
  while (attempts < maxAttempts) {
    await user.getIdToken(true);
    const tokenResult = await user.getIdTokenResult();
    console.log(tokenResult);
    if (tokenResult.claims.approved !== undefined) {
      return tokenResult;
    }
    attempts++;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  throw new Error('Los custom claims no están disponibles');
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const auth = getAuth(firebase);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      if (user) {
        // Forzamos la actualización del token para que se incluyan los custom claims
        await user.getIdToken(true);
        const idToken = await user.getIdToken();
        
        // Enviar el idToken actualizado al backend para crear la cookie de sesión
        const res = await fetch('http://localhost:3001/api/sessionLogin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
          credentials: 'include',
        });
        
        if (!res.ok) {
          const errData = await res.json();
          setError(errData.error || 'Error al crear la sesión');
          return;
        }
        
        // Esperamos a que se reflejen los custom claims en el token
        const tokenResult = await waitForClaims(user);
        const newIdToken = await user.getIdToken(true);
        const refreshRes = await fetch('http://localhost:3001/api/refresh-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ idToken: newIdToken }),
        });

        if (!refreshRes.ok) {
          throw new Error('Error refrescando la sesión');
        }

        if (tokenResult.claims.approved === true) {
          router.push('/dashboard');
        } else {
          router.push('/verification');
        }
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-light text-center text-blue-700 mb-6">Iniciar Sesión</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
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
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
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
        </form>
        </div>
    </div>
  );
}
