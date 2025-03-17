// lib/auth.ts
import { getAuth } from 'firebase/auth';
import firebase from '@/lib/firebase';

export const refreshAuthToken = async () => {
  const auth = getAuth(firebase);
  
  // Esperar a que Firebase inicialice su estado
  await auth.authStateReady();
  
  const user = auth.currentUser;
  if (!user) {
    // Redirigir en lugar de lanzar error
    window.location.href = '/login';
    return;
  }

  try {
    const newIdToken = await user.getIdToken(true);
    
    // Actualizar la cookie de sesión en el backend
    await fetch('http://localhost:3001/api/refresh-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ idToken: newIdToken })
    });

    return newIdToken;
  } catch (error) {
    console.error('Error refreshing token:', error);
    window.location.href = '/login';
  }
};