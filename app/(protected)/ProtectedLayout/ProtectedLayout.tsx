'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Esse componente é responsável por proteger as rotas internas.
 * Ele verifica se o usuário está logado no localStorage.
 * Caso não esteja, redireciona automaticamente para /login.
 */
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const logged = localStorage.getItem('logged');

    // se não estiver logado, redireciona para /login
    if (!logged) {
      router.replace('/login');
    } else {
      setIsChecking(false);
    }
  }, [router]);

  // Enquanto verifica o login, mostra uma tela de carregamento
  if (isChecking) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <img src="/logo-build-hub.png" className="w-100 h-40 animate-pulse" />
      </div>
    );
  }

  // Se estiver logado, renderiza o conteúdo protegido
  return <>{children}</>;
}
