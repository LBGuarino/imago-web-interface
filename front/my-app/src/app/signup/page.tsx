// app/register/page.tsx
'use client';

import { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import firebase from '@/lib/firebase';
import { set } from 'zod';

// Función auxiliar para forzar la actualización del token y esperar a que aparezcan los custom claims
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

// Función para validar la contraseña robusta
function validatePassword(password: string): boolean {
  // Al menos 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
}

export default function RegisterPage() {
  const [title, setTitle] = useState(''); // Nuevo estado para el título
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dni, setDni] = useState('');
  const [address, setAddress] = useState('');
  const [healthcenter, setHealthcenter] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const auth = getAuth(firebase);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validación de campos obligatorios
    if (!title.trim() || !firstName.trim() || !lastName.trim() || !dni.trim() || !address.trim() || !email.trim() || !password.trim()) {
      setError("Todos los campos son obligatorios");
      return;
    }
    // Validar que DNI contenga solo números
    if (!/^\d+$/.test(dni)) {
      setError("El DNI debe contener solo números");
      return;
    }
    // Validar la robustez de la contraseña
    if (!validatePassword(password)) {
      setError("La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial");
      return;
    }

    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      if (user) {
        // Forzar actualización del token para que se reflejen los custom claims
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

        // Esperamos a que se propaguen los custom claims
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
      const registerData = {
        uid: user.uid,
        title: title,
        firstName: firstName,
        lastName: lastName,
        dni: dni,
        address: address,
        healthcenter: healthcenter
      }
      const registerRes = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
        credentials: 'include',
      });
      if (!registerRes.ok) {
        const errData = await registerRes.json();
        setError(errData.error || 'Error al crear la sesión');
        return;
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-lg w-full bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-light text-center text-blue-700 mb-6">Registro</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Título
            </label>
            <select
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seleccione...</option>
              <option value="Dr.">Dr.</option>
              <option value="Dra.">Dra.</option>
              <option value="Lic.">Lic.</option>
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <input
                type="text"
                id="firstName"
                placeholder="Tu nombre"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Apellido
              </label>
              <input
                type="text"
                id="lastName"
                placeholder="Tu apellido"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="dni" className="block text-sm font-medium text-gray-700">
                DNI
              </label>
              <input
                type="text"
                id="dni"
                placeholder="Documento de identidad"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Domicilio
              </label>
              <input
                type="text"
                id="address"
                placeholder="Tu domicilio"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label htmlFor="healthCentre" className="block text-sm font-medium text-gray-700">
              Centro de Salud
            </label>
            <input
              type="text"
              id="healthCentre"
              placeholder="Centro de salud donde desarrolla su actividad"
              value={healthcenter}
              onChange={(e) => setHealthcenter(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
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
              placeholder="Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial"
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
            Registrarse
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <a href="/login" className="text-blue-600 hover:text-blue-800">
            Inicia sesión
          </a>
        </p>
      </div>
    </div>
  );
}
