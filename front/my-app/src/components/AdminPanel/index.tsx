// components/AdminDashboard.tsx
"use client";

import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import firebase from "@/lib/firebase";
import Link from "next/link";
import { refreshAuth } from "@/lib/auth";
import axiosInstance from "@/lib/axios";
import getUserInfo from "@/helpers/userInfo";
import LoadingSpinner from "@/components/LoadingSpinner";

interface UserData {
  firstName?: string;
  lastName?: string;
  dni?: string;
  address?: string;
}

interface User {
  uid: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  dni?: string;
  healthcenter?: {
    name: string;
  };
  claims: {
    admin?: boolean;
    approved?: boolean;
  };
}

interface ModalData {
  show: boolean;
  action: "assignAdmin" | "approveUser" | "deleteUser" | null;
  uid: string | null;
  title: string;
  message: string;
}

interface ConfirmationModalProps {
  show: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmationModal({
  show,
  title,
  message,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4 text-blue-900">{title}</h2>
        <p className="mb-6 text-gray-700">{message}</p>
        <div className="flex justify-end">
          <button
            onClick={onCancel}
            className="bg-gray-300 text-gray-700 px-4 py-2 mr-2 rounded hover:bg-gray-400 transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const [user, setUser] = useState<UserData | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalData, setModalData] = useState<ModalData>({
    show: false,
    action: null,
    uid: null,
    title: "",
    message: "",
  });

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const fetchUserData = async () => {
      try {
        if (typeof window !== 'undefined') {
          const cachedData = localStorage.getItem('userData');
          if (cachedData && mounted) {
            setUser(JSON.parse(cachedData));
          }
        }
        const authResult = await refreshAuth();
        if (!mounted || !authResult) return;

        const userData = await getUserInfo();
        if (!mounted) return;

        setUser(userData);
        if (typeof window !== 'undefined') {
          localStorage.setItem('userData', JSON.stringify(userData));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        if (mounted) {
          window.location.href = "/login";
        }
      }
    };

    const fetchUsersData = async () => {
      try {
        const response = await axiosInstance.get("/api/users", {
          withCredentials: true,
        });
        if (mounted) {
          setUsers(response.data.users);
        }
      } catch (err: any) {
        if (err.response?.status === 401) {
          await refreshAuth();
          return fetchUsersData();
        }
        if (mounted) {
          setError(err.response?.data?.error || "Failed to fetch users");
        }
      }
    };

    const initializeData = async () => {
      try {
        await Promise.all([fetchUserData(), fetchUsersData()]);
        if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing data:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeData();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  const handleAssignAdmin = (uid: string) => {
    setModalData({
      show: true,
      action: "assignAdmin",
      uid,
      title: "Confirmar Asignación de Admin",
      message: "¿Está seguro de que desea asignar rol de admin a este usuario?",
    });
  };

  const handleApproveUser = (uid: string) => {
    setModalData({
      show: true,
      action: "approveUser",
      uid,
      title: "Confirmar Aprobación de Usuario",
      message: "¿Está seguro de que desea aprobar a este usuario?",
    });
  };

  const handleDeleteUser = (uid: string) => {
    setModalData({
      show: true,
      action: "deleteUser",
      uid,
      title: "Confirmar Eliminación de Usuario",
      message: "¿Está seguro de que desea eliminar a este usuario?",
    });
  };

  const confirmModalAction = async () => {
    if (!modalData.uid || !modalData.action) return;
    
    try {
      switch (modalData.action) {
        case "assignAdmin":
          await assignAdminRole(modalData.uid);
          break;
        case "approveUser":
          await approveUser(modalData.uid);
          break;
        case "deleteUser":
          await deleteUser(modalData.uid);
          break;
        default:
          break;
      }
      await fetchUsers();
    } catch (error) {
      console.error('Error in modal action:', error);
    } finally {
      setModalData({ ...modalData, show: false });
    }
  };

  const assignAdminRole = async (uid: string) => {
    await axiosInstance.post("/api/assign-admin", { uid });
  };

  const approveUser = async (uid: string) => {
    await axiosInstance.post("/api/users/approve", { uid });
  };

  const deleteUser = async (uid: string) => {
    await axiosInstance.delete(`/api/users/${uid}`, { data: { uid } });
  };

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get("/api/users");
      setUsers(response.data.users);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch users");
    }
  };

  const currentUser = getAuth(firebase).currentUser?.uid;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <LoadingSpinner fullScreen message="Cargando información..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h1 className="text-2xl font-semibold text-gray-800">
                Panel de Administración
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Bienvenido, {user?.firstName} {user?.lastName}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Usuarios Totales</p>
                  <p className="text-2xl font-semibold text-blue-800 mt-1">{users.length}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-xl border border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Usuarios Aprobados</p>
                  <p className="text-2xl font-semibold text-green-800 mt-1">
                    {users.filter(u => u.claims.approved).length}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 font-medium">Pendientes de Aprobación</p>
                  <p className="text-2xl font-semibold text-yellow-800 mt-1">
                    {users.filter(u => !u.claims.approved).length}
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Gestión de Usuarios</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DNI</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr key={u.uid} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {u.firstName} {u.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{u.healthcenter?.name || "Administrador"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{u.dni}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{u.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${u.claims.approved ? "bg-green-100 text-green-800" :
                            "bg-yellow-100 text-yellow-800"}`}>
                          {u.claims.approved ? "Aprobado" : "Pendiente"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {!u.claims.admin && (
                          <button
                            onClick={() => handleAssignAdmin(u.uid)}
                            className="text-cyan-600 hover:text-cyan-900"
                          >
                            Make Admin
                          </button>
                        )}
                        {!u.claims.approved && (
                          <button
                            onClick={() => handleApproveUser(u.uid)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Aprobar
                          </button>
                        )}
                        {u.uid !== currentUser && (
                          <button
                            onClick={() => handleDeleteUser(u.uid)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              className="bg-cyan-500 text-white mt-5 px-3 py-2 rounded-md hover:bg-cyan-600 transition-colors duration-200"
            >
              <Link href="/signup">
                Registrar Usuario
              </Link>
            </button>
          </div>
        </div>
      </div>
      <ConfirmationModal
        show={modalData.show}
        title={modalData.title}
        message={modalData.message}
        onConfirm={confirmModalAction}
        onCancel={() => setModalData({ ...modalData, show: false })}
      />
    </div>
  );
}
