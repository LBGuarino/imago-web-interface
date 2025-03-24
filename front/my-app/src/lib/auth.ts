// lib/auth.ts
import { getAuth } from "firebase/auth";
import firebase from "@/lib/firebase";

class TokenRefreshManager {
  private static instance: TokenRefreshManager;
  private lastRefresh: number = 0;
  private refreshPromise: Promise<{ newIdToken: string } | null> | null = null;
  private minRefreshInterval = 10000; 
  private refreshQueue: Array<() => void> = [];
  private isProcessingQueue = false;
  
  private constructor() {}

  static getInstance(): TokenRefreshManager {
    if (!TokenRefreshManager.instance) {
      TokenRefreshManager.instance = new TokenRefreshManager();
    }
    return TokenRefreshManager.instance;
  }

  async refreshToken(): Promise<{ newIdToken: string } | null> {
    // Si ya hay un refresh en progreso, encolar la solicitud
    if (this.refreshPromise) {
      return new Promise((resolve) => {
        this.refreshQueue.push(() => {
          this.processRefresh().then(resolve);
        });
        this.processQueue();
      });
    }

    return this.processRefresh();
  }

  private async processRefresh(): Promise<{ newIdToken: string } | null> {
    const now = Date.now();
    if (now - this.lastRefresh < this.minRefreshInterval) {
      console.log("Demasiadas solicitudes de refresh, esperando...");
      return null;
    }

    try {
      this.refreshPromise = this.doRefresh();
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
      this.processQueue();
    }
  }

  private async processQueue() {
    if (this.isProcessingQueue || this.refreshQueue.length === 0) return;
    
    this.isProcessingQueue = true;
    while (this.refreshQueue.length > 0) {
      const nextRefresh = this.refreshQueue.shift();
      if (nextRefresh) {
        nextRefresh();
      }
    }
    this.isProcessingQueue = false;
  }

  private async doRefresh(): Promise<{ newIdToken: string } | null> {
    try {
      const auth = getAuth(firebase);
      await auth.authStateReady();
      const user = auth.currentUser;
      
      if (!user) {
        localStorage.removeItem('userData');
        window.location.href = "/login";
        return null;
      }

      const newIdToken = await user.getIdToken(true);
      
      const refreshRes = await fetch("http://localhost:3001/api/refresh-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ idToken: newIdToken }),
      });

      if (!refreshRes.ok) {
        if (refreshRes.status === 429) {
          console.warn("Rate limit alcanzado, esperando...");
          return null;
        }
        
        if (refreshRes.status === 401) {
          localStorage.removeItem('userData');
          window.location.href = "/login";
          return null;
        }
        
        throw new Error(`Error al refrescar la sesión: ${refreshRes.statusText}`);
      }

      const responseData = await refreshRes.json();
      if (responseData.user) {
        localStorage.setItem('userData', JSON.stringify(responseData.user));
      }

      this.lastRefresh = Date.now();
      return { newIdToken };
    } catch (error) {
      console.error("Error en refreshAuth:", error);
      if (error instanceof Error && error.message.includes("network")) {
        return null;
      }
      localStorage.removeItem('userData');
      window.location.href = "/login";
      return null;
    }
  }
}

export const refreshAuth = async (): Promise<{ newIdToken: string } | null> => {
  const refreshManager = TokenRefreshManager.getInstance();
  return refreshManager.refreshToken();
};
