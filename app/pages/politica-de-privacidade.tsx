

import React from 'react';

const PoliticaPrivacidade = () => {
  const lastUpdate = "02 de Abril de 2026"; // Altere conforme necessário

  return (
    <main className="bg-white min-h-screen py-12 px-6 sm:px-12 lg:px-24">
      <div className="max-w-4xl mx-auto">
        <header className="border-b border-gray-200 pb-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Política de Privacidade</h1>
          <p className="text-gray-500 text-sm">Última atualização: {lastUpdate}</p>
        </header>

        <article className="space-y-8 text-gray-700 leading-relaxed">
          
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Introdução</h2>
            <p>
              Bem-vindo ao nosso ecossistema de saúde e bem-estar. Valorizamos a sua privacidade e estamos comprometidos em proteger os seus dados pessoais. Esta política descreve como tratamos as suas informações ao interagir com a nossa plataforma de Psicologia, Formação, Cursos, Meditações e Retiros.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Dados que Coletamos</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Informações de Conta:</strong> Nome, e-mail e dados de login.</li>
              <li><strong>Transações:</strong> Detalhes de compras de cursos, retiros ou produtos físicos (processados de forma segura por gateways de pagamento externos).</li>
              <li><strong>Conteúdo:</strong> Interações com meditações, reviews e progresso em cursos.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Uso de Serviços de Terceiros</h2>
            <p>
              Para oferecer a melhor experiência, utilizamos parceiros tecnológicos:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><strong>Sanity.io:</strong> Gerenciamento de conteúdo (CMS).</li>
              <li><strong>Hospedagem Externa:</strong> As nossas imagens e áudios são servidos por provedores externos para garantir rapidez e estabilidade.</li>
            </ul>
          </section>

          <section className="bg-gray-50 p-6 rounded-lg border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Cookies e Tecnologias de Rastreio</h2>
            <p className="text-sm">
              Utilizamos cookies para entender como você usa o site, manter sua sessão ativa e personalizar recomendações de meditação e cursos. Você pode gerir as suas preferências nas configurações do seu navegador.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Seus Direitos</h2>
            <p>
              De acordo com o RGPD (ou lei local equivalente), você tem o direito de aceder, retificar ou solicitar a eliminação dos seus dados pessoais a qualquer momento.
            </p>
          </section>

          <section className="pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Contacto</h2>
            <p>
              Dúvidas sobre esta política? Entre em contacto connosco através do e-mail: 
              <span className="text-indigo-600 font-medium ml-1 text-bold">eventos.spmbeatgmail.com</span>
            </p>
          </section>

        </article>
      </div>
    </main>
  );
};

export default PoliticaPrivacidade;