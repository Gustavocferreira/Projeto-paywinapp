import Link from 'next/link';

export default function HomePage() {
  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <section className="text-center mb-16" aria-labelledby="hero-heading">
          <h1 
            id="hero-heading"
            className="text-5xl font-bold text-gray-900 mb-6"
          >
            Bem-vindo ao <span className="text-blue-600">PayWinApp</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Organize suas finanças de forma simples e inteligente com a ajuda de um Agente Financeiro conversacional
          </p>
          
          <div className="flex gap-4 justify-center" role="group" aria-label="Ações principais">
            <Link
              href="/auth/register"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-colors"
              aria-label="Criar nova conta"
            >
              Começar Agora
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 focus:ring-4 focus:ring-blue-300 transition-colors"
              aria-label="Fazer login na sua conta"
            >
              Fazer Login
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section aria-labelledby="features-heading">
          <h2 id="features-heading" className="text-3xl font-bold text-center mb-12 text-gray-900">
            Principais Recursos
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <article className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4" aria-hidden="true">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Chat Inteligente</h3>
              <p className="text-gray-600">
                Registre gastos conversando naturalmente com nosso Agente Financeiro
              </p>
            </article>

            {/* Feature 2 */}
            <article className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4" aria-hidden="true">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Metas Financeiras</h3>
              <p className="text-gray-600">
                Crie e acompanhe suas metas de economia com facilidade
              </p>
            </article>

            {/* Feature 3 */}
            <article className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4" aria-hidden="true">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Privacidade LGPD</h3>
              <p className="text-gray-600">
                Seus dados protegidos e totalmente em conformidade com a LGPD
              </p>
            </article>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-24 text-center text-gray-600" role="contentinfo">
          <p>© 2026 PayWinApp. Todos os direitos reservados.</p>
          <nav className="mt-4" aria-label="Links de rodapé">
            <Link href="/privacy" className="mx-2 hover:text-blue-600">Política de Privacidade</Link>
            <Link href="/terms" className="mx-2 hover:text-blue-600">Termos de Uso</Link>
            <Link href="/accessibility" className="mx-2 hover:text-blue-600">Acessibilidade</Link>
          </nav>
        </footer>
      </div>
    </main>
  );
}
