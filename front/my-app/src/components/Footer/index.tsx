import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-screen-xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Sobre nosotros
            </h4>
            <p className="text-gray-500 text-sm">
              Imago Argentina es una empresa que se dedica a brindar solucions tecnológicas en el área de mamografía.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Accesos rápidos
            </h4>
            <nav className="flex flex-col space-y-2">
              <Link href="/" className="text-gray-500 hover:text-cyan-700 text-sm transition-colors hover:underline">
                Inicio
              </Link>
              <Link href="/products" className="text-gray-500 hover:text-cyan-700 text-sm transition-colors hover:underline">
                Términos y condiciones
              </Link>
              <Link href="/support" className="text-gray-500 hover:text-cyan-700 text-sm transition-colors hover:underline">
                Protección de datos
              </Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Contacto
            </h4>
            <div className="text-gray-500 text-sm space-y-2">
              <p>Dirección: Maipu 942 Piso 21, Ciudad autónoma de Buenos Aires, Argentina</p>
              <p>Teléfono: +54 11 4311-9510</p>
              <p aria-label='Email'>
                <a href='mailto:info@imagoargentina.com' className="text-cyan-700 hover:text-cyan-500 transition-colors">
                  info@imagoargentina.com
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Imago Argentina. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};