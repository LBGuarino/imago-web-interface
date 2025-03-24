export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-2xl border border-blue-100">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-50">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 tracking-tight">
            Acceso Restringido
          </h2>
          <p className="mt-4 text-base text-gray-600 leading-relaxed">
            Por razones de seguridad y confidencialidad médica, esta sección requiere credenciales de acceso específicas.
          </p>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-sm text-blue-700">
              Si cree que esto es un error, por favor contacte al administrador del sistema o al departamento de soporte técnico.
            </p>
          </div>
        </div>
        <div className="mt-8 space-y-4">
          <a
            href="/"
            className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Volver al Panel Principal
          </a>
          <a
            href="/contact"
            className="w-full inline-flex justify-center items-center px-6 py-3 border border-blue-200 text-base font-medium rounded-lg text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Contactar Soporte
          </a>
        </div>
      </div>
    </div>
  );
}