"use client";

import { contactFormSchema, ContactFormInputs } from "@/validations/validationSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { AxiosError } from "axios";
import contactInfo from "@/helpers/contactInfo";

export default function ContactForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormInputs>({
    resolver: zodResolver(contactFormSchema),
  });

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess("");
        window.location.href = "/login";
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const onSubmit = async (data: ContactFormInputs) => {
    try {
      await contactInfo(data);
      setSuccess("Se ha enviado tu solicitud de acceso");
    } catch (err) {
      if (err instanceof AxiosError) {
        const errMessage =
          err.response?.data?.message ||
          err.message ||
          "Ha ocurrido un error";
        setError(errMessage);
      } else {
        setError("Ha ocurrido un error");
      }
    }
  };

  return (
    <>
      {error && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative bg-red-50 border-l-4 border-red-600 text-red-700 px-6 py-4 rounded-2xl max-w-md w-full mx-4 shadow-2xl">
            <button
              onClick={() => setError("")}
              className="absolute top-2 right-2 text-red-600 hover:text-red-800 transition"
            >
              &times;
            </button>
            <div className="flex items-center mb-2">
              <h2 className="font-bold text-red-700">Error</h2>
            </div>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative bg-green-50 border-l-4 border-green-600 text-green-700 px-6 py-4 rounded-2xl max-w-md w-full mx-4 shadow-2xl">
            <button
              onClick={() => setSuccess("")}
              className="absolute top-2 right-2 text-green-600 hover:text-green-800 transition"
            >
              &times;
            </button>
            <div className="flex items-center mb-2">
              <h2 className="font-bold text-green-700">¡Éxito!</h2>
            </div>
            <p className="text-sm">{success}</p>
          </div>
        </div>
      )}

      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-gray-200">
        <h2 className="text-2xl font-light text-blue-500 text-center mb-6">
          Solicitar Acceso
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label
              htmlFor="nombre"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nombre
            </label>
            <input
              {...register("nombre")}
              id="nombre"
              type="text"
              placeholder="Tu nombre"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.nombre && (
              <p className="mt-1 text-xs text-red-500">
                {errors.nombre.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="apellido"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Apellido
            </label>
            <input
              {...register("apellido")}
              id="apellido"
              type="text"
              placeholder="Tu apellido"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.apellido && (
              <p className="mt-1 text-xs text-red-500">
                {errors.apellido.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="telefono"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Teléfono de contacto
            </label>
            <input
              {...register("telefono")}
              id="telefono"
              type="tel"
              placeholder="Ej. +5491123456789"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.telefono && (
              <p className="mt-1 text-xs text-red-500">
                {errors.telefono.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email de contacto
            </label>
            <input
              {...register("email")}
              id="email"
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="centroDeSalud"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Centro de Salud
            </label>
            <input
              {...register("centroDeSalud")}
              id="centroDeSalud"
              type="text"
              placeholder="Nombre del centro de salud"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.centroDeSalud && (
              <p className="mt-1 text-xs text-red-500">
                {errors.centroDeSalud.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            Solicitar Acceso
          </button>
        </form>
      </div>
    </>
  );
}
