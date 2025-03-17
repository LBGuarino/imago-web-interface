// components/AdminDashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import firebase from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { refreshAuthToken } from '@/lib/auth';

interface UserData {
  uid: string;
  email?: string;
  claims: {
    admin?: boolean;
    approved?: boolean;
  };
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

interface ModalData {
  show: boolean;
  action: 'assignAdmin' | 'approveUser' | 'deleteUser' | null;
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

function ConfirmationModal({ show, title, message, onConfirm, onCancel }: ConfirmationModalProps) {
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

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalData, setModalData] = useState<ModalData>({
    show: false,
    action: null,
    uid: null,
    title: '',
    message: '',
  });
  const router = useRouter();

  useEffect(() => {
    checkAdminStatus();
    fetchUsers();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/verify_admin`, {
        credentials: 'include',
        method: 'GET',
      });
      return response;
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/users`, {
        method: 'GET',
        credentials: 'include'
      });

      if (response.status === 401) {
        await refreshAuthToken();
        return fetchUsers();
      }

      const data = await response.json();
      setUsers(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Funciones para abrir la ventana modal con la confirmación de acción
  const handleAssignAdmin = (uid: string) => {
    setModalData({
      show: true,
      action: 'assignAdmin',
      uid,
      title: 'Confirmar Asignación de Admin',
      message: '¿Está seguro de que desea asignar rol de admin a este usuario?',
    });
  };

  const handleApproveUser = (uid: string) => {
    setModalData({
      show: true,
      action: 'approveUser',
      uid,
      title: 'Confirmar Aprobación de Usuario',
      message: '¿Está seguro de que desea aprobar a este usuario?',
    });
  };

  const handleDeleteUser = (uid: string) => {
    setModalData({
      show: true,
      action: 'deleteUser',
      uid,
      title: 'Confirmar Eliminación de Usuario',
      message: '¿Está seguro de que desea eliminar a este usuario?',
    });
  };

  // Al confirmar se ejecuta la acción correspondiente
  const confirmModalAction = async () => {
    if (!modalData.uid || !modalData.action) return;
    switch (modalData.action) {
      case 'assignAdmin':
        await assignAdminRole(modalData.uid);
        break;
      case 'approveUser':
        await approveUser(modalData.uid);
        break;
      case 'deleteUser':
        await deleteUser(modalData.uid);
        break;
      default:
        break;
    }
    setModalData({ ...modalData, show: false });
  };

  // Funciones para llamar a los endpoints del backend
  const assignAdminRole = async (uid: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/assignAdmin`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid }),
      });

      if (response.status === 401) {
        await refreshAuthToken();
        return assignAdminRole(uid);
      }

      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error asignando rol admin');
    }
  };

  const approveUser = async (uid: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/approveUser`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid }),
      });

      if (response.status === 401) {
        await refreshAuthToken();
        return approveUser(uid);
      }

      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error aprobando usuario');
    }
  };

  const deleteUser = async (uid: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/deleteUser`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid }),
      });

      if (response.status === 401) {
        await refreshAuthToken();
        return deleteUser(uid);
      }

      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error eliminando usuario');
    }
  };

  const currentUser = getAuth(firebase).currentUser?.uid;
  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-screen-xl mx-auto p-4">
      <h1 className="text-2xl md:text-3xl font-light mb-6 text-blue-900 text-center">Dashboard de Administrador</h1>
      {error && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-center">
          {error}
        </div>
      )}
      
      <div className="overflow-x-auto shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-blue-900">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-blue-900">UID</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-blue-900">Admin</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-blue-900">Approved</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-blue-900">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.uid} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{user.email || 'N/A'}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{user.uid}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-700">{user.claims.admin ? 'Yes' : 'No'}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-700">{user.claims.approved ? 'Yes' : 'No'}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-center space-x-2">
                  {!user.claims.admin && (
                    <button
                      onClick={() => handleAssignAdmin(user.uid)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors duration-200"
                    >
                      Make Admin
                    </button>
                  )}
                  {!user.claims.approved && (
                    <button
                      onClick={() => handleApproveUser(user.uid)}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors duration-200"
                    >
                      Approve User
                    </button>
                  )}
                  {user.uid !== currentUser && (
                    <button
                      onClick={() => handleDeleteUser(user.uid)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors duration-200"
                    >
                      Delete User
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
